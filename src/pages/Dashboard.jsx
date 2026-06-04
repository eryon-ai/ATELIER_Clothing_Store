import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import useWishlistStore from '../store/useWishlistStore'
import { formatPrice } from '../utils'
import { api } from '../services/api'

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
  const { tab } = useParams()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    api.getProducts().then(PRODUCTS => {
      setOrders([
        { id: 'ATL-2024-001', date: '2024-05-12', status: 'Delivered', total: 1700, items: [PRODUCTS[0], PRODUCTS[6]] },
        { id: 'ATL-2024-002', date: '2024-04-28', status: 'In Transit', total: 850, items: [PRODUCTS[2]] },
        { id: 'ATL-2024-003', date: '2024-03-15', status: 'Delivered', total: 495, items: [PRODUCTS[1]] },
      ])
    })
  }, [])

  if (!user) {
    return (
      <div className="pt-[88px] min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="bg-white text-center p-12 max-w-sm w-full mx-4" style={{ borderRadius: 32 }}>
          <h2 className="text-[22px] font-semibold text-[#111111] mb-4">Sign in required</h2>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center bg-[#111111] text-white text-[12px] font-semibold px-8 py-3.5 hover:opacity-80 transition-opacity"
            style={{ borderRadius: 9999 }}
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="pt-[88px] min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Sidebar */}
        <aside className="md:col-span-3">
          <div className="sticky top-[96px] space-y-3">
            {/* Profile Card */}
            <div className="bg-white p-6 text-center" style={{ borderRadius: 24 }}>
              <div className="w-14 h-14 bg-[#111111] rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-[18px] font-semibold">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-[#111111]">{user.name}</h3>
              <p className="text-[12px] text-[#666666] mt-0.5">{user.email}</p>
              <span
                className="inline-block mt-2 px-3 py-1 bg-[#F5F5F5] text-[10px] font-bold uppercase tracking-widest text-[#666666]"
                style={{ borderRadius: 9999 }}
              >
                {user.tier}
              </span>
            </div>

            {/* Nav */}
            <div className="bg-white p-3" style={{ borderRadius: 24 }}>
              {SIDEBAR.map(item => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 text-[13px] font-medium py-2.5 px-4 transition-all duration-200
                    ${isActive
                      ? 'bg-[#111111] text-white rounded-xl'
                      : 'text-[#666666] hover:text-[#111111] hover:bg-[#F5F5F5] rounded-xl'
                    }`
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{item.icon}</span>
                  {item.label}
                  {item.label === 'Wishlist' && wishCount > 0 && (
                    <span className="ml-auto bg-[#111111] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{wishCount}</span>
                  )}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 text-[13px] font-medium py-2.5 px-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-2"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="md:col-span-9">
          {tab === 'orders' ? (
            <OrdersView orders={orders} />
          ) : (
            <DashboardHome user={user} orders={orders} />
          )}
        </main>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-5 flex flex-col gap-3" style={{ borderRadius: 20 }}>
      <span className="material-symbols-outlined text-[#0047AB]" style={{ fontSize: 24 }}>{icon}</span>
      <p className="text-[22px] font-semibold text-[#111111]">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#999999]">{label}</p>
    </div>
  )
}

function OrderCard({ order }) {
  return (
    <div className="bg-white p-5" style={{ borderRadius: 20 }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[13px] font-bold text-[#111111] uppercase tracking-wide">{order.id}</p>
          <p className="text-[12px] text-[#999999] mt-0.5">{order.date}</p>
        </div>
        <div className="text-right">
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-3 py-1.5
              ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-[#F5F5F5] text-[#666666]'}`}
            style={{ borderRadius: 9999 }}
          >
            {order.status}
          </span>
          <p className="text-[13px] font-semibold text-[#111111] mt-1.5">{formatPrice(order.total)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {order.items.map((item, i) => (
          <div key={i} className="w-12 h-14 overflow-hidden" style={{ borderRadius: 10 }}>
            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

function OrdersView({ orders }) {
  if (orders.length === 0) return (
    <div className="bg-white p-8 text-center" style={{ borderRadius: 24 }}>
      <p className="text-[#999999] text-[14px]">Loading orders...</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { icon: 'local_shipping', label: 'Total Orders', value: orders.length },
          { icon: 'favorite', label: 'Saved Items', value: useWishlistStore.getState().getCount() },
          { icon: 'stars', label: 'Reward Points', value: '0 pts' },
        ].map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      <div className="bg-white p-6" style={{ borderRadius: 24 }}>
        <h2 className="text-[18px] font-semibold text-[#111111] uppercase mb-4 tracking-tight">Recent Orders</h2>
        <div className="space-y-3">
          {orders.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      </div>
    </div>
  )
}

function DashboardHome({ user, orders }) {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: 'local_shipping', label: 'Total Orders', value: orders.length },
          { icon: 'favorite', label: 'Saved Items', value: useWishlistStore.getState().getCount() },
          { icon: 'stars', label: 'Reward Points', value: `${user.points?.toLocaleString() || 0} pts` },
          { icon: 'loyalty', label: 'Member Since', value: user.joinedAt ? new Date(user.joinedAt).getFullYear() : '2024' },
        ].map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="bg-white p-6" style={{ borderRadius: 24 }}>
          <h2 className="text-[18px] font-semibold text-[#111111] uppercase mb-4 tracking-tight">Recent Orders</h2>
          <div className="space-y-3">
            {orders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </div>
      )}

      {/* Rewards */}
      <div className="bg-[#111111] p-6 md:p-8" style={{ borderRadius: 24 }}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[18px] font-semibold text-white uppercase tracking-tight">ATELIER Rewards</h3>
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{user.tier}</span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-end mb-2">
            <p className="text-[13px] font-semibold text-white/70">{user.points?.toLocaleString() || 0} pts</p>
            <p className="text-[11px] text-white/40">5,000 pts for Platinum</p>
          </div>
          <div className="h-1.5 bg-white/10 w-full rounded-full">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(((user.points || 0) / 5000) * 100, 100)}%` }} />
          </div>
        </div>
        <p className="text-[13px] text-white/50">
          Earn 1 point per $1 spent. Redeem for exclusive discounts and early access.
        </p>
      </div>
    </div>
  )
}
