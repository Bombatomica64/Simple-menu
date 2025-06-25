// Menu management service
const { prisma } = require("../config/database");

let currentInMemoryMenu = null;

async function loadInitialMenu() {
  try {
    const latestMenuFromDB = await prisma.menu.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        logo: true, // Include logo details
        background: true, // Include background configuration
        menuItems: {
          orderBy: [{ sectionId: "asc" }, { position: "asc" }],
        },
        menuSections: {
          orderBy: { position: "asc" },
          include: {
            menuItems: {
              orderBy: { position: "asc" },
            },
          },
        },
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      },
    });
    if (latestMenuFromDB) {
      currentInMemoryMenu = latestMenuFromDB;
      console.log("Initial menu loaded from DB into memory.");

      // Ensure predefined sections exist
      await ensurePredefinedSections(latestMenuFromDB.id);

      // Reload the menu to include any newly created predefined sections
      const reloadedMenu = await prisma.menu.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          logo: true, // Include logo details
          background: true, // Include background configuration
          menuItems: {
            orderBy: [{ sectionId: "asc" }, { position: "asc" }],
          },
          menuSections: {
            orderBy: { position: "asc" },
            include: {
              menuItems: {
                orderBy: { position: "asc" },
              },
            },
          },
          pastaTypes: { include: { pastaType: true } },
          pastaSauces: { include: { pastaSauce: true } },
        },
      });

      if (reloadedMenu) {
        currentInMemoryMenu = reloadedMenu;
        console.log("Menu reloaded with predefined sections.");
      }
    } else {
      // Seed default data if database is empty
      const { seedDefaultData } = require("./seedService");
      await seedDefaultData();

      // Create initial menu with predefined sections
      const predefinedSections = [
        {
          id: `temp-${Date.now()}-1`,
          name: "Pokè",
          sectionType: "Pokè",
          position: 0,
          menuItems: [],
        },
        {
          id: `temp-${Date.now()}-2`,
          name: "Insalatone",
          sectionType: "insalatone",
          position: 1,
          menuItems: [],
        },
      ];

      currentInMemoryMenu = {
        createdAt: new Date().toISOString(),
        orientation: "vertical",
        availableImages: null,
        background: null, // No background configuration
        menuItems: [],
        menuSections: predefinedSections,
        pastaTypes: [],
        pastaSauces: [],
      };
      console.log(
        "No menu in DB, seeded default data and initialized empty in-memory menu."
      );
    }
  } catch (error) {
    console.error("Error loading initial menu:", error);

    // Create initial menu with predefined sections even in error case
    const predefinedSections = [
      {
        id: `temp-${Date.now()}-1`,
        name: "Pokè",
        sectionType: "Pokè",
        position: 0,
        menuItems: [],
      },
      {
        id: `temp-${Date.now()}-2`,
        name: "Insalatone",
        sectionType: "insalatone",
        position: 1,
        menuItems: [],
      },
    ];

    currentInMemoryMenu = {
      createdAt: new Date().toISOString(),
      orientation: "vertical",
      availableImages: null,
      background: null, // No background configuration
      menuItems: [],
      menuSections: predefinedSections,
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

// Refresh the in-memory menu from the database
async function refreshInMemoryMenu() {
  try {
    const latestMenuFromDB = await prisma.menu.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        logo: true, // Include logo details
        background: true, // Include background configuration
        menuItems: {
          orderBy: [{ sectionId: "asc" }, { position: "asc" }],
        },
        menuSections: {
          orderBy: { position: "asc" },
          include: {
            menuItems: {
              orderBy: { position: "asc" },
            },
          },
        },
        pastaTypes: { include: { pastaType: true } },
        pastaSauces: { include: { pastaSauce: true } },
      },
    });

    if (latestMenuFromDB) {
      currentInMemoryMenu = latestMenuFromDB;
      console.log("In-memory menu refreshed from database.");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error refreshing in-memory menu:", error);
    return false;
  }
}

