import { useState } from 'react'
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useWishlistStore from '../store/useWishlistStore'
import { formatPrice } from '../utils'
import { PRODUCTS } from '../mock/products'

// Mock order data
const MOCK_ORDERS = [
  { id: 'ATL-2024-001', date: '2024-05-12', status: 'Delivered', total: 1700, items: [PRODUCTS[0], PRODUCTS[6]] },
  { id: 'ATL-2024-002', date: '2024-04-28', status: 'In Transit', total: 850, items: [PRODUCTS[2]] },
  { id: 'ATL-2024-003', date: '2024-03-15', status: 'Delivered', total: 495, items: [PRODUCTS[1]] },
]

const SIDEBAR = [
  { label: 'Overview', href: '/dashboard', icon: 'dashboard' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'local_shipping' },
  { label: 'Wishlist', href: '/wishlist', icon: 'favorite' },
  { label: 'Profile', href: '/dashboard/profile', icon: 'person' },
  { label: 'Rewards', href: '/dashboard/rewards', icon: 'stars' },
]

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const wishCount = useWishlistStore(s => s.getCount())
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="pt-32 text-center px-margin-desktop">
        <h2 className="font-headline-md text-primary mb-4">You need to sign in</h2>
        <Link to="/auth/login" className="btn-primary inline-block">Sign In</Link>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="pt-20 min-h-screen grid grid-cols-1 md:grid-cols-12 gap-gutter px-margin-desktop py-lg max-w-8xl mx-auto">
      {/* Sidebar */}
      <aside className="md:col-span-3">
        <div className="sticky top-24">
          {/* Profile Card */}
          <div className="glass-panel p-lg mb-lg text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-sm">
              <span className="font-headline-md text-on-primary text-xl">
                {user.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <h3 className="font-label-md text-label-md uppercase">{user.name}</h3>
            <p className="font-body-md text-on-surface-variant text-sm">{user.email}</p>
            <span className="inline-block mt-sm px-sm py-xs bg-surface-container font-label-sm text-label-sm text-secondary uppercase tracking-widest">
              {user.tier}
            </span>
          </div>

          <nav className="flex flex-col gap-xs">
            {SIDEBAR.map(item => (
              <NavLink
                key={item.label}
                to={item.href}
                end={item.href === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-sm font-label-md text-label-md uppercase py-sm px-md transition-colors ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'}`
                }
              >
                <span className="material-symbols-outlined icon-sm">{item.icon}</span>
                {item.label}
                {item.label === 'Wishlist' && wishCount > 0 && (
                  <span className="ml-auto bg-secondary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{wishCount}</span>
                )}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-sm font-label-md text-label-md uppercase py-sm px-md text-error hover:bg-error/5 transition-colors w-full text-left mt-md"
            >
              <span className="material-symbols-outlined icon-sm">logout</span>
              Sign Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:col-span-9">
        <DashboardHome user={user} orders={MOCK_ORDERS} />
      </main>
    </div>
  )
}

function DashboardHome({ user, orders }) {
  return (
    <div className="space-y-lg">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {[
          { icon: 'local_shipping', label: 'Total Orders', value: orders.length },
          { icon: 'favorite', label: 'Saved Items', value: useWishlistStore.getState().getCount() },
          { icon: 'stars', label: 'Reward Points', value: `${user.points?.toLocaleString() || 0} pts` },
          { icon: 'loyalty', label: 'Member Since', value: user.joinedAt ? new Date(user.joinedAt).getFullYear() : '2024' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-md flex flex-col gap-xs">
            <span className="material-symbols-outlined text-secondary">{stat.icon}</span>
            <p className="font-headline-md text-headline-md text-primary">{stat.value}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="font-headline-md text-headline-md uppercase mb-md">Recent Orders</h2>
        <div className="space-y-sm">
          {orders.map(order => (
            <div key={order.id} className="glass-panel p-md">
              <div className="flex justify-between items-start mb-sm">
                <div>
                  <p className="font-label-md text-label-md uppercase">{order.id}</p>
                  <p className="font-body-md text-on-surface-variant">{order.date}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-sm py-xs font-label-sm text-label-sm uppercase ${
                    order.status === 'Delivered' ? 'bg-surface-container text-secondary' : 'bg-surface-container-high text-on-surface-variant'
                  }`}>{order.status}</span>
                  <p className="font-label-md text-label-md mt-1">{formatPrice(order.total)}</p>
                </div>
              </div>
              <div className="flex gap-xs">
                {order.items.map((item, i) => (
                  <div key={i} className="w-12 h-14 bg-surface-container overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-primary text-on-primary p-lg">
        <div className="flex justify-between items-center mb-md">
          <h3 className="font-headline-md text-headline-md uppercase">ATELIER Rewards</h3>
          <span className="font-label-md text-label-md text-primary-fixed-dim uppercase">{user.tier}</span>
        </div>
        <div className="mb-md">
          <div className="flex justify-between items-end mb-2">
            <p className="font-body-md text-primary-fixed-dim">{user.points?.toLocaleString() || 0} pts</p>
            <p className="font-label-sm text-label-sm text-primary-fixed-dim">5,000 pts for Platinum</p>
          </div>
          <div className="h-1 bg-white/20 w-full">
            <div className="h-full bg-white transition-all" style={{ width: `${Math.min(((user.points || 0) / 5000) * 100, 100)}%` }} />
          </div>
        </div>
        <p className="font-body-md text-primary-fixed-dim">
          Earn 1 point per $1 spent. Redeem for exclusive discounts and early access.
        </p>
      </div>
    </div>
  )
}
