import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { COUPON_CODES, FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_COST } from '../constants'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isOpen: false,

      // ── Actions ──────────────────────────────────────────────────
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      addItem: (product, selectedSize, selectedColor, qty = 1) => {
        const { items } = get()
        const key = `${product.id}-${selectedSize}-${selectedColor?.name}`
        const existing = items.find(i => i.key === key)

        if (existing) {
          set({
            items: items.map(i =>
              i.key === key ? { ...i, quantity: i.quantity + qty } : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                key,
                product,
                selectedSize,
                selectedColor: selectedColor || product.colors[0],
                quantity: qty,
                addedAt: new Date().toISOString(),
              },
            ],
          })
        }
        set({ isOpen: true })
      },

      removeItem: (key) => set(s => ({ items: s.items.filter(i => i.key !== key) })),

      updateQuantity: (key, quantity) => {
        if (quantity < 1) {
          get().removeItem(key)
          return
        }
        set(s => ({
          items: s.items.map(i => i.key === key ? { ...i, quantity } : i),
        }))
      },

      clearCart: () => set({ items: [], coupon: null }),

      saveForLater: (key) => {
        const { items } = get()
        const item = items.find(i => i.key === key)
        if (!item) return
        set(s => ({
          items: s.items.filter(i => i.key !== key),
          savedItems: [...(s.savedItems || []), { ...item, savedAt: new Date().toISOString() }],
        }))
      },

      applyCoupon: (code) => {
        const coupon = COUPON_CODES[code.toUpperCase()]
        if (coupon) {
          set({ coupon: { code: code.toUpperCase(), ...coupon } })
          return { success: true, message: `Coupon applied: ${coupon.label}` }
        }
        return { success: false, message: 'Invalid coupon code' }
      },

      removeCoupon: () => set({ coupon: null }),

      // ── Computed ─────────────────────────────────────────────────
      getSubtotal: () => {
        const { items } = get()
        return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      },

      getDiscount: () => {
        const { coupon } = get()
        const subtotal = get().getSubtotal()
        if (!coupon) return 0
        if (coupon.type === 'percent') return (subtotal * coupon.value) / 100
        if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal)
        return 0
      },

      getShipping: () => {
        const subtotal = get().getSubtotal()
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
      },

      getTax: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        return Math.round((subtotal - discount) * 0.08 * 100) / 100
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscount()
        const shipping = get().getShipping()
        const tax = get().getTax()
        return Math.max(0, subtotal - discount + shipping + tax)
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    {
      name: 'atelier-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
)

export default useCartStore