async function addItemToMenu(item) {
  if (!currentInMemoryMenu) return false;

  if (item && typeof item.name === "string" && typeof item.price === "number") {
    // Determine position within section or overall menu
    let position = 0;
    if (item.sectionId) {
      // Find max position in the specific section
      const sectionItems = currentInMemoryMenu.menuItems.filter(
        (i) => i.sectionId === item.sectionId
      );
      position =
        sectionItems.length > 0
          ? Math.max(...sectionItems.map((i) => i.position || 0)) + 1
          : 0;
    } else {
      // Find max position overall if no section specified
      const unsectionedItems = currentInMemoryMenu.menuItems.filter(
        (i) => !i.sectionId
      );
      position =
        unsectionedItems.length > 0
          ? Math.max(...unsectionedItems.map((i) => i.position || 0)) + 1
          : 0;
    }
    const newItem = {
      id: Date.now(), // Temporary in-memory ID
      name: item.name,
      price: item.price,
      description: item.description || null,
      position: position,
      imageUrl: item.imageUrl || null,
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
    const pastaTypeExists = currentInMemoryMenu.pastaTypes.some(
      (pt) => pt.pastaType.id === pastaTypeId
    );
    if (!pastaTypeExists) {
      const pastaTypeToAdd = await prisma.pastaType.findUnique({
        where: { id: pastaTypeId },
      });
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
    const sauceExists = currentInMemoryMenu.pastaSauces.some(
      (ps) => ps.pastaSauce.id === pastaSauceId
    );
    if (!sauceExists) {
      const pastaSauceToAdd = await prisma.pastaSauce.findUnique({
        where: { id: pastaSauceId },
      });
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

  const item = currentInMemoryMenu.menuItems.find((item) => item.id === itemId);
  if (item) {
    item.imageUrl = imageUrl;
    return true;
  }
  return false;
}

async function toggleMenuItemShowImage(itemId, showImage) {
  if (!currentInMemoryMenu) return false;

  const item = currentInMemoryMenu.menuItems.find((item) => item.id === itemId);
  if (item) {
    item.showImage = showImage;
    return true;
  }
  return false;
}

async function addImageToMenuItem(itemId, imageUrl) {
  if (!currentInMemoryMenu) return false;

  const item = currentInMemoryMenu.menuItems.find((item) => item.id === itemId);
  if (item) {
    // Add image to global menu available images
    let availableImages = [];
    try {
      availableImages = JSON.parse(currentInMemoryMenu.availableImages || "[]");
    } catch (e) {
      availableImages = [];
    }

    if (!availableImages.includes(imageUrl)) {
      availableImages.push(imageUrl);
      currentInMemoryMenu.availableImages = JSON.stringify(availableImages);
    }

    // Set as current image for this menu item
    item.imageUrl = imageUrl;
    return true;
  }
  return false;
}

async function removeImageFromMenuItem(itemId, imageUrl) {
  if (!currentInMemoryMenu) return false;

  const item = currentInMemoryMenu.menuItems.find((item) => item.id === itemId);
  if (item) {
    // Remove image from global menu available images
    let availableImages = [];
    try {
      availableImages = JSON.parse(currentInMemoryMenu.availableImages || "[]");
    } catch (e) {
      availableImages = [];
    }

    const updatedImages = availableImages.filter((img) => img !== imageUrl);
    currentInMemoryMenu.availableImages = JSON.stringify(updatedImages);

    // If the removed image was the current image for this item, clear it
    if (item.imageUrl === imageUrl) {
      item.imageUrl = null;
    }
    return true;
  }
  return false;
}

// Update menu orientation
async function updateMenuOrientation(orientation) {
  if (!currentInMemoryMenu) return false;

  if (orientation === "vertical" || orientation === "horizontal") {
    currentInMemoryMenu.orientation = orientation;
    return true;
  }
  return false;
}

// Update menu available images
async function updateMenuAvailableImages(availableImages) {
  if (!currentInMemoryMenu) return false;

  currentInMemoryMenu.availableImages = availableImages;
  return true;
}

// Save current menu to database
async function saveCurrentMenu(name) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // First create the base menu with orientation and availableImages
      const savedMenu = await tx.menu.create({
        data: {
          orientation: currentInMemoryMenu.orientation || "vertical",
          availableImages: currentInMemoryMenu.availableImages || null,
          globalPastaTypeBackgroundColor:
            currentInMemoryMenu.globalPastaTypeBackgroundColor || null,
          globalPastaSauceBackgroundColor:
            currentInMemoryMenu.globalPastaSauceBackgroundColor || null,
          // Include any other global pasta display settings
          globalPastaTypeFontSize:
            currentInMemoryMenu.globalPastaTypeFontSize || 2.2,
          globalPastaSauceFontSize:
            currentInMemoryMenu.globalPastaSauceFontSize || 2.2,
          globalPastaTypeShowImage:
            currentInMemoryMenu.globalPastaTypeShowImage !== undefined
              ? currentInMemoryMenu.globalPastaTypeShowImage
              : true,
          globalPastaTypeImageSize:
            currentInMemoryMenu.globalPastaTypeImageSize || "size-medium",
          globalPastaTypeShowDescription:
            currentInMemoryMenu.globalPastaTypeShowDescription !== undefined
              ? currentInMemoryMenu.globalPastaTypeShowDescription
              : true,
          globalPastaSauceShowImage:
            currentInMemoryMenu.globalPastaSauceShowImage !== undefined
              ? currentInMemoryMenu.globalPastaSauceShowImage
              : true,
          globalPastaSauceImageSize:
            currentInMemoryMenu.globalPastaSauceImageSize || "size-medium",
          globalPastaSauceShowDescription:
            currentInMemoryMenu.globalPastaSauceShowDescription !== undefined
              ? currentInMemoryMenu.globalPastaSauceShowDescription
              : true,
        },
      });

      // Create section mapping from temp IDs to real IDs
      const sectionIdMapping = new Map();

      // Create sections first
      for (const section of currentInMemoryMenu.menuSections) {
        const createdSection = await tx.menuSection.create({
          data: {
            name: section.name,
            header: section.header || null,
            position: section.position || 0,
            sectionType: section.sectionType || "general",
            backgroundColor: section.backgroundColor || null,
            textColor: section.textColor || null,
            menuId: savedMenu.id,
          },
        });
        sectionIdMapping.set(section.id, createdSection.id);
      }

      // Create menu items with correct section references
      // Collect all items from sections and standalone menuItems
      const allItems = [];

      // Add items from sections
      if (currentInMemoryMenu.menuSections) {
        currentInMemoryMenu.menuSections.forEach((section) => {
          if (section.menuItems && section.menuItems.length > 0) {
            section.menuItems.forEach((item) => {
              allItems.push({
                ...item,
                sectionId: section.id, // Ensure section reference
              });
            });
          }
        });
      }

      // Add standalone items (not in sections)
      if (currentInMemoryMenu.menuItems) {
        currentInMemoryMenu.menuItems.forEach((item) => {
          // Only add if not already added from sections
          if (!allItems.find((existingItem) => existingItem.id === item.id)) {
            allItems.push(item);
          }
        });
      }

      // Create menu items in database
      for (const item of allItems) {
        let finalSectionId = null;
        if (item.sectionId) {
          finalSectionId = sectionIdMapping.get(item.sectionId) || null;
        }
        await tx.menuItem.create({
          data: {
            name: item.name,
            price: item.price,
            description: item.description || null,
            position: item.position || 0,
            imageUrl: item.imageUrl || "",
            showImage: item.showImage || false,
            sectionId: finalSectionId,
            menuId: savedMenu.id,
          },
        });
      }

      // Create pasta type relations
      if (
        currentInMemoryMenu.pastaTypes &&
        currentInMemoryMenu.pastaTypes.length > 0
      ) {
        for (const pastaType of currentInMemoryMenu.pastaTypes) {
          await tx.menuToPastaType.create({
            data: {
              menuId: savedMenu.id,
              pastaTypeId: pastaType.pastaType
                ? pastaType.pastaType.id
                : pastaType.id,
            },
          });
        }
      }

      // Create pasta sauce relations
      if (
        currentInMemoryMenu.pastaSauces &&
        currentInMemoryMenu.pastaSauces.length > 0
      ) {
        for (const pastaSauce of currentInMemoryMenu.pastaSauces) {
          await tx.menuToPastaSauce.create({
            data: {
              menuId: savedMenu.id,
              pastaSauceId: pastaSauce.pastaSauce
                ? pastaSauce.pastaSauce.id
                : pastaSauce.id,
            },
          });
        }
      }

      // Return the complete saved menu with all relations
      return await tx.menu.findUnique({
        where: { id: savedMenu.id },
        include: {
          menuItems: {
            orderBy: [{ sectionId: "asc" }, { position: "asc" }],
          },
          menuSections: {
            orderBy: { position: "asc" },
            include: {
              menuItems: {
                orderBy: { position: "asc" },
              },
            },
          },
          pastaTypes: { include: { pastaType: true } },
          pastaSauces: { include: { pastaSauce: true } },
        },
      });
    });

    // Ensure predefined sections exist for the newly saved menu
    await ensurePredefinedSections(result.id);

    // Create the SavedMenu entry that references this menu
    const savedMenuEntry = await prisma.savedMenu.create({
      data: {
        name: name,
        menuId: result.id,
      },
      include: {
        menu: {
          include: {
            menuItems: {
              orderBy: [{ sectionId: "asc" }, { position: "asc" }],
            },
            menuSections: {
              orderBy: { position: "asc" },
              include: {
                menuItems: {
                  orderBy: { position: "asc" },
                },
              },
            },
            pastaTypes: { include: { pastaType: true } },
            pastaSauces: { include: { pastaSauce: true } },
          },
        },
      },
    });

    console.log("Menu saved successfully:", savedMenuEntry.name);
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
      orderBy: { savedAt: "desc" },
      include: {
        menu: {
          include: {
            logo: true, // Include logo details
            background: true, // Include background configuration
            menuItems: {
              orderBy: [{ sectionId: "asc" }, { position: "asc" }],
            },
            menuSections: {
              orderBy: { position: "asc" },
              include: {
                menuItems: {
                  orderBy: { position: "asc" },
                },
              },
            },
            pastaTypes: { include: { pastaType: true } },
            pastaSauces: { include: { pastaSauce: true } },
          },
        },
      },
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
            logo: true, // Include logo details
            background: true, // Include background configuration
            menuItems: {
              orderBy: [{ sectionId: "asc" }, { position: "asc" }],
            },
            menuSections: {
              orderBy: { position: "asc" },
              include: {
                menuItems: {
                  orderBy: { position: "asc" },
                },
              },
            },
            pastaTypes: { include: { pastaType: true } },
            pastaSauces: { include: { pastaSauce: true } },
          },
        },
      },
    });

    if (savedMenu) {
      // Convert database format to in-memory format
      currentInMemoryMenu = {
        id: savedMenu.menu.id,
        createdAt: savedMenu.menu.createdAt,
        orientation: savedMenu.menu.orientation || "vertical",
        availableImages: savedMenu.menu.availableImages,
        background: savedMenu.menu.background, // Include background configuration
        logo: savedMenu.menu.logo, // Include logo configuration
        logoId: savedMenu.menu.logoId, // Include logo ID
        menuItems: savedMenu.menu.menuItems,
        menuSections: savedMenu.menu.menuSections || [],
        pastaTypes: savedMenu.menu.pastaTypes,
        pastaSauces: savedMenu.menu.pastaSauces,
      };

      // Ensure predefined sections exist for the loaded menu
      await ensurePredefinedSections(savedMenu.menu.id);

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
      where: { id: savedMenuId },
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
    try {
      // Determine position for new section
      const existingSections = currentInMemoryMenu.menuSections || [];
      const maxPosition =
        existingSections.length > 0
          ? Math.max(...existingSections.map((s) => s.position || 0))
          : -1;

      // Save section directly to database
      const createdSection = await prisma.menuSection.create({
        data: {
          name: sectionData.name,
          header: sectionData.header || null,
          position: maxPosition + 1,
          sectionType: "general",
          backgroundColor: null,
          textColor: null,
          menuId: currentInMemoryMenu.id,
        },
        include: {
          menuItems: {
            orderBy: { position: "asc" },
          },
        },
      });

      // Add to in-memory menu
      if (!currentInMemoryMenu.menuSections) {
        currentInMemoryMenu.menuSections = [];
      }
      currentInMemoryMenu.menuSections.push(createdSection);

      // Sort sections by position
      currentInMemoryMenu.menuSections.sort((a, b) => a.position - b.position);

      console.log("✅ Section added to database:", createdSection.name);
      return currentInMemoryMenu;
    } catch (error) {
      console.error("❌ Error adding section to database:", error);
      return false;
    }
  }
  return false;
}

