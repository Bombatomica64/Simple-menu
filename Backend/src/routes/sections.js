const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const { broadcast } = require('../websocket/manager');

const prisma = new PrismaClient();

// Get all sections
router.get('/api/sections', async (req, res) => {
  try {
    const sections = await prisma.menuSection.findMany({
      orderBy: { position: 'asc' },
      include: {
        menuItems: {
          orderBy: { position: 'asc' }
        }
      }
    });

    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get a specific section
router.get('/api/sections/:id', async (req, res) => {
  try {
    const sectionId = parseInt(req.params.id);
    
    const section = await prisma.menuSection.findUnique({
      where: { id: sectionId },
      include: {
        menuItems: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Update section colors
router.put('/api/sections/:id/colors', async (req, res) => {
  try {
    const sectionId = parseInt(req.params.id);
    const { backgroundColor, textColor } = req.body;

    // Validate input
    if (!backgroundColor || !textColor) {
      return res.status(400).json({ 
        error: 'Both backgroundColor and textColor are required' 
      });
    }

    // Validate color format (basic hex validation)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(backgroundColor) || !hexColorRegex.test(textColor)) {
      return res.status(400).json({ 
        error: 'Colors must be in valid hex format (e.g., #ffffff)' 
      });
    }

    // Check if section exists
    const existingSection = await prisma.menuSection.findUnique({
      where: { id: sectionId }
    });

    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Update section colors
    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: {
        backgroundColor,
        textColor
      },
      include: {
        menuItems: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // Broadcast the update to all connected clients
    broadcast({
      type: 'SECTION_COLORS_UPDATED',
      data: {
        sectionId,
        backgroundColor,
        textColor,
        section: updatedSection
      }
    });

    console.log(`Updated colors for section ${sectionId}: bg=${backgroundColor}, text=${textColor}`);
    
    res.json({
      success: true,
      section: updatedSection,
      message: 'Section colors updated successfully'
    });

  } catch (error) {
    console.error('Error updating section colors:', error);
    res.status(500).json({ error: 'Failed to update section colors' });
  }
});

// Reset section colors to default
router.delete('/api/sections/:id/colors', async (req, res) => {
  try {
    const sectionId = parseInt(req.params.id);

    // Check if section exists
    const existingSection = await prisma.menuSection.findUnique({
      where: { id: sectionId }
    });

    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Reset colors to null (use default)
    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: {
        backgroundColor: null,
        textColor: null
      },
      include: {
        menuItems: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // Broadcast the update to all connected clients
    broadcast({
      type: 'SECTION_COLORS_RESET',
      data: {
        sectionId,
        section: updatedSection
      }
    });

    console.log(`Reset colors for section ${sectionId} to default`);
    
    res.json({
      success: true,
      section: updatedSection,
      message: 'Section colors reset to default'
    });

  } catch (error) {
    console.error('Error resetting section colors:', error);
    res.status(500).json({ error: 'Failed to reset section colors' });
  }
});

// Update section type
router.put('/api/sections/:id/type', async (req, res) => {
  try {
    const sectionId = parseInt(req.params.id);
    const { sectionType } = req.body;

    // Validate section type
    const validTypes = ['general', 'pasta', 'sauce', 'insalatone', 'poke'];
    if (!validTypes.includes(sectionType)) {
      return res.status(400).json({ 
        error: `Invalid section type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Check if section exists
    const existingSection = await prisma.menuSection.findUnique({
      where: { id: sectionId }
    });

    if (!existingSection) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Update section type
    const updatedSection = await prisma.menuSection.update({
      where: { id: sectionId },
      data: { sectionType },
      include: {
        menuItems: {
          orderBy: { position: 'asc' }
        }
      }
    });

    // Broadcast the update to all connected clients
    broadcast({
      type: 'SECTION_TYPE_UPDATED',
      data: {
        sectionId,
        sectionType,
        section: updatedSection
      }
    });

    console.log(`Updated section ${sectionId} type to: ${sectionType}`);
    
    res.json({
      success: true,
      section: updatedSection,
      message: 'Section type updated successfully'
    });

  } catch (error) {
    console.error('Error updating section type:', error);
    res.status(500).json({ error: 'Failed to update section type' });
  }
});

module.exports = router;
