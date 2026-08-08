import { useState } from 'react';
import { Customer, Supplier, CostCenter } from '../types';
import { DollarSign, Clock, AlertCircle, CheckCircle2, Building2, Filter } from 'lucide-react';
import { PrivacyText } from './ui/PrivacyText';

interface Props {
  customers: Customer[];
  suppliers: Supplier[];
  costCenters: CostCenter[];
  isPrivacyMode: boolean;
}

export function PjReceivablesPayables({ customers, suppliers, costCenters, isPrivacyMode }: Props) {
  const [activeTab, setActiveTab] = useState<'receber' | 'pagar'>('receber');

  const totalReceivables = customers.reduce((acc, c) => acc + c.totalPending, 0);
  const totalPayables = 3400 + 960 + 1110; // AWS + Figma + DAS

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Contas a Receber & A Pagar
          </h1>
          <p className="text-slate-400 mt-1 text-base">
            Controle de entradas futuras por cliente e provisão de custos por fornecedor e centro de custo.
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('receber')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activeTab === 'receber' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-850'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Contas a Receber (R$ {totalReceivables.toLocaleString('pt-BR')})</span>
        </button>

        <button
          onClick={() => setActiveTab('pagar')}
          className={`flex items-center space-x-2 px-4 py-2 font-bold text-xs rounded-xl transition-all ${
            activeTab === 'pagar' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:bg-slate-850'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-400" />
          <span>Contas a Pagar (R$ {totalPayables.toLocaleString('pt-BR')})</span>
        </button>
      </div>

      {/* TAB 1: CONTAS A RECEBER */}
      {activeTab === 'receber' && (
        <div className="space-y-6 font-mono tabular-nums">
          
          {/* Aging Analysis Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 font-sans">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1-7 Dias Atraso</span>
              <p className="text-lg font-bold text-amber-400 mt-1">R$ 2.800,00</p>
              <span className="text-[10px] text-slate-500">1 título</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">8-15 Dias Atraso</span>
              <p className="text-lg font-bold text-amber-400 mt-1">R$ 0,00</p>
              <span className="text-[10px] text-slate-500">0 títulos</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">16-30 Dias Atraso</span>
              <p className="text-lg font-bold text-rose-400 mt-1">R$ 4.500,00</p>
              <span className="text-[10px] text-slate-500">1 título</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">31-60 Dias Atraso</span>
              <p className="text-lg font-bold text-slate-400 mt-1">R$ 0,00</p>
              <span className="text-[10px] text-slate-500">0 títulos</span>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">60+ Dias Atraso</span>
              <p className="text-lg font-bold text-slate-400 mt-1">R$ 0,00</p>
              <span className="text-[10px] text-slate-500">0 títulos</span>
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white font-sans">Títulos a Receber por Cliente</h2>

            <div className="space-y-3">
              {customers.map(c => (
                <div key={c.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm font-sans">{c.name}</h4>
                    <p className="text-xs text-slate-400 font-sans">CNPJ: {c.documentCnpjCpf} • {c.contactEmail}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-sans font-bold uppercase">Pendente</p>
                    <PrivacyText value={c.totalPending} isPrivacyMode={isPrivacyMode} className="text-base font-extrabold text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: CONTAS A PAGAR */}
      {activeTab === 'pagar' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Contas a Pagar & Fornecedores</h2>

            <div className="space-y-3 font-mono tabular-nums">
              {suppliers.map(s => (
                <div key={s.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm font-sans">{s.name}</h4>
                    <p className="text-xs text-slate-400 font-sans">Categoria: {s.category}</p>
                  </div>
                  <span className="font-bold text-rose-400 text-sm">- R$ {s.totalSpent.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
