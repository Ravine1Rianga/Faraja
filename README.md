# Faraja — Funeral Management Platform

A self-hosted funeral/memorial harambee management app. Backend is Node.js + Express + MySQL; frontend is vanilla HTML/CSS/JS served directly from the file system.

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| [Laragon](https://laragon.org/download/) **or** [XAMPP](https://www.apachefriends.org/) | Latest | Runs MySQL + management GUI |
| [Node.js](https://nodejs.org/) | 18+ | Runs the backend API |
| Git | Any | Clone the repo |
| Browser | Any | Opens the frontend HTML files |

---

## Setup

### 1. Clone

```bash
git clone <repo-url> faraja
cd faraja
```

### 2. Database

#### Option A — Laragon

1. Open **Laragon** → click **Start All** (MySQL starts on port 3306)
2. Click **Database** → **HeidiSQL** (opens the MySQL console)
3. In HeidiSQL: **File → Load SQL File** → browse to `js/Backend/database/schema.sql`
4. Click **Run** (or press F9)

#### Option B — XAMPP

1. Open **XAMPP Control Panel** → click **Start** next to **MySQL**
2. Click **Admin** next to **MySQL** (opens phpMyAdmin in your browser)
3. In phpMyAdmin: click **Import** tab → **Choose File** → select `js/Backend/database/schema.sql`
4. Scroll to the bottom → click **Import**

Either way, this creates the `faraja` database with all tables and seed data.  
To verify, refresh your database viewer — you should see the `faraja` database with tables: `roles`, `users`, `funeral_projects`, `committee_members`, `tasks`, `contributions`, `transactions`, `expenses`, `password_resets`.

### 3. Backend

```bash
cd js/Backend
npm install
```

The `.env` file is already in the repo — the defaults work out of the box with both Laragon and XAMPP:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=faraja_db

JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

CLIENT_URL=http://127.0.0.1:5500
```

Start:

```bash
npm start          # production
npm run dev        # development (auto-restart on file changes)
```

You should see:

```
🚀 Faraja API listening on http://localhost:5000
✅ MySQL connected
```

### 4. Frontend

Open any `.html` file in the project root directly in your browser.  
**Recommended**: use **Live Server** (VS Code extension) for auto-reload.

The frontend JS in `js/main.js` points to `http://localhost:5000/api` — if your backend runs on a different port, update `API_BASE` there.

---

## Usage Flow

1. Open `register.html` → create an account
2. Open `login.html` → sign in
3. Open `create-funeral.html` → create a memorial
4. Open `committee.html` → add committee members
5. Open `tasks.html` → create tasks on the Kanban board
6. Open `donate.html?id=1` (replace `1` with your funeral's ID) → make a test donation
7. Open `contributions.html` → see contributions, leaderboard, payment breakdown
8. Open `financials.html` → see income, expenses, balance
9. Open `profile.html` → view/edit profile

### Donation notes

- **Card** and **Bank** donations auto-confirm and immediately update the `raised` amount
- **M-PESA** attempts an STK push to the provided phone. For testing without a real M-PESA sandbox, the STK push may fail gracefully — the contribution is still recorded as `pending`. You can manually confirm it in the database or implement the callback endpoint.

---

## Project Structure

```
faraja/
├── *.html                  # Frontend pages
├── css/
│   ├── styles.css          # Global styles
│   └── dashboard.css       # Dashboard layout
├── js/
│   ├── main.js             # API client, auth, shared helpers
│   └── Backend/
│       ├── server.js               # Express entry point
│       ├── .env                     # Environment config
│       ├── config/
│       │   └── db.js               # MySQL connection pool
│       ├── controllers/            # Route handlers
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── funeralController.js
│       │   ├── committeeController.js
│       │   ├── taskController.js
│       │   ├── donationController.js
│       │   └── expenseController.js
│       ├── middleware/
│       │   └── auth.js             # JWT verification
│       ├── routes/                 # Express routers
│       ├── utils/                  # Email, M-PESA, response helpers
│       └── database/
│           └── schema.sql          # Full MySQL schema
```

---

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `5000` | Backend port |
| `DB_HOST` | `localhost` | MySQL host (same for Laragon & XAMPP) |
| `DB_PORT` | `3306` | MySQL port (same for both) |
| `DB_USER` | `root` | Default for Laragon & XAMPP |
| `DB_PASSWORD` | *(empty)* | Default for both — change if you set a MySQL root password in XAMPP |
| `DB_NAME` | `faraja_db` | Created by `schema.sql` |
| `JWT_SECRET` | `change_this_to_a_long_random_string` | **Change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `http://127.0.0.1:5500` | CORS origin — match whatever URL your frontend runs on |

M-PESA, email, and Google OAuth vars can be left blank for local development.

> **XAMPP users**: if you set a MySQL root password in XAMPP, update `DB_PASSWORD` in `.env` to match.

---

## Troubleshooting

| Symptom | Fix |
|---------|------|
| `ECONNREFUSED` on startup | MySQL is not running — in Laragon click **Start All**; in XAMPP click **Start** next to MySQL |
| `ER_BAD_DB_ERROR` | Schema not imported — run `schema.sql` via HeidiSQL (Laragon) or phpMyAdmin (XAMPP) |
| Frontend shows `Could not load memorials` | Backend not running → `npm start` in `js/Backend` |
| `CORS` errors in browser | Check `CLIENT_URL` in `.env` matches your frontend URL |
| `JWT_SECRET` not set | Add `JWT_SECRET=any_random_string` to `.env` |
| phpMyAdmin asks for a password | XAMPP MySQL defaults to root with no password — leave blank and click OK |
