import { useState } from 'react';
import { MetricCard } from './aura/AuraCards';
import { Plus, FileText, Download, Search, Filter, Paperclip, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  isPrivacyMode?: boolean;
}

export function PjDocumentsView({ isPrivacyMode = false }: Props) {
  const [filterType, setFilterType] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    { id: 'doc1', name: 'NF_34092_TechCorp.pdf', type: 'Nota Fiscal', category: 'Faturamento', date: '2026-08-01', linkedTo: 'TechCorp Brasil', size: '245 KB' },
    { id: 'doc2', name: 'Comprovante_DAS_07_2026.pdf', type: 'Guia / DAS', category: 'Impostos', date: '2026-07-20', linkedTo: 'Receita Federal', size: '180 KB' },
    { id: 'doc3', name: 'Contrato_Desenvolvimento_SaaS.pdf', type: 'Contrato', category: 'Projetos', date: '2026-06-15', linkedTo: 'TechCorp Brasil', size: '1.2 MB' },
    { id: 'doc4', name: 'Recibo_Prolabore_Thiago_07.pdf', type: 'Recibo', category: 'Sócios', date: '2026-07-31', linkedTo: 'Thiago (Sócio)', size: '110 KB' },
  ];

  const filteredDocs = documents.filter(d => {
    const matchesType = filterType === 'todos' || d.type.toLowerCase().includes(filterType);
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.linkedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 rounded">
            Repositório de Comprovantes & Contratos
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white mt-1">
            Central de Documentos
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Centralize comprovantes, recibos, notas fiscais e contratos vinculados aos seus lançamentos.
          </p>
        </div>

        <button
          onClick={() => alert('Anexo simulado com sucesso!')}
          className="flex items-center space-x-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all text-xs shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Anexar Novo Documento</span>
        </button>
      </div>

      {/* Top 4 KPIs Documentos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total de Documentos" value={documents.length} isPrivacyMode={isPrivacyMode} subtitle="Arquivos catalogados" />
        <MetricCard title="Notas Fiscais Emitidas" value={1} isPrivacyMode={isPrivacyMode} subtitle="Vínculo com faturamento" />
        <MetricCard title="Comprovantes de Imposto" value={1} isPrivacyMode={isPrivacyMode} subtitle="DAS Simples Nacional" />
        <MetricCard title="Contratos Ativos" value={1} isPrivacyMode={isPrivacyMode} subtitle="TechCorp Brasil" />
      </div>

      {/* Busca & Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F172A] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar documento ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button onClick={() => setFilterType('todos')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filterType === 'todos' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Todos</button>
          <button onClick={() => setFilterType('nota')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filterType === 'nota' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Notas Fiscais</button>
          <button onClick={() => setFilterType('guia')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filterType === 'guia' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Guias / Impostos</button>
          <button onClick={() => setFilterType('contrato')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${filterType === 'contrato' ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400'}`}>Contratos</button>
        </div>
      </div>

      {/* Tabela de Documentos */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Nome do Arquivo</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Vínculo</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Tamanho</th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredDocs.map(d => (
                <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{d.name}</span>
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-white/10">
                      {d.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-400">{d.linkedTo}</td>
                  <td className="py-3.5 px-4 text-slate-400">{d.date}</td>
                  <td className="py-3.5 px-4 text-right text-slate-400">{d.size}</td>
                  <td className="py-3.5 px-4 text-center font-sans">
                    <button onClick={() => alert(`Download simulado de ${d.name}`)} className="p-1.5 rounded-lg bg-slate-900 text-cyan-400 hover:text-white border border-white/10">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
