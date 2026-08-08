import { CalendarEvent, Transaction, Asset, Project, Defaulter, BudgetItem, FAQItem } from './types';

export const pjEvents: CalendarEvent[] = [
  { id: '1', title: 'Alinhamento Trimestral de Metas', time: '09:00', duration: '1h', type: 'PJ', status: 'scheduled', client: 'Acme Corp' },
  { id: '2', title: 'Entrega Sprint Consultoria API', time: '10:30', duration: '2h', type: 'PJ', value: 3500, status: 'action_required', client: 'TechFlow Ltda' },
  { id: '3', title: 'Bloqueio Agenda (Compromisso PF)', time: '13:00', duration: '1h 30m', type: 'BLOCKED', status: 'scheduled' },
  { id: '4', title: 'Sessão Mentoria UX e Arquitetura', time: '15:00', duration: '1h', type: 'PJ', value: 850, status: 'scheduled', client: 'Nexus Tech' },
];

export const pfEvents: CalendarEvent[] = [
  { id: '5', title: 'Agenda Reservada (Foco Empresa)', time: '09:00', duration: '3h 30m', type: 'BLOCKED', status: 'scheduled' },
  { id: '6', title: 'Consulta Médica de Rotina', time: '13:00', duration: '1h 30m', type: 'PF', status: 'scheduled' },
  { id: '7', title: 'Agenda Reservada (Foco Empresa)', time: '15:00', duration: '3h', type: 'BLOCKED', status: 'scheduled' },
  { id: '8', title: 'Treino Funcional', time: '18:30', duration: '1h', type: 'PF', status: 'scheduled' },
];

const now = Date.now();
const oneHour = 3600000;
const oneDay = 86400000;

export const initialTransactions: Transaction[] = [
  { id: 't1', title: 'Pró-labore Mensal Oficial', amount: 12000, type: 'income', date: 'Hoje, 09:40', context: 'PF', category: 'salario_prolabore', timestamp: now - oneHour * 2 },
  { id: 't2', title: 'Supermercado Mensal', amount: 1420.45, type: 'expense', date: 'Ontem, 18:20', context: 'PF', category: 'alimentacao', timestamp: now - oneDay },
  { id: 't3', title: 'Plano de Saúde Familiar (Amil)', amount: 1850.00, type: 'expense', date: 'Há 3 dias', context: 'PF', category: 'saude', isTaxDeductiblePF: true, taxDeductionCategory: 'saude', timestamp: now - oneDay * 3 },
  { id: 't4', title: 'Mensalidade Pós-Graduação', amount: 980.00, type: 'expense', date: 'Há 5 dias', context: 'PF', category: 'educacao', isTaxDeductiblePF: true, taxDeductionCategory: 'educacao', timestamp: now - oneDay * 5 },
  { id: 't5', title: 'Aporte Tesouro Selic 2029', amount: 2500.00, type: 'expense', date: 'Há 6 dias', context: 'PF', category: 'investimento', timestamp: now - oneDay * 6 },
  
  { id: 't6', title: 'Fatura TechFlow Ltda - Projeto Mobile', amount: 18500, type: 'income', date: 'Hoje, 09:41', context: 'PJ', category: 'freelance_consultoria', timestamp: now - oneHour * 3 },
  { id: 't7', title: 'Servidores AWS & Cloudflare', amount: 642.10, type: 'expense', date: 'Ontem, 18:20', context: 'PJ', category: 'software_infra', timestamp: now - oneDay },
  { id: 't8', title: 'Compras Pessoais (Uso Pessoal na Empresa)', amount: 320.00, type: 'expense', date: 'Há 2 dias', context: 'PJ', category: 'outros', isPersonalExpenseInPJ: true, timestamp: now - oneDay * 2 },
  { id: 't9', title: 'Licença Adobe Creative Cloud (Pago via Cartão PF)', amount: 280.00, type: 'expense', date: 'Há 2 dias', context: 'PJ', category: 'software_infra', isPaidByPF: true, timestamp: now - oneDay * 2 },
  { id: 't10', title: 'Contabilidade Mensal (Simples Nacional)', amount: 450.00, type: 'expense', date: 'Há 4 dias', context: 'PJ', category: 'equipe_terceiros', timestamp: now - oneDay * 4 },
];

export const initialAssets: Asset[] = [
  { id: 'a1', name: 'Reserva de Emergência (CBD 100% CDI)', category: 'renda_fixa', value: 28500, purchaseDate: '2025-01-10', notes: 'Liquidez diária para segurança pessoal' },
  { id: 'a2', name: 'Apartamento Residencial', category: 'imovel', value: 450000, purchaseDate: '2022-04-15', notes: 'Imóvel próprio avaliado pela região' },
  { id: 'a3', name: 'SUV Familiar 2024', category: 'veiculo', value: 92000, purchaseDate: '2024-03-20', notes: 'Tabela FIPE atualizada' },
  { id: 'a4', name: 'Carteira Ações e ETFs', category: 'acoes', value: 34200, purchaseDate: '2023-08-01', notes: 'Foco em dividendos e valorização' },
];

