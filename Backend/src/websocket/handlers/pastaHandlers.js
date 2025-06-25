// Pasta Handlers - WebSocket handlers for pasta operations
const menuService = require("../../services/menuService");
const { prisma } = require("../../config/database");

async function handleAddPastaTypeToMenu(
  message,
  ws,
  { broadcastInMemoryMenu }
) {
  const updated = await menuService.addPastaTypeToMenu(message.pastaTypeId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemovePastaTypeFromMenu(
  message,
  ws,
  { broadcastInMemoryMenu }
) {
  const updated = await menuService.removePastaTypeFromMenu(
    message.pastaTypeId
  );
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleAddPastaSauceToMenu(
  message,
  ws,
  { broadcastInMemoryMenu }
) {
  const updated = await menuService.addPastaSauceToMenu(message.pastaSauceId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemovePastaSauceFromMenu(
  message,
  ws,
  { broadcastInMemoryMenu }
) {
  const updated = await menuService.removePastaSauceFromMenu(
    message.pastaSauceId
  );
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleCreatePastaType(
  message,
  ws,
  { sendToClient, broadcastInMemoryMenu }
) {
  try {
    const newPastaType = await prisma.pastaType.create({
      data: {
        name: message.pastaType.name,
        description: message.pastaType.description || null,
        imageUrl: message.pastaType.imageUrl || null,
      },
    });

    console.log("✅ Created new pasta type:", newPastaType.name);
    sendToClient(ws, {
      type: "pastaTypeCreated",
      pastaType: newPastaType,
    });

    // Refresh in-memory menu to include the new pasta type
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to create pasta type:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to create pasta type: " + error.message,
    });
  }
}

async function handleDeletePastaType(
  message,
  ws,
  { sendToClient, broadcastInMemoryMenu }
) {
  try {
    // First remove from current menu if it exists
    await menuService.removePastaTypeFromMenu(message.pastaTypeId);

    // Then delete the pasta type completely
    await prisma.pastaType.delete({
      where: { id: message.pastaTypeId },
    });

    console.log("✅ Deleted pasta type with ID:", message.pastaTypeId);
    sendToClient(ws, {
      type: "pastaTypeDeleted",
      pastaTypeId: message.pastaTypeId,
    });

    // Refresh in-memory menu to reflect deletion
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to delete pasta type:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to delete pasta type: " + error.message,
    });
  }
}

async function handleCreatePastaSauce(
  message,
  ws,
  { sendToClient, broadcastInMemoryMenu }
) {
  try {
    const newPastaSauce = await prisma.pastaSauce.create({
      data: {
        name: message.pastaSauce.name,
        description: message.pastaSauce.description || null,
        imageUrl: message.pastaSauce.imageUrl || null,
      },
    });

    console.log("✅ Created new pasta sauce:", newPastaSauce.name);
    sendToClient(ws, {
      type: "pastaSauceCreated",
      pastaSauce: newPastaSauce,
    });

    // Refresh in-memory menu to include the new pasta sauce
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to create pasta sauce:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to create pasta sauce: " + error.message,
    });
  }
}

async function handleDeletePastaSauce(
  message,
  ws,
  { sendToClient, broadcastInMemoryMenu }
) {
  try {
    // First remove from current menu if it exists
    await menuService.removePastaSauceFromMenu(message.pastaSauceId);

    // Then delete the pasta sauce completely
    await prisma.pastaSauce.delete({
      where: { id: message.pastaSauceId },
    });

    console.log("✅ Deleted pasta sauce with ID:", message.pastaSauceId);
    sendToClient(ws, {
      type: "pastaSauceDeleted",
      pastaSauceId: message.pastaSauceId,
    });

    // Refresh in-memory menu to reflect deletion
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to delete pasta sauce:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to delete pasta sauce: " + error.message,
    });
  }
}

// Color management handlers for pasta types and sauces
async function handleUpdatePastaTypeColors(
  message,
  ws,
  { broadcastInMemoryMenu, sendToClient }
) {
  try {
    const updatedPastaType = await prisma.pastaType.update({
      where: { id: message.pastaTypeId },
      data: {
        backgroundColor: message.backgroundColor,
        textColor: message.textColor,
      },
    });

    console.log("✅ Updated pasta type colors:", updatedPastaType.name);

    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "pastaTypeColorsUpdated",
      pastaTypeId: message.pastaTypeId,
      backgroundColor: message.backgroundColor,
      textColor: message.textColor,
    });

    // Refresh in-memory menu to reflect color changes
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to update pasta type colors:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to update pasta type colors: " + error.message,
    });
  }
}

async function handleResetPastaTypeColors(
  message,
  ws,
  { broadcastInMemoryMenu, sendToClient }
) {
  try {
    const updatedPastaType = await prisma.pastaType.update({
      where: { id: message.pastaTypeId },
      data: {
        backgroundColor: null,
        textColor: null,
      },
    });

    console.log("✅ Reset pasta type colors:", updatedPastaType.name);

    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "pastaTypeColorsUpdated",
      pastaTypeId: message.pastaTypeId,
      backgroundColor: null,
      textColor: null,
    });

    // Refresh in-memory menu to reflect color changes
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to reset pasta type colors:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to reset pasta type colors: " + error.message,
    });
  }
}

async function handleUpdatePastaSauceColors(
  message,
  ws,
  { broadcastInMemoryMenu, sendToClient }
) {
  try {
    const updatedPastaSauce = await prisma.pastaSauce.update({
      where: { id: message.pastaSauceId },
      data: {
        backgroundColor: message.backgroundColor,
        textColor: message.textColor,
      },
    });

    console.log("✅ Updated pasta sauce colors:", updatedPastaSauce.name);

    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "pastaSauceColorsUpdated",
      pastaSauceId: message.pastaSauceId,
      backgroundColor: message.backgroundColor,
      textColor: message.textColor,
    });

    // Refresh in-memory menu to reflect color changes
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to update pasta sauce colors:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to update pasta sauce colors: " + error.message,
    });
  }
}

async function handleResetPastaSauceColors(
  message,
  ws,
  { broadcastInMemoryMenu, sendToClient }
) {
  try {
    const updatedPastaSauce = await prisma.pastaSauce.update({
      where: { id: message.pastaSauceId },
      data: {
        backgroundColor: null,
        textColor: null,
      },
    });

    console.log("✅ Reset pasta sauce colors:", updatedPastaSauce.name);

    // Send confirmation response to the specific client
    sendToClient(ws, {
      type: "pastaSauceColorsUpdated",
      pastaSauceId: message.pastaSauceId,
      backgroundColor: null,
      textColor: null,
    });

    // Refresh in-memory menu to reflect color changes
    await menuService.refreshInMemoryMenu();
    broadcastInMemoryMenu();
  } catch (error) {
    console.error("❌ Failed to reset pasta sauce colors:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to reset pasta sauce colors: " + error.message,
    });
  }
}

module.exports = {
  handleAddPastaTypeToMenu,
  handleRemovePastaTypeFromMenu,
  handleAddPastaSauceToMenu,
  handleRemovePastaSauceFromMenu,
  handleCreatePastaType,
  handleDeletePastaType,
  handleCreatePastaSauce,
  handleDeletePastaSauce,
  handleUpdatePastaTypeColors,
  handleResetPastaTypeColors,
  handleUpdatePastaSauceColors,
  handleResetPastaSauceColors,
};
