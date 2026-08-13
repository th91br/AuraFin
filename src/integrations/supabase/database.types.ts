export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          preferred_context: 'PF' | 'PJ'
          privacy_mode_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          avatar_url?: string | null
          preferred_context?: 'PF' | 'PJ'
          privacy_mode_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          avatar_url?: string | null
          preferred_context?: 'PF' | 'PJ'
          privacy_mode_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      legacy_import_runs: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          context_type: 'PF' | 'PJ'
          source_fingerprint: string
          status: 'pending' | 'running' | 'failed' | 'completed'
          counts: Json
          started_at: string
          completed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          context_type?: 'PF' | 'PJ'
          source_fingerprint: string
          status?: 'pending' | 'running' | 'failed' | 'completed'
          counts?: Json
          started_at?: string
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          context_type?: 'PF' | 'PJ'
          source_fingerprint?: string
          status?: 'pending' | 'running' | 'failed' | 'completed'
          counts?: Json
          started_at?: string
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          legal_name: string | null
          tax_id: string | null
          status: 'active' | 'suspended' | 'archived'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          legal_name?: string | null
          tax_id?: string | null
          status?: 'active' | 'suspended' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          legal_name?: string | null
          tax_id?: string | null
          status?: 'active' | 'suspended' | 'archived'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: 'owner' | 'admin' | 'finance' | 'accountant' | 'viewer'
          status: 'active' | 'invited' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'finance' | 'accountant' | 'viewer'
          status?: 'active' | 'invited' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'finance' | 'accountant' | 'viewer'
          status?: 'active' | 'invited' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      personal_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          institution: string
          type: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital'
          balance_cents: number
          include_in_cash: boolean
          status: 'active' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          institution: string
          type: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital'
          balance_cents?: number
          include_in_cash?: boolean
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          institution?: string
          type?: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital'
          balance_cents?: number
          include_in_cash?: boolean
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      personal_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          title: string
          amount_cents: number
          transaction_date: string
          category: string
          account_id: string | null
          credit_card_id: string | null
          invoice_id: string | null
          recurrence_id: string | null
          cross_context_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense' | 'transfer'
          title: string
          amount_cents: number
          transaction_date: string
          category: string
          account_id?: string | null
          credit_card_id?: string | null
          invoice_id?: string | null
          recurrence_id?: string | null
          cross_context_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense' | 'transfer'
          title?: string
          amount_cents?: number
          transaction_date?: string
          category?: string
          account_id?: string | null
          credit_card_id?: string | null
          invoice_id?: string | null
          recurrence_id?: string | null
          cross_context_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      business_accounts: {
        Row: {
          id: string
          organization_id: string
          name: string
          institution: string
          type: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital'
          balance_cents: number
          status: 'active' | 'archived'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          institution: string
          type: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital'
          balance_cents?: number
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          institution?: string
          type?: 'corrente' | 'poupanca' | 'investimento' | 'dinheiro' | 'carteira_digital'
          balance_cents?: number
          status?: 'active' | 'archived'
          created_at?: string
          updated_at?: string
        }
      }
      receivables: {
        Row: {
          id: string
          organization_id: string
          client_id: string | null
          title: string
          original_amount_cents: number
          received_amount_cents: number
          balance_cents: number
          issue_date: string
          due_date: string
          status: 'pendente' | 'parcial' | 'recebido' | 'atrasado' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id?: string | null
          title: string
          original_amount_cents: number
          received_amount_cents?: number
          balance_cents: number
          issue_date: string
          due_date: string
          status?: 'pendente' | 'parcial' | 'recebido' | 'atrasado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string | null
          title?: string
          original_amount_cents?: number
          received_amount_cents?: number
          balance_cents?: number
          issue_date?: string
          due_date?: string
          status?: 'pendente' | 'parcial' | 'recebido' | 'atrasado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
      }
      payables: {
        Row: {
          id: string
          organization_id: string
          supplier_id: string | null
          title: string
          original_amount_cents: number
          paid_amount_cents: number
          balance_cents: number
          issue_date: string
          due_date: string
          status: 'pendente' | 'parcial' | 'pago' | 'atrasado' | 'cancelado'
          is_paid_by_pf: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          supplier_id?: string | null
          title: string
          original_amount_cents: number
          paid_amount_cents?: number
          balance_cents: number
          issue_date: string
          due_date: string
          status?: 'pendente' | 'parcial' | 'pago' | 'atrasado' | 'cancelado'
          is_paid_by_pf?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          supplier_id?: string | null
          title?: string
          original_amount_cents?: number
          paid_amount_cents?: number
          balance_cents?: number
          issue_date?: string
          due_date?: string
          status?: 'pendente' | 'parcial' | 'pago' | 'atrasado' | 'cancelado'
          is_paid_by_pf?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      business_transactions: {
        Row: {
          id: string
          organization_id: string
          type: 'income' | 'expense' | 'transfer'
          title: string
          amount_cents: number
          transaction_date: string
          category: string
          account_id: string | null
          corporate_card_id: string | null
          client_id: string | null
          supplier_id: string | null
          project_id: string | null
          cost_center_id: string | null
          cross_context_id: string | null
          is_paid_by_pf: boolean
          is_personal_expense_in_pj: boolean
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          type: 'income' | 'expense' | 'transfer'
          title: string
          amount_cents: number
          transaction_date: string
          category: string
          account_id?: string | null
          corporate_card_id?: string | null
          client_id?: string | null
          supplier_id?: string | null
          project_id?: string | null
          cost_center_id?: string | null
          cross_context_id?: string | null
          is_paid_by_pf?: boolean
          is_personal_expense_in_pj?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          type?: 'income' | 'expense' | 'transfer'
          title?: string
          amount_cents?: number
          transaction_date?: string
          category?: string
          account_id?: string | null
          corporate_card_id?: string | null
          client_id?: string | null
          supplier_id?: string | null
          project_id?: string | null
          cost_center_id?: string | null
          cross_context_id?: string | null
          is_paid_by_pf?: boolean
          is_personal_expense_in_pj?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      reconciliations: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          partner_id: string | null
          type: 'pf_paid_pj' | 'pj_paid_pf' | 'reimbursement' | 'pro_labore' | 'profit_distribution'
          source_transaction_id: string | null
          amount_cents: number
          resolved_amount_cents: number
          status: 'pending' | 'partially_resolved' | 'resolved' | 'cancelled'
          cross_context_id: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          partner_id?: string | null
          type: 'pf_paid_pj' | 'pj_paid_pf' | 'reimbursement' | 'pro_labore' | 'profit_distribution'
          source_transaction_id?: string | null
          amount_cents: number
          resolved_amount_cents?: number
          status?: 'pending' | 'partially_resolved' | 'resolved' | 'cancelled'
          cross_context_id?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string | null
          partner_id?: string | null
          type?: 'pf_paid_pj' | 'pj_paid_pf' | 'reimbursement' | 'pro_labore' | 'profit_distribution'
          source_transaction_id?: string | null
          amount_cents?: number
          resolved_amount_cents?: number
          status?: 'pending' | 'partially_resolved' | 'resolved' | 'cancelled'
          cross_context_id?: string | null
          created_at?: string
          resolved_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          file_name: string
          file_path: string
          file_size_bytes: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          file_name: string
          file_path: string
          file_size_bytes: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number
          mime_type?: string
          created_at?: string
        }
      }
    }
    Views: {
      v_defaulters: {
        Row: {
          receivable_id: string
          organization_id: string
          client_id: string | null
          client_name: string
          invoice_code: string
          amount_cents: number
          days_overdue: number
          due_date: string
          status: 'em_atraso' | 'em_cobranca' | 'juridico'
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      create_organization_with_owner: {
        Args: {
          org_name: string
          legal_name?: string
          tax_id?: string
        }
        Returns: string
      }
      is_organization_member: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      has_organization_role: {
        Args: {
          org_id: string
          required_roles: string[]
        }
        Returns: boolean
      }
    }
  }
}
