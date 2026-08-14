import React, { useState } from 'react';
import { useOrganization } from '../../context/OrganizationContext';
import { Building2, X, Loader2, Plus, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateOrganizationModal({ isOpen, onClose, onSuccess }: Props) {
  const { createOrganization, isLoading } = useOrganization();
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('O nome da empresa é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    try {
      const org = await createOrganization(cleanName, legalName.trim() || cleanName, taxId.trim());
      if (org) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setName('');
          setLegalName('');
          setTaxId('');
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setError('Falha ao cadastrar organização. Tente novamente.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao criar organização.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Nova Empresa PJ</h2>
            <p className="text-xs text-slate-400">Cadastre uma nova organização jurídica multi-tenant.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Empresa cadastrada com sucesso! Ativando...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nome Fantasia */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Nome Fantasia / Marca *</label>
            <input
              type="text"
              required
              placeholder="Ex: Aura Tech Soluções"
              value={name}
              onChange={(e) => { setError(null); setName(e.target.value); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Razão Social */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">Razão Social (Opcional)</label>
            <input
              type="text"
              placeholder="Ex: Aura Tecnologia e Consultoria Financeira Ltda"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* CNPJ */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300 block">CNPJ / CPF Técnico (Opcional)</label>
            <input
              type="text"
              placeholder="00.000.000/0001-00"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Trust notice */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-400 text-[11px] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Você será registrado automaticamente como Sócio-Proprietário (Owner) com isolamento RLS.</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !name.trim()}
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cadastrando...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Criar Empresa</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
