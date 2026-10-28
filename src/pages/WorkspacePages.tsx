import { Link, useParams } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import {
  TravelerDashboard, TravelerProfilePage, FriendsPage as FriendsFeature, BookingsPage as BookingsFeature,
  BookingCreatePage as BookingCreateFeature, BookingDrivePage as BookingDriveFeature,
  PublicStaySearchPage, PublicHotelDetailsPage,
  HostDashboardPage, AdminDashboardPage, AdminHotelsPage as AdminHotelsFeature,
  AdminApplicationsPage as AdminApplicationsFeature,
} from './features'
import { TravelPlansPage as TravelPlansFeature } from './TravelPlansPage'

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
export function HostLandingPage() { return <section className="standalone-page"><span className="eyebrow">BECOME A WANDORA HOST</span><h1>Make room for wonder.</h1><p>Share your place with travelers and follow the documented host application flow.</p><Link className="button button-dark" to="/register">Create your account <ArrowRight size={16} /></Link></section> }
export function ForbiddenPage() { return <section className="standalone-page status-page"><span className="status-code">403</span><h1>This space isn’t yours to enter.</h1><p>Your persisted backend roles do not include this area.</p><Link className="button button-dark" to="/app">Back to your space <ArrowRight size={16} /></Link></section> }
export function NotFoundPage() { return <section className="standalone-page status-page"><span className="status-code">404</span><h1>Looks like a wrong turn.</h1><Link className="button button-dark" to="/">Return home <ArrowRight size={16} /></Link></section> }
