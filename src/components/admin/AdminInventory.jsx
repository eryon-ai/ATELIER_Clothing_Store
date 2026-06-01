import { useAdminStore } from '../../store/useAdminStore'
import { formatPrice } from '../../utils'

export default function AdminInventory() {
  const { products, toggleStock } = useAdminStore()

  // Mock data for supply chain metrics
  const totalStock = products.reduce((acc, p) => acc + (p.inStock ? 45 : 0), 0)
  const lowStockItems = products.filter(p => !p.inStock).length

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Units in Stock" value={totalStock} />
        <MetricCard label="Low Stock Alerts" value={lowStockItems} alert={lowStockItems > 0} />
        <MetricCard label="Warehouses Active" value="3" />
        <MetricCard label="Next Restock" value="May 15" />
      </div>

      {/* Inventory Table */}
      <div className="bg-white border border-outline-variant/30 overflow-hidden">
        <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Supply Chain Overview</h2>
          <button className="bg-primary text-white px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors">
            Order Stock
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-variant/30 text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                <th className="px-4 py-3 font-semibold">SKU / Product</th>
                <th className="px-4 py-3 font-semibold">Cost per Unit</th>
                <th className="px-4 py-3 font-semibold">Retail Price</th>
                <th className="px-4 py-3 font-semibold">Units Available</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-outline-variant/30 last:border-0 hover:bg-surface-variant/20 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover bg-surface-variant/50" />
                    <div>
                      <p className="text-xs font-bold text-primary">{p.name}</p>
                      <p className="text-[10px] text-on-surface-variant">SKU: {p.slug.toUpperCase().substring(0, 8)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{formatPrice(p.price * 0.35)}</td>
                  <td className="px-4 py-3 text-xs text-primary">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">
                    {p.inStock ? '45' : '0'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 ${p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <button 
                      onClick={() => toggleStock(p.id)}
                      className="text-secondary hover:underline uppercase text-[10px] font-bold tracking-widest"
                    >
                      {p.inStock ? 'Mark Empty' : 'Restock'}
                    </button>
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

function MetricCard({ label, value, alert }) {
  return (
    <div className={`bg-white border p-4 ${alert ? 'border-red-500 bg-red-50' : 'border-outline-variant/30'}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${alert ? 'text-red-700' : 'text-on-surface-variant'}`}>{label}</p>
      <p className={`text-2xl font-bold tracking-tighter ${alert ? 'text-red-700' : 'text-primary'}`}>{value}</p>
    </div>
  )
}
