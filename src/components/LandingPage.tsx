import { useState } from 'react';
import { faqItems } from '../data';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-slate-700 selection:text-white">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterApp}>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shadow-sm">
              A
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">AURAFIN</span>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest -mt-1">
                Plataforma Híbrida PF + PJ
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#solucao" className="hover:text-white transition-colors">A Solução</a>
            <a href="#modos" className="hover:text-white transition-colors">Modos PF / PJ</a>
            <a href="#conciliacao" className="hover:text-white transition-colors">Motor de Conciliação</a>
            <a href="#seguranca" className="hover:text-white transition-colors">Segurança</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <button
            onClick={onEnterApp}
            className="flex items-center space-x-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-sm text-sm"
          >
            <span>Acessar Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section (Editorial Fintech SaaS Look) */}
      <section className="relative pt-20 pb-24 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8 relative z-10">
          
          {/* Matte Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold tracking-wider">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span>Fim da Confusão Patrimonial para Profissionais PJ</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-none">
            A Plataforma Financeira Híbrida que <span className="text-slate-300 underline decoration-slate-600 underline-offset-8">Separa e Conecta</span> sua Vida Pessoal e sua Empresa.
          </h1>

          {/* Subheadline */}
          <p className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Garanta a separação jurídica do seu caixa corporativo enquanto sincroniza pró-labore, investimentos e realiza <strong className="text-white">reembolsos ao sócio em 1 clique</strong>.
          </p>

          {/* CTA Group (Matte Buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleStartDemo('PJ')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <Building2 className="w-5 h-5 text-slate-700" />
              <span>Experimentar Modo PJ (Empresa)</span>
            </button>

            <button
              onClick={() => handleStartDemo('PF')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-850 text-white font-bold text-base rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 border border-slate-800"
            >
              <User className="w-5 h-5 text-indigo-400" />
              <span>Experimentar Modo PF (Vida)</span>
            </button>
          </div>

          {/* Product Preview Card */}
          <div className="pt-12 max-w-5xl mx-auto">
            <div className="bg-slate-900 p-3 rounded-3xl border border-slate-800 shadow-2xl relative">
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950 rounded-t-2xl">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">aurafin.app</span>
                </div>

                {/* Preview Switcher */}
                <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setDemoMode('PF')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                      demoMode === 'PF' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visão PF (Pessoal)
                  </button>
                  <button
                    onClick={() => setDemoMode('PJ')}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                      demoMode === 'PJ' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visão PJ (Empresa)
                  </button>
                </div>
              </div>

              {/* Dynamic Preview Container */}
              <div className={`p-8 rounded-b-2xl transition-colors duration-300 text-left ${
                demoMode === 'PF' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
              }`}>
                {demoMode === 'PF' ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-indigo-700 tracking-wider">Modo Pessoa Física</span>
                        <h3 className="text-2xl font-bold text-slate-900">Seu Momento & Orçamento Pessoal</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg">
                        Disponível: R$ 7.052,45
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase font-bold">Patrimônio Líquido</p>
                        <h4 className="text-2xl font-extrabold text-slate-900 mt-1">R$ 611.700,00</h4>
                        <p className="text-xs text-emerald-700 mt-1 font-medium">Imóvel + Veículo FIPE + Renda Fixa</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase font-bold">Reserva de Emergência</p>
                        <h4 className="text-2xl font-extrabold text-indigo-900 mt-1">95% Concluída</h4>
                        <p className="text-xs text-slate-500 mt-1">6 meses de vida cobertos</p>
                      </div>
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-xs text-slate-500 uppercase font-bold">Pré-IRPF Dedutível</p>
                        <h4 className="text-2xl font-extrabold text-emerald-800 mt-1">R$ 2.830,00</h4>
                        <p className="text-xs text-slate-500 mt-1">Saúde & Educação registradas</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Modo Pessoa Jurídica</span>
                        <h3 className="text-2xl font-bold text-white">Dashboard Gerencial Executivo</h3>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-slate-900 text-slate-200 border border-slate-800 rounded-lg">
                        Caixa Operacional: R$ 35.000,00
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400 uppercase font-bold">DRE Líquido (Mês)</p>
                        <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">R$ 13.358,00</h4>
                        <p className="text-xs text-slate-400 mt-1 font-medium">Margem Líquida de 72%</p>
                      </div>
                      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400 uppercase font-bold">Ponto de Equilíbrio</p>
                        <h4 className="text-2xl font-extrabold text-slate-200 mt-1">123% Atingido</h4>
                        <p className="text-xs text-slate-400 mt-1">Custos fixos cobertos</p>
                      </div>
                      <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
                        <p className="text-xs text-amber-400 uppercase font-bold">Aporte Sócio Pendente</p>
                        <h4 className="text-2xl font-extrabold text-white mt-1">R$ 280,00</h4>
                        <p className="text-xs text-amber-400 mt-1 font-bold">Reembolso 1 clique pronto</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Problem & Solution Section */}
      <section id="solucao" className="py-24 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Os 6 Maiores Desafios do Profissional PJ no Brasil.
            </h2>
            <p className="text-slate-400 text-lg">
              Entenda como o AuraFin elimina o caos financeiro e contábil entre você e sua empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="p-3 bg-slate-800 text-slate-200 rounded-xl w-fit border border-slate-700">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">1. Mistura Patrimonial</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pagar compras pessoais no cartão corporativo ou usar dinheiro do bolso para contas da empresa quebra o Princípio da Entidade.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="p-3 bg-slate-800 text-slate-200 rounded-xl w-fit border border-slate-700">
                <RefreshCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">2. Reembolsos Esquecidos</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Aportes do sócio para a empresa não registrados viram prejuízo pessoal sem o ressarcimento correto.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="p-3 bg-slate-800 text-slate-200 rounded-xl w-fit border border-slate-700">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">3. Pró-labore Caótico</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Falta de clareza entre o que é salário do sócio, distribuição de lucros e custos operacionais da firma.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="p-3 bg-slate-800 text-slate-200 rounded-xl w-fit border border-slate-700">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">4. Falta de Previsibilidade</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sem calcular o Ponto de Equilíbrio e o Runway de caixa, a empresa corre riscos de liquidez nos meses fracos.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="p-3 bg-slate-800 text-slate-200 rounded-xl w-fit border border-slate-700">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">5. Perda de Deduções no IRPF</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Comprovantes médicos e de educação da Pessoa Física perdidos ao longo do ano aumentam o imposto a pagar na declaração.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-colors">
              <div className="p-3 bg-slate-800 text-slate-200 rounded-xl w-fit border border-slate-700">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">6. Fechamento Contábil Ruim</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Extratos desorganizados enviados de última hora para a contabilidade geram multas e inconsistências fiscais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cross Reconciliation Engine */}
      <section id="conciliacao" className="py-24 border-b border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Tecnologia de Conciliação Cruzada</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Motor de Reconciliação em 1 Clique.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              O AuraFin cria uma ponte inteligente entre as duas esferas sem violar a lei fiscal.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-4">
                <div className="p-2 bg-slate-800 text-white rounded-lg mt-0.5 border border-slate-700">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Uso Pessoal na PJ</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Gera automaticamente um lançamento espelhado de Pró-labore/Retirada no caixa da Pessoa Física.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-start space-x-4">
                <div className="p-2 bg-slate-800 text-white rounded-lg mt-0.5 border border-slate-700">
                  <Building2 className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Despesa da PJ paga via PF</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Alimenta o contador de Aporte Reembolsável com botão de acerto de contas instantâneo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <RefreshCcw className="w-5 h-5 text-slate-300" />
              <span>Simulação da Conciliação em Tempo Real</span>
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>ORIGEM: Conta PJ</span>
                  <span className="text-amber-400 font-bold">Uso Pessoal Identificado</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm">
                  <span>Licença Software Pessoal</span>
                  <span>- R$ 280,00</span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="p-2 bg-slate-800 text-white rounded-full border border-slate-700 shadow-sm">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>DESTINO: Extrato PF</span>
                  <span className="text-emerald-400 font-bold">Retirada de Pró-labore</span>
                </div>
                <div className="flex justify-between text-white font-bold text-sm">
                  <span>Pró-labore (Ajuste de Conta)</span>
                  <span>+ R$ 280,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Local-First Section */}
      <section id="seguranca" className="py-24 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Privacidade & Controle</span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              Arquitetura 100% Local-First e Criptografada.
            </h2>
            <p className="text-slate-400 text-lg">
              Seus dados financeiros não ficam salvos em servidores de terceiros. Processamento total no seu próprio navegador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-3">
              <Lock className="w-8 h-8 text-slate-300 mb-2" />
              <h3 className="text-lg font-bold text-white">Zero Vazamento de Dados</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Toda a persistência roda via LocalStorage criptografado localmente no seu dispositivo.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-3">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <h3 className="text-lg font-bold text-white">Pacote Fiscal JSON & OFX</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Exporte todo o fechamento do mês auditado em 1 clique para enviar direto para a sua contabilidade.
              </p>
            </div>

            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 space-y-3">
              <ShieldCheck className="w-8 h-8 text-slate-300 mb-2" />
              <h3 className="text-lg font-bold text-white">Trilha de Auditoria</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Histórico completo de compensações entre sócio e empresa preparado para o Simples Nacional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 border-b border-slate-800 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="text-slate-400 text-base">
              Tudo o que você precisa saber sobre o funcionamento do AuraFin.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div
                key={i}
                className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-white text-base hover:text-slate-300 transition-colors"
                >
                  <span>{item.question}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'transform rotate-180 text-white' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-slate-800 pt-4 animate-in fade-in duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Footer */}
      <section className="py-20 bg-slate-950 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Pronto para Organizar sua Vida e Sua Empresa?
          </h2>
          <p className="text-slate-400 text-lg">
            Experimente o AuraFin agora mesmo sem necessidade de cadastro complexo.
          </p>
          <button
            onClick={onEnterApp}
            className="px-10 py-5 bg-white text-slate-950 font-black text-lg rounded-xl hover:bg-slate-100 transition-all shadow-md inline-flex items-center space-x-3"
          >
            <span>Entrar na Plataforma Demonstrativa</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-xs text-slate-500">100% Gratuito • Processamento Local • Seguro</p>
        </div>
      </section>

    </div>
  );
}
