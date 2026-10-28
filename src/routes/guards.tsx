import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { hasAnyRole } from '../auth/session'
import type { UserRole } from '../types/api'

function GuardLoading() {
  return <div className="route-loading" role="status" aria-live="polite">Checking your session…</div>
}

export function RequireAuth() {
  const { isLoading, isAuthenticated } = useAuth()
  const location = useLocation()
  if (isLoading) return <GuardLoading />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { isLoading, isAuthenticated, roles: currentRoles } = useAuth()
  const location = useLocation()
  if (isLoading) return <GuardLoading />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (!hasAnyRole(currentRoles, roles)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}
