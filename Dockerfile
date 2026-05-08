# ---------- Builder ----------
FROM node:22-alpine AS builder

WORKDIR /srv

COPY package.json package-lock.json ./
COPY app ./app
COPY server ./server

RUN npm ci

RUN npm run build:server


# ---------- Runtime ----------
FROM node:22-alpine

WORKDIR /srv
ENV NODE_ENV=production

# Copy ONLY what we need from builder
COPY --from=builder /srv/node_modules ./node_modules
COPY --from=builder /srv/server/dist ./dist
COPY --from=builder /srv/server/src/db/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/index.js"]