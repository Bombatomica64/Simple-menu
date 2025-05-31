// Routes for pasta types management
const express = require("express");
const { prisma } = require("../config/database");

const router = express.Router();

// Get all pasta types
router.get('/', async (req, res) => {
  try {
    const pastaTypes = await prisma.pastaType.findMany({ orderBy: { name: 'asc' } });
    res.json(pastaTypes);
  } catch (error) {
    console.error('Error fetching pasta types:', error);
    res.status(500).json({ error: 'Failed to fetch pasta types' });
  }
});

// Create new pasta type
router.post('/', async (req, res) => {
  const { name, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pasta type name is required' });
  }
  try {
    const newPastaType = await prisma.pastaType.create({
      data: { 
        name, 
        imageUrl: imageUrl || '',
        availableImages: JSON.stringify([])
      },
    });
    res.status(201).json(newPastaType);
  } catch (error) {
    console.error('Error creating pasta type:', error);
    if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Pasta type with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create pasta type' });
  }
});

module.exports = router;
