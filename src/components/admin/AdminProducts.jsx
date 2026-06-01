import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { formatPrice } from '../../utils'
import { useAdminStore } from '../../store/useAdminStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const productSchema = z.object({
  name: z.string().min(2, 'Title must be at least 2 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  comparePrice: z.coerce.number().nullable().optional(),
  description: z.string().optional(),
  lifecycleStatus: z.string().optional()
})

const ITEMS_PER_PAGE = 10

export default function AdminProducts() {
  const { products, deleteProduct, bulkUpdateProducts } = useAdminStore()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [editingProduct, setEditingProduct] = useState(null)
  
  // Pagination & Bulk Selection
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const cats = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products])
  
  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (catFilter === 'all' || p.category === catFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
    )
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sortBy === 'inventory') list = [...list].sort((a, b) => a.inventoryCount - b.inventoryCount)
    return list
  }, [products, search, catFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const toggleSelect = (id, e) => {
    e.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const isAllCurrentPageSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id))

  const toggleAll = () => {
    const next = new Set(selectedIds)
    if (isAllCurrentPageSelected) {
      paginatedProducts.forEach(p => next.delete(p.id))
    } else {
      paginatedProducts.forEach(p => next.add(p.id))
    }
    setSelectedIds(next)
  }

  // --- Bulk Handlers ---
  const handleBulkStatus = (status) => {
    bulkUpdateProducts(selectedIds, { lifecycleStatus: status })
    toast.success(`${selectedIds.size} products marked as ${status}`)
    setSelectedIds(new Set())
  }

  const handleBulkCollection = () => {
    toast.success(`Assigned ${selectedIds.size} products to New Collection`)
    setSelectedIds(new Set())
  }

  const handleCompare = () => {
    if(selectedIds.size < 2) return toast.error('Select at least 2 products to compare')
    toast('Opening comparison view...', { icon: '📊' })
  }

  return (
    <div>
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search products by name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 border border-outline-variant/50 bg-white text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setCurrentPage(1); }}
            className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          >
            {cats.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
            className="border border-outline-variant/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
          >
            <option value="name">Sort: Name</option>
            <option value="price-asc">Sort: Price ↑</option>
            <option value="price-desc">Sort: Price ↓</option>
            <option value="inventory">Sort: Inventory</option>
            <option value="rating">Sort: Rating</option>
          </select>
          <button
            onClick={() => setEditingProduct({})}
            className="bg-primary text-on-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-secondary transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Floating) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary text-white px-4 py-3 mb-4 flex items-center justify-between shadow-lg"
          >
            <span className="text-sm font-semibold">{selectedIds.size} products selected</span>
            <div className="flex gap-3">
              <button onClick={() => handleBulkStatus('Active')} className="text-xs font-bold uppercase tracking-widest hover:text-white/70">Set Active</button>
              <button onClick={() => handleBulkStatus('Draft')} className="text-xs font-bold uppercase tracking-widest hover:text-white/70">Set Draft</button>
              <button onClick={handleBulkCollection} className="text-xs font-bold uppercase tracking-widest hover:text-white/70">Add to Collection</button>
              <button onClick={handleCompare} className="text-xs font-bold uppercase tracking-widest text-emerald-300 hover:text-emerald-400">Compare</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white border border-outline-variant/30 flex flex-col min-h-[500px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" checked={isAllCurrentPageSelected} onChange={toggleAll} className="w-4 h-4 accent-primary" />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Inventory</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <AnimatePresence>
                {paginatedProducts.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-surface-container-lowest/50 transition-colors cursor-pointer group"
                    onClick={() => setEditingProduct(p)}
                  >
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={(e) => toggleSelect(p.id, e)} className="w-4 h-4 accent-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-surface-container overflow-hidden flex-shrink-0">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-primary leading-tight">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-semibold uppercase tracking-wider bg-surface-variant px-1.5 py-0.5 text-on-surface-variant">{p.category}</span>
                            {p.collection && <span className="text-[9px] font-semibold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{p.collection}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                        p.lifecycleStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        p.lifecycleStatus === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {p.lifecycleStatus || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.inventoryCount < 10 ? 'bg-red-500' : p.inventoryCount < 50 ? 'bg-amber-400' : 'bg-emerald-500'}`} title="Inventory Health" />
                        <span className="font-semibold">{p.inventoryCount || 0} in stock</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-0.5">{(p.variants || []).length} variants</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/products/${p.slug}`}
                          target="_blank"
                          onClick={e => e.stopPropagation()}
                          className="material-symbols-outlined text-outline hover:text-primary transition-colors text-lg"
                          title="Preview"
                        >
                          visibility
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProduct(p.id) }}
                          className="material-symbols-outlined text-outline hover:text-red-500 transition-colors text-lg"
                          title="Delete"
                        >
                          delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-on-surface-variant">
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="border-t border-outline-variant/30 p-4 flex items-center justify-between bg-surface-container-lowest">
            <span className="text-xs text-on-surface-variant font-semibold">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} products
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-outline-variant/50 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-variant/30"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-outline-variant/50 text-xs font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-surface-variant/30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Slide-out */}
      <AnimatePresence>
        {editingProduct !== null && (
          <ProductEditorPanel 
            productId={editingProduct.id} 
            isNew={!editingProduct.id}
            onClose={() => setEditingProduct(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductEditorPanel({ productId, isNew, onClose }) {
  const { products, addProduct, updateProduct, duplicateProduct } = useAdminStore()
  const [activeTab, setActiveTab] = useState('details')
  
  // Use a blank product template if new, otherwise find from store
  const product = isNew ? {} : products.find(p => p.id === productId)

  const [variants, setVariants] = useState(product?.variants || [])
  const [tags, setTags] = useState(product?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants]
    const val = (field === 'inventory' || field === 'priceOffset') ? Number(value) : value
    newVariants[index] = { ...newVariants[index], [field]: val }
    setVariants(newVariants)
  }

  const handleAddVariant = () => {
    setVariants([...variants, { title: 'New Size', sku: 'SKU-000', inventory: 0, priceOffset: 0 }])
  }

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      price: product?.price || '',
      comparePrice: product?.comparePrice || '',
      description: product?.description || '',
      lifecycleStatus: product?.lifecycleStatus || 'Draft'
    }
  })

  if (!product && !isNew) return null

  const onSubmit = (data) => {
    if (isNew) {
      addProduct({
        id: crypto.randomUUID(),
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        name: data.name,
        price: data.price,
        comparePrice: data.comparePrice || null,
        description: data.description || '',
        category: 'outerwear',
        images: ['/images/outerwear.png'],
        inStock: true,
        rating: 0,
        reviewCount: 0,
        lifecycleStatus: data.lifecycleStatus,
        inventoryCount: variants.reduce((sum, v) => sum + (v.inventory || 0), 0),
        variants,
        tags
      })
      toast.success('Product created!')
    } else {
      updateProduct(product.id, {
        name: data.name,
        price: data.price,
        comparePrice: data.comparePrice || null,
        description: data.description || '',
        lifecycleStatus: data.lifecycleStatus,
        inventoryCount: variants.reduce((sum, v) => sum + (v.inventory || 0), 0),
        variants,
        tags
      })
      toast.success('Product updated!')
    }
    onClose()
  }

  const handleDuplicate = () => {
    duplicateProduct(product.id)
    toast.success('Product duplicated successfully!')
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex justify-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-2xl h-full shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-white">
          <h2 className="font-bold text-lg uppercase tracking-widest text-primary flex items-center gap-3">
            {isNew ? 'New Product' : product.name}
            {!isNew && <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                product.lifecycleStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                product.lifecycleStatus === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-surface-variant text-on-surface-variant'
              }`}>{product.lifecycleStatus || 'Active'}</span>}
          </h2>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button onClick={handleDuplicate} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-secondary px-3 py-1.5 border border-outline-variant/50 mr-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">content_copy</span> Duplicate
              </button>
            )}
            <button onClick={onClose} className="material-symbols-outlined text-outline hover:text-primary">close</button>
          </div>
        </div>

        {/* Tabs */}
        {!isNew && (
          <div className="flex border-b border-outline-variant/30 bg-surface-container-lowest px-6">
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Core Details
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
            >
              Analytics & SEO
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
          
          {/* CORE DETAILS TAB */}
          {(activeTab === 'details' || isNew) && (
            <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Lifecycle Status</label>
                  <select {...register('lifecycleStatus')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Title</label>
                  <input {...register('name')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Price ($)</label>
                  <input type="number" step="0.01" {...register('price')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Compare at Price</label>
                  <input type="number" step="0.01" {...register('comparePrice')} className="w-full border border-outline-variant/50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Variants and Tags block (always show, even on New) */}
              <>
                  <div className="bg-white border border-outline-variant/30 p-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3 flex items-center justify-between">
                      Variant Management
                      <button type="button" onClick={handleAddVariant} className="text-primary hover:underline flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">add</span> Add Variant</button>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-surface-variant/30 text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30">
                          <tr>
                            <th className="px-2 py-2">Variant</th>
                            <th className="px-2 py-2">SKU</th>
                            <th className="px-2 py-2">Inventory</th>
                            <th className="px-2 py-2">Price Offset</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {variants.map((v, i) => (
                            <tr key={i}>
                              <td className="px-2 py-2">
                                <input type="text" value={v.title} onChange={e => handleVariantChange(i, 'title', e.target.value)} className="w-24 border border-outline-variant/50 px-1 py-1 text-xs font-bold" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="text" value={v.sku} onChange={e => handleVariantChange(i, 'sku', e.target.value)} className="w-28 border border-outline-variant/50 px-1 py-1 text-xs font-mono text-[10px]" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" value={v.inventory} onChange={e => handleVariantChange(i, 'inventory', e.target.value)} className="w-16 border border-outline-variant/50 px-1 py-1 text-xs" />
                              </td>
                              <td className="px-2 py-2">
                                <input type="number" value={v.priceOffset} onChange={e => handleVariantChange(i, 'priceOffset', e.target.value)} className="w-16 border border-outline-variant/50 px-1 py-1 text-xs" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-outline-variant/30 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Product Tags</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {tags.map((t, i) => (
                          <span key={i} className="text-[10px] bg-surface-variant text-on-surface-variant px-2 py-1 flex items-center gap-1">
                            {t} <span onClick={() => handleRemoveTag(t)} className="material-symbols-outlined text-[10px] cursor-pointer hover:text-red-500">close</span>
                          </span>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Add tag and press Enter..." 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className="w-full border border-outline-variant/50 px-3 py-1.5 text-xs focus:outline-none focus:border-primary" 
                      />
                    </div>

                    <div className="bg-white border border-outline-variant/30 p-4">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">Cross-Sells</label>
                      <p className="text-[10px] text-on-surface-variant mb-2">Link items for "You may also like"</p>
                      <button type="button" className="w-full border border-dashed border-outline-variant text-on-surface-variant py-2 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
                        + Select Products
                      </button>
                    </div>
                  </div>
                </>
            </form>
          )}

          {/* ANALYTICS & SEO TAB */}
          {!isNew && activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Scorecard */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-primary text-white p-4 col-span-1 flex flex-col justify-center items-center text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Performance Score</p>
                  <p className="text-3xl font-bold">{product.analytics?.performanceScore || 0}</p>
                  <p className="text-[10px] mt-1 opacity-80">/ 100</p>
                </div>
                <div className="bg-white border border-outline-variant/30 p-4 col-span-3 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Revenue YTD</p>
                    <p className="text-lg font-bold text-emerald-600">${product.analytics?.revenueYTD?.toLocaleString() || 0}</p>
                  </div>
                  <div className="border-l border-outline-variant/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Views</p>
                    <p className="text-lg font-bold text-primary">{product.analytics?.views?.toLocaleString() || 0}</p>
                  </div>
                  <div className="border-l border-outline-variant/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Conv. Rate</p>
                    <p className="text-lg font-bold text-primary">{product.analytics?.conversionRate || 0}%</p>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-[#f8f9fc] border border-[#e2e8f0] p-4 flex gap-4 items-start">
                <div className="bg-blue-100 text-blue-600 p-2 shrink-0">
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">AI Merchandising Insight</h4>
                  <p className="text-sm text-on-surface-variant">
                    {product.analytics?.conversionRate < 2.0 
                      ? "This product is driving high traffic but struggling to convert. Consider adding lifestyle images or running a targeted 10% discount campaign."
                      : "This product is performing exceptionally well. Ensure inventory remains healthy. Consider bundling it with accessories to increase AOV."}
                  </p>
                </div>
              </div>

              {/* SEO Quality Checklist */}
              <div className="bg-white border border-outline-variant/30 p-4">
                <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">SEO & Quality Checklist</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Score:</span>
                    <span className={`text-sm font-bold ${product.seoScore > 85 ? 'text-emerald-500' : 'text-amber-500'}`}>{product.seoScore || 0}/100</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    <span className="text-on-surface-variant">Title is optimized (between 20-60 characters)</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                    <span className="text-on-surface-variant">Contains at least 3 high-resolution images</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">error</span>
                    <span className="text-on-surface-variant font-semibold text-primary">Missing meta description tags</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-amber-500 text-[18px]">error</span>
                    <span className="text-on-surface-variant font-semibold text-primary">Product description is too short (&lt;100 words)</span>
                  </li>
                </ul>
              </div>

            </div>
          )}

        </div>
        
        {/* Footer Actions */}
        {(activeTab === 'details' || isNew) && (
          <div className="p-6 border-t border-outline-variant/30 bg-white flex justify-end gap-4 shrink-0">
            <button onClick={onClose} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary">Cancel</button>
            <button form="product-form" type="submit" className="bg-primary text-on-primary px-8 py-2 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-colors shadow-lg">
              {isNew ? 'Create Product' : 'Save Changes'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

ProductEditorPanel.propTypes = {
  productId: PropTypes.number,
  isNew: PropTypes.bool,
  onClose: PropTypes.func.isRequired
}
