import { FAQItem } from '../types';

export const faqItems: FAQItem[] = [
  {
    question: 'O que é a Confusão Patrimonial e como o AuraFin me protege?',
    answer: 'A confusão patrimonial ocorre quando gastos da pessoa física e da empresa se misturam. O AuraFin separa os ambientes PF e PJ e mantém um motor de conciliação com autorização explícita.',
  },
  {
    question: 'Como funciona o Reembolso ao Sócio em 1 clique?',
    answer: 'Quando você registra uma despesa PJ paga pela PF, o AuraFin identifica o vínculo e permite iniciar o acerto com os dados da organização ativa.',
  },
  {
    question: 'Meus dados financeiros ficam salvos na nuvem?',
    answer: 'Os dados financeiros autenticados são lidos do Supabase com RLS e isolamento por usuário/organização. Nenhum dado financeiro é fabricado no navegador.',
  },
  {
    question: 'Como o AuraFin ajuda no IRPF e no fechamento da Contabilidade?',
    answer: 'Os relatórios usam os agregados e exportações server-side disponíveis para a sessão autenticada.',
  },
  {
    question: 'Como funciona o cálculo do Runway e do Break-even?',
    answer: 'Os indicadores são calculados a partir dos agregados financeiros reais retornados pelo Supabase.',
  },
];
