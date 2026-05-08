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

COPY --from=builder /srv/node_modules ./node_modules
COPY --from=builder /srv/server/dist ./server/dist
COPY --from=builder /srv/server/src/db/migrations ./server/migrations

EXPOSE 3000

CMD ["node", "server/dist/index.js"]