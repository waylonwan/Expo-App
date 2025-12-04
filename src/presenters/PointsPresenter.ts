import { pointsService } from '../services';
import { PointsBalance, Transaction } from '../models';

export interface PointsViewCallbacks {
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  renderBalance: (balance: PointsBalance) => void;
  renderTransactions: (transactions: Transaction[], hasMore: boolean) => void;
  appendTransactions: (transactions: Transaction[], hasMore: boolean) => void;
}

export class PointsPresenter {
  private callbacks: PointsViewCallbacks;
  private currentPage: number = 1;
  private pageSize: number = 20;
  private hasMoreTransactions: boolean = true;

  constructor(callbacks: PointsViewCallbacks) {
    this.callbacks = callbacks;
  }

  async loadPointsBalance(): Promise<void> {
    try {
      const response = await pointsService.getPointsBalance();

      if (response.success && response.data) {
        this.callbacks.renderBalance(response.data);
      } else {
        this.callbacks.showError(response.error?.message || 'errors.unknownError');
      }
    } catch (error) {
      this.callbacks.showError('errors.networkError');
    }
  }

  async loadTransactionHistory(refresh: boolean = false): Promise<void> {
    if (refresh) {
      this.currentPage = 1;
      this.hasMoreTransactions = true;
    }

    if (!this.hasMoreTransactions && !refresh) {
      return;
    }

    this.callbacks.showLoading();

    try {
      const response = await pointsService.getTransactionHistory({
        page: this.currentPage,
        pageSize: this.pageSize,
      });

      if (response.success && response.data) {
        const { transactions, totalCount } = response.data;
        const totalPages = Math.ceil(totalCount / this.pageSize);
        this.hasMoreTransactions = this.currentPage < totalPages;

        if (refresh || this.currentPage === 1) {
          this.callbacks.renderTransactions(transactions, this.hasMoreTransactions);
        } else {
          this.callbacks.appendTransactions(transactions, this.hasMoreTransactions);
        }

        this.currentPage += 1;
      } else {
        this.callbacks.showError(response.error?.message || 'errors.unknownError');
      }
    } catch (error) {
      this.callbacks.showError('errors.networkError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  async refresh(): Promise<void> {
    await Promise.all([
      this.loadPointsBalance(),
      this.loadTransactionHistory(true),
    ]);
  }

  async loadMore(): Promise<void> {
    if (this.hasMoreTransactions) {
      await this.loadTransactionHistory(false);
    }
  }

  formatPoints(points: number): string {
    const sign = points >= 0 ? '+' : '';
    return `${sign}${points.toLocaleString()}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getTransactionTypeKey(type: Transaction['type']): string {
    const typeKeys: Record<Transaction['type'], string> = {
      earn: 'points.earn',
      redeem: 'points.redeem',
      expire: 'points.expire',
      adjust: 'points.adjust',
    };
    return typeKeys[type];
  }

  getTransactionColor(type: Transaction['type']): string {
    const colors: Record<Transaction['type'], string> = {
      earn: '#22C55E',
      redeem: '#F97316',
      expire: '#EF4444',
      adjust: '#6B7280',
    };
    return colors[type];
  }
}

export default PointsPresenter;
