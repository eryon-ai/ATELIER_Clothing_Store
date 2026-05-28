// ─────────────────────────────────────────────────────────────────
//  ATELIER — Mock Product Data
//  480+ Products across all collections — fully curated names & images
// ─────────────────────────────────────────────────────────────────

// High-quality product images (AI Generated + Unsplash)
const IMGS = {
  outerwear:  '/images/outerwear.png',
  knitwear:   '/images/knitwear.png',
  sneakers:   '/images/sneakers.png',
  accessories:'/images/accessories.png',
  bottoms:    '/images/bottoms.png',
  tops:       '/images/tops.png',
  parkaWeb:   'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
  blazerWeb:  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
  jacketWeb:  'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
  coatWeb:    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
  hoodieWeb:  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
  bootsWeb:   'https://images.unsplash.com/photo-1608228068998-573556d11a4b?auto=format&fit=crop&w=800&q=80',
  rigWeb:     'https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&w=800&q=80',
  watchWeb:   'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80',
  glassesWeb: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
  pantsWeb:   'https://images.unsplash.com/photo-1617331720188-7501a3511eb0?auto=format&fit=crop&w=800&q=80',
  sneakerWeb: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
  teeWeb:     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
  glassesWeb2:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
  hoodieWeb2: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80',
}

// Images grouped by category — ensures correct images per product type
const CAT_IMGS = {
  outerwear:   [IMGS.outerwear, IMGS.parkaWeb, IMGS.blazerWeb, IMGS.jacketWeb, IMGS.coatWeb],
  knitwear:    [IMGS.knitwear, IMGS.hoodieWeb, IMGS.hoodieWeb2],
  footwear:    [IMGS.bootsWeb, IMGS.sneakerWeb],
  sneakers:    [IMGS.sneakers, IMGS.sneakerWeb],
  accessories: [IMGS.accessories, IMGS.rigWeb, IMGS.watchWeb, IMGS.glassesWeb, IMGS.glassesWeb2],
  bottoms:     [IMGS.bottoms, IMGS.pantsWeb],
  tops:        [IMGS.tops, IMGS.teeWeb],
}

