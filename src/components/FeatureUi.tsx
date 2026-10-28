import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ArrowRight, Compass, LoaderCircle, LogIn, SearchX, ShieldAlert } from 'lucide-react'
import { normalizeApiError } from '../api/http'
import { LoadingSkeleton } from './LoadingSkeleton'

/**
 * Shared loading / error / empty presentation for every API-backed screen.
 * A 401 offers a way back into the session instead of a dead end; a 403 points
 * back to the user's own workspace.
 */
export function DataState({ loading, error, children, empty, onRetry }: { loading?: boolean; error?: unknown; children?: ReactNode; empty?: ReactNode; onRetry?: () => void }) {
  const location = useLocation()
  if (loading) return <div className="feature-loading"><LoadingSkeleton /></div>
  if (error) {
    const apiError = normalizeApiError(error)
    const status = apiError.status
    const Icon = status === 401 || status === 403 ? ShieldAlert : AlertCircle
    const title = status === 401
      ? 'Your session needs attention'
      : status === 403
        ? 'You don’t have access to this information'
        : 'We couldn’t load this right now'
    return <div className="feature-state feature-error" role="alert">
      <span className="state-icon"><Icon size={19} aria-hidden="true" /></span>
      <div className="state-body">
        <b>{title}</b>
        <p>{apiError.message}</p>
        <div className="state-actions">
          {onRetry && <button className="button button-soft" onClick={onRetry} type="button">Try again</button>}
          {status === 401 && <Link className="button button-dark" to="/login" state={{ from: location, reason: 'auth' }}>
            <LogIn size={15} aria-hidden="true" /> Sign in again
          </Link>}
          {status === 403 && <Link className="button button-soft" to="/app">Back to your space</Link>}
        </div>
      </div>
    </div>
  }
  if (empty) return <div className="feature-state feature-empty"><span className="empty-symbol" aria-hidden="true">✳</span>{empty}</div>
  return <>{children}</>
}

/** Consistent empty state used by pages and cards. */
export function EmptyState({ title, description, action, icon }: { title?: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="empty-state">
    <span className="empty-state-icon" aria-hidden="true">{icon ?? <SearchX size={20} />}</span>
    <div>
      {title && <b>{title}</b>}
      <p>{description}</p>
      {action && <div className="state-actions">{action}</div>}
    </div>
  </div>
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="status-badge status-unknown">Not provided</span>
  const tone = /APPROVED|ACTIVE|CONFIRMED|ACCEPTED|COMPLETED|VERIFIED/.test(status) ? 'good' : /REJECTED|CANCELLED|FAILED|EXPIRED|DECLINED|SUSPENDED/.test(status) ? 'bad' : /PENDING|RESERVED|CREATED|UNDER_REVIEW|INVITED|PLANNING/.test(status) ? 'waiting' : 'neutral'
  return <span className={`status-badge status-${tone}`}>{status.replaceAll('_', ' ').toLowerCase()}</span>
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages < 2) return null
  return <nav className="pagination" aria-label="Pagination">
    <button type="button" className="button button-soft" disabled={page <= 0} onClick={() => onPage(page - 1)}>
      <ArrowLeft size={14} aria-hidden="true" /> Previous
    </button>
    <span aria-live="polite">Page {page + 1} of {totalPages}</span>
    <button type="button" className="button button-soft" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>
      Next <ArrowRight size={14} aria-hidden="true" />
    </button>
  </nav>
}

/** Accessible confirmation dialog: focus is parked on Cancel, Escape closes it,
 *  the background scroll is locked and focus returns to the trigger afterwards. */
export function ConfirmButton({ label, confirmText, onConfirm, disabled, confirmLabel = 'Confirm' }: { label: string; confirmText: string; onConfirm: () => void; disabled?: boolean; confirmLabel?: string }) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const descriptionId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const trigger = triggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      trigger?.focus()
    }
  }, [open])

  return <>
    <button ref={triggerRef} type="button" className="button button-danger" disabled={disabled} onClick={() => setOpen(true)}>
      {disabled ? <LoaderCircle className="spin" size={15} aria-hidden="true" /> : null}{label}
    </button>
    {open && <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div className="detail-modal-card confirm-dialog-card">
        <h2 id={titleId}>{label}</h2>
        <p id={descriptionId}>{confirmText}</p>
        <div className="inline-form confirm-actions">
          <button ref={cancelRef} type="button" className="button button-soft" onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="button button-danger" onClick={() => { setOpen(false); onConfirm() }}>{confirmLabel}</button>
        </div>
      </div>
    </div>}
  </>
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="feature-title">
    <div>
      <span className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="feature-title-action">{action}</div>}
  </header>
}

/** Small breadcrumb used on detail screens inside the authenticated shell. */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="back-link" to={to}><ArrowLeft size={14} aria-hidden="true" /> {children}</Link>
}

/** Public discovery breadcrumb. */
export function ExploreLink() {
  return <Link className="back-link" to="/stays"><Compass size={14} aria-hidden="true" /> Back to stay search</Link>
}
