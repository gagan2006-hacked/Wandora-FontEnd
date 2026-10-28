import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, LoaderCircle, ShieldAlert } from 'lucide-react'
import { getErrorMessage, normalizeApiError } from '../api/http'
import { LoadingSkeleton } from './LoadingSkeleton'

export function DataState({ loading, error, children, empty, onRetry }: { loading?: boolean; error?: unknown; children?: ReactNode; empty?: ReactNode; onRetry?: () => void }) {
  if (loading) return <div className="feature-loading"><LoadingSkeleton /></div>
  if (error) {
    const status = normalizeApiError(error).status
    const Icon = status === 401 || status === 403 ? ShieldAlert : AlertCircle
    return <div className="feature-state feature-error" role="alert"><Icon size={20} /><div><b>{status === 401 ? 'Your session needs attention' : status === 403 ? 'You don’t have access to this information' : 'We couldn’t load this right now'}</b><p>{getErrorMessage(error)}</p>{onRetry && <button className="button button-soft" onClick={onRetry} type="button">Try again</button>}</div></div>
  }
  if (empty) return <div className="feature-state feature-empty"><span className="empty-symbol">✳</span>{empty}</div>
  return <>{children}</>
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <span className="status-badge status-unknown">Not provided</span>
  const tone = /APPROVED|ACTIVE|CONFIRMED|ACCEPTED|COMPLETED|VERIFIED/.test(status) ? 'good' : /REJECTED|CANCELLED|FAILED|EXPIRED|DECLINED|SUSPENDED/.test(status) ? 'bad' : /PENDING|RESERVED|CREATED|UNDER_REVIEW|INVITED|PLANNING/.test(status) ? 'waiting' : 'neutral'
  return <span className={`status-badge status-${tone}`}>{status.replaceAll('_', ' ').toLowerCase()}</span>
}

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  if (totalPages < 2) return null
  return <nav className="pagination" aria-label="Pagination"><button type="button" className="button button-soft" disabled={page <= 0} onClick={() => onPage(page - 1)}><ArrowLeft size={14} /> Previous</button><span>Page {page + 1} of {totalPages}</span><button type="button" className="button button-soft" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)}>Next <ArrowRight size={14} /></button></nav>
}

export function ConfirmButton({ label, confirmText, onConfirm, disabled, confirmLabel = 'Confirm' }: { label: string; confirmText: string; onConfirm: () => void; disabled?: boolean; confirmLabel?: string }) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return <>
    <button type="button" className="button button-danger" disabled={disabled} onClick={() => setOpen(true)}>{disabled ? <LoaderCircle className="spin" size={15} /> : null}{label}</button>
    {open && <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div className="detail-modal-card confirm-dialog-card">
        <h2 id={titleId}>{label}</h2>
        <p>{confirmText}</p>
        <div className="inline-form confirm-actions">
          <button ref={cancelRef} type="button" className="button button-soft" onClick={() => setOpen(false)}>Cancel</button>
          <button type="button" className="button button-danger" onClick={() => { setOpen(false); onConfirm() }}>{confirmLabel}</button>
        </div>
      </div>
    </div>}
  </>
}

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="feature-title"><div><span className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="feature-title-action">{action}</div>}</div>
}
