import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { api } from '../services/api'
import { useAdminStore } from '../store/useAdminStore'

// ── Countdown Timer ──────────────────────────────────────────────────
function useCountdown() {
  const [time, setTime] = useState({ h: '00', m: '00', s: '00' })
  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const distance = (24 * 60 * 60 * 1000) - (now % (24 * 60 * 60 * 1000))
      const h = Math.floor(distance / 3600000)
      const m = Math.floor((distance % 3600000) / 60000)
      const s = Math.floor((distance % 60000) / 1000)
      setTime({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ── Marquee Ticker ───────────────────────────────────────────────────
const TICKER_ITEMS = ['New Season Drop', 'Free Shipping Over $150', 'Luxury Essentials In', 'Limited Drops Weekly', 'Complimentary Gift Wrapping']
function Marquee() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div className="overflow-hidden border-y border-[#EAEAEA] py-3 bg-white">
      <div className="animate-marquee">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-8 px-8">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A]">{item}</span>
            <span className="text-[#C4C7C7]">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const sliderRef = useRef(null)

  useEffect(() => {
    api.getNewArrivals().then(setNewArrivals)
    api.getBestSellers().then(res => setBestSellers(res.slice(0, 4)))
  }, [])

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  const { h, m, s } = useCountdown()
  const storefront = useAdminStore(s => s.storefront)

  const CATEGORIES = [
    { label: 'Women', sub: 'The New Feminine', href: '/collections/women', img: '/images/tops.png' },
    { label: 'Men', sub: 'Refined Silhouettes', href: '/collections/men', img: '/images/outerwear.png' },
    { label: 'Accessories', sub: 'The Details', href: '/collections/accessories', img: '/images/accessories.png' },
    { label: 'Footwear', sub: 'Ground Zero', href: '/collections/footwear', img: '/images/sneakers.png' },
  ]

  const EDITORIAL_PICKS = [
    { label: 'Anime Archive', desc: 'Neo-noir meets high craftsmanship.', href: '/collections/anime', img: '/images/knitwear.png', span: 'lg:col-span-2 lg:row-span-2' },
    { label: 'Oversized Essentials', desc: '', href: '/collections/oversized', img: '/images/bottoms.png', span: 'lg:col-span-1' },
    { label: 'Luxury Edit', desc: '', href: '/collections/premium', img: '/images/accessories.png', span: 'lg:col-span-1' },
  ]

  return (
    <>
      {/* ── Full-Bleed Editorial Hero ─────────────────────────────── */}
      <section className="relative w-full h-[100svh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 hero-zoom">
          <img src={storefront.image} alt="ATELIER Campaign" className="w-full h-full object-cover" />
        </div>
        {/* Gradient — only bottom third */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Hero copy — bottom-left, animated */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col pb-16 md:pb-24 px-6 md:px-16 max-w-[1440px] mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/70 mb-5 whitespace-pre-wrap"
          >
            {storefront.subtitle}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="font-editorial text-[clamp(40px,7vw,96px)] leading-[0.95] font-semibold text-white mb-8 tracking-tight max-w-4xl whitespace-pre-wrap"
          >
            {storefront.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to={storefront.buttonLink}
              className="px-8 py-4 bg-white text-black text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-black hover:text-white transition-all duration-300"
            >
              {storefront.buttonText}
            </Link>
            <Link
              to="/collections/men"
              className="px-8 py-4 border border-white text-white text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black transition-all duration-300"
            >
              Shop Men
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2 text-white/50">
          <span className="text-[9px] uppercase tracking-[0.3em] rotate-90 origin-center">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-white/30"
          />
        </div>
      </section>

      {/* ── Marquee Ticker ──────────────────────────────────────────── */}
      <Marquee />

      {/* ── Category Grid — asymmetric ───────────────────────────── */}
      <section className="py-20 md:py-32 px-6 md:px-16 max-w-[1440px] mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#747878] mb-2">Shop by Category</p>
            <h2 className="font-editorial text-[clamp(28px,3.5vw,48px)] leading-tight">Curated Worlds</h2>
          </div>
          <Link to="/products" className="text-[11px] uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity hidden md:block">
            See All
          </Link>
        </div>

        {/* Grid: first tile is large portrait, rest are smaller */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.label}
              to={cat.href}
              className={`group relative overflow-hidden ${i === 0 ? 'row-span-2 aspect-[2/3] md:aspect-auto md:col-span-1' : 'aspect-[3/4]'}`}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/60 mb-1">{cat.sub}</p>
                <h3 className="text-white font-semibold text-base tracking-wide">{cat.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Asymmetric Editorial Lookbook ────────────────────────── */}
      <section className="bg-[#F7F6F4] py-20 md:py-32 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#747878] mb-2">Editorial</p>
            <h2 className="font-editorial text-[clamp(28px,3.5vw,48px)] leading-tight">The Collections</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:h-[680px]">
            {EDITORIAL_PICKS.map((pick) => (
              <Link
                key={pick.label}
                to={pick.href}
                className={`group relative overflow-hidden ${pick.span} block`}
              >
                <img
                  src={pick.img}
                  alt={pick.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ minHeight: '320px' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-8">
                  {pick.desc && (
                    <p className="text-[10px] text-white/60 uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{pick.desc}</p>
                  )}
                  <h3 className="font-editorial text-2xl md:text-3xl text-white leading-tight">{pick.label}</h3>
                  <span className="inline-block mt-3 text-[10px] uppercase tracking-widest text-white/80 border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ─────────────────────────────────────────── */}
      <section className="py-20 md:py-32">
        <div className="px-6 md:px-16 max-w-[1440px] mx-auto mb-10 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#747878] mb-2">Just Landed</p>
            <h2 className="font-editorial text-[clamp(28px,3.5vw,48px)] leading-tight">New Arrivals</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={scrollLeft} className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <span className="material-symbols-outlined icon-sm">chevron_left</span>
              </button>
              <button onClick={scrollRight} className="w-10 h-10 rounded-full border border-[#EAEAEA] flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                <span className="material-symbols-outlined icon-sm">chevron_right</span>
              </button>
            </div>
            <Link to="/collections/new-arrivals" className="text-[11px] uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity hidden md:block">
              View All
            </Link>
          </div>
        </div>
        <div ref={sliderRef} className="flex gap-4 px-6 md:px-16 overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth">
          {newArrivals.map((p, i) => (
            <div key={p.id} className="flex-shrink-0 w-[240px] md:w-[290px] snap-start">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Flash Sale Banner ─────────────────────────────────────── */}
      <section className="border-y border-[#EAEAEA] bg-[#1A1A1A] py-14 md:py-20 px-6 md:px-16">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">Limited Time</p>
            <h2 className="font-editorial text-[clamp(28px,3.5vw,52px)] text-white leading-tight">Archive Sale</h2>
            <p className="text-sm text-white/50 mt-2 max-w-sm">Up to 40% off selected seasonal staples. Ends in:</p>
          </div>

          <div className="flex gap-8 text-center">
            {[{ v: h, l: 'Hours' }, { v: m, l: 'Mins' }, { v: s, l: 'Secs' }].map(({ v, l }) => (
              <div key={l} className="flex flex-col items-center">
                <span className="font-editorial text-[clamp(36px,5vw,64px)] text-white leading-none">{v}</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-1">{l}</span>
              </div>
            ))}
          </div>

          <Link
            to="/collections/sale"
            className="px-10 py-4 bg-white text-black text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#EAEAEA] transition-colors whitespace-nowrap"
          >
            Access Sale
          </Link>
        </div>
      </section>

      {/* ── Best Sellers ──────────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-6 md:px-16 max-w-[1440px] mx-auto">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#747878] mb-2">Most Loved</p>
            <h2 className="font-editorial text-[clamp(28px,3.5vw,48px)] leading-tight">Best Sellers</h2>
          </div>
          <Link to="/collections/best-sellers" className="text-[11px] uppercase tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity hidden md:block">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {bestSellers.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* ── Community / UGC ──────────────────────────────────────── */}
      <section className="pb-20 md:pb-32 px-6 md:px-16 max-w-[1440px] mx-auto">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#747878] mb-2">Community</p>
          <h2 className="font-editorial text-[clamp(28px,3.5vw,48px)] leading-tight">Community Voices</h2>
          <p className="text-sm text-[#747878] mt-3">Styled by you, curated by us. Tag <span className="font-semibold text-black">#ATELIERArchive</span> to be featured.</p>
        </div>
        <div className="columns-2 md:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
          {[
            '/images/outerwear.png',
            '/images/bottoms.png',
            '/images/sneakers.png',
            '/images/knitwear.png',
          ].map((src, i) => (
            <div key={i} className="relative group break-inside-avoid overflow-hidden">
              <img src={src} alt={`Community look ${i + 1}`} className="w-full h-auto block" loading="lazy" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Shop the Look</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
