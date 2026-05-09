"""
UniCheck Backend — Flask + SQLite
Endpoints:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  GET  /api/auth/me          (requires Bearer token)
  GET  /api/auth/history     (requires Bearer token)
"""

import sqlite3, hashlib, hmac, secrets, os, time, json
from datetime import datetime, timezone
from flask import Flask, request, jsonify, g
import jwt

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY   = os.environ.get("JWT_SECRET", secrets.token_hex(32))
DB_PATH      = os.path.join(os.path.dirname(__file__), "uniccheck.db")
TOKEN_TTL    = 60 * 60 * 24 * 7   # 7 days in seconds

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY

# ── CORS (manual, no flask-cors needed) ───────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
def options_handler(path):
    return jsonify({}), 200

# ── DB helpers ────────────────────────────────────────────────────────────────
def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db:
        db.close()

def init_db():
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            student_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            name         TEXT    NOT NULL,
            email        TEXT    NOT NULL UNIQUE,
            date_joined  TEXT    NOT NULL
        );

        CREATE TABLE IF NOT EXISTS accounts (
            account_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id   INTEGER NOT NULL REFERENCES students(student_id),
            username     TEXT    NOT NULL UNIQUE,
            pw_hash      TEXT    NOT NULL,
            last_login   TEXT
        );

        CREATE TABLE IF NOT EXISTS login_history (
            history_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id   INTEGER NOT NULL REFERENCES accounts(account_id),
            login_time   TEXT    NOT NULL,
            ip_address   TEXT    NOT NULL,
            user_agent   TEXT
        );
    """)
    db.commit()
    db.close()

# ── Password utils (stdlib only — no bcrypt) ─────────────────────────────────
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h    = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260_000)
    return f"{salt}:{h.hex()}"

def verify_password(password: str, stored: str) -> bool:
    try:
        salt, h_hex = stored.split(":", 1)
    except ValueError:
        return False
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 260_000)
    return hmac.compare_digest(h.hex(), h_hex)

# ── JWT utils ─────────────────────────────────────────────────────────────────
def make_token(account_id: int) -> str:
    payload = {
        "sub": account_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_TTL,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def require_auth():
    """Returns (account_row, None) or (None, error_response)."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, (jsonify({"error": "Missing token"}), 401)
    token = auth[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"error": "Token expired"}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"error": "Invalid token"}), 401)
    db  = get_db()
    acc = db.execute("SELECT * FROM accounts WHERE account_id=?", (payload["sub"],)).fetchone()
    if not acc:
        return None, (jsonify({"error": "Account not found"}), 401)
    return acc, None

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name     = (data.get("name")     or "").strip()
    email    = (data.get("email")    or "").strip().lower()
    username = (data.get("username") or "").strip().lower()
    password = (data.get("password") or "")

    if not all([name, email, username, password]):
        return jsonify({"error": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400
    if len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters."}), 400

    db = get_db()

    if db.execute("SELECT 1 FROM accounts WHERE username=?", (username,)).fetchone():
        return jsonify({"error": "Username already taken."}), 409
    if db.execute("SELECT 1 FROM students WHERE email=?", (email,)).fetchone():
        return jsonify({"error": "Email already registered."}), 409

    today = datetime.now(timezone.utc).date().isoformat()
    cur   = db.execute(
        "INSERT INTO students (name, email, date_joined) VALUES (?,?,?)",
        (name, email, today)
    )
    student_id = cur.lastrowid
    db.execute(
        "INSERT INTO accounts (student_id, username, pw_hash) VALUES (?,?,?)",
        (student_id, username, hash_password(password))
    )
    db.commit()
    return jsonify({"success": True}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = (data.get("password") or "")

    if not username or not password:
        return jsonify({"error": "Username and password required."}), 400

    db  = get_db()
    acc = db.execute("SELECT * FROM accounts WHERE username=?", (username,)).fetchone()

    if not acc or not verify_password(password, acc["pw_hash"]):
        return jsonify({"error": "Invalid username or password."}), 401

    now = datetime.now(timezone.utc).isoformat()
    db.execute("UPDATE accounts SET last_login=? WHERE account_id=?", (now, acc["account_id"]))

    # record login history
    ip = (request.headers.get("X-Forwarded-For") or request.remote_addr or "unknown").split(",")[0].strip()
    ua = request.headers.get("User-Agent", "")
    db.execute(
        "INSERT INTO login_history (account_id, login_time, ip_address, user_agent) VALUES (?,?,?,?)",
        (acc["account_id"], now, ip, ua)
    )
    db.commit()

    stu = db.execute("SELECT * FROM students WHERE student_id=?", (acc["student_id"],)).fetchone()
    token = make_token(acc["account_id"])

    return jsonify({
        "token": token,
        "account": {
            "account_id": acc["account_id"],
            "username":   acc["username"],
            "last_login": acc["last_login"],
        },
        "student": {
            "student_id":  stu["student_id"],
            "name":        stu["name"],
            "email":       stu["email"],
            "date_joined": stu["date_joined"],
        }
    })


@app.route("/api/auth/me")
def me():
    acc, err = require_auth()
    if err:
        return err
    db  = get_db()
    stu = db.execute("SELECT * FROM students WHERE student_id=?", (acc["student_id"],)).fetchone()
    return jsonify({
        "account": {
            "account_id": acc["account_id"],
            "username":   acc["username"],
            "last_login": acc["last_login"],
        },
        "student": {
            "student_id":  stu["student_id"],
            "name":        stu["name"],
            "email":       stu["email"],
            "date_joined": stu["date_joined"],
        }
    })


@app.route("/api/auth/history")
def history():
    acc, err = require_auth()
    if err:
        return err
    db   = get_db()
    rows = db.execute(
        "SELECT * FROM login_history WHERE account_id=? ORDER BY login_time DESC LIMIT 20",
        (acc["account_id"],)
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    # JWT is stateless; client just drops the token.
    # This endpoint exists so the frontend can call it cleanly.
    return jsonify({"success": True})


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    print(f"UniCheck API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
