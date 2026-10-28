import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, Compass, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { authApi } from '../auth/authApi'
import { getErrorMessage } from '../api/http'
import { resolveDestination } from '../auth/redirect'
import { loginSchema, otpSchema, registerSchema, type LoginFormValues, type OtpFormValues, type RegisterFormValues } from '../lib/validation'
import { useToast } from '../components/useToast'

interface AuthLocationState {
  from?: { pathname: string; search?: string; hash?: string }
  reason?: 'auth' | 'session'
  email?: string
}

function AuthFrame({ title, detail, notice, children, alternate }: {
  title: string
  detail: string
  notice?: ReactNode
  children: ReactNode
  alternate: ReactNode
}) {
  return <section className="auth-page">
    <div className="auth-art">
      <div className="auth-art-image" role="img" aria-label="Sunlit village street on the Amalfi coast" />
      <div className="auth-art-shade" />
      <Link to="/" className="brand auth-brand"><span className="brand-mark"><Compass size={19} /></span><span className="brand-word">wandora<span className="brand-period">.</span></span></Link>
      <div className="auth-art-copy">
        <span className="eyebrow"><span className="eyebrow-dot" /> KEEP THE WONDER CLOSE</span>
        <h2>Good journeys<br />begin with <em>hello.</em></h2>
        <p>The world feels a little smaller when you have somewhere to belong.</p>
      </div>
      <div className="auth-art-bottom">A good place to begin <span aria-hidden="true">✳</span></div>
    </div>
    <div className="auth-panel">
      <Link className="auth-back" to="/"><ArrowLeft size={16} /> Back to Wandora</Link>
      <div className="auth-form-wrap">
        <div className="auth-mark" aria-hidden="true"><Compass size={21} /></div>
        <span className="auth-kicker">YOUR NEXT CHAPTER</span>
        <h1>{title}</h1>
        <p className="auth-subtitle">{detail}</p>
        {notice}
        {children}
        <div className="auth-alternate">{alternate}</div>
        <p className="auth-legal">By continuing, you agree to Wandora’s Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  </section>
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })
  const state = (location.state as AuthLocationState | null) ?? null
  const from = state?.from

  async function submit(values: LoginFormValues) {
    setServerError('')
    try {
      const result = await login(values)
      showToast('Welcome back. You’re signed in.')
      // Return the visitor to the protected page they originally asked for,
      // otherwise land on the home for their persisted roles.
      navigate(resolveDestination(from, result.roles), { replace: true })
    } catch (error) { setServerError(getErrorMessage(error)) }
  }

  const notice = state?.reason === 'auth'
    ? <div className="form-notice" role="status"><ShieldCheck size={17} aria-hidden="true" /><span>{from?.pathname ? <>Sign in to continue to <b>{from.pathname}</b>.</> : 'Sign in to continue where you left off.'}</span></div>
    : undefined

  return <AuthFrame
    title="Welcome back."
    detail="Sign in and pick up where your next adventure begins."
    notice={notice}
    alternate={<>New around here? <Link to="/register" state={from ? { from } : undefined}>Create an account <ArrowRight size={14} /></Link></>}
  >
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert" role="alert"><ShieldCheck size={17} aria-hidden="true" /><span>{serverError}</span></div>}
      <div className="form-field">
        <label htmlFor="identifier">Email or username</label>
        <div className="input-wrap">
          <Mail size={17} aria-hidden="true" />
          <input
            id="identifier"
            autoComplete="username"
            autoFocus
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            {...register('identifier')}
          />
        </div>
        {errors.identifier && <span id="identifier-error" className="field-error" role="alert">{errors.identifier.message}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <div className="input-wrap">
          <LockKeyhole size={17} aria-hidden="true" />
          <input
            id="password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Your password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <button className="password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
            {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
        {errors.password && <span id="password-error" className="field-error" role="alert">{errors.password.message}</span>}
      </div>
      <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <><span className="button-spinner" aria-hidden="true" /> Signing you in…</> : <>Sign in <ArrowRight size={17} aria-hidden="true" /></>}
      </button>
    </form>
  </AuthFrame>
}

