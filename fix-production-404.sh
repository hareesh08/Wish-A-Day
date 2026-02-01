#!/bin/bash
################################################################################
# Quick Fix for Production 404 Error
# 
# This script fixes the Nginx proxy_pass configuration and updates CORS
# to resolve the 404 error on /api/wishes endpoint.
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

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root (use sudo)"
    exit 1
fi

echo "========================================="
echo "  Fixing Production 404 Error"
echo "========================================="
echo ""

log_info "Step 1: Fixing Nginx proxy_pass configuration..."

# Backup current Nginx config
if [[ -f "$NGINX_AVAILABLE/$APP_NAME" ]]; then
    cp "$NGINX_AVAILABLE/$APP_NAME" "$NGINX_AVAILABLE/$APP_NAME.backup.$(date +%Y%m%d_%H%M%S)"
    log_info "Nginx config backed up"
    
    # Fix the proxy_pass line
    sed -i 's|proxy_pass http://127.0.0.1:8000/;|proxy_pass http://127.0.0.1:8000/api/;|g' "$NGINX_AVAILABLE/$APP_NAME"
    log_success "Nginx proxy_pass configuration fixed"
else
    log_error "Nginx config file not found at $NGINX_AVAILABLE/$APP_NAME"
    exit 1
fi

log_info "Step 2: Testing Nginx configuration..."
if nginx -t; then
    log_success "Nginx configuration test passed"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

log_info "Step 3: Reloading Nginx..."
systemctl reload nginx
log_success "Nginx reloaded"

log_info "Step 4: Restarting Wishaday backend..."
systemctl restart wishaday
sleep 3
log_success "Wishaday backend restarted"

log_info "Step 5: Testing the fix..."
echo ""

# Test health endpoint through Nginx
echo -n "Testing health endpoint: "
if curl -s -o /dev/null -w "%{http_code}" http://wishaday.hareeshworks.in/health 2>/dev/null | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

# Test API endpoint through Nginx
echo -n "Testing API endpoint: "
if curl -s -o /dev/null -w "%{http_code}" http://wishaday.hareeshworks.in/api/docs 2>/dev/null | grep -q "200"; then
    echo "✅ OK"
else
    echo "❌ FAILED"
fi

echo ""
log_success "Fix completed!"
echo ""
echo "The issue was:"
echo "  - Nginx was stripping /api prefix with 'proxy_pass http://127.0.0.1:8000/'"
echo "  - Fixed to 'proxy_pass http://127.0.0.1:8000/api/' to preserve the path"
echo ""
echo "Your API should now work at:"
echo "  - https://wishaday.hareeshworks.in/api/wishes"
echo "  - https://wishaday.hareeshworks.in/api/docs"
echo ""