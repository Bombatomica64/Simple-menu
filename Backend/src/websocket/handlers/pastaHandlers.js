// Pasta Handlers - WebSocket handlers for pasta operations
const menuService = require("../../services/menuService");
const { prisma } = require("../../config/database");

async function handleAddPastaTypeToMenu(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.addPastaTypeToMenu(message.pastaTypeId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemovePastaTypeFromMenu(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.removePastaTypeFromMenu(message.pastaTypeId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleAddPastaSauceToMenu(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.addPastaSauceToMenu(message.pastaSauceId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleRemovePastaSauceFromMenu(message, ws, { broadcastInMemoryMenu }) {
  const updated = await menuService.removePastaSauceFromMenu(message.pastaSauceId);
  if (updated) {
    broadcastInMemoryMenu();
  }
}

async function handleCreatePastaType(message, ws, { sendToClient }) {
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
  } catch (error) {
    console.error("❌ Failed to create pasta type:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to create pasta type: " + error.message,
    });
  }
}

async function handleDeletePastaType(message, ws, { sendToClient }) {
  try {
    await prisma.pastaType.delete({
      where: { id: message.pastaTypeId },
    });

    console.log("✅ Deleted pasta type with ID:", message.pastaTypeId);
    sendToClient(ws, {
      type: "pastaTypeDeleted",
      pastaTypeId: message.pastaTypeId,
    });
  } catch (error) {
    console.error("❌ Failed to delete pasta type:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to delete pasta type: " + error.message,
    });
  }
}

async function handleCreatePastaSauce(message, ws, { sendToClient }) {
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
  } catch (error) {
    console.error("❌ Failed to create pasta sauce:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to create pasta sauce: " + error.message,
    });
  }
}

async function handleDeletePastaSauce(message, ws, { sendToClient }) {
  try {
    await prisma.pastaSauce.delete({
      where: { id: message.pastaSauceId },
    });

    console.log("✅ Deleted pasta sauce with ID:", message.pastaSauceId);
    sendToClient(ws, {
      type: "pastaSauceDeleted",
      pastaSauceId: message.pastaSauceId,
    });
  } catch (error) {
    console.error("❌ Failed to delete pasta sauce:", error);
    sendToClient(ws, {
      type: "error",
      message: "Failed to delete pasta sauce: " + error.message,
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
  handleDeletePastaSauce
};
