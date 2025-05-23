# Smart Library Microservices Application

This application uses Nginx as a reverse proxy to route requests to different microservices based on URL paths.

## Architecture

```
                     ┌─────────────┐
                     │   Nginx     │
                     │ (Port 80)   │
                     └──────┬──────┘
                            │
           ┌────────────────┼─────────────────┐
           │                │                 │
┌──────────▼──────┐ ┌───────▼───────┐ ┌───────▼───────┐
│  /api/users     │ │  /api/books   │ │  /api/loans   │
│ User Service    │ │ Book Service  │ │ Loan Service  │
│  (Port 8081)    │ │  (Port 8082)  │ │  (Port 8083)  │
└─────────────────┘ └───────────────┘ └───────────────┘

           ┌────────────────┐ ┌────────────────┐
           │  /api/stats    │ │  Frontend      │
           │ Stats Service  │ │ Static Files   │
           │  (Port 8084)   │ │      /         │
           └────────────────┘ └────────────────┘
```

## Path-Based Routing

The Nginx configuration routes requests to different microservices based on the URL path:

-   `/api/users/*` → User Service (Port 8081)
-   `/api/books/*` → Book Service (Port 8082)
-   `/api/loans/*` → Loan Service (Port 8083)
-   `/api/stats/*` → Stats Service (Port 8084)
-   `/` → Frontend static files

## Installation

1. Run the installation script:

```bash
./install.sh
```

This script will:

-   Install Nginx if not already installed
-   Install Node.js if not already installed
-   Install npm packages for all services
-   Build the client frontend
-   Set up Nginx configuration

## Starting and Stopping the Application

To start the application:

```bash
./start-all.sh
```

To stop the application:

```bash
./stop-all.sh
```

## Nginx Configuration

The main Nginx configuration file is located at:

```
/home/nahid/Desktop/6th_SEM/DistSys/smart-library/smart-library.conf
```

This file is linked to the Nginx sites-enabled directory during installation.

### Key Features

1. **Path-based Routing**: Routes requests to different services based on URL path
2. **Static File Serving**: Serves the frontend static files from the `/client/dist` directory
3. **Centralized Logging**: Logs all requests to `/var/log/nginx/smart-library-access.log`
4. **Error Handling**: Handles 404 and 50x errors by serving custom error pages

## Logging

Nginx logs are stored at:

-   Access logs: `/var/log/nginx/smart-library-access.log`
-   Error logs: `/var/log/nginx/smart-library-error.log`

You can view the logs with:

```bash
sudo tail -f /var/log/nginx/smart-library-access.log
sudo tail -f /var/log/nginx/smart-library-error.log
```

## Troubleshooting

If you encounter issues:

1. Check Nginx syntax: `sudo nginx -t`
2. Check Nginx status: `sudo systemctl status nginx`
3. Check logs: `sudo tail -f /var/log/nginx/error.log`
4. Restart Nginx: `sudo systemctl restart nginx`
