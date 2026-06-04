import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { api } from '../services/api'
import { useAdminStore } from '../store/useAdminStore'

// ── Countdown Timer ───────────────────────────────────────────────────────────
function useCountdown(deadlineDate) {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })
  useEffect(() => {
    const update = () => {
      let distance
      if (deadlineDate && !isNaN(new Date(deadlineDate).getTime())) {
        distance = new Date(deadlineDate).getTime() - Date.now()
        if (distance < 0) distance = 0
      } else {
        distance = (24 * 60 * 60 * 1000) - (Date.now() % (24 * 60 * 60 * 1000))
      }
      const h = Math.floor(distance / 3600000)
      const m = Math.floor((distance % 3600000) / 60000)
      const s = Math.floor((distance % 60000) / 1000)
      setTime({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [deadlineDate])
  return time
}

// ── Dynamic Marquee ───────────────────────────────────────────────────────────
function Marquee({ items, speed }) {
  const activeItems = items?.filter(i => i.active) || []
  if (activeItems.length === 0) return null
  const doubled = [...activeItems, ...activeItems]
  const durationMap = { slow: '60s', normal: '35s', fast: '18s' }
  const dur = durationMap[speed] || '35s'
  return (
    <div className="overflow-hidden py-3 bg-white border-y border-[#EAEAEA]">
      <div className="animate-marquee" style={{ animationDuration: dur }}>
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-8 px-8">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#111111]">{item.text}</span>
            <span className="text-[#CCCCCC]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Product filter tabs ───────────────────────────────────────────────────────
const PRODUCT_FILTERS = ['All', 'Shorts', 'Jackets', 'Shoes', 'T-Shirt']
const CATEGORY_FILTERS = ['All', 'Woman', 'Children']

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [activeProductFilter, setActiveProductFilter] = useState('All')
  const [activeCatFilter, setActiveCatFilter] = useState('All')
  const sliderRef = useRef(null)

  const storefront = useAdminStore(st => st.storefront)
  const cms = useAdminStore(st => st.storefrontCMS)
  const products = useAdminStore(st => st.products)

  // Resolve hero — active mood overrides main storefront
  const activeMood = cms.activeHeroMood ? cms.heroMoods?.find(m => m.id === cms.activeHeroMood) : null
  const hero = activeMood || storefront

  // Flash sale deadline
  const deadline = cms.flashSale?.useDeadlineDate ? cms.flashSale?.deadlineDate : null
  const { h, m, s } = useCountdown(deadline)

  useEffect(() => {
    api.getNewArrivals().then(setNewArrivals)
    api.getBestSellers().then(res => setBestSellers(res.slice(0, 4)))
    api.getProducts().then(setAllProducts)
  }, [])

  const scrollLeft = () => sliderRef.current?.scrollBy({ left: -320, behavior: 'smooth' })
  const scrollRight = () => sliderRef.current?.scrollBy({ left: 320, behavior: 'smooth' })

  const filteredProducts = activeProductFilter === 'All'
    ? allProducts.slice(0, 6)
    : allProducts.filter(p =>
        p.category?.toLowerCase().includes(activeProductFilter.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(activeProductFilter.toLowerCase()))
      ).slice(0, 6)

  // Section visibility helper
  const sectionVisible = (id) => cms.sections?.find(s => s.id === id)?.visible !== false

  // Spotlight product
  const spotlightProduct = cms.spotlightProductId
    // eslint-disable-next-line eqeqeq
    ? (products.find(p => p.id == cms.spotlightProductId) || allProducts.find(p => p.id == cms.spotlightProductId))
    : null

  // "The Edit" products
  const theEditProducts = (cms.theEdit?.productIds || [])
    .map(id => products.find(p => p.id === id) || allProducts.find(p => p.id === id))
    .filter(Boolean)

  const sl = cms.sectionLabels || {}
  const cat = cms.community || {}
  const flashSale = cms.flashSale || {}

  return (
    <div className="bg-[#F5F5F5] min-h-screen">

      {/* ── Hero Section ────────────────────────────────────────────────── */}
      {sectionVisible('hero') && (
        <section className="pt-[100px] pb-6 px-4 md:px-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="relative overflow-hidden" style={{ borderRadius: 32, minHeight: 380 }}>
              <img
                src={hero.image}
                alt="ATELIER Campaign"
                className="w-full h-[380px] md:h-[520px] object-cover hero-zoom"
                style={{ borderRadius: 32 }}
              />
              <div
                className="absolute inset-0"
                style={{ borderRadius: 32, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-6 text-center">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
                  className="text-white font-semibold leading-tight mb-3"
                  style={{ fontSize: 'clamp(28px, 5vw, 56px)' }}
                >
                  {hero.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-white/80 text-[14px] mb-6 max-w-sm"
                >
                  {hero.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }}
                >
                  <Link
                    to={hero.buttonLink}
                    className="flex items-center gap-2 bg-white text-[#111111] text-[12px] font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
                    style={{ borderRadius: 9999 }}
                  >
                    {hero.buttonText}
                    <span className="w-6 h-6 bg-[#111111] text-white rounded-full flex items-center justify-center text-[11px] font-bold">→</span>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Promo Cards Row ──────────────────────────────────────────────── */}
      {sectionVisible('promoCards') && (cms.promoCards || []).length > 0 && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {cms.promoCards.map((card, i) => (
              <Link
                key={i}
                to={card.href}
                className="group relative overflow-hidden flex items-center justify-between p-6 md:p-8 transition-all duration-300 hover:-translate-y-1"
                style={{ borderRadius: 24, background: card.bg, minHeight: 160, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
              >
                <div className="flex-1 pr-4">
                  <h3 className="font-semibold text-[#111111] leading-snug mb-4" style={{ fontSize: 'clamp(16px, 2.2vw, 22px)' }}>
                    {card.label}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1.5 bg-white text-[#111111] text-[11px] font-semibold px-4 py-2 transition-all duration-200 group-hover:shadow-md"
                    style={{ borderRadius: 9999 }}
                  >
                    Shop Now
                  </span>
                </div>
                <div className="flex-shrink-0 w-[120px] h-[130px] md:w-[140px] md:h-[150px] overflow-hidden" style={{ borderRadius: 16 }}>
                  <img src={card.img} alt={card.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Marquee / Social Proof Ticker ─────────────────────────────────── */}
      {sectionVisible('ticker') && (
        <div className="px-4 md:px-8 pb-6">
          <div className="max-w-[1440px] mx-auto bg-white overflow-hidden" style={{ borderRadius: 24 }}>
            {cms.socialProof?.active
              ? <Marquee items={cms.socialProof.items} speed={cms.tickerSpeed} />
              : <Marquee items={cms.tickerItems} speed={cms.tickerSpeed} />
            }
          </div>
        </div>
      )}

      {/* ── Spotlight Product ────────────────────────────────────────────── */}
      {sectionVisible('spotlight') && spotlightProduct && (
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-[1440px] mx-auto">
            <Link
              to={`/products/${spotlightProduct.id}`}
              className="group flex flex-col md:flex-row overflow-hidden hover:-translate-y-1 transition-transform duration-300"
              style={{ borderRadius: 28, background: '#111111', minHeight: 200 }}
            >
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.25em] font-bold mb-3">{cms.spotlightTagline || 'Featured Product'}</p>
                <h2 className="text-white font-semibold text-[clamp(22px,3vw,40px)] leading-tight mb-3">{spotlightProduct.name}</h2>
                <p className="text-white/60 text-[13px] mb-6">{spotlightProduct.description || ''}</p>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-[18px]">${spotlightProduct.price}</span>
                  <span className="flex items-center gap-2 bg-white text-[#111111] text-[11px] font-bold px-5 py-2.5 rounded-full group-hover:bg-[#f0f0f0] transition-colors">
                    Shop Now →
                  </span>
                </div>
              </div>
              <div className="w-full md:w-[320px] h-[220px] md:h-auto flex-shrink-0 overflow-hidden">
                <img
                  src={spotlightProduct.images?.[0] || spotlightProduct.image || '/images/outerwear.png'}
                  alt={spotlightProduct.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── Browse by Categories ─────────────────────────────────────────── */}
      {sectionVisible('categories') && (
        <section className="px-4 md:px-8 pb-8">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111111] tracking-tight">
                {sl.categoriesTitle || 'Browse by categories'}
              </h2>
              <div className="flex items-center gap-2">
                {CATEGORY_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveCatFilter(filter)}
                    className={`px-5 py-2 rounded-full text-[12px] font-semibold border transition-all duration-200
                      ${activeCatFilter === filter
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {(cms.categoryCards || []).map((cat) => (
                <Link key={cat.id || cat.label} to={cat.href} className="group relative overflow-hidden aspect-square block" style={{ borderRadius: 24 }}>
                  <img src={cat.img} alt={cat.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#111111] px-3 py-1.5" style={{ borderRadius: 9999 }}>
                      {cat.label}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" style={{ borderRadius: 24 }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Popular Products ──────────────────────────────────────────────── */}
      {sectionVisible('popular') && (
        <section className="px-4 md:px-8 pb-10">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111111] tracking-tight">
                {sl.popularTitle || 'Popular products'}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                {PRODUCT_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveProductFilter(filter)}
                    className={`px-5 py-2 rounded-full text-[12px] font-semibold border transition-all duration-200
                      ${activeProductFilter === filter
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#666666] border-[#EAEAEA] hover:border-[#111111] hover:text-[#111111]'
                      }`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {(filteredProducts.length > 0 ? filteredProducts : allProducts.slice(0, 6)).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 border border-[#EAEAEA] bg-white text-[#111111] text-[12px] font-semibold px-8 py-3 hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-all duration-300"
                style={{ borderRadius: 9999 }}
              >
                View All Products
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── The Edit — Curated Collection ─────────────────────────────────── */}
      {sectionVisible('theEdit') && theEditProducts.length > 0 && (
        <section className="px-4 md:px-8 pb-10">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#999999] mb-1">Styled for You</p>
                <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111111] tracking-tight">
                  {cms.theEdit?.name || 'The Edit'}
                </h2>
                {cms.theEdit?.tagline && (
                  <p className="text-[13px] text-[#666666] mt-1">{cms.theEdit.tagline}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {theEditProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── New Arrivals Slider ───────────────────────────────────────────── */}
      {sectionVisible('newArrivals') && (
        <section className="pb-10 bg-white py-10" style={{ borderRadius: '32px 32px 0 0' }}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#999999] mb-1">
                  {sl.newArrivalsSuper || 'Just Landed'}
                </p>
                <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111111] tracking-tight">
                  {sl.newArrivalsTitle || 'New Arrivals'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={scrollLeft} className="w-9 h-9 rounded-full border border-[#EAEAEA] flex items-center justify-center hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
                  </button>
                  <button onClick={scrollRight} className="w-9 h-9 rounded-full border border-[#EAEAEA] flex items-center justify-center hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-all">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
                  </button>
                </div>
                <Link to="/collections/new-arrivals" className="text-[12px] font-semibold text-[#111111] border-b border-[#111111] pb-0.5 hover:opacity-60 transition-opacity hidden md:block">
                  View All
                </Link>
              </div>
            </div>
            <div ref={sliderRef} className="flex gap-4 overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth pb-2">
              {newArrivals.map((p, i) => (
                <div key={p.id} className="flex-shrink-0 w-[200px] md:w-[260px] snap-start">
                  <ProductCard product={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Flash Sale Banner ─────────────────────────────────────────────── */}
      {sectionVisible('flashSale') && (
        <section className="px-4 md:px-8 py-8">
          <div className="max-w-[1440px] mx-auto">
            <div
              className="bg-[#111111] px-8 py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8"
              style={{ borderRadius: 32 }}
            >
              <div className="text-center md:text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Limited Time</p>
                <h2 className="font-semibold text-white leading-tight mb-2" style={{ fontSize: 'clamp(24px, 3.5vw, 44px)' }}>
                  {flashSale.title || 'Archive Sale'}
                </h2>
                <p className="text-[13px] text-white/50 max-w-sm">{flashSale.description || 'Up to 40% off selected seasonal staples.'} Ends in:</p>
              </div>
              <div className="flex gap-8 text-center">
                {[{ v: h, l: 'Hours' }, { v: m, l: 'Mins' }, { v: s, l: 'Secs' }].map(({ v, l }) => (
                  <div key={l} className="flex flex-col items-center">
                    <span className="font-bold text-white leading-none mb-1" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>{v}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/30">{l}</span>
                  </div>
                ))}
              </div>
              <Link
                to={flashSale.ctaLink || '/collections/sale'}
                className="flex items-center gap-2 bg-white text-[#111111] text-[12px] font-semibold px-7 py-3.5 hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ borderRadius: 9999 }}
              >
                {flashSale.ctaText || 'Access Sale'} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Best Sellers ─────────────────────────────────────────────────── */}
      {sectionVisible('bestSellers') && (
        <section className="px-4 md:px-8 pb-10">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#999999] mb-1">
                  {sl.bestSellersSuper || 'Most Loved'}
                </p>
                <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111111] tracking-tight">
                  {sl.bestSellersTitle || 'Best Sellers'}
                </h2>
              </div>
              <Link to="/collections/best-sellers" className="text-[12px] font-semibold text-[#111111] border-b border-[#111111] pb-0.5 hover:opacity-60 transition-opacity hidden md:block">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand Story Strip ─────────────────────────────────────────────── */}
      {sectionVisible('brandStory') && (
        <section className="px-4 md:px-8 pb-10">
          <div className="max-w-[1440px] mx-auto">
            <div
              className="flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-12"
              style={{ borderRadius: 28, background: '#111111' }}
            >
              <p className="text-white font-semibold leading-relaxed max-w-xl" style={{ fontSize: 'clamp(18px, 2.5vw, 28px)' }}>
                &ldquo;{cms.brandStory?.text}&rdquo;
              </p>
              <Link
                to={cms.brandStory?.ctaLink || '/about'}
                className="flex-shrink-0 flex items-center gap-2 bg-white text-[#111111] text-[12px] font-bold px-7 py-3.5 hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ borderRadius: 9999 }}
              >
                {cms.brandStory?.ctaText || 'Discover Our Story'} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Community UGC ────────────────────────────────────────────────── */}
      {sectionVisible('community') && (
        <section className="px-4 md:px-8 pb-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="text-center mb-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#999999] mb-2">
                {cat.superLabel || 'Community'}
              </p>
              <h2 className="text-[22px] md:text-[26px] font-semibold text-[#111111] tracking-tight mb-2">
                {cat.title || 'Community Voices'}
              </h2>
              <p className="text-[13px] text-[#666666]">
                {cat.description || 'Styled by you, curated by us.'}{' '}
                {cat.ctaStyle === 'instagram'
                  ? <span className="font-semibold text-[#111111]">Follow {cat.instagramHandle} on Instagram</span>
                  : <span>Tag <span className="font-semibold text-[#111111]">{cat.hashtag || '#ATELIERArchive'}</span> to be featured.</span>
                }
              </p>
            </div>
            <div className="columns-2 md:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
              {(cat.images || []).map((src, i) => (
                <div key={i} className="relative group break-inside-avoid overflow-hidden" style={{ borderRadius: 20 }}>
                  <img src={src} alt={`Community look ${i + 1}`} className="w-full h-auto block" loading="lazy" style={{ borderRadius: 20 }} />
                  <div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center"
                    style={{ borderRadius: 20 }}
                  >
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop the Look
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
