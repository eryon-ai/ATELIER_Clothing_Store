import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' },
}

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  })
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password)
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-gutter">
        <label className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Email</span>
          <input type="email" {...register('email')} className={`input-ghost ${errors.email ? 'border-error' : ''}`} placeholder="you@example.com" />
          {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
        </label>
        <label className="flex flex-col gap-xs">
          <div className="flex justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Password</span>
            <Link to="/auth/forgot-password" className="font-label-sm text-label-sm text-secondary hover:underline">Forgot?</Link>
          </div>
          <input type="password" {...register('password')} className={`input-ghost ${errors.password ? 'border-error' : ''}`} placeholder="••••••••" />
          {errors.password && <span className="text-xs text-error mt-1">{errors.password.message}</span>}
        </label>
        <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-sm">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema)
  })
  const { signup, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    const result = await signup(data.name, data.email, data.password)
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-gutter">
        <label className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Full Name</span>
          <input type="text" {...register('name')} className={`input-ghost ${errors.name ? 'border-error' : ''}`} placeholder="Your name" />
          {errors.name && <span className="text-xs text-error mt-1">{errors.name.message}</span>}
        </label>
        <label className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Email</span>
          <input type="email" {...register('email')} className={`input-ghost ${errors.email ? 'border-error' : ''}`} placeholder="you@example.com" />
          {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
        </label>
        <label className="flex flex-col gap-xs">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Password</span>
          <input type="password" {...register('password')} className={`input-ghost ${errors.password ? 'border-error' : ''}`} placeholder="••••••••" />
          {errors.password && <span className="text-xs text-error mt-1">{errors.password.message}</span>}
        </label>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = (data) => {
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
          <p className="font-body-md text-on-surface-variant">Check your inbox. A reset link was sent to <strong>{getValues('email')}</strong>.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-gutter">
          <label className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Email</span>
            <input type="email" {...register('email')} className={`input-ghost ${errors.email ? 'border-error' : ''}`} placeholder="you@example.com" />
            {errors.email && <span className="text-xs text-error mt-1">{errors.email.message}</span>}
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
      <div className="flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-lg md:py-xl">
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
