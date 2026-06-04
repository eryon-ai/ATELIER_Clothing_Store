import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from '../services/api'
import useCartStore from '../store/useCartStore'
import useWishlistStore from '../store/useWishlistStore'
import ProductCard from '../components/product/ProductCard'
import { formatPrice, getRatingStars } from '../utils'
import toast from 'react-hot-toast'

const TOAST_STYLE = {
  style: { background: '#000', color: '#fff', fontFamily: 'Hanken Grotesk', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' },
}

export default function ProductDetail() {
  const { slug } = useParams()
  
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [zipCode, setZipCode] = useState('')
  const [deliveryMsg, setDeliveryMsg] = useState(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [sizeDrawerOpen, setSizeDrawerOpen] = useState(false)

  const addItem = useCartStore(s => s.addItem)
  const toggleItem = useWishlistStore(s => s.toggleItem)
  const isWishlisted = useWishlistStore(s => s.isWishlisted(product?.id))

  useEffect(() => {
    setLoading(true)
    api.getProductBySlug(slug).then(p => {
      setProduct(p)
      if (p) {
        api.getRelatedProducts(p).then(setRelated)
        setSelectedColor(p.colors?.[0] || null)
      }
      setLoading(false)
    })
  }, [slug])

  if (loading) return <div className="pt-32 pb-20 text-center uppercase tracking-widest text-xs font-bold">Loading...</div>
  if (!product) return <div className="pt-32 pb-20 text-center uppercase tracking-widest text-xs font-bold text-red-500">Product not found</div>

  if (!product) {
    return (
      <div className="pt-40 pb-lg md:pb-xl text-center px-margin-mobile md:px-margin-desktop">
        <h1 className="font-headline-lg text-primary mb-4">Product Not Found</h1>
        <Link to="/products" className="btn-primary inline-block">Back to Shop</Link>
      </div>
    )
  }
  const { full, half } = getRatingStars(product.rating)

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size', TOAST_STYLE)
      return
    }
    setAddingToCart(true)
    await new Promise(r => setTimeout(r, 400))
    addItem(product, selectedSize, selectedColor)
    setAddingToCart(false)
    toast.success(`${product.name} added to cart`, TOAST_STYLE)
  }

  const handleWishlist = () => {
    const added = toggleItem(product)
    toast.success(added ? 'Added to wishlist' : 'Removed from wishlist', TOAST_STYLE)
  }

  const checkDelivery = () => {
    if (!zipCode.trim()) {
      toast.error('Please enter a zip code', TOAST_STYLE)
      return
    }
    setDeliveryMsg(`Standard delivery (3-5 days) available to ${zipCode}. Express (1-2 days) also available.`)
    toast.success('Delivery estimate updated', TOAST_STYLE)
    setZipCode('')
  }

  const showFeatureToast = (feature) => {
    toast(`${feature} coming soon`, { ...TOAST_STYLE, icon: '⏳' })
  }

  return (
    <div className="pt-[90px]">
      {/* Breadcrumbs */}
      <div className="px-margin-mobile md:px-margin-desktop py-md max-w-8xl mx-auto">
        <nav className="flex flex-wrap items-center gap-xs font-label-sm text-label-sm text-outline">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="material-symbols-outlined icon-sm">chevron_right</span>
          <Link to="/products" className="hover:text-primary capitalize">{product.category}</Link>
          <span className="material-symbols-outlined icon-sm">chevron_right</span>
          <span className="text-primary font-semibold">{product.name}</span>
        </nav>
      </div>

      {/* Product Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-desktop max-w-8xl mx-auto pb-lg md:pb-xl">
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-sm">
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="order-2 md:order-1 flex md:flex-col gap-sm overflow-x-auto md:overflow-y-auto hide-scrollbar md:w-20">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`min-w-[80px] h-20 md:w-20 md:h-24 bg-surface-variant overflow-hidden cursor-pointer transition-all duration-300 ${i === activeImg ? 'border border-black shadow-md' : 'opacity-60 hover:opacity-100 hover-aura'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="order-1 md:order-2 flex-1 aspect-[4/5] bg-surface-variant overflow-hidden">
            <img
              src={product.images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ opacity: 1, transition: 'opacity 0.3s ease-in-out' }}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-5 flex flex-col gap-md sticky top-xl h-fit">
          {/* Badge + Name + Price */}
          <div className="flex flex-col gap-xs">
            {product.badge && (
              <span className={`badge-quiet w-fit ${product.badge === 'SALE' ? 'sale' : product.badge === 'NEW' ? 'new' : ''}`}>
                {product.badge === 'LIMITED' ? 'Limited' : product.badge}
              </span>
            )}
            <h1 className="font-editorial text-[clamp(32px,4vw,56px)] leading-tight text-primary tracking-tight mt-1">
              {product.name}
            </h1>
            <div className="flex items-center gap-sm">
              <p className="font-headline-md text-headline-md text-primary">{formatPrice(product.price)}</p>
              {product.comparePrice && (
                <p className="font-body-md text-body-md text-outline line-through">{formatPrice(product.comparePrice)}</p>
              )}
              <span className="font-label-sm text-label-sm text-outline">Duties and taxes included</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-sm">
            <div className="flex text-primary">
              {[...Array(full)].map((_, i) => (
                <span key={i} className="material-symbols-outlined icon-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
              {half > 0 && <span className="material-symbols-outlined icon-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star_half</span>}
            </div>
            <span className="font-body-md text-on-surface-variant">{product.rating} ({product.reviewCount} reviews)</span>
          </div>

          <div className="border-y border-outline-variant py-md flex flex-col gap-md">
            {/* Color Selector */}
            {product.colors?.length > 0 && (
              <div className="flex flex-col gap-sm">
                <p className="font-label-md text-label-md text-primary">
                  COLOR: <span className="text-outline uppercase">{selectedColor?.name}</span>
                </p>
                <div className="flex gap-sm">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      title={color.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all ring-2 ring-offset-2 ${selectedColor?.name === color.name ? 'ring-primary border-primary' : 'ring-transparent border-transparent hover:border-outline-variant'}`}
                      style={{ background: color.value }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="flex flex-col gap-sm">
              <div className="flex justify-between items-center">
                <p className="font-label-md text-label-md text-primary">SELECT SIZE</p>
                <button
                  onClick={() => setSizeDrawerOpen(true)}
                  className="text-[10px] font-bold uppercase tracking-widest text-[#747878] underline underline-offset-4 flex items-center gap-1 hover:text-black transition-colors"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-xs">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border font-label-md text-label-md transition-colors ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-sm">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full btn-primary h-12 flex items-center justify-center gap-sm disabled:opacity-70"
            >
              {addingToCart ? (
                <>
                  <span className="material-symbols-outlined icon-sm animate-spin">progress_activity</span>
                  Adding...
                </>
              ) : 'Add to Bag'}
            </button>
            <button
              onClick={handleWishlist}
              className="w-full btn-secondary h-12 flex items-center justify-center gap-sm"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : {}}
              >favorite</span>
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Delivery Checker */}
          <div className="bg-surface-container-low p-md border border-outline-variant flex flex-col gap-sm">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <p className="font-label-md text-label-md text-primary">Delivery Checker</p>
            </div>
            <div className="flex gap-xs">
              <input
                className="bg-white border border-outline-variant text-label-sm h-8 flex-1 px-sm outline-none focus:border-secondary"
                placeholder="Enter Zip Code"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkDelivery()}
              />
              <button onClick={checkDelivery} className="px-sm h-8 bg-primary text-on-primary font-label-sm hover:bg-secondary transition-colors">
                Check
              </button>
            </div>
            {deliveryMsg && <p className="font-body-md text-body-md text-secondary">{deliveryMsg}</p>}
          </div>

          {/* Share + Info */}
          <div className="flex items-center justify-between py-sm">
            <button onClick={() => showFeatureToast('Share')} className="flex items-center gap-sm text-outline hover:text-primary transition-colors">
              <span className="material-symbols-outlined">share</span>
              <span className="font-label-sm text-label-sm">Share this look</span>
            </button>
            <div className="flex gap-md">
              <span onClick={() => showFeatureToast('Live Chat')} className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">chat_bubble</span>
              <span onClick={() => showFeatureToast('Product Info')} className="material-symbols-outlined text-outline cursor-pointer hover:text-primary">info</span>
            </div>
          </div>
        </div>
      </section>

      {/* Fabric & Craft */}
      {product.features?.length > 0 && (
        <section className="bg-primary text-on-primary py-lg md:py-xl">
          <div className="px-margin-mobile md:px-margin-desktop max-w-8xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-lg items-center">
            <div className="flex flex-col gap-md">
              <h2 className="font-display text-headline-lg text-white uppercase tracking-tight">Fabric & Craft</h2>
              <p className="font-body-lg text-body-lg text-primary-fixed-dim max-w-md">{product.description}</p>
              <ul className="flex flex-col gap-sm">
                {product.features.map((feat, i) => {
                  const [title, desc] = feat.split(' — ')
                  return (
                    <li key={i} className="flex items-start gap-md">
                      <span className="material-symbols-outlined text-secondary-container">shield</span>
                      <div>
                        <h4 className="font-label-md text-label-md text-on-primary">{title}</h4>
                        {desc && <p className="font-body-md text-body-md text-primary-fixed-dim">{desc}</p>}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="aspect-square bg-surface-container overflow-hidden">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
            </div>
          </div>
        </section>
      )}

      {/* Complete The Look */}
      {related.length > 0 && (
        <section className="px-margin-mobile md:px-margin-desktop max-w-8xl mx-auto py-lg md:py-xl">
          <h3 className="font-headline-md text-headline-md text-primary uppercase mb-md">Complete the Look</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="bg-surface-container-low py-lg md:py-xl">
        <div className="px-margin-mobile md:px-margin-desktop max-w-8xl mx-auto flex flex-col gap-lg">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary uppercase">Customer Feedback</h3>
              <div className="flex items-center gap-sm mt-sm">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined icon-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <span className="font-headline-md text-headline-md">{product.rating}</span>
                <span className="font-body-md text-outline">Based on {product.reviewCount} reviews</span>
              </div>
            </div>
            <div className="p-md border border-outline-variant bg-white flex flex-col gap-xs">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <p className="font-label-md text-label-md text-primary">Quality Guarantee</p>
              <p className="font-body-md text-on-surface-variant">Each piece inspected individually.</p>
            </div>
          </div>

          {/* Sample Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {[
              { name: 'Marcus T.', date: '2 weeks ago', title: 'Exceptional craftsmanship', body: 'The attention to detail is outstanding. The oversized fit is exactly as described—modern but not overwhelming.', stars: 5 },
              { name: 'Elena R.', date: '1 month ago', title: 'The ultimate urban shell', body: 'A true investment piece. I\'ve received so many compliments on the silhouette. ATELIER has really peaked with this collection.', stars: 5 },
            ].map((r, i) => (
              <div key={i} className="border-b border-outline-variant pb-md">
                <div className="flex justify-between items-center mb-sm">
                  <div className="flex items-center gap-sm">
                    <div className="flex text-primary">
                      {[...Array(r.stars)].map((_, j) => (
                        <span key={j} className="material-symbols-outlined icon-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <span className="font-label-md text-label-md uppercase">{r.name}</span>
                    <span className="bg-surface-container-high px-xs py-[1px] font-label-sm text-label-sm flex items-center gap-xs">
                      <span className="material-symbols-outlined icon-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      Verified
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline">{r.date}</span>
                </div>
                <h4 className="font-label-md text-label-md text-primary uppercase mb-xs">{r.title}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Size Guide Drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {sizeDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSizeDrawerOpen(false)}
              className="fixed inset-0 bg-white/40 z-40 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white/80 backdrop-blur-2xl z-50 flex flex-col shadow-2xl border-l border-white/50"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#EAEAEA]">
                <h2 className="font-editorial text-xl">Size Guide</h2>
                <button onClick={() => setSizeDrawerOpen(false)} className="text-[#747878] hover:text-black transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">How to Measure</h3>
                  <p className="text-sm text-[#747878] leading-relaxed">Use a soft measuring tape. Measure over your undergarments. Keep the tape comfortably snug.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#EAEAEA]">
                        {['Size', 'Chest', 'Waist', 'Hip'].map(h => (
                          <th key={h} className="text-left py-3 pr-6 text-[10px] font-bold uppercase tracking-widest text-[#747878]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['XS', '32"', '24"', '34"'],
                        ['S',  '34"', '26"', '36"'],
                        ['M',  '36"', '28"', '38"'],
                        ['L',  '38"', '30"', '40"'],
                        ['XL', '40"', '32"', '42"'],
                        ['XXL','42"', '34"', '44"'],
                      ].map(([size, ...vals]) => (
                        <tr key={size} className="border-b border-[#EAEAEA] hover:bg-[#F7F6F4] transition-colors">
                          <td className="py-3 pr-6 font-semibold">{size}</td>
                          {vals.map((v, i) => <td key={i} className="py-3 pr-6 text-[#747878]">{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#F7F6F4] p-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2">Fit Note</p>
                  <p className="text-sm text-[#747878] leading-relaxed">Our garments are cut with a relaxed, oversized silhouette. If you prefer a closer fit, size down one step.</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
