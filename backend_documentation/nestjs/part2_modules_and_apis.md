# NestJS Backend Blueprint — Part 2
## Module-by-Module Guide, All APIs, DTOs & Service Flows

---

## THE NESTJS MODULE PATTERN (Learn This First)

Every feature in NestJS is a self-contained Module. Here's how the Products module works as a template you can apply to every other module:

```
products.module.ts      → declares ProductsController, ProductsService, imports TypeORM entity
products.controller.ts  → @Get(), @Post(), @Patch() decorators map HTTP routes
products.service.ts     → contains actual business logic
products.entity.ts      → TypeORM class = DB table
create-product.dto.ts   → validates input with class-validator decorators
```

---

## MODULE 1: AUTH MODULE

### How NestJS Auth Works (Passport.js)
NestJS uses Passport.js strategies. Think of a strategy as a "challenge" the user must pass:
- **LocalStrategy:** User provides email + password. Passport validates it. Returns a User object.
- **JwtStrategy:** User provides a JWT token. Passport validates the signature and expiry. Returns the payload.

### APIs

| Method | Path | Guard | Description |
|---|---|---|---|
| POST | /api/v1/auth/register | None | Create customer account |
| POST | /api/v1/auth/login | LocalAuthGuard | Returns JWT + refresh token |
| POST | /api/v1/auth/refresh | None (uses refresh token) | Get new access token |
| POST | /api/v1/auth/logout | JwtAuthGuard | Blacklists refresh token |
| POST | /api/v1/auth/forgot-password | None | Emails reset link |

### DTOs (Data Transfer Objects)
```
RegisterDto:
  @IsEmail()       email: string
  @IsString()
  @MinLength(8)    password: string
  @IsString()      fullName: string

LoginDto:
  @IsEmail()   email: string
  @IsString()  password: string
```

### Login Service Flow
```
1. POST /api/v1/auth/login { email, password }
2. LocalAuthGuard triggers LocalStrategy.validate(email, password)
3. authService.validateUser(email, password):
   a. usersService.findByEmail(email)
   b. bcrypt.compare(password, user.passwordHash)
   c. If valid → return user
   d. If invalid → throw UnauthorizedException
4. authService.login(user):
   a. Generate access token: jwtService.sign({ sub: user.id, role: user.role })
   b. Generate refresh token: store in DB with userId and expiry
5. Return { accessToken, refreshToken }
```

---

## MODULE 2: PRODUCTS MODULE

### Controller Routes

| Method | Path | Guards | Permission |
|---|---|---|---|
| GET | /products | None | Public |
| GET | /products/:slug | None | Public |
| POST | /admin/products | JwtAuthGuard + RolesGuard | ADMIN, MERCHANDISER |
| PUT | /admin/products/:id | JwtAuthGuard + RolesGuard | ADMIN, MERCHANDISER |
| PATCH | /admin/products/:id/publish | JwtAuthGuard + RolesGuard | ADMIN |
| DELETE | /admin/products/:id | JwtAuthGuard + RolesGuard | ADMIN |

### Decorators on Controller Methods
```
@Get()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MERCHANDISER')
async createProduct(@Body() createProductDto: CreateProductDto, @Request() req) {
  return this.productsService.create(createProductDto, req.user.id);
}
```

### Business Rules in ProductsService
1. Before creating: check if SKU already exists — throw `ConflictException` if duplicate.
2. Before publishing: verify at least 1 image exists.
3. Deleting: set `isDeleted = true` — NEVER use `delete()`.

---

## MODULE 3: ORDERS MODULE (Most Complex)

### APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /orders | JwtAuthGuard (CUSTOMER) | Place order — checkout |
| GET | /orders/my | JwtAuthGuard (CUSTOMER) | Own order history |
| GET | /admin/orders | JwtAuthGuard (ADMIN) | All orders, paginated |
| GET | /admin/orders/:id | JwtAuthGuard (ADMIN) | Order detail + timeline |
| PATCH | /admin/orders/:id/status | JwtAuthGuard (ADMIN) | Update status |
| POST | /admin/orders/:id/refund | JwtAuthGuard (ADMIN) | Issue refund |

### Service Flow — Create Order (Step-by-Step)
```
ordersService.createOrder(userId, createOrderDto):
  1. Start TypeORM transaction: queryRunner.startTransaction()
  
  2. For each item in createOrderDto.items:
     a. Fetch inventory with pessimistic lock:
        inventoryRepo.findOne({ where: {...}, lock: { mode: 'pessimistic_write' } })
     b. If inventory.quantityAvailable < item.quantity:
        throw BadRequestException('Insufficient stock')
     c. inventory.quantityAvailable -= item.quantity
     d. inventory.quantityReserved += item.quantity
     e. queryRunner.manager.save(inventory)
  
  3. Validate promo code if provided:
     campaignService.validateAndApply(promoCode, orderTotal)
  
  4. Calculate totals (subtotal, tax, shipping, discount)
  
  5. Create Order entity and save via queryRunner
  
  6. Create OrderItem entities for each product
  
  7. queryRunner.commitTransaction()
  
  8. Emit event: this.eventEmitter.emit('order.placed', { orderId, userId, total })
  
  9. Return order response DTO
  
  On any error: queryRunner.rollbackTransaction()
```