export const initialProjects: Project[] = [
  { id: 'p1', name: 'Redesign e Arquitetura App Cliente X', client: 'Acme Corp', revenue: 24000, cost: 6500, status: 'em_andamento', deadline: '30/08/2026' },
  { id: 'p2', name: 'Consultoria Backend & DevOps Mensal', client: 'TechFlow Ltda', revenue: 12500, cost: 1200, status: 'em_andamento', deadline: 'Contrato Recorrente' },
  { id: 'p3', name: 'Auditoria de Segurança da Informação', client: 'Startup Z', revenue: 9800, cost: 2100, status: 'concluido', deadline: '15/07/2026' },
];

export const initialDefaulters: Defaulter[] = [
  { id: 'd1', client: 'Empresa Y Tecnologia', amount: 4800, dueDate: '25/07/2026', daysLate: 13, contactEmail: 'financeiro@empresay.com.br', contactPhone: '(11) 98765-4321', status: 'notificado' },
  { id: 'd2', client: 'Startup Z Digital', amount: 2300, dueDate: '01/08/2026', daysLate: 6, contactEmail: 'contato@startupz.io', contactPhone: '(11) 91234-5678', status: 'pendente' },
];

export const initialBudgetItems: BudgetItem[] = [
  { id: 'b1', category: 'moradia', label: 'Moradia & Contas Fixas', allocated: 3500, spent: 3100 },
  { id: 'b2', category: 'alimentacao', label: 'Alimentação & Mercado', allocated: 2000, spent: 1420.45 },
  { id: 'b3', category: 'saude', label: 'Saúde & Bem-Estar', allocated: 1200, spent: 1850 },
  { id: 'b4', category: 'transporte', label: 'Transporte & Veículo', allocated: 800, spent: 540 },
  { id: 'b5', category: 'educacao', label: 'Educação & Cursos', allocated: 1000, spent: 980 },
  { id: 'b6', category: 'lazer_viagens', label: 'Lazer & Experiências', allocated: 1500, spent: 920 },
  { id: 'b7', category: 'investimento', label: 'Aportes & Futuro', allocated: 3000, spent: 2500 },
];

export const faqItems: FAQItem[] = [
  {
    question: 'Como o AuraFin evita a confusão patrimonial entre minha empresa e minha vida pessoal?',
    answer: 'O AuraFin separa juridicamente as contas da Pessoa Física (PF) e da Pessoa Jurídica (PJ). Toda movimentação feita no cartão ou conta da empresa para fins pessoais é auditada e categorizada como Antecipação de Pró-labore/Lucro. Da mesma forma, quando você usa seu dinheiro pessoal para pagar uma conta da empresa, o sistema registra um saldo de reembolso para que a PJ devolva esse valor ao sócio em 1 clique.',
  },
  {
    question: 'Os meus dados financeiros ficam salvos em servidores de terceiros ou na nuvem?',
    answer: 'Não. O AuraFin adota uma arquitetura 100% Local-First. Todos os seus dados, históricos de lançamentos, faturas e registros contábeis são armazenados de forma criptografada diretamente no seu próprio navegador via LocalStorage. Você tem total privacidade e controle sobre as suas informações.',
  },
  {
    question: 'Como funciona a exportação do Pacote Fiscal para a minha contabilidade?',
    answer: 'No final de cada mês, você pode acessar a Central do Contador na aba PJ e exportar um Pacote Fiscal completo no formato .JSON ou .OFX. Esse arquivo traz todas as notas emitidas, despesas operacionais auditadas, deduções de pró-labore e comprovantes prontos para envio ao seu contador.',
  },
  {
    question: 'Posso utilizar o AuraFin tanto no computador desktop quanto no celular?',
    answer: 'Sim! A interface é 100% responsiva, adaptada para telas de computador, tablets e smartphones, permitindo que você alterne facilmente entre a visão pessoal e gerencial a qualquer momento.',
  },
  {
    question: 'Qual a diferença visual entre o Modo PF e o Modo PJ no aplicativo?',
    answer: 'O Modo PF possui uma atmosfera leve, serena e acolhedora em tons de Indigo e Emerald, focada no seu patrimônio e orçamento familiar. O Modo PJ possui uma estética executiva e analítica em tons de Slate escuro e Cyan, focada em caixa operacional, DRE gerencial, margem por projeto e inadimplência.',
  },
];
