#!/bin/bash

# Database Backup and Recovery Script for Simple Menu
# Handles SQLite database backup, restoration, and maintenance

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_PATH="./Backend/prisma/dev.db"
BACKUP_DIR="/home/pi/simple-menu-backups/database"
LOG_FILE="/var/log/simple-menu-db.log"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}${timestamp}${NC} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}${timestamp} [ERROR] ${message}${NC}" | tee -a "$LOG_FILE"
}

# Create backup
create_backup() {
    local backup_name="$1"
    
    log "INFO" "📦 Creating database backup: $backup_name"
    
    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"
    
    # Check if database exists
    if [[ ! -f "$DB_PATH" ]]; then
        log_error "Database file not found: $DB_PATH"
        return 1
    fi
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${backup_name}_${timestamp}.db"
    local backup_sql="$BACKUP_DIR/${backup_name}_${timestamp}.sql"
    
    # Create binary backup
    cp "$DB_PATH" "$backup_file"
    
    # Create SQL dump for portability
    if command -v sqlite3 >/dev/null 2>&1; then
        sqlite3 "$DB_PATH" .dump > "$backup_sql"
        
        # Compress SQL dump
        gzip "$backup_sql"
        backup_sql="${backup_sql}.gz"
    fi
    
    # Create backup manifest
    {
        echo "Database Backup Manifest"
        echo "========================"
        echo "Backup created: $(date)"
        echo "Source database: $DB_PATH"
        echo "Binary backup: $backup_file"
        [[ -f "$backup_sql" ]] && echo "SQL dump: $backup_sql"
        echo "Database size: $(du -h "$DB_PATH" | cut -f1)"
        echo "Backup size: $(du -h "$backup_file" | cut -f1)"
        
        # Get table information
        echo ""
        echo "Database Schema:"
        echo "================"
        sqlite3 "$DB_PATH" ".tables" 2>/dev/null || echo "Unable to read tables"
        
        echo ""
        echo "Record Counts:"
        echo "=============="
        for table in $(sqlite3 "$DB_PATH" ".tables" 2>/dev/null); do
            count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "ERROR")
            echo "$table: $count"
        done
        
    } > "$backup_file.manifest"
    
    log "INFO" "✅ Backup created successfully"
    log "INFO" "  📁 Binary: $backup_file"
    [[ -f "$backup_sql" ]] && log "INFO" "  📄 SQL: $backup_sql"
    log "INFO" "  📋 Manifest: $backup_file.manifest"
    
    return 0
}

