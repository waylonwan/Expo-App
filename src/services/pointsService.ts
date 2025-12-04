import { apiClient } from './apiClient';
import { PointsBalance, TransactionListResponse } from '../models';
import { ApiResponse, PaginationParams } from '../types/api';
import { authService } from './authService';
import { mockPointsBalance, mockTransactions } from './mockData';

class PointsService {
  async getPointsBalance(): Promise<ApiResponse<PointsBalance>> {
    if (authService.isDemoModeActive()) {
      return {
        success: true,
        data: mockPointsBalance,
      };
    }
    return apiClient.get<PointsBalance>('/members/me/points');
  }

  async getTransactionHistory(params?: PaginationParams): Promise<ApiResponse<TransactionListResponse>> {
    if (authService.isDemoModeActive()) {
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedTransactions = mockTransactions.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          transactions: paginatedTransactions,
          totalCount: mockTransactions.length,
          page,
          pageSize,
        },
      };
    }

    return apiClient.get<TransactionListResponse>('/members/me/transactions', {
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    });
  }
}

export const pointsService = new PointsService();
export default pointsService;
