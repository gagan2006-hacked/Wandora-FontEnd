import { useState, type FormEvent } from 'react'
import { CalendarDays, Compass, MapPin, MessageCircle, Plus, Users } from 'lucide-react'
import { useFeatureMutations, featureHooks } from '../api/hooks'
import { getErrorMessage } from '../api/http'
import { useToast } from '../components/useToast'
import { ConfirmButton, DataState, PageTitle, Pagination, StatusBadge } from '../components/FeatureUi'
import type { CreatePlanRequest, PlanStatus } from '../types/api'

const formatCurrency = (value: number, currency = 'INR') => new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)

export function TravelPlansPage() {
  const [page, setPage] = useState(0)
  const [messagePage, setMessagePage] = useState(0)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const plansQuery = featureHooks.useTravelPlans(page)
  const invitationsQuery = featureHooks.usePlanInvitations(page)
  const plans = plansQuery.data?.content ?? []
  const planId = selectedId ?? plans[0]?.id ?? 0
  const planQuery = featureHooks.usePlan(planId)
  const plan = planQuery.data ?? plans.find((item) => item.id === planId)
  const members = featureHooks.usePlanMembers(planId)
  const itinerary = featureHooks.usePlanItinerary(planId)
  const stays = featureHooks.usePlanStays(planId)
  const messages = featureHooks.usePlanMessages(planId, messagePage)
  const bookings = featureHooks.usePlanBookings(planId)
  const mutations = useFeatureMutations()
  const { showToast } = useToast()
  const notifyError = (error: unknown) => showToast(getErrorMessage(error), 'error')

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const startDate = String(values.get('startDate'))
    const endDate = String(values.get('endDate'))
    if (endDate < startDate) {
      notifyError(new Error('End date must be on or after the start date.'))
      return
    }
    const payload: CreatePlanRequest = {
      title: String(values.get('title')),
      destination: String(values.get('destination')),
      startDate,
      endDate,
      description: String(values.get('description') || ''),
      ...(values.get('budget') ? { budget: Number(values.get('budget')) } : {}),
      ...(values.get('currency') ? { currency: String(values.get('currency')) } : {}),
    }
    mutations.createPlan.mutate(payload, {
      onError: notifyError,
      onSuccess: (created) => {
        setSelectedId(created.id)
        setPage(0)
        setCreating(false)
        form.reset()
        void plansQuery.refetch()
        showToast('Travel plan created.')
      },
    })
  }

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!plan) return
    const values = new FormData(event.currentTarget)
    const startDate = String(values.get('startDate'))
    const endDate = String(values.get('endDate'))
    if (endDate < startDate) {
      notifyError(new Error('End date must be on or after the start date.'))
      return
    }
    mutations.updatePlan.mutate({
      id: plan.id,
      payload: {
        title: String(values.get('title')),
        destination: String(values.get('destination')),
        description: String(values.get('description') || ''),
        startDate,
        endDate,
        ...(values.get('budget') ? { budget: Number(values.get('budget')) } : {}),
        ...(values.get('currency') ? { currency: String(values.get('currency')) } : {}),
      },
    }, { onError: notifyError, onSuccess: () => { setEditing(false); showToast('Travel plan updated.') } })
  }

  const submit = (event: FormEvent<HTMLFormElement>, action: (form: HTMLFormElement, values: FormData) => void) => {
    event.preventDefault()
    const form = event.currentTarget
    action(form, new FormData(form))
  }

  return <div className="feature-page">
    <PageTitle eyebrow="COLLABORATIVE TRAVEL PLANS" title="Build the trip together." description="Plans and messages use the documented REST API; updates are not real-time." action={<button className="button button-dark" type="button" onClick={() => setCreating((value) => !value)}><Plus size={16} /> {creating ? 'Close form' : 'New plan'}</button>} />
    {creating && <form className="feature-form plan-create-form" onSubmit={handleCreate}>
      <h2>Create a plan</h2>
      <div className="form-grid">
        <label>Title<input name="title" maxLength={160} required /></label>
        <label>Destination<input name="destination" maxLength={160} required /></label>
        <label>Start date<input name="startDate" type="date" required /></label>
        <label>End date<input name="endDate" type="date" required /></label>
        <label>Budget<input name="budget" type="number" min="0" /></label>
        <label>Currency<input name="currency" pattern="[A-Z]{3}" maxLength={3} placeholder="INR" /></label>
      </div>
      <label>Description<textarea name="description" maxLength={2000} /></label>
      <button className="button button-green" disabled={mutations.createPlan.isPending}>{mutations.createPlan.isPending ? 'Creating…' : 'Create plan'}</button>
    </form>}

    <DataState loading={plansQuery.isPending} error={plansQuery.error} onRetry={() => void plansQuery.refetch()} empty={!plans.length && !plansQuery.isPending ? <p>No trip plans yet. Create one to start planning.</p> : undefined}>
      <div className="plan-workspace">
        <aside className="plan-list">
          <h2>Your plans</h2>
          {plans.map((item) => <button className={`plan-list-item${item.id === planId ? ' active' : ''}`} key={item.id} type="button" onClick={() => { setSelectedId(item.id); setEditing(false); setMessagePage(0) }} aria-current={item.id === planId ? 'true' : undefined}>
            <b>{item.title}</b><small><MapPin size={13} /> {item.destination}</small><StatusBadge status={item.status} />
          </button>)}
          <Pagination page={page} totalPages={plansQuery.data?.totalPages ?? 0} onPage={setPage} />
          <h3>Invitations</h3>
          <DataState loading={invitationsQuery.isPending} error={invitationsQuery.error} onRetry={() => void invitationsQuery.refetch()} empty={!invitationsQuery.data?.content.length && !invitationsQuery.isPending ? <p>No invitations to respond to.</p> : undefined}>
            {invitationsQuery.data?.content.map((invitation) => <article className="invitation-row" key={invitation.id ?? invitation.travelPlanId}>
              <b>{invitation.title || invitation.destination || 'Travel plan invitation'}</b>
              <small>{invitation.invitedByName ? `Invited by ${invitation.invitedByName}` : invitation.startDate && invitation.endDate ? `${invitation.startDate} — ${invitation.endDate}` : ''}</small>
              <div className="row-actions">
                <button className="button button-soft" type="button" disabled={mutations.respondToInvitation.isPending || !invitation.travelPlanId} onClick={() => invitation.travelPlanId && mutations.respondToInvitation.mutate({ id: invitation.travelPlanId, status: 'ACCEPTED' }, { onError: notifyError, onSuccess: () => { void invitationsQuery.refetch(); showToast('Invitation accepted.') } })}>Accept</button>
                <button className="button button-danger" type="button" disabled={mutations.respondToInvitation.isPending || !invitation.travelPlanId} onClick={() => invitation.travelPlanId && mutations.respondToInvitation.mutate({ id: invitation.travelPlanId, status: 'DECLINED' }, { onError: notifyError, onSuccess: () => { void invitationsQuery.refetch(); showToast('Invitation declined.') } })}>Decline</button>
              </div>
            </article>)}
          </DataState>
        </aside>

        <section className="plan-detail">
          {!plan && !plansQuery.isPending && <p>Choose a plan or create one to see its itinerary, stays and messages.</p>}
          {plan && <>
            <header className="plan-detail-head">
              <div><span className="eyebrow">{plan.startDate} — {plan.endDate}</span><h2>{plan.title}</h2><p><MapPin size={14} /> {plan.destination}{plan.budget != null ? ` · ${formatCurrency(plan.budget, plan.currency || 'INR')} planned budget` : ''}</p><StatusBadge status={plan.status} /></div>
              <div className="plan-toolbar">
                <label>Plan status<select aria-label="Travel plan status" value={plan.status || 'PLANNING'} onChange={(event) => mutations.updatePlanStatus.mutate({ id: plan.id, status: event.target.value as PlanStatus }, { onError: notifyError, onSuccess: () => showToast('Plan status updated.') })} disabled={mutations.updatePlanStatus.isPending}><option>PLANNING</option><option>READY_TO_BOOK</option><option>BOOKED</option><option>COMPLETED</option><option>CANCELLED</option></select></label>
                <button className="button button-soft" type="button" onClick={() => setEditing((value) => !value)}>{editing ? 'Close edit' : 'Edit plan'}</button>
                <ConfirmButton label="Cancel plan" confirmText="Cancel this travel plan?" onConfirm={() => mutations.cancelPlan.mutate(plan.id, { onError: notifyError, onSuccess: () => { setSelectedId(null); void plansQuery.refetch(); showToast('Travel plan cancelled.') } })} disabled={mutations.cancelPlan.isPending} />
              </div>
            </header>

            {editing && <form className="plan-edit-form" onSubmit={handleUpdate}>
              <label>Title<input name="title" defaultValue={plan.title} maxLength={160} required /></label><label>Destination<input name="destination" defaultValue={plan.destination} maxLength={160} required /></label>
              <label>Start date<input name="startDate" type="date" defaultValue={plan.startDate} required /></label><label>End date<input name="endDate" type="date" defaultValue={plan.endDate} required /></label>
              <label>Budget<input name="budget" type="number" min="0" defaultValue={plan.budget} /></label><label>Currency<input name="currency" pattern="[A-Z]{3}" maxLength={3} defaultValue={plan.currency} /></label>
              <label>Description<textarea name="description" maxLength={2000} defaultValue={plan.description} /></label><button className="button button-dark" disabled={mutations.updatePlan.isPending}>{mutations.updatePlan.isPending ? 'Saving…' : 'Save changes'}</button>
            </form>}

            <div className="plan-section-grid">
              <section className="plan-panel"><h3><Users size={17} /> Members</h3>
                <form className="inline-form" onSubmit={(event) => submit(event, (_form, values) => { mutations.invitePlanMember.mutate({ id: plan.id, userId: Number(values.get('userId')) }, { onError: notifyError }) })}>
                  <label className="sr-only" htmlFor="plan-invite-user">Friend user ID</label><input id="plan-invite-user" name="userId" type="number" min="1" placeholder="Friend user ID" required />
                  <button className="button button-soft" disabled={mutations.invitePlanMember.isPending}>{mutations.invitePlanMember.isPending ? 'Sending…' : 'Invite friend'}</button>
                </form>
                <DataState loading={members.isPending} error={members.error} onRetry={() => void members.refetch()} empty={!members.data?.length && !members.isPending ? <p>No member list returned.</p> : undefined}>
                  {members.data?.map((member) => <div className="plan-member" key={member.id ?? member.userId}><span>{member.name || member.username || `User #${member.userId}`}</span><StatusBadge status={member.status} />{member.userId && member.role !== 'OWNER' && <ConfirmButton label="Remove" confirmText={`Remove ${member.name || member.username || 'this member'} from the plan?`} onConfirm={() => mutations.removePlanMember.mutate({ id: plan.id, userId: member.userId! }, { onError: notifyError })} disabled={mutations.removePlanMember.isPending} />}</div>)}
                </DataState>
              </section>

              <section className="plan-panel"><h3><CalendarDays size={17} /> Itinerary</h3>
                <form className="stacked-inline" onSubmit={(event) => submit(event, (form, values) => {
                  const title = String(values.get('title'))
                  const activityDate = String(values.get('activityDate'))
                  if (activityDate < plan.startDate || activityDate > plan.endDate) return notifyError(new Error('Activity date must be within the plan dates.'))
                  mutations.addPlanItem.mutate({ id: plan.id, payload: { title, activityDate, locationName: String(values.get('locationName') || '') } }, { onError: notifyError, onSuccess: () => { form.reset(); showToast('Activity added to the itinerary.') } })
                })}>
                  <label className="sr-only" htmlFor="activity-title">Activity</label><input id="activity-title" name="title" maxLength={160} placeholder="Activity" required />
                  <label className="sr-only" htmlFor="activity-date">Activity date</label><input id="activity-date" name="activityDate" type="date" required />
                  <label className="sr-only" htmlFor="activity-location">Location</label><input id="activity-location" name="locationName" maxLength={200} placeholder="Location" />
                  <button className="button button-soft" disabled={mutations.addPlanItem.isPending}>{mutations.addPlanItem.isPending ? 'Adding…' : 'Add activity'}</button>
                </form>
                <DataState loading={itinerary.isPending} error={itinerary.error} onRetry={() => void itinerary.refetch()} empty={!itinerary.data?.length && !itinerary.isPending ? <p>Add your first itinerary activity.</p> : undefined}>
                  {itinerary.data?.map((item, index) => {
                    const currentItems = itinerary.data ?? []
                    const canReorder = currentItems.every((entry) => entry.id != null)
                    const move = (target: number) => {
                      const next = [...currentItems]
                      ;[next[index], next[target]] = [next[target]!, next[index]!]
                      const ids = next.map((entry) => entry.id)
                      if (ids.every((value): value is number => value != null)) mutations.reorderPlanItems.mutate({ id: plan.id, itemIds: ids }, { onError: notifyError })
                    }
                    return <article className="timeline-row" key={item.id ?? `${item.activityDate}-${index}`}><span className="timeline-date">{item.activityDate}</span><span><b>{item.title}</b><small>{item.locationName || item.description || ''}</small></span><div className="row-actions"><button type="button" className="button button-compact" aria-label={`Move ${item.title || 'activity'} up`} disabled={index === 0 || !canReorder || mutations.reorderPlanItems.isPending} onClick={() => move(index - 1)}>↑</button><button type="button" className="button button-compact" aria-label={`Move ${item.title || 'activity'} down`} disabled={index === currentItems.length - 1 || !canReorder || mutations.reorderPlanItems.isPending} onClick={() => move(index + 1)}>↓</button>{item.id && <button type="button" className="button button-compact" onClick={() => { const title = window.prompt('Activity title', item.title || ''); if (title?.trim()) mutations.updatePlanItem.mutate({ id: plan.id, itemId: item.id!, payload: { title: title.trim() } }, { onError: notifyError }) }}>Edit</button>}{item.id && <ConfirmButton label="Remove" confirmText={`Remove ${item.title || 'this activity'}?`} onConfirm={() => mutations.deletePlanItem.mutate({ id: plan.id, itemId: item.id! }, { onError: notifyError })} disabled={mutations.deletePlanItem.isPending} />}</div></article>
                  })}
                </DataState>
              </section>

              <section className="plan-panel"><h3><Compass size={17} /> Stay options</h3>
                <form className="inline-form" onSubmit={(event) => submit(event, (form, values) => { const estimated = values.get('estimatedPrice'); mutations.addPlanStay.mutate({ id: plan.id, payload: { hotelId: Number(values.get('hotelId')), notes: String(values.get('notes') || ''), ...(estimated ? { estimatedPrice: Number(estimated) } : {}) } }, { onError: notifyError, onSuccess: () => form.reset() }) })}>
                  <label className="sr-only" htmlFor="stay-hotel-id">Hotel ID</label><input id="stay-hotel-id" name="hotelId" type="number" min="1" placeholder="Hotel ID" required />
                  <label className="sr-only" htmlFor="stay-notes">Planning notes</label><input id="stay-notes" name="notes" maxLength={2000} placeholder="Planning notes" />
                  <label className="sr-only" htmlFor="stay-estimate">Estimated amount</label><input id="stay-estimate" name="estimatedPrice" type="number" min="0" placeholder="Estimate" />
                  <button className="button button-soft" disabled={mutations.addPlanStay.isPending}>{mutations.addPlanStay.isPending ? 'Adding…' : 'Add option'}</button>
                </form>
                <DataState loading={stays.isPending} error={stays.error} onRetry={() => void stays.refetch()} empty={!stays.data?.length && !stays.isPending ? <p>Compare a stay by adding a hotel option.</p> : undefined}>
                  {stays.data?.map((stay) => <article className="data-row compact" key={stay.id ?? stay.hotelId}><span>{stay.hotelName || `Hotel #${stay.hotelId}`} · {stay.city || stay.notes || ''}</span>{stay.estimatedPrice != null && <span>{formatCurrency(stay.estimatedPrice)}</span>}<StatusBadge status={stay.selected ? 'SELECTED' : 'OPTION'} />{stay.id && <><button type="button" className="button button-compact" onClick={() => mutations.updatePlanStay.mutate({ id: plan.id, optionId: stay.id!, payload: { selected: !stay.selected } }, { onError: notifyError })}>{stay.selected ? 'Unselect' : 'Select'}</button><ConfirmButton label="Remove" confirmText="Remove this stay option?" onConfirm={() => mutations.deletePlanStay.mutate({ id: plan.id, optionId: stay.id! }, { onError: notifyError })} disabled={mutations.deletePlanStay.isPending} /></>}</article>)}
                </DataState>
              </section>

              <section className="plan-panel"><h3><MessageCircle size={17} /> Messages <span className="muted-note">REST only</span></h3>
                <DataState loading={messages.isPending} error={messages.error} onRetry={() => void messages.refetch()} empty={!messages.data?.content.length && !messages.isPending ? <p>No messages in this plan yet.</p> : undefined}>
                  <div className="message-list">{messages.data?.content.map((message) => <article key={message.id}><b>{message.senderName || 'Plan member'}</b><p>{message.content}</p><small>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ''}</small></article>)}</div>
                  <Pagination page={messages.data?.number ?? messagePage} totalPages={messages.data?.totalPages ?? 0} onPage={setMessagePage} />
                </DataState>
                <form className="inline-form" onSubmit={(event) => submit(event, (form, values) => { mutations.sendPlanMessage.mutate({ id: plan.id, content: String(values.get('content')) }, { onError: notifyError, onSuccess: () => { form.reset(); showToast('Message sent.') } }) })}>
                  <label className="sr-only" htmlFor="plan-message">Write a message</label><input id="plan-message" name="content" maxLength={4000} placeholder="Write a message" required />
                  <button className="button button-dark" disabled={mutations.sendPlanMessage.isPending}>{mutations.sendPlanMessage.isPending ? 'Sending…' : 'Send'}</button>
                </form>
              </section>

              <section className="plan-panel"><h3>Linked bookings</h3>
                <form className="inline-form" onSubmit={(event) => submit(event, (form, values) => { mutations.linkPlanBooking.mutate({ id: plan.id, bookingId: Number(values.get('bookingId')) }, { onError: notifyError, onSuccess: () => form.reset() }) })}>
                  <label className="sr-only" htmlFor="booking-link-id">Existing booking ID</label><input id="booking-link-id" type="number" min="1" name="bookingId" placeholder="Existing booking ID" required />
                  <button className="button button-soft" disabled={mutations.linkPlanBooking.isPending}>{mutations.linkPlanBooking.isPending ? 'Linking…' : 'Link booking'}</button>
                </form>
                <DataState loading={bookings.isPending} error={bookings.error} onRetry={() => void bookings.refetch()} empty={!bookings.data?.length && !bookings.isPending ? <p>No bookings linked. Linking does not book or pay.</p> : undefined}>
                  {bookings.data?.map((booking) => <div className="data-row compact" key={booking.id ?? booking.bookingId}><span>{booking.hotelName || `Booking #${booking.bookingId}`} · {booking.checkInDate} — {booking.checkOutDate}</span><StatusBadge status={booking.bookingStatus} />{booking.id && <ConfirmButton label="Unlink" confirmText="Unlink this booking? This will not cancel the booking." onConfirm={() => mutations.unlinkPlanBooking.mutate({ id: plan.id, linkId: booking.id! }, { onError: notifyError })} />}</div>)}
                </DataState>
              </section>
            </div>
          </>}
        </section>
      </div>
    </DataState>
  </div>
}
