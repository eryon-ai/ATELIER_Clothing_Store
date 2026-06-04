import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminStore } from '../../store/useAdminStore'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { StatCard } from './AdminOverview'

const campaignSchema = z.object({
  id: z.string().min(3, 'Code must be at least 3 characters').regex(/^[A-Z0-9]+$/, 'Uppercase letters and numbers only'),
  type: z.enum(['Percentage (%)', 'Fixed Amount ($)', 'Free Shipping', 'Buy X Get Y']),
  value: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type !== 'Free Shipping') {
    const val = Number(data.value)
    if (isNaN(val) || val <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Value must be greater than 0',
        path: ['value']
      })
    }
  }
})

export default function AdminMarketing() {
  const { campaigns, addCampaign, deleteCampaign, marketingStats, omniCampaigns, addOmniCampaign, deleteOmniCampaign, updateOmniCampaign, influencers, abTests } = useAdminStore()
  const [activeTab, setActiveTab] = useState('Email')
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: { id: '', type: 'Percentage (%)', value: '' }
  })
  const selectedType = useWatch({ control, name: 'type' })

  const onSubmit = (data) => {
    const uppercaseId = data.id.toUpperCase()
    
    // Prevent duplicate keys
    if (campaigns.some(c => c.id === uppercaseId)) {
      toast.error('Campaign code already exists!')
      return
    }

    let formattedValue = data.value
    if (data.type === 'Free Shipping') formattedValue = 'Free'
    else if (data.type.includes('Percent')) formattedValue = `${data.value}%`
    else if (data.type.includes('Fixed Amount')) formattedValue = `$${data.value}`

    addCampaign({
      id: uppercaseId,
      type: data.type,
      value: formattedValue,
      uses: 0,
      revenue: 0,
      status: 'Active'
    })
    reset()
    toast.success('Discount code generated successfully!')
  }

  const filteredOmni = omniCampaigns.filter(c => c.channel === activeTab)

  return (
    <div className="space-y-6">
      
      {/* ROW 1: Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="monitoring" label="ROAS" value={`${marketingStats.roas}x`} change={0.4} color="bg-emerald-500" />
        <StatCard icon="person_add" label="CAC" value={`$${marketingStats.cac.toFixed(2)}`} change={-1.20} color="bg-blue-500" />
        <StatCard icon="payments" label="Total Marketing Rev" value={`$${marketingStats.totalRevenue.toLocaleString()}`} change={15.4} color="bg-violet-500" />
        <StatCard icon="campaign" label="Active Campaigns" value={marketingStats.activeCampaigns} color="bg-amber-500" />
      </div>

      {/* ROW 2: Omni-Channel & Conversion Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Omni-Channel Dashboard */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/30 flex flex-col">
          <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest">
            {['Email', 'SMS', 'Push'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'bg-white text-primary border-t-2 border-t-primary' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
              >
                {tab} Campaigns
              </button>
            ))}
          </div>
          <div className="flex justify-between items-center p-4 border-b border-outline-variant/30">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">{activeTab} Campaigns</h3>
            <button 
              onClick={() => {
                const name = window.prompt('Enter campaign name:')
                if (name) {
                  addOmniCampaign({ id: `C${Date.now()}`, name, channel: activeTab, sent: 0, openRate: 0, ctr: 0, revenue: 0, status: 'Scheduled', date: 'TBD' })
                  toast.success('Campaign created!')
                }
              }}
              className="text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-3 py-1.5 hover:bg-secondary transition-colors"
            >
              Create Campaign
            </button>
          </div>
          <div className="flex-1 p-6">
            <table className="w-full text-sm">
              <thead className="border-b border-outline-variant/30">
                <tr>
                  <th className="text-left py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Campaign</th>
                  <th className="text-right py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Sent</th>
                  <th className="text-right py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Open / CTR</th>
                  <th className="text-right py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Revenue</th>
                  <th className="text-right py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="text-right py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredOmni.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-6 text-on-surface-variant text-sm">No campaigns found for {activeTab}.</td></tr>
                ) : (
                  filteredOmni.map(c => (
                    <tr key={c.id} className="hover:bg-surface-container-lowest/50">
                      <td className="py-4">
                        <p className="font-semibold text-primary">{c.name}</p>
                        <p className="text-[10px] text-on-surface-variant">{c.date}</p>
                      </td>
                      <td className="py-4 text-right font-medium">{c.sent.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <span className="font-semibold">{c.openRate}%</span> <span className="text-on-surface-variant">/ {c.ctr}%</span>
                      </td>
                      <td className="py-4 text-right font-bold text-emerald-600">${c.revenue.toLocaleString()}</td>
                      <td className="py-4 text-right">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : c.status === 'Completed' ? 'bg-surface-variant text-on-surface-variant' : 'bg-surface-container text-on-surface-variant'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => {
                            const newStatus = c.status === 'Active' ? 'Completed' : 'Active';
                            updateOmniCampaign(c.id, { status: newStatus })
                            toast.success(`Campaign marked as ${newStatus}`)
                          }} className="text-on-surface-variant hover:text-primary transition-colors p-1" title="Toggle Status">
                            <span className="material-symbols-outlined text-[16px] block">published_with_changes</span>
                          </button>
                          <button onClick={() => {
                            if (window.confirm('Are you sure you want to delete this campaign?')) {
                              deleteOmniCampaign(c.id)
                              toast.success('Campaign deleted')
                            }
                          }} className="text-on-surface-variant hover:text-error transition-colors p-1" title="Delete">
                            <span className="material-symbols-outlined text-[16px] block">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Marketing Attribution */}
        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Marketing Attribution</h3>
          <div className="space-y-5">
            {(() => {
              const attributionData = [
                { source: 'Paid Social', rev: 85000, color: 'bg-violet-500' },
                { source: 'Email', rev: 42000, color: 'bg-blue-500' },
                { source: 'Organic Search', rev: 28000, color: 'bg-emerald-500' },
                { source: 'Direct', rev: 16000, color: 'bg-amber-500' }
              ]
              const totalAttribution = attributionData.reduce((acc, a) => acc + a.rev, 0)
              const maxAttribution = Math.max(...attributionData.map(a => a.rev), 1)

              return attributionData.map((s, i) => (
                <div key={s.source}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-semibold text-sm text-primary">{s.source}</span>
                    <div className="text-right">
                      <span className="font-bold text-primary block leading-none">${s.rev.toLocaleString()}</span>
                      <span className="text-[10px] text-on-surface-variant font-semibold">{Math.round((s.rev/(totalAttribution || 1))*100)}% of total</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.rev / maxAttribution) * 100}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                      className={`h-full ${s.color} rounded-full`}
                    />
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      {/* ROW 3: Discounts & Coupon Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Discount */}
        <div className="lg:col-span-1 bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Create Discount</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Discount Code</label>
              <input 
                {...register('id')}
                placeholder="e.g. FALLSALE" 
                className={`w-full border px-3 py-2.5 text-sm focus:outline-none uppercase font-mono ${errors.id ? 'border-error focus:border-error' : 'border-outline-variant/50 focus:border-primary'}`} 
              />
              {errors.id && <span className="text-[10px] text-error mt-1">{errors.id.message}</span>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Discount Type</label>
              <select 
                {...register('type')}
                className={`w-full border px-3 py-2.5 text-sm focus:outline-none bg-white ${errors.type ? 'border-error focus:border-error' : 'border-outline-variant/50 focus:border-primary'}`}
              >
                <option>Percentage (%)</option>
                <option>Fixed Amount ($)</option>
                <option>Free Shipping</option>
                <option>Buy X Get Y</option>
              </select>
              {errors.type && <span className="text-[10px] text-error mt-1">{errors.type.message}</span>}
            </div>
            {selectedType !== 'Free Shipping' && (
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Discount Value</label>
                <input 
                  type="number" 
                  {...register('value')}
                  placeholder="20" 
                  className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${errors.value ? 'border-error focus:border-error' : 'border-outline-variant/50 focus:border-primary'}`} 
                />
                {errors.value && <span className="text-[10px] text-error mt-1">{errors.value.message}</span>}
              </div>
            )}
            <div className="pt-2 border-t border-outline-variant/30 mt-4">
              <button type="submit" className="w-full bg-primary text-on-primary py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
                Generate Code
              </button>
            </div>
          </form>
        </div>

        {/* Discount Performance */}
        <div className="lg:col-span-2 bg-white border border-outline-variant/30 flex flex-col">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Coupon Performance</h3>
          </div>
          <div className="flex-1 p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-outline-variant/30">
                <tr>
                  <th className="text-left py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Code</th>
                  <th className="text-left py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Type</th>
                  <th className="text-left py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Value</th>
                  <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Uses</th>
                  <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Generated Rev</th>
                  <th className="text-right py-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Status</th>
                  <th className="text-right py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-lowest/50">
                    <td className="py-3 font-mono font-bold text-primary">{c.id}</td>
                    <td className="py-3 text-on-surface-variant">{c.type}</td>
                    <td className="py-3 font-medium text-emerald-700">{c.value}</td>
                    <td className="py-3 text-right font-semibold">{c.uses}</td>
                    <td className="py-3 text-right font-bold text-primary">${(c.revenue || 0).toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => {
                        if (window.confirm('Are you sure you want to delete this campaign?')) {
                          deleteCampaign(c.id)
                        }
                      }} className="text-on-surface-variant hover:text-error transition-colors p-1">
                        <span className="material-symbols-outlined text-[16px] block">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ROW 4: Influencers & A/B Testing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Influencer Tracking */}
        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Top Influencers</h3>
          {influencers.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No active influencers found.</p>
          ) : (
            <div className="space-y-4">
              {influencers.map(inf => (
                <div key={inf.id} className="flex items-center justify-between p-4 border border-outline-variant/30 hover:border-primary transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${inf.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500' : inf.platform === 'TikTok' ? 'bg-black' : 'bg-red-600'}`}>
                      <span className="material-symbols-outlined text-[20px]">{inf.platform === 'Instagram' ? 'photo_camera' : inf.platform === 'TikTok' ? 'music_note' : 'play_arrow'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-primary">{inf.name}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant">CODE: {inf.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">${inf.revenue.toLocaleString()}</p>
                    <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest">{inf.usage} conversions</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* A/B Testing Center */}
        <div className="bg-white border border-outline-variant/30 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">A/B Testing Center</h3>
          {abTests.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No active experiments running.</p>
          ) : (
            <div className="space-y-4">
              {abTests.map(test => (
                <div key={test.id} className="border border-outline-variant/30 p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-sm text-primary">{test.name}</h4>
                      <p className="text-xs text-on-surface-variant">Duration: {test.duration}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${test.status === 'Running' ? 'bg-blue-100 text-blue-700 animate-pulse' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {test.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className={`flex-1 p-3 text-center border ${test.winner === 'Control' ? 'border-emerald-500 bg-emerald-50' : 'border-outline-variant/30'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">A: Control</p>
                      <p className="text-xs font-semibold text-primary truncate mb-1" title={test.control.name}>{test.control.name}</p>
                      <p className={`font-bold ${test.winner === 'Control' ? 'text-emerald-600' : 'text-primary'}`}>{(Number(test.control.cr) || 0).toFixed(1)}% CR</p>
                    </div>
                    <span className="text-xs font-bold text-outline-variant">VS</span>
                    <div className={`flex-1 p-3 text-center border ${test.winner === 'Variant' ? 'border-emerald-500 bg-emerald-50' : 'border-outline-variant/30'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">B: Variant</p>
                      <p className="text-xs font-semibold text-primary truncate mb-1" title={test.variant.name}>{test.variant.name}</p>
                      <p className={`font-bold ${test.winner === 'Variant' ? 'text-emerald-600' : 'text-primary'}`}>{(Number(test.variant.cr) || 0).toFixed(1)}% CR</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
