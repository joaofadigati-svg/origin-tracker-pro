# Stage 1 — build
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN NITRO_PRESET=node-server npm run build

# Stage 2 — runtime com nginx
FROM node:24-alpine
RUN apk add --no-cache nginx apache2-utils

WORKDIR /app
COPY --from=builder /app/.output ./.output

# Cria usuario e senha para autenticacao basica
RUN htpasswd -cb /etc/nginx/.htpasswd admin '!Claw2020'

# Configuracao nginx
RUN mkdir -p /run/nginx && cat > /etc/nginx/nginx.conf << \'NGINXEOF\'
events {}
http {
    server {
        listen 3000;
        location / {
            auth_basic "Tags Origens";
            auth_basic_user_file /etc/nginx/.htpasswd;
            proxy_pass http://127.0.0.1:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
NGINXEOF

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=4000

# Script de inicializacao
RUN echo -e "#!/bin/sh\nnginx\nnode /app/.output/server/index.mjs" > /start.sh && chmod +x /start.sh

CMD ["/start.sh"]
