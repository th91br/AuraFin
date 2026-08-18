import React, { ErrorInfo, ReactNode } from 'react';
import { AuraLogger } from '../../lib/logger';
import { generateSupportReference } from '../../lib/telemetry';
import { ShieldAlert, RefreshCw, Home, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  moduleName?: string;
  isAreaBoundary?: boolean;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  supportReference: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      supportReference: '',
    };
  }

  public static getDerivedStateFromError(_: Error): Partial<State> {
    return {
      hasError: true,
      supportReference: generateSupportReference(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    AuraLogger.fatal('Exceção de renderização capturada pelo ErrorBoundary', {
      module: this.props.moduleName || 'react_boundary',
      event: 'render_crash',
      support_reference: this.state.supportReference,
      error_name: error.name,
      component_stack: errorInfo.componentStack ? errorInfo.componentStack.slice(0, 500) : undefined,
    });
  }

  private handleRetry = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, supportReference: '' });
  };

  private handleReloadApp = () => {
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      const { fallbackTitle, fallbackSubtitle, isAreaBoundary } = this.props;

      // Area-level boundary fallback (compact card within the view)
      if (isAreaBoundary) {
        return (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-4 text-center my-4 animate-in fade-in duration-200">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100">
                {fallbackTitle || 'Não foi possível carregar este módulo'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {fallbackSubtitle || 'Ocorreu uma instabilidade transitória na exibição desta seção.'}
              </p>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
              <span>Referência:</span>
              <span className="text-cyan-400 font-bold">{this.state.supportReference}</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all inline-flex items-center space-x-1.5 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          </div>
        );
      }

      // Global App-level boundary fallback (full page recovery)
      return (
        <div
          className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner shadow-rose-500/10">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {fallbackTitle || 'Instabilidade no Carregamento'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {fallbackSubtitle || 'Encontramos um erro inesperado ao renderizar esta tela. Seus dados financeiros estão seguros no banco de dados.'}
              </p>
            </div>

            {/* Support Reference */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-center">
              <span className="text-[11px] text-slate-500 block">Código do Incidente para Suporte:</span>
              <span className="text-sm font-mono font-bold text-cyan-400 tracking-wider">
                {this.state.supportReference}
              </span>
            </div>

            {/* Recovery Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aplicação</span>
              </button>

              <button
                type="button"
                onClick={this.handleReloadApp}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center space-x-1 font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Voltar à Página Inicial</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
