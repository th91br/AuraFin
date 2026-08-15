import { supabase } from '../../integrations/supabase/client';
import { normalizeSupabaseError } from '../repositories/errors';

export interface DocumentUploadOptions {
  file: File;
  context: 'PF' | 'PJ';
  userId?: string;
  organizationId?: string;
  category?: string;
  notes?: string;
  linkToType?: 'transaction' | 'invoice' | 'receivable' | 'payable' | 'tax' | 'project';
  linkToId?: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  context: 'PF' | 'PJ';
  userId?: string;
  organizationId?: string;
  signedUrl?: string;
  createdAt: string;
}

const BUCKET_NAME = 'financial-documents';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export class DocumentStorageService {
  /**
   * Realiza o upload do arquivo físico no Supabase Storage e salva o metadado no PostgreSQL
   */
  public static async uploadDocument(options: DocumentUploadOptions): Promise<DocumentMetadata> {
    const { file, context, userId, organizationId, linkToType, linkToId } = options;

    if (!file) {
      throw new Error('Nenhum arquivo foi selecionado.');
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('O tamanho máximo permitido para o arquivo é 10MB.');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Formatos aceitos: PDF, PNG, JPEG e WEBP.');
    }

    const docId = crypto.randomUUID();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    
    let path = '';
    if (context === 'PF') {
      if (!userId) throw new Error('ID do usuário é obrigatório para documentos PF.');
      path = `pf/${userId}/${docId}/${sanitizedName}`;
    } else {
      if (!organizationId) throw new Error('ID da organização é obrigatório para documentos PJ.');
      path = `pj/${organizationId}/${docId}/${sanitizedName}`;
    }

    // 1. Upload to Supabase Storage Bucket
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadErr) {
      throw normalizeSupabaseError(uploadErr, 'DocumentStorageService.uploadDocument');
    }

    try {
      // 2. Persist Metadata in public.documents
      const { data: docData, error: dbErr } = await (supabase.from('documents') as any)
        .insert({
          id: docId,
          user_id: context === 'PF' ? userId : null,
          organization_id: context === 'PJ' ? organizationId : null,
          file_name: file.name,
          file_path: path,
          file_size_bytes: file.size,
          mime_type: file.type,
        })
        .select('id,file_name,file_path,file_size_bytes,mime_type,user_id,organization_id,created_at')
        .single();

      if (dbErr) {
        // Rollback storage upload on database metadata error
        await supabase.storage.from(BUCKET_NAME).remove([path]);
        throw normalizeSupabaseError(dbErr, 'DocumentStorageService.uploadDocument.db');
      }

      // 3. Optional Link Association in public.document_links
      if (linkToType && linkToId) {
        await (supabase.from('document_links') as any).insert({
          document_id: docId,
          entity_type: linkToType,
          entity_id: linkToId,
        });
      }

      return {
        id: docData.id,
        filename: docData.file_name,
        filePath: docData.file_path,
        fileSizeBytes: docData.file_size_bytes,
        mimeType: docData.mime_type,
        context,
        userId: docData.user_id,
        organizationId: docData.organization_id,
        createdAt: docData.created_at,
      };

    } catch (err) {
      // Cleanup orphan storage file on failure
      await supabase.storage.from(BUCKET_NAME).remove([path]);
      throw err;
    }
  }

  /**
   * Gera uma Signed URL segura com expiração curta para download/visualização
   */
  public static async getSignedUrl(filePath: string, expiresInSeconds = 600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      throw normalizeSupabaseError(error, 'DocumentStorageService.getSignedUrl');
    }

    return data.signedUrl;
  }

  /**
   * Exclui o arquivo do Storage e seu metadado do banco
   */
  public static async deleteDocument(docId: string, filePath: string): Promise<void> {
    // 1. Remove from Storage
    const { error: storageErr } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageErr) {
      console.warn('[DocumentStorageService] Erro ao remover do Storage:', storageErr);
    }

    // 2. Remove Metadata from Database
    const { error: dbErr } = await (supabase.from('documents') as any)
      .delete()
      .eq('id', docId);

    if (dbErr) {
      throw normalizeSupabaseError(dbErr, 'DocumentStorageService.deleteDocument');
    }
  }
}
