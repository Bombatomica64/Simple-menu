// Message Router - Routes WebSocket messages to appropriate handlers
const menuItemHandlers = require("./handlers/menuItemHandlers");
const sectionHandlers = require("./handlers/sectionHandlers");
const pastaHandlers = require("./handlers/pastaHandlers");
const logoHandlers = require("./handlers/logoHandlers");
const backgroundHandlers = require("./handlers/backgroundHandlers");
const savedMenuHandlers = require("./handlers/savedMenuHandlers");
const displaySettingsHandlers = require("./handlers/displaySettingsHandlers");
const slideshowHandlers = require("./handlers/slideshowHandlers");

// Message routing table
const MESSAGE_HANDLERS = {
  // Menu Item Operations
  "addItem": menuItemHandlers.handleAddItem,
  "removeItem": menuItemHandlers.handleRemoveItem,
  "updateMenuItemImage": menuItemHandlers.handleUpdateMenuItemImage,
  "toggleMenuItemShowImage": menuItemHandlers.handleToggleMenuItemShowImage,
  "addImageToMenuItem": menuItemHandlers.handleAddImageToMenuItem,
  "removeImageFromMenuItem": menuItemHandlers.handleRemoveImageFromMenuItem,

  // Section Operations
  "addSection": sectionHandlers.handleAddSection,
  "removeSection": sectionHandlers.handleRemoveSection,
  "updateSectionOrder": sectionHandlers.handleUpdateSectionOrder,
  "moveItemToSection": sectionHandlers.handleMoveItemToSection,
  "updateItemPositions": sectionHandlers.handleUpdateItemPositions,
  "updateSectionStyle": sectionHandlers.handleUpdateSectionStyle,
  "updateSectionColors": sectionHandlers.handleUpdateSectionColors,
  "resetSectionColors": sectionHandlers.handleResetSectionColors,
  "updateSectionType": sectionHandlers.handleUpdateSectionType,
  "updatePastaTypesColor": sectionHandlers.handleUpdatePastaTypesColor,
  "updatePastaSaucesColor": sectionHandlers.handleUpdatePastaSaucesColor,

  // Pasta Operations
  "addPastaTypeToMenu": pastaHandlers.handleAddPastaTypeToMenu,
  "removePastaTypeFromMenu": pastaHandlers.handleRemovePastaTypeFromMenu,
  "addPastaSauceToMenu": pastaHandlers.handleAddPastaSauceToMenu,
  "removePastaSauceFromMenu": pastaHandlers.handleRemovePastaSauceFromMenu,
  "createPastaType": pastaHandlers.handleCreatePastaType,
  "deletePastaType": pastaHandlers.handleDeletePastaType,
  "createPastaSauce": pastaHandlers.handleCreatePastaSauce,
  "deletePastaSauce": pastaHandlers.handleDeletePastaSauce,
  "updatePastaTypeColors": pastaHandlers.handleUpdatePastaTypeColors,
  "resetPastaTypeColors": pastaHandlers.handleResetPastaTypeColors,
  "updatePastaSauceColors": pastaHandlers.handleUpdatePastaSauceColors,
  "resetPastaSauceColors": pastaHandlers.handleResetPastaSauceColors,

  // Logo Operations
  "updateLogo": logoHandlers.handleUpdateLogo,
  "removeLogo": logoHandlers.handleRemoveLogo,
  "updateLogoSettings": logoHandlers.handleUpdateLogoSettings,
  "getAvailableLogos": logoHandlers.handleGetAvailableLogos,
  "setMenuLogo": logoHandlers.handleSetMenuLogo,
  "deleteLogo": logoHandlers.handleDeleteLogo,

  // Background Operations
  "getBackgroundConfig": backgroundHandlers.handleGetBackgroundConfig,
  "getAllBackgroundConfigs": backgroundHandlers.handleGetAllBackgroundConfigs,
  "updateBackgroundConfig": backgroundHandlers.handleUpdateBackgroundConfig,
  "deleteBackgroundConfig": backgroundHandlers.handleDeleteBackgroundConfig,

  // Menu Persistence
  "saveCurrentMenu": savedMenuHandlers.handleSaveCurrentMenu,
  "loadSavedMenu": savedMenuHandlers.handleLoadSavedMenu,
  "getAllSavedMenus": savedMenuHandlers.handleGetAllSavedMenus,
  "deleteSavedMenu": savedMenuHandlers.handleDeleteSavedMenu,

  // Display Settings
  "updateMenuOrientation": displaySettingsHandlers.handleUpdateMenuOrientation,
  "updateMenuAvailableImages": displaySettingsHandlers.handleUpdateMenuAvailableImages,
  "getPastaSauceDisplaySettings": displaySettingsHandlers.handleGetPastaSauceDisplaySettings,
  "updatePastaSauceDisplaySettings": displaySettingsHandlers.handleUpdatePastaSauceDisplaySettings,
  "getPastaTypeDisplaySettings": displaySettingsHandlers.handleGetPastaTypeDisplaySettings,
  "updatePastaTypeDisplaySettings": displaySettingsHandlers.handleUpdatePastaTypeDisplaySettings,
  "updateGlobalPastaDisplaySettings": displaySettingsHandlers.handleUpdateGlobalPastaDisplaySettings,

  // Slideshow Operations
  "getActiveSlideshow": slideshowHandlers.handleGetActiveSlideshow,
  "getAllSlideshows": slideshowHandlers.handleGetAllSlideshows,
  "createSlideshow": slideshowHandlers.handleCreateSlideshow,
  "updateSlideshow": slideshowHandlers.handleUpdateSlideshow,
  "activateSlideshow": slideshowHandlers.handleActivateSlideshow,
  "deactivateSlideshow": slideshowHandlers.handleDeactivateSlideshow,
  "addSlideToSlideshow": slideshowHandlers.handleAddSlideToSlideshow,
  "removeSlideFromSlideshow": slideshowHandlers.handleRemoveSlideFromSlideshow,
  "updateSlideOrder": slideshowHandlers.handleUpdateSlideOrder
};

async function handleMessage(parsedMessage, ws, { broadcastInMemoryMenu, sendToClient, broadcastMessage }) {
  const { type } = parsedMessage;
  
  // Find appropriate handler
  const handler = MESSAGE_HANDLERS[type];
  
  if (!handler) {
    console.warn(`⚠️  Unknown message type: ${type}`);
    sendToClient(ws, {
      type: 'error',
      message: `Unknown message type: ${type}`
    });
    return;
  }

  try {
    // Execute handler with context
    await handler(parsedMessage, ws, {
      broadcastInMemoryMenu,
      sendToClient,
      broadcastMessage
    });
  } catch (error) {
    console.error(`❌ Error handling message type '${type}':`, error);
    sendToClient(ws, {
      type: 'error',
      message: `Error processing ${type}: ${error.message}`
    });
  }
}

module.exports = {
  handleMessage,
  MESSAGE_HANDLERS
};
