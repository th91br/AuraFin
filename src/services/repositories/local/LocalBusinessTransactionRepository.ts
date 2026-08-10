import { Transaction } from '../../../types';
import { StorageRepository } from '../../storage/storageRepository';
import { IBusinessTransactionRepository } from '../interfaces';

export class LocalBusinessTransactionRepository implements IBusinessTransactionRepository {
  async list(_organizationId: string): Promise<Transaction[]> {
    return StorageRepository.getTransactions().filter(t => t.context === 'PJ');
  }

  async create(tx: Partial<Transaction>, _organizationId: string): Promise<Transaction> {
    const all = StorageRepository.getTransactions();
    const newTx: Transaction = {
      id: tx.id || `tx_pj_${Date.now()}`,
      context: 'PJ',
      type: tx.type || 'expense',
      title: tx.title || 'Lançamento PJ',
      amount: tx.amount || 0,
      amountCents: Math.round((tx.amount || 0) * 100),
      date: tx.date || new Date().toISOString().split('T')[0],
      category: tx.category || 'software_infra',
      accountId: tx.accountId,
      corporateCardId: tx.corporateCardId,
      clientId: tx.clientId,
      supplierId: tx.supplierId,
      projectId: tx.projectId,
      costCenterId: tx.costCenterId,
      crossContextId: tx.crossContextId,
      isPaidByPF: tx.isPaidByPF || false,
      isPersonalExpenseInPJ: tx.isPersonalExpenseInPJ || false,
      notes: tx.notes,
    };
    StorageRepository.saveTransactions([newTx, ...all]);
    return newTx;
  }

  async update(tx: Transaction, _organizationId: string): Promise<Transaction> {
    const all = StorageRepository.getTransactions();
    const updated = all.map(t => (t.id === tx.id ? tx : t));
    StorageRepository.saveTransactions(updated);
    return tx;
  }

  async delete(id: string, _organizationId: string): Promise<void> {
    const all = StorageRepository.getTransactions();
    const filtered = all.filter(t => t.id !== id);
    StorageRepository.saveTransactions(filtered);
  }
}
