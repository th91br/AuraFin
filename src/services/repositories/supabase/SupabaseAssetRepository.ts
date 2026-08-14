import { supabase } from '../../../integrations/supabase/client';
import { Asset } from '../../../types';
import { AuraLogger } from '../../../lib/logger';

export class SupabaseAssetRepository {
  async list(userId: string): Promise<Asset[]> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category as Asset['category'],
        value: Number(item.value_cents || 0) / 100,
        acquisitionDate: item.acquisition_date,
        notes: item.notes
      }));
    } catch (err: any) {
      AuraLogger.error('[SupabaseAssetRepository] Erro ao listar ativos PF', { error: err.message });
      return [];
    }
  }

  async create(asset: Partial<Asset>, userId: string): Promise<Asset | null> {
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert({
          user_id: userId,
          name: asset.name,
          category: asset.category || 'outros',
          value_cents: Math.round((asset.value || 0) * 100),
          acquisition_date: asset.acquisitionDate || new Date().toISOString().split('T')[0],
          notes: asset.notes
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        category: data.category as any,
        value: Number(data.value_cents) / 100,
        acquisitionDate: data.acquisition_date,
        notes: data.notes
      };
    } catch (err: any) {
      AuraLogger.error('[SupabaseAssetRepository] Erro ao criar ativo PF', { error: err.message });
      throw err;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      AuraLogger.error('[SupabaseAssetRepository] Erro ao excluir ativo PF', { error: err.message });
      throw err;
    }
  }
}

export const supabaseAssetRepo = new SupabaseAssetRepository();
