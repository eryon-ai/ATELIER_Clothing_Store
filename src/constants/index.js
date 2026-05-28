// ── App Routes ────────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  HOME_LIGHT: '/home-light',
  EDITORIAL: '/editorial',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:slug',
  COLLECTION: '/collections/:slug',
  WOMEN: '/collections/women',
  MEN: '/collections/men',
  SNEAKERS: '/collections/sneakers',
  FOOTWEAR: '/collections/footwear',
  ACCESSORIES: '/collections/accessories',
  OVERSIZED: '/collections/oversized',
  PREMIUM: '/collections/premium',
  BEST_SELLERS: '/collections/best-sellers',
  TRENDING: '/collections/trending',
  NEW_ARRIVALS: '/collections/new-arrivals',
  LIMITED: '/collections/limited',
  SALE: '/collections/sale',
  SUMMER: '/collections/summer',
  WINTER: '/collections/winter',
  FESTIVAL: '/collections/festival',
  STREETWEAR: '/collections/streetwear',
  ANIME: '/collections/anime',
  MARVEL: '/collections/marvel',
  COLLAB: '/collections/collab',
  GYM: '/collections/gym',
  CART: '/cart',
  WISHLIST: '/wishlist',
  CHECKOUT: '/checkout',
  ORDER_SUCCESS: '/order-success',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  DASHBOARD: '/dashboard',
  ORDERS: '/dashboard/orders',
  PROFILE: '/dashboard/profile',
  ADDRESSES: '/dashboard/addresses',
  REWARDS: '/dashboard/rewards',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ANALYTICS: '/admin/analytics',
}

// ── Product Categories ────────────────────────────────────────────
export const CATEGORIES = [
  { label: 'Women', slug: 'women', icon: 'person' },
  { label: 'Men', slug: 'men', icon: 'person_2' },
  { label: 'Sneakers', slug: 'sneakers', icon: 'directions_run' },
  { label: 'Footwear', slug: 'footwear', icon: 'checkroom' },
  { label: 'Accessories', slug: 'accessories', icon: 'watch' },
  { label: 'Oversized', slug: 'oversized', icon: 'dry_cleaning' },
  { label: 'Outerwear', slug: 'outerwear', icon: 'dry' },
  { label: 'Knitwear', slug: 'knitwear', icon: 'texture' },
]

// ── Product Collections ───────────────────────────────────────────
export const COLLECTIONS = [
  { label: 'New Arrivals', slug: 'new-arrivals', badge: 'NEW' },
  { label: 'Best Sellers', slug: 'best-sellers', badge: 'HOT' },
  { label: 'Trending Now', slug: 'trending', badge: 'TREND' },
  { label: 'Limited Edition', slug: 'limited', badge: 'LTD' },
  { label: 'Sale', slug: 'sale', badge: 'SALE' },
  { label: 'Premium', slug: 'premium', badge: 'PREM' },
  { label: 'Anime Archive', slug: 'anime', badge: 'COLLAB' },
  { label: 'Marvel Collab', slug: 'marvel', badge: 'COLLAB' },
  { label: 'Festival Edit', slug: 'festival', badge: 'FEST' },
  { label: 'Summer Edit', slug: 'summer', badge: null },
  { label: 'Winter Edit', slug: 'winter', badge: null },
  { label: 'Gym & Active', slug: 'gym', badge: null },
]

// ── Sizes ─────────────────────────────────────────────────────────
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
export const SHOE_SIZES_EU = ['38', '39', '40', '41', '42', '43', '44', '45', '46']
export const SHOE_SIZES_UK = ['5', '6', '7', '8', '9', '10', '11', '12']

// ── Sort Options ──────────────────────────────────────────────────
export const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Sellers', value: 'best-sellers' },
  { label: 'Top Rated', value: 'top-rated' },
  { label: 'Most Reviewed', value: 'most-reviewed' },
]

// ── Price Ranges ──────────────────────────────────────────────────
export const PRICE_RANGES = [
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250 - $500', min: 250, max: 500 },
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: 'Over $1000', min: 1000, max: Infinity },
]

// ── Nav Links ─────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Collections', href: '/products', hasMenu: true },
  { label: 'Editorial', href: '/editorial' },
  { label: 'Archive', href: '/collections/sale' },
]

// ── Colors ────────────────────────────────────────────────────────
export const PRODUCT_COLORS = [
  { name: 'Obsidian Black', value: '#000000' },
  { name: 'Slate', value: '#4A4E52' },
  { name: 'Forest', value: '#2C3531' },
  { name: 'Ivory', value: '#F5F0E8' },
  { name: 'Stone', value: '#9B9B8E' },
  { name: 'Navy', value: '#0C1445' },
  { name: 'Cream', value: '#F7F3E9' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Olive', value: '#6B7C4B' },
  { name: 'Chrome', value: '#C0C0C0' },
]

// ── Trending Searches ─────────────────────────────────────────────
export const TRENDING_SEARCHES = [
  'Metropolis Parka',
  'Noir Overcoat',
  'Anime Archive',
  'Oversized Hoodie',
  'Marvel Collab',
  'Technical Cargo',
  'Limited Drop',
  'Merino Sweater',
]

// ── Coupon Codes (mock) ───────────────────────────────────────────
export const COUPON_CODES = {
  ATELIER10: { type: 'percent', value: 10, label: '10% off' },
  ARCHIVE20: { type: 'percent', value: 20, label: '20% off on Archive items' },
  FIRST50: { type: 'fixed', value: 50, label: '$50 off first order' },
  MEMBER: { type: 'percent', value: 15, label: '15% member discount' },
}

// ── Shipping Thresholds ────────────────────────────────────────────
export const FREE_SHIPPING_THRESHOLD = 500
export const EXPRESS_SHIPPING_COST = 25
export const STANDARD_SHIPPING_COST = 15

// ── Payment Methods ───────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
  { id: 'upi', label: 'UPI / Razorpay', icon: 'payments' },
  { id: 'apple', label: 'Apple Pay', icon: 'apple' },
  { id: 'google', label: 'Google Pay', icon: 'g_mobiledata' },
]
