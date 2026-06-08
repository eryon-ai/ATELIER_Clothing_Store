# FastAPI Backend Blueprint — Part 3
## Security, Background Tasks, Testing, Deployment & Junior Developer Guide

---

## PART 1: SECURITY WITH FASTAPI

### JWT Authentication System

FastAPI uses OAuth2PasswordBearer to extract the token from request headers automatically.

**Token Strategy:**
- Access Token: Expires in 15 minutes. Used for every API call.
- Refresh Token: Expires in 7 days. Stored in DB. Used only to get new access tokens.
- Blacklist: Redis SET of banned user IDs for instant revocation.

### Password Hashing
Never store plain passwords. Use bcrypt via passlib:
```
Hashing:    passlib.hash.bcrypt.hash("mypassword")   → "$2b$12$..."
Verifying:  passlib.hash.bcrypt.verify("mypassword", stored_hash)  → True/False
```

### Role-Based Access Control
FastAPI uses Dependency Injection chains for RBAC:
```
get_db → provides DB session
   ↓
get_current_user(Depends(get_db)) → validates JWT, returns User object
   ↓
verify_admin(Depends(get_current_user)) → checks role is ADMIN
   ↓
verify_merchandiser(Depends(get_current_user)) → checks role is MERCHANDISER or ADMIN
```

### Permission Matrix (Same as Spring Boot)

| Module | SUPER_ADMIN | ADMIN | MERCHANDISER | SUPPORT | FINANCE |
|---|---|---|---|---|---|
| Create Products | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Order Status | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ban Customers | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Financials | ✅ | ✅ | ❌ | ❌ | ✅ |
| Manage API Keys | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## PART 2: BACKGROUND TASKS

FastAPI has built-in BackgroundTasks for simple async operations. For heavy jobs, use Celery.

### When to Use BackgroundTasks (Built-In)
Use for fast, non-critical operations that can run AFTER the response is sent:
- Sending a confirmation email after an order
- Awarding loyalty points
- Writing to an audit log

### When to Use Celery
Use for operations that:
- Take more than 1 second (PDF report generation)
- Need to be retried on failure (webhook delivery)
- Need to be scheduled (nightly inventory valuation report)

### Celery Configuration
- Celery needs a "broker" to store task queues: use **Redis** (same Redis instance you're using for caching).
- Worker processes: Run separately from the FastAPI app.

---

## PART 3: EVENTS — The FastAPI Way

FastAPI doesn't have a built-in event bus like Spring. Use one of:

1. **BackgroundTasks (Simple):** Fire-and-forget async functions after the endpoint returns. Good for emails.
2. **Celery + Redis (Medium):** Persistent task queue with retry logic. Good for webhooks.
3. **Redis Pub/Sub (Advanced):** Publish events to Redis channels. Other services listen. Good for notifications.

### Event Flow Example: Order Placed
```
POST /api/v1/orders completes successfully
    ↓
background_tasks.add_task(send_confirmation_email, order_id, user_email)
background_tasks.add_task(award_loyalty_points, user_id, order_total)
background_tasks.add_task(update_campaign_attribution, promo_code, order_total)
    ↓
Response 201 returned to customer immediately (they don't wait for emails)
    ↓ (async, in background)
Emails sent, points awarded, campaign stats updated
```

---

## PART 4: FILE UPLOADS — Cloudinary Integration

### Why Cloudinary?
- Automatic image optimization (converts to WebP for modern browsers)
- Built-in CDN (fast global delivery)
- No need to manage your own file server
- Free tier handles thousands of product images

### Upload Flow
```
1. Admin uploads image via Admin Panel
2. Frontend sends: POST /api/v1/admin/products/{id}/images
   Content-Type: multipart/form-data
   Body: file=<image binary>
3. FastAPI receives using: file: UploadFile = File(...)
4. Read file bytes: contents = await file.read()
5. Upload to Cloudinary: cloudinary.uploader.upload(contents)
6. Cloudinary returns: { secure_url: "https://res.cloudinary.com/..." }
7. Append URL to product.images[] in PostgreSQL
8. Return updated product
```

---

## PART 5: DATABASE MIGRATIONS WITH ALEMBIC

Alembic manages your database schema versions. Think of it like Git for your database.

### Workflow
```
1. Modify a SQLAlchemy model (add a column, create a table)
2. Run: alembic revision --autogenerate -m "add_loyalty_points_to_users"
   → Creates: alembic/versions/abc123_add_loyalty_points_to_users.py
3. Review the auto-generated migration script
4. Run: alembic upgrade head
   → Applies the migration to PostgreSQL
5. To rollback: alembic downgrade -1
```

### Common Mistake (Junior Developer Warning)
Never modify a migration file after it has been applied to the database. If you need to change something, create a NEW migration.

---

## PART 6: DEPLOYMENT

### Development Setup
```
# Start all services with Docker Compose
docker-compose up -d    # Starts PostgreSQL + Redis in Docker
uvicorn app.main:app --reload --port 8000   # Start FastAPI with hot-reload
```

### docker-compose.yml (Development)
```yaml
version: "3.8"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: atelier_db
      POSTGRES_USER: atelier
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Production Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Run with 4 Gunicorn workers, each running Uvicorn
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### Production Architecture
```
Customer Browser → Nginx (SSL, static files) → FastAPI (Gunicorn + 4 workers)
                                                     ↓
                                               PostgreSQL (Supabase or RDS)
                                                     ↓
                                                   Redis
                                                     ↓
                                                 Cloudinary
```

Deploy to: **Render.com** (easiest), **Railway**, or **AWS ECS**.

---

## PART 7: JUNIOR DEVELOPER GUIDE

### The FastAPI Golden Rules

1. **Always use `async def` for endpoints and CRUD functions.** FastAPI is async — using `def` instead of `async def` blocks the entire server.
2. **Always use Pydantic schemas for input and output.** Never return raw SQLAlchemy model objects — Pydantic serializes them safely.
3. **Use `Depends()` for authentication.** Don't manually check tokens in every endpoint.
4. **Use `async with db.begin()` for multi-step DB operations.** This is the FastAPI equivalent of `@Transactional` in Spring Boot.
5. **Use `HTTPException` for errors.** Don't return `{"error": "..."}` manually — raise `HTTPException(status_code=404, detail="Not found")`.

### Project Startup Checklist (FastAPI)
- [ ] Virtual environment created and activated
- [ ] requirements.txt installed
- [ ] .env file created with DATABASE_URL, JWT_SECRET, CLOUDINARY_URL
- [ ] Docker Compose running (PostgreSQL + Redis)
- [ ] SQLAlchemy models created (user, product, order, inventory)
- [ ] Alembic initialized and first migration run
- [ ] core/security.py with JWT encode/decode and password hashing
- [ ] api/dependencies.py with get_db, get_current_user, verify_admin
- [ ] Auth endpoints working (register + login returning JWT)
- [ ] First protected endpoint tested using /docs Swagger UI

### Testing Your API — Use the Built-In Swagger UI
FastAPI gives you a FREE interactive API tester at:
`http://localhost:8000/docs`

This is FastAPI's biggest advantage for junior developers. You can test every endpoint directly in the browser without needing Postman.
