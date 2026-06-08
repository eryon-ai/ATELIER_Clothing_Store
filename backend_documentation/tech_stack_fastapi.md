# FastAPI + PostgreSQL Architecture Blueprint
**The Data-Heavy Choice for ATELIER E-Commerce**

This document provides every detail necessary to construct the FastAPI (Python) backend for the ATELIER platform from scratch.

---

## 1. Initial Setup & Dependencies

**Initialization:**
```bash
mkdir atelier-fastapi && cd atelier-fastapi
python -m venv venv
source venv/bin/activate
```

**Core Dependencies (`requirements.txt`):**
```text
fastapi==0.104.1
uvicorn[standard]==0.24.0.post1
sqlalchemy==2.0.23         # Modern SQLAlchemy 2.0
asyncpg==0.29.0            # Async Postgres driver
alembic==1.12.1            # Database migrations
pydantic[email]==2.5.2     # Data validation
python-jose[cryptography]==3.3.0 # JWT generation/verification
passlib[bcrypt]==1.7.4     # Password hashing
python-dotenv==1.0.0
cloudinary==1.36.0         # Image uploads
```
Run `pip install -r requirements.txt`.

---

## 2. Complete Folder Structure

```text
atelier-fastapi/
├── alembic/                 # Migration scripts (auto-generated)
├── alembic.ini
├── app/
│   ├── main.py              # FastAPI app initialization & router inclusion
│   ├── core/
│   │   ├── config.py        # Pydantic BaseSettings for env vars
│   │   ├── security.py      # JWT encoding/decoding, password hashing
│   │   └── database.py      # SQLAlchemy async engine & session maker
│   ├── api/
│   │   ├── dependencies.py  # get_db, get_current_user, verify_admin
│   │   └── v1/
│   │       ├── api.py       # APIRouter gathering all endpoints
│   │       ├── endpoints/
│   │           ├── auth.py
│   │           ├── products.py
│   │           ├── orders.py
│   │           ├── inventory.py
│   │           ├── crm.py
│   │           └── cms.py
│   ├── crud/                # Database query logic
│   │   ├── crud_product.py
│   │   └── crud_order.py
│   ├── models/              # SQLAlchemy Declarative Models
│   │   ├── user.py
│   │   ├── product.py
│   │   └── order.py
│   └── schemas/             # Pydantic Models for Req/Res Validation
│       ├── user.py
│       ├── product.py
│       └── order.py
└── .env
```

---

## 3. Step-by-Step Implementation Details

### Step 1: Database & Migrations (`app/models` & `alembic`)
**1. SQLAlchemy Model (`app/models/product.py`):**
Use SQLAlchemy 2.0 async mapped classes.
```python
from sqlalchemy import Column, String, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
import uuid

class Product(Base):
    __tablename__ = "products"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, index=True)
    price: Mapped[float] = mapped_column(Float)
    variants: Mapped[dict] = mapped_column(JSON, nullable=True) # Postgres JSONB
```

**2. Alembic Migrations:**
Run `alembic init alembic`. Configure `alembic.ini` and `env.py` to point to your `Base.metadata`.
Run `alembic revision --autogenerate -m "init"` and `alembic upgrade head` to push to Postgres.

### Step 2: Validation Schemas (`app/schemas`)
Use Pydantic for request and response validation. This automatically generates beautiful Swagger UI docs.
```python
from pydantic import BaseModel
import uuid

class ProductCreate(BaseModel):
    name: str
    price: float
    variants: dict | None = None

class ProductResponse(ProductCreate):
    id: uuid.UUID

    class Config:
        from_attributes = True # Allows Pydantic to read SQLAlchemy ORM models
```

### Step 3: CRUD Layer (`app/crud`)
Keep your database logic entirely separate from your API endpoints.
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product
from app.schemas.product import ProductCreate

async def create_product(db: AsyncSession, obj_in: ProductCreate) -> Product:
    db_obj = Product(**obj_in.model_dump())
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
```

### Step 4: API Endpoints & Dependencies (`app/api`)
FastAPI relies heavily on Dependency Injection (`Depends`).

**1. Authentication Dependency (`app/api/dependencies.py`):**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    # Decode JWT, fetch User from DB
    # If invalid, raise HTTPException 401
    return user

async def verify_admin(current_user = Depends(get_current_user)):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user
```

**2. Route Definition (`app/api/v1/endpoints/products.py`):**
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import dependencies
from app.schemas.product import ProductResponse, ProductCreate
from app.crud import crud_product

router = APIRouter()

@router.post("/", response_model=ProductResponse)
async def create_product(
    *,
    db: AsyncSession = Depends(dependencies.get_db),
    product_in: ProductCreate,
    current_user = Depends(dependencies.verify_admin) # Protects the route automatically
):
    product = await crud_product.create_product(db=db, obj_in=product_in)
    return product
```

### Step 5: Handling Order Transactions
Because Orders and Inventory must be strictly ACID, handle them in a single async block in the CRUD layer.
```python
async def place_order(db: AsyncSession, order_in: OrderCreate):
    async with db.begin(): # This block acts as a transaction
        # 1. Lock inventory row: await db.execute(select(Inventory).where(...).with_for_update())
        # 2. Update inventory count
        # 3. Insert Order
        # If any exception occurs, async with db.begin() will automatically ROLLBACK
        pass
```

---

## 4. Deployment Strategy
1. **Server:** Use Uvicorn with Gunicorn for production worker management.
   `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
2. **Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```
3. Deploy to **Render** or **Railway** as a Docker service. Point the `DATABASE_URL` env variable to a managed Postgres instance.
