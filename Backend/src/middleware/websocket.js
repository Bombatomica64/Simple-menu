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
          case "updateMenuItemImage":
            updated = await menuService.updateMenuItemImage(message.itemId, message.imageUrl);
            break;
          case "toggleMenuItemShowImage":
            updated = await menuService.toggleMenuItemShowImage(message.itemId, message.showImage);
            break;
          case "addImageToMenuItem":
            updated = await menuService.addImageToMenuItem(message.itemId, message.imageUrl);
            break;
          case "removeImageFromMenuItem":
            updated = await menuService.removeImageFromMenuItem(message.itemId, message.imageUrl);
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
          // CRUD operations for pasta types and sauces
          case "createPastaType":
            try {
              const { prisma } = require("../config/database");
              const newPastaType = await prisma.pastaType.create({
                data: {
                  name: message.pastaType.name,
                  description: message.pastaType.description || null,
                  basePrice: message.pastaType.basePrice || 8.50,
                  priceNote: message.pastaType.priceNote || null,
                  imageUrl: message.pastaType.imageUrl || null
                }
              });
              console.log("Pasta type created:", newPastaType);
            } catch (error) {
              console.error("Failed to create pasta type:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to create pasta type: " + error.message
              }));
            }
            break;
          case "deletePastaType":
            try {
              const { prisma } = require("../config/database");
              await prisma.pastaType.delete({
                where: { id: message.pastaTypeId }
              });
              console.log("Pasta type deleted:", message.pastaTypeId);
            } catch (error) {
              console.error("Failed to delete pasta type:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to delete pasta type: " + error.message
              }));
            }
            break;
          case "createPastaSauce":
            try {
              const { prisma } = require("../config/database");
              const newPastaSauce = await prisma.pastaSauce.create({
                data: {
                  name: message.pastaSauce.name,
                  description: message.pastaSauce.description || null,
                  basePrice: message.pastaSauce.basePrice || 3.50,
                  priceNote: message.pastaSauce.priceNote || null,
                  imageUrl: message.pastaSauce.imageUrl || null
                }
              });
              console.log("Pasta sauce created:", newPastaSauce);
            } catch (error) {
              console.error("Failed to create pasta sauce:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to create pasta sauce: " + error.message
              }));
            }
            break;
          case "deletePastaSauce":
            try {
              const { prisma } = require("../config/database");
              await prisma.pastaSauce.delete({
                where: { id: message.pastaSauceId }
              });
              console.log("Pasta sauce deleted:", message.pastaSauceId);
            } catch (error) {
              console.error("Failed to delete pasta sauce:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to delete pasta sauce: " + error.message
              }));
            }
            break;
          // Section management cases
          case "addSection":
            const newSection = await menuService.addSectionToMenu(message.section);
            if (newSection) {
              updated = true;
            }
            break;
          case "removeSection":
            updated = await menuService.removeSectionFromMenu(message.sectionId);
            break;
          case "updateSectionOrder":
            updated = await menuService.updateSectionOrder(message.sectionUpdates);
            break;
          case "moveItemToSection":
            updated = await menuService.moveItemToSection(message.itemId, message.sectionId, message.position);
            break;
          case "updateItemPositions":
            updated = await menuService.updateItemPositions(message.itemUpdates);
            break;
          case "updateMenuOrientation":
            updated = await menuService.updateMenuOrientation(message.orientation);
            break;
          case "updateMenuAvailableImages":
            updated = await menuService.updateMenuAvailableImages(message.availableImages);
            break;
          case "saveCurrentMenu":
            try {
              const savedMenu = await menuService.saveCurrentMenu(message.name);
              if (savedMenu) {
                // Send confirmation back to client
                ws.send(JSON.stringify({
                  type: "menuSaved",
                  savedMenu: savedMenu
                }));
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to save menu: " + error.message
              }));
            }
            break;
          case "loadSavedMenu":
            try {
              const loadedMenu = await menuService.loadSavedMenu(message.savedMenuId);
              if (loadedMenu) {
                updated = true; // Trigger broadcast of the new menu
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to load menu: " + error.message
              }));
            }
            break;
          case "deleteSavedMenu":
            try {
              const deleted = await menuService.deleteSavedMenu(message.savedMenuId);
              if (deleted) {
                ws.send(JSON.stringify({
                  type: "menuDeleted",
                  savedMenuId: message.savedMenuId
                }));
              }
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to delete menu: " + error.message
              }));
            }
            break;
          case "getAllSavedMenus":
            try {
              const savedMenus = await menuService.getAllSavedMenus();
              ws.send(JSON.stringify({
                type: "savedMenusList",
                savedMenus: savedMenus
              }));
            } catch (error) {
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to get saved menus: " + error.message
              }));
            }
            break;
          // Background configuration cases
          case "updateBackgroundConfig":
            try {
              const { prisma } = require("../config/database");
              const backgroundConfig = await prisma.backgroundConfig.upsert({
                where: { page: message.page },
                update: {
                  background: message.background,
                  updatedAt: new Date()
                },
                create: {
                  page: message.page,
                  background: message.background
                }
              });

              ws.send(JSON.stringify({
                type: "backgroundConfig",
                page: message.page,
                config: backgroundConfig
              }));
              console.log("Background config updated:", backgroundConfig);
            } catch (error) {
              console.error("Failed to update background config:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to update background config: " + error.message
              }));
            }
            break;
          case "deleteBackgroundConfig":
            try {
              const { prisma } = require("../config/database");
              await prisma.backgroundConfig.delete({
                where: { page: message.page }
              });

              ws.send(JSON.stringify({
                type: "backgroundConfigDeleted",
                page: message.page
              }));
              console.log("Background config deleted for page:", message.page);
            } catch (error) {
              console.error("Failed to delete background config:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to delete background config: " + error.message
              }));
            }
            break;
          case "getBackgroundConfig":
            try {
              const { prisma } = require("../config/database");
              const backgroundConfig = await prisma.backgroundConfig.findUnique({
                where: { page: message.page }
              });

              if (backgroundConfig) {
                ws.send(JSON.stringify({
                  type: "backgroundConfig",
                  page: message.page,
                  config: backgroundConfig
                }));
              } else {
                ws.send(JSON.stringify({
                  type: "error",
                  message: "Background config not found for page: " + message.page
                }));
              }
            } catch (error) {
              console.error("Failed to get background config:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to get background config: " + error.message
              }));
            }
            break;
          case "getAllBackgroundConfigs":
            try {
              const { prisma } = require("../config/database");
              const backgroundConfigs = await prisma.backgroundConfig.findMany({
                orderBy: { page: 'asc' }
              });

              ws.send(JSON.stringify({
                type: "allBackgroundConfigs",
                configs: backgroundConfigs
              }));
            } catch (error) {
              console.error("Failed to get all background configs:", error);
              ws.send(JSON.stringify({
                type: "error",
                message: "Failed to get all background configs: " + error.message
              }));
            }
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
