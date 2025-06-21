// Main application entry point
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
const fs = require("fs");

// Import configuration
const corsMiddleware = require("./config/cors");
const { PORT } = require("./utils/constants");

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Import services
const menuService = require("./services/menuService");

// Import middleware
const { setupWebSocket } = require("./websocket/manager");

// Import routes
const pastaTypesRoutes = require("./routes/pastaTypes");
const pastaSaucesRoutes = require("./routes/pastaSauces");
const imageManagementRoutes = require("./routes/imageManagement");
const backgroundsRoutes = require("./routes/backgrounds");
const userPreferencesRoutes = require("./routes/userPreferences");
const displaySettingsRoutes = require("./routes/displaySettings");
const logosRoutes = require("./routes/logos");
const sectionsRoutes = require("./routes/sections");
const slideshowRoutes = require("./routes/slideshow");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Setup middleware
app.use(corsMiddleware);
app.use(bodyParser.json());

// Serve static files from assets folder
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Setup routes
app.use('/pasta-types', pastaTypesRoutes);
app.use('/pasta-sauces', pastaSaucesRoutes);
app.use('/images', imageManagementRoutes);
app.use('/api/backgrounds', backgroundsRoutes);
app.use('/api/user', userPreferencesRoutes);
app.use('/api/menu', displaySettingsRoutes);
app.use('/api/logos', logosRoutes);
app.use('/', sectionsRoutes);
app.use('/api/slideshow', slideshowRoutes);

// Health check endpoint with comprehensive status
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    version: process.version,
    environment: process.env.NODE_ENV || 'development'
  };
  
  // Check database connectivity
  try {
    const currentMenu = menuService.getCurrentMenu();
    healthCheck.database = currentMenu ? 'connected' : 'no_menu_loaded';
  } catch (error) {
    healthCheck.database = 'error';
    healthCheck.status = 'DEGRADED';
  }
  
  res.json(healthCheck);
});

// Setup WebSocket
setupWebSocket(server);

// Initialize application
async function startServer() {
  try {
    // Load initial menu data
    await menuService.loadInitialMenu();
    
    // Start server
    server.listen(PORT, '0.0.0.0', () => {
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      
      console.log(`✅ Simple Menu Backend started successfully`);
      console.log(`📅 Started at: ${new Date().toISOString()}`);
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🏠 Local access: http://localhost:${PORT}`);
      console.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
      console.log(`🔄 Process ID: ${process.pid}`);
      
      // Show all network interfaces
      Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((details) => {
          if (details.family === 'IPv4' && !details.internal) {
            console.log(`🌐 LAN access: http://${details.address}:${PORT}`);
            console.log(`🔌 WebSocket: ws://${details.address}:${PORT}/menu-updates`);
          }
        });
      });
      
      // Set up memory monitoring
      setInterval(() => {
        const memUsage = process.memoryUsage();
        const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        
        if (memUsedMB > 300) { // Warning if memory usage exceeds 300MB
          console.warn(`⚠️  High memory usage detected: ${memUsedMB}MB`);
        }
        
        // Log memory usage every 30 minutes for monitoring
        const now = Date.now();
        if (now % (30 * 60 * 1000) < 10000) {
          console.log(`📊 Memory usage: ${memUsedMB}MB, Uptime: ${Math.round(process.uptime() / 60)}min`);
        }
      }, 10000); // Check every 10 seconds
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error during server shutdown:', err);
      process.exit(1);
    }
    
    console.log('✅ Server closed gracefully');
    
    // Close database connections if needed
    try {
      // Add any cleanup logic here
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
    }
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
}

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  
  // Log to file if possible
  const fs = require('fs');
  const logPath = path.join(__dirname, '../logs/error.log');
  const errorLog = `${new Date().toISOString()} - UNCAUGHT EXCEPTION: ${error.stack}\n`;
  
  try {
    fs.appendFileSync(logPath, errorLog);
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }
  
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  
  // Log to file if possible
  const fs = require('fs');
  const logPath = path.join(__dirname, '../logs/error.log');
  const errorLog = `${new Date().toISOString()} - UNHANDLED REJECTION: ${reason}\n`;
  
  try {
    fs.appendFileSync(logPath, errorLog);
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }
  
  // Don't exit on unhandled rejections, just log them
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle PM2 graceful reload
process.on('SIGUSR2', () => {
  console.log('🔄 Received SIGUSR2, graceful reload...');
  gracefulShutdown('SIGUSR2');
});

// Start the server
startServer();
