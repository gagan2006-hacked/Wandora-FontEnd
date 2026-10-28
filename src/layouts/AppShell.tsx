import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2, CalendarCheck, ChevronDown, Compass, LayoutDashboard,
  LogOut, MapPinned, Menu, ShieldCheck, UserRound, Users, X,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/useToast'
import { getErrorMessage } from '../api/http'
import { featureHooks } from '../api/hooks'
import { workspaceForPath, workspacesFor, type WorkspaceId } from '../auth/redirect'

type Section = WorkspaceId

interface NavItem { to: string; label: string; icon: typeof Compass; end?: boolean }

const NAV_ITEMS: Record<Section, NavItem[]> = {
  traveler: [
    { to: '/app', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/app/stays', label: 'Explore stays', icon: Compass },
    { to: '/app/bookings', label: 'My bookings', icon: CalendarCheck },
    { to: '/app/friends', label: 'Friends', icon: Users },
    { to: '/app/trips', label: 'Travel plans', icon: MapPinned },
    { to: '/app/profile', label: 'Profile', icon: UserRound },
  ],
  host: [
    { to: '/host/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/host/stays', label: 'My properties', icon: Building2 },
    { to: '/host/profile', label: 'Host profile', icon: UserRound },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/hotels', label: 'Hotels', icon: Building2 },
    { to: '/admin/applications', label: 'Applications', icon: ShieldCheck },
  ],
}

const SECTION_TITLE: Record<Section, string> = {
  traveler: 'Your journeys',
  host: 'Host studio',
  admin: 'Administration',
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="app-role-badge">{children}</span>
}

/**
 * The single authenticated application shell: one sticky header for the
 * traveler, host and admin areas, a role-aware workspace switcher, an account
 * menu and a keyboard-accessible mobile drawer. Pages render inside it through
 * the router outlet, so no page can produce a second header.
 */
export function AppShell({ mode }: { mode?: Section }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, roles, logout } = useAuth()
  const { showToast } = useToast()
  const profile = featureHooks.useProfile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  const accountRef = useRef<HTMLDivElement>(null)
  const accountButtonRef = useRef<HTMLButtonElement>(null)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const workspaceButtonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Host and admin routes pass `mode`; the traveler shell derives its workspace
  // from the URL so switching workspaces keeps a single mounted header.
  const defaultSection = mode ?? workspaceForPath(location.pathname)
  const workspaces = workspacesFor(roles)
  const section = workspaces.some((workspace) => workspace.id === defaultSection) ? defaultSection : 'traveler'
  const items = NAV_ITEMS[section]
  const currentWorkspace = workspaces.find((workspace) => workspace.id === section) ?? workspaces[0]
  const home = currentWorkspace?.home ?? '/app'
  const displayName = profile.data?.name || profile.data?.username || 'Wandora member'
  const secondary = profile.data?.email || (roles.length ? roles.join(' · ') : 'Wandora member')
  const initials = (displayName.trim().charAt(0) || String(session?.userId ?? 'W')).toUpperCase()
  const otherWorkspaces = workspaces.filter((workspace) => workspace.id !== section)

  useEffect(() => {
    if (!accountOpen && !workspaceOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (accountOpen && !accountRef.current?.contains(target) && !accountButtonRef.current?.contains(target)) setAccountOpen(false)
      if (workspaceOpen && !workspaceRef.current?.contains(target) && !workspaceButtonRef.current?.contains(target)) setWorkspaceOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (accountOpen) accountButtonRef.current?.focus()
      if (workspaceOpen) workspaceButtonRef.current?.focus()
      setAccountOpen(false)
      setWorkspaceOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [accountOpen, workspaceOpen])

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    drawerCloseRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDrawerOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  function closePopovers() {
    setAccountOpen(false)
    setWorkspaceOpen(false)
  }

  function closeDrawer() {
    setDrawerOpen(false)
    window.setTimeout(() => menuButtonRef.current?.focus(), 0)
  }

  function trapDrawerFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !drawerRef.current) return
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  async function signOut() {
    setAccountOpen(false)
    setDrawerOpen(false)
    try {
      await logout()
      showToast('You have signed out.')
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    } finally {
      navigate('/', { replace: true })
    }
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>

    <header className="app-header">
      <div className="app-header-inner">
        <Link to={home} className="brand app-brand" aria-label="Wandora home">
          <span className="brand-mark"><Compass size={19} strokeWidth={2.4} /></span>
          <span className="brand-word">wandora<span className="brand-period">.</span></span>
        </Link>

        {workspaces.length > 1 && <div className="workspace-menu">
          <button
            ref={workspaceButtonRef}
            type="button"
            className="workspace-trigger"
            aria-haspopup="menu"
            aria-expanded={workspaceOpen}
            aria-label={`Switch workspace. Current workspace: ${currentWorkspace?.label ?? 'Traveler'}`}
            onClick={() => { setWorkspaceOpen((open) => !open); setAccountOpen(false) }}
          >
            <span className={`workspace-dot dot-${section}`} aria-hidden="true" />
            <span className="workspace-trigger-label">{currentWorkspace?.label ?? 'Traveler'}</span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          {workspaceOpen && <div className="app-popover workspace-popover" role="menu" ref={workspaceRef} aria-label="Switch workspace">
            <p className="app-popover-label" role="presentation">Switch workspace</p>
            {workspaces.map((workspace) => <Link
              key={workspace.id}
              to={workspace.home}
              role="menuitem"
              onClick={closePopovers}
              className={`workspace-option${workspace.id === section ? ' is-current' : ''}`}
              aria-current={workspace.id === section ? 'true' : undefined}
            >
              <span className={`workspace-dot dot-${workspace.id}`} aria-hidden="true" />
              <span><b>{workspace.label}</b><small>{workspace.description}</small></span>
              {workspace.id === section && <span className="workspace-current-tag">Current</span>}
            </Link>)}
          </div>}
        </div>}

        <nav className="app-nav" aria-label={`${SECTION_TITLE[section]} navigation`}>
          {items.map(({ to, label, icon: Icon, end }) => <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
          >
            <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>)}
        </nav>

        <div className="app-header-actions">
          <div className="account-menu" ref={accountRef}>
            <button
              ref={accountButtonRef}
              type="button"
              className="account-trigger"
              aria-haspopup="menu"
              aria-expanded={accountOpen}
              onClick={() => { setAccountOpen((open) => !open); setWorkspaceOpen(false) }}
            >
              <span className="account-avatar" aria-hidden="true">
                {profile.data?.profileImg ? <img src={profile.data.profileImg} alt="" /> : initials}
              </span>
              <span className="account-trigger-text">
                <b>{displayName}</b>
                <small>{currentWorkspace?.label ?? 'Traveler'} workspace</small>
              </span>
              <ChevronDown size={15} className="account-chevron" aria-hidden="true" />
            </button>
            {accountOpen && <div className="app-popover account-popover" role="menu" aria-label="Account menu">
              <div className="account-summary">
                <span className="account-avatar account-avatar-large" aria-hidden="true">
                  {profile.data?.profileImg ? <img src={profile.data.profileImg} alt="" /> : initials}
                </span>
                <span>
                  <b>{displayName}</b>
                  <small>{secondary}</small>
                </span>
              </div>
              <div className="account-roles">
                {roles.length ? roles.map((role) => <Badge key={role}>{role}</Badge>) : <Badge>MEMBER</Badge>}
              </div>
              <div className="account-menu-links">
                <Link role="menuitem" to="/app/profile" className="app-menu-item" onClick={closePopovers}><UserRound size={16} aria-hidden="true" /> Your profile</Link>
                <Link role="menuitem" to="/app/bookings" className="app-menu-item" onClick={closePopovers}><CalendarCheck size={16} aria-hidden="true" /> My bookings</Link>
                <Link role="menuitem" to="/app/trips" className="app-menu-item" onClick={closePopovers}><MapPinned size={16} aria-hidden="true" /> Travel plans</Link>
              </div>
              {otherWorkspaces.length > 0 && <div className="account-menu-links">
                <p className="app-popover-label" role="presentation">Other workspaces</p>
                {otherWorkspaces.map((workspace) => <Link key={workspace.id} role="menuitem" to={workspace.home} className="app-menu-item" onClick={closePopovers}>
                  {workspace.id === 'host' ? <Building2 size={16} aria-hidden="true" /> : workspace.id === 'admin' ? <ShieldCheck size={16} aria-hidden="true" /> : <Compass size={16} aria-hidden="true" />}
                  {workspace.label} workspace
                </Link>)}
              </div>}
              <div className="account-menu-footer">
                <button type="button" role="menuitem" className="app-menu-item app-menu-signout" onClick={() => void signOut()}>
                  <LogOut size={16} aria-hidden="true" /> Sign out
                </button>
              </div>
            </div>}
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            className="icon-button app-menu-button"
            aria-label="Open navigation menu"
            aria-expanded={drawerOpen}
            aria-controls="app-mobile-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={21} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>

    <main id="main-content" className="app-main">
      <div className="app-content"><Outlet /></div>
    </main>

    {drawerOpen && <>
      <button type="button" className="drawer-backdrop" aria-label="Close navigation menu" onClick={closeDrawer} />
      <div
        id="app-mobile-drawer"
        ref={drawerRef}
        className="app-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Wandora menu"
        onKeyDown={trapDrawerFocus}
      >
        <div className="app-drawer-head">
          <Link to={home} className="brand app-brand" onClick={closeDrawer}>
            <span className="brand-mark"><Compass size={18} strokeWidth={2.4} /></span>
            <span className="brand-word">wandora<span className="brand-period">.</span></span>
          </Link>
          <button ref={drawerCloseRef} type="button" className="icon-button" aria-label="Close navigation menu" onClick={closeDrawer}>
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="app-drawer-account">
          <span className="account-avatar" aria-hidden="true">
            {profile.data?.profileImg ? <img src={profile.data.profileImg} alt="" /> : initials}
          </span>
          <span>
            <b>{displayName}</b>
            <small>{secondary}</small>
          </span>
        </div>

        <nav className="app-drawer-nav" aria-label={`${SECTION_TITLE[section]} navigation`}>
          {items.map(({ to, label, icon: Icon, end }) => <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `app-drawer-link${isActive ? ' is-active' : ''}`}
            onClick={closeDrawer}
          >
            <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>)}
        </nav>

        {otherWorkspaces.length > 0 && <div className="app-drawer-section">
          <p className="app-popover-label" role="presentation">Switch workspace</p>
          {otherWorkspaces.map((workspace) => <Link key={workspace.id} to={workspace.home} className="app-drawer-link" onClick={closeDrawer}>
            {workspace.id === 'host' ? <Building2 size={18} aria-hidden="true" /> : workspace.id === 'admin' ? <ShieldCheck size={18} aria-hidden="true" /> : <Compass size={18} aria-hidden="true" />}
            <span>{workspace.label} workspace</span>
          </Link>)}
        </div>}

        <div className="app-drawer-section app-drawer-footer">
          <Link to="/stays" className="app-drawer-link" onClick={closeDrawer}>
            <Compass size={18} aria-hidden="true" /><span>Browse public stays</span>
          </Link>
          <button type="button" className="app-drawer-link app-drawer-signout" onClick={() => void signOut()}>
            <LogOut size={18} aria-hidden="true" /><span>Sign out</span>
          </button>
        </div>
      </div>
    </>}
  </div>
}

export type { Section as AuthenticatedSection }
