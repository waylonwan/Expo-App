import * as SecureStore from 'expo-secure-store';
import { ApiResponse, RequestConfig } from '../types/api';

const AUTH_TOKEN_KEY = 'baleno_auth_token';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://api.example.com/v1';
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, endpoint, body, params, requiresAuth = true } = config;

    try {
      const url = new URL(endpoint, this.baseUrl);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (requiresAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.status === 401) {
        await this.clearAuthToken();
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Your session has expired. Please log in again.',
          },
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorData.code || 'API_ERROR',
            message: errorData.message || `Request failed with status ${response.status}`,
            details: errorData.details,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('API request error:', error);

      if (error instanceof TypeError && error.message.includes('Network')) {
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: 'Unable to connect to the server. Please check your internet connection.',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred. Please try again.',
        },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | undefined>, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', endpoint, params, requiresAuth });
  }

  async post<T>(endpoint: string, body?: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', endpoint, body, requiresAuth });
  }

  async put<T>(endpoint: string, body?: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', endpoint, body, requiresAuth });
  }

  async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', endpoint, requiresAuth });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
