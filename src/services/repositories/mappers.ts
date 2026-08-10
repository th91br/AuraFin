import { Account, Transaction } from '../../types';
import { Database } from '../../integrations/supabase/database.types';

type PersonalAccountRow = Database['public']['Tables']['personal_accounts']['Row'];
type PersonalTransactionRow = Database['public']['Tables']['personal_transactions']['Row'];
type BusinessAccountRow = Database['public']['Tables']['business_accounts']['Row'];
type BusinessTransactionRow = Database['public']['Tables']['business_transactions']['Row'];

/**
 * Converte valor de centavos (Postgres bigint) para número JS seguro em reais se necessário ou preserva centavos
 */
function safeCentsToReaisNumber(cents: number | null | undefined): number {
  if (cents === null || cents === undefined || isNaN(cents)) return 0;
  return Number(cents) / 100;
}

function safeReaisToCents(amountInReais: number | null | undefined): number {
  if (amountInReais === null || amountInReais === undefined || isNaN(amountInReais)) return 0;
  return Math.round(Number(amountInReais) * 100);
}

// --- PERSONAL ACCOUNTS ---
export function mapPersonalAccountRowToDomain(row: PersonalAccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    institution: row.institution,
    balance: safeCentsToReaisNumber(row.balance_cents),
    context: 'PF',
  };
}

export function mapPersonalAccountDomainToInsert(account: Partial<Account>, userId: string): Database['public']['Tables']['personal_accounts']['Insert'] {
  return {
    id: account.id,
    user_id: userId,
    name: account.name || 'Nova Conta PF',
    institution: account.institution || 'Outros',
    type: (account.type as 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital') || 'corrente',
    balance_cents: safeReaisToCents(account.balance || 0),
    include_in_cash: true,
    status: 'active',
  };
}

// --- PERSONAL TRANSACTIONS ---
export function mapPersonalTransactionRowToDomain(row: PersonalTransactionRow): Transaction {
  return {
    id: row.id,
    context: 'PF',
    type: row.type,
    title: row.title,
    amount: safeCentsToReaisNumber(row.amount_cents),
    amountCents: Number(row.amount_cents),
    date: row.transaction_date,
    category: row.category,
    accountId: row.account_id || undefined,
    creditCardId: row.credit_card_id || undefined,
    crossContextId: row.cross_context_id || undefined,
    notes: row.notes || undefined,
  };
}

export function mapPersonalTransactionDomainToInsert(tx: Partial<Transaction>, userId: string): Database['public']['Tables']['personal_transactions']['Insert'] {
  const amountInReais = tx.amount || (tx.amountCents ? tx.amountCents / 100 : 0);
  return {
    id: tx.id,
    user_id: userId,
    type: tx.type || 'expense',
    title: tx.title || 'Lançamento PF',
    amount_cents: safeReaisToCents(amountInReais),
    transaction_date: tx.date || new Date().toISOString().split('T')[0],
    category: tx.category || 'outros',
    account_id: tx.accountId || null,
    credit_card_id: tx.creditCardId || null,
    cross_context_id: tx.crossContextId || null,
    notes: tx.notes || null,
  };
}

// --- BUSINESS ACCOUNTS ---
export function mapBusinessAccountRowToDomain(row: BusinessAccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    institution: row.institution,
    balance: safeCentsToReaisNumber(row.balance_cents),
    context: 'PJ',
  };
}

export function mapBusinessAccountDomainToInsert(account: Partial<Account>, organizationId: string): Database['public']['Tables']['business_accounts']['Insert'] {
  return {
    id: account.id,
    organization_id: organizationId,
    name: account.name || 'Nova Conta PJ',
    institution: account.institution || 'Outros',
    type: (account.type as 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital') || 'corrente',
    balance_cents: safeReaisToCents(account.balance || 0),
    status: 'active',
  };
}

// --- BUSINESS TRANSACTIONS ---
export function mapBusinessTransactionRowToDomain(row: BusinessTransactionRow): Transaction {
  return {
    id: row.id,
    context: 'PJ',
    type: row.type,
    title: row.title,
    amount: safeCentsToReaisNumber(row.amount_cents),
    amountCents: Number(row.amount_cents),
    date: row.transaction_date,
    category: row.category,
    accountId: row.account_id || undefined,
    corporateCardId: row.corporate_card_id || undefined,
    clientId: row.client_id || undefined,
    supplierId: row.supplier_id || undefined,
    projectId: row.project_id || undefined,
    costCenterId: row.cost_center_id || undefined,
    crossContextId: row.cross_context_id || undefined,
    isPaidByPF: row.is_paid_by_pf,
    isPersonalExpenseInPJ: row.is_personal_expense_in_pj,
    notes: row.notes || undefined,
  };
}

export function mapBusinessTransactionDomainToInsert(tx: Partial<Transaction>, organizationId: string): Database['public']['Tables']['business_transactions']['Insert'] {
  const amountInReais = tx.amount || (tx.amountCents ? tx.amountCents / 100 : 0);
  return {
    id: tx.id,
    organization_id: organizationId,
    type: tx.type || 'expense',
    title: tx.title || 'Lançamento PJ',
    amount_cents: safeReaisToCents(amountInReais),
    transaction_date: tx.date || new Date().toISOString().split('T')[0],
    category: tx.category || 'software_infra',
    account_id: tx.accountId || null,
    corporate_card_id: tx.corporateCardId || null,
    client_id: tx.clientId || null,
    supplier_id: tx.supplierId || null,
    project_id: tx.projectId || null,
    cost_center_id: tx.costCenterId || null,
    cross_context_id: tx.crossContextId || null,
    is_paid_by_pf: tx.isPaidByPF || false,
    is_personal_expense_in_pj: tx.isPersonalExpenseInPJ || false,
    notes: tx.notes || null,
  };
}
