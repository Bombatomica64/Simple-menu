// WebSocket Manager - Main connection and broadcast management
const WebSocket = require("ws");
const menuService = require("../services/menuService");
const messageRouter = require("./messageRouter");

const clients = new Set();
let wsServer = null;

// Metrics for monitoring
const wsMetrics = {
  totalConnections: 0,
  activeConnections: 0,
  messagesReceived: 0,
  messagesSent: 0,
  errors: 0,
  lastActivity: new Date()
};

// Expose metrics for Prometheus
function getWebSocketMetrics() {
  return {
    ...wsMetrics,
    connectedClients: clients.size
  };
}

// Enhanced broadcast function with error handling
function broadcastInMemoryMenu() {
  const currentMenu = menuService.getCurrentMenu();
  if (!currentMenu) {
    console.warn('⚠️  No current menu to broadcast');
    return;
  }

  const menuToSend = JSON.stringify(currentMenu);
  const deadClients = new Set();
  let successfulBroadcasts = 0;
  
  clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(menuToSend);
        successfulBroadcasts++;
        wsMetrics.messagesSent++;
      } else {
        deadClients.add(client);
      }
    } catch (error) {
      console.error('❌ Error broadcasting to client:', error.message);
      deadClients.add(client);
      wsMetrics.errors++;
    }
  });

  // Clean up dead connections
  if (deadClients.size > 0) {
    deadClients.forEach(client => clients.delete(client));
    wsMetrics.activeConnections = clients.size;
    console.log(`🧹 Cleaned up ${deadClients.size} dead connections. Active: ${clients.size}`);
  }

  if (successfulBroadcasts > 0) {
    console.log(`📡 Broadcasted menu to ${successfulBroadcasts} clients`);
  }
}

// Send message to specific client
function sendToClient(client, message) {
  try {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      wsMetrics.messagesSent++;
    }
  } catch (error) {
    console.error('❌ Error sending message to client:', error.message);
    clients.delete(client);
    wsMetrics.errors++;
  }
}

// Broadcast message to all clients
function broadcastMessage(message) {
  const messageToSend = JSON.stringify(message);
  const deadClients = new Set();
  let successfulBroadcasts = 0;
  
  clients.forEach((client) => {
    try {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageToSend);
        successfulBroadcasts++;
        wsMetrics.messagesSent++;
      } else {
        deadClients.add(client);
      }
    } catch (error) {
      console.error('❌ Error broadcasting message to client:', error.message);
      deadClients.add(client);
      wsMetrics.errors++;
    }
  });

  // Clean up dead connections
  if (deadClients.size > 0) {
    deadClients.forEach(client => clients.delete(client));
    wsMetrics.activeConnections = clients.size;
  }
  
  return successfulBroadcasts;
}

function setupWebSocket(server) {
  wsServer = new WebSocket.Server({ 
    server, 
    path: "/menu-updates",
    clientTracking: true,
    perMessageDeflate: {
      threshold: 1024, // Compress messages larger than 1KB
      serverMaxWindowBits: 13, // Limit memory usage on Pi
    }
  });

  wsServer.on("connection", (ws, request) => {
    const clientIp = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    clients.add(ws);
    wsMetrics.totalConnections++;
    wsMetrics.activeConnections = clients.size;
    wsMetrics.lastActivity = new Date();
    
    console.log(`🔌 WebSocket client connected from ${clientIp}. Active connections: ${clients.size}`);

    // Set up ping/pong for connection health monitoring
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send initial menu data
    const currentMenu = menuService.getCurrentMenu();
    if (currentMenu) {
      try {
        ws.send(JSON.stringify(currentMenu));
        wsMetrics.messagesSent++;
      } catch (error) {
        console.error('❌ Error sending initial menu:', error.message);
        wsMetrics.errors++;
      }
    }

    ws.on("message", async (message) => {
      try {
        wsMetrics.messagesReceived++;
        wsMetrics.lastActivity = new Date();
        
        const parsedMessage = JSON.parse(message);
        console.log(`📨 Received WebSocket message: ${parsedMessage.type} from ${clientIp}`);
        
        // Route message to appropriate handler
        await messageRouter.handleMessage(parsedMessage, ws, {
          broadcastInMemoryMenu,
          sendToClient,
          broadcastMessage
        });
        
      } catch (error) {
        console.error("❌ Error processing WebSocket message:", error);
        wsMetrics.errors++;
        
        // Send error response to client
        try {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process message: ' + error.message
          }));
        } catch (sendError) {
          console.error('❌ Error sending error response:', sendError.message);
        }
      }
    });

    ws.on("close", (code, reason) => {
      clients.delete(ws);
      wsMetrics.activeConnections = clients.size;
      console.log(`🔌 WebSocket client disconnected from ${clientIp}. Code: ${code}, Reason: ${reason}. Active connections: ${clients.size}`);
    });

    ws.on("error", (error) => {
      console.error(`❌ WebSocket error from ${clientIp}:`, error.message);
      clients.delete(ws);
      wsMetrics.activeConnections = clients.size;
      wsMetrics.errors++;
    });
  });

  // Periodic cleanup and health check
  const healthCheckInterval = setInterval(() => {
    const deadClients = new Set();
    
    wsServer.clients.forEach((ws) => {
      if (!ws.isAlive) {
        deadClients.add(ws);
        return;
      }
      
      ws.isAlive = false;
      try {
        ws.ping();
      } catch (error) {
        console.error('❌ Error pinging client:', error.message);
        deadClients.add(ws);
      }
    });
    
    // Clean up dead connections
    deadClients.forEach((ws) => {
      clients.delete(ws);
      try {
        ws.terminate();
      } catch (error) {
        console.error('❌ Error terminating dead connection:', error.message);
      }
    });
    
    if (deadClients.size > 0) {
      wsMetrics.activeConnections = clients.size;
      console.log(`🧹 Health check cleaned up ${deadClients.size} dead connections. Active: ${clients.size}`);
    }
  }, 30000); // Every 30 seconds

  // Cleanup on server shutdown
  wsServer.on('close', () => {
    clearInterval(healthCheckInterval);
    clients.clear();
    console.log('🔌 WebSocket server closed');
  });

  console.log("✅ WebSocket server setup complete on /menu-updates");
  console.log(`📊 WebSocket metrics available at wsMetrics`);
}

module.exports = {
  setupWebSocket,
  broadcastInMemoryMenu,
  sendToClient: (client, message) => sendToClient(client, message),
  broadcastMessage,
  getWebSocketMetrics,
  getClients: () => clients
};
