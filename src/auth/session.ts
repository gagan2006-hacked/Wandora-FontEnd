import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useSyncExternalStore } from 'react'
import { authApi } from './authApi'
import type { AuthResponse, UserRole } from '../types/api'

export const authKeys = {
  session: ['auth', 'session'] as const,
  roles: ['auth', 'roles'] as const,
  profile: ['auth', 'profile'] as const,
}

type Session = AuthResponse | null
let currentSession: Session = null
const listeners = new Set<() => void>()

function publish(): void {
  listeners.forEach((listener) => listener())
}

export const sessionStore = {
  getSnapshot: (): Session => currentSession,
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  set(session: Session): void {
    currentSession = session
    publish()
  },
  clear(): void {
    currentSession = null
    publish()
  },
}

export function useSession(): Session {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.getSnapshot, sessionStore.getSnapshot)
}

export function useSessionQuery() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: authKeys.roles,
    queryFn: authApi.getRoles,
    retry: false,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (query.data) sessionStore.set(query.data)
    else if (query.isError) sessionStore.clear()
  }, [query.data, query.isError])

  return {
    ...query,
    session: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    roles: query.data?.roles ?? [],
    signOut: async () => {
      try {
        await authApi.logout()
      } finally {
        sessionStore.clear()
        await queryClient.clear()
      }
    },
  }
}

export function hasAnyRole(roles: UserRole[], required: UserRole[]): boolean {
  return required.some((role) => roles.includes(role))
}
