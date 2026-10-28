import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, Compass, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { authApi } from '../auth/authApi'
import { getErrorMessage } from '../api/http'
import { loginSchema, otpSchema, registerSchema, type LoginFormValues, type OtpFormValues, type RegisterFormValues } from '../lib/validation'
import { useToast } from '../components/useToast'

function AuthFrame({ title, detail, children, alternate }: { title: string; detail: string; children: React.ReactNode; alternate: React.ReactNode }) {
  return <section className="auth-page">
    <div className="auth-art"><div className="auth-art-image" /><div className="auth-art-shade" /><Link to="/" className="brand auth-brand"><span className="brand-mark"><Compass size={19} /></span><span>wandora<span className="brand-period">.</span></span></Link><div className="auth-art-copy"><span className="eyebrow"><span className="eyebrow-dot" /> KEEP THE WONDER CLOSE</span><h2>Good journeys<br />begin with <em>hello.</em></h2><p>The world feels a little smaller when you have somewhere to belong.</p></div><div className="auth-art-bottom">A good place to begin <span>✳</span></div></div>
    <div className="auth-panel"><Link className="auth-back" to="/"><ArrowLeft size={16} /> Back to Wandora</Link><div className="auth-form-wrap"><div className="auth-mark"><Compass size={21} /></div><span className="auth-kicker">YOUR NEXT CHAPTER</span><h1>{title}</h1><p className="auth-subtitle">{detail}</p>{children}<div className="auth-alternate">{alternate}</div><p className="auth-legal">By continuing, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p></div></div>
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
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/app'

  async function submit(values: LoginFormValues) {
    setServerError('')
    try {
      await login(values)
      showToast('Welcome back. You’re signed in.')
      navigate(from, { replace: true })
    } catch (error) { setServerError(getErrorMessage(error)) }
  }

  return <AuthFrame title="Welcome back." detail="Sign in and pick up where your next adventure begins." alternate={<>New around here? <Link to="/register">Create an account <ArrowRight size={14} /></Link></>}>
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert" role="alert"><ShieldCheck size={17} />{serverError}</div>}
      <div className="form-field"><label htmlFor="identifier">Email or username</label><div className="input-wrap"><Mail size={17} /><input id="identifier" autoComplete="username" placeholder="you@example.com" aria-invalid={Boolean(errors.identifier)} aria-describedby={errors.identifier ? 'identifier-error' : undefined} {...register('identifier')} /></div>{errors.identifier && <span id="identifier-error" className="field-error">{errors.identifier.message}</span>}</div>
      <div className="form-field"><label htmlFor="password">Password</label><div className="input-wrap"><LockKeyhole size={17} /><input id="password" type={visible ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} /><button className="password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <span id="password-error" className="field-error">{errors.password.message}</span>}</div>
      <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing you in…' : 'Sign in'} {!isSubmitting && <ArrowRight size={17} />}</button>
    </form>
  </AuthFrame>
}

export function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [visible, setVisible] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })
  async function submit(values: RegisterFormValues) {
    setServerError('')
    try {
      await createAccount(values)
      showToast('Your account is ready. Request your verification code to continue.')
      navigate('/verify-email', { replace: true, state: { email: values.email } })
    } catch (error) { setServerError(getErrorMessage(error)) }
  }
  return <AuthFrame title="Make room for more." detail="One account, a thousand places to discover." alternate={<>Already part of Wandora? <Link to="/login">Sign in <ArrowRight size={14} /></Link></>}>
    <form className="auth-form register-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert" role="alert">{serverError}</div>}
      <div className="form-field"><label htmlFor="name">Your name</label><input className="plain-input" id="name" autoComplete="name" placeholder="How should we call you?" aria-invalid={Boolean(errors.name)} {...register('name')} />{errors.name && <span className="field-error">{errors.name.message}</span>}</div>
      <div className="form-field"><label htmlFor="username">Username</label><input className="plain-input" id="username" autoComplete="username" placeholder="Choose a username" aria-invalid={Boolean(errors.username)} {...register('username')} />{errors.username && <span className="field-error">{errors.username.message}</span>}</div>
      <div className="form-field"><label htmlFor="email">Email address</label><input className="plain-input" id="email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} {...register('email')} />{errors.email && <span className="field-error">{errors.email.message}</span>}</div>
      <div className="form-field"><label htmlFor="register-password">Password</label><div className="input-wrap"><LockKeyhole size={17} /><input id="register-password" type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={Boolean(errors.password)} {...register('password')} /><button className="password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{errors.password && <span className="field-error">{errors.password.message}</span>}</div>
      <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating your account…' : 'Create account'} {!isSubmitting && <ArrowRight size={17} />}</button>
      <p className="otp-note"><ShieldCheck size={15} /> Registration does not send an OTP. You can request a verification code after creating your account.</p>
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
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema), defaultValues: { email: initialEmail, otp: '' } })
  async function requestOtp() {
    setServerError('')
    try { await authApi.resendOtp(); setSent(true); showToast('A verification code has been requested.') }
    catch (error) { setServerError(getErrorMessage(error)) }
  }
  async function submit(values: OtpFormValues) {
    setServerError('')
    try { await authApi.verifyOtp(values); showToast('Your email is verified.'); navigate('/app', { replace: true }) }
    catch (error) { setServerError(getErrorMessage(error)) }
  }
  return <AuthFrame title="One small check." detail="Verify your email to keep your Wandora account secure." alternate={<>Already verified? <Link to="/app">Continue <ArrowRight size={14} /></Link></>}>
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      {serverError && <div className="form-alert" role="alert">{serverError}</div>}
      <div className="form-field"><label htmlFor="verify-email">Email address</label><div className="input-wrap"><Mail size={17} /><input id="verify-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} {...register('email')} /></div>{errors.email && <span className="field-error">{errors.email.message}</span>}</div>
      <button className="button button-soft auth-submit resend-button" type="button" onClick={() => { if (initialEmail) void requestOtp(); else { const email = document.getElementById('verify-email') as HTMLInputElement | null; if (email) setValue('email', email.value, { shouldValidate: true }); void requestOtp() } }} disabled={isSubmitting}>{sent ? 'Request another code' : 'Request verification code'}</button>
      <div className="form-field"><label htmlFor="otp">Verification code</label><input className="plain-input otp-input" id="otp" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter your 6–12 character code" aria-invalid={Boolean(errors.otp)} {...register('otp')} />{errors.otp && <span className="field-error">{errors.otp.message}</span>}</div>
      <button className="button button-dark auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Verifying…' : 'Verify email'} {!isSubmitting && <ArrowRight size={17} />}</button>
      <p className="otp-note"><ShieldCheck size={15} /> This protected step needs your authenticated session. Registration creates your session but does not send this code.</p>
    </form>
  </AuthFrame>
}
