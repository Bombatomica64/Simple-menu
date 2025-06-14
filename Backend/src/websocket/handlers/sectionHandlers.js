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

module.exports = {
  handleAddSection,
  handleRemoveSection,
  handleUpdateSectionOrder,
  handleMoveItemToSection,
  handleUpdateSectionStyle
};
