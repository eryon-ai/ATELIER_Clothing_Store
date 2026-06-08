# FastAPI Backend Blueprint — Part 1
## Business Analysis, Why FastAPI, Project Setup & Database Design

> [!IMPORTANT]
> **Who is this for?**
> This document is written so that even a Junior Python/FastAPI developer can understand WHAT to build, WHY it exists, and HOW to set it up from scratch. No experience with Python web frameworks is assumed beyond basics.

---

## PART 1: WHY FASTAPI FOR ATELIER?

### What is FastAPI?
FastAPI is a modern Python web framework for building APIs. It is extremely fast to write (because Python is concise), generates automatic interactive API documentation (Swagger UI), and handles async operations natively — meaning it can serve thousands of simultaneous requests efficiently.

### Why FastAPI is the Right Choice for ATELIER
1. **Automatic Docs:** FastAPI reads your code and generates a Swagger UI at `/docs` automatically. Any developer can open the browser and test every API endpoint without writing a single line of documentation.
2. **Pydantic Validation:** Every request body is automatically validated using Python type hints. If someone sends `{ "price": "hello" }` when a number is expected, FastAPI rejects it with a clear error before your code even runs.
3. **Async-First:** FastAPI is built on Python's `async/await` system, making it ideal for I/O-heavy operations like database queries, image uploads, and sending emails simultaneously.
4. **AI/ML Ready:** If ATELIER ever wants to add personalized product recommendations (using scikit-learn or TensorFlow), Python is the natural language for it. The backend is already in Python.

### How FastAPI Compares to Spring Boot
Think of Spring Boot as a heavy, fully-equipped factory truck. FastAPI is a fast, agile sports car. For ATELIER's scale, FastAPI is more than capable and builds 3x faster.

---

## PART 2: ARCHITECTURE OVERVIEW

### The Request Lifecycle in FastAPI

```
HTTP Request from Browser/App
         ↓
Uvicorn (ASGI Server — like Nginx for Python apps)
         ↓
FastAPI App (main.py — routes are registered here)
         ↓
Middleware Layer (CORS, Authentication check)
         ↓
Router (e.g., products.py, orders.py — like controllers)
         ↓
Dependency Injection (get_db, get_current_user — verify auth)
         ↓
CRUD Layer (database query functions)
         ↓
SQLAlchemy Async Engine
         ↓
PostgreSQL Database
         ↑
SQLAlchemy returns ORM model
         ↑
Pydantic Schema converts to clean JSON
         ↑
HTTP Response returned
```

### Layered Architecture (Like Spring Boot but Python)

| Spring Boot Layer | FastAPI Equivalent | Purpose |
|---|---|---|
| Controller | Router (APIRouter) | Defines routes and HTTP methods |
| Service | CRUD functions | Business logic and DB queries |
| Repository | SQLAlchemy Session | Database communication |
| Entity | SQLAlchemy Model | Database table representation |
| DTO (Request) | Pydantic Schema (Create) | Validates incoming request data |
| DTO (Response) | Pydantic Schema (Response) | Shapes outgoing response data |

---

## PART 3: COMPLETE PROJECT SETUP

### Folder Structure (Every File Explained)
```
atelier-fastapi/
│
├── alembic/                        # Database migration tool
│   ├── versions/                   # Each migration is a Python file
│   └── env.py                      # Alembic config
├── alembic.ini                     # Alembic settings file
│
├── app/
│   ├── main.py                     # App entry point — registers all routers
│   │
│   ├── core/                       # Shared infrastructure
│   │   ├── config.py               # All environment variables (DATABASE_URL, JWT_SECRET)
│   │   ├── database.py             # SQLAlchemy async engine and session factory
│   │   ├── security.py             # JWT encode/decode, password hashing
│   │   └── redis_client.py         # Redis connection
│   │
│   ├── api/
│   │   ├── dependencies.py         # get_db(), get_current_user(), verify_admin()
│   │   └── v1/
│   │       ├── api_router.py       # Combines all endpoint routers
│   │       └── endpoints/
│   │           ├── auth.py         # /api/v1/auth/*
│   │           ├── products.py     # /api/v1/products/*
│   │           ├── orders.py       # /api/v1/orders/*
│   │           ├── customers.py    # /api/v1/admin/customers/*
│   │           ├── inventory.py    # /api/v1/admin/inventory/*
│   │           ├── support.py      # /api/v1/support/*
│   │           ├── marketing.py    # /api/v1/admin/marketing/*
│   │           ├── financials.py   # /api/v1/admin/financials/*
│   │           ├── storefront.py   # /api/v1/storefront/*
│   │           └── settings.py     # /api/v1/admin/settings/*
│   │
│   ├── models/                     # SQLAlchemy database table definitions
│   │   ├── base.py                 # Base class with id, created_at, updated_at
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── inventory.py
│   │   ├── support.py
│   │   └── storefront.py
│   │
│   ├── schemas/                    # Pydantic models (request/response shapes)
│   │   ├── user.py                 # UserCreate, UserResponse, UserLogin
│   │   ├── product.py              # ProductCreate, ProductUpdate, ProductResponse
│   │   ├── order.py                # OrderCreate, OrderResponse, OrderStatusUpdate
│   │   └── ...
│   │
│   └── crud/                       # Database query functions (the business logic)
│       ├── crud_user.py
│       ├── crud_product.py
│       ├── crud_order.py
│       └── ...
│
├── requirements.txt                # All Python dependencies
├── .env                            # Environment variables (never commit to Git!)
├── Dockerfile
└── docker-compose.yml              # Runs app + PostgreSQL + Redis together
```

