# 13 — DASHBOARD DOCUMENTATION
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 13 of 18*

---

## Admin Overview Dashboard Widgets

| Widget | Data Source | Calculation | Refresh | API |
|---|---|---|---|---|
| **Total Revenue** | orders table | SUM(total_amount) WHERE status IN (SHIPPED, DELIVERED) | Every 15 min | `GET /admin/dashboard/kpis` |
| **Total Orders** | orders table | COUNT(*) for selected period | Every 15 min | Same |
| **Active Customers** | users table | COUNT(*) WHERE is_banned=false AND role=CUSTOMER | Every hour | Same |
| **Conversion Rate** | Analytics | (Orders / Unique Sessions) × 100 | Every hour | `GET /admin/analytics/conversion` |
| **Revenue Chart** | orders grouped by day | SUM(total) grouped by date | Every hour | `GET /admin/analytics/revenue?period=7d` |
| **Activity Feed** | audit_logs + events | Most recent 5 significant events | Real-time (WebSocket) | WS push |

## Analytics Dashboard Widgets

| Widget | Calculation | API |
|---|---|---|
| **Traffic Sources** | Sessions grouped by referrer | `GET /admin/analytics/traffic` |
| **Top Products** | SUM revenue per product_id | `GET /admin/analytics/top-products` |
| **Customer Segments** | COUNT by loyalty tier | `GET /admin/analytics/segments` |
| **ROAS** | Revenue / Ad Spend | `GET /admin/marketing/stats` |
| **CAC** | Total Spend / New Customers | Same |

---

# 14 — BUSINESS RULES DOCUMENTATION
*Document 14 of 18*

---

## Product Rules
1. **SKU Uniqueness:** Every product must have a globally unique SKU. Duplicate SKUs are rejected at save time.
2. **Soft Delete Only:** Products linked to historical orders are never hard-deleted. `is_deleted = true` removes from public view.
3. **Publish Gate:** A product without at least one image cannot be published. Status defaults to `Draft`.
4. **Price Positivity:** Base price must be greater than $0.00.
5. **Variant Stock:** Variant-level inventory must never be negative (enforced by DB CHECK constraint).

## Order Rules
1. **Status Immutability:** Once an order reaches `DELIVERED` or `CANCELLED`, no further status changes are allowed.
2. **Cancellation Gate:** Only `PROCESSING` orders can be cancelled. Attempting to cancel `SHIPPED` throws a 400 error.
3. **Tracking Required:** Status cannot advance to `SHIPPED` without a tracking number.
4. **Inventory Lock:** Stock is reserved (not permanently deducted) at order creation. Permanent deduction happens at `SHIPPED`.
5. **Historical Price:** `price_at_purchase` in `order_items` records the price AT TIME OF PURCHASE. This value never changes even if the product price is later updated.

## Customer Rules
1. **Email Uniqueness:** No two accounts can share an email address.
2. **Banned User Lockout:** Banning a user immediately invalidates their active sessions via Redis blacklist.
3. **Loyalty Points:** Loyalty points cannot go negative. Minimum value is 0.

## Inventory Rules
1. **Zero Floor:** `quantity_available` cannot go below 0. Enforced at DB level by `CHECK (quantity_available >= 0)`.
2. **Oversell Prevention:** Orders use pessimistic row-level locking (`SELECT FOR UPDATE`) to prevent two simultaneous purchases from overselling the last unit.
3. **PO Receive:** When a Purchase Order is marked `RECEIVED`, inventory for all PO line items is automatically incremented.

## Coupon/Discount Rules
1. **Case Insensitive:** Promo codes are compared case-insensitively (e.g., `summer20` === `SUMMER20`).
2. **Stacking:** Only ONE coupon can be applied per order.
3. **Usage Limit:** `current_uses < max_uses` must be true at time of application.
4. **Expiry:** `expires_at > NOW()` must be true.
5. **Minimum Order:** `order_total >= min_order_value` must be true.

## Financial Rules
1. **Invoice Linkage:** Every B2B Invoice must be linked to a specific Order or Wholesale Agreement ID.
2. **Tax Calculation:** Tax is calculated AFTER discount is applied: `tax = (subtotal - discount) × tax_rate`.
3. **Overdue Invoices:** Invoices past their `due_date` are automatically flagged `OVERDUE` by a daily cron job.

---

# 15 — TESTING GUIDE
*Document 15 of 18*

---

## Storefront Test Scenarios

### Authentication
- ✅ Login with valid credentials → redirects to dashboard
- ✅ Login with wrong password → shows error, does NOT redirect
- ✅ Login form — email format validation fires before submit
- ✅ Signup with mismatched passwords → form error
- ✅ Logout → clears state, redirects to homepage

