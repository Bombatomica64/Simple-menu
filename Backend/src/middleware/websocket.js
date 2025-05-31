// WebSocket middleware for real-time menu updates
const WebSocket = require("ws");
const menuService = require("../services/menuService");

const clients = new Set();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: "/menu-updates" });

  function broadcastInMemoryMenu() {
    const currentMenu = menuService.getCurrentMenu();
    if (!currentMenu) return;
    
    const menuToSend = JSON.stringify(currentMenu);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(menuToSend);
      }
    });
  }

  async function sendLatestMenuToClient(ws) {
    const currentMenu = menuService.getCurrentMenu();
    if (currentMenu && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(currentMenu));
    }
  }

  wss.on("connection", (ws) => {
    console.log("Client connected to WebSocket");
    clients.add(ws);
    sendLatestMenuToClient(ws);

    ws.on("message", async (messageString) => {
      try {
        const message = JSON.parse(messageString);
        console.log("Received message from client:", message);

        if (!menuService.getCurrentMenu()) {
          console.warn("In-memory menu not initialized. Ignoring message.");
          return;
        }

        let updated = false;
        switch (message.type) {
          case "addItem":
            updated = await menuService.addItemToMenu(message.item);
            break;
          case "removeItem":
            updated = await menuService.removeItemFromMenu(message.itemId);
            break;
          case "addPastaTypeToMenu":
            updated = await menuService.addPastaTypeToMenu(message.pastaTypeId);
            break;
          case "removePastaTypeFromMenu":
            updated = await menuService.removePastaTypeFromMenu(message.pastaTypeId);
            break;
          case "addPastaSauceToMenu":
            updated = await menuService.addPastaSauceToMenu(message.pastaSauceId);
            break;
          case "removePastaSauceFromMenu":
            updated = await menuService.removePastaSauceFromMenu(message.pastaSauceId);
            break;
          default:
            console.warn("Unknown message type:", message.type);
        }

        if (updated) {
          console.log("In-memory menu updated, broadcasting...");
          broadcastInMemoryMenu();
        }
      } catch (error) {
        console.error("Failed to process message or broadcast:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected from WebSocket");
      clients.delete(ws);
    });
  });

  return wss;
}

module.exports = { setupWebSocket };
