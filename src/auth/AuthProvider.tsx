import { useMemo, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from './authApi'
import { authKeys, sessionStore, useSessionQuery } from './session'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const sessionQuery = useSessionQuery()

  const value = useMemo<AuthContextValue>(() => ({
    session: sessionQuery.session,
    roles: sessionQuery.roles,
    isAuthenticated: sessionQuery.isAuthenticated,
    isLoading: sessionQuery.isPending,
    error: sessionQuery.error,
    async login(payload) {
      const result = await authApi.login(payload)
      sessionStore.set(result)
      await queryClient.invalidateQueries({ queryKey: authKeys.roles })
      return result
    },
    async register(payload) {
      const result = await authApi.register(payload)
      sessionStore.set(result)
      await queryClient.invalidateQueries({ queryKey: authKeys.roles })
      return result
    },
    async logout() {
      await sessionQuery.signOut()
    },
    async refresh() {
      const result = await authApi.refresh()
      sessionStore.set(result)
      await queryClient.invalidateQueries({ queryKey: authKeys.roles })
      return result
    },
  }), [queryClient, sessionQuery])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

