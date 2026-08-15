import { supabase } from '../../../integrations/supabase/client';
import { Goal } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseGoalRepository {
  async list(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('id,title,target_amount_cents,current_amount_cents,target_date,category')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        title: item.title,
        targetAmount: Number(item.target_amount_cents || 0) / 100,
        currentAmount: Number(item.current_amount_cents || 0) / 100,
        targetDate: item.target_date,
        category: item.category as Goal['category']
      }));
    } catch (err: any) {
      AuraLogger.error('[SupabaseGoalRepository] Erro ao listar metas PF', { error: err.message });
      return [];
    }
  }

  async create(goal: Partial<Goal>, userId: string): Promise<Goal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title: goal.title,
          target_amount_cents: Math.round((goal.targetAmount || 1000) * 100),
          current_amount_cents: Math.round((goal.currentAmount || 0) * 100),
          target_date: goal.targetDate || new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
          category: goal.category || 'outros',
          status: 'em_andamento'
        })
        .select('id,title,target_amount_cents,current_amount_cents,target_date,category')
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        targetAmount: Number(data.target_amount_cents) / 100,
        currentAmount: Number(data.current_amount_cents) / 100,
        targetDate: data.target_date,
        category: data.category as any
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseGoalRepository] Erro ao criar meta PF', { error: err.message });
      throw err;
    }
  }

  async addContribution(goalId: string, amount: number, userId: string, notes?: string): Promise<void> {
    try {
      const amountCents = Math.round(amount * 100);

      // 1. Insert contribution history
      const { error: contribError } = await supabase
        .from('goal_contributions')
        .insert({
          goal_id: goalId,
          user_id: userId,
          amount_cents: amountCents,
          contribution_date: new Date().toISOString().split('T')[0],
          notes: notes || 'Aporte registrado'
        });

      if (contribError) throw contribError;

      // 2. Update goal current amount
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount_cents, target_amount_cents')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !goal) throw fetchError;

      const newCurrentCents = Number(goal.current_amount_cents || 0) + amountCents;
      const isCompleted = newCurrentCents >= Number(goal.target_amount_cents);

      const { error: updateError } = await supabase
        .from('goals')
        .update({
          current_amount_cents: newCurrentCents,
          status: isCompleted ? 'concluido' : 'em_andamento'
        })
        .eq('id', goalId)
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } catch (err: any) {
      AuraLogger.error('[SupabaseGoalRepository] Erro ao adicionar aporte em meta', { error: err.message });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseGoalRepository] Erro ao excluir meta PF', { error: err.message });
      throw err;
    }
  }
}

export const supabaseGoalRepo = new SupabaseGoalRepository();
