export type ContextMode = 'PF' | 'PJ';
export type ViewMode = 'landing' | 'app';

export type PFTab = 'overview' | 'budget' | 'wealth' | 'tax_planning';
export type PJTab = 'overview' | 'dre_cashflow' | 'projects' | 'defaulters' | 'accounting';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'PF' | 'PJ' | 'BLOCKED';
  value?: number;
  status: 'scheduled' | 'action_required' | 'completed';
  client?: string;
  timestamp?: number;
}

export type TransactionCategory = 
  | 'salario_prolabore'
  | 'freelance_consultoria'
  | 'alimentacao'
  | 'moradia'
  | 'transporte'
  | 'saude'
  | 'educacao'
  | 'lazer_viagens'
  | 'investimento'
  | 'impostos'
  | 'software_infra'
  | 'equipe_terceiros'
  | 'outros';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  context: 'PF' | 'PJ';
  category?: TransactionCategory;
  isPersonalExpenseInPJ?: boolean;
  isPaidByPF?: boolean;
  isTaxDeductiblePF?: boolean;
  taxDeductionCategory?: 'saude' | 'educacao' | 'dependente' | 'previdencia';
  reimbursed?: boolean;
  linkedTransactionId?: string;
  timestamp?: number;
}

export interface Asset {
  id: string;
  name: string;
  category: 'imovel' | 'veiculo' | 'renda_fixa' | 'acoes' | 'outros';
  value: number;
  purchaseDate?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  revenue: number;
  cost: number;
  status: 'em_andamento' | 'concluido' | 'proposta';
  deadline?: string;
}

export interface Defaulter {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  daysLate: number;
  contactEmail?: string;
  contactPhone?: string;
  status: 'pendente' | 'notificado' | 'acordo' | 'pago';
}

export interface BudgetItem {
  id: string;
  category: TransactionCategory;
  label: string;
  allocated: number;
  spent: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}
