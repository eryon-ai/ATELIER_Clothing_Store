# Spring Boot Backend Blueprint — Part 1
## Business Analysis, Architecture Overview & Database Design

> [!IMPORTANT]
> **Who is this for?**
> This document is written so that even a Junior Spring Boot developer with 1 year of experience can understand WHAT to build, WHY it exists, and HOW it works. Think of this as a map before you start building a city.

---

## PART 1: BUSINESS ANALYSIS — What Does ATELIER Actually Do?

Imagine you are joining a company that runs a luxury fashion brand online. They have a website where customers buy clothes. They also have a private admin panel where their staff manages everything — products, orders, customers, warehouse stock, finances, and marketing campaigns.

**The current problem:** The frontend (React app) exists and works perfectly as a demo with fake data. But there is NO real backend. When a customer clicks "Add to Cart" or the admin clicks "Ship Order", nothing actually happens permanently. We need to build the engine that makes everything real.

### The Two Applications We Are Supporting

**1. The Customer Website (B2C Storefront)**
What it does: Regular customers visit this to browse and buy luxury clothes.
- Browse and search products.
- Filter by category (Men/Women/Accessories).
- View product details and select sizes.
- Add items to cart and apply promo codes.
- Complete checkout with payment.
- Track their orders.
- Manage their wishlist.

**2. The Admin ERP Panel (Internal Tool)**
What it does: ATELIER's internal team uses this daily to run the business.
- **Admins** manage everything.
- **Merchandisers** create and update products.
- **Support Agents** handle customer complaints.
- **Finance Officers** review revenue and approve invoices.

---

## PART 2: WHY SPRING BOOT?

Think of Spring Boot as the most powerful and well-tested framework for building Java backends. Here is why it is the right choice:

1. **It handles everything out-of-the-box:** Security, database connections, API routing, and more are built in. A junior developer does not need to wire up 20 separate libraries.
2. **Rock-solid transactions:** When a customer places an order, we need the payment AND the stock reduction to happen together. If one fails, BOTH must be rolled back. Spring's @Transactional annotation makes this a single line of code.
3. **Enterprise ready from day 1:** Spring Security handles JWT tokens and role-based access with minimal configuration.
4. **Massive community:** If you get stuck, thousands of answers exist on Stack Overflow.

---

## PART 3: THE ARCHITECTURE — How the Pieces Fit Together

Think of Spring Boot's architecture like a restaurant:
- The **Controller** is the waiter. Takes the customer's order (HTTP Request) and brings back the food (HTTP Response).
- The **Service** is the chef. Does all the complex cooking (business logic).
- The **Repository** is the pantry manager. Knows exactly where everything in the database is stored.
- The **Entity** is the recipe card. Describes what a "product" or "order" looks like.
- The **DTO** is the menu. Shows the customer only what they need to see (not raw database rows).

```
HTTP Request
    ↓
Controller Layer     (receives request, validates basic input)
    ↓
Service Layer        (runs business logic, makes decisions)
    ↓
Repository Layer     (talks to the database using JPA/Hibernate)
    ↓
PostgreSQL Database  (where all data permanently lives)
    ↑
Repository Layer     (returns data)
    ↑
Service Layer        (formats and transforms data)
    ↑
Controller Layer     (sends JSON response back)
    ↓
HTTP Response
```

---

## PART 4: COMPLETE DATABASE DESIGN

This is every table we need and WHY it exists.

### `users` — Everyone who has an account
Why it exists: Both customers buying products and admins managing the system are users. They share this table but have different roles.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary Key |
| email | VARCHAR(255) | UNIQUE, NOT NULL — Login identifier |
| password_hash | VARCHAR(255) | NOT NULL — NEVER store plain passwords |
| full_name | VARCHAR(255) | |
| phone | VARCHAR(20) | |
| role | ENUM | CUSTOMER, ADMIN, SUPPORT_AGENT, MERCHANDISER, FINANCE |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_banned | BOOLEAN | DEFAULT FALSE — Admin can ban bad actors |
| loyalty_points | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | DEFAULT NOW() |

Index on: `email` (for fast login lookups).

---

### `products` — Everything sold on the store
Why it exists: Every item for sale needs a permanent, authoritative record.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary Key |
| sku | VARCHAR(100) | UNIQUE — Must be unique per product |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| base_price | DECIMAL(10,2) | NOT NULL |
| category | VARCHAR(100) | 'Men', 'Women', 'Accessories' |
| variants | JSONB | e.g., {"S": 10, "M": 5, "L": 0} |
| images | TEXT[] | Array of Cloudinary URLs |
| is_published | BOOLEAN | DEFAULT FALSE — Draft vs Live |
| is_deleted | BOOLEAN | DEFAULT FALSE — Soft delete |
| created_by | UUID | FK → users.id |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

### `orders` — Every purchase transaction
Why it exists: An order is the central business event. Revenue, inventory, and customer loyalty all depend on it.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary Key |
| order_number | VARCHAR(20) | UNIQUE — e.g., 'ATL-10482' |
| user_id | UUID | FK → users.id |
| total_amount | DECIMAL(10,2) | |
| discount_amount | DECIMAL(10,2) | DEFAULT 0 |
| status | ENUM | PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| risk_flag | ENUM | LOW, MEDIUM, HIGH |
| tracking_number | VARCHAR(100) | |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

### `order_items` — The individual products inside each order
Why it exists: One order can contain multiple products. This is the join table that links them.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary Key |
| order_id | UUID | FK → orders.id, ON DELETE CASCADE |
| product_id | UUID | FK → products.id |
| quantity | INTEGER | NOT NULL |
| price_at_purchase | DECIMAL(10,2) | Price WHEN bought — price can change later! |
| size | VARCHAR(10) | |

---

### `inventory` — Stock levels per warehouse
Why it exists: ATELIER has multiple warehouses. We need to track how much of each product is available at each location.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary Key |
| product_id | UUID | FK → products.id |
| warehouse_id | UUID | FK → warehouses.id |
| quantity_available | INTEGER | DEFAULT 0, CHECK >= 0 — CANNOT GO NEGATIVE |
| quantity_reserved | INTEGER | DEFAULT 0 — Reserved but not yet shipped |

> [!CAUTION]
> The CHECK (quantity_available >= 0) constraint at the database level is the LAST line of defense against overselling. The Service layer checks it first, but the DB constraint is the safety net.

---

### `warehouses`, `support_tickets`, `ticket_messages`, `discount_campaigns`, `storefront_config`, `audit_logs`

See Part 2 document for complete schemas of these supporting tables.

---

## PART 5: ENTITY RELATIONSHIPS EXPLAINED SIMPLY

Think of relationships like family trees:

- **users → orders:** One user can have MANY orders. (One-to-Many)
- **orders → order_items:** One order contains MANY items. (One-to-Many)
- **products → order_items:** One product can appear in MANY orders. (Many-to-Many, resolved by order_items)
- **products → inventory:** One product has stock in MANY warehouses. (One-to-Many)
- **users → support_tickets:** One user can open MANY tickets. (One-to-Many)
- **support_tickets → ticket_messages:** One ticket has MANY messages. (One-to-Many)
