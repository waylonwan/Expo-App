import { apiClient } from './apiClient';
import { PointsBalance, TransactionListResponse, Transaction } from '../models';
import { ApiResponse, PaginationParams } from '../types/api';

/**
 * 後端 API 回應格式
 */
interface BackendApiResponse {
  RTN_CODE: 'OK' | 'ERR';
  RTN_HEADER: string;
  RTN_DATA: any;
}

/**
 * 後端交易記錄格式
 */
interface BackendTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  points: number;
  storeLocation?: string;
  amount?: number;
}

class PointsService {
  async getPointsBalance(): Promise<ApiResponse<PointsBalance>> {
    // 暫時使用預設值，因為積分已在 getMember 時取得
    // TODO: 當後端有獨立積分 API 時，改為呼叫實際 API
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
    console.log('[PointsService] 取得交易記錄...');
    
    const response = await apiClient.get<BackendApiResponse[]>(
      '/ctlCRMAppAPI',
      {
        action: 'getTransactions',
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
      },
      true, // 需要 Authorization header
    );

    if (response.success && response.data) {
      const backendResponse = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (backendResponse.RTN_CODE === 'OK') {
        const rtnData = backendResponse.RTN_DATA;
        
        // 轉換交易記錄格式
        const transactions: Transaction[] = (rtnData.transactions || []).map((tx: BackendTransaction) => ({
          id: tx.id || '',
          date: tx.date || '',
          type: (tx.type as 'earn' | 'redeem' | 'expire' | 'adjust') || 'earn',
          description: tx.description || '',
          points: tx.points || 0,
          storeLocation: tx.storeLocation || '',
          amount: tx.amount || 0,
        }));

        console.log('[PointsService] 取得交易記錄成功，共', transactions.length, '筆');
        
        return {
          success: true,
          data: {
            transactions,
            totalCount: rtnData.totalCount || 0,
            page: rtnData.page || 1,
            pageSize: rtnData.pageSize || 20,
          },
        };
      } else {
        console.log('[PointsService] 後端回傳錯誤:', backendResponse.RTN_DATA);
        return {
          success: false,
          error: {
            code: 'GET_TRANSACTIONS_FAILED',
            message: backendResponse.RTN_DATA || '取得交易記錄失敗',
          },
        };
      }
    }

    console.log('[PointsService] API 請求失敗:', response.error);
    return {
      success: false,
      error: response.error || {
        code: 'UNKNOWN_ERROR',
        message: '取得交易記錄時發生未知錯誤',
      },
    };
  }
}

export const pointsService = new PointsService();
export default pointsService;
