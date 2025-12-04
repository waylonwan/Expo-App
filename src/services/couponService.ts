import { apiClient } from './apiClient';
import { Coupon, CouponListResponse, RedeemCouponRequest, RedeemCouponResponse } from '../models';
import { ApiResponse } from '../types/api';
import { authService } from './authService';
import { mockAvailableCoupons, mockRedeemedCoupons, generateRedemptionCode } from './mockData';

class CouponService {
  private localRedeemedCoupons: Coupon[] = [...mockRedeemedCoupons];
  private localAvailableCoupons: Coupon[] = [...mockAvailableCoupons];

  constructor() {
    authService.registerDemoResetCallback(() => this.resetMockData());
  }

  async getAvailableCoupons(): Promise<ApiResponse<CouponListResponse>> {
    if (authService.isDemoModeActive()) {
      return {
        success: true,
        data: {
          coupons: this.localAvailableCoupons.filter(c => !c.isRedeemed),
          totalCount: this.localAvailableCoupons.filter(c => !c.isRedeemed).length,
        },
      };
    }
    return apiClient.get<CouponListResponse>('/members/me/coupons/available');
  }

  async getRedeemedCoupons(): Promise<ApiResponse<CouponListResponse>> {
    if (authService.isDemoModeActive()) {
      return {
        success: true,
        data: {
          coupons: this.localRedeemedCoupons,
          totalCount: this.localRedeemedCoupons.length,
        },
      };
    }
    return apiClient.get<CouponListResponse>('/members/me/coupons/redeemed');
  }

  async getCouponDetails(couponId: string): Promise<ApiResponse<Coupon>> {
    if (authService.isDemoModeActive()) {
      const coupon = [...this.localAvailableCoupons, ...this.localRedeemedCoupons].find(c => c.id === couponId);
      if (coupon) {
        return { success: true, data: coupon };
      }
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Coupon not found' },
      };
    }
    return apiClient.get<Coupon>(`/coupons/${couponId}`);
  }

  async redeemCoupon(request: RedeemCouponRequest): Promise<ApiResponse<RedeemCouponResponse>> {
    if (authService.isDemoModeActive()) {
      const couponIndex = this.localAvailableCoupons.findIndex(c => c.id === request.couponId);
      if (couponIndex === -1) {
        return {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Coupon not found or already redeemed' },
        };
      }

      const coupon = this.localAvailableCoupons[couponIndex];
      const redemptionCode = generateRedemptionCode();
      const redeemedAt = new Date().toISOString();

      const redeemedCoupon: Coupon = {
        ...coupon,
        isRedeemed: true,
        redemptionCode,
        qrCodeUrl: `https://example.com/qr/${redemptionCode}`,
        redeemedAt,
      };

      this.localAvailableCoupons.splice(couponIndex, 1);
      this.localRedeemedCoupons.unshift(redeemedCoupon);

      return {
        success: true,
        data: {
          success: true,
          redemptionCode,
          qrCodeUrl: redeemedCoupon.qrCodeUrl,
          message: 'Coupon redeemed successfully!',
          redeemedAt,
        },
      };
    }

    return apiClient.post<RedeemCouponResponse>(
      `/coupons/${request.couponId}/redeem`,
      { memberId: request.memberId }
    );
  }

  resetMockData(): void {
    this.localAvailableCoupons = [...mockAvailableCoupons];
    this.localRedeemedCoupons = [...mockRedeemedCoupons];
  }
}

export const couponService = new CouponService();
export default couponService;
