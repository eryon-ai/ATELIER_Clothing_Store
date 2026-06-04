import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '../../store/useAdminStore'
import { formatPrice } from '../../utils'

export default function AdminFinancials() {
  const [activeTab, setActiveTab] = useState('Overview')

  const tabs = [
    'Overview', 
    'Revenue & Profit', 
    'Expenses & Taxes', 
    'Reconciliation', 
    'Invoices & Forecasting'
  ]

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab 
                ? 'border-primary text-primary bg-white' 
                : 'border-transparent text-on-surface-variant hover:text-primary hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Overview' && <OverviewTab />}
          {activeTab === 'Revenue & Profit' && <RevenueTab />}
          {activeTab === 'Expenses & Taxes' && <ExpensesTab />}
          {activeTab === 'Reconciliation' && <ReconciliationTab />}
          {activeTab === 'Invoices & Forecasting' && <InvoicesTab />}
        </motion.div>
      </AnimatePresence>

    </div>
  )
}

// --- TAB COMPONENTS ---

function OverviewTab() {
  const { financials } = useAdminStore()
  const cashFlows = financials?.cashFlow || []
  const maxCashFlow = Math.max(1, ...cashFlows.flatMap(cf => [cf.in || 0, cf.out || 0]))

  return (
    <div className="space-y-6">
      {/* Topline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Gross Revenue (YTD)" value={formatPrice(financials?.grossRevenue || 0)} />
        <MetricCard label="Net Revenue" value={formatPrice(financials?.netRevenue || 0)} highlight />
        <MetricCard label="Cost of Goods Sold" value={formatPrice(financials?.cogs || 0)} />
        <MetricCard label="Est. Tax Collected" value={formatPrice(financials?.taxCollected || 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Statement */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/30">
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Profit & Loss Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <PLRow label="Gross Sales" value={financials?.grossRevenue || 0} isPositive />
              <PLRow label="Discounts / Promos" value={-(financials?.discounts || 0)} />
              <PLRow label="Refunds & Returns" value={-(financials?.refunds || 0)} />
              <div className="border-t border-outline-variant/50 pt-3 mt-3">
                <PLRow label="Net Sales" value={financials?.netRevenue || 0} isBold />
              </div>
              <PLRow label="Cost of Goods Sold (COGS)" value={-(financials?.cogs || 0)} />
              <PLRow label="Shipping Costs" value={-(financials?.shipping || 0)} />
              <PLRow label="Payment Gateway Fees (2.9%)" value={-(financials?.gatewayFees || 0)} />
              <div className="border-t-2 border-primary pt-3 mt-3">
                <PLRow label="Gross Profit" value={(financials?.netRevenue || 0) - (financials?.cogs || 0) - (financials?.shipping || 0) - (financials?.gatewayFees || 0)} isBold highlight />
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow Summary */}
        <div className="bg-white border border-outline-variant/30 flex flex-col">
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Cash Flow Summary</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-end gap-2">
            <div className="flex items-end gap-2 h-40 border-b border-outline-variant/50 pb-2">
              {cashFlows.map((cf, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group">
                  <div className="w-full bg-emerald-400 relative" style={{ height: `${Math.min(100, ((cf.in || 0) / maxCashFlow) * 100)}%` }}>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black text-white text-[9px] px-1 py-0.5 whitespace-nowrap z-10">
                      In: {formatPrice(cf.in || 0)}
                    </div>
                  </div>
                  <div className="w-full bg-red-400 relative" style={{ height: `${Math.min(100, ((cf.out || 0) / maxCashFlow) * 100)}%` }}>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-black text-white text-[9px] px-1 py-0.5 whitespace-nowrap z-10">
                      Out: {formatPrice(cf.out || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {cashFlows.map((cf, i) => (
                <span key={i} className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant flex-1 text-center">{cf.month}</span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-outline-variant/30">
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400" /><span className="text-[10px] uppercase font-bold text-on-surface-variant">Inflow</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400" /><span className="text-[10px] uppercase font-bold text-on-surface-variant">Outflow</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RevenueTab() {
  const { financials } = useAdminStore()
  const netRev = financials?.netRevenue || 0
  const cogs = financials?.cogs || 0
  const shipping = financials?.shipping || 0
  const gatewayFees = financials?.gatewayFees || 0
  
  const netMargin = netRev !== 0 ? (((netRev - cogs - shipping - gatewayFees) / netRev) * 100).toFixed(1) : '0.0'
  const grossMargin = netRev !== 0 ? (((netRev - cogs) / netRev) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary text-white p-6 col-span-1 flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">Total Net Margin</p>
          <p className="text-4xl font-editorial">
            {netMargin}%
          </p>
          <p className="text-xs mt-4 opacity-80 border-t border-white/20 pt-4">
            Gross Margin: {grossMargin}%
          </p>
        </div>

        <div className="bg-white border border-outline-variant/30 col-span-2">
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Revenue by Channel</h2>
          </div>
          <div className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
                <tr>
                  <th className="p-4">Channel</th>
                  <th className="p-4">Revenue</th>
                  <th className="p-4 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {(financials?.revenueByChannel || []).map((ch, i) => (
                  <tr key={i} className="hover:bg-surface-variant/20">
                    <td className="p-4 font-semibold text-primary">{ch.channel}</td>
                    <td className="p-4 font-mono">{formatPrice(ch.revenue || 0)}</td>
                    <td className="p-4 text-right font-mono text-emerald-600">{ch.percentage}</td>
                  </tr>
                ))}
                {(financials?.revenueByChannel || []).length === 0 && (
                  <tr><td colSpan="3" className="p-8 text-center text-xs text-on-surface-variant italic">No channel data available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

import toast from 'react-hot-toast'

function ExpensesTab() {
  const { financials, addExpense, updateTaxStatus } = useAdminStore()
  const totalExpenses = (financials?.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Operating Expenses</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-red-600">Total: {formatPrice(totalExpenses)}</span>
            <button 
              onClick={() => {
                const vendor = window.prompt('Vendor Name:');
                if(!vendor) return;
                const category = window.prompt('Category:');
                if(!category) return;
                const amount = parseFloat(window.prompt('Amount:'));
                if(isNaN(amount)) return;
                addExpense({ id: `EXP-${Date.now()}`, vendor, category, date: new Date().toLocaleDateString(), amount });
                toast.success('Expense added');
              }}
              className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1.5 hover:bg-secondary"
            >Add Expense</button>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Category / Vendor</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(financials?.expenses || []).map(exp => (
                <tr key={exp.id} className="hover:bg-surface-variant/20">
                  <td className="p-4">
                    <p className="font-semibold text-primary">{exp.category}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">{exp.vendor}</p>
                  </td>
                  <td className="p-4 text-xs text-on-surface-variant">{exp.date}</td>
                  <td className="p-4 text-right font-mono text-red-600 font-semibold">-{formatPrice(exp.amount || 0)}</td>
                </tr>
              ))}
              {(financials?.expenses || []).length === 0 && (
                <tr><td colSpan="3" className="p-8 text-center text-xs text-on-surface-variant italic">No expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Tax Liabilities & Remittance</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Region</th>
                <th className="p-4">Collected</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(financials?.taxReports || []).map((tax, i) => (
                <tr key={i} className="hover:bg-surface-variant/20">
                  <td className="p-4 font-semibold text-primary">{tax.region}</td>
                  <td className="p-4 font-mono text-xs">{formatPrice(tax.collected || 0)}</td>
                  <td className="p-4 text-right">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${tax.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {tax.status}
                    </span>
                    {tax.status !== 'Filed' && (
                      <button 
                        onClick={() => {
                          updateTaxStatus(tax.region, 'Filed')
                          toast.success(`${tax.region} tax marked as Filed`)
                        }}
                        className="ml-2 text-[9px] font-bold uppercase tracking-widest bg-surface-variant text-primary px-2 py-1 hover:bg-primary hover:text-white transition-colors"
                      >Mark Filed</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReconciliationTab() {
  const { financials } = useAdminStore()
  const netRev = financials?.netRevenue || 0
  const pending = financials?.pendingTransit || 0
  const gatewaySettled = netRev - pending

  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant/30">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Payment Gateway Reconciliation</h2>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Stripe & PayPal vs Internal Ledger</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-secondary">
            Sync Gateways
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ledger Balance</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(netRev)}</p>
          </div>
          <div className="border-x border-outline-variant/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Gateway Settled</p>
            <p className="text-2xl font-bold text-emerald-600">{formatPrice(gatewaySettled)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Pending / Transit</p>
            <p className="text-2xl font-bold text-amber-600">{formatPrice(pending)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-outline-variant/30 flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Recent Payouts to Bank</h2>
          </div>
          <div className="p-0">
            {(financials?.payouts || []).map(po => (
              <div key={po.id} className="p-4 border-b border-outline-variant/30 last:border-0 flex justify-between items-center hover:bg-surface-variant/20 transition-colors">
                <div>
                  <p className="text-sm font-bold text-primary">{formatPrice(po.amount || 0)}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{po.date} &bull; {po.id}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 ${po.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {po.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 p-6 flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-4 opacity-80">assignment_return</span>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Issued Refunds</p>
          <p className="text-4xl font-editorial text-primary">{formatPrice(financials?.refunds || 0)}</p>
          <p className="text-xs text-on-surface-variant mt-4 max-w-xs leading-relaxed">
            Refunds represent {financials?.grossRevenue > 0 ? (((financials?.refunds || 0) / financials?.grossRevenue) * 100).toFixed(1) : '0.0'}% of gross revenue. Ensure RMA protocols are followed to minimize return fraud.
          </p>
        </div>
      </div>
    </div>
  )
}

function InvoicesTab() {
  const { financials, addInvoice } = useAdminStore()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Forecasting Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-primary text-white p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">trending_up</span> AI Forecasting
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase opacity-70 mb-1">Projected Q3 Revenue</p>
              <p className="text-2xl font-bold">{formatPrice(financials?.forecasting?.projectedRevenueQ3 || 0)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase opacity-70 mb-1">Estimated Q3 Expenses</p>
              <p className="text-2xl font-bold">{formatPrice(financials?.forecasting?.projectedExpensesQ3 || 0)}</p>
            </div>
            <div className="border-t border-white/20 pt-4">
              <p className="text-[10px] uppercase opacity-70 mb-1">Cash Runway</p>
              <p className="text-lg font-bold text-emerald-300">{financials?.forecasting?.cashRunway || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase opacity-70 mb-1">YoY Growth Target</p>
              <p className="text-lg font-bold">{financials?.forecasting?.yoyGrowthTarget || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Management */}
      <div className="lg:col-span-2 bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Accounts Receivable</h2>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Wholesale & B2B Invoices</p>
          </div>
          <button 
            onClick={() => {
              const client = window.prompt('Client Name:');
              if(!client) return;
              const amount = parseFloat(window.prompt('Invoice Amount:'));
              if(isNaN(amount)) return;
              addInvoice({
                id: `INV-${Date.now()}`,
                client,
                amount,
                dueDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(),
                status: 'Sent'
              });
              toast.success('Invoice created and sent');
            }}
            className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-secondary"
          >
            Create Invoice
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Client</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {(financials?.invoices || []).map(inv => (
                <tr key={inv.id} className="hover:bg-surface-variant/20 cursor-pointer">
                  <td className="p-4 font-mono text-xs font-bold text-primary">{inv.id}</td>
                  <td className="p-4 font-semibold">{inv.client}</td>
                  <td className="p-4 text-xs text-on-surface-variant">{inv.dueDate}</td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-600">{formatPrice(inv.amount || 0)}</td>
                  <td className="p-4 text-center">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      inv.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(financials?.invoices || []).length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-xs text-on-surface-variant italic">No invoices found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// --- UTILITY COMPONENTS ---

function MetricCard({ label, value, highlight }) {
  return (
    <div className={`border p-4 ${highlight ? 'bg-primary border-primary text-white' : 'bg-white border-outline-variant/30 text-primary'}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${highlight ? 'text-white/70' : 'text-on-surface-variant'}`}>{label}</p>
      <p className="text-2xl font-bold tracking-tighter">{value}</p>
    </div>
  )
}

function PLRow({ label, value, isPositive, isBold, highlight }) {
  const formattedValue = formatPrice(Math.abs(value))
  const sign = value < 0 ? '-' : ''
  const colorClass = highlight ? 'text-primary text-lg' : isPositive ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-primary'
  
  return (
    <div className={`flex justify-between items-center ${isBold ? 'font-bold' : 'text-sm'}`}>
      <span className={isBold ? 'text-primary uppercase tracking-widest text-xs' : 'text-on-surface-variant'}>{label}</span>
      <span className={colorClass}>{sign}{formattedValue}</span>
    </div>
  )
}