---

## PART 4: DEPENDENCIES (requirements.txt)

```
# Core Web Framework
fastapi==0.110.0
uvicorn[standard]==0.27.0       # The ASGI server that runs FastAPI

# Database
sqlalchemy==2.0.27              # Modern Python ORM for PostgreSQL
asyncpg==0.29.0                 # Async PostgreSQL driver (required by SQLAlchemy async)
alembic==1.13.1                 # Database migrations tool

# Validation & Configuration
pydantic[email]==2.6.0          # Input/output validation (built into FastAPI)
pydantic-settings==2.2.1        # Validates .env variables on startup
python-dotenv==1.0.1

# Security
python-jose[cryptography]==3.3.0  # JWT token generation and verification
passlib[bcrypt]==1.7.4            # Secure password hashing

# File Uploads
python-multipart==0.0.9         # Required for file upload endpoints
cloudinary==1.39.0              # Cloudinary image upload SDK

# Caching
redis[asyncio]==5.0.1           # Redis caching for storefront CMS

# Email
fastapi-mail==1.4.1             # Simple email sending with Gmail/SendGrid

# Background Tasks
celery==5.3.6                   # Background job queue (for emails, reports)
```

---

## PART 5: DATABASE DESIGN

The database is identical to the Spring Boot version because the database is independent of the backend framework. We use **PostgreSQL** with **SQLAlchemy** as the ORM.

### `users` Table
Why it exists: Stores every person who interacts with the system — customers and internal staff.

| Field | Python Type | DB Type | Notes |
|---|---|---|---|
| id | UUID | UUID PK | Auto-generated |
| email | str | VARCHAR(255) | UNIQUE, indexed |
| password_hash | str | TEXT | Never store plaintext |
| full_name | str | VARCHAR(255) | |
| role | Enum | VARCHAR(50) | CUSTOMER, ADMIN, SUPPORT_AGENT, MERCHANDISER, FINANCE |
| is_banned | bool | BOOLEAN | Default False |
| loyalty_points | int | INTEGER | Default 0 |
| created_at | datetime | TIMESTAMPTZ | Default now() |

### `products` Table
Why it exists: Every item for sale. Soft-deleted to preserve order history.

| Field | Python Type | DB Type | Notes |
|---|---|---|---|
| id | UUID | UUID PK | |
| sku | str | VARCHAR(100) | UNIQUE |
| name | str | VARCHAR(255) | NOT NULL |
| base_price | float | DECIMAL(10,2) | |
| category | str | VARCHAR(100) | 'Men', 'Women' |
| variants | dict | JSONB | `{"S": 10, "M": 5}` |
| images | list | TEXT[] | Cloudinary URLs |
| is_published | bool | BOOLEAN | Default False |
| is_deleted | bool | BOOLEAN | Soft delete |

### `orders` Table
Why it exists: Every purchase. The core financial record.

| Field | Python Type | DB Type | Notes |
|---|---|---|---|
| id | UUID | UUID PK | |
| order_number | str | VARCHAR(20) | UNIQUE — 'ATL-10482' |
| user_id | UUID | FK → users.id | |
| total_amount | float | DECIMAL(10,2) | |
| status | Enum | VARCHAR(20) | PROCESSING/SHIPPED/DELIVERED/CANCELLED |
| risk_flag | Enum | VARCHAR(10) | LOW/MEDIUM/HIGH |
| tracking_number | str | VARCHAR(100) | Set when shipped |

### `inventory` Table
Why it exists: Track stock per product per warehouse. Critical ACID table.

| Field | Python Type | DB Type | Constraint |
|---|---|---|---|
| id | UUID | UUID PK | |
| product_id | UUID | FK → products | |
| warehouse_id | UUID | FK → warehouses | |
| quantity_available | int | INTEGER | CHECK >= 0 |
| quantity_reserved | int | INTEGER | Default 0 |

### Other Tables
- `order_items` — Links products to orders with quantity and price-at-purchase
- `warehouses` — Physical locations
- `support_tickets` + `ticket_messages` — Customer service system
- `discount_campaigns` — Promo codes with validation rules
- `storefront_config` — Entire CMS homepage layout as JSONB
- `audit_logs` — Immutable record of every admin action
