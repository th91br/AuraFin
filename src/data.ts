import { 
  Transaction, 
  Asset, 
  Project, 
  Defaulter, 
  BudgetItem, 
  CalendarEvent, 
  FAQItem,
  Account,
  CreditCard,
  Goal,
  Debt,
  Customer,
  Supplier,
  CostCenter
} from './types';

export const initialTransactions: Transaction[] = [
  // --- MODO PF ---
  {
    id: 'pf_tx_1',
    context: 'PF',
    type: 'income',
    title: 'Pró-labore AuraFin Julho',
    amount: 8500,
    amountCents: 850000,
    date: '2026-08-01',
    category: 'salario_prolabore',
    subCategory: 'Pró-labore mensal',
    accountId: 'acc_pf_1',
    crossContextId: 'cross_prolabore_julho',
  },
  {
    id: 'pf_tx_2',
    context: 'PF',
    type: 'expense',
    title: 'Plano de Saúde Unimed',
    amount: 1250,
    amountCents: 125000,
    date: '2026-08-03',
    category: 'saude',
    subCategory: 'Plano Familiar',
    accountId: 'acc_pf_1',
    isTaxDeductiblePF: true,
    taxDeductionCategory: 'saude',
  },
  {
    id: 'pf_tx_3',
    context: 'PF',
    type: 'expense',
    title: 'Supermercado Pão de Açúcar',
    amount: 1420.50,
    amountCents: 142050,
    date: '2026-08-04',
    category: 'alimentacao',
    subCategory: 'Compras da Semana',
    cardId: 'card_pf_1',
  },
  {
    id: 'pf_tx_4',
    context: 'PF',
    type: 'expense',
    title: 'Curso de Especialização UX/UI',
    amount: 980,
    amountCents: 98000,
    date: '2026-08-05',
    category: 'educacao',
    subCategory: 'Pós-Graduação',
    accountId: 'acc_pf_1',
    isTaxDeductiblePF: true,
    taxDeductionCategory: 'educacao',
  },
  {
    id: 'pf_tx_5',
    context: 'PF',
    type: 'income',
    title: 'Reembolso Aporte Servidor PJ',
    amount: 280,
    amountCents: 28000,
    date: '2026-08-06',
    category: 'outros',
    subCategory: 'Reembolso do Sócio',
    accountId: 'acc_pf_1',
    isPaidByPF: true,
    reimbursed: true,
    linkedTransactionId: 'pj_tx_3',
  },

  // --- MODO PJ ---
  {
    id: 'pj_tx_1',
    context: 'PJ',
    type: 'income',
    title: 'Fatura Contrato Fintech Brasil (Mês 07)',
    amount: 18500,
    amountCents: 1850000,
    date: '2026-08-01',
    category: 'receita_servico',
    subCategory: 'Desenvolvimento Software',
    accountId: 'acc_pj_1',
    clientId: 'cli_1',
    projectId: 'proj_1',
  },
  {
    id: 'pj_tx_2',
    context: 'PJ',
    type: 'expense',
    title: 'Pró-labore Pago ao Sócio Thiago',
    amount: 8500,
    amountCents: 850000,
    date: '2026-08-01',
    category: 'prolabore_pago',
    subCategory: 'Pró-labore mensal',
    accountId: 'acc_pj_1',
    crossContextId: 'cross_prolabore_julho',
  },
  {
    id: 'pj_tx_3',
    context: 'PJ',
    type: 'expense',
    title: 'Licença AWS / Vercel (Pago via Cartão PF)',
    amount: 280,
    amountCents: 28000,
    date: '2026-08-02',
    category: 'software_infra',
    subCategory: 'Infraestrutura Cloud',
    isPaidByPF: true,
    reimbursed: false,
    costCenterId: 'cc_tech',
  },
  {
    id: 'pj_tx_4',
    context: 'PJ',
    type: 'expense',
    title: 'Imposto Simples Nacional (DAS Mês Anterior)',
    amount: 1110,
    amountCents: 111000,
    date: '2026-08-05',
    category: 'impostos',
    subCategory: 'DAS Simples Nacional',
    accountId: 'acc_pj_1',
  },
  {
    id: 'pj_tx_5',
    context: 'PJ',
    type: 'expense',
    title: 'Mercado Pessoal do Sócio (Na conta PJ)',
    amount: 340,
    amountCents: 34000,
    date: '2026-08-06',
    category: 'outros',
    subCategory: 'Retirada Pessoal Ajustada',
    accountId: 'acc_pj_1',
    isPersonalExpenseInPJ: true,
  },
];

