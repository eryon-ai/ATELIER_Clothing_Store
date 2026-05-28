import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCTS } from '../mock/products'
import { formatPrice } from '../utils'

// ── Zustand store for admin state ────────────────────────────────────
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAdminStore = create(persist(
  (set, get) => ({
    products: PRODUCTS.slice(0, 30),
    orders: generateOrders(),
    stats: {
      revenue: 284750,
      orders: 1247,
      customers: 8934,
      conversion: 3.2,
    },
    addProduct: (product) => set(s => ({ products: [product, ...s.products] })),
    updateProduct: (id, updates) => set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, ...updates } : p)
    })),
    deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),
    toggleStock: (id) => set(s => ({
      products: s.products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p)
    })),
  }),
  { name: 'atelier-admin' }
))

function generateOrders() {
  const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled']
  const names = ['Alex Chen', 'Jordan Kim', 'Sam Rivera', 'Morgan Lee', 'Casey Park', 'Taylor Swift', 'Riley Brooks', 'Drew Patel', 'Quinn Walker', 'Avery Stone']
  return Array.from({ length: 24 }, (_, i) => ({
    id: `ATL-${String(10482 + i).padStart(5, '0')}`,
    customer: names[i % names.length],
    email: `user${i + 1}@example.com`,
    product: PRODUCTS[i % PRODUCTS.length]?.name || 'Metropolis Parka',
    amount: Math.floor(Math.random() * 1200) + 150,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    date: new Date(Date.now() - Math.random() * 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    items: Math.floor(Math.random() * 3) + 1,
  }))
}

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: 'dashboard', label: 'Overview' },
  { id: 'products', icon: 'inventory_2', label: 'Products' },
  { id: 'orders', icon: 'receipt_long', label: 'Orders' },
  { id: 'customers', icon: 'group', label: 'Customers' },
  { id: 'analytics', icon: 'bar_chart', label: 'Analytics' },
  { id: 'settings', icon: 'settings', label: 'Settings' },
]

const STATUS_COLORS = {
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-amber-100 text-amber-700',
  Delivered: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
}

// ── Sub-views ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, change, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-outline-variant/30 p-6 relative overflow-hidden group hover:shadow-lg transition-shadow"
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

