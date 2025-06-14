// Background Handlers - WebSocket handlers for background configuration
const { prisma } = require("../../config/database");

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
    const updatedConfig = await prisma.backgroundConfig.update({
      where: { id: message.configId },
      data: {
        page: message.config.page,
        background: message.config.background,
        updatedAt: new Date()
      }
    });
    
    console.log("✅ Background config updated:", updatedConfig.id);
    sendToClient(ws, {
      type: 'backgroundConfig',
      config: updatedConfig
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
    await prisma.backgroundConfig.delete({
      where: { id: message.configId }
    });
    
    console.log("✅ Background config deleted:", message.configId);
    sendToClient(ws, {
      type: 'backgroundConfigDeleted',
      configId: message.configId
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
