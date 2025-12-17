import { Coupon, CouponListResponse, RedeemCouponRequest, RedeemCouponResponse } from '../models';
import { ApiResponse } from '../types/api';

const mockAvailableCoupons: Coupon[] = [
  {
    id: '1',
    title: '消費滿$500減$50',
    description: '全線門市適用，不可與其他優惠同時使用',
    pointsCost: 500,
    expiryDate: '2025-03-31',
    termsAndConditions: '1. 此優惠券只適用於正價貨品\n2. 每次消費只可使用一張\n3. 不可兌換現金\n4. 如有任何爭議，Baleno保留最終決定權',
    imageUrl: '',
    isRedeemed: false,
    category: 'discount',
  },
  {
    id: '2',
    title: '消費滿$300減$30',
    description: '全線門市適用',
    pointsCost: 300,
    expiryDate: '2025-02-28',
    termsAndConditions: '1. 此優惠券只適用於正價貨品\n2. 每次消費只可使用一張\n3. 不可兌換現金',
    imageUrl: '',
    isRedeemed: false,
    category: 'discount',
  },
  {
    id: '3',
    title: '免費T恤一件',
    description: '指定款式T恤，數量有限，換完即止',
    pointsCost: 1000,
    expiryDate: '2025-01-31',
    termsAndConditions: '1. 只限指定款式\n2. 數量有限，換完即止\n3. 不可兌換現金或其他貨品',
    imageUrl: '',
    isRedeemed: false,
    category: 'gift',
  },
  {
    id: '4',
    title: '9折優惠券',
    description: '單一正價貨品可享9折優惠',
    pointsCost: 200,
    expiryDate: '2025-04-30',
    termsAndConditions: '1. 只適用於單一正價貨品\n2. 不可與其他優惠同時使用',
    imageUrl: '',
    isRedeemed: false,
    category: 'discount',
  },
];

const mockRedeemedCoupons: Coupon[] = [
  {
    id: '101',
    title: '消費滿$200減$20',
    description: '全線門市適用',
    pointsCost: 200,
    expiryDate: '2025-01-15',
    termsAndConditions: '1. 此優惠券只適用於正價貨品\n2. 每次消費只可使用一張',
    imageUrl: '',
    isRedeemed: true,
    redemptionCode: 'BALENO2024ABC123',
    redeemedAt: '2024-12-10',
    category: 'discount',
  },
  {
    id: '102',
    title: '8折優惠券',
    description: '單一正價貨品可享8折優惠',
    pointsCost: 400,
    expiryDate: '2024-12-31',
    termsAndConditions: '1. 只適用於單一正價貨品',
    imageUrl: '',
    isRedeemed: true,
    redemptionCode: 'BALENO2024XYZ789',
    redeemedAt: '2024-12-05',
    category: 'discount',
  },
];

class CouponService {
  async getAvailableCoupons(): Promise<ApiResponse<CouponListResponse>> {
    // 使用 Mock 資料
    return {
      success: true,
      data: {
        coupons: mockAvailableCoupons,
        totalCount: mockAvailableCoupons.length,
      },
    };
  }

  async getRedeemedCoupons(): Promise<ApiResponse<CouponListResponse>> {
    // 使用 Mock 資料
    return {
      success: true,
      data: {
        coupons: mockRedeemedCoupons,
        totalCount: mockRedeemedCoupons.length,
      },
    };
  }

  async getCouponDetails(couponId: string): Promise<ApiResponse<Coupon>> {
    // 使用 Mock 資料
    const allCoupons = [...mockAvailableCoupons, ...mockRedeemedCoupons];
    const coupon = allCoupons.find(c => c.id === couponId);
    
    if (coupon) {
      return {
        success: true,
        data: coupon,
      };
    }
    
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '找不到此優惠券',
      },
    };
  }

  async redeemCoupon(request: RedeemCouponRequest): Promise<ApiResponse<RedeemCouponResponse>> {
    // 模擬兌換成功
    const coupon = mockAvailableCoupons.find(c => c.id === request.couponId);
    
    if (!coupon) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '找不到此優惠券',
        },
      };
    }

    const redemptionCode = `BALENO${Date.now().toString(36).toUpperCase()}`;
    
    return {
      success: true,
      data: {
        success: true,
        redemptionCode: redemptionCode,
        redeemedAt: new Date().toISOString(),
        message: '兌換成功',
      },
    };
  }
}

export const couponService = new CouponService();
export default couponService;
