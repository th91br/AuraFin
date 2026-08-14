import { supabase } from '../../../integrations/supabase/client';
import { AuraLogger } from '../../../lib/logger';

export interface EmergencyReserveData {
  currentAmount: number;
  targetMonths: number;
  monthlyExpenseBasis: number;
}

export class SupabaseEmergencyReserveRepository {
  async get(userId: string): Promise<EmergencyReserveData> {
    try {
      const { data, error } = await supabase
        .from('emergency_reserves')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return {
          currentAmount: 0,
          targetMonths: 6,
          monthlyExpenseBasis: 0
        };
      }

      return {
        currentAmount: Number(data.current_amount_cents || 0) / 100,
        targetMonths: data.target_months || 6,
        monthlyExpenseBasis: Number(data.monthly_expense_basis_cents || 0) / 100
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseEmergencyReserveRepository] Erro ao buscar reserva de emergência', { error: err.message });
      return {
        currentAmount: 0,
        targetMonths: 6,
        monthlyExpenseBasis: 0
      };
    }
  }

  async save(userId: string, data: Partial<EmergencyReserveData>): Promise<void> {
    try {
      const payload: any = {
        user_id: userId,
        target_months: data.targetMonths !== undefined ? data.targetMonths : 6,
      };

      if (data.currentAmount !== undefined) {
        payload.current_amount_cents = Math.round(data.currentAmount * 100);
      }
      if (data.monthlyExpenseBasis !== undefined) {
        payload.monthly_expense_basis_cents = Math.round(data.monthlyExpenseBasis * 100);
      }

      const { error } = await supabase
        .from('emergency_reserves')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseEmergencyReserveRepository] Erro ao salvar reserva de emergência', { error: err.message });
      throw err;
    }
  }
}

export const supabaseEmergencyReserveRepo = new SupabaseEmergencyReserveRepository();
