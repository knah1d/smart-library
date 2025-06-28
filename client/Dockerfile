# Stage 1: Build
FROM node:18.16.0-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Create a simple nginx config that handles SPA routing
RUN echo 'server { \
    listen 5173; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 5173

# Create an entrypoint script to handle environment variables at runtime
RUN echo '#!/bin/sh \
    \
    # Replace environment variables in the main.js file \
    for file in /usr/share/nginx/html/assets/*.js; do \
    if [ -f "$file" ]; then \
    sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL:-http://localhost}|g" "$file" \
    fi \
    done \
    \
    # Start Nginx \
    exec "$@"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
