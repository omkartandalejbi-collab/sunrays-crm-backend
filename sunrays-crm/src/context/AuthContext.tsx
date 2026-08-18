import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, AppModuleId } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasModuleAccess: (moduleId: AppModuleId) => boolean;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authService.getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      // If token validation fails, clear session
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
  };

  const hasModuleAccess = useCallback(
    (moduleId: AppModuleId): boolean => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (!user.isAccessEnabled || user.status === 'Inactive') return false;
      return user.allowedModules?.includes(moduleId) ?? false;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasModuleAccess,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
