import type { UserRole } from '../types/api'

/**
 * Navigation helpers shared by route guards, the auth screens and the
 * authenticated header. These are presentation decisions only: the backend
 * remains the authority for both authentication and authorization.
 */

export type WorkspaceId = 'traveler' | 'host' | 'admin'

export interface Workspace {
  id: WorkspaceId
  label: string
  /** Landing route for the workspace. */
  home: string
  /** Short description used in the workspace switcher. */
  description: string
}

export interface RedirectLocation {
  pathname: string
  search?: string
  hash?: string
}

const GUEST_ONLY_PATHS = ['/login', '/register']

export const TRAVELER_HOME = '/app'
export const HOST_HOME = '/host/dashboard'
export const ADMIN_HOME = '/admin'

export function hasRole(roles: readonly UserRole[] | undefined | null, role: UserRole): boolean {
  return Boolean(roles?.includes(role))
}

/**
 * The default landing route for a signed-in user. Travelers and hosts both land
 * on the traveler home (`/app`) because host accounts keep full access to the
 * traveler area; admin-only accounts land on their dashboard instead.
 */
export function homeForRoles(roles: readonly UserRole[] | undefined | null): string {
  const list = roles ?? []
  if (list.length === 0) return TRAVELER_HOME
  if (hasRole(list, 'USER') || hasRole(list, 'HOST')) return TRAVELER_HOME
  if (hasRole(list, 'ADMIN')) return ADMIN_HOME
  return TRAVELER_HOME
}

/** Serialize a router location into an internal path (path + search + hash). */
export function pathFromLocation(location: RedirectLocation | null | undefined): string | null {
  if (!location?.pathname) return null
  return `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`
}

/**
 * Only same-origin, application-internal paths are valid post-login targets.
 * Protocol-relative (`//evil.test`), absolute URLs and auth screens are rejected.
 */
export function isSafeRedirect(path: string | null | undefined): path is string {
  if (!path || typeof path !== 'string') return false
  if (!path.startsWith('/') || path.startsWith('//')) return false
  if (path.includes('\\') || path.includes('\n') || path.includes('\r')) return false
  const pathname = path.split(/[?#]/)[0]
  if (pathname === '/' || GUEST_ONLY_PATHS.includes(pathname)) return false
  return true
}

/**
 * Resolve the post-login destination: return the visitor to the protected page
 * they originally asked for when that intent is safe, otherwise the default
 * home for their persisted roles.
 */
export function resolveDestination(
  from: RedirectLocation | string | null | undefined,
  roles: readonly UserRole[] | undefined | null,
): string {
  const candidate = typeof from === 'string' ? from : pathFromLocation(from)
  return isSafeRedirect(candidate) ? candidate : homeForRoles(roles)
}

/** Workspaces the signed-in user can actually reach with their persisted roles. */
export function workspacesFor(roles: readonly UserRole[] | undefined | null): Workspace[] {
  const list = roles ?? []
  const workspaces: Workspace[] = [
    { id: 'traveler', label: 'Traveler', home: TRAVELER_HOME, description: 'Trips, bookings and friends' },
  ]
  if (hasRole(list, 'HOST')) {
    workspaces.push({ id: 'host', label: 'Host', home: HOST_HOME, description: 'Properties and host profile' })
  }
  if (hasRole(list, 'ADMIN')) {
    workspaces.push({ id: 'admin', label: 'Admin', home: ADMIN_HOME, description: 'Reviews and platform data' })
  }
  return workspaces
}

/** Which workspace owns a given route. */
export function workspaceForPath(pathname: string): WorkspaceId {
  if (pathname === '/host' || pathname.startsWith('/host/')) return 'host'
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin'
  return 'traveler'
}
