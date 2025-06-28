# Stage 1: Build
FROM node:18.16.0-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Runtime
FROM node:18.16.0-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/middlewares ./middlewares
COPY --from=builder /app/models ./models
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/utilities ./utilities
COPY --from=builder /app/index.js ./

# The book service uses port 8082 (as per Nginx config)
EXPOSE 8081

# Create a non-root user and switch to it
USER node

# Start the application
CMD ["npm", "start"]
