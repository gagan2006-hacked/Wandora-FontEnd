import { beforeEach, describe, expect, it } from 'vitest'
import { hasAnyRole, sessionStore } from './session'

describe('sessionStore', () => {
  beforeEach(() => sessionStore.clear())

  it('publishes only the current in-memory session and clears it', () => {
    const session = { userId: 42, roles: ['USER'] }
    sessionStore.set(session)
    expect(sessionStore.getSnapshot()).toEqual(session)
    sessionStore.clear()
    expect(sessionStore.getSnapshot()).toBeNull()
  })

  it('matches only roles supplied by the session', () => {
    expect(hasAnyRole(['USER'], ['ADMIN'])).toBe(false)
    expect(hasAnyRole(['USER', 'HOST'], ['HOST', 'ADMIN'])).toBe(true)
  })
})
