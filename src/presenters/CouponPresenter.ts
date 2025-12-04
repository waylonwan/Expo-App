import { couponService } from '../services';
import { Coupon, RedeemCouponResponse } from '../models';

export interface CouponViewCallbacks {
  showLoading: () => void;
  hideLoading: () => void;
  showError: (message: string) => void;
  renderCoupons: (coupons: Coupon[]) => void;
  showRedeemSuccess: (response: RedeemCouponResponse) => void;
  showRedeemConfirmation: (coupon: Coupon) => void;
}

export class CouponPresenter {
  private callbacks: CouponViewCallbacks;

  constructor(callbacks: CouponViewCallbacks) {
    this.callbacks = callbacks;
  }

  async loadAvailableCoupons(): Promise<void> {
    this.callbacks.showLoading();

    try {
      const response = await couponService.getAvailableCoupons();

      if (response.success && response.data) {
        this.callbacks.renderCoupons(response.data.coupons);
      } else {
        this.callbacks.showError(response.error?.message || 'errors.unknownError');
      }
    } catch (error) {
      this.callbacks.showError('errors.networkError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  async loadRedeemedCoupons(): Promise<void> {
    this.callbacks.showLoading();

    try {
      const response = await couponService.getRedeemedCoupons();

      if (response.success && response.data) {
        this.callbacks.renderCoupons(response.data.coupons);
      } else {
        this.callbacks.showError(response.error?.message || 'errors.unknownError');
      }
    } catch (error) {
      this.callbacks.showError('errors.networkError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  onRedeemTapped(coupon: Coupon): void {
    this.callbacks.showRedeemConfirmation(coupon);
  }

  async confirmRedeem(memberId: string, coupon: Coupon): Promise<void> {
    this.callbacks.showLoading();

    try {
      const response = await couponService.redeemCoupon({
        memberId,
        couponId: coupon.id,
      });

      if (response.success && response.data) {
        this.callbacks.showRedeemSuccess(response.data);
      } else {
        this.callbacks.showError(response.error?.message || 'coupons.redeemFailed');
      }
    } catch (error) {
      this.callbacks.showError('errors.networkError');
    } finally {
      this.callbacks.hideLoading();
    }
  }

  formatExpiryDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatPointsCost(points: number): string {
    return points.toLocaleString();
  }

  getCategoryLabel(category: Coupon['category']): string {
    const labels: Record<Coupon['category'], string> = {
      discount: 'Discount',
      gift: 'Gift',
      special: 'Special',
      partner: 'Partner',
    };
    return labels[category];
  }

  getCategoryColor(category: Coupon['category']): string {
    const colors: Record<Coupon['category'], string> = {
      discount: '#3B82F6',
      gift: '#8B5CF6',
      special: '#F59E0B',
      partner: '#10B981',
    };
    return colors[category];
  }
}

export default CouponPresenter;
