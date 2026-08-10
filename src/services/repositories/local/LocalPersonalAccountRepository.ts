import { Account } from '../../../types';
import { StorageRepository } from '../../storage/storageRepository';
import { IPersonalAccountRepository } from '../interfaces';

export class LocalPersonalAccountRepository implements IPersonalAccountRepository {
  async list(_userId: string): Promise<Account[]> {
    return StorageRepository.getAccounts().filter(a => a.context === 'PF');
  }

  async create(account: Partial<Account>, _userId: string): Promise<Account> {
    const all = StorageRepository.getAccounts();
    const newAcc: Account = {
      id: account.id || `acc_pf_${Date.now()}`,
      name: account.name || 'Nova Conta PF',
      type: account.type || 'corrente',
      institution: account.institution || 'Outros',
      balance: account.balance || 0,
      context: 'PF',
    };
    StorageRepository.saveAccounts([newAcc, ...all]);
    return newAcc;
  }

  async update(account: Account, _userId: string): Promise<Account> {
    const all = StorageRepository.getAccounts();
    const updated = all.map(a => (a.id === account.id ? account : a));
    StorageRepository.saveAccounts(updated);
    return account;
  }

  async archive(id: string, _userId: string): Promise<void> {
    const all = StorageRepository.getAccounts();
    const filtered = all.filter(a => a.id !== id);
    StorageRepository.saveAccounts(filtered);
  }
}
