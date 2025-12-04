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
    if (isDemoAccount(credentials.email, credentials.password)) {
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

    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
      false
    );

    if (response.success && response.data) {
      this.isDemoMode = false;
      await apiClient.setAuthToken(response.data.tokens.accessToken);
    }

    return response;
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
