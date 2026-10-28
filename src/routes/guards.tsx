import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { hasAnyRole } from '../auth/session'
import { resolveDestination } from '../auth/redirect'
import type { UserRole } from '../types/api'

export function GuardLoading() {
  return <div className="route-loading" role="status" aria-live="polite">
    <span className="route-loading-dot" aria-hidden="true" />
    <span>Checking your session…</span>
  </div>
}

/**
 * Protects authenticated areas. The intended destination (path, query string and
 * hash) is preserved so login can return the visitor to exactly where they were.
 */
export function RequireAuth() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()
  if (isLoading) return <GuardLoading />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location, reason: 'auth' }} />
  }
  return <Outlet />
}

/** Protects role-specific areas (host studio, administration). */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { isLoading, isAuthenticated, roles: currentRoles } = useAuth()
  const location = useLocation()
  if (isLoading) return <GuardLoading />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location, reason: 'auth' }} />
  }
  if (!hasAnyRole(currentRoles, roles)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}

/**
 * Keeps signed-in users away from the login and registration screens.
 *
 * Session initialization always finishes before a decision is made, so a
 * loading session never causes a redirect. The redirect itself is deferred by a
 * tick and rendered declaratively, so an in-flight post-auth navigation
 * (register → verify-email) wins the race: by the time this component re-renders
 * for its own redirect it has already unmounted, and the pending state update is
 * discarded instead of overwriting the newer location.
 */
export function RequireGuest() {
  const { isLoading, isAuthenticated, roles } = useAuth()
  const location = useLocation()
  const [redirecting, setRedirecting] = useState(false)
  const from = (location.state as { from?: { pathname: string; search?: string; hash?: string } } | null)?.from
  const destination = resolveDestination(from, roles)

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    const timer = window.setTimeout(() => setRedirecting(true), 0)
    return () => window.clearTimeout(timer)
  }, [isAuthenticated, isLoading])

  if (isLoading) return <GuardLoading />
  if (isAuthenticated) return redirecting ? <Navigate to={destination} replace /> : <GuardLoading />
  return <Outlet />
}
