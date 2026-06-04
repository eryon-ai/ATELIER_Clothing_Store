import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useCartStore from '../store/useCartStore'
import { api } from '../services/api'
import { formatPrice } from '../utils'
import { COUPON_CODES } from '../constants'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#111', color: '#fff', fontFamily: 'Inter', fontSize: '12px', borderRadius: '9999px' },
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

  const [suggested, setSuggested] = useState([])
  useEffect(() => {
    api.getProducts().then(res => setSuggested(res.slice(0, 4)))
  }, [])

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponCode)
    toast[result.success ? 'success' : 'error'](result.message, TOAST_STYLE)
    if (result.success) setCouponCode('')
  }

  const handlePlaceOrder = () => {
    clearCart()
    setOrderPlaced(true)
  }

  // ── Success Screen ──────────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="bg-white text-center p-12 max-w-lg w-full mx-4" style={{ borderRadius: 32 }}>
          <div className="w-20 h-20 bg-[#111111] rounded-full mx-auto mb-6 flex items-center justify-center animate-fade-in">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          <h2 className="text-[26px] font-semibold text-[#111111] mb-3">Order Confirmed</h2>
          <p className="text-[14px] text-[#666666] mb-8">
            Your ATELIER pieces are being prepared. Check your email for details.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-[#111111] text-white text-[12px] font-semibold px-8 py-3.5 hover:opacity-80 transition-opacity"
            style={{ borderRadius: 9999 }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[88px] min-h-screen bg-[#F5F5F5]">
      {/* Free Shipping Progress Bar */}
      <div className="px-4 md:px-8 py-4">
        <div className="max-w-[1440px] mx-auto bg-white px-6 py-4" style={{ borderRadius: 16 }}>
          <div className="flex justify-between items-end mb-2">
            <p className="text-[11px] font-semibold text-[#111111] uppercase tracking-wide">
              {subtotal >= 500 ? '✓ You qualify for free shipping!' : `$${(500 - subtotal).toFixed(0)} away from free express shipping`}
            </p>
            <p className="text-[10px] text-[#999999] uppercase tracking-wide">ELIGIBLE REGIONS: GLOBAL</p>
          </div>
          <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
            <div className="h-full bg-[#111111] transition-all duration-700 ease-out rounded-full" style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      {step > 0 && (
        <div className="px-4 md:px-8 pb-4">
          <div className="max-w-[1440px] mx-auto bg-white px-6 py-4 overflow-x-auto hide-scrollbar" style={{ borderRadius: 16 }}>
            <div className="flex items-center gap-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                    ${i <= step ? 'bg-[#111111] text-white' : 'bg-[#F5F5F5] text-[#999999]'}`}
                  >
                    {i < step ? '✓' : i + 1}
                  </span>
                  <span className={`text-[12px] font-semibold uppercase tracking-wide
                    ${i === step ? 'text-[#111111]' : 'text-[#999999]'}`}>{s}</span>
                  {i < STEPS.length - 1 && <span className="text-[#EAEAEA] mx-1">—</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="px-4 md:px-8 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-[1440px] mx-auto">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-4">

          {/* ── STEP 0: Cart Items */}
          {step === 0 && (
            <div className="bg-white p-6 md:p-8" style={{ borderRadius: 24 }}>
              <h1 className="text-[24px] font-semibold text-[#111111] mb-6 uppercase tracking-tight">
                My Cart <span className="text-[#999999] font-normal text-[18px]">({count})</span>
              </h1>

              {items.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-[#CCCCCC]" style={{ fontSize: 56 }}>shopping_bag</span>
                  <h3 className="text-[20px] font-semibold text-[#111111] mt-4 mb-2">Your bag is empty</h3>
                  <p className="text-[13px] text-[#666666] mb-6">Discover something you love</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center bg-[#111111] text-white text-[12px] font-semibold px-8 py-3.5 hover:opacity-80 transition-opacity"
                    style={{ borderRadius: 9999 }}
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div
                      key={item.key}
                      className="flex gap-4 p-4 bg-[#F9F9F9] group hover:bg-[#F5F5F5] transition-colors"
                      style={{ borderRadius: 16 }}
                    >
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="w-24 h-32 overflow-hidden flex-shrink-0"
                        style={{ borderRadius: 12 }}
                      >
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-[14px] text-[#111111] uppercase truncate">{item.product.name}</h3>
                            <p className="text-[11px] text-[#999999] mt-0.5 uppercase tracking-wide">
                              SIZE: {item.selectedSize} / {item.selectedColor?.name}
                            </p>
                          </div>
                          <p className="font-semibold text-[14px] text-[#111111] flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <div
                            className="flex items-center border border-[#EAEAEA] bg-white gap-3 px-3 py-1.5"
                            style={{ borderRadius: 9999 }}
                          >
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="text-[#666666] hover:text-[#111111] transition-colors">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>remove</span>
                            </button>
                            <span className="text-[13px] font-semibold text-[#111111] min-w-[16px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="text-[#666666] hover:text-[#111111] transition-colors">
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="text-[#CCCCCC] hover:text-red-500 transition-colors p-1.5"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon */}
              {items.length > 0 && (
                <div className="mt-6 p-5 bg-[#F9F9F9]" style={{ borderRadius: 16 }}>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#111111] mb-3">Promo Code</h3>
                  {coupon ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[#111111] uppercase">{coupon.code} — {coupon.label}</span>
                      <button onClick={removeCoupon} className="text-[12px] font-semibold text-red-500 hover:opacity-70 transition-opacity">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="flex-1 bg-white border border-[#EAEAEA] rounded-full px-4 py-2.5 text-[13px] font-semibold tracking-wide outline-none focus:border-[#111111] transition-colors"
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-[#111111] text-white text-[12px] font-semibold px-6 py-2.5 hover:opacity-80 transition-opacity whitespace-nowrap"
                        style={{ borderRadius: 9999 }}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: Address */}
          {step === 1 && (
            <div className="bg-white p-6 md:p-8" style={{ borderRadius: 24 }}>
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#666666] hover:text-[#111111] mb-6 group transition-colors uppercase tracking-wide">
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Cart
              </button>
              <h2 className="text-[22px] font-semibold text-[#111111] uppercase mb-6">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'name', placeholder: 'Full Name', type: 'text', span: false },
                  { key: 'email', placeholder: 'Email Address', type: 'email', span: false },
                  { key: 'street', placeholder: 'Street Address', type: 'text', span: true },
                  { key: 'city', placeholder: 'City', type: 'text', span: false },
                  { key: 'postal', placeholder: 'Postal Code', type: 'text', span: false },
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

          {/* ── STEP 2: Payment */}
          {step === 2 && (
            <div className="bg-white p-6 md:p-8" style={{ borderRadius: 24 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#666666] hover:text-[#111111] mb-6 group transition-colors uppercase tracking-wide">
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Address
              </button>
              <h2 className="text-[22px] font-semibold text-[#111111] uppercase mb-6">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'card', label: 'Credit Card', icon: 'credit_card' },
                  { id: 'upi', label: 'UPI / Razorpay', icon: 'payments' },
                  { id: 'apple', label: 'Apple Pay', icon: 'apple' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-5 border-2 transition-all group
                      ${payMethod === m.id ? 'border-[#111111] bg-[#111111]/5' : 'border-[#EAEAEA] hover:border-[#CCCCCC] bg-[#F9F9F9]'}`}
                    style={{ borderRadius: 16 }}
                  >
                    <span className={`material-symbols-outlined ${payMethod === m.id ? 'text-[#111111]' : 'text-[#999999]'}`} style={{ fontSize: 28 }}>{m.icon}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#111111]">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="p-5 bg-[#F9F9F9] space-y-3" style={{ borderRadius: 16 }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-semibold text-[#999999] uppercase tracking-wide">Secure Encrypted Checkout</span>
                  <span className="material-symbols-outlined text-[#999999]" style={{ fontSize: 18 }}>lock</span>
                </div>
                <input placeholder="Card number" className="input-ghost" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM/YY" className="input-ghost" />
                  <input placeholder="CVV" className="input-ghost" type="password" />
                </div>
                <input placeholder="Cardholder name" className="input-ghost" />
              </div>
            </div>
          )}

          {/* ── STEP 3: Review */}
          {step === 3 && (
            <div className="bg-white p-6 md:p-8" style={{ borderRadius: 24 }}>
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#666666] hover:text-[#111111] mb-6 group transition-colors uppercase tracking-wide">
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Payment
              </button>
              <h2 className="text-[22px] font-semibold text-[#111111] uppercase mb-6">Review Order</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.key} className="flex gap-3 items-center py-3 border-b border-[#EAEAEA]">
                    <div className="w-14 h-18 overflow-hidden flex-shrink-0" style={{ borderRadius: 10 }}>
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#111111] uppercase truncate">{item.product.name}</p>
                      <p className="text-[11px] text-[#999999] uppercase tracking-wide">Size: {item.selectedSize} · Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[13px] font-semibold text-[#111111] flex-shrink-0">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-[#F9F9F9]" style={{ borderRadius: 12 }}>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#111111] mb-1">Shipping To:</p>
                <p className="text-[13px] text-[#666666]">{address.name}, {address.street}, {address.city} {address.postal}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-4">
          <div className="sticky top-[96px] bg-white p-6 md:p-8" style={{ borderRadius: 24 }}>
            <h2 className="text-[18px] font-semibold text-[#111111] mb-5 uppercase tracking-tight">Order Summary</h2>
            <div className="space-y-3 text-[13px] border-b border-[#EAEAEA] pb-4 mb-4">
              <div className="flex justify-between text-[#666666]"><span>Subtotal</span><span className="text-[#111111] font-medium">{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-[#666666]"><span>Tax (GST/VAT)</span><span className="text-[#111111] font-medium">{formatPrice(tax)}</span></div>
              <div className="flex justify-between text-[#666666]"><span>Shipping</span><span className={shipping === 0 ? 'font-bold text-green-600' : 'text-[#111111] font-medium'}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            </div>
            <div className="flex justify-between text-[17px] font-semibold text-[#111111] mb-6">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>

            {items.length > 0 && (
              step < 3 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="w-full bg-[#111111] text-white py-4 text-[12px] font-semibold hover:opacity-80 transition-opacity uppercase tracking-wider"
                  style={{ borderRadius: 9999 }}
                >
                  {step === 0 ? 'Proceed to Checkout' : step === 1 ? 'Continue to Payment' : 'Review Order'}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-emerald-600 text-white py-4 text-[12px] font-semibold hover:bg-emerald-700 transition-colors uppercase tracking-wider"
                  style={{ borderRadius: 9999 }}
                >
                  Complete Payment
                </button>
              )
            )}

            <div className="mt-4 text-center">
              <p className="text-[10px] text-[#999999] uppercase tracking-wide mb-2">Secure 256-bit SSL Payment</p>
              <div className="flex justify-center gap-4 text-[#CCCCCC]">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified_user</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>shield</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Recommendations */}
      <section className="px-4 md:px-8 pb-12">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-[22px] font-semibold text-[#111111] mb-6 uppercase tracking-tight">Recommended For You</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggested.map(p => (
              <Link key={p.id} to={`/products/${p.slug}`} className="group cursor-pointer">
                <div
                  className="relative overflow-hidden bg-[#F0EDE8] mb-3"
                  style={{ borderRadius: 20, aspectRatio: '3/4' }}
                >
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  {p.badge && (
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-white/95 text-[#111111] px-2 py-1" style={{ borderRadius: 9999 }}>
                        {p.badge}
                      </span>
                    </div>
                  )}
                </div>
                <h4 className="text-[13px] font-semibold text-[#111111] uppercase truncate">{p.name}</h4>
                <p className="text-[12px] text-[#666666] mt-0.5">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
