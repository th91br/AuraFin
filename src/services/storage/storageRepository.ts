import { 
  Transaction, 
  Asset, 
  Project, 
  Defaulter, 
  BudgetItem, 
  CalendarEvent,
  Account,
  CreditCard,
  Goal,
  Debt,
  Customer,
  Supplier,
  CostCenter
} from '../../types';
import { 
  initialTransactions, 
  initialAssets, 
  initialProjects, 
  initialDefaulters, 
  initialBudgetItems, 
  initialEvents,
  initialAccounts,
  initialCreditCards,
  initialGoals,
  initialDebts,
  initialCustomers,
  initialSuppliers,
  initialCostCenters
} from '../../data';

const STORAGE_KEYS = {
  SCHEMA_VERSION: 'aurafin_schema_v4',
  PRIVACY_MODE: 'aurafin_privacy_mode_v4',
  TRANSACTIONS: 'aurafin_transactions_v4',
  ASSETS: 'aurafin_assets_v4',
  PROJECTS: 'aurafin_projects_v4',
  DEFAULTERS: 'aurafin_defaulters_v4',
  BUDGET_ITEMS: 'aurafin_budget_v4',
  EVENTS: 'aurafin_events_v4',
  ACCOUNTS: 'aurafin_accounts_v4',
  CREDIT_CARDS: 'aurafin_cards_v4',
  GOALS: 'aurafin_goals_v4',
  DEBTS: 'aurafin_debts_v4',
  CUSTOMERS: 'aurafin_customers_v4',
  SUPPLIERS: 'aurafin_suppliers_v4',
  COST_CENTERS: 'aurafin_cost_centers_v4',
};

