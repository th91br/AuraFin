-- Migration 0007: Strategic Database Indexes & Query Performance
-- AuraFin Backend Phase 1

-- Indexes for Core & Auth
create index if not exists idx_profiles_context on public.profiles(preferred_context);
create index if not exists idx_org_members_user_org on public.organization_members(user_id, organization_id, status);

-- Indexes for Personal Finance (PF)
create index if not exists idx_personal_accounts_user on public.personal_accounts(user_id, status);
create index if not exists idx_personal_tx_user_date on public.personal_transactions(user_id, transaction_date desc);
create index if not exists idx_personal_tx_account on public.personal_transactions(account_id);
create index if not exists idx_personal_tx_card on public.personal_transactions(credit_card_id);
create index if not exists idx_personal_tx_cross_context on public.personal_transactions(cross_context_id) where cross_context_id is not null;

create index if not exists idx_personal_cards_user on public.personal_credit_cards(user_id, status);
create index if not exists idx_personal_invoices_card_month on public.personal_card_invoices(card_id, reference_month);
create index if not exists idx_budgets_user_period on public.budgets(user_id, period_month);
create index if not exists idx_goals_user_status on public.goals(user_id, status);
create index if not exists idx_debts_user_status on public.debts(user_id, status);
create index if not exists idx_assets_user_cat on public.assets(user_id, category);
create index if not exists idx_investments_user_type on public.investments(user_id, asset_type);

-- Indexes for Business Finance (PJ Multi-Tenant)
create index if not exists idx_business_accounts_org on public.business_accounts(organization_id, status);
create index if not exists idx_business_tx_org_date on public.business_transactions(organization_id, transaction_date desc);
create index if not exists idx_business_tx_account on public.business_transactions(account_id);
create index if not exists idx_business_tx_client on public.business_transactions(client_id);
create index if not exists idx_business_tx_supplier on public.business_transactions(supplier_id);
create index if not exists idx_business_tx_project on public.business_transactions(project_id);
create index if not exists idx_business_tx_cost_center on public.business_transactions(cost_center_id);
create index if not exists idx_business_tx_cross_context on public.business_transactions(cross_context_id) where cross_context_id is not null;

create index if not exists idx_clients_org_status on public.clients(organization_id, status);
create index if not exists idx_suppliers_org_status on public.suppliers(organization_id, status);
create index if not exists idx_receivables_org_due on public.receivables(organization_id, due_date, status);
create index if not exists idx_payables_org_due on public.payables(organization_id, due_date, status);
create index if not exists idx_invoices_org_status on public.invoices(organization_id, status);

create index if not exists idx_corp_cards_org on public.corporate_cards(organization_id, status);
create index if not exists idx_corp_invoices_card_month on public.corporate_card_invoices(card_id, reference_month);
create index if not exists idx_projects_org_status on public.projects(organization_id, status);
create index if not exists idx_cost_centers_org on public.cost_centers(organization_id);
create index if not exists idx_tax_records_org_due on public.tax_records(organization_id, due_date, status);
create index if not exists idx_partners_org on public.partners(organization_id, status);
create index if not exists idx_reconciliations_org_status on public.reconciliations(organization_id, status);
create index if not exists idx_defaulters_org_status on public.defaulters(organization_id, status);

-- Indexes for Documents
create index if not exists idx_documents_user on public.documents(user_id) where user_id is not null;
create index if not exists idx_documents_org on public.documents(organization_id) where organization_id is not null;
create index if not exists idx_doc_links_entity on public.document_links(entity_type, entity_id);
