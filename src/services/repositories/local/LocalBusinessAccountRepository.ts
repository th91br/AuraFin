import { Account } from '../../../types';
import { StorageRepository } from '../../storage/storageRepository';
import { IBusinessAccountRepository } from '../interfaces';

export class LocalBusinessAccountRepository implements IBusinessAccountRepository {
  async list(_organizationId: string): Promise<Account[]> {
    return StorageRepository.getAccounts().filter(a => a.context === 'PJ');
  }

  async create(account: Partial<Account>, _organizationId: string): Promise<Account> {
    const all = StorageRepository.getAccounts();
    const newAcc: Account = {
      id: account.id || `acc_pj_${Date.now()}`,
      name: account.name || 'Nova Conta PJ',
      type: account.type || 'corrente',
      institution: account.institution || 'Outros',
      balance: account.balance || 0,
      context: 'PJ',
    };
    StorageRepository.saveAccounts([newAcc, ...all]);
    return newAcc;
  }

  async update(account: Account, _organizationId: string): Promise<Account> {
    const all = StorageRepository.getAccounts();
    const updated = all.map(a => (a.id === account.id ? account : a));
    StorageRepository.saveAccounts(updated);
    return account;
  }

  async archive(id: string, _organizationId: string): Promise<void> {
    const all = StorageRepository.getAccounts();
    const filtered = all.filter(a => a.id !== id);
    StorageRepository.saveAccounts(filtered);
  }
}
