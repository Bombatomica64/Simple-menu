// Background Handlers - WebSocket handlers for background configuration
const { prisma } = require("../../config/database");
const menuService = require("../../services/menuService");

async function handleGetBackgroundConfig(message, ws, { sendToClient }) {
  try {
    const config = await prisma.backgroundConfig.findUnique({
      where: { id: message.configId }
    });

    sendToClient(ws, {
      type: 'backgroundConfig',
      config: config
    });
  } catch (error) {
    console.error("❌ Failed to get background config:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get background config: ' + error.message
    });
  }
}

async function handleGetAllBackgroundConfigs(message, ws, { sendToClient }) {
  try {
    const configs = await prisma.backgroundConfig.findMany({
      orderBy: { createdAt: 'desc' }
    });

    sendToClient(ws, {
      type: 'allBackgroundConfigs',
      configs: configs
    });
  } catch (error) {
    console.error("❌ Failed to get all background configs:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get all background configs: ' + error.message
    });
  }
}

async function handleUpdateBackgroundConfig(message, ws, { sendToClient }) {
  try {
    // Since we only have one page (pasta/home), we'll use a fixed page or find the existing config
    const page = 'pasta'; // Fixed page since there's only one

    // Find existing config or create new one
    let config = await prisma.backgroundConfig.findFirst({
      where: { page: page }
    });

    if (config) {
      // Update existing config
      config = await prisma.backgroundConfig.update({
        where: { id: config.id },
        data: {
          type: message.backgroundType || 'color',
          value: message.value || message.background, // Support both new and legacy field names
          background: message.value || message.background, // Keep legacy field for compatibility
          updatedAt: new Date()
        }
      });
    } else {
      // Create new config
      config = await prisma.backgroundConfig.create({
        data: {
          page: page,
          type: message.backgroundType || 'color',
          value: message.value || message.background,
          background: message.value || message.background
        }
      });
    }

    // Refresh the background in the current in-memory menu
    await menuService.refreshMenuBackground();

    console.log("✅ Background config updated:", config.id);
    sendToClient(ws, {
      type: 'backgroundConfig',
      config: config
    });
  } catch (error) {
    console.error("❌ Failed to update background config:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to update background config: ' + error.message
    });
  }
}

async function handleDeleteBackgroundConfig(message, ws, { sendToClient }) {
  try {
    // Since we only have one page (pasta/home), delete the pasta page config
    const page = 'pasta'; // Fixed page since there's only one

    const deletedConfig = await prisma.backgroundConfig.deleteMany({
      where: { page: page }
    });

    // Refresh the background in the current in-memory menu (will set to null)
    await menuService.refreshMenuBackground();

    console.log("✅ Background config deleted for page:", page);
    sendToClient(ws, {
      type: 'backgroundConfigDeleted',
      page: page
    });
  } catch (error) {
    console.error("❌ Failed to delete background config:", error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to delete background config: ' + error.message
    });
  }
}

module.exports = {
  handleGetBackgroundConfig,
  handleGetAllBackgroundConfigs,
  handleUpdateBackgroundConfig,
  handleDeleteBackgroundConfig
};