export const initialAccounts: Account[] = [
  {
    id: 'acc_pf_1',
    name: 'Conta Corrente Nubank',
    type: 'corrente',
    institution: 'Nubank S.A.',
    balance: 7052.45,
    context: 'PF',
  },
  {
    id: 'acc_pf_2',
    name: 'Reserva Renda Fixa Itaú',
    type: 'investimento',
    institution: 'Itaú Unibanco',
    balance: 28500.00,
    context: 'PF',
  },
  {
    id: 'acc_pj_1',
    name: 'Conta PJ Inter Empresas',
    type: 'corrente',
    institution: 'Banco Inter PJ',
    balance: 35000.00,
    context: 'PJ',
  },
];

export const initialCreditCards: CreditCard[] = [
  {
    id: 'card_pf_1',
    name: 'Cartão Ultravioleta',
    institution: 'Nubank S.A.',
    limitTotal: 18000,
    limitUsed: 3420,
    currentInvoice: 1420.50,
    closingDay: 25,
    dueDay: 5,
    context: 'PF',
    type: 'credito',
    brand: 'Mastercard',
    lastFourDigits: '4554',
  },
  {
    id: 'c_pj1',
    name: 'BTG Pactual Corporate Black',
    institution: 'BTG Pactual',
    limitTotal: 50000,
    limitUsed: 12400,
    currentInvoice: 8500,
    closingDay: 15,
    dueDay: 23,
    context: 'PJ',
    type: 'credito',
    brand: 'Mastercard',
    lastFourDigits: '8842',
    isPrimary: true,
    status: 'ativo',
  },
  {
    id: 'c_pj2',
    name: 'C6 Bank Business Platinum',
    institution: 'C6 Bank',
    limitTotal: 30000,
    limitUsed: 4200,
    currentInvoice: 2100,
    closingDay: 20,
    dueDay: 28,
    context: 'PJ',
    type: 'credito',
    brand: 'Visa',
    lastFourDigits: '4110',
    status: 'ativo',
  },
  {
    id: 'd_pj1',
    name: 'Cartão Débito BTG Empresarial',
    institution: 'BTG Pactual',
    limitTotal: 0,
    limitUsed: 0,
    currentInvoice: 0,
    closingDay: 0,
    dueDay: 0,
    context: 'PJ',
    type: 'debito',
    brand: 'Mastercard',
    lastFourDigits: '9921',
    status: 'ativo',
  },
];

export const initialGoals: Goal[] = [
  {
    id: 'goal_1',
    title: 'Viagem de Férias Europa',
    targetAmount: 25000,
    currentAmount: 18500,
    targetDate: '2026-12-20',
    category: 'viagem',
  },
  {
    id: 'goal_2',
    title: 'Aporte de Capital em Reserva de Emergência',
    targetAmount: 30000,
    currentAmount: 28500,
    targetDate: '2026-10-31',
    category: 'investimento',
  },
];

export const initialDebts: Debt[] = [
  {
    id: 'debt_1',
    title: 'Financiamento Imobiliário Caixa',
    totalBalance: 320000,
    monthlyPayment: 2450,
    remainingInstallments: 180,
    interestRatePct: 8.5,
    dueDate: '2026-08-15',
  },
];

export const initialAssets: Asset[] = [
  {
    id: 'ast_1',
    name: 'Apartamento Residencial Jardins',
    category: 'imovel',
    value: 520000,
    acquisitionDate: '2022-04-10',
    notes: 'Escritura registrada em cartório',
  },
  {
    id: 'ast_2',
    name: 'Jeep Compass Longitude 2024',
    category: 'veiculo',
    value: 135000,
    acquisitionDate: '2024-01-15',
    notes: 'Valor atualizado via Cotação FIPE',
  },
  {
    id: 'ast_3',
    name: 'Tesouro Selic 2029',
    category: 'renda_fixa',
    value: 28500,
    notes: 'Reserva de Emergência Pessoal',
  },
];

export const initialProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'Design System & App Mobile Fintech',
    client: 'Fintech Brasil Ltda',
    revenue: 45000,
    cost: 12000,
    status: 'em_andamento',
    deadline: '2026-09-30',
  },
  {
    id: 'proj_2',
    name: 'Consultoria de Arquitetura de Software',
    client: 'SoftLab Soluções',
    revenue: 18000,
    cost: 3500,
    status: 'concluido',
    deadline: '2026-07-28',
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'cli_1',
    name: 'Fintech Brasil Ltda',
    documentCnpjCpf: '33.444.555/0001-88',
    contactEmail: 'financeiro@fintechbrasil.com.br',
    phone: '(11) 98888-7766',
    totalBilled: 45000,
    totalReceived: 18500,
    totalPending: 26500,
  },
  {
    id: 'cli_2',
    name: 'SoftLab Soluções',
    documentCnpjCpf: '11.222.333/0001-44',
    contactEmail: 'contato@softlab.com.br',
    phone: '(11) 97777-6655',
    totalBilled: 18000,
    totalReceived: 18000,
    totalPending: 0,
  },
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Amazon Web Services Brasil',
    category: 'Infraestrutura Cloud',
    documentCnpj: '15.418.053/0001-29',
    contactEmail: 'billing@aws.amazon.com',
    totalSpent: 3400,
  },
  {
    id: 'sup_2',
    name: 'Figma Inc.',
    category: 'Softwares & Ferramentas',
    documentCnpj: 'N/A (Exterior)',
    contactEmail: 'support@figma.com',
    totalSpent: 960,
  },
];

