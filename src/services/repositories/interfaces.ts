import { Account, Transaction } from '../../types';

export interface IPersonalAccountRepository {
  list(userId: string): Promise<Account[]>;
  create(account: Partial<Account>, userId: string): Promise<Account>;
  update(account: Account, userId: string): Promise<Account>;
  archive(id: string, userId: string): Promise<void>;
}

export interface IPersonalTransactionRepository {
  list(userId: string): Promise<Transaction[]>;
  create(tx: Partial<Transaction>, userId: string): Promise<Transaction>;
  update(tx: Transaction, userId: string): Promise<Transaction>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IBusinessAccountRepository {
  list(organizationId: string): Promise<Account[]>;
  create(account: Partial<Account>, organizationId: string): Promise<Account>;
  update(account: Account, organizationId: string): Promise<Account>;
  archive(id: string, organizationId: string): Promise<void>;
}

export interface IBusinessTransactionRepository {
  list(organizationId: string): Promise<Transaction[]>;
  create(tx: Partial<Transaction>, organizationId: string): Promise<Transaction>;
  update(tx: Transaction, organizationId: string): Promise<Transaction>;
  delete(id: string, organizationId: string): Promise<void>;
}
