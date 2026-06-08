# Supabase Backend Blueprint — Part 3
## Edge Functions Reference, Database Functions, Deployment & Junior Guide

---

## PART 1: COMPLETE EDGE FUNCTIONS REFERENCE

Edge Functions are server-side TypeScript functions you write only when you need complex logic that CANNOT be done safely from the frontend. They run on Deno (a modern TypeScript runtime).

### When to Write an Edge Function

| Operation | Can Frontend Do It? | Needs Edge Function? |
|---|---|---|
| Read a list of products | YES | NO |
| Search products by name | YES | NO |
| Place an order (inventory deduction) | NO — needs transaction | YES |
| Validate promo code and calculate discount | NO — avoid exposing logic | YES |
| Send emails | NO — security risk | YES |
| Generate PDF invoice | NO | YES |
| Stripe payment processing | NO — security risk | YES |

---

### Edge Function 1: `place-order`
**Purpose:** Atomically create an order, deduct inventory, and apply promo code.
**Called by:** Frontend checkout flow.

**Input:**
```json
{
  "items": [
    { "productId": "uuid", "quantity": 2, "size": "M", "priceAtPurchase": 480.00 }
  ],
  "promoCode": "SUMMER20",
  "shippingAddressId": "uuid"
}
```
**Flow:**
```
1. Verify JWT — extract userId from token
2. Call Supabase RPC: SELECT place_order(userId, items, promoCode)
   (This calls the PostgreSQL stored procedure that handles the transaction)
3. If success → trigger send-order-email Edge Function (async, don't wait)
4. Return { success: true, order: { id, orderNumber, total } }
```

---

### Edge Function 2: `validate-promo`
**Purpose:** Check if a promo code is valid and return the discount amount.
**Why Edge Function?** Never validate promo codes on the frontend — a malicious user could manipulate the discount.

**Input:**
```json
{ "code": "SUMMER20", "orderTotal": 480.00 }
```
**Logic:**
```
1. Fetch discount_campaigns WHERE code = 'SUMMER20' (case-insensitive)
2. Check: is_active = TRUE
3. Check: expires_at > NOW()
4. Check: current_uses < max_uses
5. Check: orderTotal >= min_order_value
6. If all pass → return { valid: true, discountAmount: 96.00 }
7. If any fail → return { valid: false, reason: "Code expired" }
```

---

### Edge Function 3: `send-order-email`
**Purpose:** Send order confirmation email via SendGrid/Resend API.

**Input:**
```json
{ "orderId": "uuid", "type": "ORDER_PLACED" }
```
**Flow:**
```
1. Fetch order with items and user profile from DB
2. Build HTML email body from template
3. POST to SendGrid API: https://api.sendgrid.com/v3/mail/send
4. Log notification to notifications table
```

---

### Edge Function 4: `update-order-status`
**Purpose:** Validates status transitions and updates order status.

**Input:**
```json
{ "orderId": "uuid", "newStatus": "SHIPPED", "trackingNumber": "FX1234567" }
```
**Validation:**
```
Valid transitions:
PROCESSING → SHIPPED (requires trackingNumber)
PROCESSING → CANCELLED
SHIPPED → DELIVERED
SHIPPED → CANCELLED → BLOCKED (throw error)
DELIVERED → anything → BLOCKED (throw error)
```

---

## PART 2: DATABASE FUNCTIONS (PostgreSQL)

These are PostgreSQL functions that run inside the database. Called via `supabase.rpc()`.

### Function: Get Customer 360 Profile
```sql
CREATE OR REPLACE FUNCTION get_customer_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile JSONB;
  v_ltv DECIMAL;
  v_order_count INTEGER;
BEGIN
  SELECT row_to_json(p) INTO v_profile FROM profiles p WHERE id = p_user_id;
  SELECT COALESCE(SUM(total_amount), 0) INTO v_ltv
    FROM orders WHERE user_id = p_user_id AND status = 'DELIVERED';
  SELECT COUNT(*) INTO v_order_count FROM orders WHERE user_id = p_user_id;

  RETURN v_profile || jsonb_build_object(
    'lifetime_value', v_ltv,
    'total_orders', v_order_count
  );
END;
$$ LANGUAGE plpgsql;
```

Called from frontend: `await supabase.rpc('get_customer_profile', { p_user_id: customerId })`

