// Section Handlers - WebSocket handlers for menu section operations
const menuService = require("../../services/menuService");

async function handleAddSection(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.addSectionToMenu(message.section);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemoveSection(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.removeSectionFromMenu(message.sectionId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleUpdateSectionOrder(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateSectionOrder(message.sectionUpdates);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleMoveItemToSection(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.moveItemToSection(
    message.itemId, 
    message.sectionId, 
    message.position
  );
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleUpdateSectionStyle(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateSectionStyle(
    message.sectionId,
    message.style
  );
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleUpdateSectionColors(message, ws, { broadcastInMemoryMenu, sendToClient }) {
  console.log("🎨 Backend received updateSectionColors message:", message);
  
  const updated = await menuService.updateSectionColors(
    message.sectionId,
    message.backgroundColor,
    message.textColor
  );
  if (updated) {
    console.log("✅ Updated section colors for section ID:", message.sectionId);
    
    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "sectionColorsUpdated",
      sectionId: message.sectionId,
      backgroundColor: message.backgroundColor,
      textColor: message.textColor,
    });

    console.log("🎨 Broadcasting updated menu after section color change");
    broadcastInMemoryMenu();
  } else {
    console.error("❌ Failed to update section colors for section ID:", message.sectionId);
  }
}

async function handleResetSectionColors(message, ws, { broadcastInMemoryMenu, sendToClient }) {
  const updated = await menuService.resetSectionColors(message.sectionId);
  if (updated) {
    console.log("✅ Reset section colors for section ID:", message.sectionId);
    
    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "sectionColorsUpdated",
      sectionId: message.sectionId,
      backgroundColor: null,
      textColor: null,
    });

    broadcastInMemoryMenu();
  }
}

async function handleUpdateSectionType(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateSectionType(
    message.sectionId,
    message.sectionType
  );
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleUpdatePastaTypesColor(message, ws, { broadcastInMemoryMenu, sendToClient }) {
  const updated = await menuService.updatePastaTypesGlobalColor(message.backgroundColor);
  if (updated) {
    console.log("✅ Updated pasta types global color:", message.backgroundColor);
    
    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "pastaTypesColorUpdated",
      backgroundColor: message.backgroundColor,
    });

    broadcastInMemoryMenu();
  }
}

async function handleUpdatePastaSaucesColor(message, ws, { broadcastInMemoryMenu, sendToClient }) {
  const updated = await menuService.updatePastaSaucesGlobalColor(message.backgroundColor);
  if (updated) {
    console.log("✅ Updated pasta sauces global color:", message.backgroundColor);
    
    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "pastaSaucesColorUpdated",
      backgroundColor: message.backgroundColor,
    });

    broadcastInMemoryMenu();
  }
}

module.exports = {
  handleAddSection,
  handleRemoveSection,
  handleUpdateSectionOrder,
  handleMoveItemToSection,
  handleUpdateSectionStyle,
  handleUpdateSectionColors,
  handleResetSectionColors,
  handleUpdateSectionType,
  handleUpdatePastaTypesColor,
  handleUpdatePastaSaucesColor
};
