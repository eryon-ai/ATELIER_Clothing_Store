# 05 — COMPONENT DOCUMENTATION
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 05 of 18*

---

## LAYOUT COMPONENTS

### `Navbar.jsx`
**Path:** `src/components/layout/Navbar.jsx` | **Size:** 13.8KB
**Purpose:** Primary site navigation. Appears on every storefront page.

**Features:**
- Logo (links to `/`)
- Category navigation links (New Arrivals, Men, Women, Collections, Luxury Essentials, Accessories, Sale)
- Search icon → triggers search overlay
- Cart icon with item count badge → opens cart drawer
- Wishlist icon with count badge
- User avatar / Login link
- Transparent on scroll-top, white background on scroll-down
- Mobile hamburger menu toggle

**Consumes:** `useCartStore` (item count), `useAuthStore` (user state), `useWishlistStore` (wishlist count), `useSearchStore` (search toggle)

---

### `AnnouncementBar.jsx`
**Path:** `src/components/layout/AnnouncementBar.jsx` | **Size:** 816B
**Purpose:** Top-of-page promotional strip driven by CMS data.
**Consumes:** `storefrontCMS.announcement` from `useAdminStore`

---

### `Footer.jsx`
**Path:** `src/components/layout/Footer.jsx` | **Size:** 6KB
**Purpose:** Site-wide footer with navigation, social links, and newsletter signup.

---

### `MobileNav.jsx`
**Path:** `src/components/layout/MobileNav.jsx` | **Size:** 2.5KB
**Purpose:** Bottom navigation bar visible only on mobile devices.
**Items:** Home, Collections, Search, Wishlist, Account

---

### `MainLayout.jsx`
**Path:** `src/layouts/MainLayout.jsx` | **Size:** 925B
**Purpose:** Route wrapper that composes Navbar + content + Footer for all storefront pages.

---

## PRODUCT COMPONENTS

### `ProductCard.jsx`
**Path:** `src/components/product/ProductCard.jsx` | **Size:** 9KB
**Purpose:** The primary visual unit for displaying a product. Used in every grid and listing.

**Props:**
| Prop | Type | Required | Description |
|---|---|---|---|
| `product` | Object | Yes | Full product data object |
| `view` | String | No | `'grid'` or `'list'` — layout mode |
| `onQuickView` | Function | No | Callback for quick-view modal |

**State:** Manages hover state for image swap and action button reveal.

**Features:**
- Primary + hover image swap animation
- Wishlist toggle heart icon
- Quick-add to cart (default size)
- Price display with optional sale price
- Rating stars display
- "New" / "Sale" badge overlay

**Used in:** Home.jsx, Products.jsx, CollectionPage.jsx, ProductDetail.jsx (related products)

---

## UI PRIMITIVE COMPONENTS

### `PageTransition.jsx`
**Path:** `src/components/ui/PageTransition.jsx` | **Size:** 549B
**Purpose:** Framer Motion wrapper that applies consistent fade/slide transitions between page navigations.

**Usage:** Wraps the content of every `<Route>` element within `<AnimatePresence>`.

---

## ADMIN COMPONENTS (11 total)

### `AdminOverview.jsx`
**KPIs:** Revenue, Orders, Customers, Conversion Rate
**Charts:** Revenue trend (weekly bar chart)
**Feed:** Activity log (last 5 events)
**Quick Actions:** New Product, New Campaign, Bulk Refund

---

### `AdminProducts.jsx`
**Features:** Product table, Search, Category filter, Status filter, Create Product modal, Edit Product modal, Publish toggle, Delete action.
**Complex State:** Local form state for the Create/Edit product drawer. Reads/writes from `useAdminStore.products`.

---

### `AdminOrders.jsx`
**Features:** Tab filter (All/Processing/Shipped/Delivered/Cancelled), Search, Order detail slide-over, Status update action, Packing slip print.

---

### `AdminCustomers.jsx`
**Features:** Customer table, Segment filter, Customer 360 slide-over panel (Timeline, Notes, Orders), Ban/Unban action, Tag management.

---

### `AdminAnalytics.jsx`
**Features:** Revenue chart, Traffic source breakdown, Top products table, Funnel visualization, Geographic heat map.

---

### `AdminMarketing.jsx`
**Features:** 4 sub-tabs: Discount Codes, Campaigns, Influencers, A/B Tests. Full CRUD for each.

---

### `AdminStorefront.jsx`
**Features:** Hero Mood switcher, Section toggle grid (drag-to-reorder planned), Marquee editor, Flash Sale banner config, Category card manager, Navigation editor, SEO fields, Landing pages, Banners.

---

### `AdminInventory.jsx`
**Features:** Stock table per warehouse, Low-stock alerts, Manual adjustment modal, Transfer modal, Supplier CRUD, Purchase Order lifecycle management.

---

### `AdminSupport.jsx`
**Features:** Ticket table (filterable), Ticket detail panel (message thread + reply), Live Chat panel, Knowledge Base CRUD, FAQ CRUD, Support Analytics (agent performance table).

---

### `AdminFinancials.jsx`
**Features:** P&L summary cards, Cash Flow chart, Expense table + add expense, B2B Invoice table, Tax Report table, Payout history.

---

### `AdminSettings.jsx`
**Tabs:** General settings form, Roles & Permissions (RBAC), Security settings, Developer API keys, Integrations, Infrastructure (backups + billing).
