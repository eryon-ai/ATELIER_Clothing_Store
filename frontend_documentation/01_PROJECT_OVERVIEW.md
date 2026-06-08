# 01 — PROJECT OVERVIEW
**ATELIER Premium Fashion E-Commerce Platform**
*Enterprise Frontend Documentation — Document 01 of 18*

---

## 1.1 Project Purpose

ATELIER is a full-featured luxury fashion e-commerce platform designed to replicate the operational capabilities of Shopify Plus combined with a self-contained Enterprise Resource Planning (ERP) system. The application serves two completely separate but deeply interconnected audiences:

1. **The Customer:** A B2C storefront where end customers browse, discover, and purchase luxury fashion.
2. **The Internal Team:** A private B2B Admin ERP panel that gives ATELIER's staff complete control over every aspect of their business operations.

---

## 1.2 Business Goals

| Goal | Description |
|---|---|
| Drive Online Revenue | High-performance storefront that converts luxury fashion browsers into buyers |
| Centralize Operations | A single ERP panel replacing disparate tools (Salesforce, separate inventory software, email marketing platforms) |
| Enable CMS Control | Allow non-technical marketing and merchandising staff to update the website layout without developer involvement |
| Scale the Business | Support Multi-warehouse inventory, B2B wholesale invoicing, and influencer marketing tracking |
| Data Ownership | All customer and order data owned and managed in-house |

---

## 1.3 Application Scope

### In-Scope Features

**Customer-Facing (Storefront)**
- Product catalog browsing with category, price, and availability filtering
- Product detail pages with variant (size/color) selection
- Shopping cart with persistent state (survives browser refresh)
- Wishlist management
- Promo code application at checkout
- User authentication (Register, Login, Forgot Password)
- Customer dashboard (Order history, Loyalty points, Profile management)

**Admin-Facing (ERP Panel)**
- Overview Dashboard (KPIs and activity feed)
- Product Information Management (PIM)
- Order Management System (OMS)
- Customer Relationship Management (CRM) with 360° profiles
- Warehouse & Supply Chain Management (WMS)
- Marketing & Promotions (Campaigns, A/B Testing, Influencers)
- Content Management System (Storefront CMS Builder)
- Customer Support (Ticketing, SLAs, Live Chat, Knowledge Base)
- Financial Management (Revenue, COGS, Tax Reports, B2B Invoices)
- Settings & RBAC (Roles, Webhooks, API Keys, Security)

---

## 1.4 User Types

| User Type | Access Level | Where They Operate |
|---|---|---|
| **Anonymous Visitor** | Public storefront only | Storefront |
| **Registered Customer** | Storefront + Dashboard | Storefront |
| **Super Admin** | All Admin + All Settings | Admin ERP |
| **Store Manager / Admin** | All Admin modules except Settings | Admin ERP |
| **Merchandiser** | Products + Inventory only | Admin ERP |
| **Support Agent** | Support tickets + Customer view | Admin ERP |
| **Finance Officer** | Financials module only | Admin ERP |
| **Marketing Manager** | Marketing + Storefront CMS | Admin ERP |

---

## 1.5 Frontend Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Core Library** | React | 18+ | UI component rendering |
| **Build Tool** | Vite | 8+ | Fast dev server and production bundler |
| **Language** | JSX (JavaScript) | ES2020+ | Component markup and logic |
| **Routing** | React Router DOM | v6 | Client-side routing |
| **State Management** | Zustand | Latest | Global state stores |
| **Animations** | Framer Motion | Latest | Page transitions and micro-animations |
| **Notifications** | React Hot Toast | Latest | Success/error toast messages |
| **CSS Framework** | Tailwind CSS | v3 | Utility-first styling |
| **Persistence** | Zustand Persist (localStorage) | - | Cart, Auth, Admin state persistence |
| **Icons** | Google Material Symbols | Latest | System icons throughout |
| **Fonts** | Google Fonts (Hanken Grotesk, Cormorant) | - | Brand typography |

---

## 1.6 High-Level Architecture

```
Browser
  ↓
React SPA (Vite — Single Page Application)
  ↓
React Router v6 (client-side routing — no page reloads)
  ├── Storefront Routes (/, /products, /cart, /dashboard...)
  └── Admin Routes (/admin/overview, /admin/orders...)
          ↓
    Zustand Stores (Global State)
    ├── useAuthStore     → Authentication state
    ├── useCartStore     → Shopping cart (persisted)
    ├── useWishlistStore → Wishlist items (persisted)
    ├── useSearchStore   → Global search state
    └── useAdminStore    → All admin data (persisted)
          ↓
    Mock Data Layer (currently)
    → In production: REST API calls to backend
```

---

## 1.7 Design System Overview

ATELIER uses a luxury fashion aesthetic based on:

**Typography:**
- Headlines: `Cormorant Garamond` — An editorial serif evoking high-fashion magazine covers
- Body/UI: `Hanken Grotesk` — A clean, modern grotesque sans-serif for readability

**Color Philosophy:**
- Primary: Black (`#000000`) — Timeless luxury
- Background: Off-white (`#F8F6F3`) — Warm, premium feel
- Accent: Gold/Warm Beige tones for hover states
- Admin Sidebar: Pure White (`#FFFFFF`) — Clean, professional

**Motion Design:**
- Page transitions via Framer Motion `AnimatePresence`
- Subtle fade-in animations on scroll
- Micro-animations on hover for all interactive elements

**Layout:**
- Grid-based product catalogs
- Full-bleed hero sections
- Split-panel admin layout (sidebar + main content area)
