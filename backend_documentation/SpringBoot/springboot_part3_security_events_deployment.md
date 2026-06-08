# Spring Boot Backend Blueprint — Part 3
## Security, RBAC, Events, Caching, Storage, Deployment & Junior Developer Guide

---

## PART 1: SECURITY DESIGN

### Authentication Flow (Step-by-Step)

Think of this like airport security. You don't just walk onto a plane — you show your boarding pass (JWT) at every checkpoint.

```
Client sends: POST /api/v1/auth/login { email, password }
    ↓
JwtAuthFilter (Spring Security Filter) — Is this a public route? YES → skip to controller
    ↓
AuthController → AuthService.login()
    ↓
Find User by email in DB
    ↓
BCrypt.checkpw(rawPassword, storedHash) → match?
    ↓
YES → JwtUtils.generateAccessToken(userId, role) → expires in 15 minutes
YES → JwtUtils.generateRefreshToken() → stored in DB, expires in 7 days
    ↓
Return { accessToken, refreshToken }
```

For all PROTECTED routes:
```
Client sends: GET /api/v1/admin/orders
    Header: Authorization: Bearer eyJhbGci...
    ↓
JwtAuthFilter intercepts EVERY request
    ↓
Extract token from header
    ↓
JwtUtils.validateToken(token) → Is signature valid? Is it expired?
    ↓
NO → return 401 UNAUTHORIZED
YES → Extract userId and role from token payload
    ↓
Set SecurityContextHolder (Spring's way of knowing who made this request)
    ↓
Request reaches OrderController
    ↓
@PreAuthorize("hasRole('ADMIN')") checked → allowed or 403 FORBIDDEN
```

---

## PART 2: RBAC — Role-Based Access Control

Every admin user has exactly ONE role. That role determines what they can and cannot do.

### Permission Matrix

| Module | SUPER_ADMIN | ADMIN | MERCHANDISER | SUPPORT_AGENT | FINANCE |
|---|---|---|---|---|---|
| Products (Create/Edit) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Orders (Update Status) | ✅ | ✅ | ❌ | ✅ Read only | ❌ |
| Customers (Ban) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Inventory (Transfer) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Financials | ✅ | Read only | ❌ | ❌ | ✅ |
| Settings (RBAC, API Keys) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | Read only | ❌ | ❌ | ❌ |

### Implementation in Spring Boot
In each controller method, add:
- `@PreAuthorize("hasRole('ADMIN')")` — restricts to single role
- `@PreAuthorize("hasAnyRole('ADMIN', 'MERCHANDISER')")` — allows multiple roles

---

## PART 3: EVENT-DRIVEN DESIGN

### Why Events?
When a customer places an order, at least 4 things need to happen:
1. Stock must be deducted.
2. A confirmation email must be sent.
3. Loyalty points must be awarded.
4. The marketing system must know which campaign triggered the sale.

If you do all of this sequentially in the OrderService, a slow email server can delay the entire checkout response. Instead, we publish ONE event and let separate listeners handle each concern independently.

### Key Events

**OrderPlacedEvent**
- Published by: OrderService
- Consumed by:
  - NotificationService → send confirmation email to customer
  - LoyaltyService → add loyalty points
  - MarketingService → attribute campaign revenue
- Payload: `{ orderId, userId, totalAmount, promoCode, items: [{productId, qty}] }`

**OrderShippedEvent**
- Published by: OrderService (when status changes to SHIPPED)
- Consumed by:
  - NotificationService → send SMS + email with tracking link
  - InventoryService → convert quantity_reserved to permanently deducted
- Payload: `{ orderId, userId, trackingNumber, carrier }`

**InventoryLowEvent**
- Published by: InventoryService
- Consumed by:
  - NotificationService → send Slack/email alert to Merchandiser
- Payload: `{ productId, warehouseId, currentQuantity, threshold }`

**CustomerRegisteredEvent**
- Published by: AuthService
- Consumed by:
  - NotificationService → send welcome email
  - MarketingService → add to Klaviyo welcome email flow
- Payload: `{ userId, email, fullName }`

### Implementation Options for Small Business
For SMB, use **Spring's built-in ApplicationEventPublisher** (no external broker needed):
```
// Publisher: orderService.createOrder() → applicationEventPublisher.publishEvent(new OrderPlacedEvent(order))
// Listener: @EventListener class NotificationListener { void onOrderPlaced(OrderPlacedEvent event) { ... } }
```
For larger scale, replace with **RabbitMQ** or **Kafka** without changing the business logic.

---

## PART 4: CACHING STRATEGY WITH REDIS

### Why Cache?
Imagine 1,000 customers opening the homepage at the same time. Without caching, that's 1,000 database queries every few seconds for the SAME storefront config JSON. With Redis:
- Query the DB once
- Store result in Redis for 1 hour
- Serve all 1,000 requests from memory in under 5ms

### What to Cache

| Cache Key | Data Cached | TTL | When Invalidated |
|---|---|---|---|
| `storefront:config` | Full homepage CMS JSON | 1 hour | When admin publishes new layout |
| `product:detail:{slug}` | Individual product details | 24 hours | When product is updated |
| `product:list:page:{n}` | Paginated product list | 30 minutes | When any product is published/updated |

