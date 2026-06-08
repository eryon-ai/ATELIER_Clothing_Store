# Spring Boot Backend Blueprint — Part 2
## Module-by-Module Implementation Guide, APIs & Service Flows

---

## MODULE 1: AUTHENTICATION MODULE

### What to Build
A system that lets users sign up, log in, and receive a secure token they can use to access protected parts of the app.

### Why it Exists
Without authentication, anyone could access the admin panel or other users' orders. Authentication is the front door lock of the entire application.

### How JWT Works (For Junior Developers)
JWT (JSON Web Token) is like a signed hotel key card:
1. You check in (login) and the hotel gives you a key card (JWT token).
2. Every time you open a door (API call), you swipe your key card (send the token in the header).
3. The door (Spring Security) reads the chip (validates the signature) and decides if you can enter.
4. After checkout time (token expiry), the card stops working and you need to get a new one.

### APIs Required

| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | /api/v1/auth/register | Create new customer account | No |
| POST | /api/v1/auth/login | Login and receive JWT | No |
| POST | /api/v1/auth/refresh | Get a new JWT using refresh token | No |
| POST | /api/v1/auth/logout | Invalidate refresh token | Yes |
| POST | /api/v1/auth/forgot-password | Send password reset email | No |

### Step-by-Step: Login Flow
```
1. POST /api/v1/auth/login { email, password }
2. AuthController receives request
3. AuthService called → find user by email in DB
4. If user not found → throw 404 NOT FOUND
5. If user is banned → throw 403 FORBIDDEN
6. BCrypt compare password vs password_hash → if no match → throw 401 UNAUTHORIZED
7. Generate JWT access token (expires in 15 minutes)
8. Generate Refresh Token (expires in 7 days, saved in DB)
9. Return { accessToken, refreshToken, user details }
```

---

## MODULE 2: PRODUCTS (PIM — Product Information Management)

### What to Build
A complete product management system where admins can create, edit, publish, and delete products with support for multiple sizes and images.

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/products | List products (public, with filters) | No |
| GET | /api/v1/products/:slug | Single product detail | No |
| POST | /api/v1/admin/products | Create product | ADMIN/MERCHANDISER |
| PUT | /api/v1/admin/products/:id | Update product | ADMIN/MERCHANDISER |
| PATCH | /api/v1/admin/products/:id/publish | Publish/unpublish | ADMIN |
| DELETE | /api/v1/admin/products/:id | Soft delete | ADMIN |
| POST | /api/v1/admin/products/:id/images | Upload images | ADMIN/MERCHANDISER |

### Business Rules
1. SKU must be globally unique across all products.
2. Deleting a product is a SOFT DELETE (set is_deleted = true). NEVER hard delete because historical orders reference it.
3. A product must have at least one image before it can be published.
4. Price cannot be negative.

### Service Flow: Create Product
```
1. POST /api/v1/admin/products called with product data
2. Check JWT → is user ADMIN or MERCHANDISER?
3. Validate SKU is unique (query DB)
4. Validate required fields (name, price, category)
5. Save product with is_published = false (starts as Draft)
6. Write AuditLog entry (who created it, when)
7. Return 201 CREATED with product data
```

---

## MODULE 3: ORDERS (OMS — Order Management System)

### What to Build
The most critical module. Handles the entire lifecycle of a customer's purchase from checkout through delivery.

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | /api/v1/orders | Place a new order (checkout) | CUSTOMER |
| GET | /api/v1/orders/my | Customer's own order history | CUSTOMER |
| GET | /api/v1/admin/orders | All orders (paginated, filterable) | ADMIN |
| GET | /api/v1/admin/orders/:id | Single order detail | ADMIN |
| PATCH | /api/v1/admin/orders/:id/status | Update order status | ADMIN |
| POST | /api/v1/admin/orders/:id/refund | Issue refund | ADMIN |