### Status Transition Validation (State Machine)
```
ordersService.updateStatus(orderId, newStatus):
  const allowedTransitions = {
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],       // No transitions allowed from delivered
    CANCELLED: []        // No transitions allowed from cancelled
  };
  
  if (!allowedTransitions[order.status].includes(newStatus)):
    throw BadRequestException('Invalid status transition')
```

---

## MODULE 4: CUSTOMERS MODULE (CRM)

### APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/customers | ADMIN | Paginated list with segment filter |
| GET | /admin/customers/:id | ADMIN | Full 360 profile |
| POST | /admin/customers/:id/notes | ADMIN | Add admin note |
| PATCH | /admin/customers/:id/ban | ADMIN | Toggle ban status |

### Customer 360 Service
```
customersService.getProfile(customerId):
  1. Fetch user record
  2. Fetch recent orders (limit 10)
  3. Calculate: SELECT SUM(total) FROM orders WHERE user_id = :id AND status = 'DELIVERED'
  4. Count: SELECT COUNT(*) FROM orders WHERE user_id = :id
  5. Fetch support tickets
  6. Fetch admin notes
  7. Assemble and return CustomerProfileDto
```

---

## MODULE 5: INVENTORY MODULE (WMS)

### APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /admin/inventory | ADMIN/MERCH | Stock levels across warehouses |
| POST | /admin/inventory/adjust | ADMIN | Manual adjustment with reason |
| POST | /admin/inventory/transfer | ADMIN | Move stock between warehouses |
| GET | /admin/purchase-orders | ADMIN | PO list |
| PATCH | /admin/purchase-orders/:id/receive | ADMIN | Receive PO → adds stock |

### Stock Transfer Service Flow
```
inventoryService.transfer(productId, fromWarehouseId, toWarehouseId, quantity):
  1. queryRunner.startTransaction()
  2. Fetch source inventory (pessimistic lock)
  3. If source.quantityAvailable < quantity → throw BadRequestException
  4. source.quantityAvailable -= quantity
  5. Fetch or create destination inventory
  6. destination.quantityAvailable += quantity
  7. Save both
  8. Create InventoryLog entry
  9. queryRunner.commitTransaction()
```

---

## MODULE 6: STOREFRONT CMS MODULE

### APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /storefront/config | None | Get published CMS (from Redis) |
| GET | /admin/storefront/config | ADMIN | Get draft config |
| PUT | /admin/storefront/config | ADMIN | Update draft |
| POST | /admin/storefront/config/publish | ADMIN | Publish → writes Redis cache |

### Caching with NestJS Cache Manager
```
storefrontService.getPublicConfig():
  1. Check cache: cacheManager.get('storefront:config')
  2. If found → return (fast path, under 5ms)
  3. If not found:
     a. Fetch from DB
     b. cacheManager.set('storefront:config', config, 3600)  // TTL: 1 hour
     c. Return config

storefrontService.publish():
  1. Update DB record
  2. cacheManager.del('storefront:config')  // Invalidate cache
  3. Log audit entry
```

---

## MODULE 7: SUPPORT MODULE

### APIs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /support/tickets | CUSTOMER | Create support ticket |
| GET | /support/tickets/my | CUSTOMER | Own tickets |
| GET | /admin/support/tickets | ADMIN/SUPPORT | All tickets |
| POST | /admin/support/tickets/:id/reply | ADMIN/SUPPORT | Reply |
| PATCH | /admin/support/tickets/:id/assign | ADMIN | Assign to agent |
| PATCH | /admin/support/tickets/:id/close | ADMIN/SUPPORT | Close ticket |

### SLA Calculation
When a ticket is created, calculate the SLA deadline based on priority:
- HIGH priority → `slaDeadline = createdAt + 2 hours`
- MEDIUM priority → `slaDeadline = createdAt + 12 hours`
- LOW priority → `slaDeadline = createdAt + 48 hours`

A scheduled job (`@Cron`) runs every 15 minutes to find tickets where `slaDeadline < NOW() AND status != 'CLOSED'` and mark them as breached, triggering a notification.

---

## MODULE 8: EVENTS WITH EventEmitter2

NestJS has a built-in event system via `@nestjs/event-emitter`.

### Event Flow Setup
```
Install: npm install @nestjs/event-emitter eventemitter2
Register in AppModule: EventEmitterModule.forRoot()
```

### Emitting Events (in OrdersService)
```
this.eventEmitter.emit('order.placed', new OrderPlacedEvent(order));
this.eventEmitter.emit('order.shipped', new OrderShippedEvent(order));
```

### Listening to Events (in NotificationService)
```
@OnEvent('order.placed')
async handleOrderPlaced(event: OrderPlacedEvent) {
  await this.emailService.sendOrderConfirmation(event.userId, event.orderId);
  await this.loyaltyService.awardPoints(event.userId, event.totalAmount);
}
```

### All Events in the System

| Event | Emitted By | Handled By |
|---|---|---|
| order.placed | OrdersService | NotificationService, LoyaltyService |
| order.shipped | OrdersService | NotificationService, InventoryService |
| order.cancelled | OrdersService | InventoryService (restore stock) |
| customer.registered | AuthService | NotificationService |
| inventory.low | InventoryService | NotificationService |
| ticket.sla.breached | SchedulerService | NotificationService |
