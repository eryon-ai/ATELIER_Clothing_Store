import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { api } from '../services/api'
import { SORT_OPTIONS, CLOTHING_SIZES, PRODUCT_COLORS } from '../constants'
import { cn } from '../utils'

const COLLECTION_META = {
  'new-arrivals': { title: 'New Arrivals', desc: 'The latest drops from the ATELIER studio.' },
  'best-sellers': { title: 'Best Sellers', desc: 'Our most loved pieces, as chosen by the community.' },
  trending: { title: 'Trending Now', desc: 'What the zeitgeist is reaching for.' },
  limited: { title: 'Limited Edition', desc: "Once it's gone, it's gone. Numbered, certified, permanent." },
  sale: { title: 'Archive Sale', desc: 'Past seasons, permanent aesthetics.' },
  premium: { title: 'Premium Edit', desc: 'The pinnacle of the ATELIER craft.' },
  women: { title: "Women's", desc: 'Structured silhouettes, feminine power.' },
  men: { title: "Men's", desc: 'Raw, refined, and deliberately considered.' },
  accessories: { title: 'Accessories', desc: 'The details that define the look.' },
  footwear: { title: 'Footwear', desc: 'The foundation of every outfit.' },
  sneakers: { title: 'Sneakers', desc: 'Sculptural footwear for the urban explorer.' },
  oversized: { title: 'Oversized', desc: 'Volume as a design principle.' },
  streetwear: { title: 'Streetwear', desc: 'Underground luxury meets street authenticity.' },
  anime: { title: 'Anime Archive', desc: 'Subculture meets high-craftsmanship.' },
  marvel: { title: 'Marvel × ATELIER', desc: 'Collaborative drops with the House of Ideas.' },
  collab: { title: 'Collaborations', desc: 'Limited capsules with cultural icons.' },
  gym: { title: 'Gym & Active', desc: 'Performance engineered for elite output.' },
  summer: { title: 'Summer Edit', desc: 'Lightweight luxury for the warmer season.' },
  winter: { title: 'Winter Edit', desc: 'Technical warmth with editorial intent.' },
  festival: { title: 'Festival Edit', desc: 'Statement pieces for the front row.' },
}

async function getProducts(slug) {
  switch (slug) {
    case 'new-arrivals': return api.getNewArrivals()
    case 'best-sellers': return api.getBestSellers()
    case 'trending': return api.getTrending()
    case 'limited': return api.getLimitedProducts()
    case 'sale': return api.getSaleProducts()
    case 'accessories': return api.getProductsByCategory('accessories')
    case 'footwear': return api.getProductsByCategory('footwear')
    case 'sneakers': return api.getProductsByCategory('sneakers')
    default:
      const all = await api.getProducts()
      if (slug === 'women') return all.filter(p => p.category === 'tops' || p.tags?.includes('women'))
      if (slug === 'men') return all.filter(p => p.category === 'bottoms' || p.tags?.includes('men') || p.collection === 'men')
      return all.filter(p => p.collection === slug || p.category === slug || p.tags?.includes(slug))
  }
}

