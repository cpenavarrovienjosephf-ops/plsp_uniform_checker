import os, time, secrets, hashlib, hmac, traceback
from datetime import datetime, timezone
from flask import Flask, request, jsonify, g
import jwt
import psycopg2
import psycopg2.extras

def load_dotenv(path):
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, val = line.partition('=')
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key and key not in os.environ:   
                    os.environ[key] = val
    except FileNotFoundError:
        pass

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY   = os.environ.get("JWT_SECRET") or secrets.token_hex(32)
TOKEN_TTL    = 60 * 60 * 24 * 7
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/plsp_uniform"
)

print(f"[config] SECRET_KEY set: {'from .env' if os.environ.get('JWT_SECRET') else 'RANDOM — set JWT_SECRET in server/.env!'}")
print(f"[config] SECRET_KEY length: {len(SECRET_KEY)} chars")
print(f"[config] PyJWT version: {jwt.__version__}")

app = Flask(__name__)

# ── CORS ──────────────────────────────────────────────────────────────────────
@app.after_request
def add_cors(response):
    origin = request.headers.get("Origin", "*")
    response.headers["Access-Control-Allow-Origin"]      = origin
    response.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization, X-Requested-With"
    response.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Max-Age"]           = "3600"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
def options_handler(path):
    resp = jsonify({})
    resp.headers["Access-Control-Allow-Origin"]      = request.headers.get("Origin", "*")
    resp.headers["Access-Control-Allow-Headers"]     = "Content-Type, Authorization, X-Requested-With"
    resp.headers["Access-Control-Allow-Methods"]     = "GET, POST, PUT, DELETE, OPTIONS"
    resp.headers["Access-Control-Allow-Credentials"] = "true"
    resp.headers["Access-Control-Max-Age"]           = "3600"
    return resp, 200

# ── DB ────────────────────────────────────────────────────────────────────────
def get_db():
    if "db" not in g:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
        conn.autocommit = True
        g.db = conn
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop("db", None)
    if db and not db.closed:
        db.close()

def query(sql, params=(), one=False):
    cur = get_db().cursor()
    cur.execute(sql, params)
    if one:
        row = cur.fetchone()
        cur.close()
        return dict(row) if row else None
    rows = cur.fetchall()
    cur.close()
    return [dict(r) for r in rows]

def execute(sql, params=()):
    cur = get_db().cursor()
    cur.execute(sql, params)
    try:
        row = cur.fetchone()
        cur.close()
        return dict(row) if row else None
    except Exception:
        cur.close()
        return None

