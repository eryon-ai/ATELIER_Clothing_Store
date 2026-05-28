import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'
import { AnimatePresence } from 'framer-motion'

// Layout
import MainLayout from './layouts/MainLayout'
import PageTransition from './components/ui/PageTransition'

// ── Critical path (eager) ─────────────────────────────────────────────
import HomePage from './pages/Home'

// ── Lazy-loaded (code-split) ──────────────────────────────────────────
const ProductDetail     = lazy(() => import('./pages/ProductDetail'))
const CartPage          = lazy(() => import('./pages/Cart'))
const WishlistPage      = lazy(() => import('./pages/Wishlist'))
const CollectionPage    = lazy(() => import('./pages/CollectionPage'))
const ProductsPage      = lazy(() => import('./pages/Products'))
const Dashboard         = lazy(() => import('./pages/Dashboard'))
const AdminPage         = lazy(() => import('./pages/Admin'))
const LoginPage         = lazy(() => import('./pages/Auth').then(m => ({ default: m.LoginPage })))
const SignupPage        = lazy(() => import('./pages/Auth').then(m => ({ default: m.SignupPage })))
const ForgotPage        = lazy(() => import('./pages/Auth').then(m => ({ default: m.ForgotPasswordPage })))

// ── Page skeleton ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <p className="font-black text-2xl tracking-tighter text-primary animate-pulse">ATELIER</p>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Wrap a page with Suspense + PageTransition ────────────────────────
function P({ children }) {
  return (
    <PageTransition>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </PageTransition>
  )
}

// ── Animated route container ─────────────────────────────────────────
function AnimatedRoutes() {
  return (
    <Routes>
      {/* Auth — no main layout */}
      <Route path="/auth/login"           element={<P><LoginPage /></P>} />
      <Route path="/auth/signup"          element={<P><SignupPage /></P>} />
      <Route path="/auth/forgot-password" element={<P><ForgotPage /></P>} />

      {/* Admin — full-screen, no main layout */}
      <Route path="/admin"  element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
      <Route path="/admin/*" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />

      {/* Main store layout */}
      <Route element={<MainLayout />}>
        <Route index                      element={<P><HomePage /></P>} />
        <Route path="/products"           element={<P><ProductsPage /></P>} />
        <Route path="/products/:slug"     element={<P><ProductDetail /></P>} />
        <Route path="/collections/:slug"  element={<P><CollectionPage /></P>} />
        <Route path="/cart"               element={<P><CartPage /></P>} />
        <Route path="/checkout"           element={<P><CartPage /></P>} />
        <Route path="/wishlist"           element={<P><WishlistPage /></P>} />
        <Route path="/dashboard"          element={<P><Dashboard /></P>} />
        <Route path="/dashboard/:tab"     element={<P><Dashboard /></P>} />
        <Route path="/editorial"          element={<P><CollectionPage /></P>} />
        <Route path="*"                   element={<P><NotFound /></P>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#000',
            color: '#fff',
            fontFamily: 'Hanken Grotesk, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            borderRadius: '0',
            padding: '12px 20px',
          },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Page Not Found</p>
      <h1 className="text-8xl font-black text-primary tracking-tighter mb-6">404</h1>
      <p className="text-on-surface-variant mb-8 max-w-xs">This page doesn't exist in the ATELIER archive.</p>
      <a href="/" className="bg-primary text-on-primary px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors inline-block">
        Return Home
      </a>
    </div>
  )
}
