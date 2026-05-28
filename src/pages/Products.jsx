import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import { PRODUCTS } from '../mock/products'
import { SORT_OPTIONS } from '../constants'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [sort, setSort] = useState('featured')

  const filtered = useMemo(() => {
    let list = [...PRODUCTS]
    if (query) {
      const q = query.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.collection?.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'price-asc': return list.sort((a, b) => a.price - b.price)
      case 'price-desc': return list.sort((a, b) => b.price - a.price)
      case 'best-sellers': return list.sort((a, b) => b.reviewCount - a.reviewCount)
      case 'top-rated': return list.sort((a, b) => b.rating - a.rating)
      case 'newest': return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
      default: return list
    }
  }, [query, sort])

  return (
    <div className="pt-20 px-margin-desktop py-xl max-w-8xl mx-auto">
      <div className="flex justify-between items-end mb-lg">
        <div>
          {query ? (
            <h1 className="font-headline-lg text-headline-lg text-primary">
              Results for "{query}" <span className="text-on-surface-variant font-light text-headline-md">({filtered.length})</span>
            </h1>
          ) : (
            <h1 className="font-headline-lg text-headline-lg text-primary">All Collections</h1>
          )}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-transparent border-b border-primary font-label-md text-label-md uppercase outline-none cursor-pointer py-1 px-2"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-xl text-center">
          <span className="material-symbols-outlined icon-xl text-outline-variant block mb-md">search_off</span>
          <h2 className="font-headline-md text-primary">No products found</h2>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
