import { describe, expect, it } from 'vitest'
import { homeForRoles, isSafeRedirect, pathFromLocation, resolveDestination, workspaceForPath, workspacesFor } from './redirect'

describe('authentication-aware navigation', () => {
  it('lands travelers and hosts on the traveler home and admin-only accounts on the console', () => {
    expect(homeForRoles([])).toBe('/app')
    expect(homeForRoles(['USER'])).toBe('/app')
    expect(homeForRoles(['USER', 'HOST'])).toBe('/app')
    expect(homeForRoles(['ADMIN'])).toBe('/admin')
    expect(homeForRoles(['USER', 'ADMIN'])).toBe('/app')
  })

  it('preserves the full intended destination, including query and hash', () => {
    const from = { pathname: '/app/book', search: '?hotelId=7&roomId=2', hash: '#dates' }
    expect(pathFromLocation(from)).toBe('/app/book?hotelId=7&roomId=2#dates')
    expect(resolveDestination(from, ['USER'])).toBe('/app/book?hotelId=7&roomId=2#dates')
  })

  it('rejects external, protocol-relative and auth-screen redirect targets', () => {
    expect(isSafeRedirect('https://evil.test/app')).toBe(false)
    expect(isSafeRedirect('//evil.test/app')).toBe(false)
    expect(isSafeRedirect('/\\evil.test')).toBe(false)
    expect(isSafeRedirect('/login')).toBe(false)
    expect(isSafeRedirect('/register?x=1')).toBe(false)
    expect(isSafeRedirect('/')).toBe(false)
    expect(isSafeRedirect('/app/trips')).toBe(true)
    expect(isSafeRedirect(undefined)).toBe(false)
    expect(resolveDestination('//evil.test', ['USER'])).toBe('/app')
    expect(resolveDestination(undefined, ['ADMIN'])).toBe('/admin')
  })

  it('only exposes workspaces the persisted roles allow', () => {
    expect(workspacesFor(['USER']).map((workspace) => workspace.id)).toEqual(['traveler'])
    expect(workspacesFor(['USER', 'HOST']).map((workspace) => workspace.id)).toEqual(['traveler', 'host'])
    expect(workspacesFor(['USER', 'HOST', 'ADMIN']).map((workspace) => workspace.id)).toEqual(['traveler', 'host', 'admin'])
    expect(workspacesFor(undefined).map((workspace) => workspace.id)).toEqual(['traveler'])
  })

  it('maps routes to their owning workspace', () => {
    expect(workspaceForPath('/app')).toBe('traveler')
    expect(workspaceForPath('/app/trips')).toBe('traveler')
    expect(workspaceForPath('/host/dashboard')).toBe('host')
    expect(workspaceForPath('/admin/applications')).toBe('admin')
  })
})
