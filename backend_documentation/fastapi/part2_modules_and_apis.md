# FastAPI Backend Blueprint — Part 2
## Module-by-Module Implementation Guide, Pydantic Schemas & All APIs

---

## THE FASTAPI PATTERN (Understand This First)

Every feature in FastAPI follows the exact same 4-step pattern:

**Step 1 — Pydantic Schema** (what the API accepts and returns)
**Step 2 — SQLAlchemy Model** (what the database table looks like)
**Step 3 — CRUD Function** (the actual database query)
**Step 4 — Endpoint** (the HTTP route that connects everything)

Think of it like a conveyor belt: Request → Schema Validates → CRUD Queries DB → Schema Formats → Response.

---

## MODULE 1: AUTHENTICATION

### What to Build
Register, Login, Logout, Refresh Token, Forgot Password.

### Pydantic Schemas
```
UserRegister:  { email: str, password: str, full_name: str }
UserLogin:     { email: str, password: str }
TokenResponse: { access_token: str, refresh_token: str, token_type: "bearer" }
```

### All APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | Public | Create new customer account |
| POST | /api/v1/auth/login | Public | Returns JWT access + refresh tokens |
| POST | /api/v1/auth/refresh | Public (refresh token) | Exchanges refresh token for new access token |
| POST | /api/v1/auth/logout | Required | Blacklists the refresh token |
| POST | /api/v1/auth/forgot-password | Public | Sends password reset email |

### Login Service Flow (Step-by-Step)
```
1. POST /api/v1/auth/login receives { email, password }
2. Pydantic auto-validates: is email a valid format? is password provided?
3. crud_user.get_by_email(db, email) → queries DB
4. If user not found → raise HTTPException(status_code=404, detail="User not found")
5. If user.is_banned → raise HTTPException(status_code=403, detail="Account suspended")
6. passlib.verify(password, user.password_hash) → if False → raise 401
7. security.create_access_token({"sub": str(user.id), "role": user.role}) → 15min JWT
8. security.create_refresh_token() → stored in DB, 7-day expiry
9. return TokenResponse(access_token=..., refresh_token=...)
```

### Dependency Injection — The FastAPI Way
FastAPI uses Depends() to inject reusable logic into any endpoint. This is how authentication works:

```
# In dependencies.py
async def get_current_user(
    token: str = Depends(oauth2_scheme),   # Extracts Bearer token
    db: AsyncSession = Depends(get_db)     # Injects DB session
) -> User:
    payload = security.decode_token(token)  # Decode JWT
    user = await crud_user.get(db, payload["sub"])
    if not user or user.is_banned:
        raise HTTPException(401)
    return user

async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(403, "Insufficient permissions")
    return current_user
```

Then in any endpoint, simply add `current_user = Depends(verify_admin)` to protect it.

---

## MODULE 2: PRODUCTS (PIM)

### All APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/v1/products | Public | Paginated product list with filters |
| GET | /api/v1/products/{slug} | Public | Single product detail |
| POST | /api/v1/admin/products | ADMIN/MERCH | Create product (starts as draft) |
| PUT | /api/v1/admin/products/{id} | ADMIN/MERCH | Update product fields |
| PATCH | /api/v1/admin/products/{id}/publish | ADMIN | Toggle published status |
| DELETE | /api/v1/admin/products/{id} | ADMIN | Soft delete (is_deleted=True) |
| POST | /api/v1/admin/products/{id}/images | ADMIN/MERCH | Upload images to Cloudinary |

### Business Rules
- SKU must be globally unique. Validate before inserting.
- Price must be > 0.
- A product must have at least 1 image to be published.
- NEVER hard delete. Set `is_deleted = True`.

### Public Product List Query (with filters and pagination)
```
GET /api/v1/products?category=Women&min_price=100&max_price=500&in_stock=true&page=1&limit=20

Query logic:
- WHERE is_published = TRUE AND is_deleted = FALSE
- AND category = 'Women' (if provided)
- AND base_price BETWEEN 100 AND 500 (if provided)
- AND EXISTS (SELECT 1 FROM inventory WHERE product_id = products.id AND quantity_available > 0)
- ORDER BY created_at DESC
- LIMIT 20 OFFSET (page-1) * 20
```

---

## MODULE 3: ORDERS (OMS)

### All APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/v1/orders | CUSTOMER | Place a new order (checkout) |
| GET | /api/v1/orders/my | CUSTOMER | Customer's own orders |
| GET | /api/v1/admin/orders | ADMIN | All orders with filters |
| GET | /api/v1/admin/orders/{id} | ADMIN | Order detail with timeline |
| PATCH | /api/v1/admin/orders/{id}/status | ADMIN | Update order status |
| POST | /api/v1/admin/orders/{id}/refund | ADMIN | Issue refund |

