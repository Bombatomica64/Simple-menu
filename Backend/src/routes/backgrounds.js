const express = require('express');
const { PrismaClient } = require('@prisma/client');
const upload = require('../config/multer');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to generate full image URL
function getFullImageUrl(req, filename) {
  const protocol = req.get('X-Forwarded-Proto') || req.protocol;
  const host = req.get('X-Forwarded-Host') || req.get('host');
  return `${protocol}://${host}/assets/${filename}`;
}

// POST /api/backgrounds/upload - Upload background image
router.post('/upload', upload.single('backgroundImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No background image file provided' });
  }

  try {
    const imageUrl = getFullImageUrl(req, req.file.filename);
    
    res.json({
      message: 'Background image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading background image:', error);
    res.status(500).json({ 
      error: 'Failed to upload background image',
      details: error.message 
    });
  }
});

// GET /api/backgrounds/:page - Get background configuration for a specific page
router.get('/:page', async (req, res) => {
  try {
    const { page } = req.params;
    
    const backgroundConfig = await prisma.backgroundConfig.findUnique({
      where: { page }
    });

    if (!backgroundConfig) {
      return res.status(404).json({ 
        error: 'Background configuration not found for this page',
        page 
      });
    }

    res.json(backgroundConfig);
  } catch (error) {
    console.error('Error fetching background config:', error);
    res.status(500).json({ 
      error: 'Failed to fetch background configuration',
      details: error.message 
    });
  }
});

// GET /api/backgrounds/menu/:menuId - Get background configuration for a specific menu
router.get('/menu/:menuId', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: { background: true }
    });

    if (!menu) {
      return res.status(404).json({ 
        error: 'Menu not found',
        menuId 
      });
    }

    if (!menu.background) {
      return res.status(404).json({ 
        error: 'No background configuration found for this menu',
        menuId 
      });
    }

    res.json(menu.background);
  } catch (error) {
    console.error('Error fetching menu background config:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu background configuration',
      details: error.message 
    });
  }
});

// POST /api/backgrounds - Create/update background configuration
router.post('/', async (req, res) => {
  try {
    const { page, type, value } = req.body;

    if (!page || !type || !value) {
      return res.status(400).json({ 
        error: 'Page, type, and value are required',
        required: ['page', 'type', 'value']
      });
    }

    // Validate type
    const validTypes = ['color', 'gradient', 'image'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid background type',
        validTypes 
      });
    }

    // Validate page parameter
    const validPages = ['pasta', 'menu', 'submit'];
    if (!validPages.includes(page)) {
      return res.status(400).json({ 
        error: 'Invalid page specified',
        validPages 
      });
    }

    const backgroundConfig = await prisma.backgroundConfig.upsert({
      where: { page },
      update: { 
        type,
        value,
        updatedAt: new Date()
      },
      create: { 
        page, 
        type,
        value
      }
    });

    res.json(backgroundConfig);
  } catch (error) {
    console.error('Error saving background config:', error);
    res.status(500).json({ 
      error: 'Failed to save background configuration',
      details: error.message 
    });
  }
});

// PUT /api/backgrounds/page/:page - Set/update background configuration for a specific page (legacy support)
router.put('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const { background, type, value } = req.body;

    // Handle legacy format where only 'background' was provided
    const finalType = type || 'color'; // Default to color for legacy support
    const finalValue = value || background;

    if (!finalValue) {
      return res.status(400).json({ 
        error: 'Background value is required' 
      });
    }

    // Validate page parameter
    const validPages = ['pasta', 'main', 'sections', 'menu', 'submit'];
    if (!validPages.includes(page)) {
      return res.status(400).json({ 
        error: 'Invalid page specified',
        validPages 
      });
    }

    const backgroundConfig = await prisma.backgroundConfig.upsert({
      where: { page },
      update: { 
        type: finalType,
        value: finalValue,
        updatedAt: new Date()
      },
      create: { 
        page, 
        type: finalType,
        value: finalValue
      }
    });

    res.json({
      message: 'Page background configuration updated successfully',
      config: backgroundConfig
    });
  } catch (error) {
    console.error('Error updating page background config:', error);
    res.status(500).json({ 
      error: 'Failed to update page background configuration',
      details: error.message 
    });
  }
});

// PUT /api/backgrounds/menu/:menuId - Set/update background configuration for a specific menu
router.put('/menu/:menuId', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);
    const { background, type, value } = req.body;

    // Handle legacy format where only 'background' was provided
    const finalType = type || 'color'; // Default to color for legacy support
    const finalValue = value || background;

    if (!finalValue) {
      return res.status(400).json({ 
        error: 'Background value is required' 
      });
    }

    // Check if menu exists
    const menu = await prisma.menu.findUnique({
      where: { id: menuId }
    });

    if (!menu) {
      return res.status(404).json({ 
        error: 'Menu not found',
        menuId 
      });
    }

    // Create or update background config
    const backgroundConfig = await prisma.backgroundConfig.create({
      data: { 
        type: finalType,
        value: finalValue
      }
    });

    // Update menu to reference the background config
    await prisma.menu.update({
      where: { id: menuId },
      data: { backgroundId: backgroundConfig.id }
    });

    res.json({
      message: 'Menu background configuration updated successfully',
      config: backgroundConfig,
      menuId
    });
  } catch (error) {
    console.error('Error updating menu background config:', error);
    res.status(500).json({ 
      error: 'Failed to update menu background configuration',
      details: error.message 
    });
  }
});

// GET /api/backgrounds - Get all background configurations
router.get('/', async (req, res) => {
  try {
    const backgroundConfigs = await prisma.backgroundConfig.findMany({
      orderBy: { page: 'asc' },
      include: { 
        menus: {
          select: { id: true, createdAt: true }
        }
      }
    });

    res.json(backgroundConfigs);
  } catch (error) {
    console.error('Error fetching all background configs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch background configurations',
      details: error.message 
    });
  }
});

// DELETE /api/backgrounds/page/:page - Delete background configuration for a specific page
router.delete('/page/:page', async (req, res) => {
  try {
    const { page } = req.params;

    const deletedConfig = await prisma.backgroundConfig.delete({
      where: { page }
    });

    res.json({
      message: 'Page background configuration deleted successfully',
      deletedConfig
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Background configuration not found for this page' 
      });
    }
    
    console.error('Error deleting page background config:', error);
    res.status(500).json({ 
      error: 'Failed to delete page background configuration',
      details: error.message 
    });
  }
});

// DELETE /api/backgrounds/menu/:menuId - Remove background configuration from a specific menu
router.delete('/menu/:menuId', async (req, res) => {
  try {
    const menuId = parseInt(req.params.menuId);

    // Remove background reference from menu
    const updatedMenu = await prisma.menu.update({
      where: { id: menuId },
      data: { backgroundId: null }
    });

    res.json({
      message: 'Menu background configuration removed successfully',
      menuId
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Menu not found' 
      });
    }
    
    console.error('Error removing menu background config:', error);
    res.status(500).json({ 
      error: 'Failed to remove menu background configuration',
      details: error.message 
    });
  }
});

module.exports = router;
