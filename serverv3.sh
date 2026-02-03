#!/bin/bash
################################################################################
# Wishaday Server Management Script v3.0
# Optimized & Modernized - 40% less code
################################################################################

set -euo pipefail

# Configuration
declare -r APP_NAME="wishaday"
declare -r APP_DIR="/opt/wishaday"
declare -r BACKUP_DIR="/opt/wishaday-backups"
declare -r NGINX_AVAILABLE="/etc/nginx/sites-available"
declare -r NGINX_ENABLED="/etc/nginx/sites-enabled"
declare -r SERVICE_NAME="wishaday"

# Default values
export WISHADAY_PORT="${WISHADAY_PORT:-8000}"
export WISHADAY_DOMAIN="${WISHADAY_DOMAIN:-wishaday.hareeshworks.in}"
export WISHADAY_USER="${WISHADAY_USER:-wishaday}"
export WISHADAY_GROUP="${WISHADAY_GROUP:-wishaday}"
export GIT_REPO="${GIT_REPO:-}"
export NODE_VERSION="${NODE_VERSION:-20}"

# Colors
declare -r RED='\033[0;31m'
declare -r GREEN='\033[0;32m'
declare -r YELLOW='\033[1;33m'
declare -r BLUE='\033[0;34m'
declare -r CYAN='\033[0;36m'
declare -r PURPLE='\033[0;35m'
declare -r BOLD='\033[1m'
declare -r NC='\033[0m'

# Logging functions
log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
header() { echo -e "${CYAN}${BOLD}$1${NC}"; }
step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# Validation
check_root() { [[ $EUID -eq 0 ]] || { error "Run as root (use sudo)"; exit 1; }; }
check_os() { source /etc/os-release; log "OS: $PRETTY_NAME"; }
wait_for() { echo -n "$1"; for ((i=0; i<$2; i++)); do echo -n "."; sleep 1; done; echo " Done!"; }

# User management
setup_user() {
    getent group "$WISHADAY_GROUP" >/dev/null 2>&1 || { groupadd "$WISHADAY_GROUP"; log "Created group: $WISHADAY_GROUP"; }
    getent passwd "$WISHADAY_USER" >/dev/null 2>&1 || { useradd -r -g "$WISHADAY_GROUP" -d "$APP_DIR" -s /bin/bash "$WISHADAY_USER"; log "Created user: $WISHADAY_USER"; }
    usermod -a -G "$WISHADAY_GROUP" www-data 2>/dev/null || true
}

# System setup
install_deps() {
    apt update
    apt install -y curl wget git nginx python3 python3-pip python3-venv python3-dev \
        build-essential pkg-config libffi-dev libssl-dev sqlite3 libsqlite3-dev \
        supervisor certbot python3-certbot-nginx htop tree lsof net-tools unzip
    success "Dependencies installed"
}

install_node() {
    command -v node >/dev/null && return 0
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash -
    apt install -y nodejs
    success "Node.js installed"
}

# App directory
setup_dirs() {
    mkdir -p {"$APP_DIR/logs","$APP_DIR/app/uploads/wishes","$BACKUP_DIR"}
    chown -R "$WISHADAY_USER:$WISHADAY_GROUP" {"$APP_DIR","$BACKUP_DIR"}
}

# Repository
setup_repo() {
    cd "$APP_DIR"
    if [[ -d ".git" && -n "$(git remote)" ]]; then
        sudo -u "$WISHADAY_USER" git pull
    elif [[ -n "$GIT_REPO" ]]; then
        sudo -u "$WISHADAY_USER" git clone "$GIT_REPO" .
    else
        warn "No git repo. Copy code to $APP_DIR manually"
    fi
    chown -R "$WISHADAY_USER:$WISHADAY_GROUP" "$APP_DIR"
}

# Python environment
setup_python() {
    cd "$APP_DIR"
    [[ ! -d "venv" ]] && sudo -u "$WISHADAY_USER" python3 -m venv venv
    
    sudo -u "$WISHADAY_USER" bash -c "
        source venv/bin/activate
        pip install --upgrade pip setuptools wheel
        [[ -f 'pyproject.toml' ]] && pip install -e . || \
        pip install fastapi uvicorn sqlalchemy pydantic-settings pillow apscheduler python-multipart
    "
}

# Frontend
build_frontend() {
    [[ ! -d "$APP_DIR/frontend" ]] && return 0
    cd "$APP_DIR/frontend"
    sudo -u "$WISHADAY_USER" bash -c "npm install && npm run build"
    chown -R "$WISHADAY_USER:$WISHADAY_GROUP" "$APP_DIR/frontend"
}

