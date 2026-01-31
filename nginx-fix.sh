#!/bin/bash
################################################################################
# Nginx Configuration Fix Script for Wishaday
# 
# This script fixes the Nginx configuration to properly serve the frontend
# and proxy API requests to the backend.
#
# Usage:
#   chmod +x nginx-fix.sh
#   sudo ./nginx-fix.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="wishaday"
APP_DIR="/opt/wishaday"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

# Default values
WISHADAY_PORT="${WISHADAY_PORT:-8000}"
WISHADAY_DOMAIN="${WISHADAY_DOMAIN:-wishaday.hareeshworks.in}"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check current state
check_state() {
    log_info "Checking current state..."
    
    # Check if frontend dist exists
    if [[ -f "$APP_DIR/frontend/dist/index.html" ]]; then
        log_success "Frontend build found at $APP_DIR/frontend/dist"
        FRONTEND_BUILT=true
    else
        log_warn "Frontend build NOT found at $APP_DIR/frontend/dist"
        log_info "You may need to build the frontend first:"
        log_info "  cd $APP_DIR/frontend && npm install && npm run build"
        FRONTEND_BUILT=false
    fi
    
    # Check backend status
    if curl -s http://localhost:$WISHADAY_PORT/health > /dev/null 2>&1; then
        log_success "Backend is running on port $WISHADAY_PORT"
        BACKEND_RUNNING=true
    else
        log_warn "Backend is NOT running on port $WISHADAY_PORT"
        BACKEND_RUNNING=false
    fi
    
    # Check Nginx status
    if systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
        NGINX_RUNNING=true
    else
        log_warn "Nginx is NOT running"
        NGINX_RUNNING=false
    fi
}

