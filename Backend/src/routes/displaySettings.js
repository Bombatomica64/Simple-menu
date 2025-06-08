const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Get display settings for a specific menu
router.get('/:menuId/display-settings', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      select: {
        globalPastaTypeShowImage: true,
        globalPastaTypeImageSize: true,
        globalPastaTypeShowDescription: true,
        globalPastaTypeFontSize: true,
        globalPastaSauceShowImage: true,
        globalPastaSauceImageSize: true,
        globalPastaSauceShowDescription: true,
        globalPastaSauceFontSize: true,
      }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json({
      pastaTypes: {
        showImage: menu.globalPastaTypeShowImage,
        imageSize: menu.globalPastaTypeImageSize,
        showDescription: menu.globalPastaTypeShowDescription,
        fontSize: menu.globalPastaTypeFontSize,
      },
      pastaSauces: {
        showImage: menu.globalPastaSauceShowImage,
        imageSize: menu.globalPastaSauceImageSize,
        showDescription: menu.globalPastaSauceShowDescription,
        fontSize: menu.globalPastaSauceFontSize,
      }
    });
  } catch (error) {
    console.error('Error fetching display settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update global display settings for a menu
router.put('/:menuId/display-settings', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const { pastaTypes, pastaSauces } = req.body;

    const updateData = {};
    
    if (pastaTypes) {
      if (pastaTypes.showImage !== undefined) updateData.globalPastaTypeShowImage = pastaTypes.showImage;
      if (pastaTypes.imageSize !== undefined) updateData.globalPastaTypeImageSize = pastaTypes.imageSize;
      if (pastaTypes.showDescription !== undefined) updateData.globalPastaTypeShowDescription = pastaTypes.showDescription;
      if (pastaTypes.fontSize !== undefined) updateData.globalPastaTypeFontSize = pastaTypes.fontSize;
    }
    
    if (pastaSauces) {
      if (pastaSauces.showImage !== undefined) updateData.globalPastaSauceShowImage = pastaSauces.showImage;
      if (pastaSauces.imageSize !== undefined) updateData.globalPastaSauceImageSize = pastaSauces.imageSize;
      if (pastaSauces.showDescription !== undefined) updateData.globalPastaSauceShowDescription = pastaSauces.showDescription;
      if (pastaSauces.fontSize !== undefined) updateData.globalPastaSauceFontSize = pastaSauces.fontSize;
    }

    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: updateData,
      select: {
        globalPastaTypeShowImage: true,
        globalPastaTypeImageSize: true,
        globalPastaTypeShowDescription: true,
        globalPastaTypeFontSize: true,
        globalPastaSauceShowImage: true,
        globalPastaSauceImageSize: true,
        globalPastaSauceShowDescription: true,
        globalPastaSauceFontSize: true,
      }
    });

    res.json({
      pastaTypes: {
        showImage: updatedMenu.globalPastaTypeShowImage,
        imageSize: updatedMenu.globalPastaTypeImageSize,
        showDescription: updatedMenu.globalPastaTypeShowDescription,
        fontSize: updatedMenu.globalPastaTypeFontSize,
      },
      pastaSauces: {
        showImage: updatedMenu.globalPastaSauceShowImage,
        imageSize: updatedMenu.globalPastaSauceImageSize,
        showDescription: updatedMenu.globalPastaSauceShowDescription,
        fontSize: updatedMenu.globalPastaSauceFontSize,
      }
    });
  } catch (error) {
    console.error('Error updating display settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get individual pasta type display settings
router.get('/:menuId/pasta-type/:pastaTypeId/display-settings', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const pastaTypeId = parseInt(req.params.pastaTypeId);
    
    const menuToPastaType = await prisma.menuToPastaType.findUnique({
      where: {
        menuId_pastaTypeId: {
          menuId: menuId,
          pastaTypeId: pastaTypeId
        }
      },
      select: {
        showImage: true,
        imageSize: true,
        showDescription: true,
        fontSize: true,
        customDescription: true,
        customFontColor: true,
        customBgColor: true,
      }
    });

    if (!menuToPastaType) {
      return res.status(404).json({ error: 'Pasta type not found in menu' });
    }

    res.json(menuToPastaType);
  } catch (error) {
    console.error('Error fetching pasta type display settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update individual pasta type display settings
router.put('/:menuId/pasta-type/:pastaTypeId/display-settings', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const pastaTypeId = parseInt(req.params.pastaTypeId);
    const { showImage, imageSize, showDescription, fontSize, customDescription, customFontColor, customBgColor } = req.body;

    const updateData = {};
    if (showImage !== undefined) updateData.showImage = showImage;
    if (imageSize !== undefined) updateData.imageSize = imageSize;
    if (showDescription !== undefined) updateData.showDescription = showDescription;
    if (fontSize !== undefined) updateData.fontSize = fontSize;
    if (customDescription !== undefined) updateData.customDescription = customDescription;
    if (customFontColor !== undefined) updateData.customFontColor = customFontColor;
    if (customBgColor !== undefined) updateData.customBgColor = customBgColor;

    const updatedSettings = await prisma.menuToPastaType.update({
      where: {
        menuId_pastaTypeId: {
          menuId: menuId,
          pastaTypeId: pastaTypeId
        }
      },
      data: updateData,
      select: {
        showImage: true,
        imageSize: true,
        showDescription: true,
        fontSize: true,
        customDescription: true,
        customFontColor: true,
        customBgColor: true,
      }
    });

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating pasta type display settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get individual pasta sauce display settings
router.get('/:menuId/pasta-sauce/:pastaSauceId/display-settings', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const pastaSauceId = parseInt(req.params.pastaSauceId);
    
    const menuToPastaSauce = await prisma.menuToPastaSauce.findUnique({
      where: {
        menuId_pastaSauceId: {
          menuId: menuId,
          pastaSauceId: pastaSauceId
        }
      },
      select: {
        showImage: true,
        imageSize: true,
        showDescription: true,
        fontSize: true,
        customDescription: true,
        customFontColor: true,
        customBgColor: true,
      }
    });

    if (!menuToPastaSauce) {
      return res.status(404).json({ error: 'Pasta sauce not found in menu' });
    }

    res.json(menuToPastaSauce);
  } catch (error) {
    console.error('Error fetching pasta sauce display settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update individual pasta sauce display settings
router.put('/:menuId/pasta-sauce/:pastaSauceId/display-settings', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const pastaSauceId = parseInt(req.params.pastaSauceId);
    const { showImage, imageSize, showDescription, fontSize, customDescription, customFontColor, customBgColor } = req.body;

    const updateData = {};
    if (showImage !== undefined) updateData.showImage = showImage;
    if (imageSize !== undefined) updateData.imageSize = imageSize;
    if (showDescription !== undefined) updateData.showDescription = showDescription;
    if (fontSize !== undefined) updateData.fontSize = fontSize;
    if (customDescription !== undefined) updateData.customDescription = customDescription;
    if (customFontColor !== undefined) updateData.customFontColor = customFontColor;
    if (customBgColor !== undefined) updateData.customBgColor = customBgColor;

    const updatedSettings = await prisma.menuToPastaSauce.update({
      where: {
        menuId_pastaSauceId: {
          menuId: menuId,
          pastaSauceId: pastaSauceId
        }
      },
      data: updateData,
      select: {
        showImage: true,
        imageSize: true,
        showDescription: true,
        fontSize: true,
        customDescription: true,
        customFontColor: true,
        customBgColor: true,
      }
    });

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating pasta sauce display settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply global settings to all individual items
router.post('/:menuId/apply-global-to-all', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const { applyToPastaTypes = true, applyToPastaSauces = true } = req.body;

    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      select: {
        globalPastaTypeShowImage: true,
        globalPastaTypeImageSize: true,
        globalPastaTypeShowDescription: true,
        globalPastaTypeFontSize: true,
        globalPastaSauceShowImage: true,
        globalPastaSauceImageSize: true,
        globalPastaSauceShowDescription: true,
        globalPastaSauceFontSize: true,
      }
    });

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    const updates = [];

    if (applyToPastaTypes) {
      updates.push(
        prisma.menuToPastaType.updateMany({
          where: { menuId: menuId },
          data: {
            showImage: menu.globalPastaTypeShowImage,
            imageSize: menu.globalPastaTypeImageSize,
            showDescription: menu.globalPastaTypeShowDescription,
            fontSize: menu.globalPastaTypeFontSize,
          }
        })
      );
    }

    if (applyToPastaSauces) {
      updates.push(
        prisma.menuToPastaSauce.updateMany({
          where: { menuId: menuId },
          data: {
            showImage: menu.globalPastaSauceShowImage,
            imageSize: menu.globalPastaSauceImageSize,
            showDescription: menu.globalPastaSauceShowDescription,
            fontSize: menu.globalPastaSauceFontSize,
          }
        })
      );
    }

    await Promise.all(updates);

    res.json({ message: 'Global settings applied to all items successfully' });
  } catch (error) {
    console.error('Error applying global settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
