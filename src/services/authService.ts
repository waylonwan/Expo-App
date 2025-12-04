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

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(
      '/auth/login',
      credentials,
      false
    );

    if (response.success && response.data) {
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
