export type ContextMode = 'PF' | 'PJ';
export type ViewMode = 'landing' | 'app';

export type PFTab = 
  | 'overview' 
  | 'transactions' 
  | 'accounts'
  | 'cards'
  | 'recurrences'
  | 'planning' 
  | 'goals'
  | 'reserve'
  | 'debts'
  | 'wealth' 
  | 'investments'
  | 'tax_planning' 
  | 'reports'
  | 'conciliations';

export type PJTab = 
  | 'overview' 
  | 'cashflow' 
  | 'receivables_payables' 
  | 'billing'
  | 'dre'
  | 'breakeven'
  | 'runway'
  | 'projects'
  | 'cost_centers'
  | 'taxes'
  | 'delinquency'
  | 'partner_withdrawals'
  | 'accountant'
  | 'documents'
  | 'management' 
  | 'collections' 
  | 'cards'
  | 'accounting' 
  | 'reports'
  | 'conciliations';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategoryPF = 
  | 'moradia' 
  | 'alimentacao' 
  | 'saude' 
  | 'transporte' 
  | 'educacao' 
  | 'lazer' 
  | 'investimentos' 
  | 'salario_prolabore' 
  | 'distribuicao_lucro'
  | 'outros';

export type TransactionCategoryPJ = 
  | 'receita_servico' 
  | 'impostos' 
  | 'custo_direto' 
  | 'software_infra' 
  | 'marketing' 
  | 'prolabore_pago' 
  | 'distribuicao_lucro_paga' 
  | 'reembolso_socio' 
  | 'outros';

export interface Transaction {
  id: string;
  context: ContextMode;
  type: TransactionType;
  title: string;
  amount: number; // Em Reais
  amountCents?: number; // Em Centavos (1050 = R$ 10,50)
  date: string; // YYYY-MM-DD ou DD/MM/YYYY
  category: string;
  subCategory?: string;
  accountId?: string;
  cardId?: string;
  projectId?: string;
  clientId?: string;
  supplierId?: string;
  costCenterId?: string;
  recurrence?: 'mensal' | 'semanal' | 'anual' | 'unica';
  attachmentUrl?: string;
  
  // Flags Cruzadas & Fiscais
  isTaxDeductiblePF?: boolean;
  taxDeductionCategory?: 'saude' | 'educacao' | 'dependentes' | 'previdencia' | 'outros';
  isPersonalExpenseInPJ?: boolean;
  isPaidByPF?: boolean;
  linkedTransactionId?: string;
  crossContextId?: string;
  reimbursed?: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital';
  institution: string;
  balance: number;
  context: ContextMode;
}

export interface CreditCard {
  id: string;
  name: string;
  institution: string;
  limitTotal: number;
  limitUsed: number;
  currentInvoice: number;
  closingDay: number;
  dueDay: number;
  context: ContextMode;
}

export interface RecurrenceItem {
  id: string;
  title: string;
  amount: number;
  frequency: 'mensal' | 'semanal' | 'anual';
  category: string;
  nextDueDate: string;
  context: ContextMode;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'viagem' | 'veiculo' | 'casa' | 'curso' | 'investimento' | 'outros';
}

export interface Debt {
  id: string;
  title: string;
  totalBalance: number;
  monthlyPayment: number;
  remainingInstallments: number;
  interestRatePct: number;
  dueDate: string;
}

export interface Asset {
  id: string;
  name: string;
  category: 'imovel' | 'veiculo' | 'renda_fixa' | 'acoes' | 'outros';
  value: number;
  acquisitionDate?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  revenue: number;
  cost: number;
  revenueContracted?: number;
  revenueReceived?: number;
  directCosts?: number;
  status: 'proposta' | 'em_andamento' | 'concluido' | 'cancelado';
  deadline?: string;
}

export interface Customer {
  id: string;
  name: string;
  documentCnpjCpf: string;
  contactEmail: string;
  phone: string;
  totalBilled: number;
  totalReceived: number;
  totalPending: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  documentCnpj: string;
  contactEmail: string;
  totalSpent: number;
}

export interface CostCenter {
  id: string;
  name: string;
  budgetAllocated: number;
  totalSpent: number;
}

export interface Defaulter {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  daysLate: number;
  contactEmail: string;
  agingBucket: '1-7' | '8-15' | '16-30' | '31-60' | '60+';
  status: 'pendente' | 'notificado' | 'acordo' | 'pago';
}

export interface BudgetItem {
  id: string;
  category: TransactionCategoryPF;
  label: string;
  allocated: number;
  spent: number;
}

export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'PF' | 'PJ' | 'BLOCKED';
  client?: string;
  duration: string;
  value?: number;
  status: 'confirmed' | 'action_required' | 'pending';
}

export interface FAQItem {
  question: string;
  answer: string;
}
