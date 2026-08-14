import { supabase } from '../../../integrations/supabase/client';
import { BudgetItem, TransactionCategoryPF } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseBudgetRepository {
  async list(userId: string, periodMonth: string): Promise<BudgetItem[]> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('period_month', periodMonth);

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        category: item.category as TransactionCategoryPF,
        label: item.category,
        allocated: Number(item.planned_cents || 0) / 100,
        spent: 0
      }));
    } catch (err: any) {
      AuraLogger.error('[SupabaseBudgetRepository] Erro ao listar orçamentos PF', { error: err.message });
      return [];
    }
  }

  async upsert(userId: string, category: string, plannedAmount: number, periodMonth: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userId,
            category,
            planned_cents: Math.round(plannedAmount * 100),
            period_month: periodMonth
          },
          { onConflict: 'user_id, category, period_month' }
        );

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseBudgetRepository] Erro ao salvar orçamento', { error: err.message });
      throw err;
    }
  }

  async copyFromPreviousMonth(userId: string, currentMonth: string, previousMonth: string): Promise<void> {
    try {
      const { data: prevBudgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('period_month', previousMonth);

      if (error) throw error;
      if (!prevBudgets || prevBudgets.length === 0) return;

      const newRows = prevBudgets.map(b => ({
        user_id: userId,
        category: b.category,
        planned_cents: b.planned_cents,
        period_month: currentMonth
      }));

      const { error: upsertError } = await supabase
        .from('budgets')
        .upsert(newRows, { onConflict: 'user_id, category, period_month' });

      if (upsertError) throw upsertError;
    } catch (err: any) {
      AuraLogger.error('[SupabaseBudgetRepository] Erro ao copiar orçamentos', { error: err.message });
      throw err;
    }
  }
}

export const supabaseBudgetRepo = new SupabaseBudgetRepository();
