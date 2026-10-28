import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQueries, useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarDays, Compass, Heart, MapPin, ShieldCheck } from 'lucide-react'
import { getErrorMessage } from '../api/http'
import { queryKeys as keys } from '../api/queryKeys'
import { adminApi, discoveryApi, hostApi, hostPropertyApi, hotelSearchApi, type HotelSearchParams } from '../api/features'
import { useFeatureMutations, featureHooks } from '../api/hooks'
import { useAuth } from '../auth/useAuth'
import type { ApplicationDetails, Booking, Friendship, HotelBooking, HotelSummary, Room, UserProfile, UserSummary } from '../types/api'
import { useToast } from '../components/useToast'
import { BackLink, ConfirmButton, DataState, EmptyState, PageTitle, Pagination, StatusBadge } from '../components/FeatureUi'

const currency = (amount?: number, code = 'INR') => amount == null ? 'Price not provided' : new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount)
function useNotifyError() { const { showToast } = useToast(); return (error: unknown) => showToast(getErrorMessage(error), 'error') }
function Empty({ message, action }: { message: string; action?: ReactNode }) { return <div className="empty-content"><p>{message}</p>{action}</div> }
function Metric({ label, value, to, symbol }: { label: string; value?: number; to?: string; symbol: string }) { const child = <><i>{symbol}</i><span><small>{label}</small><b>{value ?? '—'}</b></span>{to && <ArrowRight size={15} />}</>; return to ? <Link className="feature-stat" to={to}>{child}</Link> : <div className="feature-stat">{child}</div> }

export function TravelerDashboard() {
  const me = featureHooks.useProfile(); const bookings = featureHooks.useBookings(); const plans = featureHooks.useTravelPlans(); const friends = featureHooks.useFriendships()
  return <div className="feature-page"><PageTitle eyebrow="YOUR WANDORA, YOUR WAY" title={`Welcome${me.data?.name ? `, ${me.data.name.split(' ')[0]}` : ' back'}.`} description="Your trips, people and stays, connected to your Wandora account." />      <div className="feature-stat-grid"><Metric label="Bookings" value={bookings.data?.length} to="/app/bookings" symbol="⌂" /><Metric label="Travel plans" value={plans.data?.content.length} to="/app/trips" symbol="✳" /><Metric label="Friendships" value={friends.data?.length} to="/app/friends" symbol="♡" /></div>
    <section className="feature-section"><header className="section-heading"><div><span className="eyebrow">UPCOMING / RECENT</span><h2>Your bookings</h2></div><Link className="value-link" to="/app/bookings">All bookings <ArrowRight size={14} /></Link></header><DataState loading={bookings.isPending} error={bookings.error} onRetry={() => void bookings.refetch()} empty={!bookings.data?.length && !bookings.isPending ? <Empty message="No bookings yet." action={<Link className="button button-dark" to="/stays">Explore stays</Link>} /> : undefined}>{bookings.data?.slice(0, 3).map((booking) => <BookingRow booking={booking} key={booking.bookingId} />)}</DataState></section>
    <section className="feature-section"><header className="section-heading"><div><span className="eyebrow">MAKE MEMORIES TOGETHER</span><h2>Travel plans</h2></div><Link to="/app/trips" className="value-link">Open plans <ArrowRight size={14} /></Link></header><DataState loading={plans.isPending} error={plans.error} empty={!plans.data?.content.length && !plans.isPending ? <Empty message="Your travel plans will live here." /> : undefined}>{plans.data?.content.slice(0, 3).map((plan) => <Link className="data-row" key={plan.id} to="/app/trips"><div className="data-row-main"><b>{plan.title}</b><small>{plan.destination} · {plan.startDate} — {plan.endDate}</small></div><StatusBadge status={plan.status} /></Link>)}</DataState></section>
  </div>
}

export function PublicStaySearchPage() {
  const location = useLocation()
  const staysBase = location.pathname.startsWith('/app') ? '/app/stays' : '/stays'
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = { city: searchParams.get('city') || '', startDate: searchParams.get('startDate') || '', endDate: searchParams.get('endDate') || '', roomCount: Math.max(1, Number(searchParams.get('roomCount') || 1)) }
  const [city, setCity] = useState(initial.city)
  const [startDate, setStartDate] = useState(initial.startDate)
  const [endDate, setEndDate] = useState(initial.endDate)
  const [roomCount, setRoomCount] = useState(initial.roomCount)
  const [criteria, setCriteria] = useState(initial)
  const [pageNo, setPageNo] = useState(Number(searchParams.get('pageNo') || 0))
  const [submitted, setSubmitted] = useState(searchParams.has('pageNo') || Boolean(initial.city || initial.startDate || initial.endDate))
  const [dateError, setDateError] = useState('')
  const params: HotelSearchParams = { hotelRequestInfo: { city: criteria.city.trim() || undefined, startDate: criteria.startDate || undefined, endDate: criteria.endDate || undefined, roomCount: criteria.roomCount, pageNo, pageSize: 10 } }
  const query = featureHooks.useHotelSearch(params, submitted)
  const updatePage = (nextPage: number) => {
    setPageNo(nextPage)
    setSearchParams(Object.fromEntries(Object.entries({ ...criteria, roomCount: String(criteria.roomCount), pageNo: String(nextPage) }).filter(([, value]) => value)))
  }
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDateError('')
    if (startDate && endDate && endDate <= startDate) { setDateError('Check-out must be after check-in.'); return }
    if (Boolean(startDate) !== Boolean(endDate)) { setDateError('Enter both check-in and check-out dates, or leave both blank.'); return }
    const next = { city: city.trim(), startDate, endDate, roomCount: Math.max(1, roomCount) }
    setCriteria(next)
    setSubmitted(true)
    setPageNo(0)
    setSearchParams(Object.fromEntries(Object.entries({ ...next, roomCount: String(next.roomCount), pageNo: '0' }).filter(([, value]) => value)))
  }
  const detailQuery = new URLSearchParams({ ...(criteria.startDate ? { startDate: criteria.startDate } : {}), ...(criteria.endDate ? { endDate: criteria.endDate } : {}), roomCount: String(criteria.roomCount) })
  return <div className="feature-page public-search-page">
    <PageTitle eyebrow="FIND YOUR SOMEWHERE" title="Stays with a story." description="Search the live accommodation service. Hotel availability, photos and prices are supplied by Wandora." />
    <form className="search-panel" onSubmit={submitSearch}>
      <label>Destination<input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" /></label>
      <label>Check in<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label>Check out<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
      <label>Rooms<input aria-label="Rooms" type="number" min="1" max="100" value={roomCount} onChange={(event) => setRoomCount(Math.max(1, Number(event.target.value)))} /></label>
      <button className="button button-green" type="submit" disabled={query.isFetching}><Compass size={16} />{query.isFetching ? 'Searching…' : 'Search stays'}</button>
    </form>
    {dateError && <div className="feature-state feature-error" role="alert">{dateError}</div>}
    {submitted && <DataState loading={query.isPending || query.isFetching} error={query.error} onRetry={() => void query.refetch()} empty={!query.data?.content.length && !query.isPending ? <Empty message="No stays match these search details." /> : undefined}>
      <div className="result-heading"><b>{query.data?.totalElements ?? 0} stays</b><span>Page {(query.data?.number ?? pageNo) + 1}</span></div>
      <div className="hotel-grid">{query.data?.content.map(({ hotel, price }, index) => {
        const id = hotel?.id
        const image = hotel?.photoUrls?.[0]
        return <article className="hotel-card" key={id ?? `${hotel?.hotelName}-${index}`}>
          <Link className="hotel-image-button" to={id ? `${staysBase}/${id}?${detailQuery}` : staysBase}>{image ? <img className="hotel-photo" src={image} alt={hotel?.hotelName || 'Hotel'} loading="lazy" decoding="async" /> : <div className="hotel-image-empty"><Compass size={24} /><span>No public photo provided</span></div>}<span className="hotel-location"><MapPin size={12} />{hotel?.city || 'City not provided'}</span></Link>
          <div className="hotel-card-content"><div className="hotel-card-title"><h2>{hotel?.hotelName || 'Stay'}</h2><Heart size={16} /></div><p>{hotel?.host?.businessName || hotel?.host?.hostName || 'Host not provided'}</p><div className="hotel-card-footer"><span>{currency(price)}</span>{id && <Link to={`${staysBase}/${id}?${detailQuery}`}>Details <ArrowRight size={13} /></Link>}</div></div>
        </article>
      })}</div>
      <Pagination page={query.data?.number ?? pageNo} totalPages={query.data?.totalPages || 0} onPage={updatePage} />
    </DataState>}
    {!submitted && <div className="feature-state feature-empty"><span className="empty-symbol">⌂</span><p>Choose your destination and dates, then search available stays.</p></div>}
  </div>
}

