import { Briefcase, FileCheck2, AlertCircle, Send, MessageSquare, TrendingDown, Target, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onReimburse?: () => void;
}

export function PjPlanning({ transactions, onReimburse }: Props) {
  // Dados simulados para o MVP
  const breakeven = 15000;
  const currentRevenue = transactions.filter(t => t.type === 'income' && t.context === 'PJ').reduce((acc, t) => acc + t.amount, 0) || 12800;
  const breakevenPercent = Math.min(100, Math.round((currentRevenue / breakeven) * 100));

  const projects = [
    { name: 'Redesign App Cliente X', revenue: 8000, cost: 2500, margin: 68 },
    { name: 'Consultoria Mensal', revenue: 4000, cost: 500, margin: 87 }
  ];

  const defaulters = [
    { client: 'Empresa Y', amount: 3500, daysLate: 12 },
    { client: 'Startup Z', amount: 1200, daysLate: 5 }
  ];

  const pendingReimbursements = transactions.filter(t => t.context === 'PJ' && t.isPaidByPF && !t.reimbursed);
  const totalReimbursement = pendingReimbursements.reduce((acc, t) => acc + t.amount, 0);

  const personalExpenses = transactions.filter(t => t.context === 'PJ' && t.isPersonalExpenseInPJ);

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Performance e Estratégia</h2>
          <p className="text-slate-500 mt-1 text-base">Métricas gerenciais e saúde do seu negócio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {totalReimbursement > 0 && (
          <div className="lg:col-span-2 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4">
            <div className="flex items-center space-x-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm border border-indigo-50 text-indigo-600">
                 <RefreshCcw className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="text-base font-semibold text-slate-900 tracking-tight">Aporte Reembolsável Pendente</h4>
                 <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">Você usou dinheiro pessoal para pagar contas da empresa.</p>
               </div>
            </div>
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <span className="text-xl font-bold text-slate-900 tracking-tight">R$ {totalReimbursement.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <button onClick={onReimburse} className="flex-1 md:flex-none px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-transform active:scale-95 shadow-sm whitespace-nowrap">
                Reembolsar Sócio
              </button>
            </div>
          </div>
        )}
        
        {/* Fluxo de Caixa Projetado & Ponto de Equilíbrio */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Ponto de Equilíbrio</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">Faturamento mínimo para cobrir custos fixos.</p>
            </div>
            
            {/* Alerta de Caixa */}
            <div className="flex items-center space-x-2 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-rose-700">Risco em 45 dias</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-3xl font-bold text-slate-900 tracking-tight">
                R$ {currentRevenue.toLocaleString('pt-BR')}
              </span>
              <span className="text-sm font-medium text-slate-400 mb-1">
                / R$ {breakeven.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  breakevenPercent < 50 ? 'bg-rose-500' : breakevenPercent < 100 ? 'bg-amber-400' : 'bg-indigo-500'
                }`} 
                style={{ width: `${breakevenPercent}%` }} 
              />
            </div>
            <p className="text-xs font-semibold text-indigo-600 mt-3">{breakevenPercent}% da meta atingida</p>
          </div>
        </div>

        {/* Gestão de Projetos (Lucratividade) */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mb-5 border border-sky-100">
              <Briefcase className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Lucratividade por Projeto</h3>
            <p className="text-sm text-slate-500 mt-1.5 mb-6 leading-relaxed">Margem de lucro após dedução dos custos diretos.</p>
          </div>

          <div className="space-y-3">
            {projects.map((proj, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-900 text-sm">{proj.name}</span>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg">{proj.margin}% Margem</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Receita: R$ {proj.revenue.toLocaleString('pt-BR')}</span>
                  <span>Custo: R$ {proj.cost.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inadimplência e Cobrança */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 border border-amber-100">
              <TrendingDown className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Contas em Atraso</h3>
            <p className="text-sm text-slate-500 mt-1.5 mb-6 leading-relaxed">Clientes com pagamentos pendentes.</p>
          </div>

          <div className="space-y-3">
            {defaulters.map((def, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{def.client}</p>
                  <p className="text-xs text-rose-600 font-medium mt-0.5">{def.daysLate} dias de atraso</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-slate-900">R$ {def.amount.toLocaleString('pt-BR')}</span>
                  <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100" title="Enviar lembrete">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área do Contador */}
        <div className="bg-slate-900 p-7 rounded-[2rem] shadow-lg flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
            <FileCheck2 className="w-40 h-40 text-white transform rotate-12" />
          </div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-5 border border-white/10 backdrop-blur-md">
              <FileCheck2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white tracking-tight">Área do Contador</h3>
            <p className="text-sm text-slate-400 mt-1.5 mb-8 leading-relaxed">Fechamento do mês pronto para envio.</p>
          </div>

          <div className="relative z-10">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-4 mb-4 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">Julho / 2026</p>
                  <p className="text-xs text-slate-400 mt-0.5">42 NFs • 15 Comprovantes • OFX</p>
                </div>
                <div className="text-emerald-400">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>
              
              {personalExpenses.length > 0 && (
                <div className="mt-4 p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-rose-200">{personalExpenses.length} Ajustes de Lucro (Uso Pessoal)</p>
                    <p className="text-xs text-rose-300/80 mt-0.5 leading-relaxed">Separados das despesas operacionais para proteção fiscal.</p>
                  </div>
                </div>
              )}
            </div>
            
            <button className="w-full flex items-center justify-center space-x-2 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors shadow-sm">
              <Send className="w-4 h-4" />
              <span>Enviar Pacote ao Contador</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
