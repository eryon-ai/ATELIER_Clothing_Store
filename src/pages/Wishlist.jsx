import useWishlistStore from '../store/useWishlistStore'
import useCartStore from '../store/useCartStore'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#111', color: '#fff', fontFamily: 'Inter', fontSize: '12px', borderRadius: '9999px' },
}

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)

  const handleMoveToCart = (product) => {
    addItem(product, product.sizes[0], product.colors[0])
    removeItem(product.id)
    toast.success('Moved to cart', TOAST_STYLE)
  }

  return (
    <div className="pt-[88px] min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999999] mb-1">Saved</p>
            <h1 className="text-[28px] md:text-[36px] font-semibold text-[#111111] tracking-tight">
              My Wishlist
              {items.length > 0 && <span className="text-[#999999] font-normal text-[22px] ml-3">({items.length})</span>}
            </h1>
            <p className="text-[13px] text-[#666666] mt-1">Save your future ATELIER pieces here.</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-[12px] font-semibold text-red-500 hover:opacity-70 transition-opacity uppercase tracking-wide"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white flex flex-col items-center justify-center py-24 gap-5 text-center" style={{ borderRadius: 32 }}>
            <span className="material-symbols-outlined text-[#DDDDDD]" style={{ fontSize: 64 }}>favorite</span>
            <div>
              <h2 className="text-[22px] font-semibold text-[#111111] mb-2">Your wishlist is empty</h2>
              <p className="text-[13px] text-[#666666]">Save pieces you love by hitting the ♡ on any product.</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center justify-center bg-[#111111] text-white text-[12px] font-semibold px-8 py-3.5 hover:opacity-80 transition-opacity"
              style={{ borderRadius: 9999 }}
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(product => (
              <div key={product.id} className="group">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-[#F0EDE8] mb-3" style={{ borderRadius: 24, aspectRatio: '3/4' }}>
                  <Link to={`/products/${product.slug}`} className="block w-full h-full">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#111111] text-white px-2.5 py-1" style={{ borderRadius: 9999 }}>
                        {product.badge}
                      </span>
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <span className="material-symbols-outlined text-[#999999] hover:text-red-500" style={{ fontSize: 15 }}>close</span>
                  </button>
                </div>

                {/* Info */}
                <div className="px-0.5 mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#999999]">{product.category}</p>
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="text-[14px] font-medium text-[#111111] hover:opacity-70 transition-opacity truncate">{product.name}</h3>
                  </Link>
                  <p className="text-[13px] font-semibold text-[#111111] mt-0.5">{formatPrice(product.price)}</p>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="w-full bg-[#111111] text-white py-2.5 text-[11px] font-semibold hover:opacity-80 transition-opacity uppercase tracking-wide"
                  style={{ borderRadius: 9999 }}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
