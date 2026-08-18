import { Transaction, TransactionAnalytics, TransactionPage, TransactionQueryFilters } from '../../../types';
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
      .select('id,type,title,amount_cents,transaction_date,category,account_id,credit_card_id,cross_context_id,notes')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false });

    if (error) throw normalizeSupabaseError(error, 'Erro ao listar transações PF do Supabase.');
    return (data || []).map(mapPersonalTransactionRowToDomain);
  }

  async listPage(userId: string, filters: TransactionQueryFilters = {}): Promise<TransactionPage<Transaction>> {
    const { data, error } = await (supabase.rpc as any)('list_personal_transactions_page', {
      p_page_size: Math.min(Math.max(filters.pageSize ?? 50, 1), 100),
      p_cursor_date: filters.cursor?.transaction_date ?? null,
      p_cursor_id: filters.cursor?.id ?? null,
      p_search: filters.search?.trim() || null,
      p_transaction_type: filters.type ?? null,
      p_category: filters.category ?? null,
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
    });

    if (error) throw normalizeSupabaseError(error, 'Erro ao paginar transações PF do Supabase.');
    const payload = (data || {}) as any;
    return {
      rows: Array.isArray(payload.rows) ? payload.rows.map(mapPersonalTransactionRowToDomain) : [],
      hasMore: payload.has_more === true,
      nextCursor: payload.next_cursor || null,
      pageSize: Number(payload.page_size || filters.pageSize || 50),
    };
  }

  async analytics(userId: string, filters: Pick<TransactionQueryFilters, 'category' | 'search' | 'startDate' | 'endDateExclusive'> = {}): Promise<TransactionAnalytics> {
    const { data, error } = await (supabase.rpc as any)('get_personal_transaction_analytics', {
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
      p_category: filters.category ?? null,
      p_search: filters.search?.trim() || null,
    });
    if (error) throw normalizeSupabaseError(error, 'Erro ao agregar transações PF do Supabase.');
    return (data || {}) as TransactionAnalytics;
  }

  async exportCsv(userId: string, filters: Pick<TransactionQueryFilters, 'category' | 'search' | 'startDate' | 'endDateExclusive'> = {}): Promise<string> {
    const { data, error } = await (supabase.rpc as any)('export_personal_transactions_csv', {
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
      p_category: filters.category ?? null,
      p_search: filters.search?.trim() || null,
    });
    if (error) throw normalizeSupabaseError(error, 'Erro ao exportar transações PF do Supabase.');
    return String(data || '');
  }

  async create(tx: Partial<Transaction>, userId: string): Promise<Transaction> {
    const insertPayload = mapPersonalTransactionDomainToInsert(tx, userId);
    const { data, error } = await this.table()
      .insert(insertPayload)
      .select('id,type,title,amount_cents,transaction_date,category,account_id,credit_card_id,cross_context_id,notes')
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
      .select('id,type,title,amount_cents,transaction_date,category,account_id,credit_card_id,cross_context_id,notes')
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