async function removeSectionFromMenu(sectionId) {
  if (!currentInMemoryMenu || !currentInMemoryMenu.menuSections) return false;

  if (typeof sectionId === "number") {
    try {
      const sectionIndex = currentInMemoryMenu.menuSections.findIndex(
        (s) => s.id === sectionId
      );
      if (sectionIndex !== -1) {
        const removedSection = currentInMemoryMenu.menuSections[sectionIndex];

        // First, handle items from the removed section
        if (removedSection.menuItems && removedSection.menuItems.length > 0) {
          if (currentInMemoryMenu.menuSections.length > 1) {
            // Move to first remaining section
            const targetSection = currentInMemoryMenu.menuSections.find(
              (s) => s.id !== sectionId
            );
            if (targetSection) {
              // Update items in database to move to target section
              await prisma.menuItem.updateMany({
                where: { sectionId: sectionId },
                data: { sectionId: targetSection.id },
              });

              // Update in-memory
              targetSection.menuItems = targetSection.menuItems || [];
              targetSection.menuItems.push(...removedSection.menuItems);
            }
          } else {
            // Make items unsectioned (remove sectionId)
            await prisma.menuItem.updateMany({
              where: { sectionId: sectionId },
              data: { sectionId: null },
            });

            // Update in-memory
            removedSection.menuItems.forEach((item) => {
              item.sectionId = null;
              const menuItem = currentInMemoryMenu.menuItems.find(
                (mi) => mi.id === item.id
              );
              if (menuItem) {
                menuItem.sectionId = null;
              }
            });
          }
        }

        // Delete the section from database
        await prisma.menuSection.delete({
          where: { id: sectionId },
        });

        // Remove from in-memory menu
        currentInMemoryMenu.menuSections.splice(sectionIndex, 1);

        console.log("✅ Section removed from database and memory:", sectionId);
        return true;
      }
    } catch (error) {
      console.error("❌ Error removing section from database:", error);
      return false;
    }
  }
  return false;
}