### JWT Blacklist (for banning users instantly)
When an admin bans a user, their existing JWT is still valid until it expires (up to 15 minutes). To instantly revoke access:
- Add their `userId` to a Redis SET called `blacklisted_users`
- Every request's JwtAuthFilter checks this set
- If the userId is in the blacklist → return 401 immediately

---

## PART 5: FILE STORAGE DESIGN

### Recommendation: Cloudinary
Why Cloudinary over S3 or MinIO?
- Cloudinary provides automatic image resizing and format conversion (WebP/AVIF) on-the-fly. An admin can upload a 5MB JPEG, and Cloudinary will automatically serve a 40KB WebP to mobile users.
- CDN delivery is built in (global fast delivery).
- For a small business, Cloudinary's free tier handles thousands of product images.

### Upload Flow
```
1. Merchandiser selects image in Admin Panel
2. Frontend sends image as multipart/form-data to: POST /api/v1/admin/products/:id/images
3. Spring Boot receives the file using Multipart
4. Stream the bytes directly to Cloudinary API (no disk save on server)
5. Cloudinary returns a secure_url (e.g., https://res.cloudinary.com/atelier/image/v1/silk-scarf.webp)
6. Save that URL string in the products.images[] array in PostgreSQL
```

---

## PART 6: DEPLOYMENT ARCHITECTURE

### Development (Your Local Machine)
```
Your Browser (localhost:5173) → React Frontend (Vite)
         ↓ API calls
Spring Boot App (localhost:8080)
         ↓
PostgreSQL (localhost:5432)
```
Run: `./mvnw spring-boot:run`

### Production (Recommended: Render.com or AWS)

```
Customer's Browser
       ↓ HTTPS
Nginx Reverse Proxy (SSL termination, serves static React files)
       ↓ /api/* requests
Spring Boot App (1-2 instances, Java JAR running in Docker)
       ↓ Reads/writes
PostgreSQL (Managed DB: Render DB or AWS RDS)
       ↓ Cached data
Redis (Upstash Redis or AWS ElastiCache)
       ↓ Images
Cloudinary CDN
```

### Dockerfile (How to Package Spring Boot)
```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/atelier-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```
Build: `./mvnw clean package -DskipTests`
Run: `docker build -t atelier-backend . && docker run -p 8080:8080 atelier-backend`

---

## PART 7: NOTIFICATION SYSTEM

| Trigger | Channel | Recipient | Content |
|---|---|---|---|
| Order Placed | Email | Customer | Order summary, estimated delivery |
| Order Shipped | Email + SMS | Customer | Tracking link |
| Password Reset | Email | Customer | Reset link (expires in 15 min) |
| SLA Breached | Slack / Email | Support Manager | Ticket ID, customer name |
| Inventory Low | Email | Merchandiser | Product name, current stock level |
| Customer Registered | Email | Customer | Welcome message |

### Implementation
Use **Spring Mail** (JavaMailSender) for emails with Gmail or SendGrid SMTP.
Use **Twilio** SDK for SMS messages.
Templates: Store HTML email templates in `src/main/resources/templates/` using Thymeleaf.

---

## PART 8: JUNIOR DEVELOPER IMPLEMENTATION GUIDE

### The Golden Rule: Always Follow This Layer Order
When building ANY new feature, always build in this order:

**Step 1 → Entity** (define what the data looks like in the database)
**Step 2 → Repository** (the interface that talks to the DB — often just `extends JpaRepository`)
**Step 3 → DTO** (what the API request/response looks like)
**Step 4 → Service** (the business logic — where the real work happens)
**Step 5 → Controller** (the HTTP layer — route, method, call service, return response)

### Common Mistakes Junior Developers Make

1. **Putting business logic in the Controller.** The Controller should be dumb — it only receives, calls the service, and responds.
2. **Forgetting @Transactional.** If your Service does more than one DB operation (e.g., deduct stock AND create order), you MUST put @Transactional on that method.
3. **Exposing Entity directly from Controller.** Always use DTOs. Entities can contain sensitive fields (password_hash). A DTO shows only what the API consumer needs.
4. **Hard deleting products.** Always soft delete. `is_deleted = true`. Never run DELETE FROM products WHERE id = '...'
5. **Not validating inputs.** Use `@Valid` in controllers and `@NotNull`, `@Size`, `@Email` annotations on DTO fields.

### Project Startup Checklist
- [ ] Spring Initializr project created (Web, JPA, Security, PostgreSQL, Validation, Redis)
- [ ] `application.yml` configured with DB URL, JWT secret
- [ ] Flyway SQL migration script V1__init.sql created with all tables
- [ ] `BaseEntity` abstract class created (id, createdAt, updatedAt)
- [ ] Global Exception Handler created (`@ControllerAdvice`)
- [ ] Standard API Response wrapper created (`{ success, data, error }`)
- [ ] JwtUtils and JwtAuthFilter created and registered
- [ ] Auth module (register, login) working end-to-end
- [ ] First protected route tested with a valid JWT
