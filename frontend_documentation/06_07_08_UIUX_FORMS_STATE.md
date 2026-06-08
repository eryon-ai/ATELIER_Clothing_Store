# 06 — UI/UX DOCUMENTATION
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 06 of 18*

---

## Typography System

| Token | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Display XL | Cormorant Garamond | 72px+ | 300 (Light) | Hero headlines |
| Display L | Cormorant Garamond | 48-60px | 400 | Section headings |
| Display M | Cormorant Garamond | 36px | 400 | Card headings |
| Body L | Hanken Grotesk | 18px | 400 | Feature text |
| Body | Hanken Grotesk | 16px | 400 | General body |
| Body S | Hanken Grotesk | 14px | 400 | Labels, metadata |
| Caption | Hanken Grotesk | 12px | 400 | Badges, timestamps |
| UI Label | Hanken Grotesk | 13px | 500 | Buttons, navigation |

---

## Color System

### Storefront Colors
| Token | Value | Usage |
|---|---|---|
| `--color-black` | `#000000` | Primary text, buttons, borders |
| `--color-bg` | `#F8F6F3` | Page background |
| `--color-white` | `#FFFFFF` | Cards, overlays |
| `--color-warm-gray` | `#9A9089` | Secondary text, placeholders |
| `--color-border` | `#E8E3DF` | Dividers, input borders |

### Admin Panel Colors
| Token | Value | Usage |
|---|---|---|
| Admin sidebar bg | `#FFFFFF` | Pure white sidebar |
| Admin page bg | `#F4F5F7` | Light gray canvas |
| Success green | `#16A34A` | Delivered, active, positive |
| Warning amber | `#D97706` | Pending, medium risk |
| Error red | `#DC2626` | Cancelled, high risk, errors |
| Info blue | `#2563EB` | Informational states |

---

## Component Patterns

### Buttons
- **Primary:** Black background, white text, 2px rounded corners
- **Secondary:** White background, black border, black text
- **Ghost:** Transparent, text only, underline on hover
- **Destructive:** Red background (delete actions)

### Cards
- White background
- Subtle `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
- 12-16px internal padding
- 8px border radius

### Tables (Admin)
- Striped rows (every other row: `#FAFAFA`)
- Sticky header on scroll
- Row hover state: `#F4F5F7`
- Sortable columns indicated by arrow icon

### Status Badges
- Pill-shaped (border-radius: 9999px)
- Background: Light tint of status color
- Text: Dark version of status color
- Example: Processing → Blue pill, Shipped → Purple pill, Delivered → Green pill

---

## Animation System

All animations use **Framer Motion**:

| Animation | Where Used | Duration | Easing |
|---|---|---|---|
| Page transition | Route changes | 0.3s | easeInOut |
| Modal appear | Modal open | 0.2s | easeOut |
| Card hover lift | ProductCard | 0.2s | ease |
| Drawer slide-in | Cart, Admin panels | 0.35s | easeOut |
| Accordion expand | FAQ, Settings tabs | 0.25s | easeInOut |

---

## Responsiveness

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile | < 640px | Single column, MobileNav visible, Navbar hamburger |
| Tablet | 640–1024px | 2-column product grid |
| Desktop | > 1024px | Full Navbar, 3-4 column grid, side-by-side layouts |
| Wide | > 1280px | Max content width 1280px, centered |

---

# 07 — FORM DOCUMENTATION
*Document 07 of 18*

---

## Form 1: Login Form (`Auth.jsx`)
**Fields:**
- Email (required, valid email format)
- Password (required, min 6 characters)

**Submission:** `useAuthStore.login(email, password)` → sets auth state → redirects to previous page or `/dashboard`
**Error handling:** Inline error message below the form on failed login.

---

## Form 2: Signup Form (`Auth.jsx`)
**Fields:**
- Full Name (required, min 2 chars)
- Email (required, valid email, must be unique)
- Password (required, min 6 characters)
- Confirm Password (must match password)

**Submission:** `useAuthStore.signup()` → creates account → auto-login → redirects to `/dashboard`

---

## Form 3: Create/Edit Product Form (`AdminProducts.jsx`)
**Fields:**
| Field | Type | Validation |
|---|---|---|
| Product Name | Text | Required, min 3 chars |
| SKU | Text | Required, globally unique |
| Category | Select | Required |
| Price | Number | Required, > 0 |
| Description | Textarea | Optional |
| Images | File Upload | At least 1 before publish |
| Variants | Dynamic key-value | Size → Stock quantity |

---