async function updateSectionOrder(sectionUpdates) {
  if (!currentInMemoryMenu || !currentInMemoryMenu.menuSections) return false;

  try {
    // Update positions in database for each section
    for (const update of sectionUpdates) {
      await prisma.menuSection.update({
        where: { id: update.id },
        data: { position: update.position },
      });
    }

    // Update positions in in-memory menu
    sectionUpdates.forEach((update) => {
      const section = currentInMemoryMenu.menuSections.find(
        (s) => s.id === update.id
      );
      if (section) {
        section.position = update.position;
      }
    });

    // Sort sections by position
    currentInMemoryMenu.menuSections.sort((a, b) => a.position - b.position);

    console.log("✅ Section order updated in database and memory");
    return true;
  } catch (error) {
    console.error("❌ Error updating section order:", error);
    return false;
  }
}

async function moveItemToSection(itemId, targetSectionId, position) {
  if (!currentInMemoryMenu) return false;

  try {
    const item = currentInMemoryMenu.menuItems.find(
      (item) => item.id === itemId
    );
    if (item) {
      // Update in database first
      await prisma.menuItem.update({
        where: { id: itemId },
        data: {
          sectionId: targetSectionId,
          position: position || 0,
        },
      });

      // Remove from current section if it has one
      if (item.sectionId && currentInMemoryMenu.menuSections) {
        const currentSection = currentInMemoryMenu.menuSections.find(
          (s) => s.id === item.sectionId
        );
        if (currentSection && currentSection.menuItems) {
          currentSection.menuItems = currentSection.menuItems.filter(
            (i) => i.id !== itemId
          );
        }
      }

      // Update item's section in memory
      item.sectionId = targetSectionId;
      item.position = position || 0;

      // Add to target section
      if (targetSectionId && currentInMemoryMenu.menuSections) {
        const targetSection = currentInMemoryMenu.menuSections.find(
          (s) => s.id === targetSectionId
        );
        if (targetSection) {
          if (!targetSection.menuItems) {
            targetSection.menuItems = [];
          }
          targetSection.menuItems.push(item);
          // Sort items in section by position
          targetSection.menuItems.sort(
            (a, b) => (a.position || 0) - (b.position || 0)
          );
        }
      }

      console.log("✅ Item moved to section in database and memory:", itemId);
      return true;
    }
    return false;
  } catch (error) {
    console.error("❌ Error moving item to section:", error);
    return false;
  }
}