export function PublicHotelDetailsPage() {
  const { hotelId: hotelIdParam } = useParams()
  const hotelId = Number(hotelIdParam)
  const validHotelId = Number.isInteger(hotelId) && hotelId > 0
  const [searchParams] = useSearchParams()
  const detail = featureHooks.useHotel(validHotelId ? hotelId : 0)
  const photos = useQuery({ queryKey: ['public-hotel-photos', hotelId], queryFn: () => hotelSearchApi.hotelPhotos(hotelId), enabled: validHotelId })
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const staysBase = location.pathname.startsWith('/app/stays') ? '/app/stays' : '/stays'
  const search = searchParams.toString()
  const backTo = search ? `${staysBase}?${search}` : staysBase
  const gallery = (photos.data?.length ? photos.data : detail.data?.hotel?.photoUrls || []).slice(0, 5)
  const rooms = detail.data?.rooms ?? []

  const bookRoom = (roomId: number) => {
    const bookingParams = new URLSearchParams({
      hotelId: String(hotelId),
      roomId: String(roomId),
      roomsCount: searchParams.get('roomCount') || '1',
      ...(searchParams.get('startDate') ? { checkInDate: searchParams.get('startDate')! } : {}),
      ...(searchParams.get('endDate') ? { checkOutDate: searchParams.get('endDate')! } : {}),
    })
    // Losing the search criteria on the way to sign-in is the classic dead end:
    // keep the full booking intent as the post-login destination instead.
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/app/book', search: `?${bookingParams.toString()}` }, reason: 'auth' } })
      return
    }
    navigate(`/app/book?${bookingParams.toString()}`)
  }

  if (!validHotelId) {
    return <div className="feature-page">
      <BackLink to={staysBase}>Back to search results</BackLink>
      <EmptyState title="This stay link is incomplete" description="Open a stay from search results to see its rooms and photos." action={<Link className="button button-dark" to={staysBase}>Explore stays</Link>} />
    </div>
  }

  return <div className="feature-page hotel-detail-page">
    <BackLink to={backTo}>Back to search results</BackLink>
    <DataState loading={detail.isPending} error={detail.error} onRetry={() => void detail.refetch()}>
      {detail.data && <>
        <PageTitle
          eyebrow={detail.data.hotel?.city || 'WANDORA STAY'}
          title={detail.data.hotel?.hotelName || 'Stay details'}
          description={detail.data.hotel?.host?.description || 'Details are shown from the live hotel record.'}
        />
        <div className="hotel-detail-gallery">
          {gallery.map((url, index) => <img src={url} key={`${url}-${index}`} alt={`${detail.data?.hotel?.hotelName || 'Hotel'} photo ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />)}
          {gallery.length === 0 && <div className="hotel-image-empty"><Compass size={24} aria-hidden="true" /><span>No public photos supplied</span></div>}
        </div>
        <div className="hotel-detail-layout">
          <section className="hotel-rooms" aria-labelledby="hotel-rooms-title">
            <div className="section-heading">
              <div><span className="eyebrow">ROOMS</span><h2 id="hotel-rooms-title">Choose your room</h2></div>
            </div>
            {rooms.length
              ? rooms.map((room) => <PublicRoomCard room={room} hotelId={hotelId} onBook={() => bookRoom(room.id)} key={room.id} />)
              : <EmptyState title="No rooms published yet" description="This host has not published public room information for these dates." />}
          </section>
          <aside className="detail-aside">
            <h3>About this stay</h3>
            <p><MapPin size={14} aria-hidden="true" /> {detail.data.hotel?.city || 'City not provided'}</p>
            <p>{detail.data.hotel?.amenities?.join(' · ') || 'Amenities not supplied'}</p>
            <p>{detail.data.hotel?.host?.businessName || detail.data.hotel?.host?.hostName || 'Host details not supplied'}</p>
            <Link className="button button-soft" to={backTo}>Change dates or city</Link>
          </aside>
        </div>
      </>}
    </DataState>
  </div>
}
function PublicRoomCard({ room, hotelId, onBook }: { room: {id:number;type?:string;description?:string;basePrice?:number;amenities?:string[];roomCapacity?:number}; hotelId:number; onBook:()=>void }) { const photos = useQuery({queryKey:['room-photos',room.id],queryFn:()=>hotelSearchApi.roomPhotos(room.id),enabled:room.id>0}); return <article className="room-card">{photos.data?.[0] ? <img src={photos.data[0]} alt={room.type ? `${room.type} room` : 'Room'} loading="lazy" decoding="async" /> : <div className="room-placeholder"><Compass size={20}/></div>}<div className="room-info"><h3>{room.type||'Room'}</h3><p>{room.description||'Description not provided.'}</p><small>{room.roomCapacity == null?'Capacity not provided':`${room.roomCapacity} guests`} · {room.amenities?.join(', ')||'Amenities not provided'}</small></div><div className="room-price"><b>{currency(room.basePrice)}</b><button className="button button-dark" disabled={!hotelId} onClick={onBook}>Book this room</button></div></article> }

export function TravelerProfilePage() {
  const profile = featureHooks.useProfile()
  const { updateProfile, uploadProfileImage, addPhone, removePhone } = useFeatureMutations()
  const notifyError = useNotifyError()
  const { showToast } = useToast()
  const [phone, setPhone] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const { roles } = useAuth()

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await updateProfile.mutateAsync({
        name: String(form.get('name')),
        bio: String(form.get('bio') || ''),
        gender: String(form.get('gender')) as UserProfile['gender'],
      })
      showToast('Your profile has been updated.')
    } catch (error) { notifyError(error) }
  }

  return <div className="feature-page">
    <PageTitle eyebrow="YOUR PROFILE" title="The person behind the passport." description="Edit your account details and manage the phone numbers your bookings use." />
    <DataState loading={profile.isPending} error={profile.error} onRetry={() => void profile.refetch()}>
      {profile.data && <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-avatar-large">
            {profile.data.profileImg ? <img src={profile.data.profileImg} alt={`${profile.data.name} profile photo`} /> : profile.data.name.slice(0, 1)}
          </div>
          <label className="button button-soft file-button">
            {uploadProfileImage.isPending ? 'Uploading…' : 'Change photo'}
            <input type="file" accept="image/*" aria-label="Upload profile photo" onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              setProgress(0)
              try {
                await uploadProfileImage.mutateAsync({ file, onProgress: setProgress })
                setProgress(100)
                showToast('Profile photo updated.')
              } catch (error) { notifyError(error) }
            }} />
          </label>
          {progress != null && <small className="profile-upload-progress">Upload {progress}%</small>}
          <h2>{profile.data.name}</h2>
          <p>@{profile.data.username}</p>
          <p>{profile.data.email}</p>
          <StatusBadge status={profile.data.status} />
          <p className="profile-role">Persisted roles: {roles.join(', ') || 'none returned'}</p>
          <p className="profile-role">{profile.data.emailVerified ? 'Email verified' : 'Email not verified'}</p>
        </aside>
        <div className="profile-content">
          <form className="feature-form" onSubmit={(event) => void save(event)}>
            <h2>Personal details</h2>
            <label htmlFor="profile-name">Name
              <input id="profile-name" name="name" required maxLength={100} defaultValue={profile.data.name} />
              <span className="field-hint">This is the name hosts and travel companions see.</span>
            </label>
            <label htmlFor="profile-bio">Bio
              <textarea id="profile-bio" name="bio" maxLength={1000} defaultValue={profile.data.bio || ''} placeholder="A sentence about how you travel." />
              <span className="field-hint">Up to 1000 characters.</span>
            </label>
            <label htmlFor="profile-gender">Gender
              <select id="profile-gender" name="gender" defaultValue={profile.data.gender || 'NOT_DEFINED'}>
                {['MALE', 'FEMALE', 'OTHERS', 'NOT_DEFINED'].map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ').toLowerCase()}</option>)}
              </select>
            </label>
            <button className="button button-dark" disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving…' : 'Save profile'}</button>
          </form>
          <section className="feature-form" aria-labelledby="profile-phones-title">
            <h2 id="profile-phones-title">Phone numbers</h2>
            <p>Add the numbers that should be reachable for your trips. Indian mobile numbers only.</p>
            <form className="inline-form" onSubmit={(event) => {
              event.preventDefault()
              addPhone.mutate(phone, {
                onError: notifyError,
                onSuccess: () => { setPhone(''); showToast('Phone number added.') },
              })
            }}>
              <label className="sr-only" htmlFor="profile-phone">Phone number</label>
              <input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} pattern="[6-9][0-9]{9}" required placeholder="10-digit Indian number" />
              <button className="button button-soft" disabled={addPhone.isPending}>{addPhone.isPending ? 'Adding…' : 'Add phone'}</button>
            </form>
            {profile.data.phones?.length
              ? profile.data.phones.map((value) => <div className="data-row compact" key={value}>
                <span>{value}</span>
                <button className="button button-danger button-compact" onClick={() => removePhone.mutate(value, { onError: notifyError, onSuccess: () => showToast('Phone number removed.') })}>Remove</button>
              </div>)
              : <p className="muted-note">No phone numbers saved yet.</p>}
          </section>
        </div>
      </div>}
    </DataState>
  </div>
}

export function FriendsPage() {
  const [page, setPage] = useState(0)
  const users = featureHooks.useUsers(page)
  const friends = featureHooks.useFriendships()
  const { sendFriendRequest, removeFriend } = useFeatureMutations()
  const notifyError = useNotifyError()
  const { showToast } = useToast()
  const content = users.data?.content ?? []
  const statusQueries = useQueries({
    queries: content.map((user) => ({ queryKey: ['friendship', user.id], queryFn: () => discoveryApi.status(user.id), enabled: user.id > 0 })),
  })
  const friendIds = new Set((friends.data || []).map((friendship: Friendship) => friendship.userId))

  return <div className="feature-page">
    <PageTitle eyebrow="TRAVEL TOGETHER" title="Good trips find their people." description="Discover members, see friendship status and manage accepted friendships." />
    <section className="feature-section" aria-labelledby="people-heading">
      <h2 id="people-heading">People on Wandora</h2>
      <DataState
        loading={users.isPending}
        error={users.error || friends.error}
        onRetry={() => { void users.refetch(); void friends.refetch() }}
        empty={!content.length && !users.isPending ? <EmptyState title="No travelers found" description="No members were returned for this page. Try refreshing in a moment." /> : undefined}
      >
        <div className="people-grid">
          {content.map((user: UserSummary, index) => <article className="person-card" key={user.id}>
            <div className="person-avatar">{user.profileImg ? <img src={user.profileImg} alt={`${user.name} profile photo`} /> : user.name.slice(0, 1)}</div>
            <div className="person-info">
              <b>{user.name}</b>
              <small>@{user.username}</small>
              <p>{user.bio || 'No bio provided.'}</p>
            </div>
            {friendIds.has(user.id)
              ? <ConfirmButton
                label="Remove friend"
                confirmText={`Remove ${user.name} from your friends? You can send a new request later.`}
                onConfirm={() => removeFriend.mutate(user.id, { onError: notifyError, onSuccess: () => showToast(`${user.name} removed from your friends.`) })}
              />
              : statusQueries[index]?.isPending
                ? <span className="relationship-loading"><span className="button-spinner" aria-hidden="true" /> Checking relationship…</span>
                : statusQueries[index]?.isError
                  ? <button className="button button-soft" onClick={() => void statusQueries[index]?.refetch()}>Retry relationship check</button>
                  : statusQueries[index]?.data?.requestPending
                    ? <StatusBadge status="PENDING" />
                    : <button className="button button-dark" onClick={() => sendFriendRequest.mutate(user.id, { onError: notifyError, onSuccess: () => showToast(`Friend request sent to ${user.name}.`) })} disabled={sendFriendRequest.isPending}>
                      {sendFriendRequest.isPending && sendFriendRequest.variables === user.id ? 'Sending…' : 'Send request'}
                    </button>}
          </article>)}
        </div>
        <Pagination page={page} totalPages={users.data?.totalPages || 0} onPage={setPage} />
      </DataState>
    </section>
    <section className="feature-section" aria-labelledby="friendships-heading">
      <h2 id="friendships-heading">Your friendships</h2>
      <DataState
        loading={friends.isPending}
        error={friends.error}
        onRetry={() => void friends.refetch()}
        empty={!friends.data?.length && !friends.isPending ? <EmptyState title="No friendships yet" description="Send a request above to start planning trips together." /> : undefined}
      >
        {friends.data?.map((friendship: Friendship) => <div className="data-row" key={friendship.friendshipId || friendship.userId}>
          <div className="data-row-main">
            <b>User #{friendship.userId}</b>
            <small>Friendship #{friendship.friendshipId}</small>
          </div>
          <StatusBadge status={friendship.status} />
        </div>)}
      </DataState>
    </section>
  </div>
}

function BookingRow({ booking }: { booking: Booking }) {
  return <article className="booking-card">
    <div className="booking-top">
      <div>
        <span className="eyebrow">BOOKING #{booking.bookingId}</span>
        <h2>Hotel #{booking.hotelId} · Room #{booking.roomId}</h2>
      </div>
      <StatusBadge status={booking.bookingStatus} />
    </div>
    <div className="booking-facts">
      <span><CalendarDays size={15} aria-hidden="true" />{booking.checkInDate || '—'} → {booking.checkOutDate || '—'}</span>
      <span>{booking.roomsCount} room(s)</span>
      {booking.amount != null && <span>{currency(booking.amount)}</span>}
    </div>
    <div className="booking-actions">
      <Link className="button button-soft" to={`/app/drive/${booking.bookingId}`}>Photo drive</Link>
      {!!booking.guests?.length && <span>Guests: {booking.guests?.map((guest) => guest.username || guest.name || 'Guest').join(', ')}</span>}
    </div>
  </article>
}

export function BookingsPage() {
  const q = featureHooks.useBookings()
  const { cancelBooking, addGuests, initiatePayment } = useFeatureMutations()
  const notifyError = useNotifyError()
  const { showToast } = useToast()
  const [params, setParams] = useSearchParams()
  const [guests, setGuests] = useState<Record<number, string>>({})
  const [paymentOrder, setPaymentOrder] = useState<{ key?: string; orderId?: string; amount?: number; currency?: string; bookingId: number } | null>(null)
  const created = params.get('created')

  return <div className="feature-page">
    <PageTitle eyebrow="YOUR STAYS" title="Bookings, all in one place." description="Booking details, guest changes, payment initiation and cancellation from the backend." />
    {created && <div className="feature-notice booking-created" role="status">
      <span>Booking <b>#{created}</b> has been reserved. You can add guests or continue to payment below.</span>
      <button type="button" className="button button-soft button-compact" onClick={() => { params.delete('created'); setParams(params, { replace: true }) }}>Dismiss</button>
    </div>}
    <DataState
      loading={q.isPending}
      error={q.error}
      onRetry={() => void q.refetch()}
      empty={!q.data?.length && !q.isPending ? <EmptyState title="No bookings yet" description="Find a stay you love and your reservations will appear here." action={<Link className="button button-dark" to="/app/stays">Explore stays</Link>} /> : undefined}
    >
      {q.data?.map((booking) => <div key={booking.bookingId}>
        <BookingRow booking={booking} />
        <div className="booking-tools">
          <form className="inline-form" onSubmit={(event) => {
            event.preventDefault()
            const ids = guests[booking.bookingId || 0]?.split(',').map((value) => Number(value.trim())).filter(Number.isInteger) || []
            if (booking.bookingId && ids.length) {
              addGuests.mutate({ bookingId: booking.bookingId, userIds: ids }, { onError: notifyError, onSuccess: () => showToast('Guests added to the booking.') })
            }
          }}>
            <label className="sr-only" htmlFor={`guests-${booking.bookingId}`}>Guest user IDs</label>
            <input
              id={`guests-${booking.bookingId}`}
              aria-label="Guest user IDs"
              placeholder="Guest user IDs, separated by commas"
              value={guests[booking.bookingId || 0] || ''}
              onChange={(event) => setGuests({ ...guests, [booking.bookingId || 0]: event.target.value })}
            />
            <button className="button button-soft" disabled={addGuests.isPending}>{addGuests.isPending ? 'Adding…' : 'Add guests'}</button>
          </form>
          {booking.bookingId && booking.bookingStatus === 'RESERVED' && <button
            className="button button-green"
            disabled={initiatePayment.isPending}
            onClick={() => initiatePayment.mutate(booking.bookingId!, { onError: notifyError, onSuccess: (order) => setPaymentOrder({ ...order, bookingId: booking.bookingId! }) })}
          >{initiatePayment.isPending ? 'Creating order…' : 'Initiate payment'}</button>}
          {booking.bookingId && ['RESERVED', 'CONFIRMED'].includes(booking.bookingStatus || '') && <ConfirmButton
            label="Cancel booking"
            confirmText={`Cancel booking #${booking.bookingId} for ${booking.checkInDate || 'these dates'}? This cannot be undone.`}
            confirmLabel="Cancel booking"
            onConfirm={() => cancelBooking.mutate(booking.bookingId!, { onError: notifyError, onSuccess: () => showToast(`Booking #${booking.bookingId} cancelled.`) })}
          />}
        </div>
      </div>)}
    </DataState>
    {paymentOrder && <PaymentCheckoutPanel order={paymentOrder} onClose={() => setPaymentOrder(null)} />}
  </div>
}
function PaymentCheckoutPanel({order,onClose}:{order:{key?:string;orderId?:string;amount?:number;currency?:string;bookingId:number};onClose:()=>void}){const {verifyPayment}=useFeatureMutations();const notifyError=useNotifyError();const [paymentId,setPaymentId]=useState('');const [signature,setSignature]=useState('');return <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="payment-dialog-title"><div className="detail-modal-card"><button className="modal-close" type="button" onClick={onClose}>Close</button><h2 id="payment-dialog-title">Payment order created</h2><p>Provider order: {order.orderId||'not returned'}</p><p>Amount: {order.amount==null?'not returned':`${order.amount} ${order.currency||''} minor units`}</p><p>Checkout key: {order.key||'not returned'}</p><div className="feature-notice" role="note">This frontend does not have the payment provider checkout flow configured. Without a signed provider callback, payment cannot be verified or marked complete. The backend order is ready, but no payment has been made here.</div><form className="feature-form" onSubmit={(e)=>{e.preventDefault();if(!order.orderId)return;verifyPayment.mutate({razorpayOrderId:order.orderId,razorpayPaymentId:paymentId,razorpaySignature:signature},{onError:notifyError,onSuccess:onClose})}}><label>Razorpay payment ID<input value={paymentId} onChange={e=>setPaymentId(e.target.value)} required minLength={1}/></label><label>Razorpay signature<input value={signature} onChange={e=>setSignature(e.target.value)} required minLength={1}/></label><button className="button button-dark" disabled={!order.orderId||verifyPayment.isPending}>{verifyPayment.isPending?'Verifying…':'Verify provider callback'}</button></form></div></div>}

