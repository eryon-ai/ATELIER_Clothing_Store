import { useState } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import { formatPrice } from '../../utils'
import toast from 'react-hot-toast'

export default function AdminInventory() {
  const { products, toggleStock, warehouses, suppliers, purchaseOrders, inventoryLogs, addActivity, addInventoryLog, addPurchaseOrder, transferStock, updatePOStatus } = useAdminStore()
  const [activeTab, setActiveTab] = useState('Inventory Control')
  
  // Pagination State
  const [page, setPage] = useState(1)
  const itemsPerPage = 15

  // Transfer Form State
  const [transferForm, setTransferForm] = useState({
    fromLocation: warehouses[0]?.name || '',
    toLocation: 'NYC Retail Flagship',
    sku: '',
    quantity: 50
  })

  // Derived metrics for Inventory Control
  // We use `p.inventoryCount` from the mock data. Cost is 35% of retail price.
  const enrichedProducts = products.map(p => {
    const cost = p.price * 0.35
    const stock = p.inStock ? (p.inventoryCount ?? 45) : 0
    const valuation = cost * stock
    // 30d velocity mock = revenueYTD / price / 6 (rough proxy for monthly sales)
    const velocity = Math.max(0, Math.floor((p.analytics.revenueYTD / p.price) / 6))
    const runOutDays = velocity > 0 ? Math.floor(stock / (velocity / 30)) : 999
    
    let tag = 'Normal'
    if (!p.inStock) tag = 'Out of Stock'
    else if (stock < 15 && velocity > 5) tag = 'Low Stock'
    else if (velocity === 0 && stock > 0) tag = 'Dead Stock'
    else if (velocity > 30) tag = 'Fast Moving'

    return { ...p, cost, stock, valuation, velocity, runOutDays, tag }
  })

  const totalValuation = enrichedProducts.reduce((acc, p) => acc + p.valuation, 0)
  const totalStock = enrichedProducts.reduce((acc, p) => acc + p.stock, 0)
  const deadStockItems = enrichedProducts.filter(p => p.tag === 'Dead Stock').length
  const lowStockItems = enrichedProducts.filter(p => p.tag === 'Low Stock' || p.tag === 'Out of Stock').length

  const TABS = ['Inventory Control', 'Warehouses & Transfers', 'Suppliers & POs', 'Audit Logs']

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Enterprise Inventory</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Global supply chain and warehouse control</p>
        </div>
      </div>

      <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest overflow-x-auto">
        {TABS.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: Inventory Control */}
      {activeTab === 'Inventory Control' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Network Valuation" value={formatPrice(totalValuation)} />
            <MetricCard label="Total Units in Stock" value={totalStock.toLocaleString()} />
            <MetricCard label="Low Stock / Empty" value={lowStockItems} alert={lowStockItems > 0} />
            <MetricCard label="Dead Stock SKUs" value={deadStockItems} alert={deadStockItems > 0} />
          </div>

          <div className="bg-white border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Global Inventory Levels</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-surface-variant/30 text-[10px] uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30">
                    <th className="px-4 py-3 font-semibold">Product & SKU</th>
                    <th className="px-4 py-3 font-semibold text-right">Cost</th>
                    <th className="px-4 py-3 font-semibold text-right">Valuation</th>
                    <th className="px-4 py-3 font-semibold text-right">In Stock</th>
                    <th className="px-4 py-3 font-semibold text-right">30d Velocity</th>
                    <th className="px-4 py-3 font-semibold text-right">Forecast (Run Out)</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {enrichedProducts.slice((page - 1) * itemsPerPage, page * itemsPerPage).map(p => (
                    <tr key={p.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover bg-surface-variant/50" />
                        <div>
                          <p className="text-xs font-bold text-primary">{p.name}</p>
                          <p className="text-[10px] text-on-surface-variant uppercase">{p.slug.substring(0, 8)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant text-right">{formatPrice(p.cost)}</td>
                      <td className="px-4 py-3 text-xs font-medium text-primary text-right">{formatPrice(p.valuation)}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{p.stock}</td>
                      <td className="px-4 py-3 text-xs text-right font-mono">{p.velocity} / mo</td>
                      <td className="px-4 py-3 text-xs text-right text-on-surface-variant">
                        {p.runOutDays === 999 ? '∞' : p.runOutDays <= 14 ? <span className="text-red-600 font-bold">{p.runOutDays} days</span> : `${p.runOutDays} days`}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          p.tag === 'Dead Stock' ? 'bg-zinc-100 text-zinc-700' :
                          p.tag === 'Fast Moving' ? 'bg-purple-100 text-purple-700' :
                          p.tag === 'Low Stock' || p.tag === 'Out of Stock' ? 'bg-red-100 text-red-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {p.tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                         <button 
                          onClick={() => toggleStock(p.id)}
                          className="text-secondary hover:underline uppercase text-[10px] font-bold tracking-widest"
                        >
                          {p.inStock ? 'Zero' : 'Restock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, enrichedProducts.length)} of {enrichedProducts.length}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-outline-variant/50 disabled:opacity-50 hover:bg-surface-variant/20"
                >Prev</button>
                <button 
                  onClick={() => setPage(p => Math.min(Math.ceil(enrichedProducts.length / itemsPerPage), p + 1))}
                  disabled={page >= Math.ceil(enrichedProducts.length / itemsPerPage)}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-outline-variant/50 disabled:opacity-50 hover:bg-surface-variant/20"
                >Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Warehouses & Transfers */}
      {activeTab === 'Warehouses & Transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-outline-variant/30">
              <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Network Locations</h3>
                <button 
                  onClick={() => alert('Add Location functionality requires an Enterprise Tier upgrade.')}
                  className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary"
                >Add Location</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[10px] uppercase tracking-widest text-on-surface-variant">
                    <th className="px-4 py-3">Warehouse / Store</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Capacity Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {warehouses.map(w => (
                    <tr key={w.id} className="hover:bg-surface-variant/20">
                      <td className="px-4 py-4">
                        <p className="font-bold text-primary">{w.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase">{w.type}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-on-surface-variant">{w.location}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs font-medium">{w.capacity}</span>
                          <div className="w-16 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                            <div className={`h-full ${parseInt(w.capacity) > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: w.capacity }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white border border-outline-variant/30 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Stock Transfer</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">From Location</label>
                  <select 
                    value={transferForm.fromLocation}
                    onChange={(e) => setTransferForm(s => ({ ...s, fromLocation: e.target.value }))}
                    className="w-full border border-outline-variant/50 p-2 text-xs focus:outline-none focus:border-primary"
                  >
                    {warehouses.map(w => <option key={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">To Location</label>
                  <select 
                    value={transferForm.toLocation}
                    onChange={(e) => setTransferForm(s => ({ ...s, toLocation: e.target.value }))}
                    className="w-full border border-outline-variant/50 p-2 text-xs focus:outline-none focus:border-primary"
                  >
                    <option>NYC Retail Flagship</option>
                    {warehouses.map(w => <option key={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">SKU</label>
                  <input 
                    type="text" 
                    placeholder="Enter SKU" 
                    value={transferForm.sku}
                    onChange={(e) => setTransferForm(s => ({ ...s, sku: e.target.value }))}
                    className="w-full border border-outline-variant/50 p-2 text-xs focus:outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Quantity</label>
                  <input 
                    type="number" 
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm(s => ({ ...s, quantity: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-outline-variant/50 p-2 text-xs focus:outline-none focus:border-primary" 
                  />
                </div>
                <button onClick={() => {
                  if (!transferForm.sku) return alert('Please enter a SKU')
                  if (!transferForm.quantity || transferForm.quantity <= 0) return alert('Please enter a valid quantity')
                  transferStock(transferForm.sku, transferForm.fromLocation, transferForm.toLocation, transferForm.quantity)
                  addActivity(`Initiated transfer of ${transferForm.quantity}x ${transferForm.sku}.`)
                  toast.success('Transfer initiated successfully!')
                  setTransferForm({ ...transferForm, sku: '', quantity: 50 })
                }} className="w-full bg-primary text-on-primary py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
                  Initiate Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Suppliers & POs */}
      {activeTab === 'Suppliers & POs' && (
        <div className="space-y-6">
          <div className="bg-white border border-outline-variant/30">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Active Purchase Orders</h3>
              <button 
                onClick={() => {
                  const poId = crypto.randomUUID()
                  addPurchaseOrder({
                    id: poId,
                    supplierId: suppliers[0].id,
                    status: 'Draft',
                    expectedDate: 'TBD',
                    totalValue: 0,
                    items: 0
                  })
                  addInventoryLog({
                    id: crypto.randomUUID(),
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    user: 'Admin',
                    action: 'PO Created',
                    detail: `Drafted new Purchase Order ${poId}`
                  })
                }}
                className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary"
              >Create PO</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Expected Date</th>
                  <th className="px-4 py-3 text-right">Items</th>
                  <th className="px-4 py-3 text-right">Total Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {purchaseOrders.map(po => (
                  <tr key={po.id} className="hover:bg-surface-variant/20">
                    <td className="px-4 py-3 font-mono text-primary text-xs">{po.id}</td>
                    <td className="px-4 py-3 font-medium text-xs">{suppliers.find(s => s.id === po.supplierId)?.name}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{po.expectedDate}</td>
                    <td className="px-4 py-3 text-xs text-right">{po.items}</td>
                    <td className="px-4 py-3 text-xs font-medium text-primary text-right">{formatPrice(po.totalValue)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${po.status === 'In Transit' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'}`}>{po.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => {
                        const newStatus = po.status === 'Draft' ? 'In Transit' : po.status === 'In Transit' ? 'Delivered' : 'Draft';
                        updatePOStatus(po.id, newStatus);
                        toast.success(`PO ${po.id} status updated to ${newStatus}`);
                      }} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Toggle Status">
                        <span className="material-symbols-outlined text-[16px] block">published_with_changes</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white border border-outline-variant/30">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Approved Suppliers</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[10px] uppercase tracking-widest text-on-surface-variant">
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Material Type</th>
                  <th className="px-4 py-3">Avg Lead Time</th>
                  <th className="px-4 py-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-surface-variant/20">
                    <td className="px-4 py-3 font-bold text-primary">{s.name}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant uppercase">{s.type}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{s.leadTime}</td>
                    <td className="px-4 py-3 text-xs text-right font-mono font-medium">{s.rating} / 5.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'Audit Logs' && (
        <div className="bg-white border border-outline-variant/30">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Stock Movement History</h3>
              <p className="text-[10px] text-on-surface-variant mt-0.5">Immutable audit log of all inventory adjustments</p>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-[10px] uppercase tracking-widest text-on-surface-variant">
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {inventoryLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-variant/20">
                  <td className="px-4 py-3 font-mono text-[10px] text-on-surface-variant">{log.id}</td>
                  <td className="px-4 py-3 text-xs">{log.date}</td>
                  <td className="px-4 py-3 text-xs font-medium">{log.user}</td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-full">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
