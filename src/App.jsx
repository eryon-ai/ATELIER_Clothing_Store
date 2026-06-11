import { BrowserRouter, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom'
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
const AdminOverview     = lazy(() => import('./components/admin/AdminOverview'))
const AdminProducts     = lazy(() => import('./components/admin/AdminProducts'))
const AdminOrders       = lazy(() => import('./components/admin/AdminOrders'))
const AdminCustomers    = lazy(() => import('./components/admin/AdminCustomers'))
const AdminAnalytics    = lazy(() => import('./components/admin/AdminAnalytics'))
const AdminMarketing    = lazy(() => import('./components/admin/AdminMarketing'))
const AdminStorefront   = lazy(() => import('./components/admin/AdminStorefront'))
const AdminInventory    = lazy(() => import('./components/admin/AdminInventory'))
const AdminSupport      = lazy(() => import('./components/admin/AdminSupport'))
const AdminFinancials   = lazy(() => import('./components/admin/AdminFinancials'))
const AdminSettings     = lazy(() => import('./components/admin/AdminSettings'))
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
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth — no main layout */}
        <Route path="/auth/login"           element={<P><LoginPage /></P>} />
        <Route path="/auth/signup"          element={<P><SignupPage /></P>} />
        <Route path="/auth/forgot-password" element={<P><ForgotPage /></P>} />

        {/* Admin — full-screen, no main layout */}
        <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Suspense fallback={<PageLoader />}><AdminOverview /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<PageLoader />}><AdminProducts /></Suspense>} />
          <Route path="orders" element={<Suspense fallback={<PageLoader />}><AdminOrders /></Suspense>} />
          <Route path="customers" element={<Suspense fallback={<PageLoader />}><AdminCustomers /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense>} />
          <Route path="marketing" element={<Suspense fallback={<PageLoader />}><AdminMarketing /></Suspense>} />
          <Route path="storefront" element={<Suspense fallback={<PageLoader />}><AdminStorefront /></Suspense>} />
          <Route path="inventory" element={<Suspense fallback={<PageLoader />}><AdminInventory /></Suspense>} />
          <Route path="support" element={<Suspense fallback={<PageLoader />}><AdminSupport /></Suspense>} />
          <Route path="financials" element={<Suspense fallback={<PageLoader />}><AdminFinancials /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
        </Route>

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
    </AnimatePresence>
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
      <AdminDemoBanner />
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

function AdminDemoBanner() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null
  
  return (
    <Link 
      to="/admin"
      className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(220,38,38,0.4)] hover:bg-red-700 transition-colors flex items-center gap-2 animate-bounce rounded-sm border-2 border-white"
    >
      <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
      Admin Panel Demo
    </Link>
  )
}
