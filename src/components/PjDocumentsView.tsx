import { FileText, Plus } from 'lucide-react';

interface Props {
  isPrivacyMode?: boolean;
  documents?: Array<{ id: string; name: string; type: string; linkedTo?: string; date?: string; size?: string }>;
}

export function PjDocumentsView({ documents = [] }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div><span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">Repositório de documentos</span><h1 className="text-2xl font-black tracking-tight text-white mt-1">Central de Documentos</h1><p className="text-xs text-slate-400 mt-1">Arquivos da organização ativa.</p></div>
        <button onClick={() => alert('O upload de documentos ainda não possui uma fonte Supabase ativa.')} className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 text-white font-bold rounded-xl text-xs"><Plus className="w-4 h-4" /><span>Anexar documento</span></button>
      </div>
      {documents.length === 0 ? <div className="min-h-[300px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-[#0F172A] text-center"><FileText className="w-10 h-10 text-slate-600" /><p className="text-sm text-slate-400">Nenhum dado disponível</p></div> : <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-900 text-slate-400 uppercase text-[10px]"><th className="py-3 px-4">Nome</th><th className="py-3 px-4">Tipo</th><th className="py-3 px-4">Vínculo</th><th className="py-3 px-4">Data</th><th className="py-3 px-4">Tamanho</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id} className="border-b border-white/5"><td className="py-3 px-4 font-bold">{document.name}</td><td className="py-3 px-4">{document.type}</td><td className="py-3 px-4 text-slate-400">{document.linkedTo || '—'}</td><td className="py-3 px-4 text-slate-400">{document.date || '—'}</td><td className="py-3 px-4 text-slate-400">{document.size || '—'}</td></tr>)}</tbody></table></div>}
    </div>
  );
}
