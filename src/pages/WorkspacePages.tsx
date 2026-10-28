import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Building2, Compass, LayoutDashboard } from 'lucide-react'
import {
  TravelerDashboard, TravelerProfilePage, FriendsPage as FriendsFeature, BookingsPage as BookingsFeature,
  BookingCreatePage as BookingCreateFeature, BookingDrivePage as BookingDriveFeature,
  PublicStaySearchPage, PublicHotelDetailsPage,
  HostDashboardPage, AdminDashboardPage, AdminHotelsPage as AdminHotelsFeature,
  AdminApplicationsPage as AdminApplicationsFeature,
} from './features'
import { TravelPlansPage as TravelPlansFeature } from './TravelPlansPage'
import { useAuth } from '../auth/useAuth'
import { homeForRoles, type WorkspaceId } from '../auth/redirect'

export function WorkspacePage({ mode = 'traveler' }: { mode?: 'traveler' | 'host' | 'admin' }) {
  if (mode === 'host') return <HostDashboardPage />
  if (mode === 'admin') return <AdminDashboardPage />
  return <TravelerDashboard />
}
export function StaySearchPage() { const { hotelId } = useParams(); return hotelId ? <PublicHotelDetailsPage /> : <PublicStaySearchPage /> }
export function HotelDetailsPage() { return <PublicHotelDetailsPage /> }
export function ProfilePage() { return <TravelerProfilePage /> }
export function FriendsPage() { return <FriendsFeature /> }
export function BookingsPage() { return <BookingsFeature /> }
export function BookingCreatePage() { return <BookingCreateFeature /> }
export function BookingDrivePage() { return <BookingDriveFeature /> }
export function TravelPlansPage() { return <TravelPlansFeature /> }
export function AdminHotelsPage() { return <AdminHotelsFeature /> }
export function AdminApplicationsPage() { return <AdminApplicationsFeature /> }

export function HostLandingPage() {
  return <section className="standalone-page host-landing">
    <span className="eyebrow"><span className="eyebrow-dot" /> BECOME A WANDORA HOST</span>
    <h1>Make room<br />for wonder.</h1>
    <p>Share your place with travelers who want more than a bed. Apply to host, then publish approved properties and rooms from your host studio.</p>
    <div className="status-actions">
      <Link className="button button-dark" to="/register">Create your account <ArrowRight size={16} /></Link>
      <Link className="button button-soft" to="/login">I already host with Wandora</Link>
    </div>
    <ul className="host-steps">
      <li><span className="value-icon green"><Building2 size={18} /></span><span><b>Apply once</b><small>Share your business details and verification documents.</small></span></li>
      <li><span className="value-icon peach"><LayoutDashboard size={18} /></span><span><b>Get approved</b><small>An admin reviews your application and documents.</small></span></li>
      <li><span className="value-icon lavender"><Compass size={18} /></span><span><b>Welcome travelers</b><small>Publish rooms, photos and prices from the host studio.</small></span></li>
    </ul>
  </section>
}

export function ForbiddenPage() {
  const { roles, isAuthenticated } = useAuth()
  const home = homeForRoles(roles)
  return <section className="standalone-page status-page">
    <span className="status-code">403</span>
    <h1>This space isn’t yours to enter.</h1>
    <p>Your persisted backend roles do not include this area. Your account keeps full access to the sections it already has.</p>
    <div className="status-actions">
      {isAuthenticated
        ? <Link className="button button-dark" to={home}>Back to your space <ArrowRight size={16} /></Link>
        : <Link className="button button-dark" to="/login">Sign in <ArrowRight size={16} /></Link>}
      <Link className="button button-soft" to="/stays">Explore stays</Link>
    </div>
  </section>
}

export function NotFoundPage() {
  return <section className="standalone-page status-page">
    <span className="status-code">404</span>
    <h1>Looks like a wrong turn.</h1>
    <p>The page you were looking for has moved or never existed. Let’s get you back to somewhere worth staying.</p>
    <div className="status-actions">
      <Link className="button button-dark" to="/">Return home <ArrowRight size={16} /></Link>
      <Link className="button button-soft" to="/stays">Explore stays</Link>
    </div>
  </section>
}

const SECTION_FALLBACK: Record<WorkspaceId, { label: string; home: string }> = {
  traveler: { label: 'your workspace', home: '/app' },
  host: { label: 'the host studio', home: '/host/dashboard' },
  admin: { label: 'the admin console', home: '/admin' },
}

/** Route fallback rendered *inside* the authenticated shell, so navigation stays available. */
export function WorkspaceNotFoundPage({ section }: { section: WorkspaceId }) {
  const fallback = SECTION_FALLBACK[section]
  return <section className="workspace-status" aria-labelledby="workspace-not-found-title">
    <span className="status-code">404</span>
    <h1 id="workspace-not-found-title">That page isn’t here.</h1>
    <p>This address doesn’t belong to {fallback.label}. Everything else is still one click away.</p>
    <div className="status-actions">
      <Link className="button button-dark" to={fallback.home}>Back to {fallback.label} <ArrowRight size={16} /></Link>
      <Link className="button button-soft" to="/stays">Browse public stays</Link>
    </div>
  </section>
}
