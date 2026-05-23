# 🎓 PLSP Uniform Checker

A full-stack web application for **Pamantasan ng Lungsod ng San Pablo (PLSP)** students to check the school's uniform and dress code policy.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

---

## 📋 Features

- 🔐 Student registration and JWT-based login
- 📊 Personal dashboard with login history
- 🖼️ Uniform gallery with PLSP dress code policy
- 🐳 Fully containerized with Docker Compose
- ☁️ Deployable to Render (backend) + Vercel (frontend)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Python 3.12, Flask, psycopg2 |
| Database | PostgreSQL 16 |
| Auth | JWT (HS256), PBKDF2-SHA256 password hashing |
| Container | Docker, Docker Compose |
| Tunnel | Cloudflare Tunnel (cloudflared) |

---

## 📁 Project Structure

```
uniform-checker/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx       ← JWT-based API client + auth state
│   ├── data/
│   │   └── uniforms.js           ← PLSP dress code policy data
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── GalleryPage.jsx       ← Uniform gallery
│   └── components/
│       └── Navbar.jsx
├── server/
│   ├── app.py                    ← Flask API + PostgreSQL
│   ├── requirements.txt
│   ├── init_db.sql
│   └── .env.example
├── public/
│   └── images/uniforms/          ← Uniform reference images
├── Dockerfile                    ← Multi-stage build (React + Flask)
├── docker-compose.yml            ← App + DB services
├── vite.config.js                ← /api proxy for local dev
└── .env                          ← VITE_API_URL
```

---

## 🚀 Running Locally with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/uniform-checker.git
cd uniform-checker

# 2. Build and start all services
docker compose up --build

# 3. Open in your browser
# http://localhost:5000
```

That's it! Docker handles the database, backend, and frontend automatically.

To stop:
```bash
docker compose down
```

---

## 🌐 Exposing Locally via Cloudflare Tunnel

To share your local app publicly without deploying:

```bash
# Terminal 1 — keep the app running
docker compose up

# Terminal 2 — expose via Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5000
```

Cloudflare will generate a public HTTPS URL like:
```
https://random-words.trycloudflare.com
```

> ⚠️ The URL changes every time you restart `cloudflared`. Keep both terminals open while sharing.

---

## ☁️ Production Deployment

### Backend → Render.com

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Runtime:** Python
   - **Build Command:** `pip install -r server/requirements.txt`
   - **Start Command:** `python server/app.py`
4. Add environment variables:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Render PostgreSQL URL |
   | `JWT_SECRET` | A long random secret string |
   | `PORT` | `5000` |

5. Your API will be live at `https://your-app.onrender.com`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Vercel auto-detects Vite — confirm settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-app.onrender.com/api` |

5. Your frontend will be live at `https://your-app.vercel.app`

### Database → Render PostgreSQL

1. Go to [render.com](https://render.com) → **New → PostgreSQL**
2. Choose **Free plan**, Region: **Singapore**
3. Copy the **External Database URL** and use it as `DATABASE_URL` above

---

## 🔧 Manual Setup (Without Docker)

### 1. PostgreSQL Database

```bash
psql -U postgres -c "CREATE DATABASE plsp_uniform;"
```

### 2. Backend

```bash
cd server
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET in .env

python3 app.py
# → API running on http://localhost:5000
# → Database tables created automatically
```

### 3. Frontend

```bash
# In the project root
npm install
npm run dev
# → http://localhost:5173
```

> The Vite dev server automatically proxies `/api/*` to `http://localhost:5000`.

---

## 📡 API Reference

### Auth Endpoints

#### `POST /api/auth/register`
```json
{
  "name": "Maria Santos",
  "email": "maria@plsp.edu.ph",
  "username": "maria",
  "password": "secret123"
}
```
**Response:** `201 { "success": true }`

---

#### `POST /api/auth/login`
```json
{ "username": "maria", "password": "secret123" }
```
**Response:**
```json
{
  "token": "eyJ...",
  "account": { "account_id": 1, "username": "maria", "last_login": "..." },
  "student": { "student_id": 1, "name": "Maria Santos", "email": "...", "date_joined": "..." }
}
```

---

#### `GET /api/auth/me` *(requires Bearer token)*
Returns current account and student info.

#### `GET /api/auth/history` *(requires Bearer token)*
Returns last 20 login history entries.

#### `POST /api/auth/logout`
Returns `{ "success": true }` — client drops the token.

#### `GET /api/health`
Returns server and database status.

---

## 🗄️ Database Schema

```sql
students (
  student_id   SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  date_joined  DATE NOT NULL DEFAULT CURRENT_DATE
)

accounts (
  account_id   SERIAL PRIMARY KEY,
  student_id   INTEGER REFERENCES students(student_id),
  username     TEXT NOT NULL UNIQUE,
  pw_hash      TEXT NOT NULL,
  last_login   TIMESTAMPTZ
)

login_history (
  history_id   SERIAL PRIMARY KEY,
  account_id   INTEGER REFERENCES accounts(account_id),
  login_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   TEXT NOT NULL,
  user_agent   TEXT
)
```

> Passwords are stored as `salt:pbkdf2_sha256_hex` — never plain text.

---

## ⚙️ Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:1234@localhost:5432/plsp_uniform` |
| `JWT_SECRET` | Secret key for signing tokens | *(random — set this!)* |
| `PORT` | API server port | `5000` |
| `FLASK_DEBUG` | Enable debug mode (`1` or `0`) | `0` |

### Frontend (`.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `/api` (proxied by Vite) |

---

## 📜 License

For educational use — Pamantasan ng Lungsod ng San Pablo.
