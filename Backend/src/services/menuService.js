// Menu management service
const { prisma } = require("../config/database");

let currentInMemoryMenu = null;

async function loadInitialMenu() {
  try {
    const latestMenuFromDB = await prisma.menu.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        menuItems: true,
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      },
    });
    if (latestMenuFromDB) {
      currentInMemoryMenu = latestMenuFromDB;
      console.log("Initial menu loaded from DB into memory.");
    } else {
      // Seed default data if database is empty
      const { seedDefaultData } = require("./seedService");
      await seedDefaultData();
      currentInMemoryMenu = {
        createdAt: new Date().toISOString(),
        menuItems: [],
        pastaTypes: [],
        pastaSauces: [],
      };
      console.log("No menu in DB, seeded default data and initialized empty in-memory menu.");
    }
  } catch (error) {
    console.error("Error loading initial menu:", error);
    currentInMemoryMenu = {
      createdAt: new Date().toISOString(),
      menuItems: [],
      pastaTypes: [],
      pastaSauces: [],
    };
  }
}

function getCurrentMenu() {
  return currentInMemoryMenu;
}

function setCurrentMenu(menu) {
  currentInMemoryMenu = menu;
}

async function addItemToMenu(item) {
  if (!currentInMemoryMenu) return false;
  
  if (item && typeof item.name === "string" && typeof item.price === "number") {
    const newItem = {
      id: Date.now(), // Temporary in-memory ID
      name: item.name,
      price: item.price,
    };
    currentInMemoryMenu.menuItems.push(newItem);
    return true;
  }
  return false;
}

async function removeItemFromMenu(itemId) {
  if (!currentInMemoryMenu) return false;
  
  if (typeof itemId === "number") {
    const initialLength = currentInMemoryMenu.menuItems.length;
    currentInMemoryMenu.menuItems = currentInMemoryMenu.menuItems.filter(
      (item) => item.id !== itemId
    );
    return currentInMemoryMenu.menuItems.length < initialLength;
  }
  return false;
}

async function addPastaTypeToMenu(pastaTypeId) {
  if (!currentInMemoryMenu) return false;
  
  if (typeof pastaTypeId === "number") {
    const pastaTypeExists = currentInMemoryMenu.pastaTypes.some(pt => pt.pastaType.id === pastaTypeId);
    if (!pastaTypeExists) {
      const pastaTypeToAdd = await prisma.pastaType.findUnique({ where: { id: pastaTypeId } });
      if (pastaTypeToAdd) {
        currentInMemoryMenu.pastaTypes.push({
          pastaTypeId: pastaTypeToAdd.id,
          pastaType: pastaTypeToAdd,
        });
        return true;
      } else {
        console.warn(`PastaType with ID ${pastaTypeId} not found.`);
      }
    }
  }
  return false;
}

async function removePastaTypeFromMenu(pastaTypeId) {
  if (!currentInMemoryMenu) return false;
  
  if (typeof pastaTypeId === "number") {
    const initialLength = currentInMemoryMenu.pastaTypes.length;
    currentInMemoryMenu.pastaTypes = currentInMemoryMenu.pastaTypes.filter(
      (ptEntry) => ptEntry.pastaType.id !== pastaTypeId
    );
    return currentInMemoryMenu.pastaTypes.length < initialLength;
  }
  return false;
}

async function addPastaSauceToMenu(pastaSauceId) {
  if (!currentInMemoryMenu) return false;
  
  if (typeof pastaSauceId === "number") {
    const sauceExists = currentInMemoryMenu.pastaSauces.some(ps => ps.pastaSauce.id === pastaSauceId);
    if (!sauceExists) {
      const pastaSauceToAdd = await prisma.pastaSauce.findUnique({ where: { id: pastaSauceId } });
      if (pastaSauceToAdd) {
        currentInMemoryMenu.pastaSauces.push({
          pastaSauceId: pastaSauceToAdd.id,
          pastaSauce: pastaSauceToAdd,
        });
        return true;
      } else {
        console.warn(`PastaSauce with ID ${pastaSauceId} not found.`);
      }
    }
  }
  return false;
}

async function removePastaSauceFromMenu(pastaSauceId) {
  if (!currentInMemoryMenu) return false;
  
  if (typeof pastaSauceId === "number") {
    const initialLength = currentInMemoryMenu.pastaSauces.length;
    currentInMemoryMenu.pastaSauces = currentInMemoryMenu.pastaSauces.filter(
      (psEntry) => psEntry.pastaSauce.id !== pastaSauceId
    );
    return currentInMemoryMenu.pastaSauces.length < initialLength;
  }
  return false;
}

module.exports = {
  loadInitialMenu,
  getCurrentMenu,
  setCurrentMenu,
  addItemToMenu,
  removeItemFromMenu,
  addPastaTypeToMenu,
  removePastaTypeFromMenu,
  addPastaSauceToMenu,
  removePastaSauceFromMenu
};
