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
import { isDemoAccount, mockMember, DEMO_CREDENTIALS } from './mockData';

const DEMO_TOKEN = 'demo-access-token-12345';

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
 * 後端會員資料格式 (mdlMember)
 */
interface BackendMember {
  memberId: string;
  memberNo: string;
  name: string;
  phone: string;
  email: string;
  memberLevel: string;
  currentPoints: number;
  expiringPoints: number;
  expiringDate: string;
  joinDate: string;
}

/**
 * 將後端 Member 轉換為 App Member
 */
function transformBackendMember(backendMember: BackendMember): Member {
  return {
    id: backendMember.memberId,
    name: backendMember.name,
    phone: backendMember.phone,
    email: backendMember.email,
    joinDate: backendMember.joinDate,
    isVerified: true,
    currentPoints: backendMember.currentPoints,
    expiringPoints: backendMember.expiringPoints,
    expiringDate: backendMember.expiringDate,
  };
}

type DemoResetCallback = () => void;

class AuthService {
  private isDemoMode: boolean = false;
  private demoResetCallbacks: DemoResetCallback[] = [];

  registerDemoResetCallback(callback: DemoResetCallback): void {
    this.demoResetCallbacks.push(callback);
  }

  private resetDemoState(): void {
    this.demoResetCallbacks.forEach(callback => callback());
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    if (isDemoAccount(credentials.phone, credentials.password)) {
      this.isDemoMode = true;
      this.resetDemoState();
      await apiClient.setAuthToken(DEMO_TOKEN);
      
      return {
        success: true,
        data: {
          member: mockMember,
          tokens: {
            accessToken: DEMO_TOKEN,
            refreshToken: 'demo-refresh-token',
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          },
        },
      };
    }

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
        
        this.isDemoMode = false;
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
      this.isDemoMode = false;
      await apiClient.setAuthToken(response.data.tokens.accessToken);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      if (!this.isDemoMode) {
        await apiClient.post('/auth/logout', {}, true);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      if (this.isDemoMode) {
        this.resetDemoState();
      }
      this.isDemoMode = false;
      await apiClient.clearAuthToken();
    }
  }

  async getCurrentMember(): Promise<ApiResponse<Member>> {
    if (this.isDemoMode) {
      return {
        success: true,
        data: mockMember,
      };
    }
    return apiClient.get<Member>('/members/me');
  }

  async checkAuthToken(): Promise<boolean> {
    const token = await apiClient.getAuthToken();
    if (token === DEMO_TOKEN) {
      this.isDemoMode = true;
    }
    return !!token;
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    if (this.isDemoMode) {
      return {
        success: true,
        data: {
          accessToken: DEMO_TOKEN,
          refreshToken: 'demo-refresh-token',
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        },
      };
    }

    const response = await apiClient.post<AuthTokens>('/auth/refresh', {});
    
    if (response.success && response.data) {
      await apiClient.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  async updatePushToken(pushToken: string): Promise<ApiResponse<void>> {
    if (this.isDemoMode) {
      return { success: true };
    }
    return apiClient.post('/members/push-token', { pushToken });
  }

  isDemoModeActive(): boolean {
    return this.isDemoMode;
  }

  setDemoMode(value: boolean): void {
    this.isDemoMode = value;
  }
}

export const authService = new AuthService();
export default authService;