// Curated product name pools for each category — no generic names
const PRODUCT_NAMES = {
  outerwear: [
    'Metropolis Oversized Parka','Noir Moto Jacket','Structured Blazer',
    'Field Technical Parka','Oversized Wool Topcoat','Noir Overcoat v2',
    'Urban Shell Parka','Anime Archive Bomber','Collab Capsule Jacket',
    'Tactical Layer Jacket','Archive Blazer','Chrome Wind Shell',
    'Phantom Shell Jacket','Satin Coach Jacket','Wool Boucle Coat',
    'Monochrome Puffer','Military Surplus Jacket','Utility Trench Coat',
    'Avant-Garde Blazer','Quilted Tech Jacket',
  ],
  knitwear: [
    'Merino Ribbed Sweater','Core Heavyweight Hoodie','Moss Hoodie',
    'Winter Tech Fleece','Streetwear Core Hoodie','Festival Mesh Layer',
    'Oversized Cable-Knit','Gradient Knit Crewneck','Mohair Blend Cardigan',
    'Thermal Half-Zip','Cropped Knit Polo','Distressed Hem Sweater',
    'Reverse Weave Hoodie','Patchwork Knit Top','Fisherman Chunky Knit',
    'Silk Blend Crewneck','Tech Fleece Zip-Up','Balaclava Knit',
    'Statement Logo Hoodie','Zip-Through Knitwear',
  ],
  footwear: [
    'Apex Terrain Boot','Osseous Runner','Street Sneaker V2',
    'Noir Chelsea Boot','Platform Derby','Lug Sole Loafer',
    'Tactical Combat Boot','Sculptural Mule','Sock Boot v3',
    'Chunky Derby Shoe','Leather Slip-On','Pointed Toe Mule',
    'Patent Leather Boot','Harness Platform Boot','Triple-Layer Sneaker',
    'Suede Chukka Boot','Clog Hybrid','Neoprene Ankle Boot',
    'Tech Knit Runner','Vibram Sole Derby',
  ],
  sneakers: [
    'Osseous Runner','Street Sneaker V2','Lunar Trail Sneaker',
    'High-Top Canvas','Platform Air Sneaker','Tech Knit Runner',
    'Archive Vintage Trainer','Chrome Pod Sneaker','Foam Runner',
    'Triple Black Sneaker','Skate Low Sneaker','Minimalist Sneaker',
    'Collab Capsule Sneaker','Iridescent Runner','Bio-Mech Sneaker',
    'Classic Retro Trainer','Neon Accent Runner','Chunky Sole Trainer',
    'Court Sneaker Classic','Hidden Wedge Sneaker',
  ],
  accessories: [
    'Transit Sling Bag','Module Rig v1','Chrome Spectrum Eyewear',
    'Steel Tempo Watch','Noir Aviator Shades','Structured Tote Bag',
    'Leather Phone Case','Signet Ring Set','Utility Belt',
    'Neoprene Neck Gaiter','Baseball Cap','Leather Bifold Wallet',
    'Tactical Chest Rig','Chain Necklace','Suede Gloves',
    'Tech Backpack','Crossbody Micro Bag','Titanium Bracelet',
    'Bucket Hat','Knitted Beanie',
  ],
  bottoms: [
    'Modular Cargo Pants','Tailored Pleated Trousers','Raw Selvedge Denim',
    'Gym Compression Set','Wide Leg Trousers','Sweat Shorts v2',
    'Track Pants Classic','Cropped Wide Jeans','Leather Trousers',
    'Pleated Mini Skirt','Plisse Midi Skirt','Jogger Sweat Pants',
    'Linen Wide Trousers','Vinyl Flared Pants','Technical Running Short',
    'Asymmetric Hem Skirt','Suit Trouser Classic','Washed Black Jeans',
    'Parachute Cargo Pants','Knit Midi Skirt',
  ],
  tops: [
    'Neo-Kyoto Graphic Tee','Basic Heavyweight Tee','Summer Linen Set',
    'Marvel × ATELIER Tee','Silk Drape Blouse','Festival Mesh Layer',
    'Cropped Logo Tank','Cut-Out Knit Top','Structured Corset Top',
    'Sheer Organza Blouse','Oversized Denim Shirt','Zip-Front Crop Top',
    'Distressed Band Tee','Ribbed Long Sleeve','Smocked Bodice Top',
    'Anime Print Tee','Tech Fabric Turtleneck','Lace Trim Cami',
    'Drape Front Blouse','Utility Cropped Jacket',
  ],
}

// Rich descriptions per category
const DESCRIPTIONS = {
  outerwear:   'Precision-constructed outerwear for the urban pioneer. Premium fabrics, architectural silhouettes.',
  knitwear:    'Heavyweight knitwear engineered for elevated streetwear aesthetics. Premium yarns, oversized comfort.',
  footwear:    'Sculptural footwear at the intersection of art and function. Built to carry the look.',
  sneakers:    'Gallery-ready sneakers. Organic forms, premium materials, zero compromise on silhouette.',
  accessories: 'The detail that defines the entire look. Handcrafted hardware, premium construction throughout.',
  bottoms:     'Tailored and technical bottoms for the modern wardrobe. Precision construction, premium drape.',
  tops:        'Statement tops from graphic-heavy statements to refined silks. Each designed to anchor the look.',
}

const FEATURES = {
  outerwear:   ['Premium shell fabrication', 'YKK zippers throughout', 'Signature ATELIER lining'],
  knitwear:    ['Heavyweight knit construction', 'Brushed interior fleece', 'Ribbed trim detail'],
  footwear:    ['Full-grain upper materials', 'Cushioned insole', 'Lug-sole grip'],
  sneakers:    ['Bio-foam midsole', 'Recycled upper materials', 'Gallery-inspired silhouette'],
  accessories: ['Premium Cordura nylon', 'Matte metal hardware', 'Weatherproof lining'],
  bottoms:     ['Tapered premium construction', 'Reinforced stress points', 'Signature woven label'],
  tops:        ['Heavyweight cotton base', 'Drop-shoulder cut', 'Double-stitched seams'],
}

const ALL_COLORS = [
  [{ name: 'Obsidian Black', value: '#000000' }],
  [{ name: 'Charcoal', value: '#36454F' }],
  [{ name: 'Olive', value: '#6B7C4B' }],
  [{ name: 'Ivory', value: '#F5F0E8' }, { name: 'Stone', value: '#9B9B8E' }],
  [{ name: 'White', value: '#ffffff' }],
  [{ name: 'Navy', value: '#0C1445' }],
  [{ name: 'Forest Green', value: '#2C3531' }],
]

