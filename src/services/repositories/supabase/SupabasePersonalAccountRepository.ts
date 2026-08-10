import { Account } from '../../../types';
import { supabase } from '../../../integrations/supabase/client';
import { IPersonalAccountRepository } from '../interfaces';
import { normalizeSupabaseError } from '../errors';
import { mapPersonalAccountRowToDomain, mapPersonalAccountDomainToInsert } from '../mappers';

export class SupabasePersonalAccountRepository implements IPersonalAccountRepository {
  private table() {
    return (supabase.from as any)('personal_accounts');
  }

  async list(userId: string): Promise<Account[]> {
    const { data, error } = await this.table()
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw normalizeSupabaseError(error, 'Erro ao listar contas bancárias PF do Supabase.');
    return (data || []).map(mapPersonalAccountRowToDomain);
  }

  async create(account: Partial<Account>, userId: string): Promise<Account> {
    const insertPayload = mapPersonalAccountDomainToInsert(account, userId);
    const { data, error } = await this.table()
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao criar conta bancária PF no Supabase.');
    return mapPersonalAccountRowToDomain(data);
  }

  async update(account: Account, userId: string): Promise<Account> {
    const insertPayload = mapPersonalAccountDomainToInsert(account, userId);
    const { data, error } = await this.table()
      .update(insertPayload)
      .eq('id', account.id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw normalizeSupabaseError(error, 'Erro ao atualizar conta bancária PF no Supabase.');
    return mapPersonalAccountRowToDomain(data);
  }

  async archive(id: string, userId: string): Promise<void> {
    const { error } = await this.table()
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw normalizeSupabaseError(error, 'Erro ao arquivar conta bancária PF no Supabase.');
  }
}
