import { apiClient } from './client';
import type { Player } from '../../../shared/types';

export interface Transaction {
  id: string;
  from_player: string | null;
  to_player: string | null;
  from_username: string | null;
  to_username: string | null;
  amount: string;
  type: string;
  created_at: string;
}

export const economyApi = {
  claimDailyBonus: () =>
    apiClient.post<{ success: boolean; data: { player: Player; transaction: Transaction } }>(
      '/economy/daily-bonus'
    ),
  getTransactions: (limit = 20) =>
    apiClient.get<{ success: boolean; data: { transactions: Transaction[] } }>(
      `/economy/transactions?limit=${limit}`
    ),
  getSupply: () =>
    apiClient.get<{ success: boolean; data: { total: number } }>('/economy/supply'),
};
