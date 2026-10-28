import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/AuthProvider'
import { ToastProvider } from '../components/ToastProvider'
import { HomePage, PublicLayout } from '../layouts/PublicLayout'
import { LoginPage, RegisterPage } from './AuthPages'
import { ForbiddenPage, HostLandingPage, NotFoundPage } from './WorkspacePages'
import { authApi } from '../auth/authApi'

vi.mock('../auth/authApi', () => ({ authApi: { getRoles: vi.fn(), login: vi.fn(), register: vi.fn() } }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderPublic(entry: string, element: React.ReactElement, path = '/') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><AuthProvider><ToastProvider>
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={path} element={element} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route path="/app/book" element={<p>Booking form</p>} />
      </Routes>
    </MemoryRouter>
  </ToastProvider></AuthProvider></QueryClientProvider>)
}

describe('public screens', () => {
  it('renders the landing page with its search strip', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderPublic('/', <HomePage />)
    expect(await screen.findByRole('heading', { name: /find your/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /find a stay/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /join wandora/i })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('swaps the guest actions for a workspace entry once signed in', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValue({ userId: 3, roles: ['USER'] })
    renderPublic('/', <HomePage />)
    expect(await screen.findByRole('link', { name: /my wandora/i })).toHaveAttribute('href', '/app')
    expect(screen.queryByRole('link', { name: /join wandora/i })).not.toBeInTheDocument()
  })

  it('renders the login form and explains the protected destination', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderPublic('/login', <LoginPage />, '/login')
    expect(await screen.findByRole('heading', { name: 'Welcome back.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email or username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument()
  })

  it('keeps the sign-in destination visible when redirected from a protected page', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><AuthProvider><ToastProvider>
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/app/book', search: '?roomId=2' }, reason: 'auth' } }]}>
        <Routes><Route path="/login" element={<LoginPage />} /></Routes>
      </MemoryRouter>
    </ToastProvider></AuthProvider></QueryClientProvider>)
    expect(await screen.findByText(/sign in to continue to/i)).toBeInTheDocument()
    expect(screen.getByText('/app/book')).toBeInTheDocument()
  })

  it('renders the registration form with labelled fields', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderPublic('/register', <RegisterPage />, '/register')
    expect(await screen.findByRole('heading', { name: /make room for more/i })).toBeInTheDocument()
    for (const label of ['Your name', 'Username', 'Email address', 'Password']) {
      expect(screen.getByLabelText(new RegExp(`^${label}`, 'i'))).toBeInTheDocument()
    }
  })

  it('renders status pages with a way forward', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderPublic('/nope', <NotFoundPage />, '/nope')
    expect(await screen.findByText('404')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/')
  })

  it('keeps the host invitation page usable', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderPublic('/host', <HostLandingPage />, '/host')
    expect(await screen.findByRole('heading', { name: /make room/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create your account/i })).toHaveAttribute('href', '/register')
  })

  it('offers the forbidden page without exposing role details', async () => {
    vi.mocked(authApi.getRoles).mockRejectedValueOnce(new Error('401'))
    renderPublic('/forbidden', <ForbiddenPage />, '/forbidden')
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /explore stays/i }).length).toBeGreaterThan(0)
  })
})
