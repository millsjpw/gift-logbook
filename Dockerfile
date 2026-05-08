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

COPY server/package.json ./server/package.json

# bring node_modules from workspace install
COPY --from=builder /srv/node_modules ./node_modules

# bring compiled output
COPY --from=builder /srv/server/dist ./server/dist
COPY --from=builder /srv/server/src/db/migrations ./server/migrations

# run from correct package context
WORKDIR /srv/server

EXPOSE 3000

CMD ["node", "dist/index.js"]