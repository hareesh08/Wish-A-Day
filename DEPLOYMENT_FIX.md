# Wishaday Nginx Deployment Fix

## Problem
The Nginx configuration was not properly set up to serve the frontend static files and proxy API requests to the backend. The frontend was running on port 8080 (Vite dev server) but Nginx was configured to serve static files from `/opt/wishaday/frontend/dist` which didn't exist.

## Solution

### Option 1: Quick Fix (Run the fix script)

1. **Copy the fix script to your server:**
   ```bash
   scp nginx-fix.sh root@your-server:/tmp/
   ```

2. **Run the fix script:**
   ```bash
   ssh root@your-server
   chmod +x /tmp/nginx-fix.sh
   sudo /tmp/nginx-fix.sh
   ```

3. **Build the frontend (if not already built):**
   ```bash
   cd /opt/wishaday/frontend
   npm install
   npm run build
   ```

4. **Fix permissions:**
   ```bash
   sudo chown -R www-data:www-data /opt/wishaday/frontend/dist
   sudo chmod -R 755 /opt/wishaday/frontend/dist
   sudo chown -R www-data:www-data /opt/wishaday/app/uploads
   sudo chmod -R 755 /opt/wishaday/app/uploads
   ```

5. **Restart services:**
   ```bash
   sudo systemctl restart wishaday
   sudo systemctl reload nginx
   ```

### Option 2: Manual Fix

1. **Build the frontend:**
   ```bash
   cd /opt/wishaday/frontend
   npm install
   npm run build
   ```

2. **Update Nginx configuration** (`/etc/nginx/sites-available/wishaday`):

   ```nginx
   server {
       listen 80;
       server_name wishaday.hareeshworks.in;

       client_max_body_size 10M;

       # API - proxy to backend (more specific paths first)
       location /api/ {
           proxy_pass http://127.0.0.1:8000/api/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Health check endpoint
       location /health {
           proxy_pass http://127.0.0.1:8000/health;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           access_log off;
       }

       # Media files - serve directly from filesystem for better performance
       location /media/ {
           alias /opt/wishaday/app/uploads/;
           expires 30d;
           add_header Cache-Control "public, immutable";
           try_files $uri $uri/ =404;
       }

       # Frontend static files - catch-all (must be last)
       location / {
           root /opt/wishaday/frontend/dist;
           try_files $uri $uri/ /index.html;
           expires 1d;
           add_header Cache-Control "public, immutable";
       }

       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   }
   ```

3. **Test and reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Fix permissions:**
   ```bash
   sudo chown -R www-data:www-data /opt/wishaday/frontend/dist
   sudo chmod -R 755 /opt/wishaday/frontend/dist
   sudo chown -R www-data:www-data /opt/wishaday/app/uploads
   sudo chmod -R 755 /opt/wishaday/app/uploads
   ```

## Key Changes Made

1. **Order of location blocks**: API and health endpoints are defined BEFORE the catch-all frontend location
2. **Trailing slashes**: `proxy_pass http://127.0.0.1:8000/` (with trailing slash) to properly handle the `/api/` prefix
3. **Media files**: Now served directly from filesystem using `alias` instead of proxying to backend
4. **Frontend**: Uses `try_files $uri $uri/ /index.html` to support React Router

## Testing

After applying the fix, test these URLs:

```bash
# Test backend directly
curl http://localhost:8000/health

# Test through Nginx
curl http://wishaday.hareeshworks.in/health
curl http://wishaday.hareeshworks.in/api/docs

# Test frontend
curl -I http://wishaday.hareeshworks.in/
```

## Troubleshooting

### 403 Forbidden Error
```bash
# Fix permissions
sudo chown -R www-data:www-data /opt/wishaday/frontend/dist
sudo chmod -R 755 /opt/wishaday/frontend/dist
```

### 502 Bad Gateway Error
```bash
# Check if backend is running
sudo systemctl status wishaday
sudo journalctl -u wishaday -f
```

### 404 Not Found for API
```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Verify backend is responding
curl http://localhost:8000/api/docs
```

### Frontend shows blank page
```bash
# Check if dist folder exists and has files
ls -la /opt/wishaday/frontend/dist/

# Rebuild frontend
cd /opt/wishaday/frontend
npm run build
```

## Architecture Overview

```
User Request
    |
    v
Nginx (port 80)
    |-- /api/* --> Proxy to Backend (port 8000)
    |-- /health --> Proxy to Backend (port 8000)
    |-- /media/* --> Serve from /opt/wishaday/app/uploads/
    |-- /* --> Serve from /opt/wishaday/frontend/dist/
```

## Notes

- The frontend is a React SPA (Single Page Application) built with Vite
- The backend is FastAPI running on port 8000
- Nginx serves as a reverse proxy and static file server
- Media files are served directly by Nginx for better performance
