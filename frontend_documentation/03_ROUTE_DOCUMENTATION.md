# 03 — ROUTE DOCUMENTATION
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 03 of 18*

---

## 3.1 Storefront Routes

### Route: `/` — Homepage
| Property | Value |
|---|---|
| **Page File** | `src/pages/Home.jsx` |
| **Layout** | `MainLayout` (Navbar + Footer) |
| **Access** | Public (anonymous + authenticated) |
| **Purpose** | Dynamic CMS-driven landing page showcasing the brand |

**Components Used:** AnnouncementBar, Hero Banner, PromoCards, MarqueeTicker, SpotlightProduct, CategoryGrid, PopularProducts, FlashSaleBanner, BestSellers, CommunityUGC

**User Actions:**
- View hero and click CTA to shop collections
- Click promo cards to browse categories
- Add products to cart directly from Popular/Best Sellers
- Click Flash Sale CTA

**Data Requirements:** Entire `storefrontCMS` config JSON (from `useAdminStore`).
**Expected APIs:** `GET /api/v1/storefront/config` — returns published CMS layout.

---

### Route: `/products` — All Products
| Property | Value |
|---|---|
| **Page File** | `src/pages/Products.jsx` |
| **Layout** | `MainLayout` |
| **Access** | Public |
| **Purpose** | Full product catalog listing |

**User Actions:** Browse, filter, sort, add to cart, add to wishlist.
**Expected APIs:** `GET /api/v1/products?category=&sort=&page=&limit=`

---

### Route: `/products/:slug` — Product Detail
| Property | Value |
|---|---|
| **Page File** | `src/pages/ProductDetail.jsx` |
| **Layout** | `MainLayout` |
| **Access** | Public |
| **Purpose** | Deep product information, variant selection, purchase |

**User Actions:** Select size, select color, choose quantity, add to cart, add to wishlist, view reviews, share product.
**Data Requirements:** Full product object including variants, images, sizes, colors, reviews.
**Expected APIs:** `GET /api/v1/products/:slug`

---

### Route: `/collections/:slug` — Collection Page
| Property | Value |
|---|---|
| **Page File** | `src/pages/CollectionPage.jsx` |
| **Access** | Public |
| **Purpose** | Pre-filtered product list for a specific collection (e.g., "Women", "Men", "Sale") |

**Expected APIs:** `GET /api/v1/collections/:slug` → returns collection metadata + product IDs.

---

### Route: `/cart` — Cart & Checkout
| Property | Value |
|---|---|
| **Page File** | `src/pages/Cart.jsx` |
| **Layout** | `MainLayout` |
| **Access** | Public (cart) / Authenticated (checkout) |
| **Purpose** | Review cart contents, apply promo codes, complete purchase |

**User Actions:** Update item quantities, remove items, save for later, apply coupon, proceed to checkout, fill shipping details, place order.
**Expected APIs:** `POST /api/v1/checkout/validate-promo`, `POST /api/v1/orders`

---

### Route: `/wishlist` — Wishlist
| Property | Value |
|---|---|
| **Page File** | `src/pages/Wishlist.jsx` |
| **Access** | Public (view) / Required for sync |
| **Purpose** | View saved/favorited products |

**Expected APIs:** `GET /api/v1/user/wishlist`, `POST /api/v1/user/wishlist`, `DELETE /api/v1/user/wishlist/:id`

---

### Route: `/dashboard` — Customer Account
| Property | Value |
|---|---|
| **Page File** | `src/pages/Dashboard.jsx` |
| **Layout** | `MainLayout` |
| **Access** | **Authentication Required** |
| **Purpose** | Customer self-service portal |

**Tabs:** Overview, Orders, Wishlist, Addresses, Loyalty, Settings
**Expected APIs:** `GET /api/v1/user/profile`, `GET /api/v1/user/orders`, `GET /api/v1/user/loyalty`

---

### Auth Routes
| Path | Purpose | Access |
|---|---|---|
| `/auth/login` | Customer login form | Public (redirect if authenticated) |
| `/auth/signup` | New account registration | Public |
| `/auth/forgot-password` | Password reset request | Public |

---

## 3.2 Admin ERP Routes (All require authentication + ADMIN role)

| Path | Component | Purpose |
|---|---|---|
| `/admin` | Redirects to `/admin/overview` | - |
| `/admin/overview` | `AdminOverview.jsx` | Global KPI dashboard + activity feed |
| `/admin/products` | `AdminProducts.jsx` | PIM — full product lifecycle management |
| `/admin/orders` | `AdminOrders.jsx` | OMS — order processing and tracking |
| `/admin/customers` | `AdminCustomers.jsx` | CRM — 360° customer management |
| `/admin/analytics` | `AdminAnalytics.jsx` | Analytics dashboards |
| `/admin/marketing` | `AdminMarketing.jsx` | Campaigns, A/B tests, influencers |
| `/admin/storefront` | `AdminStorefront.jsx` | Homepage CMS builder |
| `/admin/inventory` | `AdminInventory.jsx` | WMS — warehouses, suppliers, POs |
| `/admin/support` | `AdminSupport.jsx` | Ticketing, chat, FAQ management |
| `/admin/financials` | `AdminFinancials.jsx` | Revenue, COGS, tax, invoices |
| `/admin/settings` | `AdminSettings.jsx` | RBAC, API keys, webhooks, security |
