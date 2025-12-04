export interface Coupon {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  expiryDate: string;
  imageUrl?: string;
  termsAndConditions?: string;
  isRedeemed: boolean;
  redemptionCode?: string;
  qrCodeUrl?: string;
  redeemedAt?: string;
  category: 'discount' | 'gift' | 'special' | 'partner' | 'service' | 'bonus' | 'exclusive';
}

export interface RedeemCouponRequest {
  memberId: string;
  couponId: string;
}

export interface RedeemCouponResponse {
  success: boolean;
  redemptionCode: string;
  qrCodeUrl?: string;
  message: string;
  redeemedAt: string;
}

export interface CouponListResponse {
  coupons: Coupon[];
  totalCount: number;
}
