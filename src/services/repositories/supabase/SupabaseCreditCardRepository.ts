import { supabase } from '../../../integrations/supabase/client';
import { CreditCard } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseCreditCardRepository {
  async list(userId: string): Promise<CreditCard[]> {
    try {
      const { data, error } = await supabase
        .from('personal_credit_cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        name: item.name,
        institution: item.institution,
        limitTotal: Number(item.limit_total_cents || 0) / 100,
        limitUsed: Number(item.limit_used_cents || 0) / 100,
        currentInvoice: Number(item.current_invoice_cents || 0) / 100,
        closingDay: item.closing_day,
        dueDay: item.due_day,
        context: 'PF',
        brand: item.brand,
        lastFourDigits: item.last_four_digits,
        isPrimary: item.is_primary,
        status: (item.status === 'active' ? 'ativo' : item.status === 'archived' ? 'arquivado' : 'inativo') as any
      }));
    } catch (err: any) {
      AuraLogger.error('[SupabaseCreditCardRepository] Erro ao listar cartões PF', { error: err.message });
      return [];
    }
  }

  async create(card: Partial<CreditCard>, userId: string): Promise<CreditCard | null> {
    try {
      const { data, error } = await supabase
        .from('personal_credit_cards')
        .insert({
          user_id: userId,
          name: card.name,
          institution: card.institution || 'Banco',
          brand: card.brand || 'Mastercard',
          last_four_digits: card.lastFourDigits || '1234',
          limit_total_cents: Math.round((card.limitTotal || 0) * 100),
          limit_used_cents: Math.round((card.limitUsed || 0) * 100),
          current_invoice_cents: Math.round((card.currentInvoice || 0) * 100),
          closing_day: card.closingDay || 20,
          due_day: card.dueDay || 28,
          is_primary: !!card.isPrimary,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        institution: data.institution,
        limitTotal: Number(data.limit_total_cents) / 100,
        limitUsed: Number(data.limit_used_cents) / 100,
        currentInvoice: Number(data.current_invoice_cents) / 100,
        closingDay: data.closing_day,
        dueDay: data.due_day,
        context: 'PF',
        brand: data.brand,
        lastFourDigits: data.last_four_digits,
        isPrimary: data.is_primary,
        status: (data.status === 'active' ? 'ativo' : data.status === 'archived' ? 'arquivado' : 'inativo') as any
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseCreditCardRepository] Erro ao criar cartão PF', { error: err.message });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('personal_credit_cards')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseCreditCardRepository] Erro ao excluir cartão PF', { error: err.message });
      throw err;
    }
  }
}

export const supabaseCreditCardRepo = new SupabaseCreditCardRepository();
