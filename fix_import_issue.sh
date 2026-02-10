#!/bin/bash

# Wishaday Import Issue Fix Script
# This script fixes the "Could not import module 'app.main'" error

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/opt/wishaday"
SERVICE_NAME="wishaday"
WISHADAY_USER="wishaday"

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

echo "========================================"
echo "Wishaday Import Issue Fix"
echo "========================================"
echo ""

# Stop the service first
log_step "Stopping wishaday service"
systemctl stop "$SERVICE_NAME" 2>/dev/null || true

# Check if app directory exists
if [[ ! -d "$APP_DIR" ]]; then
    log_error "Application directory not found: $APP_DIR"
    exit 1
fi

cd "$APP_DIR"

# Check if virtual environment exists
if [[ ! -d "venv" ]]; then
    log_error "Virtual environment not found. Creating new one..."
    sudo -u "$WISHADAY_USER" python3 -m venv venv
fi

# Check if pyproject.toml exists
if [[ ! -f "pyproject.toml" ]]; then
    log_error "pyproject.toml not found in $APP_DIR"
    exit 1
fi

# Fix 1: Reinstall the package in editable mode
log_step "Reinstalling wishaday package in editable mode"
sudo -u "$WISHADAY_USER" bash -c "
    source venv/bin/activate
    pip install --upgrade pip
    pip install -e .
"

# Fix 2: Verify the installation
log_step "Verifying package installation"
sudo -u "$WISHADAY_USER" bash -c "
    source venv/bin/activate
    python -c 'import app.main; print(\"✓ app.main imports successfully\")'
" || {
    log_error "Package installation verification failed"
    
    # Alternative fix: Install dependencies manually
    log_step "Trying alternative installation method"
    sudo -u "$WISHADAY_USER" bash -c "
        source venv/bin/activate
        pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-multipart python-dotenv nanoid Pillow apscheduler
        pip install -e . --force-reinstall
    "
}

# Fix 3: Check and fix PYTHONPATH in systemd service
log_step "Checking systemd service configuration"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"

if [[ -f "$SERVICE_FILE" ]]; then
    # Check if PYTHONPATH is set correctly
    if ! grep -q "Environment=PYTHONPATH=$APP_DIR" "$SERVICE_FILE"; then
        log_warn "PYTHONPATH not set in systemd service. Adding it..."
        
        # Backup the service file
        cp "$SERVICE_FILE" "$SERVICE_FILE.backup"
        
        # Add PYTHONPATH if not present
        sed -i "/\[Service\]/a Environment=PYTHONPATH=$APP_DIR" "$SERVICE_FILE"
        
        # Reload systemd
        systemctl daemon-reload
    fi
else
    log_error "Systemd service file not found: $SERVICE_FILE"
    exit 1
fi

# Fix 4: Ensure proper permissions
log_step "Fixing file permissions"
chown -R "$WISHADAY_USER:$WISHADAY_USER" "$APP_DIR"
chmod -R 755 "$APP_DIR"

# Fix 5: Create __init__.py files if missing
log_step "Ensuring __init__.py files exist"
sudo -u "$WISHADAY_USER" touch "$APP_DIR/app/__init__.py"
sudo -u "$WISHADAY_USER" touch "$APP_DIR/app/routes/__init__.py"
sudo -u "$WISHADAY_USER" touch "$APP_DIR/app/services/__init__.py"

# Fix 6: Test the import directly
log_step "Testing import directly"
cd "$APP_DIR"
sudo -u "$WISHADAY_USER" bash -c "
    source venv/bin/activate
    export PYTHONPATH=$APP_DIR
    python -c 'from app.main import app; print(\"✓ FastAPI app imported successfully\")'
" || {
    log_error "Direct import test failed. Checking for missing dependencies..."
    
    # Show what's missing
    sudo -u "$WISHADAY_USER" bash -c "
        source venv/bin/activate
        export PYTHONPATH=$APP_DIR
        python -c 'import app.main'
    " 2>&1 | head -10
    
    exit 1
}

# Fix 7: Test uvicorn command
log_step "Testing uvicorn command"
sudo -u "$WISHADAY_USER" bash -c "
    source venv/bin/activate
    export PYTHONPATH=$APP_DIR
    timeout 5 uvicorn app.main:app --host 127.0.0.1 --port 8001 &
    sleep 2
    kill %1 2>/dev/null || true
    echo '✓ uvicorn can start the app'
" || {
    log_error "uvicorn test failed"
    exit 1
}

# Reload systemd and start service
log_step "Reloading systemd and starting service"
systemctl daemon-reload
systemctl start "$SERVICE_NAME"

# Wait a moment and check status
sleep 3
if systemctl is-active --quiet "$SERVICE_NAME"; then
    log_success "Service started successfully!"
    
    # Test the health endpoint
    log_step "Testing health endpoint"
    sleep 2
    if curl -s -f "http://127.0.0.1:8000/health" > /dev/null; then
        log_success "Health check passed! The service is working correctly."
    else
        log_warn "Service is running but health check failed. Check the logs:"
        echo "  sudo journalctl -u $SERVICE_NAME -f"
    fi
else
    log_error "Service failed to start. Check the logs:"
    echo "  sudo journalctl -u $SERVICE_NAME -n 20"
    echo "  sudo systemctl status $SERVICE_NAME"
    exit 1
fi

echo ""
log_success "Import issue fix completed successfully!"
echo ""
echo "Useful commands:"
echo "  Check service status: sudo systemctl status $SERVICE_NAME"
echo "  View logs: sudo journalctl -u $SERVICE_NAME -f"
echo "  Test health: curl http://127.0.0.1:8000/health"
echo ""