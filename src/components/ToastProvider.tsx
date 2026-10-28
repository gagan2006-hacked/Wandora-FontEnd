import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CircleCheck, CircleX, X } from 'lucide-react'
import { ToastContext } from './ToastContext'

interface ToastItem { id: number; message: string; tone: 'success' | 'error' }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const showToast = useCallback((message: string, tone: ToastItem['tone'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500)
  }, [])
  const value = useMemo(() => ({ showToast }), [showToast])

  return <ToastContext.Provider value={value}>
    {children}
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => <div className={`toast toast-${toast.tone}`} key={toast.id} role={toast.tone === 'error' ? 'alert' : 'status'}>
        {toast.tone === 'error' ? <CircleX size={18} /> : <CircleCheck size={18} />}
        <span>{toast.message}</span>
        <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}><X size={16} /></button>
      </div>)}
    </div>
  </ToastContext.Provider>
}

