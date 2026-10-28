import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children?: ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined
  return <div className="field">
    <label className="field-label" htmlFor={id}>{label}</label>
    {children ?? <input id={id} aria-describedby={describedBy} aria-invalid={Boolean(error)} />}
    {hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
    {error && <span className="field-error" id={`${id}-error`} role="alert">{error}</span>}
  </div>
}

export type TextInputProps = InputHTMLAttributes<HTMLInputElement>