export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })
  const from = ((location.state as AuthLocationState | null) ?? null)?.from

  async function submit(values: RegisterFormValues) {
    setServerError('')
    try {
      await createAccount(values)
      showToast('Your account is ready. Request your verification code to continue.')
      navigate('/verify-email', { replace: true, state: { email: values.email } })
    } catch (error) { setServerError(getErrorMessage(error)) }
  }

  return <AuthFrame
    title="Make room for more."
    detail="One account, a thousand places to discover."
    alternate={<>Already part of Wandora? <Link to="/login" state={from ? { from } : undefined}>Sign in <ArrowRight size={14} /></Link></>}
  >
    <form className="auth-form register-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert" role="alert"><ShieldCheck size={17} aria-hidden="true" /><span>{serverError}</span></div>}
      <div className="form-field">
        <label htmlFor="name">Your name</label>
        <div className="input-wrap">
          <UserRound size={17} aria-hidden="true" />
          <input id="name" autoComplete="name" placeholder="How should we call you?" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name')} />
        </div>
        {errors.name && <span id="name-error" className="field-error" role="alert">{errors.name.message}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="username">Username</label>
        <input className="plain-input" id="username" autoComplete="username" placeholder="Choose a username" aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} {...register('username')} />
        {errors.username && <span id="username-error" className="field-error" role="alert">{errors.username.message}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email address</label>
        <input className="plain-input" id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
        {errors.email && <span id="email-error" className="field-error" role="alert">{errors.email.message}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="register-password">Password</label>
        <div className="input-wrap">
          <LockKeyhole size={17} aria-hidden="true" />
          <input id="register-password" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'} {...register('password')} />
          <button className="password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
            {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
          </button>
        </div>
        <span id="register-password-hint" className="field-hint">Use 8–72 characters.</span>
        {errors.password && <span id="register-password-error" className="field-error" role="alert">{errors.password.message}</span>}
      </div>
      <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <><span className="button-spinner" aria-hidden="true" /> Creating your account…</> : <>Create account <ArrowRight size={17} aria-hidden="true" /></>}
      </button>
      <p className="otp-note"><ShieldCheck size={15} aria-hidden="true" /> Registration does not send an OTP. You can request a verification code after creating your account.</p>
    </form>
  </AuthFrame>
}

export function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const initialEmail = (location.state as { email?: string } | null)?.email ?? ''
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, getValues, setValue, formState: { errors, isSubmitting } } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema), defaultValues: { email: initialEmail, otp: '' } })

  async function requestOtp() {
    setServerError('')
    try {
      await authApi.resendOtp()
      setSent(true)
      showToast('A verification code has been requested.')
    } catch (error) { setServerError(getErrorMessage(error)) }
  }

  async function submit(values: OtpFormValues) {
    setServerError('')
    try {
      await authApi.verifyOtp(values)
      showToast('Your email is verified.')
      navigate('/app', { replace: true })
    } catch (error) { setServerError(getErrorMessage(error)) }
  }

  return <AuthFrame
    title="One small check."
    detail="Verify your email to keep your Wandora account secure."
    alternate={<>Already verified? <Link to="/app">Continue <ArrowRight size={14} /></Link></>}
  >
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert" role="alert"><ShieldCheck size={17} aria-hidden="true" /><span>{serverError}</span></div>}
      <div className="form-field">
        <label htmlFor="verify-email">Email address</label>
        <div className="input-wrap">
          <Mail size={17} aria-hidden="true" />
          <input id="verify-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'verify-email-error' : undefined} {...register('email')} />
        </div>
        {errors.email && <span id="verify-email-error" className="field-error" role="alert">{errors.email.message}</span>}
      </div>
      <button
        className="button button-soft auth-submit resend-button"
        type="button"
        onClick={() => {
          const email = getValues('email')
          if (!initialEmail) setValue('email', email, { shouldValidate: true })
          void requestOtp()
        }}
        disabled={isSubmitting}
      >
        {sent ? 'Request another code' : 'Request verification code'}
      </button>
      <div className="form-field">
        <label htmlFor="otp">Verification code</label>
        <input className="plain-input otp-input" id="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter your 6–12 character code" aria-invalid={Boolean(errors.otp)} aria-describedby={errors.otp ? 'otp-error' : undefined} {...register('otp')} />
        {errors.otp && <span id="otp-error" className="field-error" role="alert">{errors.otp.message}</span>}
      </div>
      <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>
        {isSubmitting ? <><span className="button-spinner" aria-hidden="true" /> Verifying…</> : <>Verify email <ArrowRight size={17} aria-hidden="true" /></>}
      </button>
      <p className="otp-note"><ShieldCheck size={15} aria-hidden="true" /> This protected step needs your authenticated session. Registration creates your session but does not send this code.</p>
    </form>
  </AuthFrame>
}