# List available backups
list_backups() {
    log "INFO" "📋 Available database backups:"
    
    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        log "INFO" "No backups found in $BACKUP_DIR"
        return 0
    fi
    
    echo
    printf "%-30s %-20s %-10s\n" "Backup File" "Date" "Size"
    echo "================================================================"
    
    for backup in "$BACKUP_DIR"/*.db; do
        if [[ -f "$backup" ]]; then
            local filename=$(basename "$backup")
            local date=$(stat -c %y "$backup" 2>/dev/null | cut -d' ' -f1,2 | cut -d'.' -f1)
            local size=$(du -h "$backup" | cut -f1)
            printf "%-30s %-20s %-10s\n" "$filename" "$date" "$size"
        fi
    done
    echo
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log "INFO" "🔄 Restoring database from backup: $backup_file"
    
    # Create backup of current database
    if [[ -f "$DB_PATH" ]]; then
        local current_backup="$BACKUP_DIR/pre-restore-$(date +%Y%m%d_%H%M%S).db"
        cp "$DB_PATH" "$current_backup"
        log "INFO" "Current database backed up to: $current_backup"
    fi
    
    # Stop application before restore
    log "INFO" "Stopping application..."
    docker-compose down
    
    # Restore database
    cp "$backup_file" "$DB_PATH"
    
    # Verify restored database
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "INFO" "✅ Database integrity check passed"
    else
        log_error "❌ Database integrity check failed"
        return 1
    fi
    
    # Restart application
    log "INFO" "Starting application..."
    docker-compose up -d
    
    log "INFO" "✅ Database restore completed successfully"
    return 0
}

# Database maintenance
maintain_database() {
    log "INFO" "🔧 Performing database maintenance"
    
    if [[ ! -f "$DB_PATH" ]]; then
        log_error "Database file not found: $DB_PATH"
        return 1
    fi
    
    # Create maintenance backup
    create_backup "maintenance"
    
    # Run VACUUM to optimize database
    log "INFO" "Running VACUUM to optimize database..."
    if sqlite3 "$DB_PATH" "VACUUM;"; then
        log "INFO" "✅ Database vacuum completed"
    else
        log_error "❌ Database vacuum failed"
        return 1
    fi
    
    # Analyze database for query optimization
    log "INFO" "Running ANALYZE for query optimization..."
    if sqlite3 "$DB_PATH" "ANALYZE;"; then
        log "INFO" "✅ Database analysis completed"
    else
        log_error "❌ Database analysis failed"
        return 1
    fi
    
    # Check integrity
    log "INFO" "Checking database integrity..."
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "INFO" "✅ Database integrity check passed"
    else
        log_error "❌ Database integrity check failed"
        return 1
    fi
    
    # Display database statistics
    echo
    echo "Database Statistics:"
    echo "==================="
    echo "File size: $(du -h "$DB_PATH" | cut -f1)"
    echo "Page count: $(sqlite3 "$DB_PATH" "PRAGMA page_count;")"
    echo "Page size: $(sqlite3 "$DB_PATH" "PRAGMA page_size;") bytes"
    echo "Free pages: $(sqlite3 "$DB_PATH" "PRAGMA freelist_count;")"
    echo "Encoding: $(sqlite3 "$DB_PATH" "PRAGMA encoding;")"
    echo
    
    log "INFO" "✅ Database maintenance completed"
    return 0
}

# Cleanup old backups
cleanup_backups() {
    log "INFO" "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)"
    
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "INFO" "No backup directory found"
        return 0
    fi
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        rm -f "$file"
        deleted_count=$((deleted_count + 1))
        log "INFO" "Deleted old backup: $(basename "$file")"
    done < <(find "$BACKUP_DIR" -name "*.db" -type f -mtime +$RETENTION_DAYS -print0 2>/dev/null)
    
    # Also delete associated files (SQL dumps and manifests)
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.manifest" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
    
    if [[ $deleted_count -gt 0 ]]; then
        log "INFO" "✅ Cleaned up $deleted_count old backup files"
    else
        log "INFO" "No old backups to clean up"
    fi
    
    return 0
}

# Verify database
verify_database() {
    log "INFO" "🔍 Verifying database health"
    
    if [[ ! -f "$DB_PATH" ]]; then
        log_error "Database file not found: $DB_PATH"
        return 1
    fi
    
    # Check file permissions
    if [[ ! -r "$DB_PATH" ]]; then
        log_error "Database file is not readable"
        return 1
    fi
    
    if [[ ! -w "$DB_PATH" ]]; then
        log_error "Database file is not writable"
        return 1
    fi
    
    # Check if file is empty
    if [[ ! -s "$DB_PATH" ]]; then
        log_error "Database file is empty"
        return 1
    fi
    
    # Check if it's a valid SQLite database
    if ! sqlite3 "$DB_PATH" "SELECT sqlite_version();" >/dev/null 2>&1; then
        log_error "File is not a valid SQLite database"
        return 1
    fi
    
    # Integrity check
    local integrity_result=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;")
    if [[ "$integrity_result" != "ok" ]]; then
        log_error "Database integrity check failed: $integrity_result"
        return 1
    fi
    
    # Check if application tables exist
    local tables=$(sqlite3 "$DB_PATH" ".tables" 2>/dev/null)
    if [[ -z "$tables" ]]; then
        log_error "No tables found in database"
        return 1
    fi
    
    log "INFO" "✅ Database verification passed"
    log "INFO" "Tables found: $tables"
    
    return 0
}

# Show usage
show_usage() {
    echo "Simple Menu Database Management Script"
    echo "====================================="
    echo
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo
    echo "Commands:"
    echo "  backup [NAME]     Create a database backup (default name: manual)"
    echo "  restore FILE      Restore database from backup file"
    echo "  list             List available backups"
    echo "  maintain         Perform database maintenance (VACUUM, ANALYZE)"
    echo "  verify           Verify database health and integrity"
    echo "  cleanup          Remove old backups (older than $RETENTION_DAYS days)"
    echo "  auto-backup      Create automated backup (for cron)"
    echo
    echo "Examples:"
    echo "  $0 backup pre-update"
    echo "  $0 restore /home/pi/simple-menu-backups/database/manual_20240101_120000.db"
    echo "  $0 maintain"
    echo "  $0 cleanup"
    echo
}

# Setup log file
setup_logging() {
    sudo mkdir -p "$(dirname "$LOG_FILE")"
    sudo touch "$LOG_FILE"
    sudo chown "$(whoami):$(whoami)" "$LOG_FILE" 2>/dev/null || true
}

# Main function
main() {
    local command="${1:-help}"
    
    # Setup logging
    setup_logging
    
    # Change to script directory
    cd "$SCRIPT_DIR"
    
    case "$command" in
        backup)
            local backup_name="${2:-manual}"
            create_backup "$backup_name"
            ;;
        auto-backup)
            create_backup "auto"
            cleanup_backups
            ;;
        restore)
            local backup_file="${2:-}"
            if [[ -z "$backup_file" ]]; then
                log_error "Please specify backup file to restore"
                show_usage
                exit 1
            fi
            restore_backup "$backup_file"
            ;;
        list)
            list_backups
            ;;
        maintain)
            maintain_database
            ;;
        verify)
            verify_database
            ;;
        cleanup)
            cleanup_backups
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
