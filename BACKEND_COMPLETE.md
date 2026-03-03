# 🎸 Beach Boys Concert - Fullstack Ticketing App

## ✅ STATUS: FULLY IMPLEMENTED

---

## 📋 Overview

Fullstack concert ticketing app with:
- **Backend:** Golang (Gin + GORM + PostgreSQL)
- **Frontend:** React + TypeScript + Ant Design
- **Auth:** JWT, bcrypt, protected routes

---

## 📁 Project Structure

```
beachboys-concert/
├── backend/
│   ├── cmd/api/
│   │   ├── main.go              ✅ Server entry point & routing
│   │   └── .env                 ⚠️ Create this (not committed)
│   ├── config/
│   │   └── config.go            ✅ Environment configuration
│   ├── internal/
│   │   ├── handlers/auth.go     ✅ HTTP request handlers
│   │   ├── middleware/auth.go   ✅ JWT authentication middleware
│   │   ├── models/user.go       ✅ User model & DTOs
│   │   ├── repository/user_repository.go  ✅ Database operations
│   │   ├── services/auth_service.go       ✅ Business logic
│   │   └── utils/
│   │       ├── jwt.go           ✅ JWT token utilities
│   │       └── password.go      ✅ Password hashing (bcrypt)
│   └── go.mod
│
├── frontend/
│   └── src/
│       ├── App.tsx              ✅ Routes + AuthProvider
│       ├── context/AuthContext.tsx  ✅ Global auth state
│       ├── hooks/useAuth.ts     ✅ Auth hook
│       ├── services/authService.ts  ✅ API client
│       ├── components/
│       │   ├── organisms/Header.tsx   ✅ Login/Profile toggle
│       │   └── pages/
│       │       ├── HomePage.tsx
│       │       ├── LoginPage.tsx     ✅ Connected to API
│       │       ├── RegisterPage.tsx
│       │       ├── ProfilePage.tsx   ✅ User profile + logout
│       │       └── BookTicketPage.tsx
│       └── ...
│
└── BACKEND_COMPLETE.md          📄 This file
```

---

## 🔧 Setup

### Prerequisites

- **Go 1.21+** — https://go.dev/dl/
- **Node.js 18+** — https://nodejs.org/
- **PostgreSQL 15+** — or use Docker

### Step 1: PostgreSQL

**Docker (recommended):**
```bash
docker run --name beachboys-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=beachboys_concert \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Backend .env

Create `backend/cmd/api/.env`:

```env
PORT=5000
ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=beachboys_concert

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h

FRONTEND_URL=http://localhost:3000
```

> ⚠️ **Security:** `.env` is in `.gitignore` and must never be committed. Change `JWT_SECRET` in production!

### Step 3: Run Backend

```bash
cd backend
go mod download
go run cmd/api/main.go
```

Server runs on **http://localhost:5000**

### Step 4: Run Frontend

```bash
cd frontend
npm install
npm start
```

App runs on **http://localhost:3000**

**Optional** — Create `frontend/.env` to override API URL:
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user (Bearer token) |

> **Note:** Logout is client-side only (remove token from localStorage). No backend logout endpoint.

---

## 🔐 Frontend Auth Flow

- **Header:** Shows "Login" when not authenticated, "Profile" when logged in
- **LoginPage:** Calls `/api/auth/login`, stores JWT in localStorage
- **ProfilePage:** Displays user info, logout button (protected, redirects to login if not authenticated)
- **BookTicketPage:** Redirects to login if user tries to checkout without being logged in

---

## 🧪 Quick Test

1. Start backend + frontend
2. Register: http://localhost:3000/register
3. Login: http://localhost:3000/login
4. Profile: http://localhost:3000/profile (when logged in)
5. Book ticket: http://localhost:3000/book-ticket

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to connect to database" | Check PostgreSQL is running, verify `.env` credentials |
| "Port 5000 already in use" | Change `PORT` in `.env` |
| CORS error | Ensure `FRONTEND_URL` in backend `.env` is `http://localhost:3000` |
| Invalid token | Re-login; token expires after 24h default |
| "Email already exists" | Use different email or delete user from DB |

---

## 🗄️ Database

GORM auto-migrates on startup. **Users** table:
- `id` (UUID), `first_name`, `last_name`, `email` (unique), `password` (hashed)
- `created_at`, `updated_at`, `deleted_at`

---

## 📦 Backend Dependencies

- gin-gonic/gin — HTTP framework
- gorm.io/gorm + gorm.io/driver/postgres — ORM
- golang-jwt/jwt — JWT tokens
- golang.org/x/crypto — bcrypt
- gin-contrib/cors — CORS
- joho/godotenv — Environment variables

---

## ✅ Checklist

- [x] Backend auth (register, login, JWT)
- [x] Frontend auth (AuthContext, authService)
- [x] Login/Profile toggle in header
- [x] Profile page with logout
- [x] .env protected (gitignored)
- [x] CORS configured
- [ ] Ticket booking flow (in progress)

---

**Repo:** https://github.com/FineWhale/Ticketing-Concert
