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
ENV PORT=8083
ENV MONGODB_URI=mongodb://mongo:27017/smart_library
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/config ./config
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/middlewares ./middlewares
COPY --from=builder /app/models ./models
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/utilities ./utilities
COPY --from=builder /app/services ./services
COPY --from=builder /app/index.js ./

EXPOSE 8083

USER node

CMD ["npm", "start"]
