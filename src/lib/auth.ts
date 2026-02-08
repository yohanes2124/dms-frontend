import axios from 'axios';
import { authAPI } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'student' | 'supervisor' | 'admin';
  student_id?: string;
  department?: string;
  gender?: 'male' | 'female';
  phone?: string;
  mobile_operator?: string;
  assigned_block?: string;
  year_level?: number;
  status: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const authFunctions = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user, token };
    } catch (error: any) {
      if (!error.response) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      
      throw new Error(error.response.data?.message || 'Login failed');
    }
  },

  async register(userData: any): Promise<{ user: User; token: string; requires_approval?: boolean }> {
    try {
      const response = await authAPI.register(userData);
      const { user, token, requires_approval } = response.data.data;
      
      // Only save token if user doesn't require approval
      if (!requires_approval && token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return { user, token, requires_approval };
    } catch (error: any) {
      if (!error.response) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      
      // Handle validation errors
      if (error.response.status === 422 && error.response.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(`Validation failed:\n${errorMessages}`);
      }
      
      // Handle other specific error codes
      if (error.response.status === 409) {
        throw new Error('Email already exists. Please use a different email address.');
      }
      
      if (error.response.status === 500) {
        const errorMsg = error.response.data?.message || 'Server error';
        throw new Error(`Server error: ${errorMsg}`);
      }
      
      throw new Error(error.response.data?.message || `Registration failed (${error.response.status})`);
    }
  },

  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  async refreshUser(): Promise<User> {
    try {
      const response = await authAPI.me();
      const user = response.data.data;
      
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      if (!error.response) {
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      }
      
      throw new Error(error.response.data?.message || 'Failed to refresh user data');
    }
  },

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.user_type === role;
  },

  isStudent(): boolean {
    return this.hasRole('student');
  },

  isSupervisor(): boolean {
    return this.hasRole('supervisor');
  },

  isAdmin(): boolean {
    return this.hasRole('admin');
  }
};

export const authService = authFunctions;