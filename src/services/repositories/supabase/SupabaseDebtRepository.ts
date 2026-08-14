import { supabase } from '../../../integrations/supabase/client';
import { Debt } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseDebtRepository {
  async list(userId: string): Promise<Debt[]> {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        title: item.title,
        totalBalance: Number(item.total_balance_cents || 0) / 100,
        monthlyPayment: Number(item.monthly_payment_cents || 0) / 100,
        remainingInstallments: item.remaining_installments,
        interestRatePct: Number(item.interest_rate_pct || 0),
        dueDate: item.due_date
      }));
    } catch (err: any) {
      AuraLogger.error('[SupabaseDebtRepository] Erro ao listar dívidas PF', { error: err.message });
      return [];
    }
  }

  async create(debt: Partial<Debt>, userId: string): Promise<Debt | null> {
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          user_id: userId,
          title: debt.title,
          total_balance_cents: Math.round((debt.totalBalance || 0) * 100),
          monthly_payment_cents: Math.round((debt.monthlyPayment || 0) * 100),
          remaining_installments: debt.remainingInstallments || 1,
          interest_rate_pct: debt.interestRatePct || 0,
          due_date: debt.dueDate || new Date().toISOString().split('T')[0],
          status: 'ativa'
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        totalBalance: Number(data.total_balance_cents) / 100,
        monthlyPayment: Number(data.monthly_payment_cents) / 100,
        remainingInstallments: data.remaining_installments,
        interestRatePct: Number(data.interest_rate_pct),
        dueDate: data.due_date
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseDebtRepository] Erro ao criar dívida PF', { error: err.message });
      throw err;
    }
  }

  async payInstallment(debtId: string, amount: number, userId: string): Promise<void> {
    try {
      const amountCents = Math.round(amount * 100);

      // 1. Record debt payment
      const { error: payError } = await supabase
        .from('debt_payments')
        .insert({
          debt_id: debtId,
          user_id: userId,
          amount_cents: amountCents,
          payment_date: new Date().toISOString().split('T')[0]
        });

      if (payError) throw payError;

      // 2. Fetch and amortize debt balance and installments
      const { data: debt, error: fetchError } = await supabase
        .from('debts')
        .select('total_balance_cents, remaining_installments')
        .eq('id', debtId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !debt) throw fetchError;

      const newBalanceCents = Math.max(0, Number(debt.total_balance_cents) - amountCents);
      const newRemaining = Math.max(0, Number(debt.remaining_installments) - 1);
      const isSettled = newBalanceCents === 0 || newRemaining === 0;

      const { error: updateError } = await supabase
        .from('debts')
        .update({
          total_balance_cents: newBalanceCents,
          remaining_installments: newRemaining,
          status: isSettled ? 'quitada' : 'ativa'
        })
        .eq('id', debtId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } catch (err: any) {
      AuraLogger.error('[SupabaseDebtRepository] Erro ao pagar parcela de dívida', { error: err.message });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseDebtRepository] Erro ao excluir dívida PF', { error: err.message });
      throw err;
    }
  }
}

export const supabaseDebtRepo = new SupabaseDebtRepository();
