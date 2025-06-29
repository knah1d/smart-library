
sudo kill -9 $(sudo lsof -t -i :8081)
sudo kill -9 $(sudo lsof -t -i :8082)
sudo kill -9 $(sudo lsof -t -i :8083)
sudo kill -9 $(sudo lsof -t -i :8084)
sudo kill -9 $(sudo lsof -t -i :27017)
#!/bin/bash

# Smart Library System - Docker & Nginx Startup Script
# This script starts all services using Docker Compose and configures Nginx

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Smart Library System - Complete Startup ===${NC}"

# Step 1: Start Docker services with docker-compose
echo -e "\n${GREEN}Starting Docker services with docker-compose...${NC}"
docker-compose up -d

# Check if docker-compose command was successful
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start Docker services. Please check docker-compose.yml and try again.${NC}"
  exit 1
fi

# Step 2: Configure and restart Nginx
echo -e "\n${GREEN}Configuring Nginx...${NC}"
sudo cp /home/nahid/Desktop/6th_SEM/DistSys/smart-library/nginx/smart-library.conf /etc/nginx/sites-available/ || {
  echo -e "${RED}Failed to copy Nginx configuration.${NC}"
  exit 1
}

# Create symbolic link if it doesn't exist
if [ ! -f /etc/nginx/sites-enabled/smart-library.conf ]; then
  echo -e "${GREEN}Creating symlink for Nginx configuration...${NC}"
  sudo ln -sf /etc/nginx/sites-available/smart-library.conf /etc/nginx/sites-enabled/ || {
    echo -e "${RED}Failed to create Nginx symlink.${NC}"
    exit 1
  }
fi

# Test Nginx configuration
echo -e "\n${GREEN}Testing Nginx configuration...${NC}"
sudo nginx -t
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Nginx configuration is valid.${NC}"
  echo -e "\n${GREEN}Restarting Nginx...${NC}"
  sudo systemctl reload nginx || {
    echo -e "${RED}Failed to reload Nginx.${NC}"
    exit 1
  }
else
  echo -e "${RED}Nginx configuration test failed. Please check your configuration.${NC}"
  exit 1
fi

# Step 3: Wait for services to start up
echo -e "\n${GREEN}Waiting for services to start up...${NC}"
sleep 5

# Step 4: Check if services are running
echo -e "\n${GREEN}Checking Docker service status...${NC}"
docker-compose ps

# Step 5: Test endpoints
echo -e "\n${GREEN}Testing endpoints...${NC}"
for service in "users" "books" "loans" "stats"; do
  echo -ne "Testing ${service} service... "
  curl -s -o /dev/null -w "%{http_code}" http://localhost/api/${service} > /tmp/status.txt
  STATUS=$(cat /tmp/status.txt)
  if [[ "$STATUS" == "200" || "$STATUS" == "404" || "$STATUS" == "401" ]]; then
    echo -e "${GREEN}OK ($STATUS)${NC}"
  else
    echo -e "${RED}Failed ($STATUS)${NC}"
  fi
done

echo -ne "Testing client... "
curl -s -o /dev/null -w "%{http_code}" http://localhost/client > /tmp/status.txt
STATUS=$(cat /tmp/status.txt)
if [[ "$STATUS" == "200" ]]; then
  echo -e "${GREEN}OK ($STATUS)${NC}"
else
  echo -e "${RED}Failed ($STATUS)${NC}"
fi

# Step 6: Display connection information
echo -e "\n${GREEN}==== Smart Library System is now running! ====${NC}"
echo -e "Frontend: ${YELLOW}http://localhost/client${NC}"
echo -e "API Endpoints:"
echo -e "  - Users: ${YELLOW}http://localhost/api/users${NC}"
echo -e "  - Books: ${YELLOW}http://localhost/api/books${NC}"
echo -e "  - Loans: ${YELLOW}http://localhost/api/loans${NC}"
echo -e "  - Stats: ${YELLOW}http://localhost/api/stats${NC}"

echo -e "\n${YELLOW}Management Commands:${NC}"
echo -e "- View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "- View specific service logs: ${GREEN}docker-compose logs -f <service-name>${NC}"
echo -e "- Stop all services: ${GREEN}docker-compose down${NC}"
echo -e "- Restart a specific service: ${GREEN}docker-compose restart <service-name>${NC}"
echo -e "- Check container health: ${GREEN}docker ps${NC}"

echo -e "\n${GREEN}==== Setup Complete ====${NC}"
