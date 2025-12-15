import { apiClient } from './apiClient';
import { PointsBalance, TransactionListResponse } from '../models';
import { ApiResponse, PaginationParams } from '../types/api';

class PointsService {
  async getPointsBalance(): Promise<ApiResponse<PointsBalance>> {
    // 暫時使用預設值，因為後端目前沒有積分 API
    // TODO: 當後端有積分 API 時，改為呼叫實際 API
    return {
      success: true,
      data: {
        currentPoints: 0,
        lifetimePoints: 0,
        expiringPoints: 0,
        expiryDate: undefined,
      },
    };
  }

  async getTransactionHistory(params?: PaginationParams): Promise<ApiResponse<TransactionListResponse>> {
    return apiClient.get<TransactionListResponse>('/members/me/transactions', {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    });
  }
}

export const pointsService = new PointsService();
export default pointsService;
