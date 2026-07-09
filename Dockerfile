# ==============================================================================
# Dockerfile — Red Social Frontend
# Multi-stage: build (Vite) → serve (nginx:alpine)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1 — Build the app with Vite
# ------------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2 — Serve with nginx
# ------------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
