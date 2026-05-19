# ◈ NoteVault

A **production-ready REST API** with JWT authentication, role-based access control (RBAC), and a React frontend — built with Node.js, Express, and PostgreSQL.

---

## 🗂 Project Structure

```
notevault/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection & migration
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/        # DB query layer
│   │   ├── routes/        # Express routers (with Swagger JSDoc)
│   │   ├── utils/         # JWT, logger, response helpers
│   │   └── validators/    # express-validator rules
│   ├── swagger/           # Swagger config
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # NoteCard, NoteModal, ProtectedRoute
│   │   ├── context/       # AuthContext (global auth state)
│   │   ├── pages/         # Login, Register, Dashboard
│   │   └── utils/         # Axios instance with interceptors
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials and a strong JWT_SECRET
npm install
```

### 2. Run Database Migration

```bash
npm run migrate
# Creates: users, notes tables with indexes and triggers
```

### 3. Start Backend

```bash
npm run dev
# API running at http://localhost:5000
# Swagger docs at http://localhost:5000/api/docs
```

### 4. Setup & Start Frontend

```bash
cd ../frontend
npm install
npm start
# UI running at http://localhost:3000
```

---

## 🐳 Docker Deployment

```bash
# From the project root
docker-compose up --build

# Runs:
#   PostgreSQL  → port 5432
#   Backend API → port 5000
#   Frontend    → port 3000
```

After containers start, run the migration once:
```bash
docker exec notevault_backend node src/config/migrate.js
```

---

## 🔐 Authentication & Authorization

### Flow
1. Register → receive JWT token
2. Login → receive JWT token
3. Include token in all protected requests: `Authorization: Bearer <token>`

### Roles
| Role  | Can do                                           |
|-------|--------------------------------------------------|
| user  | CRUD on **own** notes only                       |
| admin | CRUD on **all** notes + manage users             |

### Creating an Admin User
Directly in PostgreSQL after registration:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/v1`  
Full interactive docs: **http://localhost:5000/api/docs**

### Auth Endpoints

| Method | Endpoint             | Auth     | Description            |
|--------|----------------------|----------|------------------------|
| POST   | `/auth/register`     | Public   | Register new user      |
| POST   | `/auth/login`        | Public   | Login, get JWT         |
| GET    | `/auth/me`           | 🔒 Any   | Get current profile    |

### Notes Endpoints

| Method | Endpoint        | Auth     | Description                              |
|--------|-----------------|----------|------------------------------------------|
| GET    | `/notes`        | 🔒 Any   | List notes (paginated, searchable)       |
| POST   | `/notes`        | 🔒 Any   | Create a note                            |
| GET    | `/notes/:id`    | 🔒 Any   | Get note by ID                           |
| PUT    | `/notes/:id`    | 🔒 Owner | Update a note                            |
| DELETE | `/notes/:id`    | 🔒 Owner | Delete a note                            |

### Admin Endpoints

| Method | Endpoint                    | Auth       | Description              |
|--------|-----------------------------|------------|--------------------------|
| GET    | `/admin/users`              | 🔒 Admin   | List all users           |
| PATCH  | `/admin/users/:id/status`   | 🔒 Admin   | Activate / deactivate user |

### Query Parameters (GET /notes)
- `page` — page number (default: 1)
- `limit` — items per page (default: 10, max: 100)
- `search` — full-text search on title and content

---

## 🗄 Database Schema

```sql
-- Users table
users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,         -- bcrypt, 12 rounds
  role          VARCHAR(20) DEFAULT 'user',    -- 'user' | 'admin'
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()      -- auto-updated by trigger
)

-- Notes table
notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  is_pinned  BOOLEAN DEFAULT false,
  tags       TEXT[] DEFAULT '{}',              -- PostgreSQL array
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

-- Indexes: idx_notes_user_id, idx_users_email
```

---

## 🛡 Security Practices

| Practice                | Implementation                                      |
|-------------------------|-----------------------------------------------------|
| Password hashing        | bcryptjs with 12 salt rounds                        |
| JWT signing             | HS256 with issuer claim, configurable expiry        |
| Input validation        | express-validator on every mutating endpoint        |
| Input sanitization      | `.trim()` + `.normalizeEmail()` on all string inputs|
| Rate limiting           | 100 req/15min global; 10 req/15min on auth routes   |
| Security headers        | Helmet.js (CSP, HSTS, X-Frame-Options, etc.)        |
| CORS                    | Whitelist-based, credentials-enabled                |
| Payload size limit      | 10kb max on JSON body                               |
| Fresh user fetch        | User fetched from DB on every authenticated request |

---

## 📈 Scalability Notes

### Current Architecture
- **Connection pooling** — pg Pool with max 20 connections, prevents DB exhaustion
- **Database indexes** — on `user_id` and `email` for O(log n) lookups
- **Auto-updated timestamps** — DB-level triggers, not application code
- **Modular structure** — controllers, models, routes are fully decoupled

### Scaling Path

**Horizontal Scaling**
- Stateless JWT auth → multiple API instances can run behind a load balancer (Nginx/AWS ALB) without shared session state
- PostgreSQL read replicas for read-heavy workloads

**Caching Layer (Redis)**
```
User profile → cache on /auth/me (TTL 5min)
Note lists   → cache per user (invalidate on write)
```

**Microservices Extraction**
```
Auth Service  → manages users and token issuance
Notes Service → manages note CRUD
Gateway       → single entry point, routes to services
```

**Other Improvements**
- Message queues (BullMQ/RabbitMQ) for async tasks (email notifications, exports)
- CDN for static frontend assets
- Kubernetes for container orchestration with auto-scaling
- Centralized logging (Winston → CloudWatch / ELK Stack)

---

## 🧪 Sample Requests (cURL)

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Secret123"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Secret123"}'

# Create Note (replace TOKEN)
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Hello world","tags":["test"]}'

# Get Notes with search
curl "http://localhost:5000/api/v1/notes?search=hello&page=1&limit=5" \
  -H "Authorization: Bearer TOKEN"
```

---

## 🔧 Environment Variables

| Variable        | Description                        | Default         |
|-----------------|------------------------------------|-----------------|
| `PORT`          | Server port                        | 5000            |
| `NODE_ENV`      | Environment                        | development     |
| `DB_HOST`       | PostgreSQL host                    | localhost       |
| `DB_PORT`       | PostgreSQL port                    | 5432            |
| `DB_NAME`       | Database name                      | notevault       |
| `DB_USER`       | Database user                      | postgres        |
| `DB_PASSWORD`   | Database password                  | —               |
| `JWT_SECRET`    | JWT signing secret (min 32 chars)  | —               |
| `JWT_EXPIRES_IN`| JWT expiry duration                | 7d              |
| `FRONTEND_URL`  | CORS allowed origin                | http://localhost:3000 |

---

## 📦 Tech Stack

**Backend**
- Node.js + Express — fast, minimal HTTP server
- PostgreSQL + node-postgres (pg) — relational DB with connection pooling
- bcryptjs — secure password hashing
- jsonwebtoken — JWT generation and verification
- express-validator — declarative input validation
- swagger-jsdoc + swagger-ui-express — auto-generated API docs
- helmet + cors + express-rate-limit — security middleware
- winston — structured logging
- morgan — HTTP request logging

**Frontend**
- React 18 — component-based UI
- React Router v6 — client-side routing
- Axios — HTTP client with interceptors
- react-hot-toast — lightweight notifications

**DevOps**
- Docker + Docker Compose — containerized deployment
- Nginx — static file serving + SPA routing
