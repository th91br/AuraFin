export type ContextMode = 'PF' | 'PJ';

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: 'PF' | 'PJ' | 'BLOCKED';
  value?: number;
  status: 'scheduled' | 'action_required' | 'completed';
  client?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  context: 'PF' | 'PJ';
  isPersonalExpenseInPJ?: boolean;
  isPaidByPF?: boolean;
  reimbursed?: boolean;
}

export interface Asset {
  id: string;
  name: string;
  category: 'imovel' | 'veiculo' | 'renda_fixa' | 'acoes' | 'outros';
  value: number;
}

