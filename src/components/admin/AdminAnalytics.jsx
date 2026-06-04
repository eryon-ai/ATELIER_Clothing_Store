import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { StatCard } from './AdminOverview'
import { useAdminStore } from '../../store/useAdminStore'

export default function AdminAnalytics() {
  const { orders: allOrders, products, activities } = useAdminStore()
  const [dateRange, setDateRange] = useState('30D')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const orders = useMemo(() => {
    let cutoff = new Date(0)
    let endCutoff = new Date()
    const now = new Date()

    if (dateRange === '7D') cutoff = new Date(now.setDate(now.getDate() - 7))
    else if (dateRange === '30D') cutoff = new Date(now.setDate(now.getDate() - 30))
    else if (dateRange === '90D') cutoff = new Date(now.setDate(now.getDate() - 90))
    else if (dateRange === 'YTD') cutoff = new Date(now.getFullYear(), 0, 1)
    else if (dateRange === 'CUSTOM') {
      cutoff = customStart ? new Date(customStart) : new Date(0)
      endCutoff = customEnd ? new Date(customEnd) : new Date()
    }

    return allOrders.filter(o => {
      const d = new Date(o.date)
      if (isNaN(d.getTime())) return true;
      return d >= cutoff && d <= endCutoff
    })
  }, [allOrders, dateRange, customStart, customEnd])

  // Basic calculations
  const total = useMemo(() => orders.reduce((s, o) => s + o.amount, 0), [orders])
  const avgOrder = useMemo(() => orders.length ? Math.round(total / orders.length) : 0, [total, orders.length])
  
  // Top Products (with revenue)
  const topProducts = useMemo(() => {
    const productStats = orders.reduce((acc, o) => {
      if (!acc[o.product]) acc[o.product] = { count: 0, revenue: 0 }
      acc[o.product].count += 1
      acc[o.product].revenue += o.amount
      return acc
    }, {})
    return Object.entries(productStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
  }, [orders])

  // Category Insights
  const categoryStats = useMemo(() => {
    const stats = orders.reduce((acc, o) => {
      // Try to find category from product list, default to 'Uncategorized' if missing
      const product = products.find(p => p.name === o.product)
      const cat = product?.category || 'Uncategorized'
      if (!acc[cat]) acc[cat] = 0
      acc[cat] += o.amount
      return acc
    }, {})
    return Object.entries(stats).sort((a, b) => b[1] - a[1])
  }, [orders, products])
  
  const totalCategoryRevenue = categoryStats.reduce((s, [, rev]) => s + rev, 0)

  // Dynamic Revenue Chart (Parsing 'MMM DD, YYYY')
  const revenueByMonth = useMemo(() => {
    const revMap = {}
    orders.forEach(o => {
      // Basic date parse assuming standard US format string or 'x days ago'
      let date = new Date(o.date)
      if (isNaN(date.getTime())) date = new Date() // Fallback to now if unparseable 'days ago'
      const key = `${date.getFullYear()}-${date.getMonth()}`
      revMap[key] = (revMap[key] || 0) + o.amount
    })
    // Sort keys and take last 12
    const sortedKeys = Object.keys(revMap).sort((a,b) => {
      const [y1,m1] = a.split('-')
      const [y2,m2] = b.split('-')
      return new Date(y1,m1) - new Date(y2,m2)
    }).slice(-12)
    
    return sortedKeys.map(k => {
      const d = new Date(k.split('-')[0], k.split('-')[1])
      return { month: d.toLocaleString('default', { month: 'short' }), revenue: revMap[k] }
    })
  }, [orders])

  const maxMonthRev = Math.max(...revenueByMonth.map(m => m.revenue), 1)
  const bars = revenueByMonth.map(m => (m.revenue / maxMonthRev) * 100)
  const months = revenueByMonth.map(m => m.month)
  const forecastBars = bars.length > 2 ? [(bars[bars.length-1] + bars[bars.length-2])/2, (bars[bars.length-1] * 1.1), (bars[bars.length-1] * 1.15)] : [50, 60, 70]

  // Dynamic Performance Alerts
  const alerts = useMemo(() => {
    const list = []
    const lowStock = products.filter(p => p.inventoryCount < 10 && p.inventoryCount > 0)
    const outOfStock = products.filter(p => p.inventoryCount === 0)
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length
    const cancelRate = orders.length ? cancelledOrders / orders.length : 0

    if (outOfStock.length > 0) list.push({ type: 'error', text: `${outOfStock.length} product(s) are completely out of stock.` })
    if (lowStock.length > 0) list.push({ type: 'warning', text: `Inventory low on ${lowStock.length} product(s).` })
    if (cancelRate > 0.1) list.push({ type: 'warning', text: `High cancellation rate detected (${(cancelRate*100).toFixed(1)}%).` })
    if (list.length === 0) list.push({ type: 'success', text: 'All systems operating within healthy parameters.' })
    return list
  }, [products, orders])

  // Dynamic Health Score
  const healthScore = useMemo(() => {
    let score = 100
    const cancelRate = orders.length ? orders.filter(o => o.status === 'Cancelled').length / orders.length : 0
    score -= (cancelRate * 100)
    const outOfStock = products.filter(p => p.inventoryCount === 0).length
    score -= (outOfStock * 2)
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [orders, products])

  const conversionRate = 3.2 // Simulated based on external session traffic not stored in db

  return (
    <div className="space-y-6">
      
      {/* Date Range Picker */}
      <div className="bg-white border border-outline-variant/30 p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Analytics Dashboard</h2>
        <div className="flex flex-wrap items-center gap-2">
          {['7D', '30D', '90D', 'YTD', 'CUSTOM'].map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border transition-colors ${
                dateRange === range ? 'bg-primary text-white border-primary' : 'bg-white text-on-surface-variant border-outline-variant/50 hover:border-primary'
              }`}
            >
              {range}
            </button>
          ))}
          {dateRange === 'CUSTOM' && (
            <div className="flex items-center gap-2 ml-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="border border-outline-variant/50 px-2 py-1 text-xs" />
              <span className="text-xs text-on-surface-variant">to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="border border-outline-variant/50 px-2 py-1 text-xs" />
            </div>
          )}
        </div>
      </div>

      {/* ROW 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="payments" label="Total Revenue" value={`$${total.toLocaleString()}`} change={12.5} color="bg-emerald-500" />
        <StatCard icon="shopping_cart" label="Avg Order Value" value={`$${avgOrder}`} change={4.2} color="bg-blue-500" />
        <StatCard icon="receipt_long" label="Total Orders" value={orders.length} change={-2.1} color="bg-violet-500" />
        <StatCard icon="percent" label="Conversion Rate" value={`${conversionRate}%`} change={0.8} color="bg-amber-500" />
      </div>

      {/* ROW 2: Revenue Intelligence & Forecasting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-outline-variant/30 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Revenue Forecast</h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary" /> Actual</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary/30" /> Forecast</div>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {[...bars, ...forecastBars].map((h, i) => {
              const isForecast = i >= bars.length
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h > 100 ? 100 : h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                    className={`w-full ${isForecast ? 'bg-primary/30 border-2 border-dashed border-primary/50' : 'bg-primary'} hover:bg-secondary transition-colors cursor-pointer relative group`}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      ${Math.round((h / 100) * maxMonthRev)}
                    </div>
                  </motion.div>
                  <span className="text-[9px] text-on-surface-variant font-semibold uppercase">{months[i] || 'Next'}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 p-6 flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Revenue Intelligence</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-variant stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <motion.path 
                  className={`${healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'} stroke-current`} 
                  strokeWidth="3" 
                  strokeDasharray={`${healthScore}, 100`} 
                  fill="none" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${healthScore}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-primary">{healthScore}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Business Health</p>
              <p className="text-sm font-semibold text-emerald-600">Excellent Status</p>
              <p className="text-xs text-on-surface-variant mt-1">Metrics are trending positively across all major segments.</p>
            </div>
          </div>

          <div className="flex-1 bg-[#f8f9fc] border border-[#e2e8f0] p-4 flex gap-3 items-start">
            <div className="bg-blue-100 text-blue-600 p-1.5 shrink-0 rounded">
              <span className="material-symbols-outlined text-sm">psychology</span>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">AI Recommendation</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Outerwear accounts for a significant portion of recent revenue but has low ad spend. Consider reallocating 15% of marketing budget to Outerwear to maximize ROI next quarter.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Deep-Dive Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Top Products by Revenue</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No product data available.</p>
          ) : (
            <div className="space-y-5">
              {topProducts.map(([name, stats], i) => (
                <div key={name}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-semibold text-sm text-primary truncate max-w-[240px]">{name}</span>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600 block leading-none">${stats.revenue.toLocaleString()}</span>
                      <span className="text-[10px] text-on-surface-variant font-semibold">{stats.count} orders</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.revenue / (topProducts[0]?.[1]?.revenue || 1)) * 100}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Category Insights</h3>
          {categoryStats.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No category data available.</p>
          ) : (
            <div className="space-y-5">
              {categoryStats.map(([cat, rev], i) => (
                <div key={cat}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-semibold text-sm uppercase tracking-widest text-primary truncate">{cat}</span>
                    <div className="text-right">
                      <span className="font-bold text-primary block leading-none">${rev.toLocaleString()}</span>
                      <span className="text-[10px] text-on-surface-variant font-semibold">{Math.round((rev/(totalCategoryRevenue || 1))*100)}% of total</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(rev / (categoryStats[0]?.[1] || 1)) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                      className="h-full bg-violet-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ROW 4: Operations & Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Goal Tracking</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Monthly Revenue</span>
                <span>$45k / $50k</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '90%' }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>New Customers</span>
                <span>120 / 200</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} className="h-full bg-blue-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Return Rate (Keep below 5%)</span>
                <span>3.2%</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '3.2%' }} className="h-full bg-amber-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
            Performance Alerts <span className={`text-white text-[10px] px-1.5 py-0.5 rounded-full ${alerts.some(a => a.type === 'error') ? 'bg-red-500' : alerts.some(a => a.type === 'warning') ? 'bg-amber-500' : 'bg-emerald-500'}`}>{alerts.length}</span>
          </h3>
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div key={i} className={`p-3 border-l-4 text-xs font-semibold ${
                alert.type === 'error' ? 'border-red-500 bg-red-50 text-red-700' :
                alert.type === 'warning' ? 'border-amber-500 bg-amber-50 text-amber-700' :
                'border-emerald-500 bg-emerald-50 text-emerald-700'
              }`}>
                {alert.text}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Activity Feed</h3>
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-0.5">{act.time}</p>
                  <p className="text-sm font-semibold text-primary leading-snug">{act.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
