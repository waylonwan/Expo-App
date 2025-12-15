import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Member } from '../models';
import { authService } from '../services';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  member: Member | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const checkAuth = useCallback(async () => {
    if (initialCheckDone) return;
    
    try {
      const hasToken = await authService.checkAuthToken();
      
      if (hasToken) {
        const response = await authService.getCurrentMember();
        if (response.success && response.data) {
          setMember(response.data);
        } else {
          await apiClient.clearAuthToken();
          setMember(null);
        }
      } else {
        setMember(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setMember(null);
    } finally {
      setIsLoading(false);
      setInitialCheckDone(true);
    }
  }, [initialCheckDone]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ phone, password });
      
      if (response.success && response.data) {
        setMember(response.data.member);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error?.message || 'Login failed' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await authService.register({ email, password, name, phone });
      
      if (response.success && response.data) {
        setMember(response.data.member);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: response.error?.message || 'Registration failed' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setMember(null);
    } catch (error) {
      console.error('Logout error:', error);
      setMember(null);
    }
  };

  const refreshMember = async (): Promise<void> => {
    try {
      const response = await authService.getCurrentMember();
      if (response.success && response.data) {
        setMember(response.data);
      }
    } catch (error) {
      console.error('Error refreshing member:', error);
    }
  };

  const value: AuthContextType = {
    member,
    isLoading,
    isAuthenticated: !!member,
    login,
    register,
    logout,
    refreshMember,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
