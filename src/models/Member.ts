export interface Member {
  id: string;
  email: string;
  name: string;
  phone?: string;
  membershipTier?: 'standard' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  avatarUrl?: string;
  isVerified: boolean;
  // Additional fields from backend
  currentPoints?: number;
  expiringPoints?: number;
  expiringDate?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginResponse {
  member: Member;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  member: Member;
  tokens: AuthTokens;
}
