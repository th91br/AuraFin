import { useState } from 'react';
import { faqItems } from '../content/faq';
import { 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Building2, 
  ArrowRightLeft, 
  FileText, 
  BarChart3, 
  RefreshCcw, 
  Lock, 
  ChevronDown,
  Sparkles,
  HeartPulse,
  Receipt,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onSelectMode: (mode: 'PF' | 'PJ') => void;
}

export function LandingPage({ onEnterApp, onSelectMode }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [demoMode, setDemoMode] = useState<'PF' | 'PJ'>('PF');

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleStartDemo = (mode: 'PF' | 'PJ') => {
    onSelectMode(mode);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterApp}>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 shadow-xs">
              A
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">AURAFIN</span>
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-widest -mt-1">
                Plataforma Híbrida PF + PJ
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold text-slate-400">
            <a href="#solucao" className="hover:text-white transition-colors">A Solução</a>
            <a href="#modos" className="hover:text-white transition-colors">Modos PF / PJ</a>
            <a href="#conciliacao" className="hover:text-white transition-colors">Motor de Conciliação</a>
            <a href="#seguranca" className="hover:text-white transition-colors">Segurança</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <button
            onClick={onEnterApp}
            className="tactile-button flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl shadow-xs text-xs"
          >
            <span>Acessar Plataforma</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section (Stripe & Linear Ambient Glow Style) */}
      <section className="relative pt-20 pb-24 border-b border-white/[0.06] overflow-hidden">
        {/* Background Ambient Radial Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-sky-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center space-y-7 relative z-10">
          
          {/* Badge Pill with Subtle Glowing Border */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] text-slate-300 text-xs font-semibold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fim da Confusão Patrimonial para Profissionais PJ</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.08]">
            A Plataforma Financeira Híbrida que <span className="text-cyan-300">Separa e Conecta</span> sua Vida e sua Empresa.
          </h1>

          {/* Subheadline */}
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Garanta a separação jurídica do caixa corporativo enquanto sincroniza pró-labore, investimentos e realiza <strong className="text-slate-200 font-semibold">reembolsos ao sócio em 1 clique</strong> com conformidade fiscal.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={() => handleStartDemo('PJ')}
              className="tactile-button w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2.5"
            >
              <Building2 className="w-4 h-4 text-slate-800" />
              <span>Experimentar Modo PJ (Empresa)</span>
            </button>

            <button
              onClick={() => handleStartDemo('PF')}
              className="tactile-button w-full sm:w-auto px-7 py-3.5 bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2.5 border border-white/[0.12]"
            >
              <User className="w-4 h-4 text-indigo-400" />
              <span>Experimentar Modo PF (Vida)</span>
            </button>
          </div>

          {/* Product Preview Card */}
          <div className="pt-10 max-w-5xl mx-auto" id="modos">
            <div className="bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-3xl border border-white/[0.1] shadow-2xl relative glow-card">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-slate-950/80 rounded-t-2xl">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" />
                  <span className="text-[11px] text-slate-500 ml-2 font-mono font-medium">aurafin.app</span>
                </div>

                {/* Preview Switcher */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => setDemoMode('PF')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      demoMode === 'PF' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visão PF (Pessoal)
                  </button>
                  <button
                    onClick={() => setDemoMode('PJ')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                      demoMode === 'PJ' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visão PJ (Empresa)
                  </button>
                </div>
              </div>

              {/* Dynamic Preview Container */}
              <div className={`p-7 rounded-b-2xl transition-colors duration-300 text-left ${
                demoMode === 'PF' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
              }`}>
                {demoMode === 'PF' ? (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-200/80 pb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-indigo-700 tracking-wider">Modo Pessoa Física</span>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">Seu Momento & Orçamento Pessoal</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg tabular-nums">
                        Disponível: —
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Patrimônio Líquido</p>
                        <h4 className="text-2xl font-extrabold text-slate-950 mt-1 tabular-nums">Nenhum dado disponível</h4>
                        <p className="text-xs text-emerald-700 mt-1 font-medium">Os dados reais aparecem após autenticação.</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Reserva de Emergência</p>
                        <h4 className="text-2xl font-extrabold text-slate-950 mt-1 tabular-nums">Nenhum dado disponível</h4>
                        <p className="text-xs text-slate-500 mt-1">Configure sua reserva após entrar.</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                        <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Pré-IRPF Dedutível</p>
                        <h4 className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums">Nenhum dado disponível</h4>
                        <p className="text-xs text-slate-500 mt-1">Registre despesas dedutíveis após entrar.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
                      <div>
                        <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Modo Pessoa Jurídica</span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Dashboard Gerencial Executivo</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1.5 bg-slate-900 text-slate-200 border border-white/[0.1] rounded-lg tabular-nums">
                        Caixa Operacional: —
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-mono-numbers">
                      <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/[0.08]">
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">DRE Líquido (Mês)</p>
                        <h4 className="text-2xl font-extrabold text-emerald-400 mt-1 tabular-nums">Nenhum dado disponível</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium font-sans">Indicadores reais após autenticação.</p>
                      </div>
                      <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/[0.08]">
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Ponto de Equilíbrio</p>
                        <h4 className="text-2xl font-extrabold text-slate-100 mt-1 tabular-nums">Nenhum dado disponível</h4>
                        <p className="text-xs text-slate-400 mt-1 font-sans">Cálculo real após autenticação.</p>
                      </div>
                      <div className="bg-slate-900/90 p-5 rounded-2xl border border-white/[0.08]">
                        <p className="text-[11px] text-amber-400 uppercase font-bold tracking-wider">Aporte Sócio Pendente</p>
                        <h4 className="text-2xl font-extrabold text-white mt-1 tabular-nums">Nenhum dado disponível</h4>
                        <p className="text-xs text-amber-400 mt-1 font-bold font-sans">Pendências reais após autenticação.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Problem & Solution Bento Grid */}
      <section id="solucao" className="py-24 border-b border-white/[0.06] bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3.5 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Os 6 Maiores Desafios do Profissional PJ no Brasil.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Entenda como o AuraFin elimina o caos financeiro e contábil entre você e sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3.5 glow-card">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit border border-indigo-500/20">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">1. Mistura Patrimonial</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Pagar compras pessoais no cartão corporativo ou usar dinheiro do bolso para contas da empresa quebra o Princípio da Entidade e gera riscos com o Fisco.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3.5 glow-card">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl w-fit border border-sky-500/20">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">2. Reembolsos Esquecidos</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Aportes do sócio para a empresa não registrados viram prejuízo pessoal sem o ressarcimento estruturado e sem comprovantes.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3.5 glow-card">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit border border-emerald-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">3. Pró-labore Caótico</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Falta de clareza entre o que é remuneração do sócio (tributada), distribuição isenta de lucros e custos operacionais da empresa.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3.5 glow-card">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit border border-amber-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">4. Falta de Previsibilidade</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Sem calcular o Ponto de Equilíbrio e o Runway de caixa, a empresa corre riscos de liquidez nos meses de menor faturamento.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3.5 glow-card">
              <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl w-fit border border-rose-500/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">5. Perda de Deduções no IRPF</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Comprovantes médicos e de educação da Pessoa Física perdidos ao longo do ano aumentam desnecessariamente o imposto a pagar no IRPF.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3.5 glow-card">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit border border-purple-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">6. Fechamento Contábil Difícil</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Extratos desorganizados enviados de última hora para o contador geram retrabalho, multas e inconsistências no Simples Nacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cross Reconciliation Engine */}
      <section id="conciliacao" className="py-24 border-b border-white/[0.06] bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Tecnologia de Conciliação Cruzada</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Motor de Reconciliação em 1 Clique.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              O AuraFin cria uma ponte inteligente entre as esferas pessoal e jurídica sem violar a legislação contábil.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/[0.08] flex items-start space-x-4">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl mt-0.5 border border-indigo-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Uso Pessoal na PJ</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Gera automaticamente um lançamento espelhado de Pró-labore/Retirada no caixa da Pessoa Física.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/[0.08] flex items-start space-x-4">
                <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl mt-0.5 border border-sky-500/20">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">Despesa da PJ paga via PF</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Alimenta o contador de Aporte Reembolsável com botão de acerto de contas instantâneo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/80 p-7 rounded-3xl border border-white/[0.1] space-y-6 shadow-2xl glow-card">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <RefreshCcw className="w-4 h-4 text-indigo-400" />
              <span>Simulação da Conciliação em Tempo Real</span>
            </h3>

            <div className="space-y-3 font-mono-numbers text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>ORIGEM: Conta PJ</span>
                  <span className="text-amber-400 font-bold font-sans">Uso Pessoal Identificado</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm tabular-nums">
                  <span className="font-sans">Licença Software Pessoal</span>
                  <span>—</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-2 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/30 shadow-xs">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-white/[0.06] space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>DESTINO: Extrato PF</span>
                  <span className="text-emerald-400 font-bold font-sans">Retirada de Pró-labore</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm tabular-nums">
                  <span className="font-sans">Pró-labore (Ajuste de Conta)</span>
                  <span>—</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Supabase Section */}
      <section id="seguranca" className="py-24 border-b border-white/[0.06] bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-3.5 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Privacidade & Controle</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              Arquitetura Supabase segura e isolada por usuário.
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Seus dados financeiros ficam no Supabase com RLS e isolamento por usuário/organização; o navegador recebe somente o necessário para a tela atual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3 glow-card">
              <Lock className="w-6 h-6 text-indigo-400 mb-1" />
              <h3 className="text-base font-bold text-white">Zero Vazamento de Dados</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Toda a persistência financeira usa Supabase, autenticação e políticas RLS; o modo demo local é exclusivo para desenvolvimento explícito.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3 glow-card">
              <FileText className="w-6 h-6 text-sky-400 mb-1" />
              <h3 className="text-base font-bold text-white">Pacote Fiscal JSON & OFX</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Exporte todo o fechamento do mês auditado em 1 clique para enviar direto para a sua contabilidade.
              </p>
            </div>

            <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/[0.08] space-y-3 glow-card">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-1" />
              <h3 className="text-base font-bold text-white">Trilha de Auditoria</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Histórico completo de compensações entre sócio e empresa preparado para demonstrar conformidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-b border-white/[0.06] bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3.5">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Tudo o que você precisa saber sobre o funcionamento do AuraFin.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-white/[0.08] rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-white text-sm sm:text-base hover:text-indigo-200 transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${activeFaq === i ? 'transform rotate-180 text-white' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-5 pb-5 text-slate-400 text-xs sm:text-sm leading-relaxed border-t border-white/[0.06] pt-3.5">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <section className="py-20 bg-slate-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/20 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 space-y-7 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Pronto para Organizar sua Vida e Sua Empresa?
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Experimente o AuraFin agora mesmo sem necessidade de cadastro complexo.
          </p>
          <button
            onClick={onEnterApp}
            className="tactile-button px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-base rounded-xl shadow-lg inline-flex items-center space-x-2.5"
          >
            <span>Acessar a plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-slate-500">Acesso seguro • Dados isolados • Supabase</p>
        </div>
      </section>

    </div>
  );
}
