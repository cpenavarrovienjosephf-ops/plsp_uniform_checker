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

## 📜 License

For educational use — Pamantasan ng Lungsod ng San Pablo.
