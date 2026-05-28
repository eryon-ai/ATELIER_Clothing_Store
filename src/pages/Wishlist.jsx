import useWishlistStore from '../store/useWishlistStore'
import useCartStore from '../store/useCartStore'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' },
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
    <div className="pt-24 pb-xl px-margin-desktop max-w-8xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-lg">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary uppercase">
            My Wishlist
            {items.length > 0 && <span className="text-on-surface-variant font-light ml-4 text-headline-md">({items.length})</span>}
          </h1>
          <p className="font-body-md text-on-surface-variant mt-1">Save your future ATELIER pieces here.</p>
        </div>
        {items.length > 0 && (
          <button onClick={clearWishlist} className="font-label-md text-label-md uppercase text-error hover:opacity-70 transition-opacity">
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[20vh] gap-lg text-center">
          <span className="material-symbols-outlined icon-xl text-outline-variant">favorite</span>
          <div>
            <h2 className="font-headline-md text-primary mb-2">Your wishlist is empty</h2>
            <p className="font-body-md text-on-surface-variant">Save pieces you love by hitting the ♡ on any product.</p>
          </div>
          <Link to="/products" className="btn-primary inline-block">Explore Collections</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {items.map(product => (
            <div key={product.id} className="group relative">
              {/* Product Image */}
              <Link to={`/products/${product.slug}`} className="block aspect-[3/4] bg-surface-container overflow-hidden mb-sm">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 uppercase">
                    {product.badge}
                  </span>
                )}
              </Link>

              {/* Info */}
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">{product.category}</p>
              <Link to={`/products/${product.slug}`}>
                <h3 className="font-title-lg text-primary hover:text-secondary transition-colors">{product.name}</h3>
              </Link>
              <p className="font-body-md text-primary mb-sm">{formatPrice(product.price)}</p>

              {/* Actions */}
              <div className="flex gap-xs">
                <button
                  onClick={() => handleMoveToCart(product)}
                  className="flex-1 bg-primary text-on-primary py-2 font-label-md text-label-md uppercase text-xs hover:bg-secondary transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="border border-outline-variant p-2 hover:border-error hover:text-error transition-colors"
                  aria-label="Remove"
                >
                  <span className="material-symbols-outlined icon-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
