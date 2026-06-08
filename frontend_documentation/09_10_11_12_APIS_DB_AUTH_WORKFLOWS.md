# 09 — API REQUIREMENTS
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 09 of 18*

> All APIs are reverse-engineered from the frontend's data structures and action patterns. All routes use the `/api/v1/` prefix.

---

## Authentication APIs
| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/login` | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken }` |
| POST | `/auth/logout` | - | `{ success: true }` |
| POST | `/auth/forgot-password` | `{ email }` | `{ success: true }` |

---

## Product APIs (Public)
| Method | Endpoint | Query Params | Response |
|---|---|---|---|
| GET | `/products` | `category, sort, min_price, max_price, in_stock, page, limit` | `{ data: Product[], meta: Pagination }` |
| GET | `/products/:slug` | - | `Product` (full detail with variants, reviews) |

## Product APIs (Admin)
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/admin/products` | ADMIN/MERCH | Paginated list including drafts |
| POST | `/admin/products` | ADMIN/MERCH | Create product |
| PUT | `/admin/products/:id` | ADMIN/MERCH | Full update |
| PATCH | `/admin/products/:id/publish` | ADMIN | Toggle published |
| DELETE | `/admin/products/:id` | ADMIN | Soft delete |
| POST | `/admin/products/:id/images` | ADMIN/MERCH | Upload images |

---

## Order APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/orders` | CUSTOMER | Place order (checkout) |
| GET | `/orders/my` | CUSTOMER | Own order history |
| GET | `/admin/orders` | ADMIN | All orders with filters |
| GET | `/admin/orders/:id` | ADMIN | Order detail |
| PATCH | `/admin/orders/:id/status` | ADMIN | Update status + tracking |
| POST | `/admin/orders/:id/refund` | ADMIN | Issue refund |

---

## Customer APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/user/profile` | CUSTOMER | Own profile |
| PATCH | `/user/profile` | CUSTOMER | Update profile |
| GET | `/user/orders` | CUSTOMER | Own order history |
| GET | `/admin/customers` | ADMIN | Paginated CRM list |
| GET | `/admin/customers/:id` | ADMIN | Customer 360 profile |
| POST | `/admin/customers/:id/notes` | ADMIN | Add note |
| PATCH | `/admin/customers/:id/ban` | ADMIN | Toggle ban |

---

## Checkout APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/checkout/validate-promo` | Any | Validate coupon code |
| POST | `/checkout/shipping-rates` | Any | Calculate shipping options |

---

## Storefront / CMS APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/storefront/config` | Public | Published CMS layout |
| PUT | `/admin/storefront/config` | ADMIN | Update draft |
| POST | `/admin/storefront/config/publish` | ADMIN | Publish and cache-bust |

---

## Marketing APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET/POST | `/admin/campaigns` | ADMIN | Discount code management |
| GET/POST | `/admin/influencers` | ADMIN | Influencer management |
| GET/POST | `/admin/ab-tests` | ADMIN | A/B test management |

---

## Inventory APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/admin/inventory` | ADMIN/MERCH | Stock levels |
| POST | `/admin/inventory/adjust` | ADMIN | Manual adjustment |
| POST | `/admin/inventory/transfer` | ADMIN | Warehouse transfer |
| GET/POST | `/admin/warehouses` | ADMIN | Warehouse management |
| GET/POST/PATCH | `/admin/purchase-orders` | ADMIN | PO lifecycle |

---

## Support APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/support/tickets` | CUSTOMER | Create ticket |
| GET | `/admin/support/tickets` | ADMIN/SUPPORT | All tickets |
| POST | `/admin/support/tickets/:id/reply` | ADMIN/SUPPORT | Reply to ticket |
| PATCH | `/admin/support/tickets/:id/close` | ADMIN/SUPPORT | Close ticket |
| GET/POST | `/admin/support/kb-articles` | ADMIN/SUPPORT | Knowledge base |
| GET/POST | `/admin/support/faqs` | ADMIN | FAQ management |

---

