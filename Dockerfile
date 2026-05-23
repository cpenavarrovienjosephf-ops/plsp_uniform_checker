# ── Stage 1: Build the React frontend ────────────────────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent

COPY index.html vite.config.js .env* ./
COPY src ./src
COPY public ./public

RUN npm run build
# dist/ is now at /app/dist

# ── Stage 2: Python backend that also serves the built frontend ───────────────
FROM python:3.12-slim AS final
WORKDIR /app

# Install dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend
COPY server/app.py ./

# Copy built frontend into /app/static so Flask can serve it
COPY --from=frontend-build /app/dist ./static

# Patch app.py to serve static files from ./static in production
RUN python3 - << 'PYEOF'
import re, os
code = open("app.py").read()

# Add static serving after the Flask app is created
serve_patch = """
import os as _os
from flask import send_from_directory as _sfd

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    static_dir = _os.path.join(_os.path.dirname(__file__), "static")
    full = _os.path.join(static_dir, path)
    if path and _os.path.exists(full) and not _os.path.isdir(full):
        return _sfd(static_dir, path)
    return _sfd(static_dir, "index.html")
"""

# Insert after options_handler function
code = code.replace(
    '@app.route("/api/<path:path>", methods=["OPTIONS"])',
    serve_patch + '\n@app.route("/api/<path:path>", methods=["OPTIONS"])',
    1
)
open("app.py", "w").write(code)
print("Static serving patched in")
PYEOF

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/api/health')" || exit 1

CMD ["python3", "app.py"]
