import { Transaction } from '../../../types';
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
