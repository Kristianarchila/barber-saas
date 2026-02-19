# ─────────────────────────────────────────
# Stage 1: Instalar dependencias
# ─────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar manifests primero (mejor cache)
COPY package.json package-lock.json ./

# Instalar solo dependencias de producción
RUN npm ci --omit=dev

# ─────────────────────────────────────────
# Stage 2: Imagen final
# ─────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY src ./src
COPY scripts ./scripts
COPY package.json ./

# Crear directorios necesarios con permisos correctos
RUN mkdir -p logs backups && chown -R appuser:appgroup /app

USER appuser

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