export const initialCostCenters: CostCenter[] = [
  { id: 'cc_tech', name: 'Tecnologia & Infraestrutura', budgetAllocated: 5000, totalSpent: 2480 },
  { id: 'cc_mkt', name: 'Marketing & Vendas', budgetAllocated: 4000, totalSpent: 1200 },
  { id: 'cc_adm', name: 'Administrativo & Jurídico', budgetAllocated: 3000, totalSpent: 1110 },
];

export const initialDefaulters: Defaulter[] = [
  {
    id: 'def_1',
    client: 'Empresa Alfa Serviços Ltda',
    amount: 4500,
    dueDate: '2026-07-20',
    daysLate: 19,
    contactEmail: 'financeiro@alfa.com.br',
    agingBucket: '16-30',
    status: 'notificado',
  },
  {
    id: 'def_2',
    client: 'Studio Beta Design',
    amount: 2800,
    dueDate: '2026-07-30',
    daysLate: 9,
    contactEmail: 'contato@betadesign.com',
    agingBucket: '8-15',
    status: 'pendente',
  },
];

export const initialBudgetItems: BudgetItem[] = [
  { id: 'b_1', category: 'moradia', label: 'Moradia & Contas', allocated: 2500, spent: 2150 },
  { id: 'b_2', category: 'alimentacao', label: 'Alimentação & Mercado', allocated: 1800, spent: 1420.50 },
  { id: 'b_3', category: 'saude', label: 'Saúde & Farmácia', allocated: 1500, spent: 1250 },
  { id: 'b_4', category: 'educacao', label: 'Educação & Cursos', allocated: 1200, spent: 980 },
  { id: 'b_5', category: 'lazer', label: 'Lazer & Viagens', allocated: 1000, spent: 650 },
];

export const initialEvents: CalendarEvent[] = [
  {
    id: 'ev_1',
    time: '09:00',
    title: 'Alinhamento Faturamento Contrato Fintech Brasil',
    type: 'PJ',
    client: 'Fintech Brasil Ltda',
    duration: '1h',
    value: 18500,
    status: 'confirmed',
  },
  {
    id: 'ev_2',
    time: '14:30',
    title: 'Consulta Médica de Rotina',
    type: 'PF',
    duration: '1h 30m',
    status: 'confirmed',
  },
  {
    id: 'ev_3',
    time: '16:00',
    title: 'Cobrança Fatura Em Atraso Studio Beta',
    type: 'PJ',
    client: 'Studio Beta Design',
    duration: '30m',
    value: 2800,
    status: 'action_required',
  },
];

export const faqItems: FAQItem[] = [
  {
    question: 'O que é a Confusão Patrimonial e como o AuraFin me protege?',
    answer: 'A confusão patrimonial ocorre quando gastos da pessoa física e da empresa se misturam no mesmo caixa ou cartão. O AuraFin separa juridicamente os ambientes PF e PJ, mas mantém um motor de conciliação inteligente que reembolsa seus aportes em 1 clique e registra seu Pró-labore sem infração fiscal.'
  },
  {
    question: 'Como funciona o Reembolso ao Sócio em 1 clique?',
    answer: 'Quando você paga um servidor ou despesa da empresa usando seu dinheiro pessoal (cartão ou conta PF), o AuraFin registra essa movimentação com a tag de Aporte. No painel PJ, um botão exclusivo gera o acerto de contas automático entre a conta bancária da empresa e o seu extrato pessoal.'
  },
  {
    question: 'Meus dados financeiros ficam salvos na nuvem?',
    answer: 'Não. O AuraFin utiliza uma arquitetura 100% Local-First. Toda a persistência é criptografada e armazenada diretamente no seu próprio navegador através de um repositório local. Você tem total controle dos seus dados e pode exportar seu pacote fiscal a qualquer momento.'
  },
  {
    question: 'Como o AuraFin ajuda no IRPF e no fechamento da Contabilidade?',
    answer: 'O AuraFin possui um Radar Pré-IRPF no modo PF para auditagem de gastos com saúde e educação. No modo PJ, ele gera a DRE Gerencial e permite exportar o pacote contábil completo em arquivos .JSON, .OFX e .CSV para envio direto ao seu contador.'
  },
  {
    question: 'Como funciona o cálculo do Runway e do Break-even?',
    answer: 'O Ponto de Equilíbrio (Break-even) calcula exatamente quanto sua empresa precisa faturar para cobrir 100% dos custos fixos. Já o Runway indica precisamente em dias ou meses quanto tempo sua operação consegue rodar com o caixa atual se nenhuma receita nova entrar.'
  }
];
