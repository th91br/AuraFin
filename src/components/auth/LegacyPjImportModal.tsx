import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { LegacyPjImportService, ImportPjPreviewStats } from '../../services/migration/legacyPjImportService';
import { Building2, CheckCircle2, AlertTriangle, ArrowRight, X, Loader2, HardDriveUpload, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LegacyPjImportModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { activeOrganization, userRole, isViewerReadOnly } = useOrganization();
  const [stats, setStats] = useState<ImportPjPreviewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated && activeOrganization) {
      setIsLoadingStats(true);
      setErrorMsg(null);
      LegacyPjImportService.previewImport(activeOrganization.id)
        .then(res => setStats(res))
        .catch(err => console.error('[LegacyPjImportModal] Erro ao carregar preview PJ:', err))
        .finally(() => setIsLoadingStats(false));
    }
  }, [isOpen, isAuthenticated, activeOrganization]);

  if (!isOpen || !isAuthenticated || !user || !activeOrganization) return null;

  const handleConfirmImport = async () => {
    if (isViewerReadOnly) {
      setErrorMsg('Apenas membros com permissão financeira (Owner, Admin ou Finance) podem importar dados PJ.');
      return;
    }

    setIsImporting(true);
    setErrorMsg(null);
    try {
      await LegacyPjImportService.executeImport(user.id, activeOrganization.id, (step, percent) => {
        setProgressStep(step);
        setProgressPercent(percent);
      });
      setTimeout(() => {
        setIsImporting(false);
        onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      setIsImporting(false);
      setErrorMsg(err.message || 'Falha durante a migração dos dados legados PJ.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative">
        
        <button
          onClick={onClose}
          disabled={isImporting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 rounded-full inline-flex items-center space-x-1.5">
            <HardDriveUpload className="w-3 h-3 text-indigo-400" />
            <span>Assistente de Migração PJ</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight pt-1">
            Importar Dados Empresariais?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Encontramos registros financeiros corporativos salvos localmente neste navegador. Deseja vinculá-los à sua empresa ativa no Supabase?
          </p>
        </div>

        {/* Target Organization Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold block">Empresa de Destino:</span>
            <span className="text-sm font-black text-white">{activeOrganization.name}</span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-indigo-900/80 text-indigo-200 text-[10px] font-mono uppercase font-bold border border-indigo-700/50">
            Role: {userRole}
          </span>
        </div>

        {/* Viewer RBAC Warning */}
        {isViewerReadOnly && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Permissão de Leitura Apenas (Viewer):</span>
              <span className="text-[11px] text-rose-300/80 leading-relaxed block">
                Seu perfil nesta organização possui apenas permissão de visualização. A importação de dados exige privilégios de Owner, Admin ou Finance.
              </span>
            </div>
          </div>
        )}

        {/* Stats Preview */}
        {isLoadingStats ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <span className="text-xs text-slate-400 block">Analisando registros locais PJ...</span>
          </div>
        ) : stats ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-slate-300">Resumo dos Registros Empresariais:</span>
              <span className="text-indigo-400 font-mono">
                {stats.alreadyImported ? 'Status: Já Importado' : 'Pronto para Importar'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.accounts}</span>
                <span className="text-[10px] text-slate-400">Contas PJ</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.transactions}</span>
                <span className="text-[10px] text-slate-400">Movimentações</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.clients}</span>
                <span className="text-[10px] text-slate-400">Clientes</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.suppliers}</span>
                <span className="text-[10px] text-slate-400">Fornecedores</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.projects}</span>
                <span className="text-[10px] text-slate-400">Projetos</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.costCenters}</span>
                <span className="text-[10px] text-slate-400">Centros Custo</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Progress bar during import */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>{progressStep}</span>
              <span className="font-mono text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            disabled={isImporting}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
          >
            Agora não
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={isImporting || !stats?.hasLegacyData || isViewerReadOnly}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 active:scale-98"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importando PJ...</span>
              </>
            ) : (
              <>
                <span>Confirmar Importação PJ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