export function BookingCreatePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { createBooking } = useFeatureMutations()
  const notifyError = useNotifyError()
  const { showToast } = useToast()
  const [formError, setFormError] = useState('')
  const today = new Date().toISOString().slice(0, 10)

  return <div className="feature-page">
    <BackLink to="/stays">Back to stay search</BackLink>
    <PageTitle eyebrow="RESERVE A STAY" title="Confirm your stay details." description="The server verifies room availability and establishes the reservation." />
    <form className="feature-form booking-form" onSubmit={async (event) => {
      event.preventDefault()
      setFormError('')
      const form = new FormData(event.currentTarget)
      const checkInDate = String(form.get('checkInDate'))
      const checkOutDate = String(form.get('checkOutDate'))
      if (checkOutDate <= checkInDate) { setFormError('Check-out must be after check-in.'); return }
      try {
        const result = await createBooking.mutateAsync({
          hotelId: Number(form.get('hotelId')),
          roomId: Number(form.get('roomId')),
          roomsCount: Number(form.get('roomsCount')),
          checkInDate,
          checkOutDate,
        })
        showToast(`Booking #${result.bookingId ?? ''} reserved.`)
        navigate(`/app/bookings?created=${result.bookingId ?? ''}`)
      } catch (error) { notifyError(error) }
    }}>
      <div className="form-grid">
        <label htmlFor="book-hotel">Hotel ID<input id="book-hotel" name="hotelId" type="number" min="1" required defaultValue={params.get('hotelId') || ''} /></label>
        <label htmlFor="book-room">Room ID<input id="book-room" name="roomId" type="number" min="1" required defaultValue={params.get('roomId') || ''} /></label>
        <label htmlFor="book-rooms">Rooms<input id="book-rooms" name="roomsCount" type="number" min="1" required defaultValue={params.get('roomsCount') || '1'} /></label>
        <label htmlFor="book-checkin">Check in<input id="book-checkin" name="checkInDate" type="date" min={today} required defaultValue={params.get('checkInDate') || ''} /></label>
        <label htmlFor="book-checkout">Check out<input id="book-checkout" name="checkOutDate" type="date" min={today} required defaultValue={params.get('checkOutDate') || ''} /></label>
      </div>
      <p>Availability and the final booking state are determined by the backend.</p>
      {formError && <div className="form-alert" role="alert">{formError}</div>}
      <button className="button button-dark" disabled={createBooking.isPending}>
        {createBooking.isPending ? 'Reserving…' : <>Reserve booking <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
    </form>
  </div>
}

