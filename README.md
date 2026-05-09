# UniCheck — PLSP Uniform Checker

A full-stack web app for Pamantasan ng Lungsod ng San Pablo students to check the school's uniform and dress code policy.

## Stack

| Layer    | Tech                                |
|----------|-------------------------------------|
| Frontend | React 18, Vite, React Router v6     |
| Backend  | Python 3, Flask, SQLite             |
| Auth     | JWT (HS256), PBKDF2-SHA256 passwords|

---

## Project structure

```
uniform-checker/
├── src/                  # React frontend
│   ├── context/
│   │   └── AuthContext.jsx   ← calls real API
│   ├── data/uniforms.js      ← PLSP policy data
│   └── pages/
├── server/
│   ├── app.py            ← Flask API server
│   ├── uniccheck.db      ← SQLite DB (auto-created on first run)
│   ├── requirements.txt
│   └── start.sh
├── .env                  ← VITE_API_URL (copy from .env.example)
└── vite.config.js        ← proxies /api → localhost:5000 in dev
```

---

## Quick start (local dev)

### 1. Backend

```bash
cd server
# (optional) create a virtual environment
python3 -m venv venv && source venv/bin/activate

pip install flask PyJWT

# start the API (creates uniccheck.db automatically)
python3 app.py
# → running on http://localhost:5000
```

### 2. Frontend

```bash
# in the project root
npm install
npm run dev
# → running on http://localhost:5173
```

The Vite dev server proxies `/api/*` requests to `http://localhost:5000`, so no CORS issues during development.

---

## API reference

### `POST /api/auth/register`

**Body**
```json
{ "name": "Maria Santos", "email": "maria@school.edu", "username": "maria", "password": "secret123" }
```
**Response 201**
```json
{ "success": true }
```

---

### `POST /api/auth/login`

**Body**
```json
{ "username": "maria", "password": "secret123" }
```
**Response 200**
```json
{
  "token": "<jwt>",
  "account": { "account_id": 1, "username": "maria", "last_login": "2025-05-08T..." },
  "student": { "student_id": 1, "name": "Maria Santos", "email": "...", "date_joined": "2025-05-08" }
}
```

---

### `GET /api/auth/me`  *(Bearer token required)*

Returns the current user's account and student info.

---

### `GET /api/auth/history`  *(Bearer token required)*

Returns the last 20 login history entries.

```json
[
  { "history_id": 3, "account_id": 1, "login_time": "...", "ip_address": "...", "user_agent": "..." }
]
```

---

### `POST /api/auth/logout`

Stateless logout (client drops the token). Returns `{ "success": true }`.

---

## Database schema

```sql
students (student_id, name, email, date_joined)
accounts (account_id, student_id, username, pw_hash, last_login)
login_history (history_id, account_id, login_time, ip_address, user_agent)
```

Passwords are stored as `salt:pbkdf2_sha256_hex` — never in plain text.

---

## Environment variables

| Variable     | Default               | Description                    |
|--------------|-----------------------|--------------------------------|
| `JWT_SECRET` | random on each start  | Set a persistent secret in prod|
| `PORT`       | `5000`                | API server port                |

For the frontend, set `VITE_API_URL` in `.env` (copy `.env.example`).
