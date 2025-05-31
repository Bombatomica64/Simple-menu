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
      imageUrl: item.imageUrl || null,
      availableImages: item.availableImages || "[]",
      showImage: item.showImage || false,
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

async function updateMenuItemImage(itemId, imageUrl) {
  if (!currentInMemoryMenu) return false;
  
  const item = currentInMemoryMenu.menuItems.find(item => item.id === itemId);
  if (item) {
    item.imageUrl = imageUrl;
    return true;
  }
  return false;
}

async function toggleMenuItemShowImage(itemId, showImage) {
  if (!currentInMemoryMenu) return false;
  
  const item = currentInMemoryMenu.menuItems.find(item => item.id === itemId);
  if (item) {
    item.showImage = showImage;
    return true;
  }
  return false;
}

async function addImageToMenuItem(itemId, imageUrl) {
  if (!currentInMemoryMenu) return false;
  
  const item = currentInMemoryMenu.menuItems.find(item => item.id === itemId);
  if (item) {
    let availableImages = [];
    try {
      availableImages = JSON.parse(item.availableImages || "[]");
    } catch (e) {
      availableImages = [];
    }
    
    if (!availableImages.includes(imageUrl)) {
      availableImages.push(imageUrl);
      item.availableImages = JSON.stringify(availableImages);
      
      // Set as current image if no image is set
      if (!item.imageUrl) {
        item.imageUrl = imageUrl;
      }
      return true;
    }
  }
  return false;
}

async function removeImageFromMenuItem(itemId, imageUrl) {
  if (!currentInMemoryMenu) return false;
  
  const item = currentInMemoryMenu.menuItems.find(item => item.id === itemId);
  if (item) {
    let availableImages = [];
    try {
      availableImages = JSON.parse(item.availableImages || "[]");
    } catch (e) {
      availableImages = [];
    }
    
    const updatedImages = availableImages.filter(img => img !== imageUrl);
    item.availableImages = JSON.stringify(updatedImages);
    
    // If the removed image was the current image, clear it
    if (item.imageUrl === imageUrl) {
      item.imageUrl = updatedImages.length > 0 ? updatedImages[0] : null;
    }
    return true;
  }
  return false;
}

// Save current menu to database
async function saveCurrentMenu(name) {
  if (!currentInMemoryMenu || !name) return null;
  
  try {
    // First create the menu in the database
    const savedMenu = await prisma.menu.create({
      data: {
        menuItems: {
          create: currentInMemoryMenu.menuItems.map(item => ({
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            availableImages: item.availableImages,
            showImage: item.showImage,
          }))
        },
        pastaTypes: {
          create: currentInMemoryMenu.pastaTypes.map(pt => ({
            pastaTypeId: pt.pastaType.id,
          }))
        },
        pastaSauces: {
          create: currentInMemoryMenu.pastaSauces.map(ps => ({
            pastaSauceId: ps.pastaSauce.id,
          }))
        }
      },
      include: {
        menuItems: true,
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      }
    });

    // Then create the SavedMenu entry that references this menu
    const savedMenuEntry = await prisma.savedMenu.create({
      data: {
        name: name,
        menuId: savedMenu.id,
      },
      include: {
        menu: {
          include: {
            menuItems: true,
            pastaTypes: { include: { pastaType: true } },
            pastaSauces: { include: { pastaSauce: true } },
          }
        }
      }
    });

    return savedMenuEntry;
  } catch (error) {
    console.error("Error saving menu:", error);
    throw error;
  }
}

// Get all saved menus
async function getAllSavedMenus() {
  try {
    const savedMenus = await prisma.savedMenu.findMany({
      orderBy: { savedAt: 'desc' },
      include: {
        menu: {
          include: {
            menuItems: true,
            pastaTypes: { include: { pastaType: true } },
            pastaSauces: { include: { pastaSauce: true } },
          }
        }
      }
    });
    return savedMenus;
  } catch (error) {
    console.error("Error getting saved menus:", error);
    throw error;
  }
}

// Load a saved menu as current menu
async function loadSavedMenu(savedMenuId) {
  try {
    const savedMenu = await prisma.savedMenu.findUnique({
      where: { id: savedMenuId },
      include: {
        menu: {
          include: {
            menuItems: true,
            pastaTypes: { include: { pastaType: true } },
            pastaSauces: { include: { pastaSauce: true } },
          }
        }
      }
    });

    if (savedMenu) {
      // Convert database format to in-memory format
      currentInMemoryMenu = {
        id: savedMenu.menu.id,
        createdAt: savedMenu.menu.createdAt,
        menuItems: savedMenu.menu.menuItems,
        pastaTypes: savedMenu.menu.pastaTypes,
        pastaSauces: savedMenu.menu.pastaSauces,
      };
      return currentInMemoryMenu;
    }
    return null;
  } catch (error) {
    console.error("Error loading saved menu:", error);
    throw error;
  }
}

// Delete a saved menu
async function deleteSavedMenu(savedMenuId) {
  try {
    // This will also delete the associated Menu due to cascade
    await prisma.savedMenu.delete({
      where: { id: savedMenuId }
    });
    return true;
  } catch (error) {
    console.error("Error deleting saved menu:", error);
    throw error;
  }
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
  removePastaSauceFromMenu,
  updateMenuItemImage,
  toggleMenuItemShowImage,
  addImageToMenuItem,
  removeImageFromMenuItem,
  saveCurrentMenu,
  getAllSavedMenus,
  loadSavedMenu,
  deleteSavedMenu,
};