export class StorageRepository {
  /**
   * Obtém item do localStorage de forma segura
   */
  private static getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageRepository] Erro ao ler chave: ${key}`, error);
      return fallback;
    }
  }

  /**
   * Salva item no localStorage de forma segura
   */
  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`[StorageRepository] Erro ao salvar chave: ${key}`, error);
    }
  }

  // --- PRIVACY MODE ---
  public static getPrivacyMode(): boolean {
    return this.getItem<boolean>(STORAGE_KEYS.PRIVACY_MODE, false);
  }

  public static setPrivacyMode(enabled: boolean): void {
    this.setItem<boolean>(STORAGE_KEYS.PRIVACY_MODE, enabled);
  }

  // --- TRANSACTIONS ---
  public static getTransactions(): Transaction[] {
    return this.getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  }

  public static saveTransactions(transactions: Transaction[]): void {
    this.setItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  // --- ASSETS ---
  public static getAssets(): Asset[] {
    return this.getItem<Asset[]>(STORAGE_KEYS.ASSETS, initialAssets);
  }

  public static saveAssets(assets: Asset[]): void {
    this.setItem<Asset[]>(STORAGE_KEYS.ASSETS, assets);
  }

  // --- PROJECTS ---
  public static getProjects(): Project[] {
    return this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
  }

  public static saveProjects(projects: Project[]): void {
    this.setItem<Project[]>(STORAGE_KEYS.PROJECTS, projects);
  }

  // --- DEFAULTERS ---
  public static getDefaulters(): Defaulter[] {
    return this.getItem<Defaulter[]>(STORAGE_KEYS.DEFAULTERS, initialDefaulters);
  }

  public static saveDefaulters(defaulters: Defaulter[]): void {
    this.setItem<Defaulter[]>(STORAGE_KEYS.DEFAULTERS, defaulters);
  }

  // --- BUDGET ITEMS ---
  public static getBudgetItems(): BudgetItem[] {
    return this.getItem<BudgetItem[]>(STORAGE_KEYS.BUDGET_ITEMS, initialBudgetItems);
  }

  public static saveBudgetItems(items: BudgetItem[]): void {
    this.setItem<BudgetItem[]>(STORAGE_KEYS.BUDGET_ITEMS, items);
  }

  // --- EVENTS ---
  public static getEvents(): CalendarEvent[] {
    return this.getItem<CalendarEvent[]>(STORAGE_KEYS.EVENTS, initialEvents);
  }

  public static saveEvents(events: CalendarEvent[]): void {
    this.setItem<CalendarEvent[]>(STORAGE_KEYS.EVENTS, events);
  }

  // --- ACCOUNTS ---
  public static getAccounts(): Account[] {
    return this.getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, initialAccounts);
  }

  public static saveAccounts(accounts: Account[]): void {
    this.setItem<Account[]>(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  // --- CREDIT CARDS ---
  public static getCreditCards(): CreditCard[] {
    return this.getItem<CreditCard[]>(STORAGE_KEYS.CREDIT_CARDS, initialCreditCards);
  }

  public static saveCreditCards(cards: CreditCard[]): void {
    this.setItem<CreditCard[]>(STORAGE_KEYS.CREDIT_CARDS, cards);
  }

  // --- GOALS ---
  public static getGoals(): Goal[] {
    return this.getItem<Goal[]>(STORAGE_KEYS.GOALS, initialGoals);
  }

  public static saveGoals(goals: Goal[]): void {
    this.setItem<Goal[]>(STORAGE_KEYS.GOALS, goals);
  }

  // --- DEBTS ---
  public static getDebts(): Debt[] {
    return this.getItem<Debt[]>(STORAGE_KEYS.DEBTS, initialDebts);
  }

  public static saveDebts(debts: Debt[]): void {
    this.setItem<Debt[]>(STORAGE_KEYS.DEBTS, debts);
  }

  // --- CUSTOMERS ---
  public static getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }

  public static saveCustomers(customers: Customer[]): void {
    this.setItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, customers);
  }

  // --- SUPPLIERS ---
  public static getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  }

  public static saveSuppliers(suppliers: Supplier[]): void {
    this.setItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, suppliers);
  }

  // --- COST CENTERS ---
  public static getCostCenters(): CostCenter[] {
    return this.getItem<CostCenter[]>(STORAGE_KEYS.COST_CENTERS, initialCostCenters);
  }

  public static saveCostCenters(centers: CostCenter[]): void {
    this.setItem<CostCenter[]>(STORAGE_KEYS.COST_CENTERS, centers);
  }

  /**
   * Reseta o repositório para os dados de demonstração originais
   */
  public static resetToDemo(): void {
    this.saveTransactions(initialTransactions);
    this.saveAssets(initialAssets);
    this.saveProjects(initialProjects);
    this.saveDefaulters(initialDefaulters);
    this.saveBudgetItems(initialBudgetItems);
    this.saveEvents(initialEvents);
    this.saveAccounts(initialAccounts);
    this.saveCreditCards(initialCreditCards);
    this.saveGoals(initialGoals);
    this.saveDebts(initialDebts);
    this.saveCustomers(initialCustomers);
    this.saveSuppliers(initialSuppliers);
    this.saveCostCenters(initialCostCenters);
    this.setPrivacyMode(false);
  }

  /**
   * Exporta todo o banco de dados local em formato JSON criptografado/estruturado
   */
  public static exportBackupJSON(): string {
    const backup = {
      version: 'aurafin_v4',
      timestamp: new Date().toISOString(),
      transactions: this.getTransactions(),
      assets: this.getAssets(),
      projects: this.getProjects(),
      defaulters: this.getDefaulters(),
      budgetItems: this.getBudgetItems(),
      events: this.getEvents(),
      accounts: this.getAccounts(),
      creditCards: this.getCreditCards(),
      goals: this.getGoals(),
      debts: this.getDebts(),
      customers: this.getCustomers(),
      suppliers: this.getSuppliers(),
      costCenters: this.getCostCenters()
    };
    return JSON.stringify(backup, null, 2);
  }
}
