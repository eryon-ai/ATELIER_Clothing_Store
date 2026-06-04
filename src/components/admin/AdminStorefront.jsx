import { useState } from 'react'
import { useAdminStore } from '../../store/useAdminStore'
import toast from 'react-hot-toast'

export default function AdminStorefront() {
  const { storefront, updateStorefront, storefrontCMS, updateStorefrontCMS, addActivity, products } = useAdminStore()
  const [activeTab, setActiveTab] = useState('Site & Theme')
  
  // Local state for edits
  const [heroBanner, setHeroBanner] = useState(storefront)
  const [cmsState, setCmsState] = useState(storefrontCMS)
  const [previewMode, setPreviewMode] = useState('desktop')

  // Resolve hero for preview — mood overrides main banner
  const previewHero = (cmsState.activeHeroMood
    ? cmsState.heroMoods?.find(m => m.id === cmsState.activeHeroMood)
    : null) || heroBanner

  const handlePublish = () => {
    updateStorefront(heroBanner)
    updateStorefrontCMS(cmsState)
    addActivity('Website storefront and CMS published.')
    toast.success('Website changes published successfully!')
  }

  const handleDiscard = () => {
    if (window.confirm('Discard all unsaved changes?')) {
      setHeroBanner(storefront)
      setCmsState(storefrontCMS)
      toast.error('Changes discarded.')
    }
  }

  const updateCMS = (key, val) => {
    setCmsState(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="space-y-6">
      
      {/* CMS Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Website Management</h2>
          <p className="text-xs text-on-surface-variant font-medium mt-1">Manage themes, navigation, content, and SEO</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDiscard}
            className="text-on-surface-variant hover:text-error px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handlePublish}
            className="bg-primary text-on-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            Publish Site
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-outline-variant/30 bg-surface-container-lowest">
        {['Site & Theme', 'Homepage Sections', 'Content Curations', 'Navigation & SEO'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${activeTab === tab ? 'bg-white text-primary border-t-2 border-t-primary' : 'text-on-surface-variant hover:bg-surface-variant/30'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: Site & Theme */}
      {activeTab === 'Site & Theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Settings) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Announcement Manager */}
            <div className="bg-white border border-outline-variant/30 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Announcement Bar</h3>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={cmsState.announcement.active} onChange={(e) => updateCMS('announcement', { ...cmsState.announcement, active: e.target.checked })} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${cmsState.announcement.active ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${cmsState.announcement.active ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Announcement Text</label>
                  <input 
                    value={cmsState.announcement.text} 
                    onChange={e => updateCMS('announcement', { ...cmsState.announcement, text: e.target.value })}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Link (Optional)</label>
                  <input 
                    value={cmsState.announcement.link} 
                    onChange={e => updateCMS('announcement', { ...cmsState.announcement, link: e.target.value })}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Theme Customization */}
            <div className="bg-white border border-outline-variant/30 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Theme Customization</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Theme Mode</label>
                  <select 
                    value={cmsState.theme.mode} 
                    onChange={e => updateCMS('theme', { ...cmsState.theme, mode: e.target.value })}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white"
                  >
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div className="flex justify-between items-center bg-surface-container-lowest p-3 border border-outline-variant/30">
                  <label className="text-xs font-semibold uppercase text-on-surface-variant">Funky Neon Mode</label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={cmsState.theme.isFunkyMode} onChange={(e) => updateCMS('theme', { ...cmsState.theme, isFunkyMode: e.target.checked })} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${cmsState.theme.isFunkyMode ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${cmsState.theme.isFunkyMode ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Primary Color (Hex)</label>
                  <div className="flex gap-2">
                    <input 
                      type="color" 
                      value={cmsState.theme.primaryColor} 
                      onChange={e => updateCMS('theme', { ...cmsState.theme, primaryColor: e.target.value })}
                      className="h-9 w-9 p-0 border-0" 
                    />
                    <input 
                      value={cmsState.theme.primaryColor} 
                      onChange={e => updateCMS('theme', { ...cmsState.theme, primaryColor: e.target.value })}
                      className="flex-1 border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Typography</label>
                  <select 
                    value={cmsState.theme.font} 
                    onChange={e => updateCMS('theme', { ...cmsState.theme, font: e.target.value })}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white"
                  >
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Helvetica Neue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Homepage Builder (Data inputs) */}
            <div className="bg-white border border-outline-variant/30 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Hero Banner Data</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Heading Title</label>
                  <input 
                    value={heroBanner.title} 
                    onChange={e => setHeroBanner(s => ({...s, title: e.target.value}))}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase font-bold" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Subheading</label>
                  <textarea 
                    rows={2}
                    value={heroBanner.subtitle} 
                    onChange={e => setHeroBanner(s => ({...s, subtitle: e.target.value}))}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Text</label>
                    <input 
                      value={heroBanner.buttonText} 
                      onChange={e => setHeroBanner(s => ({...s, buttonText: e.target.value}))}
                      className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Link</label>
                    <input 
                      value={heroBanner.buttonLink} 
                      onChange={e => setHeroBanner(s => ({...s, buttonLink: e.target.value}))}
                      className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Background Image URL</label>
                  <input 
                    value={heroBanner.image} 
                    onChange={e => setHeroBanner(s => ({...s, image: e.target.value}))}
                    className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Promo Cards Editor */}
            <div className="bg-white border border-outline-variant/30 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Promo Cards</h3>
              <div className="space-y-8">
                {cmsState.promoCards?.map((card, idx) => (
                  <div key={idx} className="space-y-4 border-b border-outline-variant/30 pb-6 last:border-0 last:pb-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Card {idx + 1}</p>
                    <div>
                      <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Label Text</label>
                      <input 
                        value={card.label} 
                        onChange={e => {
                          const newCards = [...cmsState.promoCards];
                          newCards[idx] = { ...newCards[idx], label: e.target.value };
                          updateCMS('promoCards', newCards);
                        }}
                        className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase font-bold" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Link URL</label>
                        <input 
                          value={card.href} 
                          onChange={e => {
                            const newCards = [...cmsState.promoCards];
                            newCards[idx] = { ...newCards[idx], href: e.target.value };
                            updateCMS('promoCards', newCards);
                          }}
                          className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Background Color</label>
                        <input 
                          value={card.bg} 
                          onChange={e => {
                            const newCards = [...cmsState.promoCards];
                            newCards[idx] = { ...newCards[idx], bg: e.target.value };
                            updateCMS('promoCards', newCards);
                          }}
                          className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Image URL</label>
                      <input 
                        value={card.img} 
                        onChange={e => {
                          const newCards = [...cmsState.promoCards];
                          newCards[idx] = { ...newCards[idx], img: e.target.value };
                          updateCMS('promoCards', newCards);
                        }}
                        className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Column (Live Preview) */}
          <div className="lg:col-span-7 flex flex-col" style={{ minHeight: 640 }}>
            {/* Preview Toolbar */}
            <div className="flex justify-between items-center mb-3 px-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Live Website Preview</p>
              <div className="flex gap-2 bg-surface-container-lowest border border-outline-variant/30 rounded-full px-3 py-1">
                <button 
                  onClick={() => setPreviewMode('mobile')} 
                  title="Mobile Preview"
                  className={`transition-colors ${previewMode === 'mobile' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[18px] block">smartphone</span>
                </button>
                <button 
                  onClick={() => setPreviewMode('desktop')} 
                  title="Desktop Preview"
                  className={`transition-colors ${previewMode === 'desktop' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[18px] block">desktop_mac</span>
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex items-start justify-center overflow-hidden">
              <div
                className={`bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${previewMode === 'mobile' ? 'w-[375px]' : 'w-full'}`}
                style={{ fontFamily: cmsState.theme.font, maxHeight: 620, borderRadius: 16 }}
              >
                {/* Announcement Bar */}
                {cmsState.announcement?.active && (
                  <div className="w-full bg-black text-white text-center py-1.5 text-[9px] uppercase tracking-widest font-bold flex-shrink-0">
                    {cmsState.announcement?.text || 'YOUR ANNOUNCEMENT HERE'}
                  </div>
                )}

                {/* Nav Bar */}
                <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                  {previewMode === 'mobile' ? (
                    <>
                      <span className="material-symbols-outlined text-[16px]">menu</span>
                      <span className="font-bold tracking-[0.2em] uppercase text-[14px]" style={{ color: cmsState.theme.primaryColor }}>ATELIER</span>
                      <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold tracking-[0.2em] uppercase text-[13px]" style={{ color: cmsState.theme.primaryColor }}>ATELIER</span>
                      <div className="flex gap-5">
                        {(cmsState.navigation || []).slice(0, 5).map(nav => (
                          <span key={nav.id} className="text-[9px] uppercase tracking-[0.12em] font-semibold text-gray-500 hover:text-black transition-colors cursor-pointer">{nav.label}</span>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <span className="material-symbols-outlined text-[16px]">search</span>
                        <span className="material-symbols-outlined text-[16px]">favorite</span>
                        <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Hero Banner — mood-resolved */}
                <div className="relative flex-shrink-0" style={{ height: previewMode === 'mobile' ? 280 : 340 }}>
                  <img
                    src={previewHero.image}
                    alt="Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ display: 'block' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 pb-6 px-5 flex flex-col items-center text-center">
                    <p className="text-white/70 uppercase tracking-[0.2em] mb-1" style={{ fontSize: 8 }}>{previewHero.subtitle}</p>
                    <h2 className="text-white font-bold uppercase leading-tight mb-3" style={{ fontSize: previewMode === 'mobile' ? 22 : 30, letterSpacing: '-0.02em' }}>{previewHero.title}</h2>
                    <div className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded-full" style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {previewHero.buttonText}
                      <span className="w-4 h-4 bg-black text-white rounded-full flex items-center justify-center" style={{ fontSize: 9 }}>→</span>
                    </div>
                  </div>
                </div>

                {/* Promo Cards Row */}
                {cmsState.promoCards && cmsState.promoCards.length > 0 && (
                  <div className={`grid gap-2 p-2 flex-shrink-0 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {cmsState.promoCards.map((card, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between overflow-hidden"
                        style={{ borderRadius: 12, background: card.bg || '#F0EDE8', minHeight: 80, padding: '10px 12px' }}
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-gray-800 leading-tight mb-2" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
                          <div className="bg-white text-gray-800 font-bold rounded-full px-3 py-1 inline-block" style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shop Now</div>
                        </div>
                        <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 55, height: 65 }}>
                          <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview meta label */}
            <p className="text-center text-[9px] text-on-surface-variant mt-2 uppercase tracking-widest">
              {previewMode === 'desktop' ? '🖥 Desktop View — approximate preview' : '📱 Mobile View — 375px'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Homepage Sections */}
      {activeTab === 'Homepage Sections' && (
        <div className="space-y-6">

          {/* ── Hero Mood Switcher ─────────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Hero Mood Switcher</h3>
            <p className="text-xs text-on-surface-variant mb-5">Instantly swap the entire hero banner. Pick a preset or use the main banner from Site &amp; Theme.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* None / Main option */}
              <button
                onClick={() => updateCMS('activeHeroMood', null)}
                className={`relative overflow-hidden border-2 transition-all ${!cmsState.activeHeroMood ? 'border-primary' : 'border-outline-variant/30 hover:border-primary/50'}`}
                style={{ borderRadius: 12, minHeight: 100 }}
              >
                <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2 p-3">
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant">tune</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Main Banner</span>
                </div>
                {!cmsState.activeHeroMood && <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[10px]">check</span></div>}
              </button>
              {(cmsState.heroMoods || []).map(mood => (
                <button
                  key={mood.id}
                  onClick={() => updateCMS('activeHeroMood', mood.id)}
                  className={`relative overflow-hidden border-2 transition-all ${cmsState.activeHeroMood === mood.id ? 'border-primary' : 'border-outline-variant/30 hover:border-primary/50'}`}
                  style={{ borderRadius: 12, minHeight: 100 }}
                >
                  <img src={mood.image} alt={mood.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 flex flex-col items-center justify-end h-full p-2 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">{mood.name}</span>
                  </div>
                  {cmsState.activeHeroMood === mood.id && <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[10px]">check</span></div>}
                </button>
              ))}
            </div>

            {/* Edit mood details */}
            {cmsState.activeHeroMood && (
              <div className="mt-5 pt-5 border-t border-outline-variant/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Edit Active Mood: {cmsState.heroMoods?.find(m => m.id === cmsState.activeHeroMood)?.name}</p>
                {cmsState.heroMoods?.filter(m => m.id === cmsState.activeHeroMood).map(mood => (
                  <div key={mood.id} className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Heading</label><input value={mood.title} onChange={e => updateCMS('heroMoods', cmsState.heroMoods.map(m => m.id === mood.id ? {...m, title: e.target.value} : m))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
                    <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Subheading</label><input value={mood.subtitle} onChange={e => updateCMS('heroMoods', cmsState.heroMoods.map(m => m.id === mood.id ? {...m, subtitle: e.target.value} : m))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
                    <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Text</label><input value={mood.buttonText} onChange={e => updateCMS('heroMoods', cmsState.heroMoods.map(m => m.id === mood.id ? {...m, buttonText: e.target.value} : m))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
                    <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Link</label><input value={mood.buttonLink} onChange={e => updateCMS('heroMoods', cmsState.heroMoods.map(m => m.id === mood.id ? {...m, buttonLink: e.target.value} : m))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" /></div>
                    <div className="col-span-2"><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Image URL (public URL or /images/...)</label><input value={mood.image} onChange={e => updateCMS('heroMoods', cmsState.heroMoods.map(m => m.id === mood.id ? {...m, image: e.target.value} : m))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" placeholder="https://... or /images/..." /></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section Visibility & Order ────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Homepage Layout Builder</h3>
            <p className="text-xs text-on-surface-variant mb-5">Toggle sections on/off and reorder them with the arrows.</p>
            <div className="space-y-2">
              {(cmsState.sections || []).map((sec, idx) => (
                <div key={sec.id} className="flex items-center gap-3 p-3 border border-outline-variant/20 bg-surface-container-lowest/50" style={{ borderRadius: 10 }}>
                  <div className="flex flex-col gap-0.5">
                    <button disabled={idx === 0} onClick={() => { const s = [...cmsState.sections]; [s[idx-1], s[idx]] = [s[idx], s[idx-1]]; updateCMS('sections', s); }} className={`text-on-surface-variant hover:text-primary transition-colors ${idx === 0 ? 'opacity-20 pointer-events-none' : ''}`}><span className="material-symbols-outlined text-[14px] block">keyboard_arrow_up</span></button>
                    <button disabled={idx === cmsState.sections.length - 1} onClick={() => { const s = [...cmsState.sections]; [s[idx], s[idx+1]] = [s[idx+1], s[idx]]; updateCMS('sections', s); }} className={`text-on-surface-variant hover:text-primary transition-colors ${idx === cmsState.sections.length - 1 ? 'opacity-20 pointer-events-none' : ''}`}><span className="material-symbols-outlined text-[14px] block">keyboard_arrow_down</span></button>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold uppercase tracking-widest text-primary">{sec.label}</span>
                  </div>
                  <label className="flex items-center cursor-pointer gap-2">
                    <span className="text-[10px] text-on-surface-variant">{sec.visible ? 'Visible' : 'Hidden'}</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={sec.visible} onChange={e => updateCMS('sections', cmsState.sections.map(s => s.id === sec.id ? {...s, visible: e.target.checked} : s))} />
                      <div className={`block w-9 h-5 rounded-full transition-colors ${sec.visible ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${sec.visible ? 'translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ── Marquee Ticker Editor ─────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Marquee Ticker</h3>
                <p className="text-xs text-on-surface-variant mt-1">Edit scrolling messages. Toggle each one individually.</p>
              </div>
              <div className="flex items-center gap-3">
                <select value={cmsState.tickerSpeed || 'normal'} onChange={e => updateCMS('tickerSpeed', e.target.value)} className="border border-outline-variant/50 px-3 py-1.5 text-xs bg-white focus:outline-none">
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
                <button onClick={() => updateCMS('tickerItems', [...(cmsState.tickerItems || []), { id: `t${Date.now()}`, text: 'New Message', active: true }])} className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5">+ Add</button>
              </div>
            </div>
            <div className="space-y-2">
              {(cmsState.tickerItems || []).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-2 border border-outline-variant/20 bg-surface-container-lowest/50" style={{ borderRadius: 8 }}>
                  <div className="relative flex-shrink-0">
                    <input type="checkbox" className="sr-only" id={`ticker-${item.id}`} checked={item.active} onChange={e => updateCMS('tickerItems', cmsState.tickerItems.map(t => t.id === item.id ? {...t, active: e.target.checked} : t))} />
                    <label htmlFor={`ticker-${item.id}`} className="cursor-pointer">
                      <div className={`block w-9 h-5 rounded-full transition-colors ${item.active ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${item.active ? 'translate-x-4' : ''}`}></div>
                    </label>
                  </div>
                  <input value={item.text} onChange={e => updateCMS('tickerItems', cmsState.tickerItems.map(t => t.id === item.id ? {...t, text: e.target.value} : t))} className="flex-1 border border-outline-variant/50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none uppercase font-medium" />
                  <button onClick={() => updateCMS('tickerItems', cmsState.tickerItems.filter(t => t.id !== item.id))} className="text-on-surface-variant hover:text-red-500 transition-colors p-1"><span className="material-symbols-outlined text-[16px] block">close</span></button>
                </div>
              ))}
            </div>
            {/* Social Proof Mode */}
            <div className="mt-5 pt-5 border-t border-outline-variant/20">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Social Proof Mode</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Replace ticker with live-style social proof messages</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={cmsState.socialProof?.active || false} onChange={e => updateCMS('socialProof', {...(cmsState.socialProof || {}), active: e.target.checked})} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${cmsState.socialProof?.active ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${cmsState.socialProof?.active ? 'translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
              {cmsState.socialProof?.active && (
                <div className="space-y-2">
                  {(cmsState.socialProof?.items || []).map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border border-outline-variant/20 bg-surface-container-lowest/50" style={{ borderRadius: 8 }}>
                      <input value={item.text} onChange={e => updateCMS('socialProof', {...cmsState.socialProof, items: cmsState.socialProof.items.map(i => i.id === item.id ? {...i, text: e.target.value} : i)})} className="flex-1 border border-outline-variant/50 px-3 py-1.5 text-sm focus:border-primary focus:outline-none" />
                    </div>
                  ))}
                  <button onClick={() => updateCMS('socialProof', {...cmsState.socialProof, items: [...(cmsState.socialProof?.items || []), { id: `sp${Date.now()}`, text: 'New social proof message', active: true }]})} className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">+ Add Message</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Category Cards Editor ─────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Category Cards</h3>
                <p className="text-xs text-on-surface-variant mt-1">Edit the grid of categories shown on the homepage.</p>
              </div>
              <button onClick={() => updateCMS('categoryCards', [...(cmsState.categoryCards || []), { id: `cat${Date.now()}`, label: 'New Category', href: '/', img: '' }])} className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5">+ Add Card</button>
            </div>
            <div className="space-y-4">
              {(cmsState.categoryCards || []).map((card, idx) => (
                <div key={card.id} className="border border-outline-variant/20 p-4" style={{ borderRadius: 10 }}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Card {idx + 1}</span>
                    <button onClick={() => updateCMS('categoryCards', cmsState.categoryCards.filter(c => c.id !== card.id))} className="text-on-surface-variant hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[16px] block">delete</span></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Label</label><input value={card.label} onChange={e => updateCMS('categoryCards', cmsState.categoryCards.map(c => c.id === card.id ? {...c, label: e.target.value} : c))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase font-bold" /></div>
                    <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Link URL</label><input value={card.href} onChange={e => updateCMS('categoryCards', cmsState.categoryCards.map(c => c.id === card.id ? {...c, href: e.target.value} : c))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" /></div>
                    <div className="flex items-end gap-2">
                      {card.img && <img src={card.img} alt={card.label} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
                    </div>
                    <div className="col-span-3"><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Image URL (public URL or /images/...)</label><input value={card.img} onChange={e => updateCMS('categoryCards', cmsState.categoryCards.map(c => c.id === card.id ? {...c, img: e.target.value} : c))} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" placeholder="https://... or /images/..." /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Flash Sale Editor ─────────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-5">Flash Sale Banner</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Sale Title</label><input value={cmsState.flashSale?.title || ''} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), title: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-bold uppercase" /></div>
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Discount Text (e.g. Up to 40% off)</label><input value={cmsState.flashSale?.discountText || ''} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), discountText: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div className="col-span-2"><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Description</label><input value={cmsState.flashSale?.description || ''} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), description: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">CTA Button Text</label><input value={cmsState.flashSale?.ctaText || ''} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), ctaText: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase" /></div>
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">CTA Link</label><input value={cmsState.flashSale?.ctaLink || ''} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), ctaLink: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" /></div>
              <div className="col-span-2 flex items-center gap-3 p-3 border border-outline-variant/20 bg-surface-container-lowest/50" style={{ borderRadius: 8 }}>
                <label className="flex items-center cursor-pointer gap-2">
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={cmsState.flashSale?.useDeadlineDate || false} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), useDeadlineDate: e.target.checked})} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${cmsState.flashSale?.useDeadlineDate ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${cmsState.flashSale?.useDeadlineDate ? 'translate-x-4' : ''}`}></div>
                  </div>
                  <span className="text-xs font-semibold uppercase text-on-surface-variant">Use Specific Deadline Date</span>
                </label>
                {cmsState.flashSale?.useDeadlineDate && (
                  <input type="datetime-local" value={cmsState.flashSale?.deadlineDate || ''} onChange={e => updateCMS('flashSale', {...(cmsState.flashSale||{}), deadlineDate: e.target.value})} className="flex-1 border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                )}
              </div>
            </div>
          </div>

          {/* ── Spotlight Product ─────────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Spotlight Product</h3>
            <p className="text-xs text-on-surface-variant mb-4">Pin one hero product on the homepage. Enable the &quot;Spotlight Product&quot; section in the Layout Builder above to show it.</p>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Tagline</label><input value={cmsState.spotlightTagline || ''} onChange={e => updateCMS('spotlightTagline', e.target.value)} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="This season's must-have" /></div>
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Select Product</label>
                <select value={cmsState.spotlightProductId || ''} onChange={e => updateCMS('spotlightProductId', e.target.value ? Number(e.target.value) : '')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white">
                  <option value="">— No spotlight product —</option>
                  {(products || []).map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── The Edit Curated Collection ───────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">&ldquo;The Edit&rdquo; Curated Collection</h3>
            <p className="text-xs text-on-surface-variant mb-4">Hand-pick up to 6 products for a special editorial section. Enable in the Layout Builder above.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Collection Name</label><input value={cmsState.theEdit?.name || ''} onChange={e => updateCMS('theEdit', {...(cmsState.theEdit||{}), name: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-bold uppercase" /></div>
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Tagline</label><input value={cmsState.theEdit?.tagline || ''} onChange={e => updateCMS('theEdit', {...(cmsState.theEdit||{}), tagline: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
            </div>
            <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-2">Select Products (up to 6)</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border border-outline-variant/20 p-2" style={{ borderRadius: 8 }}>
              {(products || []).map(p => {
                const isSelected = (cmsState.theEdit?.productIds || []).includes(p.id)
                return (
                  <label key={p.id} className={`flex items-center gap-3 p-2 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-surface-container-lowest/60'}`} style={{ borderRadius: 6 }}>
                    <input type="checkbox" checked={isSelected} onChange={e => {
                      const ids = cmsState.theEdit?.productIds || []
                      const newIds = e.target.checked ? (ids.length < 6 ? [...ids, p.id] : ids) : ids.filter(id => id !== p.id)
                      updateCMS('theEdit', {...(cmsState.theEdit||{}), productIds: newIds})
                    }} className="accent-primary w-3 h-3" />
                    <span className="text-xs font-semibold text-primary truncate">{p.name}</span>
                    <span className="text-xs text-on-surface-variant ml-auto">${p.price}</span>
                  </label>
                )
              })}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2">{(cmsState.theEdit?.productIds || []).length}/6 products selected</p>
          </div>

          {/* ── Brand Story Strip ─────────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">Brand Story Strip</h3>
            <p className="text-xs text-on-surface-variant mb-4">A bold editorial strip with a brand manifesto quote. Enable in the Layout Builder above.</p>
            <div className="space-y-3">
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Manifesto Quote</label><textarea rows={2} value={cmsState.brandStory?.text || ''} onChange={e => updateCMS('brandStory', {...(cmsState.brandStory||{}), text: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Text</label><input value={cmsState.brandStory?.ctaText || ''} onChange={e => updateCMS('brandStory', {...(cmsState.brandStory||{}), ctaText: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase" /></div>
                <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Button Link</label><input value={cmsState.brandStory?.ctaLink || ''} onChange={e => updateCMS('brandStory', {...(cmsState.brandStory||{}), ctaLink: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" /></div>
              </div>
            </div>
          </div>

          {/* ── Community / UGC Editor ───────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-5">Community / UGC Section</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Section Title</label><input value={cmsState.community?.title || ''} onChange={e => updateCMS('community', {...(cmsState.community||{}), title: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-bold" /></div>
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Super Label (small text above title)</label><input value={cmsState.community?.superLabel || ''} onChange={e => updateCMS('community', {...(cmsState.community||{}), superLabel: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none uppercase" /></div>
              <div className="col-span-2"><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Description</label><input value={cmsState.community?.description || ''} onChange={e => updateCMS('community', {...(cmsState.community||{}), description: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" /></div>
              <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">CTA Style</label><select value={cmsState.community?.ctaStyle || 'hashtag'} onChange={e => updateCMS('community', {...(cmsState.community||{}), ctaStyle: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none bg-white"><option value="hashtag">Hashtag</option><option value="instagram">Instagram Handle</option></select></div>
              {cmsState.community?.ctaStyle === 'instagram'
                ? <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Instagram Handle</label><input value={cmsState.community?.instagramHandle || ''} onChange={e => updateCMS('community', {...(cmsState.community||{}), instagramHandle: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" /></div>
                : <div><label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Hashtag</label><input value={cmsState.community?.hashtag || ''} onChange={e => updateCMS('community', {...(cmsState.community||{}), hashtag: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" /></div>
              }
            </div>
            <p className="text-xs font-semibold uppercase text-on-surface-variant mb-3">Community Photos (public URL or /images/...)</p>
            <div className="grid grid-cols-2 gap-3">
              {(cmsState.community?.images || []).map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {img && <img src={img} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />}
                  <input value={img} onChange={e => { const imgs = [...(cmsState.community?.images || [])]; imgs[idx] = e.target.value; updateCMS('community', {...(cmsState.community||{}), images: imgs}); }} className="flex-1 border border-outline-variant/50 px-3 py-2 text-xs focus:border-primary focus:outline-none font-mono" placeholder="https://... or /images/..." />
                </div>
              ))}
            </div>
          </div>

          {/* ── Section Labels ───────────────────────────────────────────── */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-5">Section Heading Labels</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'popularTitle', label: 'Popular Products Title' },
                { key: 'categoriesTitle', label: 'Categories Title' },
                { key: 'newArrivalsSuper', label: 'New Arrivals Super Label' },
                { key: 'newArrivalsTitle', label: 'New Arrivals Title' },
                { key: 'bestSellersSuper', label: 'Best Sellers Super Label' },
                { key: 'bestSellersTitle', label: 'Best Sellers Title' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">{label}</label>
                  <input value={(cmsState.sectionLabels || {})[key] || ''} onChange={e => updateCMS('sectionLabels', {...(cmsState.sectionLabels||{}), [key]: e.target.value})} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: Content Curations */}
      {activeTab === 'Content Curations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Landing Pages Table */}
          <div className="bg-white border border-outline-variant/30 flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Landing Pages & Scheduling</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Manage custom promotional pages</p>
              </div>
              <button 
                onClick={() => {
                  const title = prompt('Enter page title:')
                  if (title) {
                    const safeId = crypto.randomUUID()
                    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    if (!slug || slug === '-') slug = `promo-${safeId.split('-')[0]}`
                    updateCMS('landingPages', [{ id: safeId, title, url: `/pages/${slug}`, status: 'Draft', scheduledDate: 'TBD' }, ...cmsState.landingPages])
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary"
              >
                Create New
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              {cmsState.landingPages.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">No landing pages created.</p>
              ) : (
                <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-left">
                    <th className="py-2">Title</th>
                    <th className="py-2">URL Slug</th>
                    <th className="py-2">Status / Schedule</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {cmsState.landingPages.map(lp => (
                    <tr key={lp.id} className="hover:bg-surface-container-lowest/50">
                      <td className="py-3 font-bold text-primary">{lp.title}</td>
                      <td className="py-3 font-mono text-[10px] text-on-surface-variant">{lp.url}</td>
                      <td className="py-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mr-2 ${lp.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {lp.status}
                        </span>
                        <span className="text-[10px] text-on-surface-variant">{lp.scheduledDate}</span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this landing page?')) {
                              updateCMS('landingPages', cmsState.landingPages.filter(l => l.id !== lp.id))
                            }
                          }}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {/* Banner Manager Table */}
          <div className="bg-white border border-outline-variant/30 flex flex-col">
            <div className="p-4 border-b border-outline-variant/30 bg-surface-container-lowest flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Banner Manager</h3>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Manage secondary promotional banners</p>
              </div>
              <button 
                onClick={() => {
                  const title = prompt('Enter banner title:')
                  if (title) updateCMS('banners', [{ id: crypto.randomUUID(), title, location: 'Sitewide', active: false }, ...cmsState.banners])
                }}
                className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary"
              >
                Add Banner
              </button>
            </div>
            <div className="p-4 overflow-x-auto">
              {cmsState.banners.length === 0 ? (
                <p className="text-sm text-on-surface-variant text-center py-4">No banners configured.</p>
              ) : (
                <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-left">
                    <th className="py-2">Banner Title</th>
                    <th className="py-2">Location</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {cmsState.banners.map(b => (
                    <tr key={b.id} className="hover:bg-surface-container-lowest/50">
                      <td className="py-3 font-bold text-primary">{b.title}</td>
                      <td className="py-3 text-xs text-on-surface-variant">{b.location}</td>
                      <td className="py-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-variant text-on-surface-variant'}`}>
                          {b.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => {
                            if (window.confirm('Delete this banner?')) {
                              updateCMS('banners', cmsState.banners.filter(banner => banner.id !== b.id))
                            }
                          }}
                          className="text-on-surface-variant hover:text-error transition-colors p-1"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {/* Featured Collections & Products Manager */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-outline-variant/30 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Featured Collections Manager</h3>
              <p className="text-xs text-on-surface-variant mb-4">Select collections to feature on the homepage.</p>
              <div className="space-y-2">
                {['SS26', 'FW25 Core', 'Accessories', 'Denim'].map(col => (
                  <label key={col} className="flex items-center gap-3 p-3 border border-outline-variant/30 hover:border-primary cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-primary w-4 h-4"
                      checked={cmsState.featuredCollections.includes(col)}
                      onChange={(e) => {
                        const newCols = e.target.checked 
                          ? [...cmsState.featuredCollections, col]
                          : cmsState.featuredCollections.filter(c => c !== col)
                        updateCMS('featuredCollections', newCols)
                      }}
                    />
                    <span className="text-sm font-semibold uppercase tracking-widest">{col} Collection</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white border border-outline-variant/30 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">Featured Products Manager</h3>
              <p className="text-xs text-on-surface-variant mb-4">Select individual products to highlight.</p>
              <div className="space-y-2">
                {['PRD-001', 'PRD-004', 'PRD-008'].map(prd => (
                  <label key={prd} className="flex items-center gap-3 p-3 border border-outline-variant/30 hover:border-primary cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-primary w-4 h-4"
                      checked={cmsState.featuredProducts.includes(prd)}
                      onChange={(e) => {
                        const newPrds = e.target.checked 
                          ? [...cmsState.featuredProducts, prd]
                          : cmsState.featuredProducts.filter(p => p !== prd)
                        updateCMS('featuredProducts', newPrds)
                      }}
                    />
                    <span className="text-sm font-mono text-on-surface-variant">{prd}</span>
                    <span className="text-sm font-semibold text-primary">Silk Item</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: Navigation & SEO */}
      {activeTab === 'Navigation & SEO' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Navigation Manager */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">Navigation Manager</h3>
                <p className="text-xs text-on-surface-variant mt-1">Reorder Header Menu</p>
              </div>
              <button 
                onClick={() => updateCMS('navigation', [...cmsState.navigation, { id: crypto.randomUUID(), label: 'New Link', url: '/' }])}
                className="text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary px-3 py-1.5 hover:bg-secondary"
              >
                Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {cmsState.navigation.length === 0 && (
                <p className="text-sm text-on-surface-variant">No navigation links added.</p>
              )}
              {cmsState.navigation.map((nav, index) => (
                <div key={nav.id} className="flex items-center gap-4 p-3 border border-outline-variant/30 bg-surface-container-lowest">
                  <div className="flex flex-col gap-1 text-on-surface-variant">
                    <button 
                      onClick={() => {
                        if (index === 0) return
                        const newNav = [...cmsState.navigation]
                        const temp = newNav[index - 1]
                        newNav[index - 1] = newNav[index]
                        newNav[index] = temp
                        updateCMS('navigation', newNav)
                      }}
                      className={`hover:text-primary ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <span className="material-symbols-outlined text-[16px] block">keyboard_arrow_up</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (index === cmsState.navigation.length - 1) return
                        const newNav = [...cmsState.navigation]
                        const temp = newNav[index + 1]
                        newNav[index + 1] = newNav[index]
                        newNav[index] = temp
                        updateCMS('navigation', newNav)
                      }}
                      className={`hover:text-primary ${index === cmsState.navigation.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                      <span className="material-symbols-outlined text-[16px] block">keyboard_arrow_down</span>
                    </button>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input 
                      value={nav.label} 
                      onChange={e => {
                        const newNav = [...cmsState.navigation]
                        newNav[index] = { ...newNav[index], label: e.target.value }
                        updateCMS('navigation', newNav)
                      }}
                      className="border border-outline-variant/50 px-2 py-1.5 text-xs focus:border-primary focus:outline-none uppercase font-bold" 
                    />
                    <input 
                      value={nav.url} 
                      onChange={e => {
                        const newNav = [...cmsState.navigation]
                        newNav[index] = { ...newNav[index], url: e.target.value }
                        updateCMS('navigation', newNav)
                      }}
                      className="border border-outline-variant/50 px-2 py-1.5 text-xs font-mono focus:border-primary focus:outline-none" 
                    />
                  </div>
                  <button 
                    onClick={() => updateCMS('navigation', cmsState.navigation.filter(n => n.id !== nav.id))}
                    className="text-on-surface-variant hover:text-error p-1"
                  >
                    <span className="material-symbols-outlined text-[16px] block">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Center */}
          <div className="bg-white border border-outline-variant/30 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-6">Global SEO Center</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Meta Title</label>
                <input 
                  value={cmsState.seo.metaTitle} 
                  onChange={e => updateCMS('seo', { ...cmsState.seo, metaTitle: e.target.value })}
                  className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Meta Description</label>
                <textarea 
                  rows={3}
                  value={cmsState.seo.metaDescription} 
                  onChange={e => updateCMS('seo', { ...cmsState.seo, metaDescription: e.target.value })}
                  className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-on-surface-variant block mb-1">Open Graph Image (Social Sharing)</label>
                <input 
                  value={cmsState.seo.ogImage} 
                  onChange={e => updateCMS('seo', { ...cmsState.seo, ogImage: e.target.value })}
                  className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:border-primary focus:outline-none font-mono" 
                />
              </div>
            </div>

            <div className="border border-outline-variant/30 p-4 bg-[#f8f9fa] rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">Google Search Preview</p>
              <div className="space-y-1">
                <div className="text-[11px] text-[#202124] truncate">https://www.atelier-store.com</div>
                <div className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer truncate" style={{ fontFamily: 'arial, sans-serif' }}>{cmsState.seo.metaTitle}</div>
                <div className="text-[13px] text-[#4d5156] line-clamp-2" style={{ fontFamily: 'arial, sans-serif' }}>{cmsState.seo.metaDescription}</div>
              </div>
            </div>
            
          </div>

        </div>
      )}

    </div>
  )
}
