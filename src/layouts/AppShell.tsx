import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Bell, Building2, Compass, House, LayoutDashboard, LogOut, Menu, Shield, UserRound, Users, X } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { useToast } from '../components/useToast'
import { getErrorMessage } from '../api/http'

const travelerItems = [{ to: '/app', label: 'Overview', icon: LayoutDashboard }, { to: '/app/stays', label: 'Explore stays', icon: Compass }, { to: '/app/trips', label: 'My trips', icon: House }, { to: '/app/friends', label: 'Travel together', icon: Users }, { to: '/app/bookings', label: 'Bookings', icon: Building2 }, { to: '/app/profile', label: 'My profile', icon: UserRound }]

export function AppShell({ mode = 'traveler' }: { mode?: 'traveler' | 'host' | 'admin' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { session, roles, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const admin = mode === 'admin'
  const host = mode === 'host'
  const items = admin ? [{ to: '/admin', label: 'Overview', icon: LayoutDashboard }, { to: '/admin/hotels', label: 'Hotels', icon: Building2 }, { to: '/admin/applications', label: 'Applications', icon: Shield }] : host ? [{ to: '/host/dashboard', label: 'Overview', icon: LayoutDashboard }, { to: '/host/stays', label: 'My properties', icon: Building2 }, { to: '/host/profile', label: 'Host profile', icon: UserRound }] : travelerItems
  const title = admin ? 'Administration' : host ? 'Host studio' : 'Your journeys'
  const initials = String(session?.userId ?? 'W').slice(0, 1).toUpperCase()
  async function signOut() {
    try { await logout(); showToast('You have signed out.'); navigate('/') }
    catch (error) { showToast(getErrorMessage(error), 'error') }
  }

  return <div className="dashboard-shell">
    <aside className={`dashboard-sidebar${menuOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-top"><a href="/" className="brand"><span className="brand-mark"><Compass size={19} /></span><span>wandora<span className="brand-period">.</span></span></a><button className="icon-button sidebar-close" aria-label="Close navigation" type="button" onClick={() => setMenuOpen(false)}><X size={18} /></button></div>
      <div className="workspace-label"><span className={`workspace-dot ${admin ? 'dot-admin' : host ? 'dot-host' : ''}`} />{title}</div>
      <nav className="sidebar-nav" aria-label={`${title} navigation`}>{items.map(({ to, label, icon: Icon }) => <NavLink key={to} end={to === '/app' || to === '/admin'} className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`} to={to} onClick={() => setMenuOpen(false)}><Icon size={18} strokeWidth={1.8} /><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-note"><span className="note-icon"><Bell size={16} /></span><span><b>Keep the wonder close</b><small>Your next story is out there.</small></span></div><div className="sidebar-user"><span className="user-avatar">{initials}</span><span className="user-meta"><b>{host ? 'Host' : admin ? 'Administrator' : 'Traveler'} {session?.userId ?? ''}</b><small>{roles.join(' · ') || 'WANDORA MEMBER'}</small></span><button className="icon-button signout-button" type="button" aria-label="Sign out" onClick={() => void signOut()}><LogOut size={17} /></button></div></div>
    </aside>
    {menuOpen && <button aria-label="Close navigation backdrop" className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}
    <section className="dashboard-main"><header className="dashboard-header"><button className="icon-button dashboard-menu" aria-label="Open navigation" type="button" onClick={() => setMenuOpen(true)}><Menu size={20} /></button><div className="dashboard-breadcrumb"><span>{admin ? 'ADMIN' : host ? 'HOST' : 'TRAVELER'}</span><b>/</b>{title}</div><div className="header-actions"><a href="/" className="back-to-public">Back to Wandora</a><span className="header-avatar">{initials}</span></div></header><main className="dashboard-content"><Outlet /></main></section>
  </div>
}
