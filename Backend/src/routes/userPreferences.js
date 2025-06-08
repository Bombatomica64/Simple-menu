const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Simple file-based storage for user preferences
const PREFERENCES_FILE = path.join(__dirname, '../../data/user-preferences.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(PREFERENCES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load preferences from file
async function loadPreferences() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(PREFERENCES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Return default preferences if file doesn't exist
    return {
      pastaCustomization: {
        showImages: true,
        showDescriptions: true,
        fontSize: 'medium'
      }
    };
  }
}

// Save preferences to file
async function savePreferences(preferences) {
  await ensureDataDirectory();
  await fs.writeFile(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
}

// GET /api/user/pasta-customization - Get pasta customization preferences
router.get('/pasta-customization', async (req, res) => {
  try {
    const preferences = await loadPreferences();
    res.json(preferences.pastaCustomization);
  } catch (error) {
    console.error('Error loading pasta customization preferences:', error);
    res.status(500).json({
      error: 'Failed to load preferences',
      details: error.message
    });
  }
});

// POST /api/user/pasta-customization - Save pasta customization preferences
router.post('/pasta-customization', async (req, res) => {
  try {
    const { showImages, showDescriptions, fontSize } = req.body;

    // Validate input
    if (typeof showImages !== 'boolean' ||
        typeof showDescriptions !== 'boolean' ||
        !['small', 'medium', 'large'].includes(fontSize)) {
      return res.status(400).json({
        error: 'Invalid customization data',
        details: 'showImages and showDescriptions must be boolean, fontSize must be small/medium/large'
      });
    }

    // Load current preferences
    const preferences = await loadPreferences();

    // Update pasta customization
    preferences.pastaCustomization = {
      showImages,
      showDescriptions,
      fontSize
    };

    // Save updated preferences
    await savePreferences(preferences);

    res.json({
      success: true,
      message: 'Pasta customization preferences saved successfully',
      data: preferences.pastaCustomization
    });
  } catch (error) {
    console.error('Error saving pasta customization preferences:', error);
    res.status(500).json({
      error: 'Failed to save preferences',
      details: error.message
    });
  }
});

module.exports = router;
