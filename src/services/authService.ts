import { apiClient } from "./apiClient";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  Member,
  AuthTokens,
} from "../models";
import { ApiResponse } from "../types/api";

/**
 * 後端 API 回應格式
 * [{"RTN_CODE":"OK","RTN_HEADER":"LOGIN","RTN_DATA":{...}}]
 */
interface BackendApiResponse {
  RTN_CODE: "OK" | "ERR";
  RTN_HEADER: string;
  RTN_DATA: any;
}

/**
 * 後端會員資料格式 (mdlCRM_VIP) - 欄位名與 CRM_VIP 表一致
 */
interface BackendMember {
  CUSTOMER_TEL: string | number; // 手機號碼 (可能是數字或字串)
  CUSTOMER_NAME: string; // 姓名
  CUSTOMER_SEX: string; // 性別 0:男 1:女
  BIRTHDAY: string; // 生日
  EMAIL: string; // 電郵
  SYS_DATE: string; // 註冊日期
  MEMBER_NO?: string; // 會員編號
}

/**
 * 將後端 Member 轉換為 App Member
 */
function transformBackendMember(backendMember: BackendMember): Member {
  const phone = String(backendMember.CUSTOMER_TEL || "");
  // 性別：後端 0=男, 1=女, 2=其他
  let gender: "male" | "female" | undefined;
  if (backendMember.CUSTOMER_SEX === "1") gender = "male";
  else if (backendMember.CUSTOMER_SEX === "2") gender = "female";

  return {
    id: phone,
    name: backendMember.CUSTOMER_NAME || "",
    phone: phone,
    email: backendMember.EMAIL || "",
    joinDate: backendMember.SYS_DATE || "",
    birthDate: backendMember.BIRTHDAY || "",
    gender: gender,
    isVerified: true,
  };
}

class AuthService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    console.log("[AuthService] 開始登入，電話:", credentials.phone);
    console.log("[AuthService] API Base URL:", apiClient.getBaseUrl());

    // 呼叫後端 API，使用 query parameters
    // 端點: /ctlCRMAppAPI?action=login&phone=xxx&password=xxx
    const response = await apiClient.get<BackendApiResponse[]>(
      "/ctlCRMAppAPI",
      {
        action: "login",
        phone: credentials.phone,
        password: credentials.password,
      },
      false,
    );

    console.log("[AuthService] API 回應:", JSON.stringify(response, null, 2));

    if (response.success && response.data) {
      console.log("[AuthService] API 請求成功，處理回應數據...");

      // 解析後端回應格式: [{"RTN_CODE":"OK","RTN_HEADER":"LOGIN","RTN_DATA":{...}}]
      const backendResponse = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      console.log(
        "[AuthService] 解析後的回應:",
        JSON.stringify(backendResponse, null, 2),
      );

      if (backendResponse.RTN_CODE === "OK") {
        const rtnData = backendResponse.RTN_DATA;
        console.log(
          "[AuthService] RTN_DATA:",
          JSON.stringify(rtnData, null, 2),
        );

        // 後端返回的 member 是 JSON 字串，需要解析
        let backendMember: BackendMember;
        if (typeof rtnData.member === "string") {
          backendMember = JSON.parse(rtnData.member);
        } else {
          backendMember = rtnData.member;
        }
        const token: string = rtnData.token;

        console.log(
          "[AuthService] 會員資料 (解析後):",
          JSON.stringify(backendMember, null, 2),
        );
        console.log("[AuthService] Token:", token ? "已取得" : "無");

        // 轉換為 App 格式
        const member = transformBackendMember(backendMember);

        await apiClient.setAuthToken(token);
        console.log("[AuthService] 登入成功！");

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
        console.log("[AuthService] 後端回傳錯誤:", backendResponse.RTN_DATA);
        return {
          success: false,
          error: {
            code: "LOGIN_FAILED",
            message: backendResponse.RTN_DATA || "登入失敗",
          },
        };
      }
    }

    console.log(
      "[AuthService] API 請求失敗:",
      JSON.stringify(response.error, null, 2),
    );
    return {
      success: false,
      error: response.error || {
        code: "UNKNOWN_ERROR",
        message: "登入時發生未知錯誤",
      },
    };
  }

  async register(
    data: RegisterRequest,
  ): Promise<ApiResponse<RegisterResponse>> {
    console.log("[AuthService] 開始註冊，電話:", data.phone);
    console.log("[AuthService] API Base URL:", apiClient.getBaseUrl());

    // 使用 POST body 發送資料
    const response = await apiClient.post<BackendApiResponse[]>(
      "/ctlCRMAppAPI?action=register",
      {
        CUSTOMER_TEL: data.phone,
        PASSWORD: data.password,
        CUSTOMER_NAME: data.name,
        BIRTHDAY: data.birthday,
        CUSTOMER_SEX: data.gender,
        EMAIL: data.email || "",
      },
      false,
    );

    console.log("[AuthService] 註冊 API 回應:", JSON.stringify(response, null, 2));

    if (response.success && response.data) {
      const backendResponse = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      console.log(
        "[AuthService] 解析後的回應:",
        JSON.stringify(backendResponse, null, 2),
      );

      if (backendResponse.RTN_CODE === "OK") {
        const rtnData = backendResponse.RTN_DATA;

        let backendMember: BackendMember;
        if (typeof rtnData.member === "string") {
          backendMember = JSON.parse(rtnData.member);
        } else {
          backendMember = rtnData.member;
        }
        const token: string = rtnData.token || "";

        const member = transformBackendMember(backendMember);

        if (token) {
          await apiClient.setAuthToken(token);
        }
        console.log("[AuthService] 註冊成功！");

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
        console.log("[AuthService] 後端回傳錯誤:", backendResponse.RTN_DATA);
        return {
          success: false,
          error: {
            code: "REGISTER_FAILED",
            message: backendResponse.RTN_DATA || "註冊失敗",
          },
        };
      }
    }

    console.log(
      "[AuthService] API 請求失敗:",
      JSON.stringify(response.error, null, 2),
    );
    return {
      success: false,
      error: response.error || {
        code: "UNKNOWN_ERROR",
        message: "註冊時發生未知錯誤",
      },
    };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/ctlCRMAppAPI", { action: "logout" }, true);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await apiClient.clearAuthToken();
    }
  }

  async getCurrentMember(): Promise<ApiResponse<Member>> {
    return apiClient.get<Member>("/members/me");
  }

  async checkAuthToken(): Promise<boolean> {
    const token = await apiClient.getAuthToken();
    return !!token;
  }

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const response = await apiClient.post<AuthTokens>("/auth/refresh", {});

    if (response.success && response.data) {
      await apiClient.setAuthToken(response.data.accessToken);
    }

    return response;
  }

  async updatePushToken(pushToken: string): Promise<ApiResponse<void>> {
    return apiClient.post("/members/push-token", { pushToken });
  }
}

export const authService = new AuthService();
export default authService;
