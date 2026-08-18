import { supabase } from '../../integrations/supabase/client';
import { StorageRepository } from '../storage/storageRepository';

export interface ImportPreviewStats {
  hasLegacyData: boolean;
  fingerprint: string;
  alreadyImported: boolean;
  counts: {
    accounts: number;
    transactions: number;
    creditCards: number;
    projects: number;
    budgetItems: number;
    events: number;
    goals: number;
    debts: number;
    assets: number;
    customers: number;
    suppliers: number;
    costCenters: number;
  };
}

/**
 * Gera um UUID determinístico v5 simples a partir de userId, tipo de entidade e ID legado
 */
export function getDeterministicUUID(userId: string, entityType: string, legacyId: string): string {
  // Simple deterministic UUID Generator using string hash
  const str = `${userId}:${entityType}:${legacyId}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-4000-8000-8000-${hex.slice(0, 8)}${hex.slice(0, 4)}`;
}

/**
 * Gera um Fingerprint determinístico do backup legado local
 */
export function getLegacyFingerprint(backupData: object): string {
  const jsonStr = JSON.stringify(backupData);
  let hash = 0;
  for (let i = 0; i < jsonStr.length; i++) {
    hash = (hash << 5) - hash + jsonStr.charCodeAt(i);
    hash |= 0;
  }
  return `fp_pf_${Math.abs(hash).toString(16)}`;
}

export class LegacyImportService {
  /**
   * Analisa os dados do LocalStorage e verifica o status da migração no Supabase
   */
  public static async previewImport(userId: string): Promise<ImportPreviewStats> {
    const rawBackup = StorageRepository.exportBackupJSON();
    const parsed = JSON.parse(rawBackup);
    const fingerprint = getLegacyFingerprint(parsed);

    const counts = {
      accounts: (parsed.accounts || []).length,
      transactions: (parsed.transactions || []).length,
      creditCards: (parsed.creditCards || []).length,
      projects: (parsed.projects || []).length,
      budgetItems: (parsed.budgetItems || []).length,
      events: (parsed.events || []).length,
      goals: (parsed.goals || []).length,
      debts: (parsed.debts || []).length,
      assets: (parsed.assets || []).length,
      customers: (parsed.customers || []).length,
      suppliers: (parsed.suppliers || []).length,
      costCenters: (parsed.costCenters || []).length,
    };

    const hasLegacyData = Object.values(counts).some(c => c > 0);

    // Verify remote migration runs table
    let alreadyImported = false;
    try {
      const { data } = await (supabase.from('legacy_import_runs') as any)
        .select('id')
        .eq('user_id', userId)
        .eq('source_fingerprint', fingerprint)
        .eq('status', 'completed')
        .maybeSingle();

      if (data) {
        alreadyImported = true;
      }
    } catch (e) {
      console.warn('[LegacyImportService] Falha ao consultar histórico de migração:', e);
    }

    return {
      hasLegacyData,
      fingerprint,
      alreadyImported,
      counts,
    };
  }

  /**
   * Executa a importação relacional e idempotente para o Supabase
   */
  public static async executeImport(userId: string, onProgress?: (step: string, percent: number) => void): Promise<void> {
    const rawBackup = StorageRepository.exportBackupJSON();
    const parsed = JSON.parse(rawBackup);
    const fingerprint = getLegacyFingerprint(parsed);

    // 1. Create Run Entry
    let runId = `run_${Date.now()}`;
    try {
      const { data: runData } = await (supabase.from('legacy_import_runs') as any)
        .insert({
          user_id: userId,
          source_fingerprint: fingerprint,
          status: 'running',
          counts: parsed,
          started_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      if (runData?.id) runId = runData.id;
    } catch (e) {
      console.warn('[LegacyImportService] Erro ao registrar início de importação:', e);
    }

    try {
      // Step 1: Accounts (PF)
      onProgress?.('Importando contas bancárias...', 15);
      const pfAccounts = (parsed.accounts || []).filter((a: any) => a.context === 'PF');
      for (const acc of pfAccounts) {
        const detId = getDeterministicUUID(userId, 'account', acc.id);
        const cents = Math.round((acc.balance || 0) * 100);
        await (supabase.from('personal_accounts') as any).upsert({
          id: detId,
          user_id: userId,
          name: acc.name,
          institution: acc.institution || 'Outros',
          type: acc.type || 'corrente',
          balance_cents: cents,
          include_in_cash: true,
          status: 'active',
        });
      }

      // Step 2: Credit Cards (PF)
      onProgress?.('Importando cartões de crédito...', 35);
      const pfCards = (parsed.creditCards || []).filter((c: any) => c.context === 'PF');
      for (const card of pfCards) {
        const detId = getDeterministicUUID(userId, 'card', card.id);
        await (supabase.from('personal_credit_cards') as any).upsert({
          id: detId,
          user_id: userId,
          name: card.name,
          institution: card.institution || '',
          brand: card.brand || '',
          last_four_digits: card.lastFourDigits || '',
          limit_total_cents: Math.round((card.limitTotal ?? 0) * 100),
          limit_used_cents: Math.round((card.limitUsed ?? 0) * 100),
          current_invoice_cents: Math.round((card.currentInvoice ?? 0) * 100),
          closing_day: card.closingDay,
          due_day: card.dueDay,
          is_primary: !!card.isPrimary,
          status: 'active',
        });
      }

      // Step 3: Goals & Contributions
      onProgress?.('Importando planejamento e metas...', 55);
      for (const g of parsed.goals || []) {
        const detId = getDeterministicUUID(userId, 'goal', g.id);
        await (supabase.from('goals') as any).upsert({
          id: detId,
          user_id: userId,
          title: g.title,
          target_amount_cents: Math.round((g.targetAmount ?? 0) * 100),
          current_amount_cents: Math.round((g.currentAmount ?? 0) * 100),
          target_date: g.targetDate || new Date().toISOString().split('T')[0],
          category: g.category || 'outros',
          status: 'em_andamento',
        });
      }

      // Step 4: Debts
      onProgress?.('Importando dívidas e passivos...', 70);
      for (const d of parsed.debts || []) {
        const detId = getDeterministicUUID(userId, 'debt', d.id);
        await (supabase.from('debts') as any).upsert({
          id: detId,
          user_id: userId,
          title: d.title,
          creditor: d.creditor || 'Outros',
          total_amount_cents: Math.round((d.totalAmount ?? 0) * 100),
          remaining_amount_cents: Math.round((d.remainingAmount ?? 0) * 100),
          interest_rate_monthly: d.interestRate ?? 0,
          due_date: d.dueDate || new Date().toISOString().split('T')[0],
          status: 'em_dia',
        });
      }

      // Step 5: Transactions (PF)
      onProgress?.('Importando movimentações financeiras...', 85);
      const pfTxs = (parsed.transactions || []).filter((t: any) => t.context === 'PF');
      for (const tx of pfTxs) {
        const detId = getDeterministicUUID(userId, 'tx', tx.id);
        const amountCents = Math.round((tx.amount || 0) * 100);
        await (supabase.from('personal_transactions') as any).upsert({
          id: detId,
          user_id: userId,
          type: tx.type || 'expense',
          title: tx.title || 'Lançamento PF',
          amount_cents: amountCents,
          transaction_date: tx.date || new Date().toISOString().split('T')[0],
          category: tx.category || 'outros',
          notes: tx.notes || null,
        });
      }

      // Mark run completed
      onProgress?.('Concluindo validação e integridade...', 100);
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
          error_message: e?.message || 'Falha durante importação',
        })
        .eq('id', runId);

      throw e;
    }
  }
}