def init_db():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS students (
            student_id   SERIAL PRIMARY KEY,
            name         TEXT   NOT NULL,
            email        TEXT   NOT NULL UNIQUE,
            date_joined  DATE   NOT NULL DEFAULT CURRENT_DATE
        );
        CREATE TABLE IF NOT EXISTS accounts (
            account_id   SERIAL PRIMARY KEY,
            student_id   INTEGER NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
            username     TEXT    NOT NULL UNIQUE,
            pw_hash      TEXT    NOT NULL,
            last_login   TIMESTAMPTZ
        );
        CREATE TABLE IF NOT EXISTS login_history (
            history_id   SERIAL PRIMARY KEY,
            account_id   INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
            login_time   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            ip_address   TEXT NOT NULL,
            user_agent   TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_accounts_username  ON accounts(username);
        CREATE INDEX IF NOT EXISTS idx_history_account_id ON login_history(account_id);
        CREATE INDEX IF NOT EXISTS idx_history_login_time ON login_history(login_time DESC);
    """)
    cur.close()
    conn.close()
    print("✓ Database tables ready.")

# ── Password ──────────────────────────────────────────────────────────────────
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

# ── JWT ───────────────────────────────────────────────────────────────────────
def make_token(account_id: int) -> str:
    payload = {
        "sub": str(account_id),   
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_TTL,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    if isinstance(token, bytes):
        token = token.decode("utf-8")
    return token

def require_auth():
    auth = request.headers.get("Authorization", "")
    print(f"[require_auth] header present: {bool(auth)}, starts Bearer: {auth.startswith('Bearer ')}")

    if not auth.startswith("Bearer "):
        print(f"[require_auth] FAIL — no Bearer prefix. Raw header: {repr(auth[:60])}")
        return None, (jsonify({"error": "Missing token"}), 401)

    raw_token = auth[7:].strip()
    print(f"[require_auth] token prefix: {raw_token[:20]}...")

    try:
        payload = jwt.decode(
            raw_token, SECRET_KEY, algorithms=["HS256"],
            options={"verify_sub": False}
        )
    except jwt.ExpiredSignatureError:
        print("[require_auth] FAIL — token expired")
        return None, (jsonify({"error": "Token expired"}), 401)
    except jwt.InvalidTokenError as e:
        print(f"[require_auth] FAIL — InvalidTokenError: {e}")
        return None, (jsonify({"error": "Invalid token"}), 401)
    except Exception as e:
        print(f"[require_auth] FAIL — unexpected: {e}")
        traceback.print_exc()
        return None, (jsonify({"error": "Invalid token"}), 401)

    account_id = int(payload['sub'])
    print(f"[require_auth] OK — account_id={account_id}")
    acc = query("SELECT * FROM accounts WHERE account_id = %s", (account_id,), one=True)
    if not acc:
        print(f"[require_auth] FAIL — account {account_id} not found in DB")
        return None, (jsonify({"error": "Account not found"}), 401)
    return acc, None

# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/api/health")
def health():
    try:
        row = query("SELECT NOW() AS now", one=True)
        db_ok = str(row["now"])
    except Exception as e:
        db_ok = f"ERROR: {e}"
    return jsonify({"status": "ok", "db": db_ok, "jwt_secret_length": len(SECRET_KEY)})


@app.route("/api/auth/register", methods=["POST"])
def register():
    data     = request.get_json(silent=True) or {}
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

    if query("SELECT 1 FROM accounts WHERE username = %s", (username,)):
        return jsonify({"error": "Username already taken."}), 409
    if query("SELECT 1 FROM students WHERE email = %s", (email,)):
        return jsonify({"error": "Email already registered."}), 409

    try:
        row = execute(
            "INSERT INTO students (name, email) VALUES (%s, %s) RETURNING student_id",
            (name, email)
        )
        execute(
            "INSERT INTO accounts (student_id, username, pw_hash) VALUES (%s, %s, %s)",
            (row["student_id"], username, hash_password(password))
        )
        return jsonify({"success": True}), 201
    except Exception as e:
        print(f"[register] ERROR: {e}")
        traceback.print_exc()
        return jsonify({"error": "Registration failed. Please try again."}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip().lower()
    password = (data.get("password") or "")

    if not username or not password:
        return jsonify({"error": "Username and password required."}), 400

    acc = query("SELECT * FROM accounts WHERE username = %s", (username,), one=True)
    if not acc or not verify_password(password, acc["pw_hash"]):
        return jsonify({"error": "Invalid username or password."}), 401

    now = datetime.now(timezone.utc)
    ip  = (request.headers.get("X-Forwarded-For") or request.remote_addr or "unknown").split(",")[0].strip()
    ua  = request.headers.get("User-Agent", "")

    execute("UPDATE accounts SET last_login = %s WHERE account_id = %s", (now, acc["account_id"]))
    execute(
        "INSERT INTO login_history (account_id, login_time, ip_address, user_agent) VALUES (%s, %s, %s, %s)",
        (acc["account_id"], now, ip, ua)
    )
    print(f"[login] recorded history for account_id={acc['account_id']} ip={ip}")

    stu   = query("SELECT * FROM students WHERE student_id = %s", (acc["student_id"],), one=True)
    token = make_token(acc["account_id"])
    print(f"[login] token type={type(token).__name__} prefix={token[:20]}")

    return jsonify({
        "token": token,
        "account": {
            "account_id": acc["account_id"],
            "username":   acc["username"],
            "last_login": now.isoformat(),
        },
        "student": {
            "student_id":  stu["student_id"],
            "name":        stu["name"],
            "email":       stu["email"],
            "date_joined": str(stu["date_joined"]),
        }
    })


@app.route("/api/auth/me")
def me():
    acc, err = require_auth()
    if err:
        return err
    stu = query("SELECT * FROM students WHERE student_id = %s", (acc["student_id"],), one=True)
    return jsonify({
        "account": {
            "account_id": acc["account_id"],
            "username":   acc["username"],
            "last_login": acc["last_login"].isoformat() if acc["last_login"] else None,
        },
        "student": {
            "student_id":  stu["student_id"],
            "name":        stu["name"],
            "email":       stu["email"],
            "date_joined": str(stu["date_joined"]),
        }
    })


@app.route("/api/auth/history")
def history():
    acc, err = require_auth()
    if err:
        return err
    rows = query(
        "SELECT history_id, account_id, login_time, ip_address, user_agent "
        "FROM login_history WHERE account_id = %s ORDER BY login_time DESC LIMIT 20",
        (acc["account_id"],)
    )
    print(f"[history] account_id={acc['account_id']} → {len(rows)} rows")
    return jsonify([
        {
            "history_id": r["history_id"],
            "account_id": r["account_id"],
            "login_time": r["login_time"].isoformat(),
            "ip_address": r["ip_address"],
            "user_agent": r["user_agent"] or "",
        }
        for r in rows
    ])


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    return jsonify({"success": True})


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", 5000))
    print(f"✓ PLSP Uniform Checker API → http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "0") == "1")
