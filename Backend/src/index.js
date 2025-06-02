// Main application entry point
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");

// Import configuration
const corsMiddleware = require("./config/cors");
const { PORT } = require("./utils/constants");

// Import services
const menuService = require("./services/menuService");

// Import middleware
const { setupWebSocket } = require("./middleware/websocket");

// Import routes
const pastaTypesRoutes = require("./routes/pastaTypes");
const pastaSaucesRoutes = require("./routes/pastaSauces");
const imageManagementRoutes = require("./routes/imageManagement");

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
      
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
      
      // Show all network interfaces
      Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((details) => {
          if (details.family === 'IPv4' && !details.internal) {
            console.log(`LAN access: http://${details.address}:${PORT}`);
            console.log(`WebSocket: ws://${details.address}:${PORT}/menu-updates`);
          }
        });
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();
