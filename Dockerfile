# ---------- Builder ----------
FROM node:22-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json ./
COPY app ./app
COPY server ./server

RUN npm ci

RUN npm run build:server

# ---------- Runtime ----------
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install ONLY runtime native deps
COPY server/package.runtime.json ./package.json

RUN npm install --omit=dev

# Copy bundled app
COPY --from=builder /build/server/dist ./dist
COPY --from=builder /build/server/src/db/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/index.js"]