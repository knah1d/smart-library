#!/bin/bash

# Smart Library System Docker Build & Run Script

echo "=== Smart Library System - Docker Setup ==="

# Step 1: Create Docker network
echo "Creating Docker network..."
docker network create smart-library-network 2>/dev/null || echo "Network already exists"

# Step 2: Create volume for MongoDB
echo "Creating MongoDB volume..."
docker volume create mongodb-data 2>/dev/null || echo "Volume already exists"

# Step 3: Build all services
echo "Building all service images..."

build_service() {
    local service=$1
    local port=$2
    echo "Building $service (port: $port)..."
    cd "/home/nahid/Desktop/6th_SEM/DistSys/smart-library/$service" || {
        echo "Failed to change directory to $service"
        return 1
    }
    docker build -t "$service:latest" . || {
        echo "Failed to build $service"
        return 1
    }
    echo "Successfully built $service"
    return 0
}

build_service "user-service" 8081
build_service "book-service" 8082
build_service "loan-service" 8083
build_service "stat-service" 8084
build_service "client" 5173

# Step 4: Stop and remove any existing containers
echo "Stopping and removing existing containers..."
docker rm -f mongo user-service book-service loan-service stat-service client 2>/dev/null || echo "No containers to remove"

# Step 5: Run MongoDB
echo "Starting MongoDB..."
docker run -d --name mongo \
  --network smart-library-network \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  mongo:latest || {
    echo "Failed to start MongoDB"
    exit 1
}

sleep 5

# Step 6: Run all services
echo "Starting microservices..."

echo "Starting user-service..."
docker run -d --name user-service \
  --network smart-library-network \
  -p 8081:8081 \
  --restart=unless-stopped \
  -e PORT=8081 \
  -e MONGODB_URI=mongodb://mongo:27017/smart_library \
  -e LOAN_SERVICE_URL=http://loan-service:8083 \
  user-service:latest || {
    echo "Failed to start user-service"
    exit 1
}

echo "Starting book-service..."
docker run -d --name book-service \
  --network smart-library-network \
  -p 8082:8082 \
  --restart=unless-stopped \
  -e PORT=8082 \
  -e MONGODB_URI=mongodb://mongo:27017/smart_library \
  book-service:latest || {
    echo "Failed to start book-service"
    exit 1
}

echo "Starting loan-service..."
docker run -d --name loan-service \
  --network smart-library-network \
  -p 8083:8083 \
  --restart=unless-stopped \
  -e PORT=8083 \
  -e MONGODB_URI=mongodb://mongo:27017/smart_library \
  -e BOOK_SERVICE_URL=http://book-service:8082 \
  -e USER_SERVICE_URL=http://user-service:8081 \
  loan-service:latest || {
    echo "Failed to start loan-service"
    exit 1
}

echo "Starting stat-service..."
docker run -d --name stat-service \
  --network smart-library-network \
  -p 8084:8084 \
  --restart=unless-stopped \
  -e PORT=8084 \
  -e BOOK_SERVICE_URL=http://book-service:8082 \
  -e LOAN_SERVICE_URL=http://loan-service:8083 \
  -e USER_SERVICE_URL=http://user-service:8081 \
  stat-service:latest || {
    echo "Failed to start stat-service"
    exit 1
}

echo "Starting client..."
docker run -d --name client \
  --network smart-library-network \
  -p 5173:5173 \
  --restart=unless-stopped \
  -e VITE_API_BASE_URL=http://localhost \
  client:latest || {
    echo "Failed to start client"
    exit 1
}

# Step 7: Verify all services are running
echo "Verifying services..."
docker ps

# Step 8: Display connection information
echo "==== Smart Library System is now running! ===="
echo "Frontend: http://localhost/client"
echo "API Endpoints:"
echo "  - Users: http://localhost/api/users"
echo "  - Books: http://localhost/api/books"
echo "  - Loans: http://localhost/api/loans"
echo "  - Stats: http://localhost/api/stats"
echo ""
echo "To view logs: docker logs <service-name>"
echo "To stop all: docker stop mongo user-service book-service loan-service stat-service client"
echo ""
echo "==== Setup Complete ===="