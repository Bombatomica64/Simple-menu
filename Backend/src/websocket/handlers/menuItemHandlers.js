// Menu Item Handlers - WebSocket handlers for menu item operations
const menuService = require("../../services/menuService");

async function handleAddItem(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.addItemToMenu(message.item);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemoveItem(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.removeItemFromMenu(message.itemId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleUpdateMenuItemImage(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.updateMenuItemImage(message.itemId, message.imageUrl);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleToggleMenuItemShowImage(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.toggleMenuItemShowImage(message.itemId, message.showImage);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleAddImageToMenuItem(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.addImageToMenuItem(message.itemId, message.imageUrl);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemoveImageFromMenuItem(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.removeImageFromMenuItem(message.itemId, message.imageUrl);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

module.exports = {
  handleAddItem,
  handleRemoveItem,
  handleUpdateMenuItemImage,
  handleToggleMenuItemShowImage,
  handleAddImageToMenuItem,
  handleRemoveImageFromMenuItem
};
