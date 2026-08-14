import { supabase } from '../../../integrations/supabase/client';
import { InvestmentItem } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseInvestmentRepository {
  async list(userId: string): Promise<InvestmentItem[]> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => {
        const invested = (Number(item.average_price_cents || 0) * Number(item.quantity || 1)) / 100;
        const current = Number(item.total_value_cents || 0) / 100;
        const profit = current - invested;
        const yieldPct = invested > 0 ? `${profit >= 0 ? '+' : ''}${((profit / invested) * 100).toFixed(1)}%` : '+0.0%';

        return {
          id: item.id,
          name: item.name,
          assetType: item.asset_type,
          institution: item.institution,
          quantity: Number(item.quantity || 1),
          averagePrice: Number(item.average_price_cents || 0) / 100,
          currentPrice: Number(item.current_price_cents || 0) / 100,
          totalValue: current,
          investedValue: invested,
          yieldPct
        };
      });
    } catch (err: any) {
      AuraLogger.error('[SupabaseInvestmentRepository] Erro ao listar investimentos PF', { error: err.message });
      return [];
    }
  }

  async create(inv: Partial<InvestmentItem>, userId: string): Promise<InvestmentItem | null> {
    try {
      const quantity = inv.quantity || 1;
      const totalVal = inv.totalValue || (inv.currentPrice ? inv.currentPrice * quantity : 0);
      const totalValCents = Math.round(totalVal * 100);
      const avgPriceCents = Math.round((inv.averagePrice || (inv.investedValue ? inv.investedValue / quantity : totalVal / quantity)) * 100);
      const currPriceCents = Math.round((inv.currentPrice || totalVal / quantity) * 100);

      const { data, error } = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          name: inv.name,
          asset_type: inv.assetType || 'Renda Fixa',
          institution: inv.institution || 'Corretora',
          quantity: quantity,
          average_price_cents: avgPriceCents,
          current_price_cents: currPriceCents,
          total_value_cents: totalValCents
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      const invested = (Number(data.average_price_cents) * Number(data.quantity)) / 100;
      const current = Number(data.total_value_cents) / 100;
      const profit = current - invested;
      const yieldPct = invested > 0 ? `${profit >= 0 ? '+' : ''}${((profit / invested) * 100).toFixed(1)}%` : '+0.0%';

      return {
        id: data.id,
        name: data.name,
        assetType: data.asset_type,
        institution: data.institution,
        quantity: Number(data.quantity),
        averagePrice: Number(data.average_price_cents) / 100,
        currentPrice: Number(data.current_price_cents) / 100,
        totalValue: current,
        investedValue: invested,
        yieldPct
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseInvestmentRepository] Erro ao criar investimento PF', { error: err.message });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseInvestmentRepository] Erro ao excluir investimento PF', { error: err.message });
      throw err;
    }
  }
}

export const supabaseInvestmentRepo = new SupabaseInvestmentRepository();
