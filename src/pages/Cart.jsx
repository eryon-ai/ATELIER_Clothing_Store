import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/useCartStore'
import { PRODUCTS } from '../mock/products'
import { formatPrice } from '../utils'
import { COUPON_CODES } from '../constants'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' },
}

const STEPS = ['Cart', 'Address', 'Payment', 'Review']

export default function CartPage() {
  const { items, removeItem, updateQuantity, coupon, applyCoupon, removeCoupon,
    getSubtotal, getDiscount, getShipping, getTax, getTotal, getItemCount, clearCart } = useCartStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [couponCode, setCouponCode] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [address, setAddress] = useState({ name: '', email: '', street: '', city: '', postal: '', country: 'US' })
  const [payMethod, setPayMethod] = useState('card')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shipping = getShipping()
  const tax = getTax()
  const total = getTotal()
  const count = getItemCount()

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode)
    toast[result.success ? 'success' : 'error'](result.message, TOAST_STYLE)
    if (result.success) setCouponCode('')
  }

  const handlePlaceOrder = () => {
    clearCart()
    setOrderPlaced(true)
  }

  // ── Success Screen ─────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-xl max-w-lg">
          <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-lg flex items-center justify-center animate-fade-in">
            <span className="material-symbols-outlined text-on-primary icon-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-sm uppercase">Order Confirmed</h2>
          <p className="font-body-lg text-on-surface-variant mb-lg">
            Your ATELIER pieces are being prepared. Check your email for details.
          </p>
          <Link to="/" className="font-label-md text-label-md text-primary uppercase tracking-widest border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen">
      {/* Free Shipping Progress */}
      <div className="w-full bg-surface-container-low px-margin-desktop py-4 flex flex-col items-center border-b border-outline-variant/30">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-end mb-2">
            <p className="font-label-md text-[10px] text-primary uppercase">
              {subtotal >= 500 ? '✓ You qualify for free shipping!' : `$${(500 - subtotal).toFixed(0)} away from free express shipping`}
            </p>
            <p className="font-label-md text-[10px] text-on-surface-variant uppercase">ELIGIBLE REGIONS: GLOBAL</p>
          </div>
          <div className="h-1 w-full bg-outline-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {step > 0 && (
        <div className="px-margin-desktop py-md border-b border-outline-variant max-w-8xl mx-auto">
          <div className="flex items-center gap-sm">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-sm">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-label-sm text-[10px] border ${i <= step ? 'bg-primary text-on-primary border-primary' : 'border-outline text-on-surface-variant'}`}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className={`font-label-md text-label-md uppercase ${i === step ? 'text-primary' : 'text-on-surface-variant'}`}>{s}</span>
                {i < STEPS.length - 1 && <span className="text-outline-variant mx-2">—</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="px-margin-mobile md:px-margin-desktop py-xl grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-8xl mx-auto">
        {/* Left Column */}
        <div className="lg:col-span-8">
          {/* ── STEP 0: Cart Items ────────────────────────────────── */}
          {step === 0 && (
            <div>
              <h1 className="font-headline-lg text-headline-lg mb-lg uppercase">
                MY CART <span className="text-on-surface-variant font-light ml-4">({count})</span>
              </h1>

              {items.length === 0 ? (
                <div className="py-xl text-center">
                  <span className="material-symbols-outlined icon-xl text-outline-variant">shopping_bag</span>
                  <h3 className="font-headline-md text-primary mt-md mb-sm">Your bag is empty</h3>
                  <Link to="/products" className="btn-primary inline-block">Shop Now</Link>
                </div>
              ) : (
                <div className="space-y-sm">
                  {items.map(item => (
                    <div key={item.key} className="flex gap-md p-md glass-panel group hover:border-primary/30 transition-colors">
                      <Link to={`/products/${item.product.slug}`} className="w-32 h-40 bg-surface-container overflow-hidden">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between py-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-headline-md text-headline-md uppercase">{item.product.name}</h3>
                            <p className="font-label-md text-label-md text-on-surface-variant mt-1 uppercase">
                              SIZE: {item.selectedSize} / {item.selectedColor?.name}
                            </p>
                          </div>
                          <p className="font-headline-md text-headline-md">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center border border-outline rounded-full px-4 py-2 gap-6">
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="hover:text-primary transition-colors">
                              <span className="material-symbols-outlined icon-sm">remove</span>
                            </button>
                            <span className="font-label-md text-body-lg">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="hover:text-primary transition-colors">
                              <span className="material-symbols-outlined icon-sm">add</span>
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.key)} className="text-on-surface-variant hover:text-error transition-colors p-2">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon */}
              {items.length > 0 && (
                <div className="mt-lg border border-outline-variant p-md">
                  <h3 className="font-label-md text-label-md uppercase mb-sm">Promo Code</h3>
                  {coupon ? (
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-secondary uppercase">{coupon.code} — {coupon.label}</span>
                      <button onClick={removeCoupon} className="text-error font-label-sm uppercase">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-sm">
                      <input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="input-ghost flex-1 text-sm"
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button onClick={handleApplyCoupon} className="btn-primary text-sm">Apply</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: Address ───────────────────────────────────── */}
          {step === 1 && (
            <div>
              <button onClick={() => setStep(0)} className="flex items-center gap-1 font-label-md text-label-md uppercase hover:text-primary mb-lg group">
                <span className="material-symbols-outlined icon-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Cart
              </button>
              <h2 className="font-headline-md text-headline-md uppercase mb-lg">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {[
                  { key: 'name', placeholder: 'FULL NAME', type: 'text', span: false },
                  { key: 'email', placeholder: 'EMAIL ADDRESS', type: 'email', span: false },
                  { key: 'street', placeholder: 'STREET ADDRESS', type: 'text', span: true },
                  { key: 'city', placeholder: 'CITY', type: 'text', span: false },
                  { key: 'postal', placeholder: 'POSTAL CODE', type: 'text', span: false },
                ].map(f => (
                  <div key={f.key} className={f.span ? 'md:col-span-2' : ''}>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={address[f.key]}
                      onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))}
                      className="input-ghost"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment ───────────────────────────────────── */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 font-label-md text-label-md uppercase hover:text-primary mb-lg group">
                <span className="material-symbols-outlined icon-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Address
              </button>
              <h2 className="font-headline-md text-headline-md uppercase mb-lg">Payment Method</h2>
              <div className="grid grid-cols-3 gap-md mb-lg">
                {[
                  { id: 'card', label: 'Credit Card', icon: 'credit_card' },
                  { id: 'upi', label: 'UPI / Razorpay', icon: 'payments' },
                  { id: 'apple', label: 'Apple Pay', icon: 'apple' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`flex flex-col items-center justify-center gap-sm p-lg glass-panel transition-all group border-2 ${payMethod === m.id ? 'border-primary' : 'border-transparent hover:border-outline-variant'}`}
                  >
                    <span className={`material-symbols-outlined icon-xl ${payMethod === m.id ? 'text-primary' : 'text-on-surface-variant'}`}>{m.icon}</span>
                    <span className="font-label-md text-xs uppercase">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-lg glass-panel space-y-md bg-surface-container-low">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-label-md text-xs text-on-surface-variant uppercase">Secure Encrypted Checkout</span>
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input placeholder="CARD NUMBER" className="input-ghost" />
                <div className="grid grid-cols-2 gap-gutter">
                  <input placeholder="MM/YY" className="input-ghost" />
                  <input placeholder="CVV" className="input-ghost" type="password" />
                </div>
                <input placeholder="CARDHOLDER NAME" className="input-ghost" />
              </div>
            </div>
          )}

          {/* ── STEP 3: Review ────────────────────────────────────── */}
          {step === 3 && (
            <div>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 font-label-md text-label-md uppercase hover:text-primary mb-lg group">
                <span className="material-symbols-outlined icon-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Payment
              </button>
              <h2 className="font-headline-md text-headline-md uppercase mb-lg">Review Order</h2>
              <div className="space-y-sm">
                {items.map(item => (
                  <div key={item.key} className="flex gap-md items-center py-sm border-b border-outline-variant">
                    <div className="w-16 h-20 bg-surface-container overflow-hidden">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-label-md text-label-md uppercase">{item.product.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Size: {item.selectedSize} · Qty: {item.quantity}</p>
                    </div>
                    <p className="font-label-md text-label-md">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-lg p-md bg-surface-container-low border border-outline-variant">
                <p className="font-label-md text-label-md uppercase mb-sm">Shipping To:</p>
                <p className="font-body-md text-on-surface-variant">{address.name}, {address.street}, {address.city} {address.postal}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-32 glass-panel p-lg deep-aura bg-surface">
            <h2 className="font-headline-md text-headline-md mb-md uppercase tracking-tight">Order Summary</h2>
            <div className="space-y-sm font-label-md text-sm border-b border-outline-variant pb-md mb-md">
              <div className="flex justify-between"><span className="text-on-surface-variant">SUBTOTAL</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-secondary"><span>DISCOUNT</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-on-surface-variant">TAX (GST/VAT)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-on-surface-variant">SHIPPING</span><span className={shipping === 0 ? 'text-secondary font-bold' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            </div>
            <div className="flex justify-between font-headline-md text-headline-md mb-lg">
              <span>TOTAL</span><span>{formatPrice(total)}</span>
            </div>

            {items.length > 0 && (
              step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="w-full bg-primary text-on-primary py-4 font-label-md text-label-md rounded-full hover:bg-secondary transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                  {step === 0 ? 'Proceed to Checkout' : step === 1 ? 'Continue to Payment' : 'Review Order'}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-secondary text-on-secondary py-4 font-label-md text-label-md rounded-full hover:bg-on-secondary-fixed-variant transition-all active:scale-[0.98] uppercase tracking-widest"
                >
                  Complete Payment
                </button>
              )
            )}

            <div className="mt-md space-y-sm">
              <p className="font-label-md text-[10px] text-on-surface-variant text-center uppercase">Secure 256-bit SSL Payment</p>
              <div className="flex justify-center gap-md text-outline opacity-40">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="material-symbols-outlined text-sm">shield</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Recommendations */}
      <section className="px-margin-desktop py-xl bg-surface-container-low border-t border-outline-variant">
        <div className="max-w-8xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg mb-lg uppercase">Recommended For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {PRODUCTS.slice(0, 4).map(p => (
              <Link key={p.id} to={`/products/${p.slug}`} className="group cursor-pointer">
                <div className="relative overflow-hidden aspect-[3/4] bg-surface-container mb-sm">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {p.badge && <div className="absolute bottom-4 left-4 bg-background px-3 py-1 font-label-md text-[10px] border border-outline-variant uppercase">{p.badge}</div>}
                </div>
                <h4 className="font-headline-md text-sm uppercase">{p.name}</h4>
                <p className="font-label-md text-xs text-on-surface-variant">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
