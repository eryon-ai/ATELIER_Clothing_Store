# NestJS Backend Blueprint — Part 1
## Why NestJS, Architecture, Project Setup & Database Design

> [!IMPORTANT]
> **Who is this for?**
> This document is for developers who know TypeScript (or JavaScript) and want to build the ATELIER backend using NestJS. Since the frontend is already React/TypeScript, NestJS is the most natural choice — same language, shared types, shared team knowledge.

---

## PART 1: WHY NESTJS FOR ATELIER?

### What is NestJS?
NestJS is a TypeScript framework for building scalable Node.js server-side applications. It is strongly inspired by Angular's architecture (modules, decorators, dependency injection) but runs on the server. Think of it as the "Spring Boot of the JavaScript world."

### Why NestJS is Perfect for ATELIER
1. **Same Language as Frontend:** Your React team already writes TypeScript. The NestJS backend is also TypeScript. This means frontend and backend developers can read each other's code and even share type definitions.
2. **Angular-Like Structure:** NestJS forces a modular structure with decorators (`@Controller`, `@Service`, `@Module`). This means every developer on the team writes code the same way — no chaos.
3. **Everything Included:** Authentication (Passport.js), Validation (class-validator), ORM (TypeORM), Caching (cache-manager), WebSockets — all available as official NestJS packages.
4. **Enterprise Ready:** Companies like Adidas and Tripadvisor run NestJS in production at massive scale.

### NestJS vs Spring Boot vs FastAPI (Simple Comparison)
| Feature | NestJS | Spring Boot | FastAPI |
|---|---|---|---|
| Language | TypeScript | Java/Kotlin | Python |
| Learning curve (if you know JS) | Low | High | Medium |
| Performance | Very High | Highest | High |
| Auto API Docs | With Swagger plugin | With Springdoc | Built-in |
| Best for | Full-stack JS teams | Pure enterprise Java | Python/AI teams |

---

## PART 2: HOW NESTJS ARCHITECTURE WORKS

NestJS organizes code into **Modules**. Think of a Module as a self-contained mini-application for a feature.

### The 3 Core Concepts
1. **Module** (`@Module`) — Groups related controllers and services. Like a folder for a feature.
2. **Controller** (`@Controller`) — Handles HTTP requests. Maps URLs to functions.
3. **Service** (`@Injectable`) — Contains business logic. Called by controllers.

### Request Lifecycle in NestJS
```
HTTP Request
    ↓
Guards (authentication check — is the JWT valid?)
    ↓
Interceptors (logging, response transformation)
    ↓
Pipes (input validation and transformation)
    ↓
Controller (extracts data from request)
    ↓
Service (business logic)
    ↓
TypeORM Repository (database query)
    ↓
PostgreSQL
    ↑
TypeORM returns Entity
    ↑
Service transforms to DTO
    ↑
Controller returns response
    ↓
HTTP Response
```

---

## PART 3: COMPLETE PROJECT SETUP

### Initial Installation
```bash
npm install -g @nestjs/cli
nest new atelier-backend
cd atelier-backend
```

### Install All Dependencies
```bash
# Database & ORM
npm install @nestjs/typeorm typeorm pg

# Validation
npm install class-validator class-transformer

# Authentication
npm install @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/jwt
npm install bcryptjs
npm install -D @types/bcryptjs @types/passport-jwt

# Configuration
npm install @nestjs/config

# Caching (Redis)
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-yet

# File Uploads
npm install @nestjs/platform-express multer
npm install cloudinary

# API Documentation
npm install @nestjs/swagger swagger-ui-express

# WebSockets (for live chat)
npm install @nestjs/websockets @nestjs/platform-socket.io
```

### Full Folder Structure (Every File Explained)
```
atelier-backend/
├── src/
│   ├── main.ts                         # App entry point — starts the HTTP server
│   ├── app.module.ts                   # Root module — imports everything
│   │
│   ├── config/
│   │   └── configuration.ts            # Loads and validates .env variables
│   │
│   ├── database/
│   │   └── database.module.ts          # TypeORM PostgreSQL connection setup
│   │
│   ├── common/                         # Shared across all modules
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts      # @Roles('ADMIN') decorator
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts       # Protects routes with JWT
│   │   │   └── roles.guard.ts          # Enforces RBAC roles
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts # Wraps all responses in { success, data }
│   │   │   └── audit.interceptor.ts    # Auto-logs all admin mutations
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Global error handler
│   │   └── pipes/
│   │       └── parse-uuid.pipe.ts      # Validates UUID params
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts     # Validates JWT, injects req.user
│   │   │   │   └── local.strategy.ts   # Validates email/password
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts   # TypeORM entity = database table
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       ├── update-product.dto.ts
│   │   │       └── product-response.dto.ts
│   │   │
│   │   ├── orders/                     # Same structure as products
│   │   ├── customers/
│   │   ├── inventory/
│   │   ├── support/
│   │   ├── marketing/
│   │   ├── financials/
│   │   ├── storefront/
│   │   └── settings/
│   │
├── test/
├── .env
├── nest-cli.json
├── package.json
└── Dockerfile
```

---

## PART 4: DATABASE DESIGN WITH TYPEORM

TypeORM lets you define your PostgreSQL tables as TypeScript classes. This is called "Code First" — you write the TypeScript class and TypeORM generates the SQL table.

### `users` Entity
```
@Entity('users')
class User {
  id: UUID (PK, auto-generated)
  email: string (UNIQUE, indexed)
  passwordHash: string
  fullName: string
  role: UserRole (enum: CUSTOMER, ADMIN, SUPPORT_AGENT, MERCHANDISER, FINANCE)
  isBanned: boolean (default: false)
  loyaltyPoints: number (default: 0)
  orders: Order[] (One-to-Many relation)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### `products` Entity
```
@Entity('products')
class Product {
  id: UUID (PK)
  sku: string (UNIQUE)
  name: string
  basePrice: number
  category: string
  variants: object (JSONB — {"S": 10, "M": 5})
  images: string[] (array of Cloudinary URLs)
  isPublished: boolean (default: false)
  isDeleted: boolean (default: false, for soft delete)
  inventory: Inventory[] (One-to-Many)
  orderItems: OrderItem[] (One-to-Many)
}
```

### `orders` Entity
```
@Entity('orders')
class Order {
  id: UUID (PK)
  orderNumber: string (UNIQUE — 'ATL-10482')
  user: User (Many-to-One → users.id)
  totalAmount: number
  discountAmount: number
  status: OrderStatus (enum: PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  riskFlag: RiskFlag (enum: LOW, MEDIUM, HIGH)
  trackingNumber: string (nullable)
  items: OrderItem[] (One-to-Many)
  createdAt: Date
}
```

### `inventory` Entity
```
@Entity('inventory')
class Inventory {
  id: UUID (PK)
  product: Product (Many-to-One)
  warehouse: Warehouse (Many-to-One)
  quantityAvailable: number (CHECK >= 0)
  quantityReserved: number (default: 0)
}
```

### TypeORM Relationship Summary

| Relationship | From | To | Type |
|---|---|---|---|
| A user places many orders | User | Order | OneToMany |
| An order belongs to a user | Order | User | ManyToOne |
| An order has many items | Order | OrderItem | OneToMany |
| A product appears in many orders | Product | OrderItem | OneToMany |
| A product has stock in many warehouses | Product | Inventory | OneToMany |
| A user opens many tickets | User | SupportTicket | OneToMany |
