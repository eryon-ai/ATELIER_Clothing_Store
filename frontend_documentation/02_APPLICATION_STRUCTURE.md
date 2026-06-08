# 02 — APPLICATION STRUCTURE
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 02 of 18*

---

## 2.1 Complete Folder Structure

```
clothing-store/
│
├── public/                        # Static assets served as-is
│   ├── hero-bg.jpg                # Homepage hero background image
│   ├── images/                    # Product category images
│   │   ├── tops.png
│   │   ├── bottoms.png
│   │   ├── outerwear.png
│   │   ├── sneakers.png
│   │   ├── knitwear.png
│   │   └── accessories.png
│   └── social.jpg                 # Open Graph image for social sharing
│
├── src/
│   ├── main.jsx                   # React app entry point — mounts to #root
│   ├── App.jsx                    # Root component — router and global layout
│   ├── App.css                    # Global Tailwind directives and overrides
│   │
│   ├── pages/                     # Top-level route pages (one per major route)
│   │   ├── Home.jsx               # Homepage (/) — dynamic CMS-driven landing
│   │   ├── Auth.jsx               # Login, Signup, Forgot Password pages
│   │   ├── Products.jsx           # All products listing (/products)
│   │   ├── ProductDetail.jsx      # Individual product page (/products/:slug)
│   │   ├── CollectionPage.jsx     # Filtered collection (/collections/:slug)
│   │   ├── Cart.jsx               # Shopping cart and checkout (/cart)
│   │   ├── Wishlist.jsx           # Saved items (/wishlist)
│   │   ├── Dashboard.jsx          # Customer account portal (/dashboard)
│   │   └── Admin.jsx              # Admin shell — wraps admin sub-routes
│   │
│   ├── components/                # Reusable UI components
│   │   ├── admin/                 # All 11 Admin Panel page components
│   │   │   ├── AdminOverview.jsx  # Dashboard KPIs and activity feed
│   │   │   ├── AdminProducts.jsx  # PIM — product management
│   │   │   ├── AdminOrders.jsx    # OMS — order management
│   │   │   ├── AdminCustomers.jsx # CRM — customer management
│   │   │   ├── AdminAnalytics.jsx # Analytics and reporting
│   │   │   ├── AdminMarketing.jsx # Campaigns, A/B, Influencers
│   │   │   ├── AdminStorefront.jsx# CMS builder for homepage layout
│   │   │   ├── AdminInventory.jsx # WMS — warehouse and suppliers
│   │   │   ├── AdminSupport.jsx   # Ticketing, chat, knowledge base
│   │   │   ├── AdminFinancials.jsx# Revenue, expenses, invoices
│   │   │   └── AdminSettings.jsx  # RBAC, security, API keys
│   │   │
│   │   ├── layout/                # Site-wide layout components
│   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   ├── Footer.jsx         # Site footer
│   │   │   ├── AnnouncementBar.jsx# Top announcement strip
│   │   │   └── MobileNav.jsx      # Bottom mobile navigation bar
│   │   │
│   │   ├── product/               # Product-specific components
│   │   │   └── ProductCard.jsx    # Reusable product card (used everywhere)
│   │   │
│   │   ├── ui/                    # Generic reusable UI primitives
│   │   │   └── PageTransition.jsx # Framer Motion page wrapper
│   │   │
│   │   ├── search/                # Search overlay components
│   │   └── cart/                  # Cart drawer components
│   │
│   ├── layouts/                   # Route layout wrappers
│   │   └── MainLayout.jsx         # Wraps storefront routes with Navbar + Footer
│   │
│   ├── store/                     # Zustand global state stores
│   │   ├── useAuthStore.js        # Authentication state + actions
│   │   ├── useCartStore.js        # Cart items + coupon + computed totals
│   │   ├── useWishlistStore.js    # Wishlist item IDs
│   │   ├── useSearchStore.js      # Search query and results state
│   │   └── useAdminStore.js       # ALL admin ERP state (649 lines)
│   │
│   ├── constants/                 # Application-wide constants
│   │   └── index.js               # Coupon codes, thresholds, configs
│   │
│   ├── utils/                     # Pure utility functions
│   │   └── index.js               # formatPrice, debounce, cn(), toSlug, etc.
│   │
│   ├── mock/                      # Mock data for development
│   │   └── products.js            # PRODUCTS array — source of catalog data
│   │
│   ├── animations/                # Shared animation configs
│   ├── assets/                    # Imported assets (SVGs, images)
│   ├── features/                  # Feature-based component groupings
│   ├── routes/                    # Route configuration helpers
│   ├── services/                  # API service layer (currently unused/mock)
│   └── styles/
│       └── globals.css            # Global CSS variables and overrides
│
├── vite.config.js                 # Vite build configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── package.json                   # Dependencies and scripts
└── index.html                     # HTML entry point
```

---

## 2.2 Architecture Decisions Explained

### Decision 1: Zustand over Redux
**Why:** Zustand is dramatically simpler than Redux. It requires no reducers, no dispatch pattern, and no Provider boilerplate. For a 1–5 developer team, Zustand's minimal API (`create`, `set`, `get`) reduces cognitive overhead significantly while providing the same capabilities.

### Decision 2: File-per-page in `/pages/`
**Why:** Each top-level route corresponds to one file in `/pages/`. This makes it easy for any developer to instantly find the entry point for any screen. The admin sub-pages are exceptions — they live in `/components/admin/` because they are rendered as children of the `Admin.jsx` layout shell.

### Decision 3: Centralized Admin State in `useAdminStore.js`
**Why:** Rather than splitting admin state into 10 separate stores (one per admin module), all admin data lives in a single store. This makes cross-module data relationships easy (e.g., the Overview can access Orders AND Products without importing multiple stores).

**Trade-off:** The store file is 649 lines — a maintenance concern at scale. At production scale, this should be split into module-specific stores.

### Decision 4: Code Splitting with `React.lazy()`
**Why:** All non-critical pages are lazy-loaded. This means the initial page bundle (what a user downloads on first visit) is minimal, and heavy pages like `AdminStorefront.jsx` (72KB) are only loaded when that specific route is visited.

### Decision 5: Persistence via localStorage
**Why:** Cart items and auth sessions persist via Zustand's `persist` middleware, which serializes state to `localStorage`. This means a customer can close the browser and return to find their cart intact — a critical e-commerce UX requirement.

| Store | Storage Key | What's Persisted |
|---|---|---|
| useAuthStore | `atelier-auth` | user object, isAuthenticated flag |
| useCartStore | `atelier-cart` | items array, coupon object |
| useWishlistStore | `atelier-wishlist` | wishlist product IDs |
| useAdminStore | `atelier-admin-v9` | ALL admin data (products, orders, customers...) |