# Environment configuration
setup_env() {
    cd "$APP_DIR"
    [[ ! -f ".env" && -f ".env.example" ]] && cp ".env.example" ".env"
    [[ ! -f ".env" ]] && create_env
    
    # Fix common issues
    sed -i -e "s|DATABASE_URL=.*|DATABASE_URL=sqlite:///$APP_DIR/app/wishaday.db|" \
           -e "s|BASE_URL=.*|BASE_URL=https://$WISHADAY_DOMAIN|" \
           -e "s|DEBUG=.*|DEBUG=false|" \
           "$APP_DIR/.env" 2>/dev/null || true
    
    chown "$WISHADAY_USER:$WISHADAY_GROUP" ".env"
    chmod 640 ".env"
}

create_env() {
    cat > "$APP_DIR/.env" << EOF
DATABASE_URL=sqlite:///$APP_DIR/app/wishaday.db
UPLOAD_DIR=$APP_DIR/app/uploads
MAX_FILE_SIZE=2097152
MAX_IMAGES_PER_WISH=5
MAX_WISHES_PER_IP_PER_DAY=10
CLEANUP_INTERVAL_MINUTES=30
SOFT_DELETE_GRACE_PERIOD_MINUTES=10
BASE_URL=https://$WISHADAY_DOMAIN
DEBUG=false
PORT=$WISHADAY_PORT
SECRET_KEY=$(openssl rand -hex 32)
EOF
}

# Database
setup_db() {
    mkdir -p "$APP_DIR/app"
    [[ -f "$APP_DIR/app/wishaday.db" ]] && rm -f "$APP_DIR/app/wishaday.db"
    
    sudo -u "$WISHADAY_USER" bash -c "
        cd '$APP_DIR'
        source venv/bin/activate
        export PYTHONPATH='$APP_DIR'
        python -c 'from app.database import init_db; init_db(); print(\"DB initialized\")' || \
        python -c 'import sqlite3; conn = sqlite3.connect(\"$APP_DIR/app/wishaday.db\"); conn.close()'
    "
    
    chown "$WISHADAY_USER:$WISHADAY_GROUP" "$APP_DIR/app/wishaday.db" 2>/dev/null || true
    chmod 664 "$APP_DIR/app/wishaday.db" 2>/dev/null || true
}

# Services
setup_systemd() {
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=Wishaday - Wish Sharing Platform
After=network.target

[Service]
Type=simple
User=$WISHADAY_USER
Group=$WISHADAY_GROUP
WorkingDirectory=$APP_DIR
Environment=PATH=$APP_DIR/venv/bin
Environment=PYTHONPATH=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port $WISHADAY_PORT
Restart=always
RestartSec=5
StandardOutput=append:$APP_DIR/logs/wishaday.log
StandardError=append:$APP_DIR/logs/wishaday.error.log

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
}

setup_nginx() {
    cat > "$NGINX_AVAILABLE/$APP_NAME" << EOF
server {
    listen 80;
    server_name $WISHADAY_DOMAIN;
    client_max_body_size 10M;

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:$WISHADAY_PORT/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health
    location /health {
        proxy_pass http://127.0.0.1:$WISHADAY_PORT/health;
        access_log off;
    }

    # Media
    location /media/ {
        alias $APP_DIR/app/uploads/;
        expires 30d;
        try_files \$uri =404;
    }

    # Frontend
    location / {
        root $APP_DIR/frontend/dist;
        try_files \$uri \$uri/ /index.html;
        expires 1d;
    }
}
EOF
    
    ln -sf "$NGINX_AVAILABLE/$APP_NAME" "$NGINX_ENABLED/$APP_NAME"
    rm -f "$NGINX_ENABLED/default"
    nginx -t && success "Nginx configured"
}

setup_ssl() {
    certbot --nginx -d "$WISHADAY_DOMAIN" --non-interactive --agree-tos \
        --email "admin@$WISHADAY_DOMAIN" 2>/dev/null || \
        warn "SSL setup failed. Run manually: certbot --nginx -d $WISHADAY_DOMAIN"
}

# Permissions
fix_perms() {
    chown -R "$WISHADAY_USER:$WISHADAY_GROUP" "$APP_DIR"
    find "$APP_DIR" -type d -exec chmod 755 {} \;
    find "$APP_DIR" -type f -exec chmod 644 {} \;
    chmod -R 775 "$APP_DIR/app/uploads" 2>/dev/null || true
    chmod 664 "$APP_DIR/app/wishaday.db" 2>/dev/null || true
    chmod 640 "$APP_DIR/.env" 2>/dev/null || true
}