const ALL_SIZES = {
  outerwear: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  knitwear:  ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  footwear:  ['38', '39', '40', '41', '42', '43', '44', '45'],
  sneakers:  ['38', '39', '40', '41', '42', '43', '44', '45'],
  accessories:['ONE SIZE'],
  bottoms:   ['XS', 'S', 'M', 'L', 'XL'],
  tops:      ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
}

// All active collections in the app
const COLLECTIONS = [
  'new-arrivals','best-sellers','trending','limited','sale','premium',
  'women','men','accessories','footwear','sneakers','oversized',
  'streetwear','anime','marvel','collab','gym','summer','winter','festival',
]

// Helper: create a product
const p = (id, slug, name, category, collection, price, comparePrice, img, colors, sizes, desc, features = [], rating = 4.5, reviewCount = 48, isNew = false, isLimited = false) => ({
  id, slug, name, category, collection, price,
  comparePrice: comparePrice || null,
  discount: comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : null,
  images: [img],
  colors: colors || [{ name: 'Obsidian Black', value: '#000000' }],
  sizes: sizes || ['XS', 'S', 'M', 'L', 'XL'],
  description: desc || DESCRIPTIONS[category] || 'Premium ATELIER piece.',
  features: features || FEATURES[category] || [],
  rating, reviewCount, isNew, isLimited,
  inStock: true,
  badge: isLimited ? 'LIMITED' : isNew ? 'NEW' : comparePrice ? 'SALE' : null,
  tags: [category, collection].filter(Boolean),
})

let _idCounter = 1
const generateProducts = () => {
  const products = []
  _idCounter = 1

  COLLECTIONS.forEach(col => {
    const categories = Object.keys(CAT_IMGS)
    
    for (let i = 0; i < 24; i++) {
      const cat = categories[i % categories.length]
      const catImages = CAT_IMGS[cat]
      const img = catImages[_idCounter % catImages.length]

      // Use curated real names — cycle through the pool
      const namePool = PRODUCT_NAMES[cat]
      const name = namePool[i % namePool.length]

      const basePrice = Math.round((Math.random() * 700 + 80) / 10) * 10
      const isSale = col === 'sale' || (i % 5 === 0 && col !== 'new-arrivals')
      const comparePrice = isSale ? basePrice + Math.round((Math.random() * 200 + 100) / 10) * 10 : null
      const isNew = col === 'new-arrivals' || i % 4 === 0
      const isLimited = col === 'limited' || i % 6 === 0

      products.push(p(
        _idCounter,
        `${col}-${cat}-${_idCounter}`,
        name,
        cat,
        col,
        basePrice,
        comparePrice,
        img,
        ALL_COLORS[_idCounter % ALL_COLORS.length],
        ALL_SIZES[cat] || ['S', 'M', 'L'],
        DESCRIPTIONS[cat],
        FEATURES[cat],
        parseFloat((Math.random() * 0.8 + 4.2).toFixed(1)),
        Math.floor(Math.random() * 400 + 10),
        isNew,
        isLimited,
      ))

      _idCounter++
    }
  })

  return products
}

export const PRODUCTS = generateProducts()

export const getProductBySlug = (slug) => PRODUCTS.find(p => p.slug === slug)
export const getProductById = (id) => PRODUCTS.find(p => p.id === id)
export const getProductsByCategory = (cat) => PRODUCTS.filter(p => p.category === cat)
export const getProductsByCollection = (col) => PRODUCTS.filter(p => p.collection === col)
export const getFeaturedProducts = () => PRODUCTS.filter(p => p.rating >= 4.7).slice(0, 12)
export const getNewArrivals = () => PRODUCTS.filter(p => p.isNew).slice(0, 12)
export const getLimitedProducts = () => PRODUCTS.filter(p => p.isLimited)
export const getSaleProducts = () => PRODUCTS.filter(p => p.comparePrice)
export const getBestSellers = () => [...PRODUCTS].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 12)
export const getTrending = () => [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 12)
export const getRelatedProducts = (product, count = 4) =>
  PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.collection === product.collection)).slice(0, count)
