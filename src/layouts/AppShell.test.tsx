import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '../auth/AuthProvider'
import { ToastProvider } from '../components/ToastProvider'
import { AppShell } from './AppShell'
import { authApi } from '../auth/authApi'

vi.mock('../auth/authApi', () => ({ authApi: { getRoles: vi.fn(), logout: vi.fn() } }))
vi.mock('../api/hooks', () => ({
  featureHooks: {
    useProfile: () => ({ data: { id: 7, name: 'Ada Lovelace', username: 'ada', email: 'ada@example.test' } }),
  },
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderShell(entry: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={client}><AuthProvider><ToastProvider>
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/app" element={<p>Traveler home</p>} />
          <Route path="/app/profile" element={<p>Profile screen</p>} />
          <Route path="/host/dashboard" element={<p>Host overview</p>} />
          <Route path="/admin" element={<p>Admin overview</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  </ToastProvider></AuthProvider></QueryClientProvider>)
}

describe('authenticated application shell', () => {
  it('renders a single shared header with traveler navigation for a USER account', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValue({ userId: 7, roles: ['USER'] })
    const { container } = renderShell('/app')
    expect(await screen.findByText('Traveler home')).toBeInTheDocument()
    expect(container.querySelectorAll('header')).toHaveLength(1)

    const nav = screen.getByRole('navigation', { name: 'Your journeys navigation' })
    for (const label of ['Home', 'Explore stays', 'My bookings', 'Friends', 'Travel plans', 'Profile']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument()
    }
    // No host/admin entries and no workspace switcher for a single-role account.
    expect(screen.queryByRole('button', { name: /switch workspace/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'My properties' })).not.toBeInTheDocument()
  })

  it('marks the active section and keeps the account menu functional', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValue({ userId: 7, roles: ['USER'] })
    renderShell('/app/profile')
    const nav = await screen.findByRole('navigation', { name: 'Your journeys navigation' })
    expect(within(nav).getByRole('link', { name: 'Profile' })).toHaveAttribute('aria-current', 'page')

    await userEvent.click(screen.getByRole('button', { name: /ada lovelace/i }))
    const menu = screen.getByRole('menu', { name: 'Account menu' })
    expect(within(menu).getByRole('menuitem', { name: /your profile/i })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument()
    expect(within(menu).queryByRole('menuitem', { name: /host workspace/i })).not.toBeInTheDocument()
  })

  it('lets a multi-role user switch workspaces without changing their session', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValue({ userId: 7, roles: ['USER', 'HOST'] })
    renderShell('/app')
    const trigger = await screen.findByRole('button', { name: /switch workspace/i })
    await userEvent.click(trigger)
    const menu = screen.getByRole('menu', { name: 'Switch workspace' })
    expect(within(menu).queryByRole('menuitem', { name: /admin/i })).not.toBeInTheDocument()

    await userEvent.click(within(menu).getByRole('menuitem', { name: /host/i }))
    expect(await screen.findByText('Host overview')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Host studio navigation' })).toBeInTheDocument()
    expect(authApi.getRoles).toHaveBeenCalled()
  })

  it('opens and closes the mobile navigation drawer', async () => {
    vi.mocked(authApi.getRoles).mockResolvedValue({ userId: 7, roles: ['USER'] })
    renderShell('/app')
    await screen.findByText('Traveler home')

    await userEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
    const drawer = screen.getByRole('dialog', { name: 'Wandora menu' })
    expect(within(drawer).getByRole('link', { name: 'Travel plans' })).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Wandora menu' })).not.toBeInTheDocument()
  })
})