### Critical Service Flow — Place Order
```
async def create_order(db, user_id, order_data):
    async with db.begin():                    # START TRANSACTION
        for item in order_data.items:
            # Lock the inventory row
            inventory = await db.execute(
                select(Inventory)
                .where(Inventory.product_id == item.product_id)
                .with_for_update()            # LOCKS THE ROW — prevents race conditions
            )
            if inventory.quantity_available < item.quantity:
                raise HTTPException(400, f"Insufficient stock for {item.product_id}")
            
            inventory.quantity_available -= item.quantity
            inventory.quantity_reserved += item.quantity
        
        order = Order(user_id=user_id, status="PROCESSING", ...)
        db.add(order)
        # Transaction auto-commits if no exception, auto-rollbacks if exception
    
    # After transaction commits, fire background tasks
    background_tasks.add_task(send_order_confirmation_email, order.id)
    background_tasks.add_task(award_loyalty_points, user_id, order.total)
    return order
```

### State Machine — Valid Order Status Transitions
```
PROCESSING → SHIPPED (requires tracking_number)
PROCESSING → CANCELLED (allowed)
SHIPPED → DELIVERED (allowed)
SHIPPED → CANCELLED → NOT ALLOWED → raise 400 error
DELIVERED → any → NOT ALLOWED → raise 400 error
```

---

## MODULE 4: CUSTOMERS (CRM)

### All APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/v1/admin/customers | ADMIN | Paginated list with segment filters |
| GET | /api/v1/admin/customers/{id} | ADMIN | Full customer 360 profile |
| POST | /api/v1/admin/customers/{id}/notes | ADMIN | Add admin note |
| PATCH | /api/v1/admin/customers/{id}/ban | ADMIN | Ban or unban |
| GET | /api/v1/admin/customers/{id}/orders | ADMIN | Customer order history |

### Customer 360 Profile Response Shape
```
{
  "id": "uuid",
  "full_name": "Alex Chen",
  "email": "...",
  "segment": "VIP",
  "loyalty_points": 4800,
  "retention_score": 92,
  "total_orders": 18,
  "lifetime_value": 12400.00,
  "risk_flag": "LOW",
  "tags": ["VIP", "High AOV"],
  "timeline": [...],
  "notes": [...]
}
```

Lifetime Value is calculated: `SELECT SUM(total_amount) FROM orders WHERE user_id = :id AND status = 'DELIVERED'`

---

## MODULE 5: INVENTORY (WMS)

### All APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/v1/admin/inventory | ADMIN/MERCH | Stock levels per warehouse |
| POST | /api/v1/admin/inventory/adjust | ADMIN | Manual stock adjustment |
| POST | /api/v1/admin/inventory/transfer | ADMIN | Transfer between warehouses |
| GET | /api/v1/admin/warehouses | ADMIN | List warehouses |
| GET | /api/v1/admin/purchase-orders | ADMIN | List POs |
| PATCH | /api/v1/admin/purchase-orders/{id}/receive | ADMIN | Receive PO → adds stock |

---

## MODULE 6: STOREFRONT CMS

### All APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/v1/storefront/config | Public | Get published CMS config |
| GET | /api/v1/admin/storefront/config | ADMIN | Get draft config |
| PUT | /api/v1/admin/storefront/config | ADMIN | Update draft |
| POST | /api/v1/admin/storefront/config/publish | ADMIN | Publish → writes to Redis |

### Redis Caching Flow for Storefront
```
GET /api/v1/storefront/config:
  1. Check Redis: await redis.get("storefront:config")
  2. If exists → return immediately (JSON.loads) — lightning fast
  3. If not → query DB → await redis.setex("storefront:config", 3600, JSON.dumps(config))
  4. Return config

POST /api/v1/admin/storefront/config/publish:
  1. Update DB record
  2. await redis.delete("storefront:config")  ← invalidate cache
  3. Next public request will reload from DB and re-cache
```

---

## MODULE 7: MARKETING, SUPPORT, FINANCIALS, SETTINGS

### Marketing APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/v1/admin/campaigns | ADMIN | List promo codes |
| POST | /api/v1/admin/campaigns | ADMIN | Create promo code |
| POST | /api/v1/checkout/validate-promo | CUSTOMER | Validate code at checkout |

### Support APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/v1/support/tickets | CUSTOMER | Create ticket |
| GET | /api/v1/admin/support/tickets | ADMIN/SUPPORT | All tickets |
| POST | /api/v1/admin/support/tickets/{id}/reply | ADMIN/SUPPORT | Reply to ticket |
| PATCH | /api/v1/admin/support/tickets/{id}/close | ADMIN/SUPPORT | Close ticket |

### Financials APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/v1/admin/financials/overview | ADMIN/FINANCE | Revenue KPIs |
| GET | /api/v1/admin/financials/expenses | ADMIN/FINANCE | List expenses |
| GET | /api/v1/admin/financials/invoices | ADMIN/FINANCE | B2B invoices |
| GET | /api/v1/admin/financials/tax-reports | ADMIN/FINANCE | Tax by region |
