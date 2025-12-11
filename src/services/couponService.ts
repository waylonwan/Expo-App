import { apiClient } from './apiClient';
import { Coupon, CouponListResponse, RedeemCouponRequest, RedeemCouponResponse } from '../models';
import { ApiResponse } from '../types/api';

class CouponService {
  async getAvailableCoupons(): Promise<ApiResponse<CouponListResponse>> {
    return apiClient.get<CouponListResponse>('/members/me/coupons/available');
  }

  async getRedeemedCoupons(): Promise<ApiResponse<CouponListResponse>> {
    return apiClient.get<CouponListResponse>('/members/me/coupons/redeemed');
  }

  async getCouponDetails(couponId: string): Promise<ApiResponse<Coupon>> {
    return apiClient.get<Coupon>(`/coupons/${couponId}`);
  }

  async redeemCoupon(request: RedeemCouponRequest): Promise<ApiResponse<RedeemCouponResponse>> {
    return apiClient.post<RedeemCouponResponse>(
      `/coupons/${request.couponId}/redeem`,
      { memberId: request.memberId }
    );
  }
}

export const couponService = new CouponService();
export default couponService;
