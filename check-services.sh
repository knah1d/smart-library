#!/bin/bash

# Smart Library System - Service Health Check Script
# This script checks if all services in the Smart Library system are running

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Smart Library System - Health Check ===${NC}"

# Check if a port is open
check_port() {
    local port=$1
    local service=$2
    if nc -z localhost "$port" >/dev/null 2>&1; then
        echo -e "✅ ${GREEN}$service is running on port $port${NC}"
        return 0
    else
        echo -e "❌ ${RED}$service is NOT running on port $port${NC}"
        return 1
    fi
}

# Check Docker containers
check_containers() {
    echo -e "\n${YELLOW}Checking Docker containers:${NC}"
    
    # List of services to check
    local services=("mongo" "user-service" "book-service" "loan-service" "stat-service" "client")
    
    for service in "${services[@]}"; do
        if docker ps --format '{{.Names}}' | grep -q "^$service$"; then
            echo -e "✅ ${GREEN}$service container is running${NC}"
        else
            echo -e "❌ ${RED}$service container is NOT running${NC}"
        fi
    done
}

# Check microservice health endpoints
check_api() {
    local url=$1
    local service=$2
    
    echo -e "\nTesting $service API..."
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        echo -e "✅ ${GREEN}$service API is responding (HTTP $response)${NC}"
        return 0
    else
        echo -e "❌ ${RED}$service API returned HTTP $response or is not reachable${NC}"
        return 1
    fi
}

# Main checks
echo -e "\n${YELLOW}Checking service ports:${NC}"
check_port 8081 "User Service"
check_port 8082 "Book Service"
check_port 8083 "Loan Service"
check_port 8084 "Stats Service"
check_port 5173 "Frontend"
check_port 27017 "MongoDB"

# Check Docker containers
check_containers

# Check Nginx
echo -e "\n${YELLOW}Checking Nginx:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "✅ ${GREEN}Nginx is running${NC}"
    
    # Check if smart-library.conf is enabled
    if [ -f /etc/nginx/sites-enabled/smart-library.conf ] || grep -q "smart-library.conf" /etc/nginx/nginx.conf; then
        echo -e "✅ ${GREEN}smart-library.conf appears to be enabled${NC}"
    else
        echo -e "❓ ${YELLOW}smart-library.conf might not be enabled${NC}"
    fi
else
    echo -e "❌ ${RED}Nginx is NOT running${NC}"
fi

# Check API endpoints through Nginx
echo -e "\n${YELLOW}Checking API endpoints through Nginx:${NC}"
check_api "http://localhost/api/users" "Users"
check_api "http://localhost/api/books" "Books"
check_api "http://localhost/api/loans" "Loans"
check_api "http://localhost/api/stats" "Stats"
check_api "http://localhost/client" "Frontend"

echo -e "\n${YELLOW}=== Health Check Complete ===${NC}"

# Provide troubleshooting guidance if there are issues
echo -e "\n${YELLOW}Troubleshooting tips:${NC}"
echo -e "1. To restart a service: ${GREEN}docker restart <service-name>${NC}"
echo -e "2. To view service logs: ${GREEN}docker logs <service-name>${NC}"
echo -e "3. To restart Nginx: ${GREEN}sudo systemctl restart nginx${NC}"
echo -e "4. To check Nginx config: ${GREEN}sudo nginx -t${NC}"
echo -e "5. To start all services: ${GREEN}./start-docker.sh${NC}"
