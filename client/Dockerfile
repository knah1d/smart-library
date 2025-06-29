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
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set environment variable with default value
ENV VITE_API_BASE_URL=http://localhost

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
