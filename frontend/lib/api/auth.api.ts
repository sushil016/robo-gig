/**
 * Authentication API Client
 * All auth-related API calls
 */

import api from './client';
import type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
  User,
} from '@/lib/types/auth.types';

export const authApi = {
  /**
   * Register a new user
   * POST /api/auth/signup
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/signup', data);
    return response.data.data;
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', data);
    return response.data.data;
  },

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data.data;
  },

  /**
   * Logout current user
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data.data;
  },

  /**
   * Get Google OAuth URL
   * This will redirect user to Google login
   */
  getGoogleAuthUrl: (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${baseUrl}/api/auth/google`;
  },

  /**
   * Get GitHub OAuth URL
   * This will redirect user to GitHub login
   */
  getGitHubAuthUrl: (): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${baseUrl}/api/auth/github`;
  },

  /**
   * Handle OAuth callback (Google/GitHub)
   * This is typically called by backend redirect
   * GET /api/auth/google/callback?code=xxx
   */
  handleOAuthCallback: async (provider: 'google' | 'github', code: string): Promise<AuthResponse> => {
    const response = await api.get(`/api/auth/${provider}/callback?code=${code}`);
    return response.data.data;
  },
};
