#!/bin/sh
set -e

# Replace API base URL placeholder in JS files
if [ -d "/usr/share/nginx/html/assets" ]; then
  echo "Checking for JS files in assets directory..."
  for file in /usr/share/nginx/html/assets/*.js; do
    if [ -f "$file" ]; then
      echo "Processing $file - replacing VITE_API_BASE_URL_PLACEHOLDER with ${VITE_API_BASE_URL:-http://localhost}"
      sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL:-http://localhost}|g" "$file"
    fi
  done
else
  echo "Warning: /usr/share/nginx/html/assets directory not found"
fi

# Create a default nginx conf if it doesn't exist
if [ ! -f "/etc/nginx/conf.d/default.conf" ]; then
  echo "Creating default nginx configuration..."
  cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
}
EOF
fi

echo "Starting Nginx..."
# Execute the main container command
exec "$@"