export function BookingDrivePage() {
  const { bookingId: bookingIdParam } = useParams()
  const bookingId = Number(bookingIdParam)
  const drive = featureHooks.useDrive(bookingId)
  const photos = featureHooks.useDrivePhotos(drive.data?.id || 0)
  const { uploadDrivePhoto, deleteDrivePhoto } = useFeatureMutations()
  const notifyError = useNotifyError()
  const { showToast } = useToast()

  return <div className="feature-page">
    <BackLink to="/app/bookings">Back to bookings</BackLink>
    <PageTitle eyebrow={`BOOKING #${bookingId || '—'}`} title="The booking drive." description="Every photo from this stay, kept together. Access is checked by the backend for booking participants." />
    <DataState loading={drive.isPending} error={drive.error} onRetry={() => void drive.refetch()}>
      {drive.data && <>
        <div className="drive-toolbar">
          <b>{photos.data?.totalElements || 0} photos</b>
          <label className="button button-dark file-button">
            Upload photo
            <input type="file" accept="image/*" aria-label="Upload a photo to this booking drive" onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              uploadDrivePhoto.mutate({ driveId: drive.data!.id!, file }, { onError: notifyError, onSuccess: () => showToast('Photo added to the booking drive.') })
            }} />
          </label>
        </div>
        <DataState
          loading={photos.isPending}
          error={photos.error}
          empty={!photos.data?.content.length && !photos.isPending ? <EmptyState title="No photos yet" description="Photos you upload for this booking will appear here." /> : undefined}
        >
          <div className="drive-grid">{photos.data?.content.map((photo) => <figure className="drive-photo" key={photo.id}>
            {photo.downloadUrl && <img src={photo.downloadUrl} alt={photo.originalFileName || 'Trip photo'} />}
            <figcaption>
              {photo.originalFileName || 'Trip photo'}
              <ConfirmButton
                label="Delete"
                confirmLabel="Delete photo"
                confirmText="Remove this photo from the booking drive? This cannot be undone."
                onConfirm={() => {
                  if (photo.id && drive.data?.id) deleteDrivePhoto.mutate({ driveId: drive.data.id, photoId: photo.id }, { onError: notifyError, onSuccess: () => showToast('Photo deleted.') })
                }}
              />
            </figcaption>
          </figure>)}</div>
        </DataState>
      </>}
    </DataState>
  </div>
}

