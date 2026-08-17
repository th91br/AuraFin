import { supabase } from '../../../integrations/supabase/client';
import { Customer, Supplier, Project, CostCenter, Defaulter, CreditCard } from '../../../types';

export interface BusinessReceivable {
  id: string;
  client: string;
  description: string;
  amount: number;
  receivedAmount: number;
  dueDate: string;
  status: string;
}

export interface BusinessPayable {
  id: string;
  supplier: string;
  description: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: string;
  isPaidByPF: boolean;
}

export interface BusinessInvoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: string;
}

const reais = (cents: unknown): number => Number(cents || 0) / 100;
const nestedName = (value: unknown): string => {
  if (Array.isArray(value)) return String((value[0] as any)?.name || '');
  return String((value as any)?.name || '');
};

/**
 * Read-only PJ entity access. Every query is tenant-scoped and uses an
 * explicit projection; RLS remains the final authorization boundary.
 */
export class SupabaseBusinessDataRepository {
  async listClients(organizationId: string): Promise<Customer[]> {
    const { data, error } = await (supabase.from as any)('clients')
      .select('id,name,document_cnpj_cpf,contact_email,phone,total_billed_cents,total_received_cents,total_pending_cents')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      documentCnpjCpf: row.document_cnpj_cpf || '',
      contactEmail: row.contact_email || '',
      phone: row.phone || '',
      totalBilled: reais(row.total_billed_cents),
      totalReceived: reais(row.total_received_cents),
      totalPending: reais(row.total_pending_cents),
    }));
  }

  async listSuppliers(organizationId: string): Promise<Supplier[]> {
    const { data, error } = await (supabase.from as any)('suppliers')
      .select('id,name,category,document_cnpj_cpf,contact_email,total_paid_cents')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category || '',
      documentCnpj: row.document_cnpj_cpf || '',
      contactEmail: row.contact_email || '',
      totalSpent: reais(row.total_paid_cents),
    }));
  }

  async listProjects(organizationId: string): Promise<Project[]> {
    const { data, error } = await (supabase.from as any)('projects')
      .select('id,name,client_id,deadline,status,revenue_contracted_cents,revenue_received_cents,direct_costs_cents,clients(name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      client: nestedName(row.clients) || row.client_id || 'Cliente não informado',
      revenue: reais(row.revenue_contracted_cents),
      cost: reais(row.direct_costs_cents),
      revenueContracted: reais(row.revenue_contracted_cents),
      revenueReceived: reais(row.revenue_received_cents),
      directCosts: reais(row.direct_costs_cents),
      deadline: row.deadline || undefined,
      status: row.status || 'proposta',
    }));
  }

  async listCostCenters(organizationId: string): Promise<CostCenter[]> {
    const { data, error } = await (supabase.from as any)('cost_centers')
      .select('id,name,budget_cents,code')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      budgetAllocated: reais(row.budget_cents),
      // Spending is not stored on this table. The UI must not invent it.
      totalSpent: 0,
    }));
  }

  async listCorporateCards(organizationId: string): Promise<CreditCard[]> {
    const { data, error } = await (supabase.from as any)('corporate_cards')
      .select('id,name,institution,type,brand,last_four_digits,credit_limit_cents,limit_used_cents,current_invoice_cents,closing_day,due_day,linked_account_id,is_primary,status')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      institution: row.institution,
      type: row.type === 'debit' ? 'debito' : 'credito',
      brand: row.brand,
      lastFourDigits: row.last_four_digits,
      limitTotal: reais(row.credit_limit_cents),
      limitUsed: reais(row.limit_used_cents),
      currentInvoice: reais(row.current_invoice_cents),
      closingDay: row.closing_day || 0,
      dueDay: row.due_day || 0,
      linkedAccountId: row.linked_account_id || undefined,
      isPrimary: Boolean(row.is_primary),
      status: row.status === 'active' ? 'ativo' : row.status === 'archived' ? 'arquivado' : 'inativo',
      context: 'PJ',
    } as CreditCard));
  }

  async listReceivables(organizationId: string): Promise<BusinessReceivable[]> {
    const { data, error } = await (supabase.from as any)('receivables')
      .select('id,title,original_amount_cents,received_amount_cents,due_date,status,clients(name)')
      .eq('organization_id', organizationId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      client: nestedName(row.clients) || 'Cliente não informado',
      description: row.title,
      amount: reais(row.original_amount_cents),
      receivedAmount: reais(row.received_amount_cents),
      dueDate: row.due_date,
      status: row.status,
    }));
  }

  async listPayables(organizationId: string): Promise<BusinessPayable[]> {
    const { data, error } = await (supabase.from as any)('payables')
      .select('id,title,original_amount_cents,paid_amount_cents,due_date,status,is_paid_by_pf,suppliers(name)')
      .eq('organization_id', organizationId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      supplier: nestedName(row.suppliers) || 'Fornecedor não informado',
      description: row.title,
      amount: reais(row.original_amount_cents),
      paidAmount: reais(row.paid_amount_cents),
      dueDate: row.due_date,
      status: row.status,
      isPaidByPF: Boolean(row.is_paid_by_pf),
    }));
  }

  async listInvoices(organizationId: string): Promise<BusinessInvoice[]> {
    const { data, error } = await (supabase.from as any)('invoices')
      .select('id,invoice_number,amount_cents,issue_date,due_date,status,clients(name)')
      .eq('organization_id', organizationId)
      .order('issue_date', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      client: nestedName(row.clients) || 'Cliente não informado',
      amount: reais(row.amount_cents),
      issueDate: row.issue_date,
      dueDate: row.due_date,
      status: row.status,
    }));
  }

  async listDefaulters(organizationId: string): Promise<Defaulter[]> {
    const { data, error } = await (supabase.from as any)('v_defaulters')
      .select('receivable_id,client_name,amount_cents,due_date,days_overdue,status')
      .eq('organization_id', organizationId)
      .order('days_overdue', { ascending: false });
    if (error) throw error;
    return (data || []).map((row: any) => {
      const daysLate = Number(row.days_overdue || 0);
      const agingBucket = daysLate <= 7 ? '1-7' : daysLate <= 15 ? '8-15' : daysLate <= 30 ? '16-30' : daysLate <= 60 ? '31-60' : '60+';
      return {
        id: row.receivable_id,
        client: row.client_name || 'Cliente não informado',
        amount: reais(row.amount_cents),
        dueDate: row.due_date || '',
        daysLate,
        contactEmail: '',
        agingBucket,
        status: row.status === 'paid' ? 'pago' : 'pendente',
      } as Defaulter;
    });
  }
}

export const supabaseBusinessDataRepo = new SupabaseBusinessDataRepository();
