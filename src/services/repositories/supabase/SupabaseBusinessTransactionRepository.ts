import { Transaction, TransactionAnalytics, TransactionPage, TransactionQueryFilters } from '../../../types';
import { supabase } from '../../../integrations/supabase/client';
import { IBusinessTransactionRepository } from '../interfaces';
import { normalizeSupabaseError } from '../errors';
import { mapBusinessTransactionRowToDomain, mapBusinessTransactionDomainToInsert } from '../mappers';

export class SupabaseBusinessTransactionRepository implements IBusinessTransactionRepository {
  private table() {
    return (supabase.from as any)('business_transactions');
  }

  async list(organizationId: string): Promise<Transaction[]> {
    const { data, error } = await this.table()
      .select('id,type,title,amount_cents,transaction_date,category,account_id,corporate_card_id,client_id,supplier_id,project_id,cost_center_id,cross_context_id,is_paid_by_pf,is_personal_expense_in_pj,notes')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false });

    if (error) throw normalizeSupabaseError(error, 'Erro ao listar transações PJ do Supabase.');
    return (data || []).map(mapBusinessTransactionRowToDomain);
  }

  async listPage(organizationId: string, filters: TransactionQueryFilters = {}): Promise<TransactionPage<Transaction>> {
    const { data, error } = await (supabase.rpc as any)('list_business_transactions_page', {
      p_organization_id: organizationId,
      p_page_size: Math.min(Math.max(filters.pageSize ?? 50, 1), 100),
      p_cursor_date: filters.cursor?.transaction_date ?? null,
      p_cursor_id: filters.cursor?.id ?? null,
      p_search: filters.search?.trim() || null,
      p_transaction_type: filters.type ?? null,
      p_category: filters.category ?? null,
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
    });

    if (error) throw normalizeSupabaseError(error, 'Erro ao paginar transações PJ do Supabase.');
    const payload = (data || {}) as any;
    return {
      rows: Array.isArray(payload.rows) ? payload.rows.map(mapBusinessTransactionRowToDomain) : [],
      hasMore: payload.has_more === true,
      nextCursor: payload.next_cursor || null,
      pageSize: Number(payload.page_size || filters.pageSize || 50),
    };
  }

  async analytics(organizationId: string, filters: Pick<TransactionQueryFilters, 'category' | 'search' | 'startDate' | 'endDateExclusive'> = {}): Promise<TransactionAnalytics> {
    const { data, error } = await (supabase.rpc as any)('get_business_transaction_analytics', {
      p_organization_id: organizationId,
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
      p_category: filters.category ?? null,
      p_search: filters.search?.trim() || null,
    });
    if (error) throw normalizeSupabaseError(error, 'Erro ao agregar transações PJ do Supabase.');
    return (data || {}) as TransactionAnalytics;
  }

  async exportCsv(organizationId: string, filters: Pick<TransactionQueryFilters, 'category' | 'search' | 'startDate' | 'endDateExclusive'> = {}): Promise<string> {
    const { data, error } = await (supabase.rpc as any)('export_business_transactions_csv', {
      p_organization_id: organizationId,
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
      p_category: filters.category ?? null,
      p_search: filters.search?.trim() || null,
    });
    if (error) throw normalizeSupabaseError(error, 'Erro ao exportar transações PJ do Supabase.');
    return String(data || '');
  }

  async exportJson(organizationId: string, filters: Pick<TransactionQueryFilters, 'category' | 'search' | 'startDate' | 'endDateExclusive'> = {}): Promise<unknown> {
    const { data, error } = await (supabase.rpc as any)('export_business_transactions_json', {
      p_organization_id: organizationId,
      p_start_date: filters.startDate ?? null,
      p_end_date_exclusive: filters.endDateExclusive ?? null,
      p_category: filters.category ?? null,
      p_search: filters.search?.trim() || null,
    });
    if (error) throw normalizeSupabaseError(error, 'Erro ao exportar transações PJ em JSON.');
    return data || [];
  }

  async create(tx: Partial<Transaction>, organizationId: string): Promise<Transaction> {
    const insertPayload = mapBusinessTransactionDomainToInsert(tx, organizationId);
    const { data, error } = await this.table()
      .insert(insertPayload)
      .select('id,type,title,amount_cents,transaction_date,category,account_id,corporate_card_id,client_id,supplier_id,project_id,cost_center_id,cross_context_id,is_paid_by_pf,is_personal_expense_in_pj,notes')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao registrar transação PJ no Supabase.');
    return mapBusinessTransactionRowToDomain(data);
  }

  async update(tx: Transaction, organizationId: string): Promise<Transaction> {
    const insertPayload = mapBusinessTransactionDomainToInsert(tx, organizationId);
    const { data, error } = await this.table()
      .update(insertPayload)
      .eq('id', tx.id)
      .eq('organization_id', organizationId)
      .select('id,type,title,amount_cents,transaction_date,category,account_id,corporate_card_id,client_id,supplier_id,project_id,cost_center_id,cross_context_id,is_paid_by_pf,is_personal_expense_in_pj,notes')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao atualizar transação PJ no Supabase.');
    return mapBusinessTransactionRowToDomain(data);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.table()
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw normalizeSupabaseError(error, 'Erro ao excluir transação PJ no Supabase.');
  }
}
