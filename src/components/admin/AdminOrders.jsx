import { useState, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '../../store/useAdminStore'
import { ADMIN_STATUS_COLORS } from '../../constants'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

export default function AdminOrders() {
  const { orders, bulkUpdateOrders } = useAdminStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Filtering — memoized so it doesn't recalculate on unrelated re-renders
  const filtered = useMemo(() => orders.filter(o =>
    (statusFilter === 'all' || o.status === statusFilter) &&
    (o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  ), [orders, statusFilter, search])

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedOrders = useMemo(() => filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filtered, currentPage])

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const isAllCurrentPageSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.has(o.id))

  const toggleAll = () => {
    const next = new Set(selectedIds)
    if (isAllCurrentPageSelected) {
      paginatedOrders.forEach(o => next.delete(o.id))
    } else {
      paginatedOrders.forEach(o => next.add(o.id))
    }
    setSelectedIds(next)
  }

  // --- Handlers ---
  const handleExport = useCallback(() => {
    toast.success(`Exporting ${filtered.length} orders to CSV...`)
  }, [filtered.length])

  const handleMoreFilters = () => {
    toast('Advanced filters require backend sync', { icon: '⚙️' })
  }

  const handleBulkPrint = () => {
    window.print()
    setSelectedIds(new Set())
  }

  const handleBulkFulfill = () => {
    bulkUpdateOrders(selectedIds, { 
      status: 'Shipped', 
      carrier: 'FedEx', 
      trackingNumber: `FX${Math.floor(Math.random() * 10000000000)}` 
    })
    toast.success(`${selectedIds.size} orders marked as Shipped`)
    setSelectedIds(new Set())
  }

  const handleBulkCancel = () => {
    if(window.confirm('Are you sure you want to cancel these orders?')) {
      bulkUpdateOrders(selectedIds, { status: 'Cancelled' })
      toast.success(`${selectedIds.size} orders Cancelled`)
      setSelectedIds(new Set())
    }
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input 
            value={search} 
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} 
            placeholder="Search by order ID or customer..." 
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 bg-white text-sm focus:outline-none focus:border-primary" 
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={statusFilter} 
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} 
            className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={handleMoreFilters} className="border border-outline-variant/50 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-primary hover:bg-surface-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined icon-sm">filter_list</span> More Filters
          </button>
          <button onClick={handleExport} className="border border-outline-variant/50 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-widest text-primary hover:bg-surface-variant/30 flex items-center gap-2">
            <span className="material-symbols-outlined icon-sm">download</span> Export
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Floating) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary text-white px-4 py-3 mb-4 flex items-center justify-between shadow-lg"
          >
            <span className="text-sm font-semibold">{selectedIds.size} orders selected</span>
            <div className="flex gap-3">
              <button onClick={handleBulkPrint} className="text-xs font-bold uppercase tracking-widest hover:text-white/70">Print Packing Slips</button>
              <button onClick={handleBulkFulfill} className="text-xs font-bold uppercase tracking-widest hover:text-white/70">Fulfill Orders</button>
              <button onClick={handleBulkCancel} className="text-xs font-bold uppercase tracking-widest text-red-300 hover:text-red-400">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white border border-outline-variant/30 flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={isAllCurrentPageSelected} onChange={toggleAll} className="w-4 h-4 accent-primary" />
                </th>
                {['Order ID', 'Customer', 'Product', 'Items', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedOrders.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-surface-container-lowest/50 cursor-pointer group"
                  onClick={() => setSelectedOrder(o)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.has(o.id)} onChange={(e) => toggleSelect(o.id, e)} className="w-4 h-4 accent-primary" />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary flex items-center gap-2">
                    {o.id}
                    {o.isPriority && <span className="material-symbols-outlined text-amber-500 text-[14px]" title="Priority / VIP">star</span>}
                    {o.fraudRisk === 'High' && <span className="material-symbols-outlined text-red-600 text-[14px]" title="High Fraud Risk">warning</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-primary">{o.customer}</p>
                    <p className="text-xs text-on-surface-variant">{o.email}</p>
                    {o.tags && o.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {o.tags.map(t => <span key={t} className="text-[9px] bg-surface-variant text-on-surface-variant px-1.5 py-0.5 uppercase font-bold">{t}</span>)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant max-w-[180px] truncate">{o.product}</td>
                  <td className="px-4 py-3 text-center font-semibold">{o.items}</td>
                  <td className="px-4 py-3 font-bold text-primary">${o.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ADMIN_STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{o.date}</td>
                </motion.tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-on-surface-variant">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest">
            <span className="text-xs text-on-surface-variant font-semibold">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} orders
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-outline-variant/50 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-variant/30"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-outline-variant/50 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-variant/30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Order Details Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsPanel 
            orderId={selectedOrder.id} 
            onClose={() => setSelectedOrder(null)} 
            STATUS_COLORS={ADMIN_STATUS_COLORS} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function OrderDetailsPanel({ orderId, onClose, STATUS_COLORS }) {
  const { orders, updateOrder, addOrderNote } = useAdminStore()
  const [internalNote, setInternalNote] = useState('')

  // Get fresh order data from store so updates reflect instantly in the slide-out
  const order = orders.find(o => o.id === orderId)

  if (!order) return null

  // --- Actions ---
  const handlePrint = () => window.print()

  const handleReturn = () => {
    updateOrder(order.id, { 
      status: 'Cancelled', // In a real app we'd have a 'Returned' status
      timeline: [...(order.timeline || []), { type: 'return', title: 'Return Initiated', time: 'Just now', user: 'Admin' }]
    })
    toast.success('Return process initiated')
  }

  const handleRefund = () => {
    updateOrder(order.id, {
      timeline: [...(order.timeline || []), { type: 'refund', title: `Refund Issued ($${order.amount})`, time: 'Just now', user: 'Admin' }]
    })
    toast.success(`Refund of $${order.amount} issued`)
  }

  const handleExchange = () => {
    updateOrder(order.id, {
      timeline: [...(order.timeline || []), { type: 'exchange', title: 'Exchange Requested', time: 'Just now', user: 'Admin' }]
    })
    toast.success('Exchange workflow started')
  }

  const handleTrack = () => {
    toast('Opening carrier portal...', { icon: '📦' })
    window.open(`https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`, '_blank')
  }

  const handleAddNote = () => {
    if(!internalNote.trim()) return
    addOrderNote(order.id, internalNote)
    setInternalNote('')
    toast.success('Note added')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-2xl h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-white shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg uppercase tracking-widest text-primary flex items-center gap-2">
                Order {order.id}
                {order.isPriority && <span className="material-symbols-outlined text-amber-500 text-[18px]">star</span>}
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{order.date} • {order.items} items</p>
          </div>
          <button onClick={onClose} className="material-symbols-outlined text-outline hover:text-primary">close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex-1 bg-white border border-outline-variant/50 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:border-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">receipt</span> Print Invoice
            </button>
            <button onClick={handlePrint} className="flex-1 bg-white border border-outline-variant/50 px-3 py-2 text-xs font-bold uppercase tracking-widest hover:border-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">inventory_2</span> Packing Slip
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Customer History Block */}
            <div className="bg-white border border-outline-variant/30 p-4">
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Customer</p>
                {order.isPriority && <span className="text-[9px] bg-amber-100 text-amber-700 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">VIP</span>}
              </div>
              <p className="font-medium text-primary text-sm">{order.customer}</p>
              <p className="text-xs text-on-surface-variant">{order.email}</p>
              <p className="text-xs text-on-surface-variant mt-2">123 Commerce St.<br/>Suite 400<br/>New York, NY 10012</p>
              <div className="mt-4 pt-3 border-t border-outline-variant/30">
                <p className="text-xs text-primary font-semibold">{order.customerHistory?.totalOrders || 1} orders</p>
                <p className="text-xs text-on-surface-variant">LTV: ${order.customerHistory?.lifetimeValue || order.amount}</p>
              </div>
            </div>

            {/* Financials & RMA Block */}
            <div className="bg-white border border-outline-variant/30 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Financials & RMA</p>
                  {order.fraudRisk === 'High' && <span className="text-[9px] bg-red-100 text-red-700 font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">warning</span> High Risk</span>}
                </div>
                <p className="text-sm">Visa ending in •••• 4242</p>
                <p className="text-xs text-emerald-600 font-semibold mb-2">Payment Authorized</p>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={handleReturn} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border border-outline-variant/50 px-3 py-1.5 hover:bg-surface-variant/30 text-left flex items-center justify-between">
                  Process Return <span className="material-symbols-outlined text-[14px]">keyboard_arrow_right</span>
                </button>
                <div className="flex gap-2">
                  <button onClick={handleRefund} className="flex-1 text-[10px] font-bold text-red-600 uppercase tracking-widest border border-red-200 px-3 py-1.5 hover:bg-red-50">
                    Refund
                  </button>
                  <button onClick={handleExchange} className="flex-1 text-[10px] font-bold text-primary uppercase tracking-widest border border-outline-variant/50 px-3 py-1.5 hover:bg-surface-variant/30">
                    Exchange
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment & Shipping Card */}
          {order.trackingNumber && (
            <div className="bg-white border border-outline-variant/30 p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Shipping</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{order.carrier}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Tracking Number</p>
                  <p className="text-sm font-mono font-bold text-primary">{order.trackingNumber}</p>
                </div>
                <button onClick={handleTrack} className="bg-surface-variant/50 hover:bg-surface-variant text-primary px-4 py-2 text-xs font-bold uppercase tracking-widest">
                  Track
                </button>
              </div>
            </div>
          )}

          {/* Timeline & Activity Logs */}
          <div className="bg-white border border-outline-variant/30 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Timeline & Activity Logs</p>
            <div className="space-y-4">
              {order.timeline && order.timeline.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-primary">{event.title}</p>
                    <p className="text-xs text-on-surface-variant">{event.time} • by {event.user}</p>
                    {event.note && (
                      <div className="mt-2 p-3 bg-surface-variant/30 border border-outline-variant/50 text-sm italic text-primary">
                        "{event.note}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Internal Notes Input */}
            <div className="mt-6 pt-4 border-t border-outline-variant/30">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">Internal Notes</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={internalNote}
                  onChange={e => setInternalNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                  placeholder="Leave a note (only visible to staff)..." 
                  className="flex-1 border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <button 
                  onClick={handleAddNote}
                  className="bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary"
                >
                  Post
                </button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )
}

OrderDetailsPanel.propTypes = {
  orderId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  STATUS_COLORS: PropTypes.object.isRequired
}