### Cart
- ✅ Add same product twice (same size) → quantity increments, NOT a new row
- ✅ Add same product with DIFFERENT size → creates separate cart row
- ✅ Remove item → item disappears, total recalculates
- ✅ Apply valid promo code → discount appears
- ✅ Apply expired/invalid promo code → error message
- ✅ Cart persists after browser refresh (localStorage)
- ✅ Free shipping threshold: order > threshold → $0 shipping fee

### Product Detail
- ✅ Size selector shows sold-out sizes as disabled
- ✅ Cannot add to cart without selecting size
- ✅ Quantity cannot go below 1

---

## Admin Panel Test Scenarios

### Products
- ✅ Create product with missing SKU → validation error
- ✅ Create product with duplicate SKU → reject with conflict error
- ✅ Publish product without image → blocked with error
- ✅ Soft delete → product disappears from customer catalog, remains in admin drafts
- ✅ Edit product → changes persist after page refresh (Zustand persistence)

### Orders
- ✅ Change status: Processing → Shipped (valid)
- ✅ Change status: Shipped → Processing (blocked)
- ✅ Change status: Delivered → any (blocked)
- ✅ Cancel a Processing order → succeeds
- ✅ Cancel a Shipped order → blocked with error message

### Settings / RBAC
- ✅ Create new Role → appears in roles table
- ✅ Edit existing Role permissions → changes persist
- ✅ Delete Role → removed from table

---

# 16 — BACKEND IMPLEMENTATION GUIDE
*Document 16 of 18*

---

## What the Backend Must Implement

### Critical Priority (P0)
1. **Auth Service** — Register, Login, JWT generation, Refresh tokens
2. **Product Service** — Full CRUD + SKU validation + soft delete + image upload
3. **Order Service** — Create with ACID transaction (inventory lock + deduct + order + items atomically)
4. **Inventory Service** — Stock reservation/deduction + transfer with transaction
5. **Coupon Service** — Validate code + check all 4 business rules + increment uses

### High Priority (P1)
6. **Customer Service** — CRM data, LTV calculation, ban/unban + session revocation
7. **Support Service** — Ticket CRUD + SLA calculation + message threading
8. **Storefront CMS Service** — Store JSONB config + publish to Redis cache

### Medium Priority (P2)
9. **Financial Service** — Revenue aggregations + expense CRUD + invoice management
10. **Marketing Service** — Campaign management + A/B test CRUD + influencer tracking
11. **Notification Service** — Email via SendGrid + SMS via Twilio (triggered by events)
12. **Audit Log Service** — Auto-log all admin mutations

---

# 17 — ARCHITECTURE IMPROVEMENTS
*Document 17 of 18*

---

## Issues Found

| # | Issue | Severity | Recommendation |
|---|---|---|---|
| 1 | Coupon validation on frontend | CRITICAL | Move ALL promo code logic to backend — easily exploited |
| 2 | Cart stored only in localStorage | HIGH | Add server-side cart sync for logged-in users |
| 3 | All admin data in one 649-line store | MEDIUM | Split into module-specific stores |
| 4 | No API layer abstraction | MEDIUM | Create `src/services/api.js` with Axios instance and interceptors |
| 5 | `Date.now()` used as product IDs | LOW | Use UUIDs (generated server-side) |
| 6 | No loading states on admin tables | LOW | Add skeleton loaders for all data tables |
| 7 | No error boundaries | MEDIUM | Add `<ErrorBoundary>` around each admin module |
| 8 | No pagination on admin tables | HIGH | All tables must support server-side pagination |

---

# 18 — PRODUCTION READINESS REPORT
*Document 18 of 18*

---

## Evaluation Scores

| Category | Score | Notes |
|---|---|---|
| **Maintainability** | 7/10 | Good component separation; large monolithic store is a concern |
| **Scalability** | 5/10 | No API layer; cart/auth logic will break at real scale |
| **Security** | 4/10 | Promo validation on frontend is a critical vulnerability |
| **Performance** | 8/10 | Code splitting + lazy loading implemented; animations are smooth |
| **Accessibility** | 5/10 | Focus states inconsistent; missing ARIA labels on icon buttons |
| **Responsiveness** | 8/10 | Mobile nav present; grid breakpoints well-handled |

## Top 5 Must-Fix Before Production

1. **[CRITICAL]** Move promo code validation and ALL business logic calculations to the backend.
2. **[HIGH]** Replace all `localStorage` auth token handling with `httpOnly` cookie refresh tokens.
3. **[HIGH]** Add a centralized Axios service layer with JWT interceptor for all API calls.
4. **[HIGH]** Implement server-side pagination on all admin data tables (loading 10,000 orders into the browser is unacceptable).
5. **[MEDIUM]** Add React Error Boundaries around all 11 admin module components to prevent a single module crash from crashing the entire admin panel.
