import { supabase } from '../integrations/supabase/client';
import { normalizeSupabaseError } from './repositories/errors';

export interface ReimbursementParams {
  organizationId: string;
  reconciliationId: string;
  amountCents: number;
  pjAccountId: string;
  pfAccountId: string;
  notes?: string;
}

export interface ProLaboreParams {
  organizationId: string;
  partnerId: string;
  amountCents: number;
  pjAccountId: string;
  pfAccountId: string;
  transactionDate?: string;
  notes?: string;
}

export interface ProfitDistributionParams {
  organizationId: string;
  partnerId: string;
  amountCents: number;
  pjAccountId: string;
  pfAccountId: string;
  transactionDate?: string;
  notes?: string;
}

export class CrossContextService {
  private static inProgressKeys = new Set<string>();

  /**
   * Liquida um reembolso entre PJ e PF de forma atômica no PostgreSQL
   */
  public static async processReimbursement(params: ReimbursementParams): Promise<string> {
    const lockKey = `reimb:${params.reconciliationId}:${params.amountCents}`;
    if (this.inProgressKeys.has(lockKey)) {
      throw new Error('Esta operação de reembolso já está em andamento. Aguarde a confirmação.');
    }

    this.inProgressKeys.add(lockKey);
    try {
      const { data, error } = await (supabase.rpc as any)('process_cross_context_reimbursement', {
        p_org_id: params.organizationId,
        p_reconciliation_id: params.reconciliationId,
        p_amount_cents: params.amountCents,
        p_pj_account_id: params.pjAccountId,
        p_pf_account_id: params.pfAccountId,
        p_notes: params.notes || null,
      });

      if (error) {
        throw normalizeSupabaseError(error, 'CrossContextService.processReimbursement');
      }

      return data as string;
    } finally {
      this.inProgressKeys.delete(lockKey);
    }
  }

  /**
   * Processa a transferência de pró-labore societário entre PJ e PF de forma atômica no PostgreSQL
   */
  public static async processProLabore(params: ProLaboreParams): Promise<string> {
    const lockKey = `prolab:${params.organizationId}:${params.partnerId}:${params.amountCents}`;
    if (this.inProgressKeys.has(lockKey)) {
      throw new Error('Esta transferência de pró-labore já está em processamento.');
    }

    this.inProgressKeys.add(lockKey);
    try {
      const { data, error } = await (supabase.rpc as any)('process_pro_labore_payout', {
        p_org_id: params.organizationId,
        p_partner_id: params.partnerId,
        p_amount_cents: params.amountCents,
        p_pj_account_id: params.pjAccountId,
        p_pf_account_id: params.pfAccountId,
        p_transaction_date: params.transactionDate || new Date().toISOString().split('T')[0],
        p_notes: params.notes || null,
      });

      if (error) {
        throw normalizeSupabaseError(error, 'CrossContextService.processProLabore');
      }

      return data as string;
    } finally {
      this.inProgressKeys.delete(lockKey);
    }
  }

  /**
   * Processa a distribuição de lucros societária entre PJ e PF de forma atômica no PostgreSQL
   */
  public static async processProfitDistribution(params: ProfitDistributionParams): Promise<string> {
    const lockKey = `profitdist:${params.organizationId}:${params.partnerId}:${params.amountCents}`;
    if (this.inProgressKeys.has(lockKey)) {
      throw new Error('Esta distribuição de lucros já está em processamento.');
    }

    this.inProgressKeys.add(lockKey);
    try {
      const { data, error } = await (supabase.rpc as any)('process_profit_distribution_payout', {
        p_org_id: params.organizationId,
        p_partner_id: params.partnerId,
        p_amount_cents: params.amountCents,
        p_pj_account_id: params.pjAccountId,
        p_pf_account_id: params.pfAccountId,
        p_transaction_date: params.transactionDate || new Date().toISOString().split('T')[0],
        p_notes: params.notes || null,
      });

      if (error) {
        throw normalizeSupabaseError(error, 'CrossContextService.processProfitDistribution');
      }

      return data as string;
    } finally {
      this.inProgressKeys.delete(lockKey);
    }
  }
}
