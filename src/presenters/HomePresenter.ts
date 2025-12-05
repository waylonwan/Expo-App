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
      const response = await pointsService.getPointsBalance();

      if (response.success && response.data) {
        this.callbacks.renderPoints(response.data);
      } else {
        this.callbacks.showError(response.error?.message || 'errors.unknownError');
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
    const tierLabels: Record<Member['membershipTier'], string> = {
      standard: 'Standard',
      silver: 'Silver',
      gold: 'Gold',
      platinum: 'Platinum',
    };
    return tierLabels[tier];
  }
}

export default HomePresenter;
