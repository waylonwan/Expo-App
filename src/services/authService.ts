import { apiClient } from './apiClient';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  Member,
  AuthTokens 
} from '../models';
import { ApiResponse } from '../types/api';

/**
 * 後端 API 回應格式
 * [{"RTN_CODE":"OK","RTN_HEADER":"LOGIN","RTN_DATA":{...}}]
 */
interface BackendApiResponse {
  RTN_CODE: 'OK' | 'ERR';
  RTN_HEADER: string;
  RTN_DATA: any;
}

/**
 * 後端會員資料格式 (mdlCRM_VIP) - 欄位名與 CRM_VIP 表一致
 */
interface BackendMember {
  CUSTOMER_TEL: string;     // 手機號碼 (作為會員ID)
  CUSTOMER_NAME: string;    // 姓名
  CUSTOMER_SEX: string;     // 性別 0:男 1:女
  BIRTHDAY: string;         // 生日
  EMAIL: string;            // 電郵
  SYS_DATE: string;         // 註冊日期
  MEMBER_NO?: string;       // 會員編號
}

/**
 * 將後端 Member 轉換為 App Member
 */
function transformBackendMember(backendMember: BackendMember): Member {
  return {
    id: backendMember.CUSTOMER_TEL,
    name: backendMember.CUSTOMER_NAME || '',
    phone: backendMember.CUSTOMER_TEL,
    email: backendMember.EMAIL || '',
    joinDate: backendMember.SYS_DATE || '',
    birthDate: backendMember.BIRTHDAY || '',
    isVerified: true,
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    // 呼叫後端 API，使用 query parameters
    // 端點: /ctlCRMAppAPI?action=login&phone=xxx&password=xxx
    const response = await apiClient.get<BackendApiResponse[]>(
      '/ctlCRMAppAPI',
      {
        action: 'login',
        phone: credentials.phone,
        password: credentials.password,
      },
      false
    );

    if (response.success && response.data) {
      // 解析後端回應格式: [{"RTN_CODE":"OK","RTN_HEADER":"LOGIN","RTN_DATA":{...}}]
      const backendResponse = Array.isArray(response.data) 
        ? response.data[0] 
        : response.data;

      if (backendResponse.RTN_CODE === 'OK') {
        const rtnData = backendResponse.RTN_DATA;
        const backendMember: BackendMember = rtnData.member;
        const token: string = rtnData.token;

        // 轉換為 App 格式
        const member = transformBackendMember(backendMember);
        
        await apiClient.setAuthToken(token);

        return {
          success: true,
          data: {
            member,
            tokens: {
              accessToken: token,
              expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            },
          },
        };
      } else {
        // 後端回傳錯誤
        return {
          success: false,
          error: {
            code: 'LOGIN_FAILED',
            message: backendResponse.RTN_DATA || '登入失敗',
          },
        };
      }
    }

    return {
      success: false,
      error: response.error || {
        code: 'UNKNOWN_ERROR',
        message: '登入時發生未知錯誤',
      },
    };
  }

  async register(data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    const response = await apiClient.post<RegisterResponse>(
      '/auth/register',
      data,
      false
    );

    if (response.success && response.data) {
      await apiClient.setAuthToken(response.data.tokens.accessToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {}, true);
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await apiClient.clearAuthToken();
    }
  }

  async getCurrentMember(): Promise<ApiResponse<Member>> {
    return apiClient.get<Member>('/members/me');
  }

  async checkAuthToken(): Promise<boolean> {
    const token = await apiClient.getAuthToken();
    return !!token;
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const response = await apiClient.post<AuthTokens>('/auth/refresh', {});
    
    if (response.success && response.data) {
      await apiClient.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  async updatePushToken(pushToken: string): Promise<ApiResponse<void>> {
    return apiClient.post('/members/push-token', { pushToken });
  }
}

export const authService = new AuthService();
export default authService;
