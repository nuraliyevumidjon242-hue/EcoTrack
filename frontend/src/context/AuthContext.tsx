import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loginAsDemo: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ecotrack_token'));
  const [companyName, setCompanyName] = useState<string | null>(localStorage.getItem('ecotrack_company'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ecotrack_token');
      if (storedToken) {
        try {
          const userData = await ApiService.getMe();
          setUser(userData);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('ecotrack_token');
          localStorage.removeItem('ecotrack_company');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
      setCompanyName(null);
    };

    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('auth_logout', handleLogoutEvent);
  }, []);

  const login = async (credentials: any) => {
    const res = await ApiService.login(credentials);
    localStorage.setItem('ecotrack_token', res.access_token);
    if (res.company_name) {
      localStorage.setItem('ecotrack_company', res.company_name);
      setCompanyName(res.company_name);
    }
    setToken(res.access_token);

    const userData: User = {
      id: res.user_id,
      email: credentials.email,
      first_name: res.first_name,
      last_name: res.last_name,
      role: res.role as UserRole,
      company_id: res.company_id,
      is_active: true,
    };
    setUser(userData);
  };

  const register = async (formData: any) => {
    const res = await ApiService.register(formData);
    localStorage.setItem('ecotrack_token', res.access_token);
    if (res.company_name) {
      localStorage.setItem('ecotrack_company', res.company_name);
      setCompanyName(res.company_name);
    }
    setToken(res.access_token);

    const userData: User = {
      id: res.user_id,
      email: formData.email,
      first_name: res.first_name,
      last_name: res.last_name,
      role: res.role as UserRole,
      company_id: res.company_id,
      is_active: true,
    };
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_company');
    setToken(null);
    setUser(null);
    setCompanyName(null);
  };

  const loginAsDemo = async (role: UserRole) => {
    let email = 'manager@mueller-tech.de';
    let password = 'Password123!';

    if (role === 'DATA_AUDITOR') {
      email = 'auditor@mueller-tech.de';
      password = 'Password123!';
    } else if (role === 'SYSTEM_ADMIN') {
      email = 'admin@ecotrack.de';
      password = 'AdminSecret123!';
    }

    await login({ email, password });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        companyName,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
