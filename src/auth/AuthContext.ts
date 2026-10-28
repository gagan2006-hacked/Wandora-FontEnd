import { createContext } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/api'

export interface AuthContextValue {
  session: AuthResponse | null
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
  error: Error | null
  login(payload: LoginRequest): Promise<AuthResponse>
  register(payload: RegisterRequest): Promise<AuthResponse>
  logout(): Promise<void>
  refresh(): Promise<AuthResponse>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