async function updateItemPositions(itemUpdates) {
  if (!currentInMemoryMenu) return false;

  try {
    // Update positions in database for each item
    for (const update of itemUpdates) {
      const updateData = { position: update.position };
      if (update.sectionId !== undefined) {
        updateData.sectionId = update.sectionId;
      }

      await prisma.menuItem.update({
        where: { id: update.itemId },
        data: updateData,
      });
    }

    // Update positions in in-memory menu
    itemUpdates.forEach((update) => {
      const item = currentInMemoryMenu.menuItems.find(
        (item) => item.id === update.itemId
      );
      if (item) {
        item.position = update.position;
        if (update.sectionId !== undefined) {
          item.sectionId = update.sectionId;
        }
      }
    });

    // Update section menuItems arrays
    if (currentInMemoryMenu.menuSections) {
      currentInMemoryMenu.menuSections.forEach((section) => {
        section.menuItems = currentInMemoryMenu.menuItems
          .filter((item) => item.sectionId === section.id)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
      });
    }

    console.log("✅ Item positions updated in database and memory");
    return true;
  } catch (error) {
    console.error("❌ Error updating item positions:", error);
    return false;
  }
}

async function updateGlobalPastaDisplaySettings(settings) {
  if (!currentInMemoryMenu) return false;

  try {
    // Update the database
    const menuId = currentInMemoryMenu.id;
    if (menuId) {
      await prisma.menu.update({
        where: { id: menuId },
        data: {
          globalPastaTypeFontSize: settings.pastaTypeFontSize,
          globalPastaSauceFontSize: settings.pastaSauceFontSize,
          globalPastaTypeShowImage: settings.pastaTypeShowImage,
          globalPastaTypeImageSize: settings.pastaTypeImageSize,
          globalPastaTypeShowDescription: settings.pastaTypeShowDescription,
          globalPastaSauceShowImage: settings.pastaSauceShowImage,
          globalPastaSauceImageSize: settings.pastaSauceImageSize,
          globalPastaSauceShowDescription: settings.pastaSauceShowDescription,
        },
      });
    }

    // Update the in-memory menu
    currentInMemoryMenu.globalPastaTypeFontSize = settings.pastaTypeFontSize;
    currentInMemoryMenu.globalPastaSauceFontSize = settings.pastaSauceFontSize;
    currentInMemoryMenu.globalPastaTypeShowImage = settings.pastaTypeShowImage;
    currentInMemoryMenu.globalPastaTypeImageSize = settings.pastaTypeImageSize;
    currentInMemoryMenu.globalPastaTypeShowDescription =
      settings.pastaTypeShowDescription;
    currentInMemoryMenu.globalPastaSauceShowImage =
      settings.pastaSauceShowImage;
    currentInMemoryMenu.globalPastaSauceImageSize =
      settings.pastaSauceImageSize;
    currentInMemoryMenu.globalPastaSauceShowDescription =
      settings.pastaSauceShowDescription;

    console.log("✅ Global pasta display settings updated:", settings);
    return true;
  } catch (error) {
    console.error("❌ Error updating global pasta display settings:", error);
    return false;
  }
}

// Logo Management Functions

