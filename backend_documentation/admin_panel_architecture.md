# Enterprise Admin Panel Backend Architecture

This document provides a deep dive into the backend architecture required to support the massive ATELIER Admin Panel, reversing the domain model from the React frontend components.

---

## 1. Overview Dashboard (`AdminOverview.jsx`)
**Domain Context:** High-level KPI aggregation and system-wide activity monitoring.
- **Backend Requirements:**
  - **Aggregated Analytics API:** Endpoint returning global metrics (Revenue, Orders, Customers, Conversion) calculated over a specific time window.
  - **Activity Stream API:** Feed of recent events (`initialActivities` in frontend). Needs to consume from a global Event Bus (Kafka) where all other services publish domain events (e.g., `OrderPlaced`, `ProductCreated`).

---

## 2. Product Information Management (PIM) (`AdminProducts.jsx`)
**Domain Context:** Managing the catalog, pricing, variants, and stock.
- **Entities:** `Product`, `Category`, `Variant`, `Size`.
- **Backend Requirements:**
  - **CRUD APIs:** Full lifecycle management of products.
  - **Soft Deletes & Drafts:** Products must support `lifecycleStatus` (Draft, Published, Archived).
  - **Variant Handling:** JSONB structures for dynamic attributes.
  - **Search & Filter:** Advanced text search, filtering by stock status, category, and price range (ideally via Elasticsearch).

---

## 3. Order Management System (OMS) (`AdminOrders.jsx`)
**Domain Context:** End-to-end order processing, tracking, and fulfillment.
- **Entities:** `Order`, `OrderItem`, `CustomerInfo`, `TimelineEvent`.
- **Backend Requirements:**
  - **State Machine:** Orders must transition through strict statuses (`Processing` -> `Shipped` -> `Delivered` or `Cancelled`).
  - **Fraud Detection:** Integration with a risk engine (`fraudRisk` flag).
  - **Bulk Operations:** `bulkUpdateOrders` endpoint for updating statuses or assigning tracking numbers in batches.
  - **Timeline Logging:** Immutable append-only log for every order interaction (`timeline` array).

---

## 4. Customer Relationship Management (CRM) (`AdminCustomers.jsx`)
**Domain Context:** Tracking customer behavior, segmentation, and lifetime value (LTV).
- **Entities:** `CustomerProfile`, `LoyaltyTier`, `TimelineEvent`, `AdminNote`.
- **Backend Requirements:**
  - **360-Degree View API:** Aggregating data from Identity (Auth), Orders (History), and Marketing (Segments).
  - **Risk & Health Scoring:** Async workers calculating `retentionScore`, `healthScore`, and `riskFlag` based on purchasing behavior.
  - **Tagging System:** Dynamic tags for marketing segmentation (`tags` array).
  - **Ban Mechanism:** Hard restriction toggles to suspend malicious users.

---

## 5. Warehouse & Supply Chain (`AdminInventory.jsx`)
**Domain Context:** Multi-warehouse stock tracking, suppliers, and Purchase Orders (POs).
- **Entities:** `Warehouse`, `Supplier`, `PurchaseOrder`, `InventoryLog`.
- **Backend Requirements:**
  - **Strict ACID Transactions:** Critical for inventory allocation and stock transfers.
  - **PO Lifecycle:** Managing Draft -> In Transit -> Received statuses.
  - **Audit Logging:** Every stock change (sales, returns, manual adjustments, transfers) must generate an immutable `InventoryLog`.

---

## 6. Financials & Billing (`AdminFinancials.jsx`)
**Domain Context:** Revenue tracking, COGS, tax liabilities, and expenses.
- **Entities:** `Expense`, `Invoice`, `TaxReport`, `Payout`.
- **Backend Requirements:**
  - **Double-Entry Ledger:** Highly recommended for financial accuracy.
  - **Revenue Aggregation:** Materialized views or OLAP (ClickHouse) for fast calculation of Gross Revenue, Net Revenue, COGS, and Refunds.
  - **Export Generation:** Background jobs generating CSV/PDF reports for accounting.

---

## 7. Marketing & Promotions (`AdminMarketing.jsx`)
**Domain Context:** Discount codes, multi-channel campaigns, influencers, and A/B testing.
- **Entities:** `DiscountCampaign`, `OmniCampaign`, `Influencer`, `ABTest`.
- **Backend Requirements:**
  - **Promo Engine:** Rule evaluation system at checkout to validate discounts.
  - **Influencer Tracking:** Tracking code usage (`usage` count, `revenue` attribution).
  - **A/B Test Engine:** Distributing users to control/variant groups and recording conversion rates.

---

## 8. Customer Support (`AdminSupport.jsx`)
**Domain Context:** Ticketing, live chat, and SLAs.
- **Entities:** `Ticket`, `TicketMessage`, `LiveChat`, `KBArticle`.
- **Backend Requirements:**
  - **Ticket Lifecycle:** Open -> Pending -> Closed with escalation logic (`escalationLevel`, `priority`).
  - **SLA Engine:** Background jobs tracking resolution deadlines and triggering alerts.
  - **WebSockets:** Real-time bi-directional communication for `LiveChat`.

---

## 9. Storefront CMS Builder (`AdminStorefront.jsx`)
**Domain Context:** Dynamic rendering of the B2C storefront homepage.
- **Entities:** `StorefrontConfig`, `HeroMood`, `PromoCard`, `Section`.
- **Backend Requirements:**
  - **Configuration JSON:** The entire config is likely stored as a large JSON document in Postgres or MongoDB.
  - **High Read Scalability:** The compiled configuration must be cached in Redis with a 1-hour TTL, as every visitor to the homepage will request it.
  - **Publishing Workflow:** Support for Draft vs. Published versions of the storefront layout.

---

## 10. Settings & RBAC (`AdminSettings.jsx`)
**Domain Context:** System configuration, security, and developer tools.
- **Entities:** `Role`, `Permission`, `ApiKey`, `Webhook`, `Integration`.
- **Backend Requirements:**
  - **Dynamic RBAC:** Middleware enforcing granular permissions (e.g., `write:products`, `read:orders`).
  - **Webhook Dispatcher:** Background workers attempting HTTP POSTs with exponential backoff.
  - **API Key Authentication:** Header-based auth (`Authorization: Bearer sk_live_...`) for headless integration.

---

## Summary of Backend Architectural Challenges
1. **Aggregations vs. OLTP:** The Admin Panel requires massive aggregations (Analytics, Financials, Customer LTV). The backend MUST separate OLTP (Postgres) from OLAP (ClickHouse/Snowflake) using Change Data Capture (CDC).
2. **Event Sourcing:** Timelines on Customers and Orders imply an Event-Driven Architecture.
3. **Caching:** The Storefront CMS data must be aggressively cached in Redis to prevent the Admin's frequent layout edits from causing database bottlenecks on the public storefront.
