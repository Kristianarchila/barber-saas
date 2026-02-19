# ─────────────────────────────────────────
# Stage 1: Build con Vite
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Build args para variables de entorno de Vite
ARG VITE_API_URL=/api
ARG VITE_FRONTEND_URL=http://localhost

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Copiar manifests primero (mejor cache)
COPY package.json package-lock.json ./

RUN npm ci

# Copiar código fuente y hacer build
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Servir con Nginx
# ─────────────────────────────────────────
FROM nginx:alpine AS runner

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy Nginx configs (both HTTP and SSL versions)
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-ssl.conf /etc/nginx/conf.d/ssl.conf.template

# Copiar archivos del build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
