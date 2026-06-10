# API-only image — frontend is served as static files by nginx
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY server/package.json ./server/

# Install only production deps (no devDeps, skip scripts)
RUN npm install --omit=dev --ignore-scripts

# Copy server source
COPY server/ ./server/

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "server/index.js"]