### Business Rules (CRITICAL)
1. **Stock must be available** before an order is created.
2. **Order status can only move forward:** PROCESSING → SHIPPED → DELIVERED. Cannot go backwards.
3. **Cannot cancel a SHIPPED or DELIVERED order.** Only PROCESSING orders can be cancelled.
4. `price_at_purchase` in `order_items` must be recorded at the TIME of purchase, not the current price.

### Service Flow: Place Order (Most Complex Flow in the App)
```
1. POST /api/v1/orders called with { items: [{productId, quantity, size}], promoCode }
2. AuthMiddleware validates JWT → get user ID
3. OrderService.createOrder() called
    a. START DATABASE TRANSACTION (@Transactional)
    b. For each item in the cart:
        - Query Inventory: Is quantity_available >= requested quantity?
        - If NO → throw 400 INSUFFICIENT_STOCK, ROLLBACK
        - Lock the inventory row (SELECT FOR UPDATE) to prevent race conditions
        - Deduct from quantity_available, add to quantity_reserved
    c. Validate promo code (if provided): Is it active? Not expired? Under max uses?
    d. Calculate totals: subtotal, discount, tax, shipping
    e. Create Order record in orders table
    f. Create OrderItem records in order_items table
    g. Increment promo code current_uses (if used)
    h. COMMIT TRANSACTION
4. Publish OrderPlacedEvent (triggers email and loyalty points award)
5. Return 201 CREATED with full order summary
```

> [!CAUTION]
> The SELECT FOR UPDATE lock in step 3b is CRITICAL. Without it, two customers could both buy the last item in stock simultaneously. The lock forces them to wait in line.

---

## MODULE 4: CUSTOMERS (CRM)

### What to Build
A 360-degree view of every customer, including their spending history, segment, risk flags, and support notes.

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/admin/customers | Paginated customer list with filters | ADMIN |
| GET | /api/v1/admin/customers/:id | Full customer profile | ADMIN |
| POST | /api/v1/admin/customers/:id/notes | Add admin note | ADMIN |
| PATCH | /api/v1/admin/customers/:id/ban | Ban/unban customer | ADMIN |
| GET | /api/v1/admin/customers/:id/orders | Customer's order history | ADMIN |

### Business Rules
1. Email must be unique system-wide.
2. Banning a customer must immediately invalidate their active sessions (Redis blacklist).
3. Loyalty points cannot go negative.

---

## MODULE 5: INVENTORY & SUPPLY CHAIN (WMS)

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/admin/inventory | Stock levels across warehouses | ADMIN/MERCHANDISER |
| PATCH | /api/v1/admin/inventory/adjust | Manual stock adjustment | ADMIN |
| POST | /api/v1/admin/inventory/transfer | Move stock between warehouses | ADMIN |
| GET | /api/v1/admin/warehouses | List all warehouses | ADMIN |
| GET | /api/v1/admin/suppliers | List all suppliers | ADMIN |
| GET | /api/v1/admin/purchase-orders | List purchase orders | ADMIN |
| PATCH | /api/v1/admin/purchase-orders/:id/receive | Mark PO as received (adds stock) | ADMIN |

### Service Flow: Receive Purchase Order
```
1. PATCH /api/v1/admin/purchase-orders/:id/receive
2. Find PurchaseOrder in DB
3. Validate status is 'IN_TRANSIT' (not already received)
4. START TRANSACTION
5. For each item in the PO → add to inventory.quantity_available
6. Update PO status to 'RECEIVED'
7. Write InventoryLog entry
8. Trigger LOW_STOCK check (if any product is still below threshold)
9. COMMIT TRANSACTION
```

---

## MODULE 6: SUPPORT & TICKETING

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | /api/v1/support/tickets | Customer creates new ticket | CUSTOMER |
| GET | /api/v1/support/tickets/my | Customer's own tickets | CUSTOMER |
| GET | /api/v1/admin/support/tickets | All tickets (filterable by status/priority) | ADMIN/SUPPORT |
| POST | /api/v1/admin/support/tickets/:id/reply | Agent sends reply | ADMIN/SUPPORT |
| PATCH | /api/v1/admin/support/tickets/:id/assign | Assign to agent | ADMIN |
| PATCH | /api/v1/admin/support/tickets/:id/close | Close ticket | ADMIN/SUPPORT |

