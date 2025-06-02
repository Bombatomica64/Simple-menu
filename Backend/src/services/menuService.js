// Menu management service
const { prisma } = require("../config/database");

let currentInMemoryMenu = null;

async function loadInitialMenu() {
  try {
    const latestMenuFromDB = await prisma.menu.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        menuItems: {
          orderBy: [{ sectionId: 'asc' }, { position: 'asc' }]
        },
        menuSections: {
          orderBy: { position: 'asc' },
          include: {
            menuItems: {
              orderBy: { position: 'asc' }
            }
          }
        },
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
        menuSections: [],
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
      menuSections: [],
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
    // Determine position within section or overall menu
    let position = 0;
    if (item.sectionId) {
      // Find max position in the specific section
      const sectionItems = currentInMemoryMenu.menuItems.filter(i => i.sectionId === item.sectionId);
      position = sectionItems.length > 0 ? Math.max(...sectionItems.map(i => i.position || 0)) + 1 : 0;
    } else {
      // Find max position overall if no section specified
      const unsectionedItems = currentInMemoryMenu.menuItems.filter(i => !i.sectionId);
      position = unsectionedItems.length > 0 ? Math.max(...unsectionedItems.map(i => i.position || 0)) + 1 : 0;
    }

    const newItem = {
      id: Date.now(), // Temporary in-memory ID
      name: item.name,
      price: item.price,
      position: position,
      imageUrl: item.imageUrl || null,
      availableImages: item.availableImages || "[]",
      showImage: item.showImage || false,
      sectionId: item.sectionId || null,
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
            position: item.position || 0,
            imageUrl: item.imageUrl,
            availableImages: item.availableImages,
            showImage: item.showImage,
            sectionId: item.sectionId,
          }))
        },
        menuSections: {
          create: (currentInMemoryMenu.menuSections || []).map(section => ({
            name: section.name,
            position: section.position || 0,
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
        menuItems: {
          orderBy: [{ sectionId: 'asc' }, { position: 'asc' }]
        },
        menuSections: {
          orderBy: { position: 'asc' },
          include: {
            menuItems: {
              orderBy: { position: 'asc' }
            }
          }
        },
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
            menuItems: {
              orderBy: [{ sectionId: 'asc' }, { position: 'asc' }]
            },
            menuSections: {
              orderBy: { position: 'asc' },
              include: {
                menuItems: {
                  orderBy: { position: 'asc' }
                }
              }
            },
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
            menuItems: {
              orderBy: [{ sectionId: 'asc' }, { position: 'asc' }]
            },
            menuSections: {
              orderBy: { position: 'asc' },
              include: {
                menuItems: {
                  orderBy: { position: 'asc' }
                }
              }
            },
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
            menuItems: {
              orderBy: [{ sectionId: 'asc' }, { position: 'asc' }]
            },
            menuSections: {
              orderBy: { position: 'asc' },
              include: {
                menuItems: {
                  orderBy: { position: 'asc' }
                }
              }
            },
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
        menuSections: savedMenu.menu.menuSections || [],
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

// Menu Section Management Functions

async function addSectionToMenu(sectionData) {
  if (!currentInMemoryMenu) return false;
  
  if (sectionData && typeof sectionData.name === "string") {
    // Determine position for new section
    const existingSections = currentInMemoryMenu.menuSections || [];
    const maxPosition = existingSections.length > 0 ? Math.max(...existingSections.map(s => s.position || 0)) : -1;
    
    const newSection = {
      id: Date.now(), // Temporary in-memory ID
      name: sectionData.name,
      position: maxPosition + 1,
      menuItems: [],
    };
    
    if (!currentInMemoryMenu.menuSections) {
      currentInMemoryMenu.menuSections = [];
    }
    currentInMemoryMenu.menuSections.push(newSection);
    return newSection;
  }
  return false;
}

async function removeSectionFromMenu(sectionId) {
  if (!currentInMemoryMenu || !currentInMemoryMenu.menuSections) return false;
  
  if (typeof sectionId === "number") {
    const sectionIndex = currentInMemoryMenu.menuSections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      const removedSection = currentInMemoryMenu.menuSections[sectionIndex];
      
      // Move items from removed section to first section or make them unsectioned
      if (removedSection.menuItems && removedSection.menuItems.length > 0) {
        if (currentInMemoryMenu.menuSections.length > 1) {
          // Move to first remaining section
          const targetSection = currentInMemoryMenu.menuSections.find(s => s.id !== sectionId);
          if (targetSection) {
            targetSection.menuItems = targetSection.menuItems || [];
            targetSection.menuItems.push(...removedSection.menuItems);
          }
        } else {
          // Make items unsectioned (remove sectionId)
          removedSection.menuItems.forEach(item => {
            item.sectionId = null;
            const menuItem = currentInMemoryMenu.menuItems.find(mi => mi.id === item.id);
            if (menuItem) {
              menuItem.sectionId = null;
            }
          });
        }
      }
      
      currentInMemoryMenu.menuSections.splice(sectionIndex, 1);
      return true;
    }
  }
  return false;
}

async function updateSectionOrder(sectionUpdates) {
  if (!currentInMemoryMenu || !currentInMemoryMenu.menuSections) return false;
  
  try {
    // Update positions for each section
    sectionUpdates.forEach(update => {
      const section = currentInMemoryMenu.menuSections.find(s => s.id === update.id);
      if (section) {
        section.position = update.position;
      }
    });
    
    // Sort sections by position
    currentInMemoryMenu.menuSections.sort((a, b) => a.position - b.position);
    return true;
  } catch (error) {
    console.error("Error updating section order:", error);
    return false;
  }
}

async function moveItemToSection(itemId, targetSectionId, position) {
  if (!currentInMemoryMenu) return false;
  
  const item = currentInMemoryMenu.menuItems.find(item => item.id === itemId);
  if (item) {
    // Remove from current section if it has one
    if (item.sectionId && currentInMemoryMenu.menuSections) {
      const currentSection = currentInMemoryMenu.menuSections.find(s => s.id === item.sectionId);
      if (currentSection && currentSection.menuItems) {
        currentSection.menuItems = currentSection.menuItems.filter(i => i.id !== itemId);
      }
    }
    
    // Update item's section
    item.sectionId = targetSectionId;
    item.position = position || 0;
    
    // Add to target section
    if (targetSectionId && currentInMemoryMenu.menuSections) {
      const targetSection = currentInMemoryMenu.menuSections.find(s => s.id === targetSectionId);
      if (targetSection) {
        if (!targetSection.menuItems) {
          targetSection.menuItems = [];
        }
        targetSection.menuItems.push(item);
        // Sort items in section by position
        targetSection.menuItems.sort((a, b) => (a.position || 0) - (b.position || 0));
      }
    }
    
    return true;
  }
  return false;
}

async function updateItemPositions(itemUpdates) {
  if (!currentInMemoryMenu) return false;
  
  try {
    itemUpdates.forEach(update => {
      const item = currentInMemoryMenu.menuItems.find(item => item.id === update.itemId);
      if (item) {
        item.position = update.position;
        if (update.sectionId !== undefined) {
          item.sectionId = update.sectionId;
        }
      }
    });
    
    // Update section menuItems arrays
    if (currentInMemoryMenu.menuSections) {
      currentInMemoryMenu.menuSections.forEach(section => {
        section.menuItems = currentInMemoryMenu.menuItems
          .filter(item => item.sectionId === section.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error updating item positions:", error);
    return false;
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
  // Section management functions
  addSectionToMenu,
  removeSectionFromMenu,
  updateSectionOrder,
  moveItemToSection,
  updateItemPositions,
};