async function updateLogo(logoUrl, logoSettings = {}) {
  try {
    if (!currentInMemoryMenu) {
      console.error("No current menu to update logo");
      return false;
    }

    // Create or update logo
    let logo;
    if (currentInMemoryMenu.logoId) {
      // Update existing logo
      logo = await prisma.logo.update({
        where: { id: currentInMemoryMenu.logoId },
        data: {
          imageUrl: logoUrl,
          name: logoSettings.name || "Menu Logo",
          position: logoSettings.position || "top-left",
          size: logoSettings.size || "medium",
          opacity: logoSettings.opacity || 1.0,
          // Remove isActive - use in-memory menu state instead
        },
      });
    } else {
      // Create new logo
      logo = await prisma.logo.create({
        data: {
          name: logoSettings.name || "Menu Logo",
          imageUrl: logoUrl,
          position: logoSettings.position || "top-left",
          size: logoSettings.size || "medium",
          opacity: logoSettings.opacity || 1.0,
          isActive: false, // Default to false, activation is through menu linkage
        },
      });

      // Link logo to current menu
      await prisma.menu.update({
        where: { id: currentInMemoryMenu.id },
        data: { logoId: logo.id },
      });
    }

    // Update in-memory menu
    currentInMemoryMenu.logoId = logo.id;
    currentInMemoryMenu.logo = logo;

    console.log("✅ Logo updated successfully");
    return true;
  } catch (error) {
    console.error("❌ Error updating logo:", error);
    return false;
  }
}

async function removeLogo() {
  try {
    if (!currentInMemoryMenu || !currentInMemoryMenu.logoId) {
      console.error("No current menu or logo to remove");
      return false;
    }

    // Remove logo reference from menu (but keep logo in database for reuse)
    await prisma.menu.update({
      where: { id: currentInMemoryMenu.id },
      data: { logoId: null },
    });

    // Update in-memory menu
    currentInMemoryMenu.logoId = null;
    currentInMemoryMenu.logo = null;

    console.log("✅ Logo removed from menu successfully");
    return true;
  } catch (error) {
    console.error("❌ Error removing logo:", error);
    return false;
  }
}

async function updateLogoSettings(logoSettings = {}) {
  try {
    if (!currentInMemoryMenu || !currentInMemoryMenu.logoId) {
      console.error("No current menu or logo to update settings");
      return false;
    }

    // Update logo settings in the database
    const updatedLogo = await prisma.logo.update({
      where: { id: currentInMemoryMenu.logoId },
      data: {
        name:
          logoSettings.name || currentInMemoryMenu.logo?.name || "Menu Logo",
        position:
          logoSettings.position ||
          currentInMemoryMenu.logo?.position ||
          "top-left",
        size: logoSettings.size || currentInMemoryMenu.logo?.size || "medium",
        opacity:
          logoSettings.opacity !== undefined
            ? logoSettings.opacity
            : currentInMemoryMenu.logo?.opacity || 1.0,
        // Remove isActive - use in-memory menu state for activation
      },
    });

    // Update in-memory menu
    currentInMemoryMenu.logo = updatedLogo;

    console.log("✅ Logo settings updated successfully");
    return true;
  } catch (error) {
    console.error("❌ Error updating logo settings:", error);
    return false;
  }
}

async function getAvailableLogos() {
  try {
    const logos = await prisma.logo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return logos;
  } catch (error) {
    console.error("❌ Error getting available logos:", error);
    return [];
  }
}

async function setMenuLogo(logoId) {
  try {
    if (!currentInMemoryMenu) {
      console.error("No current menu to set logo");
      return false;
    }

    // Verify logo exists
    const logo = await prisma.logo.findUnique({
      where: { id: logoId },
    });

    if (!logo) {
      console.error("Logo not found:", logoId);
      return false;
    }

    // Update menu with new logo
    await prisma.menu.update({
      where: { id: currentInMemoryMenu.id },
      data: { logoId: logoId },
    });

    // Update in-memory menu
    currentInMemoryMenu.logoId = logoId;
    currentInMemoryMenu.logo = logo;

    console.log("✅ Menu logo set successfully");
    return true;
  } catch (error) {
    console.error("❌ Error setting menu logo:", error);
    return false;
  }
}

async function deleteLogo(logoId) {
  try {
    // Check if logo is being used by any menus
    const menusUsingLogo = await prisma.menu.findMany({
      where: { logoId: logoId },
    });

    if (menusUsingLogo.length > 0) {
      // Remove logo from all menus first
      await prisma.menu.updateMany({
        where: { logoId: logoId },
        data: { logoId: null },
      });

      // Update in-memory menu if it's using this logo
      if (currentInMemoryMenu && currentInMemoryMenu.logoId === logoId) {
        currentInMemoryMenu.logoId = null;
        currentInMemoryMenu.logo = null;
      }
    }

    // Delete the logo
    await prisma.logo.delete({
      where: { id: logoId },
    });

    console.log("✅ Logo deleted successfully");
    return true;
  } catch (error) {
    console.error("❌ Error deleting logo:", error);
    return false;
  }
}

// Enhanced Section Management Functions

