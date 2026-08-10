import { Transaction } from '../../../types';
import { StorageRepository } from '../../storage/storageRepository';
import { IPersonalTransactionRepository } from '../interfaces';

export class LocalPersonalTransactionRepository implements IPersonalTransactionRepository {
  async list(_userId: string): Promise<Transaction[]> {
    return StorageRepository.getTransactions().filter(t => t.context === 'PF');
  }

  async create(tx: Partial<Transaction>, _userId: string): Promise<Transaction> {
    const all = StorageRepository.getTransactions();
    const newTx: Transaction = {
      id: tx.id || `tx_pf_${Date.now()}`,
      context: 'PF',
      type: tx.type || 'expense',
      title: tx.title || 'Lançamento PF',
      amount: tx.amount || 0,
      amountCents: Math.round((tx.amount || 0) * 100),
      date: tx.date || new Date().toISOString().split('T')[0],
      category: tx.category || 'outros',
      accountId: tx.accountId,
      creditCardId: tx.creditCardId,
      crossContextId: tx.crossContextId,
      notes: tx.notes,
    };
    StorageRepository.saveTransactions([newTx, ...all]);
    return newTx;
  }

  async update(tx: Transaction, _userId: string): Promise<Transaction> {
    const all = StorageRepository.getTransactions();
    const updated = all.map(t => (t.id === tx.id ? tx : t));
    StorageRepository.saveTransactions(updated);
    return tx;
  }

  async delete(id: string, _userId: string): Promise<void> {
    const all = StorageRepository.getTransactions();
    const filtered = all.filter(t => t.id !== id);
    StorageRepository.saveTransactions(filtered);
  }
}
