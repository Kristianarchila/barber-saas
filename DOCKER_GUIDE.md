# 🐳 Guía de Docker - Barber SaaS

Esta guía explica cómo levantar y gestionar el proyecto utilizando Docker.

## 🚀 Inicio Rápido

1. **Configurar variables de entorno:**
   Asegúrate de tener un archivo `.env` en la raíz del proyecto. Puedes basarte en `.env.docker.example`.
   ```bash
   cp .env.docker.example .env
   # Edita el .env con tus contraseñas
   ```

2. **Levantar los contenedores (Desarrollo/Local):**
   ```bash
   docker compose up -d
   ```
   Esto levantará:
   - **Frontend:** http://localhost (Puerto 80)
   - **Backend:** http://localhost:4000 (Puerto 4000)
   - **MongoDB:** Interno (no expuesto al host por seguridad)

3. **Ver logs:**
   ```bash
   docker compose logs -f backend
   ```

4. **Detener todo:**
   ```bash
   docker compose down
   ```

---

## 🔒 Producción (con SSL/HTTPS)

Para entornos de producción con dominio propio:

1. **Configura el dominio** en tu `.env` (`DOMAIN=tu-dominio.com`).
2. **Genera los certificados** (usa el script de Let's Encrypt si está disponible o configura manualmente).
3. **Levanta con el override de producción:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## 🛠️ Comandos Útiles

- **Reconstruir imágenes:** `docker compose build`
- **Limpiar volúmenes (¡BORRA LA BASE DE DATOS!):** `docker compose down -v`
- **Entrar al contenedor del backend:** `docker exec -it barber-backend sh`