export default function CollectionPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(true)
  const [view, setView] = useState('grid')
  const [baseProducts, setBaseProducts] = useState([])

  useEffect(() => {
    getProducts(slug).then(setBaseProducts)
  }, [slug])

  // URL-synced filter state
  const sort = searchParams.get('sort') || 'featured'
  const selectedSizes = searchParams.getAll('size')
  const selectedColors = searchParams.getAll('color')

  const updateParam = (key, value, multi = false) => {
    const next = new URLSearchParams(searchParams)
    if (multi) {
      const existing = next.getAll(key)
      if (existing.includes(value)) {
        next.delete(key)
        existing.filter(v => v !== value).forEach(v => next.append(key, v))
      } else {
        next.append(key, value)
      }
    } else {
      next.set(key, value)
    }
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (sort !== 'featured') next.set('sort', sort)
    setSearchParams(next, { replace: true })
  }

  const toggleSize = (size) => updateParam('size', size, true)
  const toggleColor = (color) => updateParam('color', color, true)
  const setSort = (val) => updateParam('sort', val)

  const meta = COLLECTION_META[slug] || { title: (slug || 'Collection').replace(/-/g, ' ').toUpperCase(), desc: '' }

  const sortedFiltered = useMemo(() => {
    let list = [...baseProducts]
    if (selectedSizes.length > 0) list = list.filter(p => p.sizes?.some(s => selectedSizes.includes(s)))
    if (selectedColors.length > 0) list = list.filter(p => p.colors?.some(c => selectedColors.includes(c.name)))

    switch (sort) {
      case 'newest': return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      case 'price-asc': return list.sort((a, b) => a.price - b.price)
      case 'price-desc': return list.sort((a, b) => b.price - a.price)
      case 'best-sellers': return list.sort((a, b) => b.reviewCount - a.reviewCount)
      case 'top-rated': return list.sort((a, b) => b.rating - a.rating)
      default: return list
    }
  }, [baseProducts, sort, selectedSizes, selectedColors])

  const [allProducts, setAllProducts] = useState([])
  useEffect(() => {
    api.getProducts().then(setAllProducts)
  }, [])

  const displayProducts = sortedFiltered.length > 0 ? sortedFiltered : allProducts.slice(0, 12)

  return (
    <div className="pt-[88px] min-h-screen bg-[#F5F5F5]">
      {/* Collection Header */}
      <div className="px-4 md:px-8 py-8 max-w-[1440px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] text-[#999999] mb-4">
          <Link to="/" className="hover:text-[#111111] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#111111] font-medium">{meta.title}</span>
        </nav>

        {/* Title area */}
        <div
          className="bg-white px-8 py-10 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
          style={{ borderRadius: 24 }}
        >
          <div>
            <h1 className="font-semibold text-[32px] md:text-[40px] text-[#111111] tracking-tight leading-tight">{meta.title}</h1>
            {meta.desc && <p className="text-[13px] text-[#666666] mt-2 max-w-lg">{meta.desc}</p>}
          </div>
          <p className="text-[12px] font-semibold text-[#999999] uppercase tracking-wide">{displayProducts.length} Products</p>
        </div>
      </div>

      <div className="flex max-w-[1440px] mx-auto px-4 md:px-8 pb-16 gap-6">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {filterOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="flex-shrink-0 overflow-hidden hidden md:block"
            >
              <div
                className="w-60 bg-white p-6 sticky top-[88px]"
                style={{ borderRadius: 24 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#111111]">Filters</h3>
                  <button onClick={clearFilters} className="text-[11px] font-semibold text-[#999999] hover:text-[#111111] transition-colors uppercase tracking-wide">
                    Clear all
                  </button>
                </div>

                {/* Size Filter */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#111111] mb-3">Size</h4>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CLOTHING_SIZES.map(size => (
                      <motion.button
                        key={size}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleSize(size)}
                        className={`h-9 text-center text-[11px] font-semibold uppercase tracking-wide transition-all duration-200
                          ${selectedSizes.includes(size)
                            ? 'bg-[#111111] text-white'
                            : 'bg-[#F5F5F5] text-[#666666] hover:bg-[#EAEAEA] hover:text-[#111111]'
                          }`}
                        style={{ borderRadius: 8 }}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className="mb-4">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#111111] mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_COLORS.map(color => (
                      <motion.button
                        key={color.name}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleColor(color.name)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full border-2 transition-all ring-2 ring-offset-1
                          ${selectedColors.includes(color.name)
                            ? 'ring-[#111111] border-[#111111]'
                            : 'ring-transparent border-transparent hover:border-[#CCCCCC]'
                          }`}
                        style={{ background: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                  <p className="text-[10px] text-[#999999] mt-4">
                    Filters synced to URL — share this link!
                  </p>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Sort & Filter Controls */}
          <div
            className="bg-white px-5 py-3 mb-5 flex justify-between items-center"
            style={{ borderRadius: 16 }}
          >
            <button
              onClick={() => setFilterOpen(o => !o)}
              className="hidden md:flex items-center gap-2 text-[12px] font-semibold text-[#666666] hover:text-[#111111] transition-colors uppercase tracking-wide"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>tune</span>
              {filterOpen ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex gap-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-[#111111] text-white' : 'text-[#999999] hover:text-[#111111]'}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-[#111111] text-white' : 'text-[#999999] hover:text-[#111111]'}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_list</span>
                </button>
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-[#F5F5F5] border-0 rounded-full text-[12px] font-semibold text-[#111111] px-4 py-2 outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {(selectedSizes.length > 0 || selectedColors.length > 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-4 overflow-hidden"
              >
                {selectedSizes.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSize(s)}
                    className="flex items-center gap-1.5 bg-[#111111] text-white text-[11px] font-semibold px-3 py-1.5 hover:opacity-80 transition-opacity"
                    style={{ borderRadius: 9999 }}
                  >
                    {s} <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
                  </button>
                ))}
                {selectedColors.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleColor(c)}
                    className="flex items-center gap-1.5 bg-[#111111] text-white text-[11px] font-semibold px-3 py-1.5 hover:opacity-80 transition-opacity"
                    style={{ borderRadius: 9999 }}
                  >
                    {c} <span className="material-symbols-outlined" style={{ fontSize: 12 }}>close</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            className={cn('grid gap-4', view === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3')}
          >
            <AnimatePresence>
              {displayProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