### Business Rules
1. HIGH priority tickets must receive a response within 2 hours (SLA deadline set on creation).
2. A CLOSED ticket cannot be re-opened (create a new ticket instead).
3. An agent can only be assigned tickets, not create them.

---

## MODULE 7: STOREFRONT CMS

### What to Build
When the admin changes the homepage layout (hero image, promo cards, section order), those changes must be saved and then published to the public website.

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/storefront/config | Get published homepage config | No (Public) |
| GET | /api/v1/admin/storefront/config | Get draft config | ADMIN |
| PUT | /api/v1/admin/storefront/config | Update draft config | ADMIN |
| POST | /api/v1/admin/storefront/config/publish | Publish the current draft | ADMIN |

### Service Flow: Publish CMS Changes
```
1. POST /api/v1/admin/storefront/config/publish
2. Read current draft from storefront_config table
3. Write to Redis cache (key: 'storefront:config', TTL: 1 hour)
4. Update published_at timestamp in DB
5. Return 200 OK
---
Now when a customer's browser requests the homepage:
GET /api/v1/storefront/config
1. Check Redis cache first
2. If cache hit → return instantly (sub-5ms response time!)
3. If cache miss → read from DB → populate Redis → return
```

---

## MODULE 8: MARKETING & CAMPAIGNS

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/admin/campaigns | List all promo codes | ADMIN |
| POST | /api/v1/admin/campaigns | Create new promo code | ADMIN |
| PATCH | /api/v1/admin/campaigns/:id | Activate/deactivate | ADMIN |
| POST | /api/v1/checkout/validate-promo | Validate a promo code | CUSTOMER |
| GET | /api/v1/admin/influencers | List influencers | ADMIN |
| POST | /api/v1/admin/influencers | Add influencer | ADMIN |

### Business Rule: Promo Code Validation
```
1. Find promo code by code string (case-insensitive)
2. Check: is_active = TRUE
3. Check: expires_at > NOW() (not expired)
4. Check: current_uses < max_uses (not exhausted)
5. Check: order total >= min_order_value
6. If all pass → return discount amount
7. If any fail → return specific error message
```

---

## MODULE 9: FINANCIALS

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/admin/financials/overview | Gross revenue, net, COGS | ADMIN/FINANCE |
| GET | /api/v1/admin/financials/expenses | List expenses | ADMIN/FINANCE |
| POST | /api/v1/admin/financials/expenses | Add expense | ADMIN/FINANCE |
| GET | /api/v1/admin/financials/invoices | B2B wholesale invoices | ADMIN/FINANCE |
| GET | /api/v1/admin/financials/tax-reports | Tax liability by region | ADMIN/FINANCE |
| GET | /api/v1/admin/financials/cash-flow | Monthly cash flow chart | ADMIN/FINANCE |

### Analytics Calculation Logic
- **Gross Revenue** = SUM(orders.total_amount) WHERE status IN ('DELIVERED', 'SHIPPED')
- **Net Revenue** = Gross Revenue − Refunds − Shipping Costs
- **COGS** = SUM(order_items.quantity * products.cost_price)
- **Conversion Rate** = (Total Orders / Total Unique Sessions) × 100

---

## MODULE 10: ADMIN SETTINGS & RBAC

### APIs Required

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | /api/v1/admin/settings | Get global settings | ADMIN |
| PUT | /api/v1/admin/settings | Update global settings | SUPER_ADMIN |
| GET | /api/v1/admin/roles | List all roles | SUPER_ADMIN |
| POST | /api/v1/admin/roles | Create new role | SUPER_ADMIN |
| GET | /api/v1/admin/api-keys | List API keys | SUPER_ADMIN |
| POST | /api/v1/admin/api-keys | Generate new API key | SUPER_ADMIN |
| GET | /api/v1/admin/audit-logs | View audit trail | SUPER_ADMIN/ADMIN |
