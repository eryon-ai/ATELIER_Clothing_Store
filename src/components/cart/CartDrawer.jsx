import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'
import { formatPrice, cn } from '../../utils'
import { FREE_SHIPPING_THRESHOLD } from '../../constants'

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, getSubtotal, getItemCount, getShipping } = useCartStore()

  const subtotal = getSubtotal()
  const shipping = getShipping()
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)

  // Trap scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex justify-between items-center px-md py-md border-b border-outline-variant">
          <div className="flex items-center gap-sm">
            <h2 className="font-headline-md text-headline-md uppercase">My Cart</h2>
            {getItemCount() > 0 && (
              <span className="font-label-sm text-label-sm text-on-surface-variant">({getItemCount()})</span>
            )}
          </div>
          <button onClick={closeCart} className="material-symbols-outlined text-primary hover:opacity-70 transition-opacity">
            close
          </button>
        </div>

        {/* Free Shipping Bar */}
        <div className="px-md py-sm border-b border-outline-variant/50 bg-surface-container-low">
          {amountToFreeShipping > 0 ? (
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">
              {formatPrice(amountToFreeShipping)} away from free shipping
            </p>
          ) : (
            <p className="font-label-sm text-label-sm text-secondary uppercase mb-2">
              ✓ You qualify for free shipping!
            </p>
          )}
          <div className="h-1 bg-outline-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-md py-md space-y-sm">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-lg text-center">
              <span className="material-symbols-outlined icon-xl text-outline-variant">shopping_bag</span>
              <div>
                <h3 className="font-headline-md text-primary mb-2">Your bag is empty</h3>
                <p className="font-body-md text-on-surface-variant">Add your first piece to get started.</p>
              </div>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                <Link to="/products">Explore Collections</Link>
              </button>
            </div>
          ) : (
            items.map(item => (
              <CartItem
                key={item.key}
                item={item}
                onRemove={() => removeItem(item.key)}
                onUpdateQty={(qty) => updateQuantity(item.key, qty)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-outline-variant px-md py-md space-y-md bg-surface-container-low">
            {/* Subtotal */}
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md uppercase text-on-surface-variant">Subtotal</span>
              <span className="font-headline-md text-headline-md">{formatPrice(subtotal)}</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {shipping === 0 ? 'Free shipping included' : `+ ${formatPrice(shipping)} shipping`} · Taxes calculated at checkout
            </p>

            {/* CTA */}
            <Link
              to="/cart"
              onClick={closeCart}
              className="block w-full bg-primary text-on-primary text-center py-4 font-label-md text-label-md uppercase tracking-widest hover:bg-secondary transition-colors"
            >
              Checkout — {formatPrice(subtotal)}
            </Link>

            <Link
              to="/products"
              onClick={closeCart}
              className="block text-center font-label-md text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <div className="flex gap-md p-md glass-panel group hover:border-primary/30 transition-colors">
      {/* Image */}
      <Link to={`/products/${item.product.slug}`} className="w-20 h-24 bg-surface-container overflow-hidden flex-shrink-0">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between py-xs min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-label-md text-label-md uppercase truncate">{item.product.name}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-0.5">
              {item.selectedSize} {item.selectedColor && `/ ${item.selectedColor.name}`}
            </p>
          </div>
          <p className="font-label-md text-label-md flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
        </div>

        <div className="flex justify-between items-center">
          {/* Qty */}
          <div className="flex items-center border border-outline rounded-full px-3 py-1 gap-4">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="hover:text-primary transition-colors"
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined icon-sm">remove</span>
            </button>
            <span className="font-label-md text-body-md w-4 text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="hover:text-primary transition-colors"
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined icon-sm">add</span>
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={onRemove}
            className="text-on-surface-variant hover:text-error transition-colors p-1"
            aria-label="Remove item"
          >
            <span className="material-symbols-outlined icon-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
