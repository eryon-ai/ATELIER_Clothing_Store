import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import { PRODUCTS, getProductsByCategory, getProductsByCollection, getBestSellers, getNewArrivals, getLimitedProducts, getSaleProducts, getTrending } from '../mock/products'
import { SORT_OPTIONS, CLOTHING_SIZES, PRODUCT_COLORS } from '../constants'
import { cn } from '../utils'

const COLLECTION_META = {
  'new-arrivals': { title: 'New Arrivals', desc: 'The latest drops from the ATELIER studio.' },
  'best-sellers': { title: 'Best Sellers', desc: 'Our most loved pieces, as chosen by the community.' },
  trending: { title: 'Trending Now', desc: 'What the zeitgeist is reaching for.' },
  limited: { title: 'Limited Edition', desc: 'Once it\'s gone, it\'s gone. Numbered, certified, permanent.' },
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

function getProducts(slug) {
  switch (slug) {
    case 'new-arrivals': return getNewArrivals()
    case 'best-sellers': return getBestSellers()
    case 'trending': return getTrending()
    case 'limited': return getLimitedProducts()
    case 'sale': return getSaleProducts()
    case 'women': return PRODUCTS.filter(p => p.category === 'tops' || p.tags?.includes('women'))
    case 'men': return PRODUCTS.filter(p => p.category === 'bottoms' || p.tags?.includes('men') || p.collection === 'men')
    case 'accessories': return getProductsByCategory('accessories')
    case 'footwear': return getProductsByCategory('footwear')
    case 'sneakers': return getProductsByCategory('sneakers')
    default: return PRODUCTS.filter(p => p.collection === slug || p.category === slug || p.tags?.includes(slug))
  }
}

export default function CollectionPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(true)
  const [view, setView] = useState('grid')

  // URL-synced filter state (Phase 22)
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
  const rawProducts = useMemo(() => getProducts(slug || 'all'), [slug])

  const sortedFiltered = useMemo(() => {
    let list = [...rawProducts]
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
  }, [rawProducts, sort, selectedSizes, selectedColors])

  const displayProducts = sortedFiltered.length > 0 ? sortedFiltered : PRODUCTS.slice(0, 12)

  return (
    <div className="pt-20">
      {/* Collection Header */}
      <div className="px-margin-desktop py-xl max-w-8xl mx-auto border-b border-outline-variant">
        <nav className="flex items-center gap-xs font-label-sm text-label-sm text-outline mb-4">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="material-symbols-outlined icon-sm">chevron_right</span>
          <span className="text-primary">{meta.title}</span>
        </nav>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-display-lg text-primary uppercase">{meta.title}</h1>
            {meta.desc && <p className="font-body-md text-body-md text-on-surface-variant mt-2">{meta.desc}</p>}
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant uppercase">{displayProducts.length} products</p>
        </div>
      </div>

      <div className="flex max-w-8xl mx-auto">
        {/* Filter Sidebar */}
        <AnimatePresence>
          {filterOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 256, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex-shrink-0 border-r border-outline-variant overflow-hidden hidden md:block"
            >
              <div className="w-64 px-md py-lg">
                <div className="flex justify-between items-center mb-lg">
                  <h3 className="font-label-md text-label-md uppercase">Filters</h3>
                  <button onClick={clearFilters} className="font-label-sm text-outline hover:text-primary uppercase text-xs">Clear all</button>
                </div>

                {/* Size Filter */}
                <div className="mb-lg">
                  <h4 className="font-label-md text-label-md uppercase mb-md text-xs font-bold tracking-widest">Size</h4>
                  <div className="grid grid-cols-3 gap-xs">
                    {CLOTHING_SIZES.map(size => (
                      <motion.button
                        key={size}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleSize(size)}
                        className={`h-10 border text-center text-xs font-semibold uppercase tracking-wide transition-all ${selectedSizes.includes(size) ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant hover:border-primary'}`}
                      >
                        {size}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Filter */}
                <div className="mb-lg">
                  <h4 className="font-label-md text-label-md uppercase mb-md text-xs font-bold tracking-widest">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_COLORS.map(color => (
                      <motion.button
                        key={color.name}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleColor(color.name)}
                        title={color.name}
                        className={`w-7 h-7 rounded-full border-2 transition-all ring-2 ring-offset-1 ${selectedColors.includes(color.name) ? 'ring-primary border-primary' : 'ring-transparent border-transparent hover:border-outline-variant'}`}
                        style={{ background: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* URL hint */}
                {(selectedSizes.length > 0 || selectedColors.length > 0) && (
                  <p className="text-[10px] text-on-surface-variant/60 mt-4">
                    Filters synced to URL — share this link!
                  </p>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1 px-margin-desktop py-lg min-w-0">
          {/* Sort bar */}
          <div className="flex justify-between items-center mb-lg">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className="hidden md:flex items-center gap-sm font-label-md text-label-md uppercase hover:text-primary transition-colors text-xs font-semibold"
            >
              <span className="material-symbols-outlined icon-sm">tune</span>
              {filterOpen ? 'Hide' : 'Filter'}
            </button>

            <div className="flex items-center gap-md ml-auto">
              <div className="flex gap-xs">
                <button onClick={() => setView('grid')} className={`material-symbols-outlined icon-sm ${view === 'grid' ? 'text-primary' : 'text-outline-variant'}`}>grid_view</button>
                <button onClick={() => setView('list')} className={`material-symbols-outlined icon-sm ${view === 'list' ? 'text-primary' : 'text-outline-variant'}`}>view_list</button>
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-transparent border-b border-primary font-label-md text-label-md uppercase outline-none cursor-pointer py-1 px-2 text-xs"
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
                className="flex flex-wrap gap-xs mb-md overflow-hidden"
              >
                {selectedSizes.map(s => (
                  <button key={s} onClick={() => toggleSize(s)} className="flex items-center gap-xs font-label-sm text-label-sm border border-primary px-sm py-xs hover:bg-primary hover:text-on-primary transition-all text-xs">
                    {s} <span className="material-symbols-outlined icon-sm">close</span>
                  </button>
                ))}
                {selectedColors.map(c => (
                  <button key={c} onClick={() => toggleColor(c)} className="flex items-center gap-xs font-label-sm text-label-sm border border-primary px-sm py-xs hover:bg-primary hover:text-on-primary transition-all text-xs">
                    {c} <span className="material-symbols-outlined icon-sm">close</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            layout
            className={cn('grid gap-gutter', view === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3')}
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