### Function: Get Analytics Overview
```sql
CREATE OR REPLACE FUNCTION get_analytics_overview(p_from DATE, p_to DATE)
RETURNS JSONB AS $$
DECLARE v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'gross_revenue', SUM(total_amount),
    'order_count', COUNT(*),
    'avg_order_value', AVG(total_amount)
  ) INTO v_result
  FROM orders
  WHERE created_at BETWEEN p_from AND p_to
  AND status IN ('DELIVERED', 'SHIPPED');
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

---

## PART 3: SCHEDULED JOBS (Supabase Cron)

Supabase has a built-in cron job system using `pg_cron`. Run it from the Supabase SQL editor.

```sql
-- Install extension first
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Check for SLA breaches every 15 minutes
SELECT cron.schedule(
  'check-sla-breaches',
  '*/15 * * * *',
  $$
  UPDATE support_tickets
  SET escalation_level = escalation_level + 1
  WHERE sla_deadline < NOW()
  AND status != 'CLOSED'
  AND escalation_level = 0;
  $$
);

-- Check low stock every hour and create notifications
SELECT cron.schedule(
  'check-low-stock',
  '0 * * * *',
  $$
  INSERT INTO notifications (type, payload)
  SELECT 'LOW_STOCK', jsonb_build_object('productId', product_id, 'quantity', quantity_available)
  FROM inventory
  WHERE quantity_available < 5;
  $$
);
```

---

## PART 4: DEPLOYMENT

### Supabase Deployment Options

**Option 1: Supabase Cloud (Recommended for startups)**
- Host at supabase.com
- Free tier: 2 projects, 500MB database, 1GB storage
- Pro tier: $25/month — 8GB database, 100GB storage
- Zero DevOps — Supabase manages everything
- Database, Auth, Storage, and Edge Functions all hosted

**Option 2: Self-Hosted Supabase (For enterprises)**
- Run Supabase on your own Docker/Kubernetes
- Use `supabase/supabase` Docker Compose setup
- Full control, no vendor lock-in
- Requires DevOps knowledge

### Frontend + Supabase Production Setup
```
React App → Vercel or Netlify (free static hosting)
               ↓ supabase.from() / supabase.functions.invoke()
Supabase Cloud
  ├── PostgreSQL Database (with RLS)
  ├── Auth
  ├── Storage (product images, documents)
  ├── Edge Functions (place-order, validate-promo, etc.)
  └── Real-Time (live chat, order tracking)
```

**Total infrastructure cost: $0-$25/month** for a small business.

---

## PART 5: JUNIOR DEVELOPER GUIDE

### The 5 Supabase Concepts to Master First

1. **supabase.from('table').select()** — Querying data. Learn chaining filters (`.eq()`, `.gte()`, `.order()`, `.range()`).
2. **Row Level Security (RLS)** — THE most important concept. Every table must have policies or all data is blocked. Test policies in the Supabase Policy Editor.
3. **supabase.auth.signUp() and .signInWithPassword()** — Auth is built in. Never build JWT logic yourself.
4. **supabase.functions.invoke('function-name')** — How to call Edge Functions for complex operations.
5. **supabase.channel()** — Real-time subscriptions. Use for Live Chat and order tracking.

### Common Mistakes Junior Developers Make

1. **Forgetting to enable RLS on a table.** By default, if RLS is disabled, ANYONE can read ALL data — including other users' orders and personal info.
2. **Writing promo validation code in the frontend.** Users can inspect and modify frontend code. Always validate and apply discounts server-side (Edge Function).
3. **Placing orders from the frontend directly.** Multi-step operations with inventory deduction MUST use Edge Functions with PostgreSQL transactions.
4. **Not using `.single()` when expecting one row.** Without `.single()`, you get an array — your code breaks when it expects an object.
5. **Not unsubscribing from real-time channels.** Always call `channel.unsubscribe()` when the React component unmounts to prevent memory leaks.

### Project Startup Checklist (Supabase)
- [ ] Supabase project created at supabase.com
- [ ] `.env` file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [ ] All SQL tables created in Supabase SQL Editor
- [ ] RLS enabled on all tables
- [ ] RLS policies created for all tables
- [ ] `on_auth_user_created` trigger created (auto-creates profiles)
- [ ] Supabase Storage bucket created for product images
- [ ] Test: signup, login, read products, create order (via edge function)
- [ ] Edge Functions deployed (place-order, validate-promo)
- [ ] Real-time working (live chat or order tracking test)
- [ ] Admin Dashboard tested with ADMIN role user

### Testing Tip
Use the **Supabase Table Editor** and **SQL Editor** in the dashboard to:
- Browse data in real-time
- Test RLS policies using "Test Policies" feature
- Run raw SQL queries for debugging
- View Edge Function logs
