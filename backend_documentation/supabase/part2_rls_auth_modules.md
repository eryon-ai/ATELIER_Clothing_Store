# Supabase Backend Blueprint — Part 2
## Row Level Security, Auth, Edge Functions & Module-by-Module Guide

---

## PART 1: ROW LEVEL SECURITY (RLS) — THE MOST IMPORTANT CONCEPT

RLS is what makes Supabase secure. Without RLS, any user could query any table and get ALL data.

### How RLS Works
Think of RLS like a restaurant where each customer can ONLY see their own table's bill, but the manager can see all bills. You define this rule as a SQL policy in PostgreSQL.

### Enable RLS on All Tables First
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
```

### RLS Policies for Each Table

**PROFILES — Users can only see and edit their own profile:**
```sql
-- Users read own profile
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users update own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "admins_read_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
```

**PRODUCTS — Public can read published products. Only admins/merch can write:**
```sql
-- Anyone (even not logged in) can view published products
CREATE POLICY "public_read_published_products" ON products
  FOR SELECT USING (is_published = TRUE AND is_deleted = FALSE);

-- Admins and Merchandisers can read all (including drafts)
CREATE POLICY "admin_read_all_products" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MERCHANDISER'))
  );

-- Only Admins and Merchandisers can insert products
CREATE POLICY "admin_insert_products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MERCHANDISER'))
  );
```

**ORDERS — Customers see only their orders. Admins see all:**
```sql
-- Customers see only their own orders
CREATE POLICY "customers_read_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Admins see all orders
CREATE POLICY "admin_read_all_orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPPORT_AGENT'))
  );

-- Admins can update order status
CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
```

**INVENTORY — Only Admins and Merchandisers:**
```sql
CREATE POLICY "admin_manage_inventory" ON inventory
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MERCHANDISER'))
  );
```

---

## PART 2: AUTHENTICATION — SUPABASE AUTH

Supabase Auth handles EVERYTHING. No code needed on your server.

### Auth Flows Available Out-of-the-Box
1. **Email + Password** (primary method)
2. **Magic Link** (passwordless — email a one-click login link)
3. **Google OAuth**
4. **Apple OAuth**

### Frontend Auth Usage (React)
```typescript
// Register
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: { full_name: 'Alex Chen' }  // Stored in user metadata
  }
})

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})
// data.session.access_token = JWT, automatically included in all subsequent requests

// Logout
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

### Auto-Creating Profiles on Signup (Database Trigger)
When a user signs up, Supabase creates a record in `auth.users`. We automatically create a row in our `profiles` table using a database trigger:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'CUSTOMER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## PART 3: MODULE-BY-MODULE GUIDE

### MODULE 1: Products

**Fetching products (frontend, no backend code needed):**
```typescript
// Get published products with filter
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_published', true)
  .eq('category', 'Women')
  .gte('base_price', 100)
  .lte('base_price', 500)
  .range(0, 19)  // Pagination

// Get single product by slug (needs slug column or use name)
const { data: product } = await supabase
  .from('products')
  .select('*, inventory(*)')  // Join inventory
  .eq('slug', 'metropolis-parka')
  .single()
```

**Admin creating a product (frontend call):**
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Silk Midi Dress',
    sku: 'SILK-MIDI-001',
    base_price: 480,
    category: 'Women',
    is_published: false,
    created_by: user.id
  })
```
RLS automatically blocks this if the user is not ADMIN or MERCHANDISER.

---

### MODULE 2: Orders — Edge Function Required

Placing an order requires a transaction (deduct inventory AND create order atomically). This CANNOT be done safely from the frontend — we need an Edge Function.

**Frontend calls the Edge Function:**
```typescript
const { data, error } = await supabase.functions.invoke('place-order', {
  body: {
    items: [{ productId: 'uuid', quantity: 1, size: 'M' }],
    promoCode: 'SUMMER20'
  }
})
```

**Edge Function (supabase/functions/place-order/index.ts):**
```
The Edge Function:
1. Verifies the JWT (Supabase provides this automatically)
2. Gets user ID from the JWT payload
3. Creates a Supabase admin client (bypasses RLS for server-side operations)
4. Starts a PostgreSQL transaction using rpc() call to a stored procedure
5. For each item: checks and deducts inventory
6. Creates the order and order_items records
7. Validates and applies promo code
8. Returns the created order
```

**The Database Stored Procedure (handles the transaction):**
```sql
CREATE OR REPLACE FUNCTION place_order(
  p_user_id UUID,
  p_items JSONB,
  p_promo_code TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_inventory RECORD;
BEGIN
  -- Create the order
  INSERT INTO orders (user_id, status, order_number)
  VALUES (p_user_id, 'PROCESSING', 'ATL-' || nextval('order_number_seq'))
  RETURNING id INTO v_order_id;

  -- For each item, deduct inventory
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    SELECT * INTO v_inventory
    FROM inventory
    WHERE product_id = (v_item->>'productId')::UUID
    FOR UPDATE;    -- LOCKS THE ROW

    IF v_inventory.quantity_available < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_item->>'productId';
    END IF;

    UPDATE inventory
    SET quantity_available = quantity_available - (v_item->>'quantity')::INTEGER
    WHERE id = v_inventory.id;

    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (v_order_id, (v_item->>'productId')::UUID, (v_item->>'quantity')::INTEGER, (v_item->>'price')::DECIMAL);
  END LOOP;

  RETURN jsonb_build_object('orderId', v_order_id);
EXCEPTION
  WHEN OTHERS THEN
    RAISE;  -- Transaction auto-rollbacks on exception
END;
$$ LANGUAGE plpgsql;
```

---

### MODULE 3: Real-Time Features

Supabase Real-Time is built on PostgreSQL LISTEN/NOTIFY. No additional server needed.

**Live Chat (Support Module):**
```typescript
// Support agent subscribes to new messages for their assigned tickets
const channel = supabase
  .channel('ticket-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'ticket_messages',
    filter: `ticket_id=eq.${ticketId}`
  }, (payload) => {
    // New message received — update UI instantly
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

**Live Order Status Updates (Customer Dashboard):**
```typescript
// Customer watches their order status in real-time
const channel = supabase
  .channel('my-order')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `id=eq.${orderId}`
  }, (payload) => {
    setOrderStatus(payload.new.status)
  })
  .subscribe()
```

---

### MODULE 4: File Storage (Product Images)

Supabase Storage is S3-compatible and deeply integrated with RLS.

**Setup Storage Bucket:**
```
1. Go to Supabase Dashboard → Storage → Create Bucket
2. Name: "product-images"
3. Set to PUBLIC (images are served publicly via CDN)
```

**Upload from Admin Panel (Frontend):**
```typescript
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`products/${productId}/${file.name}`, file, {
    cacheControl: '3600',
    upsert: true
  })

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('product-images')
  .getPublicUrl(`products/${productId}/${file.name}`)

// Save URL to product.images array
await supabase.from('products').update({ images: [publicUrl] }).eq('id', productId)
```

---

### MODULE 5: Storefront CMS

```typescript
// Admin reads draft config
const { data } = await supabase
  .from('storefront_config')
  .select('*')
  .single()

// Admin saves updated config
await supabase
  .from('storefront_config')
  .update({ config_json: newConfig, updated_by: user.id })
  .eq('id', configId)

// Admin publishes
await supabase
  .from('storefront_config')
  .update({ is_published: true, published_at: new Date().toISOString() })
  .eq('id', configId)

// Public storefront reads published config
const { data } = await supabase
  .from('storefront_config')
  .select('config_json')
  .eq('is_published', true)
  .single()
```