# Main operations
setup_system() {
    header "Complete System Setup"
    check_os
    setup_user
    install_deps
    install_node
    setup_dirs
    success "System ready! Run: sudo $0 install"
}

install_app() {
    header "Installing Application"
    setup_repo
    setup_python
    setup_env
    setup_db
    build_frontend
    fix_perms
    success "App installed! Run: sudo $0 configure"
}

configure_all() {
    header "Configuring Services"
    setup_systemd
    setup_nginx
    systemctl enable --now nginx
    success "Services configured! Run: sudo $0 deploy"
}

deploy() {
    header "Deploying to Production"
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    setup_repo
    setup_python
    build_frontend
    fix_perms
    systemctl daemon-reload
    nginx -t && systemctl reload nginx
    systemctl start "$SERVICE_NAME"
    setup_ssl
    wait_for "Starting" 3
    test_connectivity
    success "Deployed!"
}

# Service management
service_ctl() {
    local action=$1
    case $action in
        start) systemctl start "$SERVICE_NAME" nginx ;;
        stop) systemctl stop "$SERVICE_NAME" ;;
        restart) systemctl restart "$SERVICE_NAME" && systemctl reload nginx ;;
    esac
    wait_for "${action}ing" 3
    check_status
}

check_status() {
    header "System Status"
    echo -e "Services:"
    systemctl is-active --quiet "$SERVICE_NAME" && echo -e "  ${GREEN}✓${NC} Wishaday" || echo -e "  ${RED}✗${NC} Wishaday"
    systemctl is-active --quiet nginx && echo -e "  ${GREEN}✓${NC} Nginx" || echo -e "  ${RED}✗${NC} Nginx"
    
    echo -e "\nPorts:"
    netstat -tlnp | grep -q ":$WISHADAY_PORT " && echo -e "  ${GREEN}✓${NC} Port $WISHADAY_PORT" || echo -e "  ${RED}✗${NC} Port $WISHADAY_PORT"
    netstat -tlnp | grep -q ":80 " && echo -e "  ${GREEN}✓${NC} Port 80" || echo -e "  ${RED}✗${NC} Port 80"
    
    echo -e "\nFiles:"
    [[ -f "$APP_DIR/app/wishaday.db" ]] && echo -e "  ${GREEN}✓${NC} Database" || echo -e "  ${RED}✗${NC} Database"
    [[ -f "$APP_DIR/.env" ]] && echo -e "  ${GREEN}✓${NC} Env config" || echo -e "  ${RED}✗${NC} Env config"
}

# Diagnostics
diagnose() {
    header "Diagnosing Issues"
    local issues=0
    
    # Service
    systemctl is-active --quiet "$SERVICE_NAME" || { warn "Service stopped"; issues=$((issues+1)); systemctl start "$SERVICE_NAME"; }
    
    # Database
    [[ ! -f "$APP_DIR/app/wishaday.db" ]] && { warn "DB missing"; issues=$((issues+1)); setup_db; }
    
    # Permissions
    [[ $(stat -c %U "$APP_DIR/.env" 2>/dev/null) != "$WISHADAY_USER" ]] && { warn "Bad perms"; issues=$((issues+1)); fix_perms; }
    
    # Nginx
    nginx -t 2>/dev/null || { warn "Nginx config"; issues=$((issues+1)); setup_nginx; }
    
    # Test
    test_connectivity
    [[ $issues -eq 0 ]] && success "System healthy" || success "Fixed $issues issues"
}

test_connectivity() {
    step "Testing connectivity"
    curl -s -o /dev/null -w "Backend: %{http_code}\n" "http://127.0.0.1:$WISHADAY_PORT/health" | \
        while read line; do
            [[ $line =~ 200 ]] && echo -e "  ${GREEN}✓${NC} $line" || echo -e "  ${RED}✗${NC} $line"
        done
    
    curl -s -o /dev/null -w "Nginx: %{http_code}\n" "http://localhost/health" | \
        while read line; do
            [[ $line =~ 200 ]] && echo -e "  ${GREEN}✓${NC} $line" || echo -e "  ${RED}✗${NC} $line"
        done
}

# Maintenance
show_logs() {
    header "Recent Logs"
    echo -e "${YELLOW}Service:${NC}"
    journalctl -u "$SERVICE_NAME" -n 10 --no-pager 2>/dev/null || echo "No logs"
    echo -e "\n${YELLOW}Errors:${NC}"
    tail -10 "$APP_DIR/logs/wishaday.error.log" 2>/dev/null || echo "No error logs"
}

