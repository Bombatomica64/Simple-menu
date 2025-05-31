// Routes for pasta sauces management
const express = require("express");
const { prisma } = require("../config/database");

const router = express.Router();

// Get all pasta sauces
router.get('/', async (req, res) => {
  try {
    const pastaSauces = await prisma.pastaSauce.findMany({ orderBy: { name: 'asc' } });
    res.json(pastaSauces);
  } catch (error) {
    console.error('Error fetching pasta sauces:', error);
    res.status(500).json({ error: 'Failed to fetch pasta sauces' });
  }
});

// Create new pasta sauce
router.post('/', async (req, res) => {
  const { name, imageUrl } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Pasta sauce name is required' });
  }
  try {
    const newPastaSauce = await prisma.pastaSauce.create({
      data: { 
        name, 
        imageUrl: imageUrl || '',
        availableImages: JSON.stringify([])
      },
    });
    res.status(201).json(newPastaSauce);
  } catch (error) {
    console.error('Error creating pasta sauce:', error);
    if (error.code === 'P2002') { // Unique constraint failed
        return res.status(409).json({ error: 'Pasta sauce with this name already exists.' });
    }
    res.status(500).json({ error: 'Failed to create pasta sauce' });
  }
});

module.exports = router;
