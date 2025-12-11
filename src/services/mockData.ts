import { PointsBalance, Transaction, Coupon } from '../models';

export const mockPointsBalance: PointsBalance = {
  currentPoints: 2580,
  lifetimePoints: 15420,
  expiringPoints: 500,
  expiryDate: '2025-03-31',
};

export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    type: 'earn',
    points: 150,
    description: '門市消費',
    date: '2024-12-01T14:30:00Z',
    storeLocation: '銅鑼灣店',
    orderId: 'ORD-2024120001',
  },
  {
    id: 'txn-002',
    type: 'earn',
    points: 80,
    description: '門市消費',
    date: '2024-11-28T11:20:00Z',
    storeLocation: '旺角店',
    orderId: 'ORD-2024112801',
  },
  {
    id: 'txn-003',
    type: 'redeem',
    points: -200,
    description: '兌換優惠券 - 滿$500減$50',
    date: '2024-11-25T16:45:00Z',
    storeLocation: '網上商店',
  },
  {
    id: 'txn-004',
    type: 'earn',
    points: 320,
    description: '門市消費',
    date: '2024-11-20T10:15:00Z',
    storeLocation: '沙田店',
    orderId: 'ORD-2024112001',
  },
  {
    id: 'txn-005',
    type: 'earn',
    points: 50,
    description: '生日獎賞積分',
    date: '2024-11-15T00:00:00Z',
  },
  {
    id: 'txn-006',
    type: 'expire',
    points: -100,
    description: '積分過期',
    date: '2024-10-31T23:59:59Z',
  },
  {
    id: 'txn-007',
    type: 'earn',
    points: 200,
    description: '門市消費',
    date: '2024-10-15T13:00:00Z',
    storeLocation: '尖沙咀店',
    orderId: 'ORD-2024101501',
  },
  {
    id: 'txn-008',
    type: 'adjust',
    points: 100,
    description: '客戶服務調整',
    date: '2024-10-10T09:30:00Z',
  },
  {
    id: 'txn-009',
    type: 'redeem',
    points: -500,
    description: '兌換優惠券 - 滿$1000減$100',
    date: '2024-09-28T15:20:00Z',
    storeLocation: '銅鑼灣店',
  },
  {
    id: 'txn-010',
    type: 'earn',
    points: 180,
    description: '門市消費',
    date: '2024-09-20T12:00:00Z',
    storeLocation: '旺角店',
    orderId: 'ORD-2024092001',
  },
];

export const mockAvailableCoupons: Coupon[] = [
  {
    id: 'coupon-001',
    title: '滿$500減$50',
    description: '購物滿港幣$500或以上，即減$50。適用於所有正價貨品。',
    pointsCost: 200,
    category: 'discount',
    expiryDate: '2025-01-31',
    termsAndConditions: '不可與其他優惠同時使用。每次購物只可使用一張優惠券。',
    isRedeemed: false,
  },
  {
    id: 'coupon-002',
    title: '滿$1000減$150',
    description: '購物滿港幣$1000或以上，即減$150。適用於所有正價貨品。',
    pointsCost: 500,
    category: 'discount',
    expiryDate: '2025-02-28',
    termsAndConditions: '不可與其他優惠同時使用。每次購物只可使用一張優惠券。',
    isRedeemed: false,
  },
  {
    id: 'coupon-003',
    title: '免費禮品包裝',
    description: '憑此優惠券可享免費精美禮品包裝服務。',
    pointsCost: 50,
    category: 'service',
    expiryDate: '2025-03-31',
    termsAndConditions: '只適用於門市購物。需於付款時出示優惠券。',
    isRedeemed: false,
  },
  {
    id: 'coupon-004',
    title: '雙倍積分日',
    description: '下次購物可享雙倍積分獎賞。',
    pointsCost: 100,
    category: 'bonus',
    expiryDate: '2025-01-15',
    termsAndConditions: '只限使用一次。不可與其他積分優惠同時使用。',
    isRedeemed: false,
  },
  {
    id: 'coupon-005',
    title: '新品優先體驗',
    description: '憑此優惠券可優先選購最新季度商品。',
    pointsCost: 300,
    category: 'exclusive',
    expiryDate: '2025-02-15',
    termsAndConditions: '需提前預約。名額有限，先到先得。',
    isRedeemed: false,
  },
];

export const mockRedeemedCoupons: Coupon[] = [
  {
    id: 'coupon-r001',
    title: '滿$300減$30',
    description: '購物滿港幣$300或以上，即減$30。',
    pointsCost: 100,
    category: 'discount',
    expiryDate: '2025-01-31',
    termsAndConditions: '不可與其他優惠同時使用。',
    isRedeemed: true,
    redemptionCode: 'BLN-2024-ABCD1234',
    qrCodeUrl: 'https://example.com/qr/coupon-r001',
    redeemedAt: '2024-11-25T16:45:00Z',
  },
  {
    id: 'coupon-r002',
    title: '免費改褲腳服務',
    description: '憑此優惠券可享免費改褲腳服務一次。',
    pointsCost: 80,
    category: 'service',
    expiryDate: '2024-12-31',
    termsAndConditions: '只適用於門市購買的褲類商品。',
    isRedeemed: true,
    redemptionCode: 'BLN-2024-EFGH5678',
    qrCodeUrl: 'https://example.com/qr/coupon-r002',
    redeemedAt: '2024-10-15T10:30:00Z',
  },
];

export function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BLN-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