async function updateSectionStyle(sectionId, style = {}) {
  try {
    if (!currentInMemoryMenu) {
      console.error("No current menu to update section style");
      return false;
    }

    // Update section style in database
    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: {
        sectionType: style.sectionType || "general",
        backgroundColor: style.backgroundColor || null,
        textColor: style.textColor || null,
      },
    });

    // Update in-memory menu
    const sectionIndex = currentInMemoryMenu.menuSections.findIndex(
      (s) => s.id === sectionId
    );
    if (sectionIndex !== -1) {
      currentInMemoryMenu.menuSections[sectionIndex] = {
        ...currentInMemoryMenu.menuSections[sectionIndex],
        sectionType: style.sectionType || "general",
        backgroundColor: style.backgroundColor || null,
        textColor: style.textColor || null,
      };
    }

    console.log("✅ Section style updated successfully");
    return true;
  } catch (error) {
    console.error("❌ Error updating section style:", error);
    return false;
  }
}

// Specific section color management functions
async function updateSectionColors(sectionId, backgroundColor, textColor) {
  console.log("🎨 updateSectionColors called with:", {
    sectionId,
    backgroundColor,
    textColor,
  });

  if (!currentInMemoryMenu) {
    console.error("❌ No current in-memory menu available");
    return false;
  }

  try {
    // Validate colors if provided
    if (backgroundColor || textColor) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (backgroundColor && !hexColorRegex.test(backgroundColor)) {
        throw new Error("Invalid background color format");
      }
      if (textColor && !hexColorRegex.test(textColor)) {
        throw new Error("Invalid text color format");
      }
    } // Update section colors in database
    console.log("🎨 Updating section in database...");

    // First check if the section exists
    const existingSection = await prisma.menuSection.findUnique({
      where: { id: sectionId },
    });

    if (!existingSection) {
      console.log("⚠️ Section not found in database, section ID:", sectionId);
      console.log(
        "🔍 Available sections:",
        await prisma.menuSection.findMany({ select: { id: true, name: true } })
      );
      throw new Error(`Section with ID ${sectionId} not found in database`);
    }

    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: {
        backgroundColor: backgroundColor || null,
        textColor: textColor || null,
      },
    });
    console.log("🎨 Database update successful:", updatedSection);

    // Update in-memory menu
    const sectionIndex = currentInMemoryMenu.menuSections.findIndex(
      (s) => s.id === sectionId
    );
    if (sectionIndex !== -1) {
      console.log("🎨 Updating in-memory menu section at index:", sectionIndex);
      currentInMemoryMenu.menuSections[sectionIndex] = {
        ...currentInMemoryMenu.menuSections[sectionIndex],
        backgroundColor: backgroundColor || null,
        textColor: textColor || null,
      };
      console.log(
        "🎨 In-memory section updated:",
        currentInMemoryMenu.menuSections[sectionIndex]
      );
    } else {
      console.error("❌ Section not found in in-memory menu:", sectionId);
    }

    console.log(
      `✅ Section colors updated: ${sectionId} - bg: ${backgroundColor}, text: ${textColor}`
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating section colors:", error);
    return false;
  }
}

async function resetSectionColors(sectionId) {
  if (!currentInMemoryMenu) return false;

  try {
    // Reset section colors in database
    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: {
        backgroundColor: null,
        textColor: null,
      },
    });

    // Update in-memory menu
    const sectionIndex = currentInMemoryMenu.menuSections.findIndex(
      (s) => s.id === sectionId
    );
    if (sectionIndex !== -1) {
      currentInMemoryMenu.menuSections[sectionIndex] = {
        ...currentInMemoryMenu.menuSections[sectionIndex],
        backgroundColor: null,
        textColor: null,
      };
    }

    console.log(`✅ Section colors reset to default: ${sectionId}`);
    return true;
  } catch (error) {
    console.error("❌ Error resetting section colors:", error);
    return false;
  }
}

async function updateSectionType(sectionId, sectionType) {
  if (!currentInMemoryMenu) return false;

  try {
    // Validate section type
    const validTypes = ["general", "pasta", "sauce", "insalatone", "Pokè"];
    if (!validTypes.includes(sectionType)) {
      throw new Error(`Invalid section type: ${sectionType}`);
    }

    // Update section type in database
    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: { sectionType },
    });

    // Update in-memory menu
    const sectionIndex = currentInMemoryMenu.menuSections.findIndex(
      (s) => s.id === sectionId
    );
    if (sectionIndex !== -1) {
      currentInMemoryMenu.menuSections[sectionIndex] = {
        ...currentInMemoryMenu.menuSections[sectionIndex],
        sectionType,
      };
    }

    console.log(`✅ Section type updated: ${sectionId} -> ${sectionType}`);
    return true;
  } catch (error) {
    console.error("❌ Error updating section type:", error);
    return false;
  }
}

