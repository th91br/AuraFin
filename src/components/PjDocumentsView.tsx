import { FileText, Plus } from 'lucide-react';

interface Props {
  isPrivacyMode?: boolean;
  documents?: Array<{ id: string; name: string; type: string; linkedTo?: string; date?: string; size?: string }>;
  onUploadDocument?: () => void;
}

export function PjDocumentsView({ documents = [], onUploadDocument }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Central de Documentos</h1>
          <p className="text-xs text-slate-300 mt-1">Comprovantes, contratos e notas fiscais armazenados de forma segura.</p>
        </div>
        {onUploadDocument && (
          <button
            onClick={onUploadDocument}
            className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Anexar documento</span>
          </button>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/80 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">Nenhum documento anexado</h3>
          <p className="text-xs text-slate-300 max-w-sm">Faça o upload de recibos, contratos e notas fiscais para manter o arquivo da sua empresa organizado.</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-300 uppercase text-[10px] tracking-wider border-b border-white/10">
                <th className="py-3 px-4">Nome do Arquivo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Vínculo</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4">Tamanho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {documents.map((document) => (
                <tr key={document.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{document.name}</td>
                  <td className="py-3 px-4 text-slate-300">{document.type}</td>
                  <td className="py-3 px-4 text-slate-300">{document.linkedTo || '—'}</td>
                  <td className="py-3 px-4 text-slate-300">{document.date || '—'}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{document.size || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
