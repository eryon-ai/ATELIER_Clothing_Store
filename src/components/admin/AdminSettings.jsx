import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminStore } from '../../store/useAdminStore'

export default function AdminSettings() {
  const { settings: globalSettings, enterpriseSettings, updateSettings } = useAdminStore()
  const [activeTab, setActiveTab] = useState('General')
  const [saved, setSaved] = useState(false)
  const [localSettings, setLocalSettings] = useState(globalSettings)

  const tabs = [
    { id: 'General', icon: 'settings', label: 'General & Commerce' },
    { id: 'Roles', icon: 'admin_panel_settings', label: 'Roles & Permissions' },
    { id: 'Security', icon: 'security', label: 'Security & Audit' },
    { id: 'Developers', icon: 'code', label: 'Developers' },
    { id: 'Integrations', icon: 'extension', label: 'Integrations' },
    { id: 'Infrastructure', icon: 'dns', label: 'Infrastructure' }
  ]

  const handleSave = () => {
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[80vh]">
      {/* Left Sidebar Navigation */}
      <div className="w-full md:w-64 flex flex-col gap-1 border-r border-outline-variant/30 pr-0 md:pr-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary text-white font-semibold' 
                : 'text-on-surface hover:bg-surface-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span className="uppercase tracking-widest text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl relative">
        <AnimatePresence mode="wait">
          {saved && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 right-0 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm flex items-center gap-2 shadow-sm z-10"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Settings saved successfully.
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 mt-4 md:mt-0"
          >
            {activeTab === 'General' && (
              <GeneralTab 
                localSettings={localSettings} 
                setLocalSettings={setLocalSettings} 
                handleSave={handleSave} 
              />
            )}
            {activeTab === 'Roles' && (
              <RolesTab roles={enterpriseSettings?.roles || []} />
            )}
            {activeTab === 'Security' && (
              <SecurityTab 
                security={enterpriseSettings?.security || {}} 
                auditLogs={enterpriseSettings?.auditLogs || []} 
              />
            )}
            {activeTab === 'Developers' && (
              <DevelopersTab 
                apiKeys={enterpriseSettings?.apiKeys || []} 
                webhooks={enterpriseSettings?.webhooks || []} 
              />
            )}
            {activeTab === 'Integrations' && (
              <IntegrationsTab integrations={enterpriseSettings?.integrations || []} />
            )}
            {activeTab === 'Infrastructure' && (
              <InfrastructureTab 
                billing={enterpriseSettings?.billing || {}} 
                backups={enterpriseSettings?.backups || []} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// --- TAB COMPONENTS ---

function GeneralTab({ localSettings, setLocalSettings, handleSave }) {
  return (
    <div className="space-y-6">
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
                <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={localSettings[f.key]}
                  onChange={e => setLocalSettings(s => ({ ...s, [f.key]: e.target.value }))}
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
              <span className={`text-[10px] font-bold uppercase tracking-widest ${toggle.danger ? 'text-red-600' : 'text-primary'}`}>{toggle.label}</span>
              <button
                onClick={() => setLocalSettings(s => ({ ...s, [toggle.key]: !s[toggle.key] }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${localSettings[toggle.key] ? (toggle.danger ? 'bg-red-500' : 'bg-primary') : 'bg-outline-variant'}`}
              >
                <motion.div
                  animate={{ x: localSettings[toggle.key] ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-primary text-on-primary px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors"
      >
        Save Settings
      </button>
    </div>
  )
}

function RolesTab({ roles }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Role Management</h2>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Define granular access templates</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-secondary">
            Create Role
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Role Name</th>
                <th className="p-4">Permissions</th>
                <th className="p-4 text-center">Active Users</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-surface-variant/20">
                  <td className="p-4 font-semibold text-primary">{role.name}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map(p => (
                        <span key={p} className="text-[9px] font-bold uppercase tracking-widest bg-surface-variant text-on-surface-variant px-2 py-1">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono">{role.users}</td>
                  <td className="p-4 text-right">
                    <button className="text-[10px] uppercase font-bold text-primary hover:underline">Edit</button>
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

function SecurityTab({ security, auditLogs }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Access Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">Enforce 2FA</span>
              <span className="text-[10px] text-on-surface-variant uppercase">Require Two-Factor Auth for all admins</span>
            </div>
            <div className={`relative w-12 h-6 rounded-full transition-colors ${security.enforce2FA ? 'bg-primary' : 'bg-outline-variant'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${security.enforce2FA ? 'translate-x-6' : 'translate-x-[2px]'}`} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">Session Timeout (Minutes)</label>
            <input type="number" defaultValue={security.sessionTimeout} className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:outline-none focus:border-primary max-w-xs" />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant block mb-1">Allowed IPs (CIDR)</label>
            <input type="text" defaultValue={security.allowedIPs} className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:outline-none focus:border-primary max-w-xs font-mono" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Audit Logs (Activity Monitoring)</h2>
          <p className="text-[10px] text-on-surface-variant uppercase mt-1">Immutable ledger of administrative actions</p>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-variant/20">
                  <td className="p-4 text-[10px] text-on-surface-variant uppercase tracking-widest whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-4 font-semibold text-primary">{log.user}</td>
                  <td className="p-4 text-xs">{log.action}</td>
                  <td className="p-4 text-right font-mono text-[10px] text-on-surface-variant">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DevelopersTab({ apiKeys, webhooks }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">API Keys</h2>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Manage headless authentication</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-secondary">
            Generate Key
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Token (Masked)</th>
                <th className="p-4">Permissions</th>
                <th className="p-4 text-right">Last Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {apiKeys.map(key => (
                <tr key={key.id} className="hover:bg-surface-variant/20">
                  <td className="p-4 font-semibold text-primary">{key.name}</td>
                  <td className="p-4 font-mono text-xs">{key.token}</td>
                  <td className="p-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-surface-variant px-2 py-1">{key.permissions}</span>
                  </td>
                  <td className="p-4 text-right text-[10px] uppercase text-on-surface-variant">{key.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Webhooks</h2>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Real-time event streams</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-secondary">
            Add Webhook
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Endpoint URL</th>
                <th className="p-4">Events</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Delivery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {webhooks.map(wh => (
                <tr key={wh.id} className="hover:bg-surface-variant/20">
                  <td className="p-4 font-mono text-[10px] text-primary break-all max-w-[200px]">{wh.url}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {wh.events.map(e => (
                        <span key={e} className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{e}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-100 text-emerald-700">{wh.status}</span>
                  </td>
                  <td className="p-4 text-right font-mono text-emerald-600 font-bold">{wh.successRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function IntegrationsTab({ integrations }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map(int => (
          <div key={int.id} className="bg-white border border-outline-variant/30 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-semibold text-primary">{int.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{int.category}</span>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 ${int.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-variant text-on-surface-variant'}`}>
                {int.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-outline-variant/30 pt-4 mt-auto">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                {int.connected ? `Last Sync: ${int.lastSync}` : 'Requires Setup'}
              </span>
              <button className={`text-[10px] font-bold uppercase tracking-widest ${int.connected ? 'text-red-600 hover:underline' : 'bg-primary text-white px-3 py-1.5'}`}>
                {int.connected ? 'Revoke' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfrastructureTab({ billing, backups }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-outline-variant/30 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Active Plan</h3>
            <p className="text-2xl font-bold text-primary mb-1">{billing.platformTier}</p>
            <p className="text-sm text-on-surface-variant">${billing.monthlyCost?.toFixed(2)} / month</p>
          </div>
          <div className="mt-8 border-t border-outline-variant/30 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Payment Method</p>
            <p className="text-sm font-mono mt-1">{billing.paymentMethod}</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant/30 flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary">Billing History</h3>
          </div>
          <div className="p-0 overflow-y-auto max-h-[200px]">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-outline-variant/20">
                {(billing.invoices || []).map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-variant/20">
                    <td className="p-4 text-xs text-on-surface-variant">{inv.date}</td>
                    <td className="p-4 font-mono text-right">${inv.amount?.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1">{inv.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-outline-variant/30 flex flex-col">
        <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary">Database Backups</h2>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1">Automated daily snapshots</p>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-4 py-2 hover:bg-secondary">
            Manual Backup
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-variant/20 border-b border-outline-variant/30 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant text-left">
              <tr>
                <th className="p-4">Snapshot ID</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Size</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {backups.map(bk => (
                <tr key={bk.id} className="hover:bg-surface-variant/20">
                  <td className="p-4 font-mono text-primary text-xs font-bold">{bk.id}</td>
                  <td className="p-4 text-xs text-on-surface-variant">{bk.date}</td>
                  <td className="p-4 font-mono text-xs">{bk.size}</td>
                  <td className="p-4 text-right">
                    <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-1">{bk.status}</span>
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
