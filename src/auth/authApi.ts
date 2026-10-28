import { apiClient } from '../api/http'
import type { AuthResponse, LoginRequest, OtpVerificationRequest, RegisterRequest, UserProfile } from '../types/api'

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    return (await apiClient.post<AuthResponse>('/api/auth/register', payload)).data
  },
  async login(payload: LoginRequest): Promise<AuthResponse> {
    return (await apiClient.post<AuthResponse>('/api/auth/login', payload)).data
  },
  async refresh(): Promise<AuthResponse> {
    return (await apiClient.post<AuthResponse>('/api/auth/refresh')).data
  },
  async logout(): Promise<{ loggedOut: boolean }> {
    return (await apiClient.post<{ loggedOut: boolean }>('/api/auth/logout')).data
  },
  async verifyOtp(payload: OtpVerificationRequest): Promise<void> {
    await apiClient.post('/api/auth/verify/otp', payload)
  },
  async resendOtp(): Promise<void> {
    await apiClient.post('/api/auth/resendotp')
  },
  async getRoles(): Promise<AuthResponse> {
    return (await apiClient.get<AuthResponse>('/api/auth/me/roles')).data
  },
  async getProfile(): Promise<UserProfile> {
    return (await apiClient.get<UserProfile>('/api/me')).data
  },
}
