import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useCartStore from '../../store/useCartStore'
import useWishlistStore from '../../store/useWishlistStore'
import { formatPrice, cn } from '../../utils'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

export default function ProductCard({ product, className, index = 0 }) {
  const [isLoading, setIsLoading] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [hovering, setHovering] = useState(false)
  const imgRef = useRef(null)
  const addItem = useCartStore(s => s.addItem)
  const toggleItem = useWishlistStore(s => s.toggleItem)
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product.id))

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImgLoaded(true)
    }
  }, [])

  const handleQuickAdd = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 220))
    addItem(product, product.sizes[0], product.colors[0])
    setIsLoading(false)
    toast.success(`${product.name} added`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleItem(product)
    toast.success(added ? '❤ Added to wishlist' : 'Removed from wishlist')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: (index % 4) * 0.07 }}
      className={cn('group', className)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* ── Image Container ───────────────────────────── */}
        <div
          className="relative overflow-hidden bg-[#F0EDE8] mb-3 img-crossfade-hover"
          style={{ borderRadius: 24, aspectRatio: '4/5' }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {/* Skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton" style={{ borderRadius: 24 }} />
          )}

          {/* Main Image */}
          <img
            ref={imgRef}
            src={product.images[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgLoaded(true); setImgError(true) }}
            className={cn(
              'img-primary absolute inset-0 w-full h-full object-cover',
              imgLoaded ? 'opacity-100' : 'opacity-0'
            )}
            loading="lazy"
          />

          {/* Hover image crossfade */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} — styled`}
              className="img-hover absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          )}

          {/* Subtle hover gradient */}
          <motion.div
            animate={{ opacity: hovering ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-gradient-to-t from-[#7f00ff]/30 via-[#00f2fe]/10 to-transparent pointer-events-none mix-blend-overlay"
            style={{ borderRadius: 24 }}
          />

          {/* Badge */}
          {product.badge && (
            <span
              className={cn(
                'badge-quiet absolute top-3 left-3 z-10',
                product.badge === 'SALE' ? 'sale' :
                product.badge === 'NEW' ? 'new' : 
                product.badge === 'LIMITED' ? 'limited' : ''
              )}
            >
              {product.badge === 'LIMITED' ? 'Limited' : product.badge}
            </span>
          )}

          {/* Wishlist button */}
          <motion.button
            onClick={handleWishlist}
            whileTap={{ scale: 0.85 }}
            animate={{ opacity: hovering || isWishlisted ? 1 : 0, y: hovering || isWishlisted ? 0 : -4 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span
              className={cn('material-symbols-outlined transition-colors duration-300', isWishlisted ? 'text-[#ff007f]' : 'text-[#111111]')}
              style={{ fontSize: 16, filter: isWishlisted ? 'drop-shadow(0 0 6px rgba(255,0,127,0.6))' : 'none', ...(isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}) }}
            >
              favorite
            </span>
          </motion.button>

          {/* Quick Add Button — pill at bottom */}
          <motion.button
            onClick={handleQuickAdd}
            disabled={isLoading}
            animate={{ y: hovering ? 0 : 50, opacity: hovering ? 1 : 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="absolute bottom-3 left-3 right-3 bg-funky-gradient text-white py-2.5 text-[11px] font-semibold flex items-center justify-center gap-1.5 z-10 glow-funky hover:opacity-90"
            style={{ borderRadius: 9999 }}
          >
            {isLoading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  className="material-symbols-outlined"
                  style={{ fontSize: 14 }}
                >
                  progress_activity
                </motion.span>
                Adding...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add_shopping_cart</span>
                Quick Add
              </>
            )}
          </motion.button>

          {/* Color swatches on hover */}
          {product.colors && product.colors.length > 1 && (
            <motion.div
              animate={{ opacity: hovering ? 1 : 0, y: hovering ? 0 : 4 }}
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

        {/* ── Info Panel ─────────────────────────────────── */}
        <div className="px-1 space-y-1">
          {/* Category label + Rating */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999999]">
              {product.category}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-amber-400 text-[11px]">★</span>
              <span className="text-[10px] font-semibold text-[#999999]">
                {Number(product.rating).toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h4 className="font-medium text-[14px] text-[#111111] leading-snug group-hover:opacity-70 transition-opacity">
            {product.name}
          </h4>

          {/* Price */}
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-semibold text-[14px] text-[#111111]">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[12px] text-[#999999] line-through">{formatPrice(product.comparePrice)}</span>
            )}
            {product.discount && (
              <span className="text-[10px] font-bold text-white bg-[#ff007f] px-1.5 py-0.5 rounded-full glow-funky">
                -{product.discount}%
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    comparePrice: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    badge: PropTypes.string,
    sizes: PropTypes.arrayOf(PropTypes.string),
    colors: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.string
    }))
  }).isRequired,
  className: PropTypes.string,
  index: PropTypes.number
}
