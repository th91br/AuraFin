import { Transaction, TransactionAnalytics, TransactionPage, TransactionQueryFilters } from '../../../types';

function matches(tx: Transaction, filters: TransactionQueryFilters): boolean {
  if (filters.search && !`${tx.title} ${tx.notes || ''}`.toLocaleLowerCase().includes(filters.search.toLocaleLowerCase())) return false;
  if (filters.type && tx.type !== filters.type) return false;
  if (filters.category && tx.category !== filters.category) return false;
  if (filters.startDate && tx.date < filters.startDate) return false;
  if (filters.endDateExclusive && tx.date >= filters.endDateExclusive) return false;
  return true;
}

export function buildLocalPage(transactions: Transaction[], filters: TransactionQueryFilters = {}): TransactionPage {
  const pageSize = Math.min(Math.max(filters.pageSize ?? 50, 1), 100);
  const filtered = transactions.filter(tx => matches(tx, filters)).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  const cursorIndex = filters.cursor ? filtered.findIndex(tx => tx.date === filters.cursor?.transaction_date && tx.id === filters.cursor?.id) + 1 : 0;
  const rows = filtered.slice(Math.max(cursorIndex, 0), Math.max(cursorIndex, 0) + pageSize);
  const next = filtered[Math.max(cursorIndex, 0) + pageSize];
  return {
    rows,
    hasMore: Boolean(next),
    nextCursor: next ? { transaction_date: rows[rows.length - 1].date, id: rows[rows.length - 1].id } : null,
    pageSize,
  };
}

export function buildLocalAnalytics(transactions: Transaction[], filters: TransactionQueryFilters = {}): TransactionAnalytics {
  const filtered = transactions.filter(tx => matches(tx, filters));
  const cents = (tx: Transaction) => tx.amountCents ?? Math.round(tx.amount * 100);
  const receipts = filtered.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + cents(tx), 0);
  const expenses = filtered.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + cents(tx), 0);
  const transfers = filtered.filter(tx => tx.type === 'transfer').reduce((sum, tx) => sum + cents(tx), 0);
  const byCategory = Array.from(new Set(filtered.map(tx => tx.category))).sort().map(category => {
    const inCategory = filtered.filter(tx => tx.category === category);
    const categoryReceipts = inCategory.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + cents(tx), 0);
    const categoryExpenses = inCategory.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + cents(tx), 0);
    return { category, receipts_cents: categoryReceipts, expenses_cents: categoryExpenses, balance_cents: categoryReceipts - categoryExpenses };
  });
  return {
    transaction_count: filtered.length,
    total_receipts_cents: receipts,
    total_expenses_cents: expenses,
    total_transfers_cents: transfers,
    balance_cents: receipts - expenses,
    by_category: byCategory,
    cash_flow: [],
  };
}

export function buildLocalCsv(transactions: Transaction[], filters: TransactionQueryFilters = {}): string {
  const quote = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""').replace(/[\r\n]/g, ' ')}"`;
  const rows = transactions.filter(tx => matches(tx, filters)).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  return ['id,type,title,amount_cents,transaction_date,category,notes', ...rows.map(tx => [tx.id, tx.type, quote(tx.title), tx.amountCents ?? Math.round(tx.amount * 100), tx.date, tx.category, quote(tx.notes)].join(','))].join('\n');
}