function Overview({ stats, orders }) {
  const recentOrders = orders.slice(0, 6)
  const delivered = orders.filter(o => o.status === 'Delivered').length
  const processing = orders.filter(o => o.status === 'Processing').length

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
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
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

function Products() {
  const { products, deleteProduct, toggleStock, updateProduct } = useAdminStore()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [editId, setEditId] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [sortBy, setSortBy] = useState('name')

  const cats = ['all', ...new Set(products.map(p => p.category))]
  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (catFilter === 'all' || p.category === catFilter) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [products, search, catFilter, sortBy])

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 bg-white text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="name">Sort: Name</option>
          <option value="price-asc">Sort: Price ↑</option>
          <option value="price-desc">Sort: Price ↓</option>
          <option value="rating">Sort: Rating</option>
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-on-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Product
        </button>
      </div>

      <p className="text-xs text-on-surface-variant mb-4">{filtered.length} products</p>

      {/* Table */}
      <div className="bg-white border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant w-12">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Stock</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-surface-container-lowest/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-on-surface-variant">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-surface-container overflow-hidden flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-primary leading-tight">{p.name}</p>
                          <p className="text-xs text-on-surface-variant">{p.reviewCount} reviews</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-semibold uppercase tracking-wider bg-surface-container px-2 py-1">{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editId === p.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="w-20 border border-primary px-2 py-1 text-sm focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => { updateProduct(p.id, { price: Number(editPrice) }); setEditId(null) }}
                            className="material-symbols-outlined text-emerald-600 text-lg hover:opacity-70"
                          >check</button>
                          <button
                            onClick={() => setEditId(null)}
                            className="material-symbols-outlined text-red-500 text-lg hover:opacity-70"
                          >close</button>
                        </div>
                      ) : (
                        <span
                          className="font-bold text-primary cursor-pointer hover:text-secondary transition-colors"
                          onClick={() => { setEditId(p.id); setEditPrice(p.price) }}
                        >
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="text-sm font-semibold">{Number(p.rating).toFixed(1)}</span>
                        <span className="text-xs text-on-surface-variant">({p.reviewCount})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStock(p.id)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full transition-all ${p.inStock ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        {p.inStock ? 'In Stock' : 'Out'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${p.slug}`}
                          target="_blank"
                          className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg"
                          title="View"
                        >
                          open_in_new
                        </Link>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="material-symbols-outlined text-on-surface-variant hover:text-red-500 transition-colors text-lg"
                          title="Delete"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddProductModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AddProductModal({ onClose }) {
  const addProduct = useAdminStore(s => s.addProduct)
  const [form, setForm] = useState({
    name: '', category: 'outerwear', price: '', description: '', collection: 'premium',
  })

  const handleAdd = () => {
    if (!form.name || !form.price) return
    addProduct({
      id: Date.now(),
      slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      name: form.name,
      category: form.category,
      collection: form.collection,
      price: Number(form.price),
      comparePrice: null,
      discount: null,
      images: ['/images/outerwear.png'],
      colors: [{ name: 'Black', value: '#000000' }],
      sizes: ['S', 'M', 'L', 'XL'],
      description: form.description || 'Premium streetwear item.',
      features: [],
      rating: 5.0,
      reviewCount: 0,
      isNew: true,
      isLimited: false,
      inStock: true,
      badge: 'NEW',
      tags: [form.category],
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white w-full max-w-md p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg uppercase tracking-widest text-primary">Add Product</h2>
          <button onClick={onClose} className="material-symbols-outlined text-outline hover:text-primary">close</button>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Product Name', key: 'name', type: 'text', required: true },
            { label: 'Price ($)', key: 'price', type: 'number', required: true },
            { label: 'Description', key: 'description', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
            >
              {['outerwear', 'knitwear', 'footwear', 'accessories', 'bottoms', 'tops', 'activewear', 'sneakers'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 border border-outline-variant py-2.5 text-xs font-semibold uppercase tracking-widest hover:border-primary transition-colors">Cancel</button>
          <button onClick={handleAdd} className="flex-1 bg-primary text-on-primary py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors">Add Product</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Orders({ orders }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = orders.filter(o =>
    (statusFilter === 'all' || o.status === statusFilter) &&
    (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  )

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
          <option value="all">All Status</option>
          {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                {['Order ID', 'Customer', 'Product', 'Items', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-surface-container-lowest/50"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-primary">{o.customer}</p>
                    <p className="text-xs text-on-surface-variant">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant max-w-[180px] truncate">{o.product}</td>
                  <td className="px-4 py-3 text-center font-semibold">{o.items}</td>
                  <td className="px-4 py-3 font-bold text-primary">${o.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{o.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Analytics({ orders }) {
  const total = orders.reduce((s, o) => s + o.amount, 0)
  const avgOrder = Math.round(total / orders.length)
  const topProducts = Object.entries(
    orders.reduce((acc, o) => { acc[o.product] = (acc[o.product] || 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const bars = [65, 80, 55, 90, 70, 85, 95, 60, 75, 88, 72, 92]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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

function Customers({ orders }) {
  const customerData = Object.values(orders.reduce((acc, o) => {
    if (!acc[o.customer]) acc[o.customer] = { name: o.customer, email: o.email, orders: 0, spent: 0, lastOrder: o.date }
    acc[o.customer].orders++
    acc[o.customer].spent += o.amount
    return acc
  }, {})).sort((a, b) => b.spent - a.spent)

  return (
    <div className="bg-white border border-outline-variant/30">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
            <tr>
              {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order', 'Tier'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {customerData.map((c, i) => (
              <motion.tr
                key={c.email}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-surface-container-lowest/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center text-xs font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-primary">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{c.email}</td>
                <td className="px-4 py-3 font-semibold text-center">{c.orders}</td>
                <td className="px-4 py-3 font-bold text-primary">${c.spent.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-on-surface-variant">{c.lastOrder}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    c.spent >= 1000 ? 'bg-amber-100 text-amber-700' : c.spent >= 500 ? 'bg-violet-100 text-violet-700' : 'bg-surface-container text-on-surface-variant'
                  }`}>
                    {c.spent >= 1000 ? 'GOLD' : c.spent >= 500 ? 'SILVER' : 'BRONZE'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Settings() {
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    storeName: 'ATELIER', email: 'admin@atelier.com', currency: 'USD',
    taxRate: '8.5', freeShippingThreshold: '200', lowStockAlert: '5',
    enableReviews: true, enableWishlist: true, maintenanceMode: false,
  })

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Settings saved successfully.
        </motion.div>
      )}

      {[
        {
          title: 'Store Information',
          fields: [
            { label: 'Store Name', key: 'storeName' },
            { label: 'Admin Email', key: 'email', type: 'email' },
            { label: 'Currency', key: 'currency' },
          ]
        },
        {
          title: 'Commerce Settings',
          fields: [
            { label: 'Tax Rate (%)', key: 'taxRate', type: 'number' },
            { label: 'Free Shipping Threshold ($)', key: 'freeShippingThreshold', type: 'number' },
            { label: 'Low Stock Alert Threshold', key: 'lowStockAlert', type: 'number' },
          ]
        }
      ].map(section => (
        <div key={section.title} className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={settings[f.key]}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border border-outline-variant/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Feature Toggles</h3>
        <div className="space-y-4">
          {[
            { key: 'enableReviews', label: 'Enable Product Reviews' },
            { key: 'enableWishlist', label: 'Enable Wishlist' },
            { key: 'maintenanceMode', label: 'Maintenance Mode', danger: true },
          ].map(toggle => (
            <div key={toggle.key} className="flex items-center justify-between">
              <span className={`text-sm font-medium ${toggle.danger ? 'text-red-600' : 'text-primary'}`}>{toggle.label}</span>
              <button
                onClick={() => setSettings(s => ({ ...s, [toggle.key]: !s[toggle.key] }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings[toggle.key] ? (toggle.danger ? 'bg-red-500' : 'bg-primary') : 'bg-outline-variant'}`}
              >
                <motion.div
                  animate={{ x: settings[toggle.key] ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000) }}
        className="bg-primary text-on-primary px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors"
      >
        Save Settings
      </button>
    </div>
  )
}

// ── Main Admin Page ───────────────────────────────────────────────────
export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { products, orders, stats } = useAdminStore()

  const SECTIONS = {
    overview: <Overview stats={stats} orders={orders} />,
    products: <Products />,
    orders: <Orders orders={orders} />,
    customers: <Customers orders={orders} />,
    analytics: <Analytics orders={orders} />,
    settings: <Settings />,
  }

  const active = SIDEBAR_ITEMS.find(s => s.id === activeSection)

  return (
    <div className="min-h-screen bg-surface-container-lowest flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 68 }}
        className="bg-white border-r border-outline-variant/30 flex flex-col sticky top-0 h-screen overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-outline-variant/20">
          <div className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center font-bold text-sm flex-shrink-0">A</div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-bold uppercase tracking-widest text-sm text-primary whitespace-nowrap"
              >
                Admin
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="ml-auto material-symbols-outlined text-outline hover:text-primary transition-colors text-lg flex-shrink-0"
          >
            {sidebarOpen ? 'chevron_left' : 'chevron_right'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all group ${
                activeSection === item.id
                  ? 'bg-primary text-on-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {activeSection === item.id && (
                <motion.div layoutId="activeBar" className="absolute left-0 w-0.5 h-8 bg-white" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-outline-variant/20 px-4 py-4">
          <Link to="/" className={`flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors`}>
            <span className="material-symbols-outlined text-xl flex-shrink-0">storefront</span>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs uppercase tracking-widest whitespace-nowrap">
                  View Store
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-outline-variant/30 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="font-bold uppercase tracking-widest text-primary">{active?.label}</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {activeSection === 'products' && `${products.length} total products`}
              {activeSection === 'orders' && `${orders.length} total orders`}
              {activeSection === 'overview' && 'Welcome back, Admin'}
              {activeSection === 'analytics' && 'Performance insights'}
              {activeSection === 'customers' && 'Customer management'}
              {activeSection === 'settings' && 'Store configuration'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">notifications</button>
            <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-sm">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {SECTIONS[activeSection]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
