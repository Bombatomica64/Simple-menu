// PM2 ecosystem configuration for production deployment
module.exports = {
  apps: [{
    name: 'simple-menu-backend',
    script: './src/index.js',
    instances: 1, // Single instance for Raspberry Pi
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Error handling and restart configuration
    max_memory_restart: '400M', // Restart if memory exceeds 400MB
    min_uptime: '10s', // Consider app unstable if exits within 10s
    max_restarts: 10, // Maximum restart attempts
    restart_delay: 5000, // Delay between restarts (5 seconds)
    
    // Exponential backoff restart strategy
    exp_backoff_restart_delay: 100, // Initial delay for exponential backoff
    
    // Logging configuration
    log_file: '/app/logs/combined.log',
    out_file: '/app/logs/out.log',
    error_file: '/app/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    
    // Health monitoring
    health_check_grace_period: 10000, // Grace period before health checks start
    
    // Process monitoring
    monitoring: false, // Disable PM2 monitoring to save resources on Pi
    
    // Graceful shutdown
    kill_timeout: 5000, // Time to wait before force killing
    listen_timeout: 3000, // Time to wait for app to listen
    
    // Environment-specific settings for Raspberry Pi
    node_args: '--max-old-space-size=384', // Limit Node.js heap to 384MB
    
    // Cron restart (optional - restart daily at 3 AM)
    cron_restart: '0 3 * * *'
  }]
};
