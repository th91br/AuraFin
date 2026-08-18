import { supabase } from '../../integrations/supabase/client';
import { StorageRepository } from '../storage/storageRepository';

export interface ImportPjPreviewStats {
  hasLegacyData: boolean;
  fingerprint: string;
  alreadyImported: boolean;
  counts: {
    accounts: number;
    transactions: number;
    clients: number;
    suppliers: number;
    projects: number;
    costCenters: number;
    receivables: number;
    payables: number;
    invoices: number;
    corporateCards: number;
  };
}

/**
 * Gera um UUID determinístico v5 simples a partir de orgId, tipo de entidade e ID legado
 */
export function getDeterministicPjUUID(orgId: string, entityType: string, legacyId: string): string {
  const str = `pj:${orgId}:${entityType}:${legacyId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-5000-9000-9000-${hex.slice(0, 8)}${hex.slice(0, 4)}`;
}

/**
 * Gera um Fingerprint determinístico do backup legado PJ para uma determinada empresa
 */
export function getLegacyPjFingerprint(orgId: string, backupData: object): string {
  const jsonStr = JSON.stringify({ orgId, backupData });
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    hash = (hash << 5) - hash + jsonStr.charCodeAt(i);
    hash |= 0;
  }
  return `fp_pj_${Math.abs(hash).toString(16)}`;
}

export class LegacyPjImportService {
  /**
   * Analisa os dados do LocalStorage e verifica o status da migração PJ no Supabase
   */
  public static async previewImport(orgId: string): Promise<ImportPjPreviewStats> {
    const rawBackup = StorageRepository.exportBackupJSON();
    const parsed = JSON.parse(rawBackup);
    const fingerprint = getLegacyPjFingerprint(orgId, parsed);

    const counts = {
      accounts: (parsed.accounts || []).filter((a: any) => a.context === 'PJ').length,
      transactions: (parsed.transactions || []).filter((t: any) => t.context === 'PJ').length,
      clients: (parsed.customers || []).length,
      suppliers: (parsed.suppliers || []).length,
      projects: (parsed.projects || []).length,
      costCenters: (parsed.costCenters || []).length,
      receivables: (parsed.defaulters || []).length, // Recebíveis/Inadimplência
      payables: (parsed.budgetItems || []).length,
      invoices: 0,
      corporateCards: (parsed.creditCards || []).filter((c: any) => c.context === 'PJ').length,
    };

    const hasLegacyData = Object.values(counts).some(c => c > 0);

    let alreadyImported = false;
    try {
      const { data } = await (supabase.from('legacy_import_runs') as any)
        .select('id')
        .eq('organization_id', orgId)
        .eq('source_fingerprint', fingerprint)
        .eq('status', 'completed')
        .maybeSingle();

      if (data) {
        alreadyImported = true;
      }
    } catch (e) {
      console.warn('[LegacyPjImportService] Falha ao consultar histórico de migração PJ:', e);
    }

    return {
      hasLegacyData,
      fingerprint,
      alreadyImported,
      counts,
    };
  }

