#!/bin/bash

REPO="nahid/smartlibrary"

docker build -t $REPO:user-service ./user-service

docker build -t $REPO:book-service ./book-service

docker build -t $REPO:loan-service ./loan-service

docker build -t $REPO:stat-service ./stat-service

docker build -t $REPO:client ./client

echo "All images have been built locally"


# Create docker network
docker network create smartlib-net 2>/dev/null || echo "Network smartlib-net already exists"

# Run user-service
docker run -d --name user-service \
  --network smartlib-net \
  -p 8081:8081 \
  nahid/smartlibrary:user-service

# Run book-service
docker run -d --name book-service \
  --network smartlib-net \
  -p 8082:8082 \
  nahid/smartlibrary:book-service

# Run loan-service
docker run -d --name loan-service \
  --network smartlib-net \
  -p 8083:8083 \
  -e USER_SERVICE_URL=http://user-service:8081 \
  -e BOOK_SERVICE_URL=http://book-service:8082 \
  nahid/smartlibrary:loan-service

# Run stat-service
docker run -d --name stat-service \
  --network smartlib-net \
  -p 8084:8084 \
  -e USER_SERVICE_URL=http://user-service:8081 \
  -e BOOK_SERVICE_URL=http://book-service:8082 \
  -e LOAN_SERVICE_URL=http://loan-service:8083 \
  nahid/smartlibrary:stat-service

# Run client
docker run -d --name client \
  --network smartlib-net \
  -p 5173:5173 \
  nahid/smartlibrary:client

# Run nginx (ensure smart-library.conf exists)
if [ ! -f ./nginx/smart-library.conf ]; then
  echo "Error: ./nginx/smart-library.conf not found."
  exit 1
fi

docker run -d --name nginx \
  --network smartlib-net \
  -p 80:80 \
  -v "$(pwd)/nginx/smart-library.conf:/etc/nginx/conf.d/default.conf:ro" \
  nginx:latest 