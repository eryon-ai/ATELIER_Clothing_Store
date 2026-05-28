import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const { items } = get()
        if (!items.find(i => i.id === product.id)) {
          set({ items: [...items, { ...product, savedAt: new Date().toISOString() }] })
        }
      },

      removeItem: (productId) =>
        set(s => ({ items: s.items.filter(i => i.id !== productId) })),

      toggleItem: (product) => {
        const { items } = get()
        if (items.find(i => i.id === product.id)) {
          get().removeItem(product.id)
          return false // removed
        } else {
          get().addItem(product)
          return true // added
        }
      },

      isWishlisted: (productId) => !!get().items.find(i => i.id === productId),

      clearWishlist: () => set({ items: [] }),

      getCount: () => get().items.length,
    }),
    {
      name: 'atelier-wishlist',
    }
  )
)

export default useWishlistStore
