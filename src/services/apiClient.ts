import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { ApiResponse, RequestConfig } from "../types/api";

const AUTH_TOKEN_KEY = "baleno_auth_token";

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://crmapp.baleno.com.hk:37210/wCRM";
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(AUTH_TOKEN_KEY);
      }
      return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.warn("Error getting auth token:", error);
      return null;
    }
  }

  async setAuthToken(token: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.warn("Error setting auth token:", error);
    }
  }

  async clearAuthToken(): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    } catch (error) {
      console.warn("Error clearing auth token:", error);
    }
  }

  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const { method, endpoint, body, params, requiresAuth = true } = config;

    try {
      // 正確構建 URL：將 endpoint 附加到 baseUrl 後面，而不是替換路徑
      const fullUrl = this.baseUrl + endpoint;
      const url = new URL(fullUrl);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      console.log("[ApiClient] 發送請求:", method, url.toString());

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (requiresAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      console.log(
        "[ApiClient] 請求 Headers:",
        JSON.stringify(headers, null, 2),
      );

      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log(
        "[ApiClient] 回應狀態:",
        response.status,
        response.statusText,
      );

      if (response.status === 401) {
        await this.clearAuthToken();
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Your session has expired. Please log in again.",
          },
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorData.code || "API_ERROR",
            message:
              errorData.message ||
              `Request failed with status ${response.status}`,
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
      console.error("[ApiClient] API 請求錯誤:", error);
      console.error(
        "[ApiClient] 錯誤詳情:",
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      );

      if (error instanceof TypeError && error.message.includes("Network")) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message:
              "Unable to connect to the server. Please check your internet connection.",
          },
        };
      }

      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred. Please try again.",
        },
      };
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "GET", endpoint, params, requiresAuth });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "POST", endpoint, body, requiresAuth });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "PUT", endpoint, body, requiresAuth });
  }

  async delete<T>(
    endpoint: string,
    requiresAuth = true,
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ method: "DELETE", endpoint, requiresAuth });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
