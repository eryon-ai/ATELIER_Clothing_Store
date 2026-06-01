import { useMemo } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

export function StatCard({ icon, label, value, change, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-outline-variant/30 p-4 md:p-6 relative overflow-hidden group hover:shadow-lg transition-shadow"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-full`} />
      <div className={`w-10 h-10 ${color} bg-opacity-10 flex items-center justify-center mb-4`}>
        <span className={`material-symbols-outlined text-xl ${color.replace('bg-', 'text-')}`}>{icon}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">{label}</p>
      <p className="text-3xl font-bold text-primary tracking-tight">{value}</p>
      {change && (
        <p className={`text-xs font-semibold mt-1 ${change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs last month
        </p>
      )}
    </motion.div>
  )
}

StatCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.number,
  color: PropTypes.string.isRequired
}

import { useAdminStore } from '../../store/useAdminStore'
import { ADMIN_STATUS_COLORS } from '../../constants'

export default function AdminOverview() {
  const { stats, orders } = useAdminStore()
  const recentOrders = useMemo(() => orders.slice(0, 6), [orders])
  const delivered = useMemo(() => orders.filter(o => o.status === 'Delivered').length, [orders])
  const processing = useMemo(() => orders.filter(o => o.status === 'Processing').length, [orders])

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="payments" label="Total Revenue" value={`$${(stats.revenue).toLocaleString()}`} change={12.4} color="bg-emerald-500" />
        <StatCard icon="receipt_long" label="Total Orders" value={stats.orders.toLocaleString()} change={8.1} color="bg-blue-500" />
        <StatCard icon="group" label="Customers" value={stats.customers.toLocaleString()} change={5.3} color="bg-violet-500" />
        <StatCard icon="percent" label="Conversion" value={`${stats.conversion}%`} change={-0.8} color="bg-amber-500" />
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-outline-variant/30 p-6 col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                <div>
                  <p className="font-semibold text-sm text-primary">{o.id}</p>
                  <p className="text-xs text-on-surface-variant">{o.customer} · {o.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ADMIN_STATUS_COLORS[o.status]}`}>{o.status}</span>
                  <span className="font-bold text-sm text-primary">${o.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Order Status</h3>
            {[
              { label: 'Delivered', count: delivered, color: 'bg-emerald-500' },
              { label: 'Processing', count: processing, color: 'bg-blue-500' },
              { label: 'Other', count: orders.length - delivered - processing, color: 'bg-gray-300' },
            ].map(s => (
              <div key={s.label} className="mb-3">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>{s.label}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / orders.length) * 100}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className={`h-full ${s.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary text-on-primary p-6">
            <span className="material-symbols-outlined text-3xl mb-3 block opacity-80">storefront</span>
            <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Store Status</p>
            <p className="font-bold text-lg">LIVE & ACTIVE</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-xs opacity-70">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
