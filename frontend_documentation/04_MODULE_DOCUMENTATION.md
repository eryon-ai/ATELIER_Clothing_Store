# 04 — MODULE DOCUMENTATION
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 04 of 18*

---

## MODULE 1: Admin Overview Dashboard

**Purpose:** Real-time headquarters for the ATELIER business. Gives leadership instant visibility into the health of the business.

**Features:**
- 4 KPI cards: Total Revenue, Total Orders, Active Customers, Conversion Rate
- Revenue vs. Orders chart (weekly trend)
- Live activity feed (last 5 business events)
- Quick action buttons (Add Product, New Campaign, Process Returns)

**Business Rules:**
- Revenue card shows gross revenue of ALL delivered orders
- Conversion Rate is calculated as `(unique purchases / unique sessions) × 100`
- Activity feed shows the 5 most recent significant events

**Future Backend Requirements:**
- `GET /api/v1/admin/dashboard/kpis?period=7d` → real-time aggregations
- Real-time push (WebSocket) for the activity feed

---

## MODULE 2: Products (PIM)

**Purpose:** Central repository for all merchandise data. Every product ATELIER sells is created, managed, and published here.

**Features:**
- Product table with search, category filter, and status filter (Draft/Published)
- Create Product drawer/modal with full field set (Name, SKU, Price, Category, Description, Variants, Images)
- Edit Product inline or via modal
- Publish/Unpublish toggle
- Soft-delete capability
- Bulk operations (planned)

**Business Rules:**
- SKU must be unique across ALL products
- A product starts as `Draft` and must be explicitly Published
- Deleting a product is a soft-delete — historical order data must be preserved
- Price must be greater than 0

---

## MODULE 3: Orders (OMS)

**Purpose:** Command center for all customer purchases from payment through delivery.

**Features:**
- Tabbed views: All, Processing, Shipped, Delivered, Cancelled
- Order search by order number, customer name, or email
- Order detail slide-over panel showing line items, customer info, timeline
- Status update workflow with confirmation
- Fraud risk badge (Low/Medium/High)
- Packing slip print action
- Refund initiation workflow

**Business Rules:**
- Cannot cancel a Shipped or Delivered order
- Valid status transitions: Processing → Shipped → Delivered OR Processing → Cancelled
- Shipping status update requires a tracking number

---

## MODULE 4: Customers (CRM)

**Purpose:** 360-degree view of every customer enabling personalized service and targeted marketing.

**Features:**
- Customer list with segment filter (VIP, Loyal, At Risk, New)
- Customer 360 detail panel showing: Profile, Lifetime Value, Retention Score, Health Score, Risk Flag
- Timeline of all interactions (orders, emails, loyalty events)
- Admin notes
- Tags management
- Ban/Unban action
- Order history sub-table

---

## MODULE 5: Analytics

**Purpose:** Data-driven insights to guide business decisions.

**Features:**
- Revenue analytics (daily, weekly, monthly trends)
- Traffic sources breakdown (Organic, Paid, Email, Social)
- Top products by revenue
- Customer cohort analysis
- Funnel visualization (Visitors → PDP → Cart → Checkout → Purchase)
- Geographic revenue map

---

## MODULE 6: Marketing

**Purpose:** Manage all promotional activities across channels.

**Sub-modules:**
1. **Discount Codes** — Create, edit, and track coupon code performance
2. **Omni-Channel Campaigns** — Email, SMS, Push campaign tracking
3. **Influencer Management** — Track influencer codes, usage, and revenue attribution
4. **A/B Testing** — Create and monitor conversion experiments

---

## MODULE 7: Storefront CMS

**Purpose:** Empower non-technical marketing staff to update the customer-facing website without developer involvement.

**Features:**
- Hero mood switcher (3 preset campaigns)
- Section toggle grid (show/hide homepage sections)
- Marquee ticker text management
- Flash sale banner configuration
- Category card management
- Navigation menu editor
- SEO meta fields editor
- Landing pages management

---

## MODULE 8: Inventory (WMS)

**Purpose:** Real-time visibility into stock levels across all warehouse locations.

**Features:**
- Multi-warehouse stock table
- Low-stock alert badges
- Manual stock adjustment with reason log
- Stock transfer between warehouses
- Supplier management (CRUD)
- Purchase Order management with lifecycle tracking

---

## MODULE 9: Support

**Purpose:** End-to-end customer service management.

**Sub-modules:**
1. **Tickets** — Create, assign, prioritize, and resolve customer issues
2. **Live Chat** — Real-time chat with waiting customers
3. **Knowledge Base** — Internal articles for agents
4. **FAQ Manager** — Customer-facing FAQ CRUD
5. **Support Analytics** — CSAT scores, resolution times, agent performance

---

## MODULE 10: Financials

**Purpose:** Complete financial visibility for the business.

**Sub-modules:**
1. **P&L Overview** — Gross/Net revenue, COGS, refunds, tax
2. **Cash Flow** — Monthly in/out chart
3. **Expenses** — Operating expense tracking
4. **B2B Invoices** — Wholesale client invoice management
5. **Tax Reports** — Region-by-region tax liability
6. **Payouts** — Seller payout history

---

## MODULE 11: Settings

**Purpose:** Global configuration and access control for the ATELIER platform.

**Tabs:**
1. **General** — Store name, email, currency, tax rate, free shipping threshold
2. **Roles & RBAC** — Create/edit roles and permissions
3. **Security** — 2FA enforcement, session timeout, IP whitelist
4. **Developers** — API key management
5. **Integrations** — Third-party service connections (Klaviyo, Stripe, Zendesk)
6. **Infrastructure** — Backup management, platform billing
