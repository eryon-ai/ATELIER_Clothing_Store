import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminSettings() {
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