export function HostDashboardPage(){const app=featureHooks.useHostApplication();const hotelApp=featureHooks.useHostHotelApplication();const notifyError=useNotifyError();const [section,setSection]=useState('overview');const [hotelId,setHotelId]=useState('');const [profile,setProfile]=useState<{id?:number;hostName?:string;businessName?:string;status?:string;officePhoneNumbers?:string[];officeEmails?:string[]}|null>(null);const tabs=['overview','host application','host profile','hotel application','hotel & rooms','bookings'];return <div className="feature-page"><PageTitle eyebrow="HOST STUDIO" title="Make every stay feel like a story." description="Complete onboarding and manage approved properties using the host API."/><div className="section-tabs">{tabs.map(t=><button type="button" aria-pressed={section===t} className={section===t?'selected':''} key={t} onClick={()=>setSection(t)}>{t}</button>)}</div>{section==='overview'&&<section className="feature-section"><h2>Host application</h2><DataState loading={app.isPending} error={app.error} empty={!app.data&&!app.isPending?<Empty message="No application found for this account." action={<button className="button button-dark" onClick={()=>setSection('host application')}>Apply to host</button>}/>:undefined}>{app.data&&<div className="data-row"><div className="data-row-main"><b>{app.data.businessName}</b><small>{app.data.rejectionReason||`Application #${app.data.id}`}</small></div><StatusBadge status={app.data.status}/></div>}</DataState><h2>Hotel application</h2><DataState loading={hotelApp.isPending} error={hotelApp.error} empty={!hotelApp.data&&!hotelApp.isPending?<Empty message="No hotel application returned."/>:undefined}>{hotelApp.data&&<div className="data-row"><b>{hotelApp.data.hotelName} · {hotelApp.data.city}</b><StatusBadge status={hotelApp.data.status}/></div>}</DataState></section>}{section==='host application'&&<HostApplicationForm onError={notifyError}/ >}{section==='host profile'&&<HostProfilePanel profile={profile} setProfile={setProfile} onError={notifyError}/ >}{section==='hotel application'&&<HotelApplicationForm onError={notifyError}/ >}{section==='hotel & rooms'&&<HostProperties hotelId={hotelId} setHotelId={setHotelId} onError={notifyError}/ >}{section==='bookings'&&<HotelBookings hotelId={hotelId} setHotelId={setHotelId}/>}</div>}
function HostApplicationForm({onError}:{onError:(e:unknown)=>void}){const {createHostApplication}=useFeatureMutations();const {showToast}=useToast();return <form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);createHostApplication.mutate({businessName:String(f.get('businessName')),files:{pan:f.get('pan') as File,aadhaar:f.get('aadhaar') as File,photo:f.get('photo') as File}},{onError,onSuccess:()=>showToast('Host application submitted for review.')})}}><h2>Apply to become a host</h2><p>Upload the three required documents in the field names specified by the backend.</p><div className="form-grid"><label>Business name<input name="businessName" minLength={4} maxLength={150} required/></label>{['pan','aadhaar','photo'].map(k=><label key={k}>{k.toUpperCase()}<input type="file" name={k} accept="image/*" required/></label>)}</div><button className="button button-dark" disabled={createHostApplication.isPending}>{createHostApplication.isPending?'Submitting…':'Submit application'}</button></form>}
function HostProfilePanel({profile,setProfile,onError}:{profile:{id?:number;hostName?:string;businessName?:string;status?:string;officePhoneNumbers?:string[];officeEmails?:string[]}|null;setProfile:(p:typeof profile)=>void;onError:(e:unknown)=>void}){const [hostId,setHostId]=useState('');const {createHostProfile,updateHostProfile,requestHostPhoneOtp,confirmHostPhoneOtp,requestHostEmailOtp,confirmHostEmailOtp}=useFeatureMutations();const{showToast}=useToast();return <section className="feature-section"><h2>Host profile and verification</h2>{profile?<><div className="data-row"><div className="data-row-main"><b>{profile.hostName}</b><small>{profile.businessName}</small></div><StatusBadge status={profile.status}/></div><form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);updateHostProfile.mutate({hostName:String(f.get('hostName')),active:f.get('active')==='true',description:String(f.get('description')||'')},{onError,onSuccess:()=>showToast('Host profile saved.')})}}><label>Host name<input name="hostName" defaultValue={profile.hostName} minLength={3} maxLength={100} required/></label><label>Description<textarea name="description"/></label><label>Active<select name="active" defaultValue="true"><option value="true">Active</option><option value="false">Inactive</option></select></label><button className="button button-dark">Update profile</button></form><OtpPanel title="Phone verification" value={profile.officePhoneNumbers?.[0]||''} request={v=>requestHostPhoneOtp.mutateAsync(v)} verify={(value,code)=>confirmHostPhoneOtp.mutateAsync({value,code})} onError={onError}/><OtpPanel title="Email verification" value={profile.officeEmails?.[0]||''} request={v=>requestHostEmailOtp.mutateAsync(v)} verify={(value,code)=>confirmHostEmailOtp.mutateAsync({value,code})} onError={onError}/></>:<><form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);createHostProfile.mutate({hostName:String(f.get('hostName')),officePhoneNumbers:[String(f.get('phone'))],officeEmails:[String(f.get('email'))],description:String(f.get('description')||''),active:true},{onError,onSuccess:(created)=>{setProfile(created);showToast('Host profile created.')}})}}><p>Requires an approved host application. Business name is copied from that approval.</p><div className="form-grid"><label>Host name<input name="hostName" minLength={3} maxLength={100} required/></label><label>Phone<input name="phone" pattern="[6-9][0-9]{9}" required/></label><label>Email<input name="email" type="email" required/></label><label>Description<input name="description"/></label></div><button className="button button-dark">Create host profile</button></form><div className="inline-form"><input value={hostId} onChange={e=>setHostId(e.target.value)} type="number" placeholder="Existing host ID"/><button className="button button-soft" onClick={()=>hostId&&hostApi.getProfile(Number(hostId)).then(setProfile).catch(onError)}>Load host profile</button></div></>}</section>}
function OtpPanel({title,value,request,verify,onError}:{title:string;value:string;request:(value:string)=>Promise<unknown>;verify:(value:string,code:string)=>Promise<unknown>;onError:(e:unknown)=>void}){const[code,setCode]=useState('');const[requesting,setRequesting]=useState(false);const[verifying,setVerifying]=useState(false);const requestCode=async()=>{setRequesting(true);try{await request(value)}catch(error){onError(error)}finally{setRequesting(false)}};const verifyCode=async(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();setVerifying(true);try{await verify(value,code);setCode('')}catch(error){onError(error)}finally{setVerifying(false)}};return <div className="verification-panel"><h3>{title}</h3><p>{value||'No contact returned'}</p><button className="button button-soft" type="button" disabled={!value||requesting} onClick={()=>void requestCode()}>{requesting?'Requesting…':'Request OTP'}</button><form className="inline-form" onSubmit={verifyCode}><label className="sr-only">{title} code</label><input value={code} onChange={e=>setCode(e.target.value)} minLength={6} maxLength={12} required placeholder="OTP code"/><button className="button button-dark" disabled={!value||verifying}>{verifying?'Verifying…':'Verify'}</button></form></div>}
function HotelApplicationForm({onError}:{onError:(e:unknown)=>void}){const {submitHotelApplication}=useFeatureMutations();const {showToast}=useToast();const options=useQuery({queryKey:['refund-options'],queryFn:hostPropertyApi.refundOptions});const keys=['id','address_proof','hotel_license','ownership_proof','business_registration','gst_certificate'] as const;return <form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const files=Object.fromEntries(keys.map(k=>[k,f.get(k) as File])) as Record<(typeof keys)[number],File>;const application={hotelName:String(f.get('hotelName')),city:String(f.get('city')),description:String(f.get('description')||''),contactInfo:{state:String(f.get('state')),building:String(f.get('building')),street:String(f.get('street')),pinCode:String(f.get('pinCode')),email:String(f.get('email')),phoneNumber:String(f.get('phone')),locationUrl:String(f.get('locationUrl')||''),landmark:String(f.get('landmark')||''),latitude:String(f.get('latitude')||''),longitude:String(f.get('longitude')||'')}};const refundPolicy={policyType:String(f.get('policyType')) as 'FLEXIBLE'|'MODERATE'|'STRICT'|'CUSTOM',rules:[{hoursBeforeCheckIn:Number(f.get('hoursBeforeCheckIn')),refundPercentage:Number(f.get('refundPercentage'))}]};const pricingPolicy={basePricePerNight:Number(f.get('basePricePerNight')),weekendPricePerNight:Number(f.get('weekendPricePerNight')),minimumStayNights:Number(f.get('minimumStayNights')),maximumStayNights:Number(f.get('maximumStayNights')),cleaningFee:Number(f.get('cleaningFee')),extraGuestFee:Number(f.get('extraGuestFee'))};submitHotelApplication.mutate({application,files,refundPolicy,pricingPolicy},{onError,onSuccess:()=>showToast('Hotel application submitted for review.')})}}><h2>Apply with a property</h2><p>Refund policy endpoint response: {options.data||'not available'}</p><div className="form-grid"><label>Hotel name<input name="hotelName" minLength={3} maxLength={125} required/></label><label>City<input name="city" minLength={3} maxLength={125} required/></label><label>Contact email<input name="email" type="email" required/></label><label>Contact phone<input name="phone" pattern="[6-9][0-9]{9}" required/></label><label>State<input name="state" required/></label><label>Building<input name="building" required/></label><label>Street<input name="street" required/></label><label>PIN code<input name="pinCode" pattern="[1-9][0-9]{5}" required/></label><label>Map URL<input name="locationUrl" type="url"/></label><label>Landmark<input name="landmark"/></label><label>Latitude<input name="latitude" pattern="[-+]?([1-8]?[0-9](\\.[0-9]+)?|90(\\.0+)?)"/></label><label>Longitude<input name="longitude" pattern="[-+]?(180(\\.0+)?|((1[0-7][0-9])|([1-9]?[0-9]))(\\.[0-9]+)?)"/></label><label>Description<textarea name="description"/></label><label>Refund hours before check-in<input name="hoursBeforeCheckIn" type="number" min="0" defaultValue="48" required/></label><label>Refund percentage<input name="refundPercentage" type="number" min="0" max="100" defaultValue="100" required/></label><label>Refund policy<select name="policyType">{['FLEXIBLE','MODERATE','STRICT','CUSTOM'].map(x=><option key={x}>{x}</option>)}</select></label><label>Base nightly price<input type="number" name="basePricePerNight" min="0.01" step="0.01" required/></label><label>Weekend nightly price<input type="number" name="weekendPricePerNight" min="0" step="0.01" required/></label><label>Min nights<input type="number" name="minimumStayNights" min="1" defaultValue="1" required/></label><label>Max nights<input type="number" name="maximumStayNights" min="1" defaultValue="30" required/></label><label>Cleaning fee<input type="number" name="cleaningFee" min="0" defaultValue="0" required/></label><label>Extra guest fee<input type="number" name="extraGuestFee" min="0" defaultValue="0" required/></label>{keys.map(k=><label key={k}>{k.replaceAll('_',' ')}<input name={k} type="file" accept="image/*" required/></label>)}</div><button className="button button-dark" disabled={submitHotelApplication.isPending}>{submitHotelApplication.isPending?'Submitting…':'Submit hotel application'}</button></form>}
function HostProperties({hotelId,setHotelId,onError}:{hotelId:string;setHotelId:(x:string)=>void;onError:(e:unknown)=>void}){const[hotel,setHotel]=useState<{id?:number;hotelName?:string;city?:string;amenities?:string[];active?:boolean}|null>(null);const[photos,setPhotos]=useState<string[]>([]);const rooms=useQuery({queryKey:keys.hostRooms(Number(hotelId)),queryFn:()=>hostPropertyApi.rooms(Number(hotelId)),enabled:Number(hotelId)>0});const{createHotel,updateHotel,uploadHotelPhoto,deleteHotelPhoto,createRoom,deactivateRoom}=useFeatureMutations();const{showToast}=useToast();return <section className="feature-section"><h2>Approved hotel</h2><div className="inline-form"><input type="number" value={hotelId} onChange={e=>setHotelId(e.target.value)} placeholder="Hotel ID"/><button className="button button-soft" onClick={()=>hotelId&&hostPropertyApi.getHotel(Number(hotelId)).then(setHotel).catch(onError)}>Load hotel</button><button className="button button-soft" onClick={()=>hotelId&&hostPropertyApi.hotelPhotos(Number(hotelId)).then(setPhotos).catch(onError)}>Load photos</button></div>{hotel&&<div className="data-row"><div className="data-row-main"><b>{hotel.hotelName}</b><small>{hotel.city} · {hotel.amenities?.join(', ')}</small></div><StatusBadge status={hotel.active?'ACTIVE':'INACTIVE'}/></div>}<form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);createHotel.mutate({amenities:String(f.get('amenities')||'').split(',').map(x=>x.trim()).filter(Boolean),active:true},{onError,onSuccess:x=>{if(x.id)setHotelId(String(x.id));setHotel(x);showToast('Hotel created.')}})}}><h3>Create hotel (after application approval)</h3><label>Amenities, comma-separated<input name="amenities"/></label><button className="button button-green">Create</button></form>{hotel&&<form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);updateHotel.mutate({id:hotel.id!,payload:{amenities:String(f.get('amenities')||'').split(',').map(x=>x.trim()).filter(Boolean),active:f.get('active')==='true'}},{onError,onSuccess:(updated)=>{setHotel(updated);showToast('Hotel details updated.')}})}}><h3>Update amenities and active state</h3><label>Amenities<input name="amenities" defaultValue={hotel.amenities?.join(', ')}/></label><label>Active<select name="active" defaultValue={hotel.active?'true':'false'}><option value="true">Active</option><option value="false">Inactive</option></select></label><button className="button button-dark">Save changes</button></form>}<form className="inline-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const file=f.get('file') as File;uploadHotelPhoto.mutate({hotelId:Number(hotelId),file},{onError,onSuccess:()=>void hostPropertyApi.hotelPhotos(Number(hotelId)).then(setPhotos)})}}><input type="file" name="file" accept="image/*" required/><button className="button button-soft">Upload hotel photo</button></form><div className="hotel-photo-strip">{photos.map(url=><figure key={url}><img src={url} alt="Hotel photo"/><ConfirmButton label="Delete photo" confirmText="Remove this photo from the hotel listing?" onConfirm={()=>deleteHotelPhoto.mutate({hotelId:Number(hotelId),filePath:url},{onError,onSuccess:()=>void hostPropertyApi.hotelPhotos(Number(hotelId)).then(setPhotos)})}/></figure>)}</div><DataState loading={rooms.isPending} error={rooms.error} empty={!rooms.data?.length&&!rooms.isPending?<Empty message="No rooms returned."/>:undefined}>{rooms.data?.map(room=><RoomManagementCard room={room} onDeactivate={()=>room.id&&deactivateRoom.mutate(room.id,{onError})} key={room.id}/>)}</DataState><form className="feature-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);const application={type:String(f.get('type')),description:String(f.get('description')||''),hotelId:Number(hotelId),basePrice:Number(f.get('basePrice')),totalCount:Number(f.get('totalCount')),roomCapacity:Number(f.get('roomCapacity')),amenities:String(f.get('amenities')||'').split(',').map(x=>x.trim()).filter(Boolean)};const photos=f.getAll('photos').filter((x):x is File=>x instanceof File&&x.size>0);createRoom.mutate({application,photos},{onError,onSuccess:()=>showToast('Room created.')})}}><h3>Create room</h3><div className="form-grid"><label>Type<input name="type" required maxLength={100}/></label><label>Nightly base price<input name="basePrice" type="number" min="0.01" step="0.01" required/></label><label>Room count<input name="totalCount" type="number" min="1" max="10000" required/></label><label>Capacity<input name="roomCapacity" type="number" min="1" max="100" required/></label><label>Description<input name="description" maxLength={1000}/></label><label>Amenities<input name="amenities"/></label><label>Room photos<input name="photos" type="file" accept="image/*" multiple required/></label></div><button className="button button-dark" disabled={!Number(hotelId)}>Create room</button></form></section>}
function RoomManagementCard({room,onDeactivate}:{room:Room;onDeactivate:()=>void}){const photos=useQuery({queryKey:['room-owner-photos',room.id],queryFn:()=>hostPropertyApi.roomPhotos(room.id!),enabled:!!room.id});return <div className="data-row"><div className="data-row-main"><b>{room.type}</b><small>{room.description} · {room.roomCapacity} guests · {currency(room.basePrice)}</small>{photos.data?.map(url=><img className="room-thumb" src={url} alt={`${room.type} room`} key={url}/>)}</div><button className="button button-danger" onClick={onDeactivate}>Deactivate</button></div>}
function HotelBookings({hotelId,setHotelId}:{hotelId:string;setHotelId:(x:string)=>void}){const q=useQuery({queryKey:keys.hostBookings(Number(hotelId)),queryFn:()=>hostPropertyApi.hotelBookings(Number(hotelId)),enabled:Number(hotelId)>0});return <section className="feature-section"><h2>Property bookings</h2><label>Hotel ID<input value={hotelId} onChange={e=>setHotelId(e.target.value)} type="number"/></label><DataState loading={q.isPending} error={q.error} empty={!q.data?.length&&!q.isPending?<Empty message="No bookings returned for this hotel."/>:undefined}>{q.data?.map((b:HotelBooking,i)=><div className="data-row" key={`${b.checkInDate}-${i}`}><div className="data-row-main"><b>{b.hotel?.hotelName||'Hotel booking'}</b><small>{b.checkInDate} — {b.checkOutDate} · {b.roomsCount} rooms · {currency(b.amount)}</small></div><StatusBadge status={b.bookingStatus}/></div>)}</DataState></section>}

export function AdminDashboardPage(){const q=featureHooks.useAdminSummary();return <div className="feature-page"><PageTitle eyebrow="THE CONTROL ROOM" title="A clearer view of the whole journey." description="Metrics are database-derived values from the admin summary endpoint."/><DataState loading={q.isPending} error={q.error} onRetry={()=>void q.refetch()}>{q.data&&<div className="feature-stat-grid">{Object.entries(q.data).map(([key,value])=><Metric key={key} label={key.replaceAll(/([A-Z])/g,' $1')} value={value} symbol="✳"/>) }</div>}</DataState><div className="workspace-shortcuts"><Link className="shortcut-card" to="/admin/hotels"><span className="shortcut-icon"><Compass size={18}/></span><span><b>Hotels</b><small>Filter and inspect listings</small></span><ArrowRight size={15}/></Link><Link className="shortcut-card" to="/admin/applications"><span className="shortcut-icon"><ShieldCheck size={18}/></span><span><b>Applications</b><small>Review host and hotel applications</small></span><ArrowRight size={15}/></Link></div></div>}
export function AdminHotelsPage(){const[page,setPage]=useState(0);const[filter,setFilter]=useState({city:'',active:''});const[committed,setCommitted]=useState(filter);const[selected,setSelected]=useState<number|null>(null);const q=featureHooks.useAdminHotels({page,size:20,...(committed.city?{city:committed.city}:{}),...(committed.active?{active:committed.active==='true'}:{})});const detail=useQuery({queryKey:keys.adminHotel(selected||0),queryFn:()=>adminApi.hotel(selected!),enabled:selected!=null});return <div className="feature-page"><PageTitle eyebrow="HOTEL MANAGEMENT" title="Hotels across Wandora." description="Admin hotel listing supports city and active filters plus pagination."/><form className="inline-filter" onSubmit={e=>{e.preventDefault();setCommitted(filter);setPage(0)}}><input value={filter.city} onChange={e=>setFilter({...filter,city:e.target.value})} placeholder="City"/><select aria-label="Active state" value={filter.active} onChange={e=>setFilter({...filter,active:e.target.value})}><option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option></select><button className="button button-dark">Filter</button></form><DataState loading={q.isPending} error={q.error} onRetry={()=>void q.refetch()} empty={!q.data?.content.length&&!q.isPending?<Empty message="No hotel records returned."/>:undefined}><div className="responsive-table"><table><thead><tr><th>Hotel</th><th>City</th><th>Host</th><th>Application</th><th>Active</th><th/></tr></thead><tbody>{q.data?.content.map((h:HotelSummary)=><tr key={h.id}><td>{h.hotelName}</td><td>{h.city}</td><td>{h.hostBusinessName||h.hostName||h.hostId}</td><td><StatusBadge status={h.applicationStatus}/></td><td><StatusBadge status={h.active?'ACTIVE':'INACTIVE'}/></td><td><button className="button button-soft" onClick={()=>setSelected(h.id||null)}>Details</button></td></tr>)}</tbody></table></div><Pagination page={page} totalPages={q.data?.totalPages||0} onPage={setPage}/></DataState>{detail.data&&<div className="detail-modal" role="dialog" aria-modal="true"><div className="detail-modal-card"><button className="modal-close" onClick={()=>setSelected(null)}>Close</button><h2>{detail.data.hotelName}</h2><p>{detail.data.city}</p><p>{detail.data.contactInfo?.email} · {detail.data.contactInfo?.phoneNumber}</p><p>{detail.data.hostBusinessName} · {detail.data.hostStatus}</p><StatusBadge status={detail.data.applicationStatus}/></div></div>}</div>}
function RejectionForm({ onCancel, onSubmit, pending }: { onCancel: () => void; onSubmit: (reason: string) => void; pending: boolean }) {
  return <form className="feature-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const reason = String(form.get('reason') || '').trim(); if (reason) onSubmit(reason) }}>
    <h3>Reject application</h3>
    <label htmlFor="rejection-reason">Reason<textarea id="rejection-reason" name="reason" minLength={1} maxLength={1000} required /></label>
    <div className="inline-form"><button className="button button-danger" type="submit" disabled={pending}>{pending ? 'Submitting…' : 'Confirm rejection'}</button><button className="button button-soft" type="button" onClick={onCancel} disabled={pending}>Cancel</button></div>
  </form>
}

export function AdminApplicationsPage(){const[kind,setKind]=useState<'hotel'|'host'>('hotel');const[status,setStatus]=useState('');const[page,setPage]=useState(0);const[detailId,setDetailId]=useState<number|null>(null);const hotel=featureHooks.useAdminHotelApplications({page,size:20,...(status?{status}:{})});const host=featureHooks.useAdminHostApplications({page,size:20,...(status?{status}:{})});const q=kind==='hotel'?hotel:host;const detail=useQuery({queryKey:[...keys.admin,kind,'detail',detailId],queryFn:()=>kind==='hotel'?adminApi.hotelApplication(detailId!):adminApi.hostApplication(detailId!),enabled:detailId!=null});const docs=useQuery({queryKey:[...keys.admin,kind,'documents',detailId],queryFn:()=>kind==='hotel'?adminApi.hotelDocuments(detailId!):adminApi.hostDocuments(detailId!),enabled:detailId!=null});const{approveHotelApplication,rejectHotelApplication,approveHostApplication,rejectHostApplication}=useFeatureMutations();const notifyError=useNotifyError();const{showToast}=useToast();return <div className="feature-page"><PageTitle eyebrow="APPLICATION REVIEW" title="Thoughtful places start with thoughtful hosts." description="Filter, inspect documents and make real approval decisions."/><div className="section-tabs"><button type="button" aria-pressed={kind==='hotel'} className={kind==='hotel'?'selected':''} onClick={()=>{setKind('hotel');setPage(0);setStatus('');setDetailId(null)}}>Hotels</button><button type="button" aria-pressed={kind==='host'} className={kind==='host'?'selected':''} onClick={()=>{setKind('host');setPage(0);setStatus('');setDetailId(null)}}>Hosts</button><select aria-label="Application status" value={status} onChange={e=>{setStatus(e.target.value);setPage(0)}}><option value="">All statuses</option>{(kind==='hotel'?['PENDING','UNDER_REVIEW','APPROVED','REJECTED']:['CREATED','UNDER_REVIEW','APPROVED','REJECTED']).map(s=><option key={s}>{s}</option>)}</select></div><DataState loading={q.isPending} error={q.error} onRetry={()=>void q.refetch()} empty={!q.data?.content.length&&!q.isPending?<Empty message="No applications match the current filter."/>:undefined}><div className="application-grid">{q.data?.content.map((a:ApplicationDetails)=><article className="application-card" key={a.id}><div className="application-head"><div><b>{a.hotelName||a.businessName||a.hostName||`Application #${a.id}`}</b><small>{a.city||a.hostEmail||a.applicantEmail}</small></div><StatusBadge status={a.status}/></div><p>{a.description||a.rejectionReason||'No additional details provided.'}</p><div className="application-actions"><button className="button button-soft" onClick={()=>setDetailId(a.id||null)}>Details & documents</button>{a.id&&a.status!=='APPROVED'&&a.status!=='REJECTED'&&<><button className="button button-green" disabled={approveHotelApplication.isPending||approveHostApplication.isPending} onClick={()=>kind==='hotel'?approveHotelApplication.mutate(a.id!,{onError:notifyError,onSuccess:()=>showToast('Application approved.')}):approveHostApplication.mutate(a.id!,{onError:notifyError,onSuccess:()=>showToast('Application approved.')})}>{approveHotelApplication.isPending||approveHostApplication.isPending?'Approving…':'Approve'}</button><button className="button button-danger" type="button" onClick={()=>setDetailId(a.id!)}>Reject</button></>}</div></article>)}</div><Pagination page={page} totalPages={q.data?.totalPages||0} onPage={setPage}/></DataState>{detailId!=null&&<div className="detail-modal" role="dialog" aria-modal="true"><div className="detail-modal-card"><button className="modal-close" onClick={()=>setDetailId(null)}>Close</button><DataState loading={detail.isPending} error={detail.error}>{detail.data&&<><h2>{detail.data.hotelName||detail.data.businessName||detail.data.hostName||`Application #${detailId}`}</h2><p>{detail.data.applicantName} · {detail.data.applicantEmail} · {detail.data.city}</p><p>{detail.data.description||detail.data.rejectionReason}</p><StatusBadge status={detail.data.status}/></>}</DataState><h3>Verification documents</h3><DataState loading={docs.isPending} error={docs.error} empty={!docs.data?.length&&!docs.isPending?<Empty message="No document links returned."/>:undefined}>{docs.data?.map((doc,index)=><a className="document-link" key={`${doc.documentType}-${index}`} href={doc.downloadUrl} target="_blank" rel="noreferrer">{doc.documentType||doc.originalFilename||`Document ${index+1}`} ↗</a>)}</DataState>{detail.data?.id&&detail.data.status!=='APPROVED'&&detail.data.status!=='REJECTED'&&<RejectionForm onCancel={()=>setDetailId(null)} onSubmit={reason=>kind==='hotel'?rejectHotelApplication.mutate({id:detail.data!.id!,reason},{onError:notifyError,onSuccess:()=>{setDetailId(null);showToast('Application rejected.')}}):rejectHostApplication.mutate({id:detail.data!.id!,reason},{onError:notifyError,onSuccess:()=>{setDetailId(null);showToast('Application rejected.')}})} pending={rejectHotelApplication.isPending||rejectHostApplication.isPending}/> }</div></div>}</div>}
