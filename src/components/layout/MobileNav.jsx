import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'
import useWishlistStore from '../../store/useWishlistStore'
import useSearchStore from '../../store/useSearchStore'

const TABS = [
  { icon: 'home', label: 'Home', href: '/' },
  { icon: 'search', label: 'Search', href: null, action: 'search' },
  { icon: 'category', label: 'Shop', href: '/products' },
  { icon: 'favorite', label: 'Wishlist', href: '/wishlist' },
  { icon: 'person', label: 'Account', href: '/dashboard' },
]

export default function MobileNav() {
  const { pathname } = useLocation()
  const cartCount = useCartStore(s => s.getItemCount())
  const wishCount = useWishlistStore(s => s.getCount())
  const openCart = useCartStore(s => s.openCart)

  return (
    <nav className="mobile-nav safe-area-bottom">
      {TABS.map(tab => {
        const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href || '__none')
        const count = tab.icon === 'favorite' ? wishCount : null

        if (tab.icon === 'search') {
          return (
            <button
              key={tab.label}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[#999999]"
              onClick={() => useSearchStore?.getState?.()?.openSearch?.()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{tab.icon}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide">{tab.label}</span>
            </button>
          )
        }

        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 relative transition-colors ${isActive ? 'text-[#111111]' : 'text-[#999999]'}`}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 22, ...(isActive ? { fontVariationSettings: "'FILL' 1" } : {}) }}
            >
              {tab.icon}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide">{tab.label}</span>
            {count > 0 && (
              <span className="absolute top-0 right-1 bg-[#111111] text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">
                {count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
