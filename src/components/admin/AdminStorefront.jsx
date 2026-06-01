import { useState, useEffect } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import toast from 'react-hot-toast'

export default function AdminStorefront() {
  const { storefront, updateStorefront } = useAdminStore()
  const [heroBanner, setHeroBanner] = useState(storefront)

  useEffect(() => {
    setHeroBanner(storefront)
  }, [storefront])

  const handlePublish = () => {
    updateStorefront(heroBanner)
    toast.success('Homepage updated successfully!')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="bg-white border border-outline-variant/30 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Homepage Hero Banner</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Editor Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Heading Title</label>
              <input 
                value={heroBanner.title} 
                onChange={e => setHeroBanner(s => ({...s, title: e.target.value}))}
                className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none uppercase font-bold" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Subheading</label>
              <textarea 
                rows={2}
                value={heroBanner.subtitle} 
                onChange={e => setHeroBanner(s => ({...s, subtitle: e.target.value}))}
                className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none uppercase" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Text</label>
                <input 
                  value={heroBanner.buttonText} 
                  onChange={e => setHeroBanner(s => ({...s, buttonText: e.target.value}))}
                  className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none uppercase" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Link</label>
                <input 
                  value={heroBanner.buttonLink} 
                  onChange={e => setHeroBanner(s => ({...s, buttonLink: e.target.value}))}
                  className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Background Image URL</label>
              <input 
                value={heroBanner.image} 
                onChange={e => setHeroBanner(s => ({...s, image: e.target.value}))}
                className="w-full border border-outline-variant/50 px-3 py-2.5 text-sm focus:border-primary focus:outline-none font-mono" 
              />
            </div>

            <button 
              onClick={handlePublish}
              className="bg-primary text-on-primary px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors mt-4"
            >
              Publish Changes
            </button>
          </div>

          {/* Live Preview */}
          <div className="border border-outline-variant/30 bg-surface-container-lowest p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Live Preview</p>
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-black flex items-center justify-center p-6 text-center shadow-lg">
              <img src={heroBanner.image} className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="relative z-10 text-white flex flex-col items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">{heroBanner.title}</h2>
                <p className="text-[10px] uppercase tracking-widest opacity-90 max-w-[80%] mb-4 leading-relaxed">{heroBanner.subtitle}</p>
                <button className="bg-white text-black px-4 py-2 text-[8px] font-bold uppercase tracking-widest">
                  {heroBanner.buttonText}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