# Fix Nginx configuration
fix_nginx_config() {
    log_info "Fixing Nginx configuration..."
    
    # Backup existing config
    if [[ -f "$NGINX_AVAILABLE/$APP_NAME" ]]; then
        cp "$NGINX_AVAILABLE/$APP_NAME" "$NGINX_AVAILABLE/$APP_NAME.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "Existing config backed up"
    fi
    
    # Create new Nginx configuration
    cat > "$NGINX_AVAILABLE/$APP_NAME" << 'EOF'
server {
    listen 80;
    server_name WISHADAY_DOMAIN_PLACEHOLDER;

    client_max_body_size 10M;

    # API - proxy to backend (more specific paths first)
    location /api/ {
        proxy_pass http://127.0.0.1:WISHADAY_PORT_PLACEHOLDER/;
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
        proxy_pass http://127.0.0.1:WISHADAY_PORT_PLACEHOLDER/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }

    # Media files - serve directly from filesystem for better performance
    location /media/ {
        alias APP_DIR_PLACEHOLDER/app/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri $uri/ =404;
    }

    # Frontend static files - catch-all (must be last)
    location / {
        root APP_DIR_PLACEHOLDER/frontend/dist;
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
EOF

    # Replace placeholders with actual values
    sed -i "s/WISHADAY_DOMAIN_PLACEHOLDER/$WISHADAY_DOMAIN/g" "$NGINX_AVAILABLE/$APP_NAME"
    sed -i "s/WISHADAY_PORT_PLACEHOLDER/$WISHADAY_PORT/g" "$NGINX_AVAILABLE/$APP_NAME"
    sed -i "s|APP_DIR_PLACEHOLDER|$APP_DIR|g" "$NGINX_AVAILABLE/$APP_NAME"
    
    log_success "Nginx configuration updated"
}

# Enable site and test
enable_and_test() {
    log_info "Enabling site and testing configuration..."
    
    # Enable site
    if [[ ! -L "$NGINX_ENABLED/$APP_NAME" ]]; then
        ln -sf "$NGINX_AVAILABLE/$APP_NAME" "$NGINX_ENABLED/$APP_NAME"
        log_info "Site enabled"
    fi
    
    # Remove default site if it exists
    if [[ -f "$NGINX_ENABLED/default" ]]; then
        rm "$NGINX_ENABLED/default"
        log_info "Default site removed"
    fi
    
    # Test Nginx configuration
    if nginx -t; then
        log_success "Nginx configuration test passed"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
    
    # Reload Nginx
    systemctl reload nginx
    log_success "Nginx reloaded"
}

# Fix permissions
fix_permissions() {
    log_info "Fixing permissions..."
    
    # Fix frontend permissions
    if [[ -d "$APP_DIR/frontend/dist" ]]; then
        chown -R www-data:www-data "$APP_DIR/frontend/dist"
        chmod -R 755 "$APP_DIR/frontend/dist"
        log_success "Frontend permissions fixed"
    fi
    
    # Fix uploads permissions
    if [[ -d "$APP_DIR/app/uploads" ]]; then
        chown -R www-data:www-data "$APP_DIR/app/uploads"
        chmod -R 755 "$APP_DIR/app/uploads"
        log_success "Uploads permissions fixed"
    fi
}

# Test the setup
test_setup() {
    log_info "Testing setup..."
    
    echo ""
    echo "=== Testing Endpoints ==="
    
    # Test health endpoint
    echo -n "Health check (/health): "
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$WISHADAY_PORT/health | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
    
    # Test API endpoint
    echo -n "API endpoint (/api/health): "
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$WISHADAY_PORT/health | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
    
    # Test Nginx proxy
    echo -n "Nginx proxy (http://$WISHADAY_DOMAIN/health): "
    if curl -s -o /dev/null -w "%{http_code}" http://$WISHADAY_DOMAIN/health 2>/dev/null | grep -q "200"; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
    
    # Test frontend
    echo -n "Frontend (http://$WISHADAY_DOMAIN/): "
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$WISHADAY_DOMAIN/ 2>/dev/null)
    if [[ "$STATUS" == "200" ]] || [[ "$STATUS" == "301" ]] || [[ "$STATUS" == "302" ]]; then
        echo "✅ OK (HTTP $STATUS)"
    else
        echo "❌ FAILED (HTTP $STATUS)"
    fi
    
    echo ""
}

# Print summary
print_summary() {
    echo ""
    echo "========================================="
    echo "  Nginx Configuration Fix Complete!"
    echo "========================================="
    echo ""
    echo "Configuration Summary:"
    echo "  - Domain: $WISHADAY_DOMAIN"
    echo "  - Backend Port: $WISHADAY_PORT"
    echo "  - Frontend Path: $APP_DIR/frontend/dist"
    echo "  - Uploads Path: $APP_DIR/app/uploads"
    echo ""
    echo "Nginx Configuration File:"
    echo "  $NGINX_AVAILABLE/$APP_NAME"
    echo ""
    echo "Test URLs:"
    echo "  - Health: http://$WISHADAY_DOMAIN/health"
    echo "  - API Docs: http://$WISHADAY_DOMAIN/api/docs"
    echo "  - Frontend: http://$WISHADAY_DOMAIN/"
    echo ""
    echo "Useful Commands:"
    echo "  - Check Nginx config: sudo nginx -t"
    echo "  - Reload Nginx: sudo systemctl reload nginx"
    echo "  - View Nginx error log: sudo tail -f /var/log/nginx/error.log"
    echo "  - View Nginx access log: sudo tail -f /var/log/nginx/access.log"
    echo "  - Restart backend: sudo systemctl restart wishaday"
    echo ""
    echo "========================================="
}

# Main function
main() {
    echo "========================================="
    echo "  Wishaday Nginx Configuration Fix"
    echo "========================================="
    echo ""
    
    # Check root
    check_root
    
    # Get domain if not set
    if [[ "$WISHADAY_DOMAIN" == "wishaday.hareeshworks.in" ]]; then
        read -p "Enter your domain name (default: wishaday.hareeshworks.in): " input_domain
        WISHADAY_DOMAIN="${input_domain:-$WISHADAY_DOMAIN}"
    fi
    
    # Get port if not set
    read -p "Enter backend port (default: 8000): " input_port
    WISHADAY_PORT="${input_port:-$WISHADAY_PORT}"
    
    echo ""
    log_info "Configuration:"
    log_info "  Domain: $WISHADAY_DOMAIN"
    log_info "  Port: $WISHADAY_PORT"
    echo ""
    
    # Run fix steps
    check_state
    fix_nginx_config
    enable_and_test
    fix_permissions
    test_setup
    print_summary
}

# Run main function
main "$@"