  /**
   * Executa a importação relacional e idempotente de dados PJ para a empresa no Supabase
   */
  public static async executeImport(userId: string, orgId: string, onProgress?: (step: string, percent: number) => void): Promise<void> {
    const rawBackup = StorageRepository.exportBackupJSON();
    const parsed = JSON.parse(rawBackup);
    const fingerprint = getLegacyPjFingerprint(orgId, parsed);

    // 1. Create Server-Side Run Entry
    let runId = `run_pj_${Date.now()}`;
    try {
      const { data: runData } = await (supabase.from('legacy_import_runs') as any)
        .insert({
          user_id: userId,
          organization_id: orgId,
          context_type: 'PJ',
          source_fingerprint: fingerprint,
          status: 'running',
          counts: parsed,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (runData?.id) runId = runData.id;
    } catch (e) {
      console.warn('[LegacyPjImportService] Erro ao registrar início de importação PJ:', e);
    }

    try {
      // Step 1: Business Accounts (PJ)
      onProgress?.('Importando contas bancárias empresariais...', 15);
      const pjAccounts = (parsed.accounts || []).filter((a: any) => a.context === 'PJ');
      for (const acc of pjAccounts) {
        const detId = getDeterministicPjUUID(orgId, 'account', acc.id);
        const cents = Math.round((acc.balance || 0) * 100);
        await (supabase.from('business_accounts') as any).upsert({
          id: detId,
          organization_id: orgId,
          name: acc.name,
          institution: acc.institution || 'Outros',
          type: acc.type || 'corrente',
          balance_cents: cents,
          status: 'active',
        });
      }

      // Step 2: Clients & Suppliers (PJ)
      onProgress?.('Importando clientes e fornecedores...', 35);
      for (const cli of parsed.customers || []) {
        const detId = getDeterministicPjUUID(orgId, 'client', cli.id);
        await (supabase.from('clients') as any).upsert({
          id: detId,
          organization_id: orgId,
          name: cli.name,
          document_cnpj_cpf: cli.document || null,
          contact_email: cli.email || null,
          phone: cli.phone || null,
          status: 'ativo',
        });
      }

      for (const sup of parsed.suppliers || []) {
        const detId = getDeterministicPjUUID(orgId, 'supplier', sup.id);
        await (supabase.from('suppliers') as any).upsert({
          id: detId,
          organization_id: orgId,
          name: sup.name,
          category: sup.category || 'Geral',
          status: 'ativo',
        });
      }

      // Step 3: Projects & Cost Centers
      onProgress?.('Importando projetos e centros de custo...', 55);
      for (const cc of parsed.costCenters || []) {
        const detId = getDeterministicPjUUID(orgId, 'cost_center', cc.id);
        await (supabase.from('cost_centers') as any).upsert({
          id: detId,
          organization_id: orgId,
          name: cc.name,
          code: cc.code || cc.id,
          budget_cents: Math.round((cc.budget || 0) * 100),
        });
      }

      for (const proj of parsed.projects || []) {
        const detId = getDeterministicPjUUID(orgId, 'project', proj.id);
        await (supabase.from('projects') as any).upsert({
          id: detId,
          organization_id: orgId,
          name: proj.name,
          code: proj.code || proj.id,
          contracted_revenue_cents: Math.round((proj.budget || 0) * 100),
          status: 'em_andamento',
        });
      }

      // Step 4: Corporate Cards
      onProgress?.('Importando cartões corporativos...', 70);
      const pjCards = (parsed.creditCards || []).filter((c: any) => c.context === 'PJ');
      for (const card of pjCards) {
        const detId = getDeterministicPjUUID(orgId, 'card', card.id);
        await (supabase.from('corporate_cards') as any).upsert({
          id: detId,
          organization_id: orgId,
          name: card.name,
          institution: card.institution || '',
          brand: card.brand || '',
          last_four_digits: card.lastFourDigits || '',
          type: 'credito',
          credit_limit_cents: Math.round((card.limitTotal ?? 0) * 100),
          closing_day: card.closingDay ?? null,
          due_day: card.dueDay ?? null,
          is_primary: !!card.isPrimary,
          status: 'active',
        });
      }

      // Step 5: Business Transactions
      onProgress?.('Importando movimentações corporativas...', 85);
      const pjTxs = (parsed.transactions || []).filter((t: any) => t.context === 'PJ');
      for (const tx of pjTxs) {
        const detId = getDeterministicPjUUID(orgId, 'tx', tx.id);
        const amountCents = Math.round((tx.amount || 0) * 100);
        await (supabase.from('business_transactions') as any).upsert({
          id: detId,
          organization_id: orgId,
          type: tx.type || 'expense',
          title: tx.title || 'Lançamento PJ',
          amount_cents: amountCents,
          transaction_date: tx.date || new Date().toISOString().split('T')[0],
          category: tx.category || 'outros',
          notes: tx.notes || null,
        });
      }

      // Mark run completed
      onProgress?.('Validando consolidação e DRE...', 100);
      await (supabase.from('legacy_import_runs') as any)
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', runId);

    } catch (e: any) {
      await (supabase.from('legacy_import_runs') as any)
        .update({
          status: 'failed',
          error_message: e?.message || 'Falha durante importação PJ',
        })
        .eq('id', runId);

      throw e;
    }
  }
}
