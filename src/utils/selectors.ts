import { Transaction, Account, CreditCard, Debt, Asset, BudgetItem, Goal } from '../types';

/**
 * AuraFin - Unified Financial Selectors
 * Centralizador de cálculos derivados para evitar regras duplicadas ou conflitantes na UI.
 */

/**
 * Calcula a soma das receitas do contexto PF no mês/período
 */
export function getMonthlyIncomePF(transactions: Transaction[] = []): number {
  return transactions
    .filter(t => t.context === 'PF' && t.type === 'income')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
}

/**
 * Calcula a soma das despesas do contexto PF no mês/período
 */
export function getMonthlyExpensesPF(transactions: Transaction[] = []): number {
  return transactions
    .filter(t => t.context === 'PF' && t.type === 'expense')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
}

/**
 * Calcula o Saldo Total Disponível em Contas PF
 */
export function getTotalAccountBalancePF(accounts: Account[] = []): number {
  return accounts
    .filter(a => a.context === 'PF')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
}

/**
 * Calcula o valor da fatura atual de um cartão de crédito com base nas compras do mês
 */
export function getCardCurrentInvoice(transactions: Transaction[] = [], cardId: string): number {
  return transactions
    .filter(t => t.context === 'PF' && t.cardId === cardId && t.type === 'expense')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
}

/**
 * Calcula o consumo de orçamentos por categoria PF
 */
export function getCategorySpentPF(transactions: Transaction[] = [], category: string): number {
  return transactions
    .filter(t => t.context === 'PF' && t.type === 'expense' && t.category === category)
    .reduce((acc, t) => acc + (t.amount || 0), 0);
}

/**
 * Cobertura da Reserva de Emergência em Meses
 */
export function getEmergencyReserveCoverage(currentReserve: number, monthlyLivingCost: number): { months: number; days: number } {
  const safeCost = Math.max(1, monthlyLivingCost);
  const months = Number((currentReserve / safeCost).toFixed(1));
  const days = Math.round(months * 30);
  return { months, days };
}

/**
 * Comprometimento de Renda com Dívidas (%)
 */
export function getDebtCommitmentRatio(totalMonthlyDebtPayments: number, monthlyIncome: number): number {
  const safeIncome = Math.max(1, monthlyIncome);
  return Math.round((totalMonthlyDebtPayments / safeIncome) * 100);
}

/**
 * Patrimônio Líquido Real PF (Ativos - Passivos/Dívidas)
 */
export function getNetWorthPF(assets: Asset[] = [], accounts: Account[] = [], debts: Debt[] = []): number {
  const totalAssetsVal = assets.reduce((acc, a) => acc + (a.value || 0), 0);
  const totalAccountsVal = accounts.filter(a => a.context === 'PF').reduce((acc, a) => acc + (a.balance || 0), 0);
  const totalDebtsVal = debts.reduce((acc, d) => acc + (d.totalBalance || 0), 0);

  return (totalAssetsVal + totalAccountsVal) - totalDebtsVal;
}
