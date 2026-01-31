#!/bin/bash
################################################################################
# Permission Fix Script for Wishaday Nginx 500 Error
################################################################################

set -e

echo "==========================================="
echo "  Fixing Wishaday Nginx Permissions"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Step 1: Fix parent directory permissions
log_info "Fixing parent directory permissions..."
chmod 755 /opt
chmod 755 /opt/wishaday
chmod 755 /opt/wishaday/frontend
chmod 755 /opt/wishaday/frontend/dist

# Step 2: Fix ownership and permissions for frontend
log_info "Setting frontend ownership to www-data..."
chown -R www-data:www-data /opt/wishaday/frontend/dist
find /opt/wishaday/frontend/dist -type d -exec chmod 755 {} \;
find /opt/wishaday/frontend/dist -type f -exec chmod 644 {} \;

# Step 3: Fix uploads directory
log_info "Setting uploads directory permissions..."
mkdir -p /opt/wishaday/app/uploads
chown -R www-data:www-data /opt/wishaday/app/uploads
chmod 775 /opt/wishaday/app/uploads

# Step 4: Add www-data to wishaday group (if needed)
log_info "Ensuring www-data can access wishaday files..."
usermod -a -G wishaday www-data || true

# Step 5: Check Nginx configuration
log_info "Checking Nginx user configuration..."
nginx_user=$(grep -E "^user " /etc/nginx/nginx.conf | awk '{print $2}' | sed 's/;//')
log_info "Nginx is running as: $nginx_user"

# Step 6: Display permission tree
log_info "Current permissions:"
echo ""
namei -l /opt/wishaday/frontend/dist/index.html
echo ""

# Step 7: Test Nginx config and reload
log_info "Testing Nginx configuration..."
nginx -t

log_info "Reloading Nginx..."
systemctl reload nginx

# Step 8: Restart Wishaday service
log_info "Restarting Wishaday service..."
systemctl restart wishaday

# Step 9: Wait and test
log_info "Waiting 5 seconds for service to start..."
sleep 5

log_info "Testing endpoints..."
echo ""

# Test health endpoint
if curl -s -f http://localhost:8000/health > /dev/null 2>&1; then
    log_success "Backend health check: OK"
else
    log_error "Backend health check: FAILED"
fi

# Test frontend via Nginx
if curl -s -f http://wishaday.hareeshworks.in/ > /dev/null 2>&1; then
    log_success "Frontend via Nginx (HTTP): OK"
else
    log_error "Frontend via Nginx (HTTP): FAILED"
fi

# Test HTTPS if configured
if curl -s -f https://wishaday.hareeshworks.in/ > /dev/null 2>&1; then
    log_success "Frontend via Nginx (HTTPS): OK"
else
    log_error "Frontend via Nginx (HTTPS): FAILED (may need SSL setup)"
fi

echo ""
log_info "Checking Nginx error log for any recent issues..."
echo ""
tail -n 20 /var/log/nginx/error.log

echo ""
echo "==========================================="
echo "  Permission Fix Complete!"
echo "==========================================="
echo ""
echo "If you still see 500 errors, please check:"
echo "  1. sudo tail -f /var/log/nginx/error.log"
echo "  2. sudo journalctl -u wishaday -f"
echo "  3. ls -la /opt/wishaday/frontend/dist/"
echo ""