## Financials APIs
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/admin/financials/overview` | ADMIN/FINANCE | P&L summary |
| GET | `/admin/financials/expenses` | ADMIN/FINANCE | Expense list |
| POST | `/admin/financials/expenses` | ADMIN/FINANCE | Add expense |
| GET | `/admin/financials/invoices` | ADMIN/FINANCE | B2B invoices |
| GET | `/admin/financials/tax-reports` | ADMIN/FINANCE | Tax by region |

---

# 10 — DATABASE REQUIREMENTS
*Document 10 of 18*

## Core Tables (reverse-engineered from frontend data shapes)

### `users`
- id, email (unique), password_hash, full_name, phone, role, loyalty_points, retention_score, health_score, risk_flag (enum), is_banned, created_at

### `products`
- id, sku (unique), name, slug (unique), description, base_price, cost_price, category, variants (JSONB), images (TEXT[]), is_published, is_deleted, created_by (FK→users), created_at

### `orders`
- id, order_number (unique), user_id (FK→users), total_amount, discount_amount, shipping_cost, tax_amount, promo_code, status (enum), risk_flag (enum), tracking_number, carrier, created_at

### `order_items`
- id, order_id (FK→orders, CASCADE), product_id (FK→products), quantity, price_at_purchase, size

### `inventory`
- id, product_id (FK→products), warehouse_id (FK→warehouses), quantity_available (≥0), quantity_reserved

### `warehouses`
- id, name, location, type (enum: FULFILLMENT/RETAIL), capacity_percent

### `suppliers`
- id, name, type, lead_time_days, rating

### `purchase_orders`
- id, supplier_id (FK→suppliers), status (enum: DRAFT/IN_TRANSIT/RECEIVED), expected_date, total_value, item_count

### `discount_campaigns`
- id, code (unique), type (enum: PERCENTAGE/FIXED/FREE_SHIPPING), value, min_order_value, max_uses, current_uses, is_active, expires_at

### `support_tickets`
- id, user_id (FK→users), subject, status, priority, sla_deadline, assigned_to (FK→users), escalation_level

### `ticket_messages`
- id, ticket_id (FK→tickets), sender_role, message, sent_at

### `storefront_config`
- id, config_json (JSONB), is_published, published_at, updated_by

### `audit_logs`
- id, user_id, action, entity, entity_id, ip_address, details (JSONB), created_at

### `notifications`
- id, user_id, type (enum), title, body, is_read, sent_at

---

# 11 — AUTHENTICATION & AUTHORIZATION
*Document 11 of 18*

## Login Flow
```
1. User navigates to /auth/login
2. Fills Email + Password form
3. Submits → useAuthStore.login() called
4. [Production] POST /api/v1/auth/login → receives { accessToken, refreshToken, user }
5. accessToken stored in memory (NOT localStorage — security best practice)
6. refreshToken stored in httpOnly cookie (server sets it)
7. user object stored in useAuthStore (persisted to localStorage)
8. Redirect to /dashboard (customer) or /admin/overview (admin)
```

## Registration Flow
```
1. User navigates to /auth/signup
2. Fills Name + Email + Password + Confirm Password
3. Validates: password ≥ 6 chars, passwords match, email format valid
4. [Production] POST /api/v1/auth/register
5. Backend creates user with role='CUSTOMER', loyalty_points=0
6. Backend fires CustomerRegisteredEvent → welcome email
7. Auto-login with returned tokens
```

## RBAC Summary
| Role | Guard | Access |
|---|---|---|
| Any | None | All public storefront routes |
| CUSTOMER | `requireAuth` | /dashboard, /cart checkout, wishlist sync |
| ADMIN | `requireAdmin` | All /admin/* routes |
| MERCHANDISER | `requireRole('ADMIN', 'MERCHANDISER')` | Products and Inventory |
| SUPPORT | `requireRole('ADMIN', 'SUPPORT_AGENT')` | Support module |
| FINANCE | `requireRole('ADMIN', 'FINANCE')` | Financials module |
| SUPER_ADMIN | `requireRole('SUPER_ADMIN')` | Settings, RBAC, API Keys |

---

# 12 — WORKFLOW DOCUMENTATION
*Document 12 of 18*

## Workflow 1: Customer Purchase Journey
```
[Visit Homepage] → Browse hero/promos
    ↓
[Browse Products] → Filter by category/price → ProductCard
    ↓
[Product Detail Page] → Select Size + Color + Qty → "Add to Cart"
    ↓
[Cart Drawer Opens] → See items + price → "View Cart" or continue shopping
    ↓
[/cart page] → Review items, apply promo code
    ↓
[Checkout Form] → Fill shipping + payment details
    ↓
[Place Order] → POST /api/v1/orders (inventory check + payment)
    ↓
[Order Confirmation] → Email sent → Order appears in /dashboard
```

## Workflow 2: Admin Order Fulfillment
```
[Admin receives order] → Appears in /admin/orders with status 'Processing'
    ↓
[Admin opens order detail] → Reviews line items, customer info, risk flag
    ↓
[Prints packing slip] → Physical picking and packing in warehouse
    ↓
[Updates status → 'Shipped'] → Enters tracking number + carrier
    ↓
[System fires OrderShippedEvent] → Customer receives SMS + email
    ↓
[Inventory permanently deducted] → quantity_reserved cleared
    ↓
[Order eventually marked 'Delivered'] → Loyalty points awarded to customer
```

## Workflow 3: Storefront CMS Update
```
[Marketing team wants to update homepage hero]
    ↓
[Navigate to /admin/storefront]
    ↓
[Select Hero Mood (e.g., "Summer Campaign")]
    ↓
[Click "Preview"] → See live preview of change
    ↓
[Click "Publish"] → Backend updates DB + invalidates Redis cache
    ↓
[All new customer visitors see new homepage within seconds]
```

## Workflow 4: Customer Support Ticket
```
[Customer emails about return] → Agent creates ticket in /admin/support
    ↓
[Ticket assigned priority: HIGH, SLA: 2 hours]
    ↓
[Agent views ticket → sees order history + customer profile]
    ↓
[Agent replies in thread → customer gets email notification]
    ↓
[Issue resolved] → Agent closes ticket → CSAT survey sent to customer
```
