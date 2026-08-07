import { CalendarEvent, Transaction } from './types';

export const pjEvents: CalendarEvent[] = [
  { id: '1', title: 'Reunião de Alinhamento', time: '09:00', duration: '1h', type: 'PJ', status: 'scheduled', client: 'Acme Corp' },
  { id: '2', title: 'Consultoria Estratégica', time: '10:30', duration: '2h', type: 'PJ', value: 1200, status: 'action_required', client: 'TechFlow Ltda' },
  { id: '3', title: 'Ocupado (Agenda Pessoal)', time: '13:00', duration: '1h 30m', type: 'BLOCKED', status: 'scheduled' },
  { id: '4', title: 'Mentoria UX', time: '15:00', duration: '1h', type: 'PJ', value: 450, status: 'scheduled', client: 'Marina S.' },
];

export const pfEvents: CalendarEvent[] = [
  { id: '5', title: 'Ocupado (Trabalho)', time: '09:00', duration: '3h 30m', type: 'BLOCKED', status: 'scheduled' },
  { id: '6', title: 'Almoço e Terapia', time: '13:00', duration: '1h 30m', type: 'PF', status: 'scheduled' },
  { id: '7', title: 'Ocupado (Trabalho)', time: '15:00', duration: '3h', type: 'BLOCKED', status: 'scheduled' },
  { id: '8', title: 'Academia', time: '18:30', duration: '1h', type: 'PF', status: 'scheduled' },
];

export const initialTransactions: Transaction[] = [
  { id: 't1', title: 'Salário / Pró-labore', amount: 8000, type: 'income', date: 'Hoje, 09:41', context: 'PF' },
  { id: 't2', title: 'Supermercado', amount: 820.45, type: 'expense', date: 'Ontem, 18:20', context: 'PF' },
  { id: 't3', title: 'TechFlow Ltda - Fatura #092', amount: 4500, type: 'income', date: 'Hoje, 09:41', context: 'PJ' },
  { id: 't4', title: 'AWS Services', amount: 452.10, type: 'expense', date: 'Ontem, 18:20', context: 'PJ' },
  { id: 't5', title: 'Pet Shop (Uso Pessoal)', amount: 250.00, type: 'expense', date: '2 dias atrás', context: 'PJ', isPersonalExpenseInPJ: true },
  { id: 't6', title: 'Licença Adobe (Pago com cartão PF)', amount: 120.00, type: 'expense', date: '2 dias atrás', context: 'PJ', isPaidByPF: true },
];
