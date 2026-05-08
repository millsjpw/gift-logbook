# ---------- Base ----------
FROM node:22-alpine AS base

WORKDIR /app

# ---------- Install dependencies from ROOT (workspace-aware) ----------
FROM base AS deps

COPY package.json package-lock.json ./

COPY app ./app
COPY server ./server

RUN npm ci


# ---------- Build server ----------
FROM deps AS builder

WORKDIR /app/server

RUN npm run build


# ---------- Runtime ----------
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/src/db/migrations ./src/db/migrations

EXPOSE 3000

CMD ["node", "dist/index.js"]