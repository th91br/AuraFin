import { Transaction } from '../types';
import { RefreshCcw, FileCheck2, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onReimburse: () => void;
}

export function PjAccounting({ transactions, onReimburse }: Props) {
  const pjTxs = transactions.filter(t => t.context === 'PJ');
  
  const pendingReimbursements = pjTxs.filter(t => t.isPaidByPF && !t.reimbursed);
  const totalReimbursement = pendingReimbursements.reduce((acc, t) => acc + t.amount, 0);

  const personalExpenses = pjTxs.filter(t => t.isPersonalExpenseInPJ);

  const currentRevenue = pjTxs
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0) || 18500;

  const handleExportTaxPackage = () => {
    const taxPackage = {
      empresa: "AuraFin Tecnologia e Serviços Ltda",
      cnpj: "12.345.678/0001-90",
      mesReferencia: "Julho/2026",
      dataGeracao: new Date().toISOString(),
      resumo: {
        totalReceitas: currentRevenue,
        totalDespesasOperacionais: pjTxs.filter(t => t.type === 'expense' && !t.isPersonalExpenseInPJ).reduce((acc, t) => acc + t.amount, 0),
        ajustesLucroPessoal: personalExpenses.reduce((acc, t) => acc + t.amount, 0),
        aportesReembolsadosSocio: pjTxs.filter(t => t.reimbursed).reduce((acc, t) => acc + t.amount, 0),
        statusConciliacao: "CONCILIADO_E_AUDITADO"
      },
      transacoes: pjTxs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(taxPackage, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "aurafin_pacote_contabil_julho_2026.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Central do Contador & Reconciliação
        </h1>
        <p className="text-slate-400 mt-1 text-base">
          Fechamento mensal automatizado, auditoria de retiradas e exportação do pacote fiscal.
        </p>
      </div>

      {/* Reimbursement Alert Card */}
      {totalReimbursement > 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-sm gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <RefreshCcw className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pendência de Reembolso ao Sócio</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Você usou dinheiro pessoal para pagar contas da empresa.</h3>
              <p className="text-sm text-slate-400 mt-1">
                {pendingReimbursements.length} despesa(s) registrada(s) via cartão/conta PF.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full md:w-auto font-mono tabular-nums">
            <span className="text-3xl font-extrabold text-white">
              R$ {totalReimbursement.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={onReimburse}
              className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap font-sans uppercase tracking-wider"
            >
              Reembolsar Sócio em 1 Clique
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4 text-slate-200">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div className="text-sm">
            <span className="font-bold text-white">Todos os aportes do sócio foram regularizados!</span> Não há despesas pessoais pendentes de reembolso nesta empresa.
          </div>
        </div>
      )}

      {/* Fiscal Package Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-slate-800 border border-slate-700 text-white rounded-xl">
              <FileCheck2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Auditoria de Despesas de Uso Pessoal</h2>
              <p className="text-xs text-slate-400">Lançamentos na PJ categorizados como Pró-labore/Lucro</p>
            </div>
          </div>

          <div className="space-y-3 font-mono tabular-nums">
            {personalExpenses.map((tx) => (
              <div key={tx.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white text-sm font-sans">{tx.title}</h4>
                  <p className="text-xs text-rose-400 font-semibold font-sans mt-0.5">Ajustado como Antecipação de Lucro / Pró-labore</p>
                </div>
                <span className="font-extrabold text-white text-base">
                  R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}

            {personalExpenses.length === 0 && (
              <p className="text-sm text-slate-500 italic font-sans">Nenhum uso pessoal identificado no caixa corporativo este mês.</p>
            )}
          </div>
        </div>

        {/* Download Box */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pacote Pró-Contabilidade</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">Exportação do Mês Vigente</h2>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Gere o arquivo JSON estruturado com todos os comprovantes, DRE simplificado e notas para o seu contador.
            </p>
          </div>

          <button
            onClick={handleExportTaxPackage}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-100 hover:bg-white text-slate-950 font-extrabold rounded-xl transition-all shadow-sm active:scale-95 text-xs uppercase tracking-wider"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Pacote Fiscal (.JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
