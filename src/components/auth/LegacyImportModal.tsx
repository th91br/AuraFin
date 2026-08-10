import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LegacyImportService, ImportPreviewStats } from '../../services/migration/legacyImportService';
import { Database, CheckCircle2, AlertTriangle, ArrowRight, X, Loader2, HardDriveUpload } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LegacyImportModal({ isOpen, onClose, onSuccess }: Props) {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<ImportPreviewStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      setIsLoadingStats(true);
      setErrorMsg(null);
      LegacyImportService.previewImport(user.id)
        .then(res => setStats(res))
        .catch(err => console.error('[LegacyImportModal] Erro ao carregar preview:', err))
        .finally(() => setIsLoadingStats(false));
    }
  }, [isOpen, isAuthenticated, user]);

  if (!isOpen || !isAuthenticated || !user) return null;

  const handleConfirmImport = async () => {
    setIsImporting(true);
    setErrorMsg(null);
    try {
      await LegacyImportService.executeImport(user.id, (step, percent) => {
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
      setErrorMsg(err.message || 'Falha durante a migração dos dados legados.');
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <HardDriveUpload className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 rounded-full inline-flex items-center space-x-1.5">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>Assistente de Migração PF</span>
          </span>
          <h2 className="text-2xl font-black tracking-tight pt-1">
            Importar Dados deste Dispositivo?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            Encontramos registros financeiros salvos localmente neste navegador. Deseja importá-los com segurança e idempotência para sua conta no Supabase?
          </p>
        </div>

        {/* Warning Alert */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Aviso de Privacidade do Dispositivo:</span>
            <span className="text-[11px] text-amber-300/80 leading-relaxed block">
              Confirme se estes dados realmente pertencem a você. Os dados locais serão vinculados à sua conta autenticada sem apagar seu backup local.
            </span>
          </div>
        </div>

        {/* Stats Preview */}
        {isLoadingStats ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
            <span className="text-xs text-slate-400 block">Analisando registros locais...</span>
          </div>
        ) : stats ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-slate-300">Resumo dos Registros Encontrados:</span>
              <span className="text-cyan-400 font-mono">
                {stats.alreadyImported ? 'Status: Já Importado' : 'Pronto para Importar'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.accounts}</span>
                <span className="text-[10px] text-slate-400">Contas</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.transactions}</span>
                <span className="text-[10px] text-slate-400">Transações</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.creditCards}</span>
                <span className="text-[10px] text-slate-400">Cartões</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.goals}</span>
                <span className="text-[10px] text-slate-400">Metas</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.debts}</span>
                <span className="text-[10px] text-slate-400">Dívidas</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2">
                <span className="block font-black text-white">{stats.counts.assets}</span>
                <span className="text-[10px] text-slate-400">Patrimônio</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Progress bar during import */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>{progressStep}</span>
              <span className="font-mono text-cyan-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div 
                className="bg-cyan-500 h-full transition-all duration-300 rounded-full"
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
            disabled={isImporting || !stats?.hasLegacyData}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 active:scale-98"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importando...</span>
              </>
            ) : (
              <>
                <span>Confirmar Importação</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
