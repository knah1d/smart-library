FROM node:18.16.0-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve to run the built app
RUN npm install -g serve

# Expose port
EXPOSE 80

# Set environment variable
ENV VITE_API_BASE_URL=http://localhost

# Start the application
CMD ["serve", "-s", "dist", "-l", "80"]
