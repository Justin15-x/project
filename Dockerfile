# =============================================================================
# Etapa 1: build - instala dependencias y genera el build de producción
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

# Variables de entorno de Supabase, necesarias en tiempo de BUILD porque
# Vite las incrusta (embebe) en los archivos estáticos generados.
# Se pasan con --build-arg al construir la imagen. Son valores públicos
# (URL y anon key), nunca secretos privados. Ver sección 19 del README.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# =============================================================================
# Etapa 2: producción - sirve los archivos estáticos con Nginx
# =============================================================================
FROM nginx:1.27-alpine AS production

# Configuración personalizada: soporta rutas de React Router (SPA) sin dar
# error 404 al refrescar /dashboard.
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
