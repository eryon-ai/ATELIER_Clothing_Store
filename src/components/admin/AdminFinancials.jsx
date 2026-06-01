import { useAdminStore } from '../../store/useAdminStore'
import { formatPrice } from '../../utils'

export default function AdminFinancials() {
  const { financials } = useAdminStore()

  return (
    <div className="space-y-6">
      {/* Topline Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Gross Revenue (YTD)" value={formatPrice(financials.grossRevenue)} />
        <MetricCard label="Net Revenue" value={formatPrice(financials.netRevenue)} highlight />
        <MetricCard label="Cost of Goods Sold" value={formatPrice(financials.cogs)} />
        <MetricCard label="Est. Tax Collected" value={formatPrice(financials.taxCollected)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* P&L Statement */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/30">
          <div className="p-4 border-b border-outline-variant/30">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Profit & Loss Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <PLRow label="Gross Sales" value={financials.grossRevenue} isPositive />
              <PLRow label="Discounts / Promos" value={-12400} />
              <PLRow label="Refunds & Returns" value={-financials.refunds} />
              <div className="border-t border-outline-variant/50 pt-3 mt-3">
                <PLRow label="Net Sales" value={financials.netRevenue} isBold />
              </div>
              <PLRow label="Cost of Goods Sold (COGS)" value={-financials.cogs} />
              <PLRow label="Shipping Costs" value={-financials.shipping} />
              <PLRow label="Payment Gateway Fees (2.9%)" value={-8250} />
              <div className="border-t-2 border-primary pt-3 mt-3">
                <PLRow label="Gross Profit" value={financials.netRevenue - financials.cogs - financials.shipping - 8250} isBold highlight />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Payouts */}
        <div className="bg-white border border-outline-variant/30">
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Recent Payouts</h2>
            <span className="material-symbols-outlined icon-sm text-on-surface-variant">account_balance</span>
          </div>
          <div className="p-0">
            {financials.payouts.map(po => (
              <div key={po.id} className="p-4 border-b border-outline-variant/30 last:border-0 flex justify-between items-center hover:bg-surface-variant/20 transition-colors">
                <div>
                  <p className="text-sm font-bold text-primary">{formatPrice(po.amount)}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{po.date} &bull; {po.id}</p>
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 ${po.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {po.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
