// Display Settings Handlers - WebSocket handlers for display configuration
const menuService = require("../../services/menuService");

async function handleUpdateMenuOrientation(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateMenuOrientation(message.orientation);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleUpdateMenuAvailableImages(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateMenuAvailableImages(message.availableImages);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleGetPastaSauceDisplaySettings(message, ws, { sendToClient }) {
  try {
    const settings = await menuService.getPastaSauceDisplaySettings();
    sendToClient(ws, {
      type: 'pastaSauceDisplaySettings',
      settings: settings
    });
  } catch (error) {
    console.error("❌ Failed to get pasta sauce display settings:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get pasta sauce display settings: ' + error.message
    });
  }
}

async function handleUpdatePastaSauceDisplaySettings(message, ws, { sendToClient, broadcastInMemoryMenu }) {
  try {
    const updated = await menuService.updatePastaSauceDisplaySettings(message.settings);
    if (updated) {
      sendToClient(ws, {
        type: 'pastaSauceDisplaySettings',
        settings: message.settings
      });
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to update pasta sauce display settings:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to update pasta sauce display settings: ' + error.message
    });
  }
}

async function handleGetPastaTypeDisplaySettings(message, ws, { sendToClient }) {
  try {
    const settings = await menuService.getPastaTypeDisplaySettings();
    sendToClient(ws, {
      type: 'pastaTypeDisplaySettings',
      settings: settings
    });
  } catch (error) {
    console.error("❌ Failed to get pasta type display settings:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get pasta type display settings: ' + error.message
    });
  }
}

async function handleUpdatePastaTypeDisplaySettings(message, ws, { sendToClient, broadcastInMemoryMenu }) {
  try {
    const updated = await menuService.updatePastaTypeDisplaySettings(message.settings);
    if (updated) {
      sendToClient(ws, {
        type: 'pastaTypeDisplaySettings',
        settings: message.settings
      });
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to update pasta type display settings:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to update pasta type display settings: ' + error.message
    });
  }
}

async function handleUpdateGlobalPastaDisplaySettings(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateGlobalPastaDisplaySettings(message.settings);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

module.exports = {
  handleUpdateMenuOrientation,
  handleUpdateMenuAvailableImages,
  handleGetPastaSauceDisplaySettings,
  handleUpdatePastaSauceDisplaySettings,
  handleGetPastaTypeDisplaySettings,
  handleUpdatePastaTypeDisplaySettings,
  handleUpdateGlobalPastaDisplaySettings
};
