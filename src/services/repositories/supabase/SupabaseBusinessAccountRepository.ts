import { Account } from '../../../types';
import { supabase } from '../../../integrations/supabase/client';
import { IBusinessAccountRepository } from '../interfaces';
import { normalizeSupabaseError } from '../errors';
import { mapBusinessAccountRowToDomain, mapBusinessAccountDomainToInsert } from '../mappers';

export class SupabaseBusinessAccountRepository implements IBusinessAccountRepository {
  private table() {
    return (supabase.from as any)('business_accounts');
  }

  async list(organizationId: string): Promise<Account[]> {
    const { data, error } = await this.table()
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw normalizeSupabaseError(error, 'Erro ao listar contas bancárias PJ do Supabase.');
    return (data || []).map(mapBusinessAccountRowToDomain);
  }

  async create(account: Partial<Account>, organizationId: string): Promise<Account> {
    const insertPayload = mapBusinessAccountDomainToInsert(account, organizationId);
    const { data, error } = await this.table()
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao criar conta bancária PJ no Supabase.');
    return mapBusinessAccountRowToDomain(data);
  }

  async update(account: Account, organizationId: string): Promise<Account> {
    const insertPayload = mapBusinessAccountDomainToInsert(account, organizationId);
    const { data, error } = await this.table()
      .update(insertPayload)
      .eq('id', account.id)
      .eq('organization_id', organizationId)
      .select('*')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao atualizar conta bancária PJ no Supabase.');
    return mapBusinessAccountRowToDomain(data);
  }

  async archive(id: string, organizationId: string): Promise<void> {
    const { error } = await this.table()
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('organization_id', organizationId);

    if (error) throw normalizeSupabaseError(error, 'Erro ao arquivar conta bancária PJ no Supabase.');
  }
}
