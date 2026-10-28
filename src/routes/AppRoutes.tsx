import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout, HomePage } from '../layouts/PublicLayout'
import { AppShell } from '../layouts/AppShell'
import { RequireAuth, RequireRole } from './guards'
import { LoginPage, RegisterPage, VerifyEmailPage } from '../pages/AuthPages'
import { AdminApplicationsPage, AdminHotelsPage, BookingCreatePage, BookingDrivePage, BookingsPage, ForbiddenPage, FriendsPage, HostLandingPage, NotFoundPage, ProfilePage, StaySearchPage, TravelPlansPage, WorkspacePage } from '../pages/WorkspacePages'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/host', element: <HostLandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/verify-email', element: <VerifyEmailPage /> },
      { path: '/forbidden', element: <ForbiddenPage /> },
      { path: '/stays', element: <StaySearchPage /> },
      { path: '/stays/:hotelId', element: <StaySearchPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/app', element: <WorkspacePage /> },
          { path: '/app/stays', element: <StaySearchPage /> },
          { path: '/app/trips', element: <TravelPlansPage /> },
          { path: '/app/friends', element: <FriendsPage /> },
          { path: '/app/bookings', element: <BookingsPage /> },
          { path: '/app/book', element: <BookingCreatePage /> },
          { path: '/app/drive/:bookingId', element: <BookingDrivePage /> },
          { path: '/app/profile', element: <ProfilePage /> },
        ],
      },
      {
        element: <RequireRole roles={['HOST']} />,
        children: [{ element: <AppShell mode="host" />, children: [
          { path: '/host/dashboard', element: <WorkspacePage mode="host" /> },
          { path: '/host/stays', element: <WorkspacePage mode="host" /> },
          { path: '/host/profile', element: <WorkspacePage mode="host" /> },
        ] }],
      },
      {
        element: <RequireRole roles={['ADMIN']} />,
        children: [{ element: <AppShell mode="admin" />, children: [
          { path: '/admin', element: <WorkspacePage mode="admin" /> },
          { path: '/admin/hotels', element: <AdminHotelsPage /> },
          { path: '/admin/applications', element: <AdminApplicationsPage /> },
        ] }],
      },
    ],
  },
])
