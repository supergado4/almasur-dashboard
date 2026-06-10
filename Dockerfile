# ── Stage 1: build frontend ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: API + static frontend ────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY server/package.json ./server/

# Install only production deps (no devDeps, skip scripts)
RUN npm install --omit=dev --ignore-scripts

# Copy server source
COPY server/ ./server/

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "server/index.js"]
