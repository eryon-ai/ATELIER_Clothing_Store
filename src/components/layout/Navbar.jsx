import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'
import useWishlistStore from '../../store/useWishlistStore'
import useAuthStore from '../../store/useAuthStore'
import useSearchStore from '../../store/useSearchStore'
import { cn } from '../../utils'

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Collections', href: '/products', hasMega: true },
  { label: 'Editorial', href: '/editorial' },
  { label: 'Archive', href: '/collections/sale' },
]

const MEGA_COLUMNS = [
  {
    title: 'Trending',
    links: [
      { label: 'The Noir Series', href: '/collections/premium' },
      { label: 'Cyberpunk Synthesis', href: '/collections/anime' },
      { label: 'Minimalist Linen', href: '/collections/summer' },
    ],
  },
  {
    title: 'Sub-Cultures',
    links: [
      { label: 'Anime Archive', href: '/collections/anime' },
      { label: 'Oversized Essentials', href: '/collections/oversized' },
      { label: 'Street Avant-Garde', href: '/collections/streetwear' },
    ],
  },
  {
    title: 'Shop By',
    links: [
      { label: "Women's", href: '/collections/women' },
      { label: "Men's", href: '/collections/men' },
      { label: 'Footwear', href: '/collections/footwear' },
      { label: 'Accessories', href: '/collections/accessories' },
    ],
  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const cartCount = useCartStore(s => s.getItemCount())
  const wishCount = useWishlistStore(s => s.getCount())
  const { isAuthenticated } = useAuthStore()
  const { openSearch, openCart } = { openSearch: useSearchStore(s => s.openSearch), openCart: useCartStore(s => s.openCart) }
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500 border-b border-outline-variant/30',
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent backdrop-blur-md'
      )}
    >
      <nav className="flex justify-between items-center w-full px-margin-desktop py-md max-w-8xl mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-display-lg font-bold tracking-tighter text-primary"
        >
          ATELIER
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-lg">
          {NAV_LINKS.map(link =>
            link.hasMega ? (
              <div key={link.label} className="relative group">
                <button className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                  {link.label}
                  <span className="material-symbols-outlined icon-sm">expand_more</span>
                </button>
                {/* Mega Menu */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white border border-outline-variant p-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 grid grid-cols-3 gap-gutter mt-4 shadow-xl">
                  {MEGA_COLUMNS.map(col => (
                    <div key={col.title}>
                      <h4 className="font-label-md text-label-md uppercase mb-4 text-primary">{col.title}</h4>
                      <ul className="space-y-2">
                        {col.links.map(l => (
                          <li key={l.label}>
                            <Link
                              to={l.href}
                              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
                            >
                              {l.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={link.label}
                to={link.href}
                className={({ isActive }) =>
                  cn(
                    'font-label-md text-label-md uppercase tracking-widest transition-colors',
                    isActive
                      ? 'text-primary border-b border-primary pb-1'
                      : 'text-on-surface-variant hover:text-primary'
                  )
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-md">
          <button
            onClick={openSearch}
            className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity"
            aria-label="Search"
          >
            search
          </button>

          <Link to={isAuthenticated ? '/dashboard' : '/auth/login'} aria-label="Account">
            <span className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity">person</span>
          </Link>

          <Link to="/wishlist" className="relative" aria-label="Wishlist">
            <span className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity">favorite</span>
            {wishCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                {wishCount}
              </span>
            )}
          </Link>

          <button onClick={openCart} className="relative" aria-label="Cart">
            <span className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden material-symbols-outlined text-primary"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? 'close' : 'menu'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-outline-variant px-margin-mobile py-md flex flex-col gap-md">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.label}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="font-label-md text-label-md uppercase tracking-widest text-on-surface-variant py-2 border-b border-outline-variant/50"
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/auth/login" onClick={() => setMobileOpen(false)} className="font-label-md text-label-md uppercase tracking-widest text-secondary">
            Sign In
          </NavLink>
        </div>
      )}
    </header>
  )
}
