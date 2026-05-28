import { create } from 'zustand'
import { PRODUCTS as ALL_PRODUCTS } from '../mock/products'


const useSearchStore = create((set, get) => ({
  query: '',
  results: [],
  isOpen: false,
  isSearching: false,
  recentSearches: JSON.parse(localStorage.getItem('atelier-searches') || '[]'),
  trendingSearches: [
    'Metropolis Parka', 'Noir Overcoat', 'Anime Archive',
    'Oversized Hoodie', 'Marvel Collab', 'Technical Cargo', 'Limited Drop',
  ],

  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '', results: [] }),

  setQuery: (query) => {
    set({ query, isSearching: query.length > 0 })
    if (query.length > 1) {
      get().search(query)
    } else {
      set({ results: [] })
    }
  },

  search: (query) => {
    const q = query.toLowerCase()
    const results = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.collection?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 8)
    set({ results, isSearching: false })
  },

  addRecentSearch: (query) => {
    if (!query.trim()) return
    const recent = get().recentSearches
    const updated = [query, ...recent.filter(r => r !== query)].slice(0, 6)
    set({ recentSearches: updated })
    localStorage.setItem('atelier-searches', JSON.stringify(updated))
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] })
    localStorage.removeItem('atelier-searches')
  },
}))

export default useSearchStore
