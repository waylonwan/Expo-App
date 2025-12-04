import { apiClient } from './apiClient';
import { PointsBalance, TransactionListResponse } from '../models';
import { ApiResponse, PaginationParams } from '../types/api';

class PointsService {
  async getPointsBalance(): Promise<ApiResponse<PointsBalance>> {
    return apiClient.get<PointsBalance>('/members/me/points');
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
