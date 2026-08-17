import { Transaction, Account, CreditCard, Customer, Supplier, Project, CostCenter, Defaulter } from '../types';

/**
 * AuraFin - Unified PJ Financial Selectors
 * Centralizador de cálculos derivados do contexto Pessoa Jurídica (PJ) para evitar duplicação de lógicas.
 */

/**
 * Saldo Bancário Disponível Real PJ (Soma das contas PJ)
 */
export function getPjCashTotal(accounts: Account[] = []): number {
  return accounts
    .filter(a => a.context === 'PJ')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
}

/**
 * Total Faturado PJ no período
 */
export function getPjBilledTotal(transactions: Transaction[] = []): number {
  return transactions
    .filter(t => t.context === 'PJ' && t.type === 'income')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
}

/**
 * Total de Saídas Operacionais PJ
 */
export function getPjExpensesTotal(transactions: Transaction[] = []): number {
  return transactions
    .filter(t => t.context === 'PJ' && t.type === 'expense')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
}

/**
 * Estrutura Consolidada de DRE Gerencial PJ
 */
export function getPjDRESummary(transactions: Transaction[] = []) {
  const pjTxs = transactions.filter(t => t.context === 'PJ');

  const grossRevenue = pjTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const taxesDirect = 0;
  const netRevenue = grossRevenue - taxesDirect;
  const directCosts = pjTxs.filter(t => t.type === 'expense' && t.category === 'custo_direto').reduce((acc, t) => acc + t.amount, 0);
  const grossMargin = netRevenue - directCosts;
  const opExpenses = pjTxs.filter(t => t.type === 'expense' && t.category !== 'custo_direto' && t.category !== 'prolabore_pago').reduce((acc, t) => acc + t.amount, 0);
  const prolabore = pjTxs.filter(t => t.type === 'expense' && t.category === 'prolabore_pago').reduce((acc, t) => acc + t.amount, 0);
  const netOpResult = grossMargin - opExpenses - prolabore;
  const opMarginPct = grossRevenue > 0 ? Math.round((netOpResult / grossRevenue) * 100) : 0;

  return {
    grossRevenue,
    taxesDirect,
    netRevenue,
    directCosts,
    grossMargin,
    opExpenses,
    prolabore,
    netOpResult,
    opMarginPct,
  };
}

/**
 * Autonomia de Runway (Meses e Dias)
 */
export function getPjRunwayCoverage(cash: number, monthlyBurn: number) {
  const safeBurn = Math.max(1, monthlyBurn);
  const months = Number((cash / safeBurn).toFixed(1));
  const days = Math.round(months * 30);
  return { months, days };
}

/**
 * Ponto de Equilíbrio (Break-even)
 */
export function getPjBreakEven(fixedCosts: number, contribMarginPct: number) {
  const safeMargin = Math.max(0.01, contribMarginPct);
  const breakEvenPoint = Math.round(fixedCosts / safeMargin);
  return breakEvenPoint;
}
