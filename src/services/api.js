import { useAdminStore } from '../store/useAdminStore'

// Helper to get only active products from the live admin state
const getActiveProducts = () => {
  return useAdminStore.getState().products.filter(p => p.lifecycleStatus === 'Active' || !p.lifecycleStatus)
}

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  getProducts: async () => {
    await delay()
    return getActiveProducts()
  },
  
  getProductBySlug: async (slug) => {
    await delay()
    return getActiveProducts().find(p => p.slug === slug)
  },
  
  getProductById: async (id) => {
    await delay()
    return getActiveProducts().find(p => p.id === id)
  },
  
  getProductsByCategory: async (category) => {
    await delay()
    return getActiveProducts().filter(p => p.category === category)
  },
  
  getProductsByCollection: async (collection) => {
    await delay()
    return getActiveProducts().filter(p => p.collection === collection)
  },
  
  getFeaturedProducts: async () => {
    await delay()
    return getActiveProducts().filter(p => p.rating >= 4.7).slice(0, 12)
  },
  
  getNewArrivals: async () => {
    await delay()
    return getActiveProducts().filter(p => p.isNew).slice(0, 12)
  },
  
  getLimitedProducts: async () => {
    await delay()
    return getActiveProducts().filter(p => p.isLimited)
  },
  
  getSaleProducts: async () => {
    await delay()
    return getActiveProducts().filter(p => p.comparePrice)
  },
  
  getBestSellers: async () => {
    await delay()
    return [...getActiveProducts()].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 12)
  },
  
  getTrending: async () => {
    await delay()
    return [...getActiveProducts()].sort((a, b) => b.rating - a.rating).slice(0, 12)
  },
  
  getRelatedProducts: async (product, count = 4) => {
    await delay()
    return getActiveProducts().filter(p => p.id !== product.id && (p.category === product.category || p.collection === product.collection)).slice(0, count)
  }
}
