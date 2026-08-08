import { useState, useEffect } from 'react';
import { Search, X, ArrowUpRight, ArrowDownRight, Briefcase, User, Building2 } from 'lucide-react';
import { Transaction, Project, Customer } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  projects: Project[];
  customers: Customer[];
  onSelectTransaction: (t: Transaction) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  transactions,
  projects,
  customers,
  onSelectTransaction,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.client.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por transações, clientes, projetos ou categorias (Cmd + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-medium text-sm outline-none placeholder:text-slate-500"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-6 scrollbar-none text-xs">
          {/* Transactions Group */}
          {filteredTransactions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Transações</span>
              {filteredTransactions.map(t => (
                <div
                  key={t.id}
                  onClick={() => { onSelectTransaction(t); onClose(); }}
                  className="p-3 bg-slate-950 hover:bg-slate-800 rounded-xl border border-slate-800/80 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                      {t.type === 'income' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-slate-400" />}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{t.title}</p>
                      <p className="text-slate-400 text-[11px]">{t.date} • {t.category}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                    R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Projects Group */}
          {filteredProjects.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Projetos</span>
              {filteredProjects.map(p => (
                <div key={p.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{p.name}</p>
                      <p className="text-slate-400 text-[11px]">Cliente: {p.client}</p>
                    </div>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">R$ {p.revenue.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Customers Group */}
          {filteredCustomers.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Clientes</span>
              {filteredCustomers.map(c => (
                <div key={c.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{c.name}</p>
                      <p className="text-slate-400 text-[11px]">{c.documentCnpjCpf}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">{c.contactEmail}</span>
                </div>
              ))}
            </div>
          )}

          {query && filteredTransactions.length === 0 && filteredProjects.length === 0 && filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Nenhum registro encontrado para "{query}".
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>Pressione <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">ESC</kbd> para fechar</span>
          <span>Navegue com o teclado</span>
        </div>
      </div>
    </div>
  );
}
