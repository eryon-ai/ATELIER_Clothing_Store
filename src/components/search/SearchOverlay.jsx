import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useSearchStore from '../../store/useSearchStore'
import { formatPrice } from '../../utils'

const CATEGORIES_QUICK = [
  { label: 'Outerwear', icon: 'check_box_outline_blank', href: '/collections/outerwear' },
  { label: 'Knitwear', icon: 'grid_view', href: '/collections/knitwear' },
  { label: 'Footwear', icon: 'sprint', href: '/collections/footwear' },
  { label: 'Accessories', icon: 'watch', href: '/collections/accessories' },
  { label: 'New Arrivals', icon: 'new_releases', href: '/collections/new-arrivals' },
  { label: 'Sale', icon: 'sell', href: '/collections/sale' },
]

export default function SearchOverlay() {
  const {
    isOpen, closeSearch, query, setQuery, results,
    recentSearches, trendingSearches, clearRecentSearches, addRecentSearch,
  } = useSearchStore()
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const [activeIdx, setActiveIdx] = useState(-1)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeSearch()
      if (e.key === 'ArrowDown') setActiveIdx(i => Math.min(i + 1, results.length - 1))
      if (e.key === 'ArrowUp') setActiveIdx(i => Math.max(i - 1, -1))
      if (e.key === 'Enter' && activeIdx >= 0 && results[activeIdx]) {
        navigate(`/products/${results[activeIdx].slug}`)
        closeSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSearch, activeIdx, results, navigate])

  useEffect(() => setActiveIdx(-1), [query])

  const handleSearch = (term) => {
    if (!term.trim()) return
    addRecentSearch(term)
    navigate(`/products?q=${encodeURIComponent(term)}`)
    closeSearch()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(query)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl max-h-[92vh] flex flex-col"
          >
            {/* ── Search Bar ─────────────────────────────────────── */}
            <div className="border-b border-outline-variant/30 bg-white">
              <div className="max-w-7xl mx-auto px-6 md:px-12">
                <form onSubmit={handleSubmit} className="flex items-center gap-4 py-5">
                  <motion.span
                    animate={{ scale: query ? 1.2 : 1, color: query ? '#000' : '#9B9B8E' }}
                    className="material-symbols-outlined text-3xl flex-shrink-0"
                    style={{ transition: 'all 0.2s' }}
                  >
                    search
                  </motion.span>

                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search products, styles, collections..."
                    className="flex-1 bg-transparent border-none outline-none text-2xl md:text-4xl font-bold tracking-tight text-primary placeholder:text-outline-variant/50 font-sans"
                  />

                  <AnimatePresence>
                    {query && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setQuery('')}
                        className="material-symbols-outlined text-outline hover:text-primary transition-colors flex-shrink-0"
                      >
                        close
                      </motion.button>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={closeSearch}
                    className="hidden md:flex items-center gap-1 text-xs text-on-surface-variant border border-outline-variant px-2 py-1 rounded flex-shrink-0 hover:border-primary hover:text-primary transition-all"
                  >
                    <span className="text-[10px]">ESC</span>
                  </button>
                </form>

                {/* Animated underline */}
                <motion.div
                  className="h-px bg-primary"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
            </div>

            {/* ── Content ─────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
                <AnimatePresence mode="wait">
                  {query.length > 1 ? (
                    /* ── Search Results ── */
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                          {results.length > 0 ? `${results.length} Results for` : 'No results for'}
                          {' '}
                          <span className="text-primary">"{query}"</span>
                        </p>
                        {results.length > 0 && (
                          <button
                            onClick={() => handleSearch(query)}
                            className="text-xs font-semibold uppercase tracking-widest text-primary border-b border-primary hover:opacity-70 transition-opacity"
                          >
                            View All →
                          </button>
                        )}
                      </div>

                      {results.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-20"
                        >
                          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">search_off</span>
                          <p className="text-on-surface-variant">Try "parka", "oversized", or "knitwear"</p>
                        </motion.div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {results.map((product, i) => (
                            <motion.button
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.25 }}
                              onClick={() => { navigate(`/products/${product.slug}`); closeSearch() }}
                              className={`text-left group rounded-sm overflow-hidden border-2 transition-all ${activeIdx === i ? 'border-primary' : 'border-transparent'}`}
                            >
                              <div className="aspect-[3/4] bg-surface-container overflow-hidden">
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <div className="p-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-0.5">{product.category}</p>
                                <h4 className="font-semibold text-sm text-primary leading-tight">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                                  {product.comparePrice && (
                                    <p className="text-xs text-outline line-through">{formatPrice(product.comparePrice)}</p>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    /* ── Default State ── */
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-10"
                    >
                      {/* Quick Categories */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4">Browse</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {CATEGORIES_QUICK.map((cat, i) => (
                            <motion.button
                              key={cat.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => { navigate(cat.href); closeSearch() }}
                              className="flex items-center gap-3 border border-outline-variant/50 px-4 py-3 hover:border-primary hover:bg-surface-container-lowest group transition-all text-left"
                            >
                              <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-primary transition-colors">{cat.icon}</span>
                              <span className="text-xs font-semibold uppercase tracking-widest text-primary">{cat.label}</span>
                              <span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-primary ml-auto transition-colors">arrow_forward</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Trending */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">trending_up</span>
                            Trending Searches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {trendingSearches.map((term, i) => (
                              <motion.button
                                key={term}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.04 }}
                                onClick={() => handleSearch(term)}
                                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-outline-variant hover:border-primary hover:bg-primary hover:text-white transition-all"
                              >
                                {term}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Recent */}
                        {recentSearches.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">history</span>
                                Recent
                              </p>
                              <button
                                onClick={clearRecentSearches}
                                className="text-xs text-outline hover:text-primary transition-colors uppercase tracking-wider"
                              >
                                Clear
                              </button>
                            </div>
                            <div className="space-y-1">
                              {recentSearches.map((term, i) => (
                                <motion.button
                                  key={term}
                                  initial={{ opacity: 0, x: 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04 }}
                                  onClick={() => handleSearch(term)}
                                  className="flex items-center gap-3 py-2 w-full text-left hover:text-primary transition-colors group border-b border-outline-variant/20 last:border-0"
                                >
                                  <span className="material-symbols-outlined text-sm text-outline group-hover:text-primary">north_west</span>
                                  <span className="text-sm text-on-surface-variant group-hover:text-primary font-medium">{term}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
