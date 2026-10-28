import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/AuthProvider'
import { RequireGuest } from './guards'
import { RegisterPage } from '../pages/AuthPages'
import { ToastProvider } from '../components/ToastProvider'
import { authApi } from '../auth/authApi'

vi.mock('../auth/authApi', () => ({ authApi: { getRoles: vi.fn(), register: vi.fn(), login: vi.fn() } }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderRoutes(initialEntry: Parameters<typeof MemoryRouter>[0]['initialEntries']) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><AuthProvider><MemoryRouter initialEntries={initialEntry}>
    <Routes>
      <Route element={<RequireGuest />}>
        <Route path="/login" element={<p>Login form</p>} />
        <Route path="/register" element={<p>Register form</p>} />
      </Route>
      <Route path="/app" element={<p>Traveler home</p>} />
      <Route path="/app/book" element={<p>Booking form</p>} />
      <Route path="/admin" element={<p>Admin console</p>} />
    </Routes>
  </MemoryRouter></AuthProvider></QueryClientProvider>)
}

describe('guest-only routes', () => {
  it('shows the login form to a signed-out visitor', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderRoutes(['/login'])
    expect(await screen.findByText('Login form')).toBeInTheDocument()
  })

  it('waits for session initialization before deciding', async () => {
    vi.mocked(authApi.getRoles).mockReturnValueOnce(new Promise(() => {}))
    renderRoutes(['/login'])
    expect(await screen.findByText('Checking your session…')).toBeInTheDocument()
    expect(screen.queryByText('Login form')).not.toBeInTheDocument()
    expect(screen.queryByText('Traveler home')).not.toBeInTheDocument()
  })

  it('sends a signed-in visitor to their default workspace instead of a redundant form', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValueOnce({ userId: 7, roles: ['USER'] })
    renderRoutes(['/register'])
    expect(await screen.findByText('Traveler home')).toBeInTheDocument()
    expect(screen.queryByText('Register form')).not.toBeInTheDocument()
  })

  it('returns an already signed-in visitor to the page they originally wanted', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValueOnce({ userId: 7, roles: ['USER'] })
    renderRoutes([{ pathname: '/login', state: { from: { pathname: '/app/book', search: '?hotelId=3&roomId=9' } } }])
    expect(await screen.findByText('Booking form')).toBeInTheDocument()
  })

  it('uses the role-appropriate home for admin-only accounts', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValueOnce({ userId: 1, roles: ['ADMIN'] })
    renderRoutes(['/login'])
    expect(await screen.findByText('Admin console')).toBeInTheDocument()
  })
})

describe('registration hand-off', () => {
  it('completes registration into the verification step instead of a stale guest redirect', async () => {
    vi.mocked(authApi.getRoles)
      .mockRejectedValueOnce(new Error('401'))
      .mockResolvedValue({ userId: 8, roles: ['USER'] })
    vi.mocked(authApi.register).mockResolvedValue({ userId: 8, roles: ['USER'] })

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><AuthProvider><ToastProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route element={<RequireGuest />}>
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route path="/verify-email" element={<p>Verification step</p>} />
          <Route path="/app" element={<p>Traveler home</p>} />
        </Routes>
      </MemoryRouter>
    </ToastProvider></AuthProvider></QueryClientProvider>)

    await userEvent.type(await screen.findByLabelText('Your name'), 'Ada Lovelace')
    await userEvent.type(screen.getByLabelText('Username'), 'ada')
    await userEvent.type(screen.getByLabelText('Email address'), 'ada@example.test')
    await userEvent.type(screen.getByLabelText('Password'), 'wonderful123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('Verification step')).toBeInTheDocument()
    expect(screen.queryByText('Traveler home')).not.toBeInTheDocument()
  })
})
