import { Transaction } from '../../../types';
import { supabase } from '../../../integrations/supabase/client';
import { IPersonalTransactionRepository } from '../interfaces';
import { normalizeSupabaseError } from '../errors';
import { mapPersonalTransactionRowToDomain, mapPersonalTransactionDomainToInsert } from '../mappers';

export class SupabasePersonalTransactionRepository implements IPersonalTransactionRepository {
  private table() {
    return (supabase.from as any)('personal_transactions');
  }

  async list(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.table()
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false });

    if (error) throw normalizeSupabaseError(error, 'Erro ao listar transações PF do Supabase.');
    return (data || []).map(mapPersonalTransactionRowToDomain);
  }

  async create(tx: Partial<Transaction>, userId: string): Promise<Transaction> {
    const insertPayload = mapPersonalTransactionDomainToInsert(tx, userId);
    const { data, error } = await this.table()
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao registrar transação PF no Supabase.');
    return mapPersonalTransactionRowToDomain(data);
  }

  async update(tx: Transaction, userId: string): Promise<Transaction> {
    const insertPayload = mapPersonalTransactionDomainToInsert(tx, userId);
    const { data, error } = await this.table()
      .update(insertPayload)
      .eq('id', tx.id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao atualizar transação PF no Supabase.');
    return mapPersonalTransactionRowToDomain(data);
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.table()
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw normalizeSupabaseError(error, 'Erro ao excluir transação PF no Supabase.');
  }
}
