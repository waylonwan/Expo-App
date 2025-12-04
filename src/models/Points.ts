export interface PointsBalance {
  currentPoints: number;
  lifetimePoints: number;
  expiringPoints: number;
  expiryDate?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  description: string;
  points: number;
  storeLocation?: string;
  receiptNumber?: string;
  amount?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
}