// Global pasta types and sauces color management
async function updatePastaTypesGlobalColor(backgroundColor) {
  if (!currentInMemoryMenu) return false;

  try {
    // Validate color if provided
    if (backgroundColor) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(backgroundColor)) {
        throw new Error("Invalid background color format");
      }
    }

    // Update global pasta types color in database
    const updatedMenu = await prisma.menu.update({
      where: { id: currentInMemoryMenu.id },
      data: {
        globalPastaTypeBackgroundColor: backgroundColor || null,
      },
    });

    // Update in-memory menu
    currentInMemoryMenu.globalPastaTypeBackgroundColor =
      backgroundColor || null;

    console.log(
      `✅ Global pasta types background color updated: ${backgroundColor}`
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating pasta types global color:", error);
    return false;
  }
}

async function updatePastaSaucesGlobalColor(backgroundColor) {
  if (!currentInMemoryMenu) return false;

  try {
    // Validate color if provided
    if (backgroundColor) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(backgroundColor)) {
        throw new Error("Invalid background color format");
      }
    }

    // Update global pasta sauces color in database
    const updatedMenu = await prisma.menu.update({
      where: { id: currentInMemoryMenu.id },
      data: {
        globalPastaSauceBackgroundColor: backgroundColor || null,
      },
    });

    // Update in-memory menu
    currentInMemoryMenu.globalPastaSauceBackgroundColor =
      backgroundColor || null;

    console.log(
      `✅ Global pasta sauces background color updated: ${backgroundColor}`
    );
    return true;
  } catch (error) {
    console.error("❌ Error updating pasta sauces global color:", error);
    return false;
  }
}

// Predefined section types
const PREDEFINED_SECTIONS = [
  { name: "Pokè", sectionType: "Pokè" },
  { name: "Insalatone", sectionType: "insalatone" },
];

async function ensurePredefinedSections(menuId) {
  try {
    for (const predefinedSection of PREDEFINED_SECTIONS) {
      // Check if section already exists in database
      const existingInDB = await prisma.menuSection.findFirst({
        where: {
          menuId: menuId,
          sectionType: predefinedSection.sectionType,
        },
      });

      // Check if section already exists in memory
      const existingInMemory = currentInMemoryMenu?.sections?.find(
        (section) => section.sectionType === predefinedSection.sectionType
      );

      // Only create if it doesn't exist in either location
      if (!existingInDB && !existingInMemory) {
        // Find the highest position
        const maxPosition = await prisma.menuSection.findFirst({
          where: { menuId },
          orderBy: { position: "desc" },
          select: { position: true },
        });

        const nextPosition = maxPosition ? maxPosition.position + 1 : 0;

        // Create the predefined section
        const newSection = await prisma.menuSection.create({
          data: {
            name: predefinedSection.name,
            sectionType: predefinedSection.sectionType,
            position: nextPosition,
            menuId: menuId,
          },
        });

        // Add to in-memory menu if it exists
        if (currentInMemoryMenu?.sections) {
          currentInMemoryMenu.sections.push({
            id: newSection.id,
            name: newSection.name,
            sectionType: newSection.sectionType,
            position: newSection.position,
            menuId: newSection.menuId,
            items: [],
            color: newSection.color || null,
            fontSize: newSection.fontSize || null,
          });
        }

        console.log(`Created predefined section: ${predefinedSection.name}`);
      } else if (existingInMemory && !existingInDB) {
        console.log(
          `Section ${predefinedSection.name} exists in memory but not in DB - will be saved later`
        );
      } else {
        console.log(
          `Section ${predefinedSection.name} already exists, skipping creation`
        );
      }
    }
  } catch (error) {
    console.error("Error ensuring predefined sections:", error);
  }
}

// Background management functions
async function refreshMenuBackground() {
  try {
    if (!currentInMemoryMenu) {
      console.log("No current menu to refresh background for");
      return;
    }

    // Get the latest background configuration from the database
    const backgroundConfig = await prisma.backgroundConfig.findFirst({
      where: { page: "pasta" }, // Use fixed page since we only have one
    });

    // Update the in-memory menu's background
    currentInMemoryMenu.background = backgroundConfig;

    console.log(
      "✅ Menu background refreshed in memory:",
      backgroundConfig ? backgroundConfig.id : "null"
    );
    return backgroundConfig;
  } catch (error) {
    console.error("Error refreshing menu background:", error);
    throw error;
  }
}

module.exports = {
  loadInitialMenu,
  getCurrentMenu,
  setCurrentMenu,
  refreshInMemoryMenu,
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
  updateMenuOrientation,
  updateMenuAvailableImages,
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
  updateGlobalPastaDisplaySettings,
  // Logo management functions
  updateLogo,
  removeLogo,
  updateLogoSettings,
  getAvailableLogos,
  setMenuLogo,
  deleteLogo,
  // Enhanced section management
  updateSectionStyle,
  updateSectionColors,
  resetSectionColors,
  updateSectionType,
  // Global pasta types and sauces color management
  updatePastaTypesGlobalColor,
  updatePastaSaucesGlobalColor,
  ensurePredefinedSections,
  refreshMenuBackground,
};
