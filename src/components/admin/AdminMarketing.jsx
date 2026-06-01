import { useAdminStore } from '../../store/useAdminStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const campaignSchema = z.object({
  id: z.string().min(3, 'Code must be at least 3 characters').regex(/^[A-Z0-9]+$/, 'Uppercase letters and numbers only'),
  type: z.enum(['Percentage (%)', 'Fixed Amount ($)', 'Free Shipping', 'Buy X Get Y']),
  value: z.coerce.number().min(1, 'Value must be greater than 0'),
})

export default function AdminMarketing() {
  const { campaigns, addCampaign } = useAdminStore()
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: { id: '', type: 'Percentage (%)', value: '' }
  })

  const onSubmit = (data) => {
    addCampaign({
      id: data.id.toUpperCase(),
      type: data.type,
      value: data.type.includes('Percent') ? `${data.value}%` : `$${data.value}`,
      uses: 0,
      status: 'Active'
    })
    reset()
    toast.success('Discount code generated successfully!')
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Discount UI */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-outline-variant/30 p-6">
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

              <div className="pt-2 border-t border-outline-variant/30 mt-4">
                <button type="submit" className="w-full bg-primary text-on-primary py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors">
                  Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Active Campaigns Table */}
        <div className="md:col-span-2">
          <div className="bg-white border border-outline-variant/30 h-full">
            <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Active Campaigns</h3>
            </div>
            
            <table className="w-full text-sm">
              <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Value</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Uses</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-lowest/50">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{c.id}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{c.type}</td>
                    <td className="px-4 py-3 font-medium text-emerald-700">{c.value}</td>
                    <td className="px-4 py-3 text-center font-semibold">{c.uses}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}