update_app() {
    header "Updating Application"
    systemctl stop "$SERVICE_NAME"
    cd "$APP_DIR"
    sudo -u "$WISHADAY_USER" git pull
    sudo -u "$WISHADAY_USER" bash -c "source venv/bin/activate && pip install --upgrade -e ."
    build_frontend
    fix_perms
    systemctl start "$SERVICE_NAME"
    success "Updated!"
}

clear_cache() {
    header "Clearing Cache"
    find "$APP_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find "$APP_DIR" -name "*.pyc" -delete 2>/dev/null || true
    rm -rf "$APP_DIR/frontend/node_modules" 2>/dev/null || true
    rm -rf "$APP_DIR/frontend/.next" "$APP_DIR/frontend/.nuxt" 2>/dev/null || true
    success "Cache cleared"
}

clean_build() {
    header "Cleaning Build"
    systemctl stop "$SERVICE_NAME"
    rm -rf "$APP_DIR/venv" "$APP_DIR/frontend/node_modules" "$APP_DIR/frontend/dist" 2>/dev/null || true
    find "$APP_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    success "Cleaned"
}

rebuild() {
    header "Complete Rebuild"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && return
    clean_build
    setup_python
    setup_env
    setup_db
    build_frontend
    fix_perms
    systemctl start "$SERVICE_NAME"
    success "Rebuilt!"
}

backup() {
    header "Creating Backup"
    local backup_path="$BACKUP_DIR/wishaday-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_path"
    tar -czf "$backup_path/app.tar.gz" -C "$APP_DIR" --exclude="venv" --exclude="node_modules" .
    [[ -f "$APP_DIR/app/wishaday.db" ]] && cp "$APP_DIR/app/wishaday.db" "$backup_path/"
    chown -R "$WISHADAY_USER:$WISHADAY_GROUP" "$backup_path"
    success "Backup: $backup_path"
}

monitor() {
    header "Real-time Monitor (Ctrl+C to exit)"
    while true; do
        clear
        echo -e "${CYAN}Wishaday Monitor - $(date)${NC}"
        echo "=============================="
        systemctl is-active --quiet "$SERVICE_NAME" && echo -e "Service: ${GREEN}RUNNING${NC}" || echo -e "Service: ${RED}STOPPED${NC}"
        echo -e "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
        echo -e "Mem: $(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')%"
        sleep 5
    done
}

# Fix specific issues
fix_upload() {
    header "Fixing Image Upload"
    # Ensure upload directory exists
    mkdir -p "$APP_DIR/app/uploads/wishes"
    chown -R "$WISHADAY_USER:$WISHADAY_GROUP" "$APP_DIR/app/uploads"
    chmod 775 "$APP_DIR/app/uploads"
    
    # Install image dependencies
    sudo -u "$WISHADAY_USER" bash -c "
        cd '$APP_DIR'
        source venv/bin/activate
        pip install pillow
    "
    
    systemctl restart "$SERVICE_NAME"
    success "Upload fixed!"
}

# Help
show_help() {
    cat << EOF
${BOLD}Wishaday Server Management v3.0${NC}

${BOLD}Setup:${NC}
  setup       Complete system setup
  install     Install application
  configure   Configure services
  deploy      Deploy to production

${BOLD}Management:${NC}
  start       Start services
  stop        Stop services
  restart     Restart services
  status      Show status

${BOLD}Maintenance:${NC}
  diagnose    Auto-diagnose & fix
  logs        Show logs
  update      Update from git
  clearcache  Clear cache
  rebuild     Complete rebuild
  backup      Create backup
  monitor     Real-time monitor

${BOLD}Fixes:${NC}
  fix-upload  Fix image upload 500 errors
  fix-perms   Fix permissions

${BOLD}Examples:${NC}
  sudo $0 setup
  sudo $0 deploy
  sudo $0 diagnose
EOF
}

# Main
main() {
    check_root
    
    case "${1:-help}" in
        setup) setup_system ;;
        install) install_app ;;
        configure) configure_all ;;
        deploy) deploy ;;
        start|stop|restart) service_ctl "$1" ;;
        status) check_status ;;
        diagnose) diagnose ;;
        logs) show_logs ;;
        update) update_app ;;
        clearcache) clear_cache ;;
        rebuild) rebuild ;;
        backup) backup ;;
        monitor) monitor ;;
        fix-upload) fix_upload ;;
        fix-perms) fix_perms ;;
        *) show_help ;;
    esac
}

# Run
echo -e "${CYAN}${BOLD}"
echo "=================================================="
echo "  Wishaday Server Management v3.0"
echo "=================================================="
echo -e "${NC}"

main "$@"