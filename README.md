# Faraja — Funeral Management Platform

A full-stack funeral/memorial management app with a **React (Vite) frontend** and **Node.js + Express + MySQL backend**.

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| [Laragon](https://laragon.org/download/) **or** [XAMPP](https://www.apachefriends.org/) | Latest | Runs MySQL + management GUI |
| [Node.js](https://nodejs.org/) | 18+ | Runs backend API and frontend dev server |
| Git | Any | Clone the repo |

---

## Setup

### 1. Clone

```bash
git clone <repo-url> faraja
cd faraja
```

### 2. Database

#### XAMPP
1. Open **XAMPP Control Panel** → click **Start** next to **MySQL**
2. Click **Admin** (opens phpMyAdmin)
3. Click **Import** → **Choose File** → select `js/Backend/database/schema.sql`
4. Scroll down → click **Import**

This creates the `faraja_db` database with all tables and seed data.

### 3. Backend

```bash
cd js/Backend
npm install
npm start        # or: npm run dev (auto-restart)
```

You should see:
```
🚀 Faraja API listening on http://localhost:5000
✅ MySQL connected
```

### 4. Frontend

Open a **second terminal** and run:

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

> The Vite dev server proxies `/api` requests to the backend at `http://localhost:5000`, so no CORS issues.

---

## Usage

1. Register an account at `/register`
2. Log in at `/login`
3. Create a memorial from the **Dashboard** → **New Funeral**
4. Browse public memorials at `/memorials`
5. Browse vendors at `/vendors`
6. Make a test donation from any memorial page
7. Manage committee, tasks, financials from the sidebar

---

## Project Structure

```
faraja/
├── client/                        # React SPA (Vite)
│   ├── src/
│   │   ├── api/                   # Axios API modules
│   │   ├── components/ui/         # Reusable UI components
│   │   ├── contexts/              # Auth, Funeral, Toast contexts
│   │   ├── layouts/               # PublicLayout, DashboardLayout, Sidebar
│   │   ├── pages/                 # All route pages
│   │   │   ├── auth/              # Login, Register, Forgot/Reset password
│   │   │   ├── dashboard/         # FuneralDashboard, Tasks, Committee, etc.
│   │   │   ├── memorial/          # Memorial, Donate, MemorialDirectory
│   │   │   ├── vendors/           # VendorDirectory, VendorDetail, VendorDashboard
│   │   │   ├── profile/           # Profile, EditProfile
│   │   │   └── admin/             # AdminDashboard
│   │   └── styles/                # Global CSS
│   ├── vite.config.js             # Vite config with /api proxy
│   └── package.json
├── js/
│   └── Backend/
│       ├── server.js              # Express entry point
│       ├── .env                   # Environment config
│       ├── config/db.js           # MySQL connection pool
│       ├── controllers/           # Route handlers
│       ├── middleware/auth.js     # JWT verification
│       ├── routes/                # Express routers
│       ├── utils/                 # Response helpers
│       └── database/schema.sql    # MySQL schema + seed data
└── README.md
```

---

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `5000` | Backend API port |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_NAME` | `faraja_db` | Created by `schema.sql` |
| `JWT_SECRET` | `change_this_to_a_long_random_string` | **Change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://localhost:3000` | CORS origin — matches Vite dev server |

M-PESA, email, and Google OAuth vars can be left blank for local development.

---

## Troubleshooting

| Symptom | Fix |
|---------|------|
| `ECONNREFUSED` on startup | MySQL is not running — start it in Laragon/XAMPP |
| `ER_BAD_DB_ERROR` | Schema not imported — run `schema.sql` |
| "Could not load" errors in app | Backend not running → `npm start` in `js/Backend` |
| Blank page / broken CSS | Run `npm run build` in `client/` to check for build errors |
| CORS errors | Ensure `CLIENT_URL` in `.env` matches `http://localhost:3000` |
