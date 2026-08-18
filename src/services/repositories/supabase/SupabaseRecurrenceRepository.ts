import { supabase } from '../../../integrations/supabase/client';
import { RecurrenceItem } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseRecurrenceRepository {
  async list(userId: string): Promise<RecurrenceItem[]> {
    try {
      const { data, error } = await supabase
        .from('recurrence_rules')
        .select('id,title,amount_cents,frequency,category,next_due_date')
        .eq('user_id', userId)
        .order('next_due_date', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount_cents || 0) / 100,
        frequency: item.frequency as 'mensal' | 'semanal' | 'anual',
        category: item.category,
        nextDueDate: item.next_due_date,
        context: 'PF'
      }));
    } catch (err: any) {
      AuraLogger.error('[SupabaseRecurrenceRepository] Erro ao listar recorrências PF', { error: err.message });
      return [];
    }
  }

  async create(rec: Partial<RecurrenceItem>, userId: string): Promise<RecurrenceItem | null> {
    try {
      const { data, error } = await supabase
        .from('recurrence_rules')
        .insert({
          user_id: userId,
          title: rec.title,
          amount_cents: Math.round((rec.amount || 0) * 100),
          frequency: rec.frequency || 'mensal',
          category: rec.category || 'moradia',
          next_due_date: rec.nextDueDate || new Date().toISOString().split('T')[0],
          status: 'active'
        })
        .select('id,title,amount_cents,frequency,category,next_due_date')
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        amount: Number(data.amount_cents) / 100,
        frequency: data.frequency as 'mensal' | 'semanal' | 'anual',
        category: data.category,
        nextDueDate: data.next_due_date,
        context: 'PF'
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseRecurrenceRepository] Erro ao criar recorrência PF', { error: err.message });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recurrence_rules')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseRecurrenceRepository] Erro ao excluir recorrência PF', { error: err.message });
      throw err;
    }
  }
}

export const supabaseRecurrenceRepo = new SupabaseRecurrenceRepository();
