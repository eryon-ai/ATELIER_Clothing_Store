import { motion } from 'framer-motion'
import { StatCard } from './AdminOverview'

import { useAdminStore } from '../../store/useAdminStore'

export default function AdminAnalytics() {
  const { orders } = useAdminStore()
  const total = orders.reduce((s, o) => s + o.amount, 0)
  const avgOrder = Math.round(total / orders.length)
  const topProducts = Object.entries(
    orders.reduce((acc, o) => { acc[o.product] = (acc[o.product] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const bars = [65, 80, 55, 90, 70, 85, 95, 60, 75, 88, 72, 92]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon="payments" label="Total Revenue" value={`$${total.toLocaleString()}`} color="bg-emerald-500" />
        <StatCard icon="shopping_cart" label="Avg Order Value" value={`$${avgOrder}`} color="bg-blue-500" />
        <StatCard icon="receipt_long" label="Total Orders" value={orders.length} color="bg-violet-500" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-outline-variant/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Revenue by Month</h3>
        <div className="flex items-end gap-2 h-40">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="w-full bg-primary hover:bg-secondary transition-colors cursor-pointer relative group"
                style={{ height: `${h}%` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${Math.round(h * 280)}
                </div>
              </motion.div>
              <span className="text-[10px] text-on-surface-variant">{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white border border-outline-variant/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Top Selling Products</h3>
        <div className="space-y-4">
          {topProducts.map(([name, count], i) => (
            <div key={name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-primary truncate max-w-[240px]">{name}</span>
                <span className="text-on-surface-variant font-semibold">{count} orders</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / topProducts[0][1]) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
