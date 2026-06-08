# Supabase Backend Blueprint — Part 1
## Why Supabase, Architecture, Project Setup & Database Design

> [!IMPORTANT]
> **Who is this for?**
> This document is for developers who want to build the ATELIER backend using Supabase — the open-source Firebase alternative built on PostgreSQL. Supabase gives you a complete backend (database, authentication, storage, real-time) with almost zero server code. It is the FASTEST way to get a working backend.

---

## PART 1: WHAT IS SUPABASE AND WHY USE IT?

### Supabase in Simple Terms
Imagine you don't want to write a server at all. You want:
- A PostgreSQL database (hosted for you)
- Authentication (login/signup with email, Google, etc.)
- File storage (product images)
- Real-time data (live chat, live order updates)
- Auto-generated REST AND GraphQL APIs

Supabase gives you ALL of this, all connected to your React frontend, with almost zero backend code.

### Why Supabase is Excellent for ATELIER
1. **Zero Backend Server Code for Simple Operations:** CRUD operations on products, orders, and customers happen directly from the frontend using the Supabase client library. No separate Node.js/Python server needed for basic reads and writes.
2. **Built-in Authentication:** Supabase Auth handles user signup, login, JWT tokens, password reset, and even Google/Apple OAuth — all pre-built.
3. **Row Level Security (RLS):** This is Supabase's superpower. You write SQL "policy" rules inside the database itself. The database enforces who can see and edit which rows — making it impossible for a customer to see another customer's orders.
4. **Real-Time:** Use `supabase.channel()` to listen to database changes live. Perfect for the Support Live Chat module.
5. **Edge Functions:** For complex business logic (like placing an order with inventory deduction), write Supabase Edge Functions (TypeScript/Deno) that run at the edge — globally fast.

### Supabase vs Traditional Backend

| Feature | Traditional Backend (NestJS/Spring) | Supabase |
|---|---|---|
| Write API endpoints | Yes, for every feature | Only for complex logic (Edge Functions) |
| Authentication | Build from scratch | Built-in |
| Real-time | Need WebSocket server | Built-in |
| File storage | Need S3/Cloudinary setup | Built-in (S3-compatible) |
| Time to first working API | Days | Minutes |
| Best for | Complex enterprise logic | Rapid development, startups |

> [!TIP]
> **The Hybrid Approach (Recommended for ATELIER)**
> Use Supabase for the database, auth, storage, and real-time. Write Edge Functions (TypeScript) only for complex operations like placing orders (which need transactions) and promo code validation. This gives you the speed of Supabase with the safety of server-side logic where it matters.

---

## PART 2: ARCHITECTURE OVERVIEW

### How Supabase Works

```
React Frontend (Vite)
       ↓
Supabase JavaScript Client Library
       ↓
┌─────────────────────────────────────────┐
│           Supabase Platform             │
│                                         │
│  ┌─────────┐   ┌──────────┐  ┌───────┐ │
│  │  Auth   │   │ PostgREST│  │Storage│ │
│  │(JWT)    │   │(Auto API) │  │(S3)   │ │
│  └─────────┘   └──────────┘  └───────┘ │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    PostgreSQL Database          │   │
│  │    + Row Level Security         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    Edge Functions (Deno/TS)     │   │ ← Your custom logic here
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### What PostgREST Does (The Magic)
Supabase uses PostgREST under the hood. It reads your PostgreSQL schema and automatically generates REST API endpoints for EVERY table:
- `GET https://yourproject.supabase.co/rest/v1/products` → Returns all products
- `POST https://yourproject.supabase.co/rest/v1/orders` → Creates an order
- Row Level Security policies determine WHAT each user can see

---

## PART 3: PROJECT SETUP

### Step 1: Create Supabase Project
1. Go to `supabase.com` → Sign up → Create New Project.
2. Note your `Project URL` and `anon key` from Settings → API.
3. Install CLI: `npm install -g supabase`
4. Login: `supabase login`
5. Link to your project: `supabase link --project-ref YOUR_PROJECT_ID`

### Step 2: Frontend SDK Setup
```bash
npm install @supabase/supabase-js
```

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)
```

### Step 3: Edge Functions (for Complex Logic)
```bash
# Create an edge function
supabase functions new place-order

# This creates: supabase/functions/place-order/index.ts

# Deploy to Supabase cloud
supabase functions deploy place-order
```

---

## PART 4: DATABASE SCHEMA DESIGN

The database is PostgreSQL — the same tables as Spring Boot and NestJS. The difference is we add **Row Level Security (RLS) Policies** directly.

### SQL Schema (Run in Supabase SQL Editor)

```sql
-- USERS TABLE (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'ADMIN', 'SUPPORT_AGENT', 'MERCHANDISER', 'FINANCE')),
  loyalty_points INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
  category TEXT,
  variants JSONB,                 -- {"S": 10, "M": 5, "L": 0}
  images TEXT[],                  -- Array of Cloudinary/Supabase Storage URLs
  is_published BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_sku ON products(sku);

-- ORDERS TABLE
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  promo_code TEXT,
  status TEXT DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  risk_flag TEXT DEFAULT 'LOW' CHECK (risk_flag IN ('LOW', 'MEDIUM', 'HIGH')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ORDER ITEMS TABLE
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10,2) NOT NULL,
  size TEXT
);

-- WAREHOUSES TABLE
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  type TEXT CHECK (type IN ('FULFILLMENT', 'RETAIL'))
);

-- INVENTORY TABLE (CRITICAL — has check constraint)
CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  quantity_available INTEGER DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER DEFAULT 0,
  UNIQUE(product_id, warehouse_id)
);

-- SUPPORT TICKETS TABLE
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING', 'CLOSED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  sla_deadline TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id),
  escalation_level INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOREFRONT CONFIG TABLE (single row document)
CREATE TABLE public.storefront_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_json JSONB NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
