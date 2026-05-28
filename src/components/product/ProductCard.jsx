import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import useCartStore from '../../store/useCartStore'
import useWishlistStore from '../../store/useWishlistStore'
import { formatPrice, cn } from '../../utils'
import toast from 'react-hot-toast'

export default function ProductCard({ product, className, index = 0 }) {
  const [isLoading, setIsLoading] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovering, setHovering] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const toggleItem = useWishlistStore(s => s.toggleItem)
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product.id))

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 220))
    addItem(product, product.sizes[0], product.colors[0])
    setIsLoading(false)
    toast.success(`${product.name} added`, {
      style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' },
    })
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleItem(product)
    toast.success(added ? '❤ Added to wishlist' : 'Removed from wishlist', {
      style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
      className={cn('group', className)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* ── Image Container ───────────────────────────────────── */}
        <div
          className="relative aspect-[3/4] overflow-hidden bg-[#F5F4F2] mb-3"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* Skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          {/* Main Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={cn(
              'w-full h-full object-cover transition-all duration-700',
              hovering ? 'scale-[1.06]' : 'scale-100',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
            loading="lazy"
          />

          {/* Overlay gradient on hover */}
          <motion.div
            animate={{ opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"
          />

          {/* Badge */}
          {product.badge && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={cn(
                'absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest z-10',
                product.badge === 'LIMITED' ? 'bg-primary text-white' :
                product.badge === 'NEW' ? 'bg-[#2559bd] text-white' :
                product.badge === 'SALE' ? 'bg-red-500 text-white' :
                'bg-primary text-white'
              )}
            >
              {product.badge}
            </motion.span>
          )}

          {/* Wishlist Button */}
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.85 }}
            animate={{ opacity: hovering || isWishlisted ? 1 : 0, y: hovering || isWishlisted ? 0 : -6 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span
              className={cn('material-symbols-outlined text-lg', isWishlisted ? 'text-red-500' : 'text-primary')}
              style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              favorite
            </span>
          </motion.button>

          {/* Quick Add Button */}
          <motion.button
            onClick={handleQuickAdd}
            disabled={isLoading}
            animate={{ y: hovering ? 0 : 60, opacity: hovering ? 1 : 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-primary text-on-primary py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-secondary transition-colors flex items-center justify-center gap-2 z-10"
          >
            {isLoading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="material-symbols-outlined text-sm"
                >
                  progress_activity
                </motion.span>
                Adding...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                Quick Add
              </>
            )}
          </motion.button>

          {/* Color swatches on hover */}
          {product.colors && product.colors.length > 1 && (
            <motion.div
              animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 6 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-14 left-3 flex gap-1.5 z-10"
            >
              {product.colors.slice(0, 5).map((c, i) => (
                <span
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* ── Info Panel ───────────────────────────────────────── */}
        <div className="space-y-1">
          {/* Category + Rating row */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {product.category}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-[10px] font-semibold text-on-surface-variant">
                {Number(product.rating).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Name */}
          <h4 className="font-semibold text-sm text-primary leading-tight group-hover:opacity-70 transition-opacity">
            {product.name}
          </h4>

          {/* Description */}
          {product.description && (
            <p className="text-xs text-on-surface-variant line-clamp-1 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Price row */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-bold text-sm text-primary">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xs text-outline line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {product.discount && (
              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Sizes available */}
          <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/20">
            <div className="flex gap-1">
              {product.sizes?.slice(0, 4).map(size => (
                <span key={size} className="text-[9px] font-semibold border border-outline-variant/40 px-1.5 py-0.5 text-on-surface-variant">
                  {size}
                </span>
              ))}
              {product.sizes?.length > 4 && (
                <span className="text-[9px] text-on-surface-variant self-center">+{product.sizes.length - 4}</span>
              )}
            </div>
            <div className="flex gap-1">
              {product.colors?.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-outline-variant/40"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              {product.colors?.length > 3 && (
                <span className="text-[9px] text-on-surface-variant self-center">+{product.colors.length - 3}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
