# Stage 1 — build
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN NITRO_PRESET=node-server npm run build

# Stage 2 — runtime
FROM node:24-alpine

WORKDIR /app
COPY --from=builder /app/.output ./.output

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
