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

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json

RUN npm ci --omit=dev --workspace server

COPY --from=builder /srv/server/dist ./dist
COPY --from=builder /srv/server/src/db/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/index.js"]