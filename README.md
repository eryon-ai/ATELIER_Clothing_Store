# ATELIER — Premium Streetwear E-Commerce Platform

<div align="center">

**A luxury streetwear digital storefront built with a modern React stack.**  
Editorial aesthetics. AI-driven curation. Zero compromise.

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-FF8800?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [State Management](#-state-management)
- [Component Architecture](#-component-architecture)
- [Product Catalog](#-product-catalog)
- [Admin Panel](#-admin-panel)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## 🎯 Overview

**ATELIER** is a full-featured, production-grade e-commerce storefront for a luxury streetwear brand. It is built entirely with React and a modern JavaScript toolchain — featuring a blazing-fast Vite build, fluid Framer Motion page transitions, a fully persistent cart and wishlist powered by Zustand, and a complete admin panel with analytics dashboards.

The design philosophy is editorial and premium: dark surfaces, precise typography, animated micro-interactions, and a product catalog that scales dynamically across 20+ collections and 7 categories.

---

## 🌐 Live Demo

> Run locally with `npm run dev` — see [Getting Started](#-getting-started)

---

## ✨ Features

### 🛍️ Shopping Experience
- **Hero Section** — Full-viewport cinematic hero with smooth zoom animation, campaign text, and CTA buttons
- **Category Grid** — 4-column grid (Women, Men, Accessories, Footwear) with grayscale-to-color hover transitions
- **Bento Grid Layout** — Magazine-style editorial bento grid featuring featured collections
- **Flash Sale Banner** — Live countdown timer (hours, minutes, seconds) that resets daily
- **New Arrivals Carousel** — Horizontally scrollable product carousel with snap scrolling
- **Best Sellers Grid** — 4-column responsive grid sorted by review count
- **Community UGC Section** — Masonry photo grid with hover "Shop the look" overlay

### 🗂️ Collections & Filtering
- **20+ Curated Collections** — new-arrivals, best-sellers, trending, limited, sale, premium, women, men, accessories, footwear, sneakers, oversized, streetwear, anime, marvel, collab, gym, summer, winter, festival
- **URL-Synced Filters** — All active filters (size, color, sort) are synced to the URL — shareable links that preserve filter state
- **Multi-Select Size Filter** — Toggle multiple sizes simultaneously
- **Color Swatch Filter** — Visual color circle filter chips
- **Sort Options** — Featured, Newest, Price Low→High, Price High→Low, Best Sellers, Top Rated
- **Grid / List View Toggle** — Switch between 3-column grid and full-width list view
- **Active Filter Chips** — Animated filter chips with one-click removal
- **Filter Sidebar** — Collapsible animated sidebar with `AnimatePresence`

### 🛒 Cart System
- **Slide-Out Cart Drawer** — Animated off-canvas cart panel
- **Add to Cart** — Size & color selection required before adding
- **Quantity Controls** — Increment/decrement with automatic removal at 0
- **Save for Later** — Move items out of cart without losing them
- **Coupon Codes** — Validate and apply discount codes (percent or fixed amount)
- **Free Shipping Threshold** — Automatically calculated; standard shipping below threshold
- **Tax Calculation** — 8% tax applied to discounted subtotal
- **Order Summary** — Real-time breakdown of subtotal, discount, shipping, tax, and total
- **Persistent Cart** — Cart state persisted to `localStorage` via Zustand middleware

### ❤️ Wishlist
- **Add/Remove from Wishlist** — Toggle items from any product card or detail page
- **Wishlist Page** — Dedicated page with all saved items in a responsive grid
- **Move to Cart** — Add wishlisted items directly to cart with one click
- **Item Count Badge** — Live badge on navbar icon

### 🔍 Search
- **Global Search** — Keyboard shortcut (`⌘K` / `Ctrl+K`) opens full-screen search overlay
- **Live Results** — Instant filtering as you type against the full product catalog
- **Recent Searches** — Persisted recent search history
- **Trending Searches** — Curated trending term chips

### 🧾 Product Detail Page
- **Full Image Gallery** — Primary image with thumbnail strip navigation
- **Size Guide** — Integrated size selection with guide reference
- **Color Selector** — Visual color swatch picker with active state
- **Quantity Selector** — Numeric stepper
- **Sticky Add-to-Cart Bar** — Appears on scroll, always accessible
- **Star Ratings** — Visual rating display with review count
- **Product Features List** — Curated feature tags per product
- **Related Products** — 4-product recommendation row (same category/collection)
- **Breadcrumb Navigation** — Full path context navigation

### 👤 Authentication
- **Login Page** — Email + password authentication UI
- **Sign Up Page** — Account creation with validation
- **Forgot Password Page** — Password reset flow
- **Auth Store** — Zustand auth state with mock JWT session
- **Protected Routes** — Dashboard and Admin require authenticated session

### 📊 User Dashboard
- **Order History** — Tabbed view of all past orders
- **Saved Addresses** — Manage shipping addresses
- **Profile Settings** — Edit personal information
- **Style Profile** — AI-driven aesthetic profile management
- **Tab Navigation** — URL-synced tab routing (`/dashboard/orders`, etc.)

### 🔧 Admin Panel
- **Dashboard Overview** — Key metrics: total revenue, orders, customers, avg. order value
- **Revenue Chart** — Visual area/line chart of sales over time
- **Product Management** — Full CRUD for product catalog
- **Order Management** — View, filter, and update order statuses
- **Customer Management** — Customer list with order history
- **Analytics** — Category breakdown, top products, conversion metrics
- **Inventory Alerts** — Low stock warnings

### 🎨 Design & UX
- **Dark Mode First** — Obsidian black base with curated surface layers
- **Hanken Grotesk** — Editorial-grade Google Font across the entire UI
- **Material Symbols** — Icon system via Google Material Symbols
- **Animated Page Transitions** — Framer Motion `AnimatePresence` on every route change
- **Micro-interactions** — Hover lifts, scale taps, stagger reveals on all interactive elements
- **Responsive Design** — Fully responsive from 320px mobile to 4K desktop
- **Announcement Bar** — Top-of-page dismissible promotion ticker
- **Smooth Scroll** — Lenis smooth scroll library integration
- **Toast Notifications** — `react-hot-toast` for cart/wishlist feedback
- **Custom Scrollbar** — Styled hidden scrollbar for carousels

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 19.2 |
| **Build Tool** | Vite | 8.0 |
| **Styling** | Tailwind CSS | 4.3 |
| **Animation** | Framer Motion | 12.0 |
| **State Management** | Zustand (with persist) | 5.0 |
| **Routing** | React Router DOM | 7.15 |
| **Smooth Scroll** | Lenis | 1.3 |
| **Icons** | Lucide React + Material Symbols | latest |
| **Notifications** | React Hot Toast | latest |
| **Data Fetching** | TanStack React Query | 5.0 |
| **Animation (Scroll)** | GSAP | 3.15 |
| **Slider** | Swiper.js | 12.0 |
| **Utilities** | clsx, tailwind-merge, class-variance-authority | latest |

---

## 📁 Project Structure

```
clothing Store/
├── public/
│   ├── images/                  # Local AI-generated product images
│   │   ├── outerwear.png        # 8K cyberpunk techwear jacket
│   │   ├── knitwear.png         # Premium heavyweight hoodie
│   │   ├── sneakers.png         # Bio-mechanical techwear sneakers
│   │   ├── bottoms.png          # Tactical cargo pants
│   │   ├── accessories.png      # Techwear chest rig
│   │   └── tops.png             # Neo-Kyoto graphic top
│   └── hero-bg.jpg              # Homepage hero background
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx       # Main navigation with search, cart, wishlist icons
│   │   │   ├── Footer.jsx       # Full-width editorial footer
│   │   │   ├── AnnouncementBar.jsx # Dismissable promo banner
│   │   │   └── MobileNav.jsx    # Mobile bottom navigation bar
│   │   ├── product/
│   │   │   └── ProductCard.jsx  # Product card (grid + list variants)
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx   # Slide-out cart panel
│   │   ├── search/              # Global search overlay
│   │   ├── ui/
│   │   │   └── PageTransition.jsx # Route transition wrapper
│   │   └── Sidebar.jsx          # Reusable sidebar component
│   │
│   ├── pages/
│   │   ├── Home.jsx             # Landing page
│   │   ├── CollectionPage.jsx   # Collection/category listing with filters
│   │   ├── ProductDetail.jsx    # Single product page
│   │   ├── Cart.jsx             # Cart & checkout page
│   │   ├── Wishlist.jsx         # Saved items page
│   │   ├── Auth.jsx             # Login / Signup / Forgot Password
│   │   ├── Dashboard.jsx        # User account dashboard
│   │   ├── Admin.jsx            # Admin panel
│   │   └── Products.jsx         # All products listing
│   │
│   ├── store/
│   │   ├── useCartStore.js      # Cart state + coupon + shipping logic
│   │   ├── useWishlistStore.js  # Wishlist state (persisted)
│   │   ├── useAuthStore.js      # Auth session state
│   │   └── useSearchStore.js    # Search query + recent history
│   │
│   ├── mock/
│   │   └── products.js          # 480+ products across 20 collections
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx       # Shell: Navbar + Outlet + Footer
│   │
│   ├── constants/               # App-wide constants (sizes, colors, sort options)
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Helper utilities (cn, formatPrice, etc.)
│   ├── services/                # External service wrappers
│   ├── animations/              # Shared Framer Motion variants
│   └── App.jsx                  # Root router + route definitions
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🗺 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `Home` | Hero, categories, flash sale, carousels, bento grid |
| `/products` | `Products` | Full product catalog |
| `/products/:slug` | `ProductDetail` | Single product with gallery, options, related |
| `/collections/:slug` | `CollectionPage` | Filtered collection page |
| `/cart` | `Cart` | Cart drawer + full checkout page |
| `/wishlist` | `Wishlist` | Saved items grid |
| `/dashboard` | `Dashboard` | User account overview |
| `/dashboard/:tab` | `Dashboard` | Tab-routed dashboard sections |
| `/admin` | `Admin` | Admin panel (protected) |
| `/auth/login` | `Auth` | Login form |
| `/auth/signup` | `Auth` | Account creation |
| `/auth/forgot-password` | `Auth` | Password reset |
| `*` | `404` | Not Found page |

### Collection Slugs Available

```
new-arrivals  best-sellers  trending  limited     sale
premium       women         men       accessories footwear
sneakers      oversized     streetwear anime      marvel
collab        gym           summer    winter      festival
```

---

## 🗃 State Management

All client state is managed with **Zustand**, a minimal, un-opinionated state manager. State that should survive page refreshes is persisted to `localStorage` via the built-in `persist` middleware.

### `useCartStore`
| Action | Description |
|---|---|
| `addItem(product, size, color, qty)` | Adds item, merges quantity if already exists |
| `removeItem(key)` | Removes by composite key (id + size + color) |
| `updateQuantity(key, qty)` | Updates qty; removes if qty < 1 |
| `saveForLater(key)` | Moves to saved items array |
| `applyCoupon(code)` | Validates against `COUPON_CODES` constant |
| `getSubtotal()` | Sum of all item prices × quantities |
| `getDiscount()` | Percent or fixed coupon reduction |
| `getShipping()` | Free above threshold, standard below |
| `getTax()` | 8% on discounted subtotal |
| `getTotal()` | Final order total |

### `useWishlistStore`
- `toggleItem(product)` — Adds or removes from wishlist
- `isWishlisted(id)` — Returns boolean for any product ID
- `getCount()` — Total wishlisted items

### `useAuthStore`
- `login(email, password)` — Sets authenticated session
- `logout()` — Clears session
- `user` — Current user object

### `useSearchStore`
- `query`, `setQuery()` — Active search term
- `recentSearches`, `addRecent()` — Persistent history

---

## 🧩 Component Architecture

### `ProductCard`
Renders in both **grid** and **list** view modes. Features:
- Hover image scale transition
- Quick-add to cart (opens size modal)
- Wishlist heart toggle with animation
- Badge overlay (NEW / LIMITED / SALE + % off)
- Rating stars and review count
- Color swatch mini-preview

### `CollectionPage`
Fully self-contained collection experience:
- Reads collection slug from URL params
- Filters products from the global store
- All filter state synced to URL search params
- Share any filtered state as a URL

### `CartDrawer`
- Slides in from the right via Framer Motion
- Full item list with image, name, color, size, qty controls
- Coupon code input with live validation
- Order summary with animated number transitions
- Checkout CTA button

---

## 🗄 Product Catalog

The product catalog (`src/mock/products.js`) generates **480+ products** across the full collection matrix:

### Categories (7)
| Category | Image Source |
|---|---|
| `outerwear` | AI-generated 8K techwear jacket |
| `knitwear` | AI-generated heavyweight hoodie |
| `sneakers` | AI-generated bio-mechanical sneaker |
| `footwear` | Unsplash luxury boot photography |
| `accessories` | AI-generated techwear chest rig |
| `bottoms` | AI-generated tactical cargo pants |
| `tops` | AI-generated Neo-Kyoto graphic top |

### How it works
- Each of the **20 collections** gets **24 unique products**
- Each product uses a curated real product name from a pool of 20 names per category
- Pricing is randomized in realistic ranges (`₹80–₹780`)
- Sale products have a `comparePrice` and auto-calculated `discount %`
- New arrivals, limited editions, and bestsellers are flagged during generation
- Sizes are category-correct: clothing uses `XS–XXL`, footwear uses `38–45`, accessories use `ONE SIZE`

---

## 🔐 Admin Panel

The admin panel at `/admin` provides a complete back-office experience:

### Dashboard KPIs
- Total Revenue (with trend indicator)
- Total Orders
- Active Customers
- Average Order Value

### Sections
| Section | Features |
|---|---|
| **Overview** | Revenue chart, recent orders table, top products |
| **Products** | List all products, add/edit/delete, stock management |
| **Orders** | Order list with status filters (Pending, Processing, Shipped, Delivered) |
| **Customers** | Customer database with order history |
| **Analytics** | Category performance, conversion rates, AOV trends |
| **Settings** | Store configuration |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) `v18+`
- [npm](https://npmjs.com/) `v9+`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/atelier-store.git
cd atelier-store

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **[http://localhost:5173](http://localhost:5173)**

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🌿 Environment Variables

No environment variables are required to run this project locally. The app runs entirely on mock data.

If connecting to a live backend in future, you would add:

```env
# .env.local
VITE_API_URL=https://your-api.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_CLOUDINARY_CLOUD=your-cloud-name
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a **Pull Request**

### Code Style
- Follow the existing component structure in `src/components/`
- Use Tailwind utility classes following the existing design token system
- All new state should go through Zustand stores
- All new pages need a `<PageTransition>` wrapper in `App.jsx`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the ERYON team**

*Elevating digital fashion experiences, one pixel at a time.*

</div>
# ATELIER_Clothing_Store
