# ---------- builder ----------
FROM node:22-alpine AS builder

WORKDIR /srv

# copy full repo (workspace-aware install)
COPY package.json package-lock.json ./
COPY app ./app
COPY server ./server

RUN npm ci

# build ONLY server
RUN npm run build:server


# ---------- runtime ----------
FROM node:22-alpine

WORKDIR /srv

ENV NODE_ENV=production

# only server artifacts
COPY --from=builder /srv/server/package.json ./package.json
COPY --from=builder /srv/server/dist ./dist
COPY --from=builder /srv/server/src/db/migrations ./migrations

RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "dist/index.js"]