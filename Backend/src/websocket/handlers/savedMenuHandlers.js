// Saved Menu Handlers - WebSocket handlers for menu persistence
const menuService = require("../../services/menuService");

async function handleSaveCurrentMenu(message, ws, { sendToClient }) {
  try {
    const savedMenu = await menuService.saveCurrentMenu(message.name);
    if (savedMenu) {
      console.log("✅ Menu saved successfully:", message.name);
      sendToClient(ws, {
        type: "menuSaved",
        savedMenu: savedMenu
      });
    }
  } catch (error) {
    console.error("❌ Failed to save menu:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to save menu: " + error.message
    });
  }
}

async function handleLoadSavedMenu(message, ws, { broadcastInMemoryMenu, sendToClient }) {
  try {
    const success = await menuService.loadSavedMenu(message.savedMenuId);
    if (success) {
      console.log("✅ Menu loaded successfully:", message.savedMenuId);
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to load saved menu:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to load saved menu: " + error.message
    });
  }
}

async function handleGetAllSavedMenus(message, ws, { sendToClient }) {
  try {
    const savedMenus = await menuService.getAllSavedMenus();
    sendToClient(ws, {
      type: "savedMenusList",
      savedMenus: savedMenus
    });
  } catch (error) {
    console.error("❌ Failed to get saved menus:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to get saved menus: " + error.message
    });
  }
}

async function handleDeleteSavedMenu(message, ws, { sendToClient }) {
  try {
    const success = await menuService.deleteSavedMenu(message.savedMenuId);
    if (success) {
      console.log("✅ Saved menu deleted successfully:", message.savedMenuId);
      sendToClient(ws, {
        type: "menuDeleted",
        savedMenuId: message.savedMenuId
      });
    }
  } catch (error) {
    console.error("❌ Failed to delete saved menu:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to delete saved menu: " + error.message
    });
  }
}

module.exports = {
  handleSaveCurrentMenu,
  handleLoadSavedMenu,
  handleGetAllSavedMenus,
  handleDeleteSavedMenu
};
