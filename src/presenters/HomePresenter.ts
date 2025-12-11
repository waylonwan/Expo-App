import { pointsService } from '../services';
import { PointsBalance, Member } from '../models';

export interface HomeViewCallbacks {
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  renderPoints: (balance: PointsBalance) => void;
  renderMember: (member: Member) => void;
}

export class HomePresenter {
  private callbacks: HomeViewCallbacks;

  constructor(callbacks: HomeViewCallbacks) {
    this.callbacks = callbacks;
  }

  async loadHomeData(member: Member): Promise<void> {
    this.callbacks.showLoading();
    this.callbacks.renderMember(member);

    try {
      // 優先使用 Member 中的積分資料（來自後端登入回應）
      if (member.currentPoints !== undefined) {
        const pointsFromMember: PointsBalance = {
          currentPoints: member.currentPoints,
          lifetimePoints: 0, // 後端暫無此欄位
          expiringPoints: member.expiringPoints || 0,
          expiryDate: member.expiringDate,
        };
        this.callbacks.renderPoints(pointsFromMember);
      } else {
        // 如果 Member 沒有積分資料，則從 pointsService 取得
        const response = await pointsService.getPointsBalance();

        if (response.success && response.data) {
          this.callbacks.renderPoints(response.data);
        } else {
          this.callbacks.showError(response.error?.message || 'errors.unknownError');
        }
      }
    } catch (error) {
      this.callbacks.showError('errors.networkError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  formatPoints(points: number): string {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  getMemberTierLabel(tier: Member['membershipTier']): string {
    if (!tier) return '';
    const tierLabels: Record<NonNullable<Member['membershipTier']>, string> = {
      standard: 'Standard',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
    };
    return tierLabels[tier];
  }
}

export default HomePresenter;
