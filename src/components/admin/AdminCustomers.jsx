import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminStore } from '../../store/useAdminStore'
import toast from 'react-hot-toast'

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(2, 'Location is required'),
  channel: z.string().optional(),
})


const ITEMS_PER_PAGE = 10

const SEGMENT_COLORS = {
  VIP:      'bg-amber-100 text-amber-700',
  Loyal:    'bg-violet-100 text-violet-700',
  'At Risk':'bg-orange-100 text-orange-700',
  New:      'bg-emerald-100 text-emerald-700',
  Lapsed:   'bg-red-100 text-red-700',
}

const RISK_COLORS = {
  Low:    'bg-emerald-500',
  Medium: 'bg-amber-400',
  High:   'bg-red-500',
}

function ScoreBar({ value, color = 'bg-primary' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums w-6 text-right">{value}</span>
    </div>
  )
}
ScoreBar.propTypes = { value: PropTypes.number.isRequired, color: PropTypes.string }

export default function AdminCustomers() {
  const { customers, orders } = useAdminStore()
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [search, setSearch] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('ltv')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingCustomer, setEditingCustomer] = useState(null)

  // BUG 3 FIX: reset page when filters/search change
  const handleSearch = (val) => { setSearch(val); setCurrentPage(1) }
  const handleSegment = (val) => { setSegmentFilter(val); setCurrentPage(1) }
  const handleSort = (val) => { setSortBy(val); setCurrentPage(1) }

  // Merge order history + compute dynamic risk from real signals
  const enriched = useMemo(() => {
    return customers.map(c => {
      const cOrders = orders.filter(o => o.email === c.email || o.customer === c.name)
      const ltv = cOrders.reduce((sum, o) => sum + o.amount, 0)
      const avgOrderValue = cOrders.length > 0 ? Math.round(ltv / cOrders.length) : 0
      const repeatRate = cOrders.length > 1 ? Math.round(((cOrders.length - 1) / cOrders.length) * 100) : 0

      // ── Dynamic Risk Engine ────────────────────────────────────
      // Score starts at 0. Higher = more risk signals detected.
      let riskScore = 0
      const riskReasons = []

      // Signal 1: Low retention score
      if (c.retentionScore < 40) { riskScore += 3; riskReasons.push('Low retention score') }
      else if (c.retentionScore < 60) { riskScore += 1; riskReasons.push('Declining retention') }

      // Signal 2: Low health score
      if (c.healthScore < 35) { riskScore += 3; riskReasons.push('Poor health score') }
      else if (c.healthScore < 55) { riskScore += 1; riskReasons.push('Below-average health') }

      // Signal 3: Has cancelled orders
      const cancelledCount = cOrders.filter(o => o.status === 'Cancelled').length
      if (cancelledCount > 1) { riskScore += 2; riskReasons.push(`${cancelledCount} cancelled orders`) }
      else if (cancelledCount === 1) { riskScore += 1; riskReasons.push('1 cancelled order') }

      // Signal 4: Fraud-flagged orders
      const fraudOrders = cOrders.filter(o => o.fraudRisk === 'High').length
      if (fraudOrders > 0) { riskScore += 3; riskReasons.push(`${fraudOrders} high-fraud order(s)`) }

      // Signal 5: Lapsed or At-Risk segment
      if (c.segment === 'Lapsed') { riskScore += 2; riskReasons.push('Lapsed segment') }
      else if (c.segment === 'At Risk') { riskScore += 1; riskReasons.push('At-risk segment') }

      // Signal 6: Only 1 order ever (no repeat purchase)
      if (cOrders.length === 1) { riskScore += 1; riskReasons.push('No repeat purchases') }

      // Compute flag from cumulative score
      const computedRisk = riskScore >= 5 ? 'High' : riskScore >= 2 ? 'Medium' : 'Low'

      return { ...c, ltv, orderCount: cOrders.length, avgOrderValue, repeatRate, history: cOrders, riskFlag: computedRisk, riskReasons }
    })
  }, [customers, orders])

  const filtered = useMemo(() => {
    let list = enriched.filter(c =>
      (segmentFilter === 'all' || c.segment === segmentFilter) &&
      (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    )
    if (sortBy === 'ltv') list = [...list].sort((a, b) => b.ltv - a.ltv)
    if (sortBy === 'orders') list = [...list].sort((a, b) => b.orderCount - a.orderCount)
    if (sortBy === 'retention') list = [...list].sort((a, b) => b.retentionScore - a.retentionScore)
    if (sortBy === 'health') list = [...list].sort((a, b) => b.healthScore - a.healthScore)
    return list
  }, [enriched, search, segmentFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const pageCustomers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // KPI Calculations
  const kpis = useMemo(() => ({
    total: enriched.length,
    avgLTV: enriched.length > 0 ? Math.round(enriched.reduce((s, c) => s + c.ltv, 0) / enriched.length) : 0,
    highRisk: enriched.filter(c => c.riskFlag === 'High').length,
    vip: enriched.filter(c => c.segment === 'VIP').length,
  }), [enriched])

  const selectedCustomer = useMemo(() => enriched.find(c => c.email === selectedEmail) || null, [enriched, selectedEmail])

  return (
    <div>
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: kpis.total, icon: 'group', color: 'text-primary' },
          { label: 'Avg. Lifetime Value', value: `$${kpis.avgLTV.toLocaleString()}`, icon: 'payments', color: 'text-emerald-600' },
          { label: 'High-Risk Customers', value: kpis.highRisk, icon: 'warning', color: 'text-red-500' },
          { label: 'VIP Customers', value: kpis.vip, icon: 'workspace_premium', color: 'text-amber-500' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-outline-variant/30 p-4 flex items-center gap-4">
            <span className={`material-symbols-outlined text-3xl ${k.color}`}>{k.icon}</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 bg-white text-sm focus:outline-none focus:border-primary" />
        </div>
        <select value={segmentFilter} onChange={e => handleSegment(e.target.value)} className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
          <option value="all">All Segments</option>
          {['VIP', 'Loyal', 'At Risk', 'New', 'Lapsed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => handleSort(e.target.value)} className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
          <option value="ltv">Sort: By LTV</option>
          <option value="orders">Sort: By Orders</option>
          <option value="retention">Sort: By Retention</option>
          <option value="health">Sort: By Health Score</option>
        </select>
        <button onClick={() => setEditingCustomer({})} className="bg-primary text-on-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">add</span>
          Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                {['Customer', 'Segment', 'LTV', 'Orders', 'Health Score', 'Retention', 'Risk', 'Last Order'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <AnimatePresence>
                {pageCustomers.map((c, i) => (
                  <motion.tr key={c.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-surface-container-lowest/50 cursor-pointer group"
                    onClick={() => setSelectedEmail(c.email)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center text-sm font-bold">{c.name.charAt(0)}</div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${RISK_COLORS[c.riskFlag]}`} title={`${c.riskFlag} Risk`} />
                        </div>
                        <div>
                          <p className="font-semibold text-primary leading-tight">{c.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${SEGMENT_COLORS[c.segment] || 'bg-surface-variant text-on-surface-variant'}`}>{c.segment}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">${c.ltv.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-center">{c.orderCount}</td>
                    <td className="px-4 py-3 w-32">
                      <ScoreBar value={c.healthScore} color={c.healthScore > 70 ? 'bg-emerald-500' : c.healthScore > 40 ? 'bg-amber-400' : 'bg-red-500'} />
                    </td>
                    <td className="px-4 py-3 w-32">
                      <ScoreBar value={c.retentionScore} color="bg-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${c.riskFlag === 'High' ? 'bg-red-100 text-red-700' : c.riskFlag === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{c.riskFlag}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{c.history[c.history.length - 1]?.date || '—'}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest">
            <span className="text-xs text-on-surface-variant font-semibold">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} customers
            </span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-outline-variant/50 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-variant/30">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 border border-outline-variant/50 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-variant/30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* CRM Profile Panel */}
      <AnimatePresence>
        {/* BUG 1 FIX: key={customer.email} so panel state resets when switching customers */}
        {selectedCustomer && <CustomerProfilePanel key={selectedCustomer.email} customer={selectedCustomer} onClose={() => setSelectedEmail(null)} onEdit={() => setEditingCustomer(selectedCustomer)} />}
      </AnimatePresence>

      <AnimatePresence>
        {editingCustomer !== null && (
          <CustomerEditorPanel 
            customer={editingCustomer} 
            isNew={!editingCustomer.email}
            onClose={() => setEditingCustomer(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}


// ─── CRM Profile Panel ──────────────────────────────────────────────────────
function CustomerProfilePanel({ customer, onClose, onEdit }) {
  const { addCustomerNote, updateCustomerTags, banCustomer, deleteCustomer, addActivity } = useAdminStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [noteInput, setNoteInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  const tier = customer.ltv >= 2000 ? 'GOLD' : customer.ltv >= 800 ? 'SILVER' : 'BRONZE'

  const handleAddNote = () => {
    if (!noteInput.trim()) return
    addCustomerNote(customer.email, noteInput.trim())
    setNoteInput('')
    toast.success('Note saved!')
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const trimmed = tagInput.trim()
      // BUG 2 & 5 FIX: deduplicate against current live tags
      if (!(customer.tags || []).includes(trimmed)) {
        updateCustomerTags(customer.email, [...(customer.tags || []), trimmed])
      } else {
        toast.error('Tag already exists!')
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    updateCustomerTags(customer.email, (customer.tags || []).filter(t => t !== tag))
  }

  const handleBan = () => {
    // BUG 4 FIX: capture intent BEFORE calling banCustomer so toast is accurate
    const willBan = !customer.banned
    banCustomer(customer.email)
    toast.success(willBan ? 'Customer banned.' : 'Customer unbanned.')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to completely delete this customer? This cannot be undone.')) {
      deleteCustomer(customer.email)
      toast.success('Customer deleted')
      onClose()
    }
  }

  const handleQuickAction = (type) => {
    if (type === 'password') {
      addActivity(`Password reset email sent to ${customer.email}.`)
      toast.success('Password reset email sent!')
    } else if (type === 'email') {
      addActivity(`Marketing email sent to ${customer.email}.`)
      toast.success(`Marketing email sent to ${customer.email}`)
    } else if (type === 'coupon') {
      addActivity(`Coupon LOYAL15 applied to ${customer.email}.`)
      toast.success('Coupon LOYAL15 applied!')
    }
  }

  const getAIInsight = () => {
    const { healthScore, retentionScore, ltv, segment } = customer
    if (segment === 'VIP' && retentionScore > 85) return 'This customer is a top performer. Consider inviting them to an exclusive early-access event or a private sale to deepen brand loyalty.'
    if (segment === 'At Risk' || retentionScore < 45) return 'Retention risk detected. This customer\'s activity has declined significantly. Trigger a targeted win-back campaign with a personalized 15% discount.'
    if (segment === 'Lapsed' && healthScore < 25) return 'Customer has lapsed. Last activity was over 90 days ago. A re-engagement campaign with a compelling offer is recommended before they are permanently lost.'
    if (ltv > 1500 && retentionScore > 70) return 'Strong customer with healthy repeat purchase behavior. Upselling a complementary collection or a loyalty tier upgrade could increase their average order value.'
    return 'This is an emerging customer. Focus on post-purchase follow-up emails and personalized recommendations to build long-term loyalty.'
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'purchases', label: 'Purchase History' },
    { id: 'notes', label: 'Notes & Tags' },
    { id: 'timeline', label: 'Activity Timeline' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex justify-end" onClick={onClose}
    >
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-2xl h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="bg-white border-b border-outline-variant/30 px-6 py-5">
          {customer.banned && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest px-3 py-2 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">block</span> This customer account is banned
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">{customer.name.charAt(0)}</div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${RISK_COLORS[customer.riskFlag]}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-xl text-primary truncate flex items-center gap-2">
                {customer.name}
                <button onClick={onEdit} className="material-symbols-outlined text-[16px] text-outline hover:text-primary transition-colors">edit</button>
              </h2>
              <p className="text-sm text-on-surface-variant">{customer.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${SEGMENT_COLORS[customer.segment]}`}>{customer.segment}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tier === 'GOLD' ? 'bg-amber-100 text-amber-700' : tier === 'SILVER' ? 'bg-violet-100 text-violet-700' : 'bg-surface-variant text-on-surface-variant'}`}>{tier} MEMBER</span>
                <span className="text-[10px] text-on-surface-variant">{customer.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start">
              <button onClick={handleDelete} className="material-symbols-outlined text-outline hover:text-red-500 transition-colors" title="Delete Customer">delete</button>
              <button onClick={onClose} className="material-symbols-outlined text-outline hover:text-primary transition-colors">close</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant/30 bg-white px-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <>
              {/* Scorecard */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Lifetime Value', value: `$${customer.ltv.toLocaleString()}`, color: 'text-emerald-600' },
                  { label: 'Total Orders', value: customer.orderCount },
                  { label: 'Avg. Order Value', value: `$${customer.avgOrderValue.toLocaleString()}` },
                  { label: 'Loyalty Points', value: customer.loyaltyPoints.toLocaleString(), color: 'text-amber-600' },
                  { label: 'Retention Score', value: `${customer.retentionScore}/100` },
                  { label: 'Health Score', value: `${customer.healthScore}/100`, color: customer.healthScore > 70 ? 'text-emerald-600' : customer.healthScore > 40 ? 'text-amber-600' : 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-outline-variant/30 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color || 'text-primary'}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Repeat Purchase Metrics */}
              <div className="bg-white border border-outline-variant/30 p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Repeat Purchase Rate</p>
                  <ScoreBar value={customer.repeatRate} color="bg-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Join Date</p>
                  <p className="text-sm font-semibold">{customer.joinDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Acquisition Channel</p>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-surface-variant text-on-surface-variant px-2 py-0.5">{customer.channel}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Risk Level</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${customer.riskFlag === 'High' ? 'bg-red-100 text-red-700' : customer.riskFlag === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{customer.riskFlag}</span>
                </div>
              </div>

              {/* Risk Reason Breakdown */}
              {customer.riskReasons && customer.riskReasons.length > 0 && (
                <div className={`border p-4 ${customer.riskFlag === 'High' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${customer.riskFlag === 'High' ? 'text-red-700' : 'text-amber-700'}`}>
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Risk Signals Detected ({customer.riskReasons.length})
                  </h4>
                  <ul className="space-y-1">
                    {customer.riskReasons.map((reason, i) => (
                      <li key={i} className={`text-xs flex items-center gap-2 ${customer.riskFlag === 'High' ? 'text-red-700' : 'text-amber-700'}`}>
                        <span className="material-symbols-outlined text-[12px]">arrow_right</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Insight */}
              <div className="bg-[#f8f9fc] border border-[#e2e8f0] p-4 flex gap-4 items-start">
                <div className="bg-blue-100 text-blue-600 p-2 shrink-0 rounded">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">AI CRM Insight</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{getAIInsight()}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white border border-outline-variant/30 p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleQuickAction('password')} className="flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-widest border border-outline-variant/50 py-2.5 hover:bg-surface-variant/30 transition-colors">
                    <span className="material-symbols-outlined text-base">lock_reset</span> Reset Password
                  </button>
                  <button onClick={() => handleQuickAction('email')} className="flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-widest border border-outline-variant/50 py-2.5 hover:bg-surface-variant/30 transition-colors">
                    <span className="material-symbols-outlined text-base">mail</span> Send Email
                  </button>
                  <button onClick={() => handleQuickAction('coupon')} className="flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-widest border border-outline-variant/50 py-2.5 hover:bg-surface-variant/30 transition-colors">
                    <span className="material-symbols-outlined text-base">local_offer</span> Apply Coupon
                  </button>
                  <button onClick={handleBan} className={`flex items-center gap-2 justify-center text-xs font-bold uppercase tracking-widest border py-2.5 transition-colors ${customer.banned ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-red-300 text-red-600 hover:bg-red-50'}`}>
                    <span className="material-symbols-outlined text-base">{customer.banned ? 'check_circle' : 'block'}</span>
                    {customer.banned ? 'Unban Customer' : 'Ban Customer'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── TAB 2: PURCHASE HISTORY ── */}
          {activeTab === 'purchases' && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white border border-outline-variant/30 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">First Order</p>
                  <p className="text-sm font-bold">{customer.history[0]?.date || '—'}</p>
                </div>
                <div className="bg-white border border-outline-variant/30 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Most Recent</p>
                  <p className="text-sm font-bold">{customer.history[customer.history.length - 1]?.date || '—'}</p>
                </div>
                <div className="bg-white border border-outline-variant/30 p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Purchase Frequency</p>
                  <p className="text-sm font-bold">{customer.orderCount > 0 ? `Every ~${Math.ceil(30 / Math.max(customer.orderCount, 1))} days` : '—'}</p>
                </div>
              </div>

              <div className="bg-white border border-outline-variant/30 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
                    <tr>
                      {['Order ID', 'Product', 'Date', 'Amount', 'Status', 'Risk'].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {customer.history.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">No orders found.</td></tr>
                    ) : customer.history.map((o, i) => (
                      <tr key={i} className="hover:bg-surface-container-lowest/50">
                        <td className="px-3 py-2.5 font-mono font-bold text-primary">{o.id}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant max-w-[120px] truncate">{o.product}</td>
                        <td className="px-3 py-2.5 text-on-surface-variant">{o.date}</td>
                        <td className="px-3 py-2.5 font-bold text-emerald-600">${o.amount}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : o.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${o.fraudRisk === 'High' ? 'bg-red-100 text-red-700' : o.fraudRisk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'}`}>{o.fraudRisk}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── TAB 3: NOTES & TAGS ── */}
          {activeTab === 'notes' && (
            <>
              <div className="bg-white border border-outline-variant/30 p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Customer Tags</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(customer.tags || []).map((t, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs bg-surface-variant text-on-surface-variant font-semibold px-2.5 py-1">
                      {t}
                      <button onClick={() => handleRemoveTag(t)} className="material-symbols-outlined text-[11px] hover:text-red-500 transition-colors">close</button>
                    </span>
                  ))}
                  {(customer.tags || []).length === 0 && <p className="text-xs text-on-surface-variant">No tags yet.</p>}
                </div>
                <input type="text" placeholder="Add tag and press Enter..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleAddTag} className="w-full border border-outline-variant/50 px-3 py-2 text-xs focus:outline-none focus:border-primary" />
              </div>

              <div className="bg-white border border-outline-variant/30 p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Internal Notes</h3>
                <div className="space-y-3 mb-4">
                  {(customer.notes || []).map((n, i) => (
                    <div key={i} className="bg-surface-container-lowest border border-outline-variant/30 p-3">
                      <p className="text-sm text-on-surface leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-on-surface-variant mt-2 font-semibold uppercase tracking-widest">{n.author} · {n.date}</p>
                    </div>
                  ))}
                  {(customer.notes || []).length === 0 && <p className="text-xs text-on-surface-variant">No notes yet.</p>}
                </div>
                <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} rows={3} placeholder="Write an internal note about this customer..." className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none mb-2" />
                <button onClick={handleAddNote} className="bg-primary text-on-primary px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">Save Note</button>
              </div>
            </>
          )}

          {/* ── TAB 4: ACTIVITY TIMELINE ── */}
          {activeTab === 'timeline' && (
            <div className="bg-white border border-outline-variant/30 p-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5">Activity Timeline</h3>
              <div className="relative pl-6 border-l-2 border-outline-variant/30 space-y-6">
                {(customer.timeline || []).map((event, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[29px] w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[14px]">{event.icon}</span>
                    </div>
                    <p className="text-sm font-bold text-primary leading-tight">{event.label}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{event.detail}</p>
                    <p className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-widest mt-1">{event.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  )
}

CustomerProfilePanel.propTypes = {
  customer: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

// ─── Customer Editor Panel ──────────────────────────────────────────────────
function CustomerEditorPanel({ customer, isNew, onClose }) {
  const { addCustomer, updateCustomer } = useAdminStore()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name || '',
      email: customer.email || '',
      location: customer.location || '',
      channel: customer.channel || 'Direct',
    }
  })

  const onSubmit = (data) => {
    if (isNew) {
      addCustomer({
        name: data.name,
        email: data.email,
        location: data.location,
        channel: data.channel,
        segment: 'New',
        loyaltyPoints: 0,
        retentionScore: 50,
        healthScore: 50,
        riskFlag: 'Low',
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        tags: [],
        notes: [],
        timeline: [{ type: 'joined', icon: 'person_add', label: 'Account Created', detail: 'Created manually by admin', date: 'Just now' }],
        banned: false
      })
      toast.success('Customer created successfully!')
    } else {
      updateCustomer(customer.email, {
        name: data.name,
        email: data.email,
        location: data.location,
        channel: data.channel
      })
      toast.success('Customer updated successfully!')
    }
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/60 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-md h-full shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-white">
          <h2 className="font-bold text-lg uppercase tracking-widest text-primary">
            {isNew ? 'New Customer' : 'Edit Customer'}
          </h2>
          <button onClick={onClose} className="material-symbols-outlined text-outline hover:text-primary">close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Name</label>
              <input {...register('name')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Email</label>
              <input {...register('email')} disabled={!isNew} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary disabled:opacity-50 disabled:bg-surface-variant" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              {!isNew && <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed after creation.</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Location</label>
              <input {...register('location')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Acquisition Channel</label>
              <select {...register('channel')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="Direct">Direct</option>
                <option value="Organic">Organic</option>
                <option value="Paid">Paid</option>
                <option value="Referral">Referral</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-outline-variant/30 bg-surface-container-lowest">
          <button type="submit" form="customer-form" className="w-full bg-primary text-on-primary py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
            {isNew ? 'Create Customer' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

CustomerEditorPanel.propTypes = {
  customer: PropTypes.object.isRequired,
  isNew: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

