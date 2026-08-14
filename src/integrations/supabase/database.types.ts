export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      asset_valuations: {
        Row: {
          asset_id: string
          created_at: string
          id: string
          user_id: string
          valuation_date: string
          value_cents: number
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
          user_id: string
          valuation_date: string
          value_cents: number
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
          user_id?: string
          valuation_date?: string
          value_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_valuations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_valuations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          acquisition_date: string | null
          category: string
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
          user_id: string
          value_cents: number
        }
        Insert: {
          acquisition_date?: string | null
          category: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
          user_id: string
          value_cents: number
        }
        Update: {
          acquisition_date?: string | null
          category?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
          value_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          period_month: string
          planned_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          period_month: string
          planned_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          period_month?: string
          planned_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_accounts: {
        Row: {
          balance_cents: number
          created_at: string
          id: string
          institution: string
          name: string
          organization_id: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          id?: string
          institution: string
          name: string
          organization_id: string
          status?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          id?: string
          institution?: string
          name?: string
          organization_id?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      business_transactions: {
        Row: {
          account_id: string | null
          amount_cents: number
          category: string
          client_id: string | null
          corporate_card_id: string | null
          cost_center_id: string | null
          created_at: string
          cross_context_id: string | null
          deleted_at: string | null
          id: string
          is_paid_by_pf: boolean
          is_personal_expense_in_pj: boolean
          notes: string | null
          organization_id: string
          project_id: string | null
          supplier_id: string | null
          title: string
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          category: string
          client_id?: string | null
          corporate_card_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          cross_context_id?: string | null
          deleted_at?: string | null
          id?: string
          is_paid_by_pf?: boolean
          is_personal_expense_in_pj?: boolean
          notes?: string | null
          organization_id: string
          project_id?: string | null
          supplier_id?: string | null
          title: string
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          category?: string
          client_id?: string | null
          corporate_card_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          cross_context_id?: string | null
          deleted_at?: string | null
          id?: string
          is_paid_by_pf?: boolean
          is_personal_expense_in_pj?: boolean
          notes?: string | null
          organization_id?: string
          project_id?: string | null
          supplier_id?: string | null
          title?: string
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_tx_corporate_card"
            columns: ["corporate_card_id"]
            isOneToOne: false
            referencedRelation: "corporate_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_tx_cost_center"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_business_tx_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          contact_email: string | null
          created_at: string
          document_cnpj_cpf: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          status: string | null
          total_billed_cents: number
          total_pending_cents: number
          total_received_cents: number
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          document_cnpj_cpf?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          status?: string | null
          total_billed_cents?: number
          total_pending_cents?: number
          total_received_cents?: number
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          document_cnpj_cpf?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          status?: string | null
          total_billed_cents?: number
          total_pending_cents?: number
          total_received_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_events: {
        Row: {
          channel: string
          created_at: string
          defaulter_id: string
          event_date: string
          id: string
          notes: string | null
          organization_id: string
          receivable_id: string | null
          status: string
          template_key: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          defaulter_id: string
          event_date?: string
          id?: string
          notes?: string | null
          organization_id: string
          receivable_id?: string | null
          status: string
          template_key?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          defaulter_id?: string
          event_date?: string
          id?: string
          notes?: string | null
          organization_id?: string
          receivable_id?: string | null
          status?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_events_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_events_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "v_defaulters"
            referencedColumns: ["receivable_id"]
          },
        ]
      }
      corporate_card_invoices: {
        Row: {
          card_id: string
          closing_date: string
          created_at: string
          due_date: string
          id: string
          organization_id: string
          paid_cents: number
          reference_month: string
          status: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          card_id: string
          closing_date: string
          created_at?: string
          due_date: string
          id?: string
          organization_id: string
          paid_cents?: number
          reference_month: string
          status?: string
          total_cents?: number
          updated_at?: string
        }
        Update: {
          card_id?: string
          closing_date?: string
          created_at?: string
          due_date?: string
          id?: string
          organization_id?: string
          paid_cents?: number
          reference_month?: string
          status?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_card_invoices_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "corporate_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_card_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      corporate_cards: {
        Row: {
          brand: string
          closing_day: number | null
          created_at: string
          credit_limit_cents: number
          current_invoice_cents: number
          due_day: number | null
          id: string
          institution: string
          is_primary: boolean
          last_four_digits: string
          limit_used_cents: number
          linked_account_id: string | null
          name: string
          organization_id: string
          status: string | null
          type: string
          updated_at: string
        }
        Insert: {
          brand?: string
          closing_day?: number | null
          created_at?: string
          credit_limit_cents?: number
          current_invoice_cents?: number
          due_day?: number | null
          id?: string
          institution: string
          is_primary?: boolean
          last_four_digits: string
          limit_used_cents?: number
          linked_account_id?: string | null
          name: string
          organization_id: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          brand?: string
          closing_day?: number | null
          created_at?: string
          credit_limit_cents?: number
          current_invoice_cents?: number
          due_day?: number | null
          id?: string
          institution?: string
          is_primary?: boolean
          last_four_digits?: string
          limit_used_cents?: number
          linked_account_id?: string | null
          name?: string
          organization_id?: string
          status?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_cards_linked_account_id_fkey"
            columns: ["linked_account_id"]
            isOneToOne: false
            referencedRelation: "business_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corporate_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          budget_cents: number
          code: string
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          budget_cents?: number
          code: string
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          budget_cents?: number
          code?: string
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_payments: {
        Row: {
          amount_cents: number
          created_at: string
          debt_id: string
          id: string
          payment_date: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          debt_id: string
          id?: string
          payment_date: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          debt_id?: string
          id?: string
          payment_date?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "personal_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          created_at: string
          due_date: string
          id: string
          interest_rate_pct: number
          monthly_payment_cents: number
          remaining_installments: number
          status: string | null
          title: string
          total_balance_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          interest_rate_pct?: number
          monthly_payment_cents?: number
          remaining_installments?: number
          status?: string | null
          title: string
          total_balance_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          interest_rate_pct?: number
          monthly_payment_cents?: number
          remaining_installments?: number
          status?: string | null
          title?: string
          total_balance_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_links: {
        Row: {
          created_at: string
          document_id: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          created_at?: string
          document_id?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size_bytes: number
          id: string
          mime_type: string
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size_bytes: number
          id?: string
          mime_type: string
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size_bytes?: number
          id?: string
          mime_type?: string
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_reserves: {
        Row: {
          created_at: string
          current_amount_cents: number
          id: string
          monthly_expense_basis_cents: number
          target_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount_cents?: number
          id?: string
          monthly_expense_basis_cents?: number
          target_months?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount_cents?: number
          id?: string
          monthly_expense_basis_cents?: number
          target_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_reserves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount_cents: number
          contribution_date: string
          created_at: string
          goal_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          contribution_date: string
          created_at?: string
          goal_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          contribution_date?: string
          created_at?: string
          goal_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          category: string
          created_at: string
          current_amount_cents: number
          id: string
          status: string | null
          target_amount_cents: number
          target_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_amount_cents?: number
          id?: string
          status?: string | null
          target_amount_cents: number
          target_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_amount_cents?: number
          id?: string
          status?: string | null
          target_amount_cents?: number
          target_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_events: {
        Row: {
          amount_cents: number
          created_at: string
          event_date: string
          event_type: string
          id: string
          investment_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          event_date: string
          event_type: string
          id?: string
          investment_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          event_date?: string
          event_type?: string
          id?: string
          investment_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_events_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          asset_type: string
          average_price_cents: number
          created_at: string
          current_price_cents: number
          id: string
          institution: string
          name: string
          quantity: number
          total_value_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: string
          average_price_cents?: number
          created_at?: string
          current_price_cents?: number
          id?: string
          institution: string
          name: string
          quantity?: number
          total_value_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          average_price_cents?: number
          created_at?: string
          current_price_cents?: number
          id?: string
          institution?: string
          name?: string
          quantity?: number
          total_value_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_cents: number
          client_id: string | null
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          organization_id: string
          receivable_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          client_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          organization_id: string
          receivable_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          organization_id?: string
          receivable_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "v_defaulters"
            referencedColumns: ["receivable_id"]
          },
        ]
      }
      legacy_import_runs: {
        Row: {
          completed_at: string | null
          context_type: string
          counts: Json
          created_at: string
          error_message: string | null
          id: string
          organization_id: string | null
          source_fingerprint: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          context_type?: string
          counts?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          source_fingerprint: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          context_type?: string
          counts?: Json
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string | null
          source_fingerprint?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_import_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_import_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_closings: {
        Row: {
          closed_by: string | null
          closing_date: string
          created_at: string
          gross_revenue_cents: number
          id: string
          net_result_cents: number
          notes: string | null
          organization_id: string
          reference_month: string
          status: string
          total_expenses_cents: number
        }
        Insert: {
          closed_by?: string | null
          closing_date?: string
          created_at?: string
          gross_revenue_cents?: number
          id?: string
          net_result_cents?: number
          notes?: string | null
          organization_id: string
          reference_month: string
          status?: string
          total_expenses_cents?: number
        }
        Update: {
          closed_by?: string | null
          closing_date?: string
          created_at?: string
          gross_revenue_cents?: number
          id?: string
          net_result_cents?: number
          notes?: string | null
          organization_id?: string
          reference_month?: string
          status?: string
          total_expenses_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_closings_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_closings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          legal_name: string | null
          name: string
          status: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_transactions: {
        Row: {
          amount_cents: number
          business_transaction_id: string | null
          created_at: string
          cross_context_id: string | null
          id: string
          notes: string | null
          organization_id: string
          partner_id: string
          transaction_date: string
          type: string
        }
        Insert: {
          amount_cents: number
          business_transaction_id?: string | null
          created_at?: string
          cross_context_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          partner_id: string
          transaction_date: string
          type: string
        }
        Update: {
          amount_cents?: number
          business_transaction_id?: string | null
          created_at?: string
          cross_context_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          partner_id?: string
          transaction_date?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_transactions_business_transaction_id_fkey"
            columns: ["business_transaction_id"]
            isOneToOne: false
            referencedRelation: "business_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_transactions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          created_at: string
          document_cpf: string | null
          id: string
          name: string
          organization_id: string
          ownership_percentage: number
          profile_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_cpf?: string | null
          id?: string
          name: string
          organization_id: string
          ownership_percentage?: number
          profile_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_cpf?: string | null
          id?: string
          name?: string
          organization_id?: string
          ownership_percentage?: number
          profile_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payables: {
        Row: {
          balance_cents: number
          created_at: string
          due_date: string
          id: string
          is_paid_by_pf: boolean
          issue_date: string
          organization_id: string
          original_amount_cents: number
          paid_amount_cents: number
          status: string
          supplier_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          balance_cents: number
          created_at?: string
          due_date: string
          id?: string
          is_paid_by_pf?: boolean
          issue_date: string
          organization_id: string
          original_amount_cents: number
          paid_amount_cents?: number
          status?: string
          supplier_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          due_date?: string
          id?: string
          is_paid_by_pf?: boolean
          issue_date?: string
          organization_id?: string
          original_amount_cents?: number
          paid_amount_cents?: number
          status?: string
          supplier_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_accounts: {
        Row: {
          balance_cents: number
          created_at: string
          id: string
          include_in_cash: boolean
          institution: string
          name: string
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          id?: string
          include_in_cash?: boolean
          institution: string
          name: string
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          id?: string
          include_in_cash?: boolean
          institution?: string
          name?: string
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_card_invoices: {
        Row: {
          card_id: string
          closing_date: string
          created_at: string
          due_date: string
          id: string
          paid_cents: number
          reference_month: string
          status: string
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          closing_date: string
          created_at?: string
          due_date: string
          id?: string
          paid_cents?: number
          reference_month: string
          status?: string
          total_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          closing_date?: string
          created_at?: string
          due_date?: string
          id?: string
          paid_cents?: number
          reference_month?: string
          status?: string
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_card_invoices_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "personal_credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_card_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_credit_cards: {
        Row: {
          brand: string
          closing_day: number
          created_at: string
          current_invoice_cents: number
          due_day: number
          id: string
          institution: string
          is_primary: boolean
          last_four_digits: string
          limit_total_cents: number
          limit_used_cents: number
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string
          closing_day: number
          created_at?: string
          current_invoice_cents?: number
          due_day: number
          id?: string
          institution: string
          is_primary?: boolean
          last_four_digits: string
          limit_total_cents?: number
          limit_used_cents?: number
          name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          closing_day?: number
          created_at?: string
          current_invoice_cents?: number
          due_day?: number
          id?: string
          institution?: string
          is_primary?: boolean
          last_four_digits?: string
          limit_total_cents?: number
          limit_used_cents?: number
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_credit_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_transactions: {
        Row: {
          account_id: string | null
          amount_cents: number
          category: string
          created_at: string
          credit_card_id: string | null
          cross_context_id: string | null
          deleted_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          recurrence_id: string | null
          title: string
          transaction_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          category: string
          created_at?: string
          credit_card_id?: string | null
          cross_context_id?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          recurrence_id?: string | null
          title: string
          transaction_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          category?: string
          created_at?: string
          credit_card_id?: string | null
          cross_context_id?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          recurrence_id?: string | null
          title?: string
          transaction_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "personal_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transactions_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "personal_credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "personal_card_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transactions_recurrence_id_fkey"
            columns: ["recurrence_id"]
            isOneToOne: false
            referencedRelation: "recurrence_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          preferred_context: string | null
          privacy_mode_default: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          preferred_context?: string | null
          privacy_mode_default?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          preferred_context?: string | null
          privacy_mode_default?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          deadline: string | null
          direct_costs_cents: number
          id: string
          name: string
          organization_id: string
          revenue_contracted_cents: number
          revenue_received_cents: number
          status: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          direct_costs_cents?: number
          id?: string
          name: string
          organization_id: string
          revenue_contracted_cents?: number
          revenue_received_cents?: number
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          deadline?: string | null
          direct_costs_cents?: number
          id?: string
          name?: string
          organization_id?: string
          revenue_contracted_cents?: number
          revenue_received_cents?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          balance_cents: number
          client_id: string | null
          created_at: string
          due_date: string
          id: string
          issue_date: string
          organization_id: string
          original_amount_cents: number
          received_amount_cents: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          balance_cents: number
          client_id?: string | null
          created_at?: string
          due_date: string
          id?: string
          issue_date: string
          organization_id: string
          original_amount_cents: number
          received_amount_cents?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          balance_cents?: number
          client_id?: string | null
          created_at?: string
          due_date?: string
          id?: string
          issue_date?: string
          organization_id?: string
          original_amount_cents?: number
          received_amount_cents?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliations: {
        Row: {
          amount_cents: number
          created_at: string
          cross_context_id: string | null
          id: string
          organization_id: string
          partner_id: string | null
          resolved_amount_cents: number
          resolved_at: string | null
          source_transaction_id: string | null
          status: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          cross_context_id?: string | null
          id?: string
          organization_id: string
          partner_id?: string | null
          resolved_amount_cents?: number
          resolved_at?: string | null
          source_transaction_id?: string | null
          status?: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          cross_context_id?: string | null
          id?: string
          organization_id?: string
          partner_id?: string | null
          resolved_amount_cents?: number
          resolved_at?: string | null
          source_transaction_id?: string | null
          status?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recurrence_rules: {
        Row: {
          account_id: string | null
          amount_cents: number
          category: string
          created_at: string
          frequency: string
          id: string
          next_due_date: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount_cents: number
          category: string
          created_at?: string
          frequency?: string
          id?: string
          next_due_date: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount_cents?: number
          category?: string
          created_at?: string
          frequency?: string
          id?: string
          next_due_date?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurrence_rules_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "personal_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrence_rules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reimbursements: {
        Row: {
          amount_cents: number
          created_at: string
          cross_context_id: string | null
          id: string
          notes: string | null
          organization_id: string
          payment_date: string
          reconciliation_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          cross_context_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          payment_date: string
          reconciliation_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          cross_context_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          payment_date?: string
          reconciliation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reimbursements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reimbursements_reconciliation_id_fkey"
            columns: ["reconciliation_id"]
            isOneToOne: false
            referencedRelation: "reconciliations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          category: string
          contact_email: string | null
          created_at: string
          document_cnpj_cpf: string | null
          id: string
          name: string
          organization_id: string
          phone: string | null
          status: string | null
          total_paid_cents: number
          updated_at: string
        }
        Insert: {
          category: string
          contact_email?: string | null
          created_at?: string
          document_cnpj_cpf?: string | null
          id?: string
          name: string
          organization_id: string
          phone?: string | null
          status?: string | null
          total_paid_cents?: number
          updated_at?: string
        }
        Update: {
          category?: string
          contact_email?: string | null
          created_at?: string
          document_cnpj_cpf?: string | null
          id?: string
          name?: string
          organization_id?: string
          phone?: string | null
          status?: string | null
          total_paid_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_metadata: {
        Row: {
          created_at: string
          id: string
          is_deductible: boolean
          notes: string | null
          tax_category: string
          tax_year: number
          transaction_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_deductible?: boolean
          notes?: string | null
          tax_category: string
          tax_year: number
          transaction_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_deductible?: boolean
          notes?: string | null
          tax_category?: string
          tax_year?: number
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_metadata_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "personal_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_records: {
        Row: {
          amount_cents: number
          competence: string
          created_at: string
          description: string
          due_date: string
          id: string
          organization_id: string
          payment_transaction_id: string | null
          status: string
          tax_type: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          competence: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          organization_id: string
          payment_transaction_id?: string | null
          status?: string
          tax_type: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          competence?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          organization_id?: string
          payment_transaction_id?: string | null
          status?: string
          tax_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tax_records_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "business_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_defaulters: {
        Row: {
          amount_cents: number | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          days_overdue: number | null
          due_date: string | null
          invoice_code: string | null
          organization_id: string | null
          receivable_id: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_organization_with_owner: {
        Args: { legal_name?: string; org_name: string; tax_id?: string }
        Returns: string
      }
      find_orphan_storage_objects: {
        Args: never
        Returns: {
          bucket_id: string
          created_at: string
          id: string
          name: string
        }[]
      }
      has_organization_role: {
        Args: { org_id: string; required_roles: string[] }
        Returns: boolean
      }
      health_check: { Args: never; Returns: Json }
      is_organization_member: { Args: { org_id: string }; Returns: boolean }
      process_cross_context_reimbursement: {
        Args: {
          p_amount_cents: number
          p_idempotency_key: string
          p_notes?: string
          p_org_id: string
          p_pf_account_id: string
          p_pj_account_id: string
          p_reconciliation_id: string
        }
        Returns: string
      }
      process_pro_labore_payout: {
        Args: {
          p_amount_cents: number
          p_idempotency_key: string
          p_notes?: string
          p_org_id: string
          p_partner_id: string
          p_pf_account_id: string
          p_pj_account_id: string
          p_transaction_date?: string
        }
        Returns: string
      }
      process_profit_distribution_payout: {
        Args: {
          p_amount_cents: number
          p_idempotency_key: string
          p_notes?: string
          p_org_id: string
          p_partner_id: string
          p_pf_account_id: string
          p_pj_account_id: string
          p_transaction_date?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      iceberg_namespaces: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_namespaces_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      iceberg_tables: {
        Row: {
          bucket_name: string
          catalog_id: string
          created_at: string
          id: string
          location: string
          name: string
          namespace_id: string
          remote_table_id: string | null
          shard_id: string | null
          shard_key: string | null
          updated_at: string
        }
        Insert: {
          bucket_name: string
          catalog_id: string
          created_at?: string
          id?: string
          location: string
          name: string
          namespace_id: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Update: {
          bucket_name?: string
          catalog_id?: string
          created_at?: string
          id?: string
          location?: string
          name?: string
          namespace_id?: string
          remote_table_id?: string | null
          shard_id?: string | null
          shard_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iceberg_tables_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "buckets_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iceberg_tables_namespace_id_fkey"
            columns: ["namespace_id"]
            isOneToOne: false
            referencedRelation: "iceberg_namespaces"
            referencedColumns: ["id"]
          },
        ]
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

