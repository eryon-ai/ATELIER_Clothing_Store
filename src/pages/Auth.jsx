import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' },
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Welcome back', TOAST_STYLE)
      navigate('/dashboard')
    } else {
      toast.error(result.message, TOAST_STYLE)
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your ATELIER account."
      footer={<>No account? <Link to="/auth/signup" className="text-secondary underline">Create one</Link></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-gutter">
        <label className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Email</span>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-ghost" required placeholder="you@example.com" />
        </label>
        <label className="flex flex-col gap-xs">
          <div className="flex justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Password</span>
            <Link to="/auth/forgot-password" className="font-label-sm text-label-sm text-secondary hover:underline">Forgot?</Link>
          </div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-ghost" required placeholder="••••••••" />
        </label>
        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-sm">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signup, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await signup(name, email, password)
    if (result.success) {
      toast.success('Account created. Welcome to ATELIER!', TOAST_STYLE)
      navigate('/dashboard')
    } else {
      toast.error(result.message, TOAST_STYLE)
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the ATELIER circle."
      footer={<>Already a member? <Link to="/auth/login" className="text-secondary underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-gutter">
        {[
          { label: 'Full Name', type: 'text', val: name, setVal: setName, placeholder: 'Your name' },
          { label: 'Email', type: 'email', val: email, setVal: setEmail, placeholder: 'you@example.com' },
          { label: 'Password', type: 'password', val: password, setVal: setPassword, placeholder: '••••••••' },
        ].map(f => (
          <label key={f.label} className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{f.label}</span>
            <input type={f.type} value={f.val} onChange={e => f.setVal(e.target.value)} className="input-ghost" required placeholder={f.placeholder} />
          </label>
        ))}
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="We'll send a reset link to your email."
      footer={<Link to="/auth/login" className="text-secondary underline">Back to login</Link>}
    >
      {sent ? (
        <div className="text-center py-md">
          <span className="material-symbols-outlined icon-xl text-secondary block mb-md">mark_email_read</span>
          <p className="font-body-md text-on-surface-variant">Check your inbox. A reset link was sent to <strong>{email}</strong>.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-gutter">
          <label className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-ghost" required placeholder="you@example.com" />
          </label>
          <button type="submit" className="btn-primary w-full">Send Reset Link</button>
        </form>
      )}
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Visual */}
      <div className="hidden md:flex items-center justify-center bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYRxRmMDX0B6F3EFXz6XFXIWwqv_DP0sC5ecqL8bYoPKE5gAQ2qyW25O-AdKke7qMircbOJa4vTodokHTZruVJvdi2HtD3grGF9yqkdCgxFikO9kMmu11juATVrjoORZbQKWAw9NajbFnGFOA7sVDe2Cxo-E4JtmLP7L5ensAY_XL7niVgkbm1SnO9fOEvFtSktdU_r_LjMlhcw4dt3S5KTgq1-OMB8bKxKW4GV62Myzu9XWVZyvecGlrJTJhkqIbS_5itZKkraMox"
            alt="ATELIER"
            className="w-full h-full object-cover opacity-20 hero-zoom"
          />
        </div>
        <div className="relative z-10 text-center px-xl">
          <Link to="/" className="font-display text-display-lg font-bold text-white tracking-tighter">ATELIER</Link>
          <p className="font-body-lg text-body-lg text-primary-fixed-dim mt-4 max-w-xs mx-auto">
            The intersection of discipline and desire.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex flex-col items-center justify-center px-margin-desktop py-xl">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-headline-md font-bold text-primary tracking-tighter mb-xl block md:hidden">ATELIER</Link>
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase mb-2">{title}</h1>
          <p className="font-body-md text-on-surface-variant mb-xl">{subtitle}</p>
          {children}
          <p className="font-body-md text-on-surface-variant text-center mt-lg">{footer}</p>
        </div>
      </div>
    </div>
  )
}
