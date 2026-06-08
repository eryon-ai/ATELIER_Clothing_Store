# NestJS Backend Blueprint — Part 3
## Security, WebSockets, Scheduling, Deployment & Junior Developer Guide

---

## PART 1: SECURITY IN NESTJS

### Guards — The Gatekeepers
Guards are NestJS's way of protecting routes. They run BEFORE the controller and decide: "Is this request allowed?"

**JwtAuthGuard:** Checks if a valid JWT is in the `Authorization: Bearer` header. If not → `401 Unauthorized`.
**RolesGuard:** After JwtAuthGuard confirms who the user is, RolesGuard checks if they have the right role. If not → `403 Forbidden`.

### How to Apply Guards on a Route
Apply globally at the controller level or per-route:
```
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)  // All routes in this controller need auth
class ProductsController {
  
  @Post()
  @Roles('ADMIN', 'MERCHANDISER')       // This route needs one of these roles
  async create(@Body() dto: CreateProductDto) { ... }
  
  @Get()
  @Roles('ADMIN', 'MERCHANDISER', 'FINANCE', 'SUPPORT')   // Read-only for most
  async findAll() { ... }
}
```

### JWT Strategy (How Token Validation Works)
```
JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    })
  }
  
  async validate(payload: { sub: string, role: string }) {
    // Called automatically after signature verification
    const user = await usersService.findById(payload.sub)
    if (!user || user.isBanned) throw new UnauthorizedException()
    return user  // Attached to req.user for controllers
  }
}
```

### Permission Matrix

| Module | SUPER_ADMIN | ADMIN | MERCHANDISER | SUPPORT | FINANCE |
|---|---|---|---|---|---|
| Create/Edit Products | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Order Status | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ban Customers | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Financials | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage Roles & API Keys | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

### Audit Log Interceptor (Auto-Logging)
Apply this interceptor to ALL admin mutation routes. Every POST/PUT/PATCH/DELETE to `/admin/*` automatically writes an audit log entry:
```
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest()
    return next.handle().pipe(
      tap(() => {
        this.auditService.log({
          userId: request.user.id,
          action: `${request.method} ${request.url}`,
          ip: request.ip,
          body: request.body
        })
      })
    )
  }
}
```

---

## PART 2: WEBSOCKETS FOR LIVE CHAT

The ATELIER Support module has Live Chat. This requires WebSockets (a persistent two-way connection, unlike HTTP which is one-way).

### NestJS WebSocket Gateway
A Gateway is like a Controller, but for WebSocket events instead of HTTP routes.

### Live Chat Flow
```
Customer opens chat:
  1. Customer browser connects to WebSocket at ws://api.atelier.com
  2. Gateway.handleConnection() fires → save session to in-memory map
  
Customer sends message:
  3. Client emits: socket.emit('send_message', { chatId, message })
  4. Gateway.handleSendMessage() fires
  5. Save message to database (chat_messages table)
  6. Find assigned agent's socket ID
  7. Emit to agent: server.to(agentSocketId).emit('new_message', { ... })
  
Agent replies:
  8. Same flow in reverse → emit back to customer socket
```

---

## PART 3: SCHEDULED JOBS WITH @Cron

NestJS has a scheduling module for recurring background jobs.

```
Install: npm install @nestjs/schedule
Register in AppModule: ScheduleModule.forRoot()
```

### Scheduled Jobs in ATELIER

| Job | Schedule | Description |
|---|---|---|
| Check SLA breaches | Every 15 minutes | Find overdue tickets and alert managers |
| Low stock alerts | Every hour | Find products below threshold |
| Invoice overdue check | Every day at 9am | Find unpaid invoices past due date |
| Nightly inventory valuation | Every day at 3am | Calculate COGS for all current stock |
| Storefront cache warmup | Every hour | Re-cache CMS config to prevent cold starts |

### SLA Checker Job
```
@Cron('*/15 * * * *')   // Every 15 minutes
async checkSlaBreaches() {
  const breachedTickets = await this.ticketsRepo.find({
    where: {
      slaDeadline: LessThan(new Date()),
      status: Not('CLOSED')
    }
  })
  for (const ticket of breachedTickets) {
    await this.notificationService.alertSlaBreached(ticket)
  }
}
```

---

## PART 4: DEPLOYMENT

### Development Setup
```
# .env file
DATABASE_URL=postgresql://atelier:secret@localhost:5432/atelier_db
JWT_SECRET=your-very-long-secret-key-minimum-32-chars
REDIS_URL=redis://localhost:6379
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Run database in Docker
docker run -d -p 5432:5432 -e POSTGRES_DB=atelier_db -e POSTGRES_USER=atelier -e POSTGRES_PASSWORD=secret postgres:16

# Start NestJS
npm run start:dev    # hot-reload development mode
```

### Production Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Production Architecture
```
Customer Browser
       ↓ HTTPS
Nginx (SSL termination + serves React build)
       ↓ /api/* → proxy_pass
NestJS App (Docker, 2-4 instances behind Nginx)
       ↓
PostgreSQL (Railway or Supabase)
       ↓ Redis cache
Redis (Upstash)
       ↓ Images
Cloudinary
```

Deploy to: **Railway.app** (easiest for Node.js), **Render**, or **AWS ECS**.

---

## PART 5: SWAGGER API DOCUMENTATION

NestJS generates interactive Swagger UI automatically.

### Setup
```
// In main.ts
const config = new DocumentBuilder()
  .setTitle('ATELIER API')
  .setVersion('1.0')
  .addBearerAuth()
  .build()
const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api/docs', app, document)
```

Access at: `http://localhost:3000/api/docs`

Add `@ApiProperty()` decorators to your DTOs to document request/response schemas automatically.

---

## PART 6: JUNIOR DEVELOPER GUIDE

### The NestJS Golden Rules

1. **One responsibility per class.** Controllers handle HTTP only. Services handle logic only. Never mix them.
2. **Always use `@InjectRepository(Entity)` in Services.** Never import TypeORM directly in controllers.
3. **Always use DTOs with `@IsEmail()`, `@IsString()`, etc.** Never trust raw request body data.
4. **Add `ValidationPipe` globally in main.ts.** This makes all DTO validations run automatically.
5. **Use QueryRunner for multi-step transactions.** Never update multiple tables without starting a transaction.
6. **Emit events AFTER the transaction commits.** Never emit events inside the transaction — if the event handler fails, you cannot roll back.

### Project Startup Checklist (NestJS)
- [ ] NestJS CLI installed, project created
- [ ] All npm dependencies installed
- [ ] `.env` file configured (DATABASE_URL, JWT_SECRET, REDIS_URL)
- [ ] TypeORM connected to PostgreSQL (DatabaseModule working)
- [ ] All entities created (User, Product, Order, OrderItem, Inventory)
- [ ] Database migrations run (TypeORM synchronize OR migrations)
- [ ] GlobalPipes, GlobalFilters registered in main.ts
- [ ] AuthModule working (register + login returning JWT)
- [ ] JwtAuthGuard and RolesGuard tested on a protected route
- [ ] Swagger UI accessible at /api/docs
- [ ] Products CRUD working end-to-end
- [ ] Orders creation with transaction tested

### Common Mistakes
1. Forgetting to register a Service in its Module's `providers` array → NestJS throws "Cannot inject" error.
2. Forgetting to import TypeORM entity in Module's `imports` → `TypeOrmModule.forFeature([Product])`.
3. Using synchronous code in async functions → causes performance issues.
4. Not applying `ValidationPipe` globally → DTOs don't validate automatically.