## Form 4: Checkout Form (`Cart.jsx`)
**Shipping Fields:**
- First Name, Last Name (required)
- Email (required, valid)
- Address Line 1 (required)
- City, State, ZIP, Country (required)
- Phone (optional)

**Payment Fields:**
- Card Number (required, luhn valid)
- Expiry MM/YY (required)
- CVV (required)

**Promo Code:**
- Code input → validates against backend
- Discount applied to order total

---

## Form 5: Admin Settings Forms (`AdminSettings.jsx`)
**General Tab:**
- Store Name, Contact Email, Currency, Tax Rate %, Free Shipping Threshold, Low Stock Alert Qty
- All fields persisted on Save Changes click

**Security Tab:**
- Enforce 2FA (toggle)
- Session Timeout (minutes)
- IP Whitelist (textarea)

---

# 08 — STATE MANAGEMENT DOCUMENTATION
*Document 08 of 18*

---

## 8.1 Store Overview

| Store | File | Size | Persisted | Purpose |
|---|---|---|---|---|
| `useAuthStore` | `store/useAuthStore.js` | 1.9KB | Yes | User authentication state |
| `useCartStore` | `store/useCartStore.js` | 4KB | Yes | Shopping cart + totals |
| `useWishlistStore` | `store/useWishlistStore.js` | 1KB | Yes | Wishlist product IDs |
| `useSearchStore` | `store/useSearchStore.js` | 1.6KB | No | Search UI state |
| `useAdminStore` | `store/useAdminStore.js` | 37.9KB | Yes | All admin ERP data |

---

## 8.2 `useAuthStore` — Authentication

**State Shape:**
```
{
  user: {
    id: string,
    email: string,
    name: string,
    avatar: string | null,
    tier: 'New Member' | 'Gold Member' | 'VIP Member',
    points: number,
    joinedAt: string (ISO date)
  } | null,
  isAuthenticated: boolean,
  isLoading: boolean
}
```

**Actions:**
- `login(email, password)` — Mock auth. In production: `POST /api/v1/auth/login`
- `signup(name, email, password)` — In production: `POST /api/v1/auth/register`
- `logout()` — Clears user + isAuthenticated. In production: invalidates JWT.
- `updateProfile(data)` — Partial update. In production: `PATCH /api/v1/user/profile`

---

## 8.3 `useCartStore` — Shopping Cart

**State Shape:**
```
{
  items: [{
    key: string (productId-size-colorName),
    product: ProductObject,
    selectedSize: string,
    selectedColor: ColorObject,
    quantity: number,
    addedAt: ISO string
  }],
  coupon: { code, type, value, label } | null,
  isOpen: boolean
}
```

**Computed Getters (not persisted — recalculated):**
- `getSubtotal()` — Sum of (price × quantity) for all items
- `getDiscount()` — Applies coupon (percent or fixed)
- `getShipping()` — $0 if subtotal ≥ FREE_SHIPPING_THRESHOLD, else STANDARD_SHIPPING_COST
- `getTax()` — 8% applied to (subtotal − discount)
- `getTotal()` — subtotal − discount + shipping + tax
- `getItemCount()` — Total units in cart

**Business Logic:**
- Coupon codes are validated client-side against `COUPON_CODES` constant.
- In production: validation must move to the backend to prevent manipulation.

---

## 8.4 `useAdminStore` — All Admin State

This is the largest store in the application. It manages ALL admin panel data in a single store.

**Top-Level State Keys:**
| Key | Type | Description |
|---|---|---|
| `customers` | Array | 10 mock customers with full CRM data |
| `products` | Array | First 30 products from mock data |
| `orders` | Array | 15 generated mock orders |
| `activities` | Array | 5 activity feed items |
| `stats` | Object | Revenue, orders, customers, conversion |
| `storefront` | Object | Main hero configuration |
| `storefrontCMS` | Object | Complete homepage CMS layout (largest key) |
| `warehouses` | Array | 3 warehouse locations |
| `suppliers` | Array | 3 supplier records |
| `purchaseOrders` | Array | 2 purchase orders |
| `campaigns` | Array | 4 discount campaigns |
| `omniCampaigns` | Array | 4 channel campaigns |
| `influencers` | Array | 3 influencer records |
| `abTests` | Array | 2 A/B tests |
| `supportTickets` | Array | 4 support tickets |
| `liveChats` | Array | 2 live chat sessions |
| `kbArticles` | Array | 2 KB articles |
| `financials` | Object | Complete financial data |
| `settings` | Object | Global store settings |
| `enterpriseSettings` | Object | Roles, API keys, webhooks, billing |
