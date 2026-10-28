import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/AuthProvider'
import { RequireAuth, RequireRole } from './guards'
import { authApi } from '../auth/authApi'

vi.mock('../auth/authApi', () => ({ authApi: { getRoles: vi.fn() } }))

afterEach(cleanup)

function renderRoutes(initialEntry: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><AuthProvider><MemoryRouter initialEntries={[initialEntry]}><Routes>
    <Route path="/login" element={<p>Login page</p>} />
    <Route path="/forbidden" element={<p>Forbidden page</p>} />
    <Route element={<RequireAuth />}><Route element={<RequireRole roles={['ADMIN']} />}><Route path="/admin" element={<p>Admin page</p>} /></Route></Route>
  </Routes></MemoryRouter></AuthProvider></QueryClientProvider>)
}

describe('route guards', () => {
  it('sends an unauthenticated visitor to login', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderRoutes('/admin')
    expect(await screen.findByText('Login page')).toBeInTheDocument()
  })

  it('denies access when the backend session lacks ADMIN', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValueOnce({ userId: 42, roles: ['USER'] })
    renderRoutes('/admin')
    expect(await screen.findByText('Forbidden page')).toBeInTheDocument()
    expect(screen.queryByText('Admin page')).not.toBeInTheDocument()
  })

  it('allows access only when backend roles contain ADMIN', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValueOnce({ userId: 42, roles: ['USER', 'ADMIN'] })
    renderRoutes('/admin')
    expect(await screen.findByText('Admin page')).toBeInTheDocument()
  })
})
