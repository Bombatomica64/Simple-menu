// Logo Handlers - WebSocket handlers for logo management
const menuService = require("../../services/menuService");

async function handleUpdateLogo(message, ws, { broadcastInMemoryMenu }) {
  try {
    const updated = await menuService.updateLogo(message.logoUrl, message.logoSettings);
    if (updated) {
      console.log("✅ Logo updated successfully");
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to update logo:", error);
    throw error;
  }
}

async function handleRemoveLogo(message, ws, { broadcastInMemoryMenu }) {
  try {
    const updated = await menuService.removeLogo();
    if (updated) {
      console.log("✅ Logo removed successfully");
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to remove logo:", error);
    throw error;
  }
}

async function handleUpdateLogoSettings(message, ws, { broadcastInMemoryMenu }) {
  try {
    const updated = await menuService.updateLogoSettings(message.logoSettings);
    if (updated) {
      console.log("✅ Logo settings updated successfully");
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to update logo settings:", error);
    throw error;
  }
}

async function handleGetAvailableLogos(message, ws, { sendToClient }) {
  try {
    const logos = await menuService.getAvailableLogos();
    sendToClient(ws, {
      type: 'availableLogos',
      logos: logos
    });
  } catch (error) {
    console.error("❌ Failed to get available logos:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get available logos: ' + error.message
    });
  }
}

async function handleSetMenuLogo(message, ws, { broadcastInMemoryMenu }) {
  try {
    const updated = await menuService.setMenuLogo(message.logoId);
    if (updated) {
      console.log("✅ Menu logo set successfully");
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to set menu logo:", error);
    throw error;
  }
}

async function handleDeleteLogo(message, ws, { sendToClient, broadcastInMemoryMenu }) {
  try {
    const success = await menuService.deleteLogo(message.logoId);
    if (success) {
      console.log("✅ Logo deleted successfully");
      sendToClient(ws, {
        type: 'logoDeleted',
        logoId: message.logoId
      });
      // Broadcast menu update in case the deleted logo was in use
      broadcastInMemoryMenu();
    }
  } catch (error) {
    console.error("❌ Failed to delete logo:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to delete logo: ' + error.message
    });
  }
}

module.exports = {
  handleUpdateLogo,
  handleRemoveLogo,
  handleUpdateLogoSettings,
  handleGetAvailableLogos,
  handleSetMenuLogo,
  handleDeleteLogo
};
