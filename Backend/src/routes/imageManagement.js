// Routes for image management (upload, switch, delete)
const express = require("express");
const fs = require("fs");
const path = require("path");
const { prisma } = require("../config/database");
const upload = require("../config/multer");

const router = express.Router();

// Helper function to clean up uploaded file
function cleanupFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// Helper function to generate relative image path
function getRelativeImagePath(filename) {
  return `/assets/${filename}`;
}

// --- General Image Upload ---

// General image upload endpoint (returns just the URL for further processing)
router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  try {
    const imageUrl = getRelativeImagePath(req.file.filename);
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// --- General Image Upload for Menu Items ---

// Upload image for menu items (returns just the URL for further processing via WebSocket)
router.post('/menu-items/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  try {
    const imageUrl = getRelativeImagePath(req.file.filename);
    
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image for menu item:', error);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// --- Pasta Types Image Management ---

// Upload image for pasta type
router.post('/pasta-types/:id/upload', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const pastaTypeId = parseInt(id);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const pastaType = await prisma.pastaType.findUnique({ where: { id: pastaTypeId } });
    if (!pastaType) {
      cleanupFile(req.file.path);
      return res.status(404).json({ error: 'Pasta type not found' });
    }    const imageUrl = getRelativeImagePath(req.file.filename);
    const currentImages = JSON.parse(pastaType.availableImages || '[]');
    const updatedImages = [...currentImages, imageUrl];

    const updatedPastaType = await prisma.pastaType.update({
      where: { id: pastaTypeId },
      data: {
        imageUrl: pastaType.imageUrl || imageUrl, // Set as current if no current image
        availableImages: JSON.stringify(updatedImages)
      }
    });

    res.json({
      message: 'Image uploaded successfully',
      pastaType: updatedPastaType,
      uploadedImage: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image for pasta type:', error);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Switch current image for pasta type
router.put('/pasta-types/:id/switch', async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const pastaTypeId = parseInt(id);

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const pastaType = await prisma.pastaType.findUnique({ where: { id: pastaTypeId } });
    if (!pastaType) {
      return res.status(404).json({ error: 'Pasta type not found' });
    }

    const availableImages = JSON.parse(pastaType.availableImages || '[]');
    if (!availableImages.includes(imageUrl)) {
      return res.status(400).json({ error: 'Image not available for this pasta type' });
    }

    const updatedPastaType = await prisma.pastaType.update({
      where: { id: pastaTypeId },
      data: { imageUrl }
    });

    res.json({
      message: 'Image switched successfully',
      pastaType: updatedPastaType
    });
  } catch (error) {
    console.error('Error switching image for pasta type:', error);
    res.status(500).json({ error: 'Failed to switch image' });
  }
});

// Delete image for pasta type
router.delete('/pasta-types/:id/delete', async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const pastaTypeId = parseInt(id);

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const pastaType = await prisma.pastaType.findUnique({ where: { id: pastaTypeId } });
    if (!pastaType) {
      return res.status(404).json({ error: 'Pasta type not found' });
    }

    const availableImages = JSON.parse(pastaType.availableImages || '[]');
    const updatedImages = availableImages.filter(img => img !== imageUrl);

    // Delete physical file
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../assets', filename);
    cleanupFile(filePath);

    // Update current image if it was the deleted one
    const newCurrentImage = pastaType.imageUrl === imageUrl 
      ? (updatedImages[0] || '') 
      : pastaType.imageUrl;

    const updatedPastaType = await prisma.pastaType.update({
      where: { id: pastaTypeId },
      data: {
        imageUrl: newCurrentImage,
        availableImages: JSON.stringify(updatedImages)
      }
    });

    res.json({
      message: 'Image deleted successfully',
      pastaType: updatedPastaType
    });
  } catch (error) {
    console.error('Error deleting image for pasta type:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// --- Pasta Sauces Image Management ---

// Upload image for pasta sauce
router.post('/pasta-sauces/:id/upload', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const pastaSauceId = parseInt(id);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const pastaSauce = await prisma.pastaSauce.findUnique({ where: { id: pastaSauceId } });
    if (!pastaSauce) {
      cleanupFile(req.file.path);
      return res.status(404).json({ error: 'Pasta sauce not found' });
    }    const imageUrl = getRelativeImagePath(req.file.filename);
    const currentImages = JSON.parse(pastaSauce.availableImages || '[]');
    const updatedImages = [...currentImages, imageUrl];

    const updatedPastaSauce = await prisma.pastaSauce.update({
      where: { id: pastaSauceId },
      data: {
        imageUrl: pastaSauce.imageUrl || imageUrl, // Set as current if no current image
        availableImages: JSON.stringify(updatedImages)
      }
    });

    res.json({
      message: 'Image uploaded successfully',
      pastaSauce: updatedPastaSauce,
      uploadedImage: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image for pasta sauce:', error);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Switch current image for pasta sauce
router.put('/pasta-sauces/:id/switch', async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const pastaSauceId = parseInt(id);

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const pastaSauce = await prisma.pastaSauce.findUnique({ where: { id: pastaSauceId } });
    if (!pastaSauce) {
      return res.status(404).json({ error: 'Pasta sauce not found' });
    }

    const availableImages = JSON.parse(pastaSauce.availableImages || '[]');
    if (!availableImages.includes(imageUrl)) {
      return res.status(400).json({ error: 'Image not available for this pasta sauce' });
    }

    const updatedPastaSauce = await prisma.pastaSauce.update({
      where: { id: pastaSauceId },
      data: { imageUrl }
    });

    res.json({
      message: 'Image switched successfully',
      pastaSauce: updatedPastaSauce
    });
  } catch (error) {
    console.error('Error switching image for pasta sauce:', error);
    res.status(500).json({ error: 'Failed to switch image' });
  }
});

// Delete image for pasta sauce
router.delete('/pasta-sauces/:id/delete', async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.body;
  const pastaSauceId = parseInt(id);

  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  try {
    const pastaSauce = await prisma.pastaSauce.findUnique({ where: { id: pastaSauceId } });
    if (!pastaSauce) {
      return res.status(404).json({ error: 'Pasta sauce not found' });
    }

    const availableImages = JSON.parse(pastaSauce.availableImages || '[]');
    const updatedImages = availableImages.filter(img => img !== imageUrl);

    // Delete physical file
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../assets', filename);
    cleanupFile(filePath);

    // Update current image if it was the deleted one
    const newCurrentImage = pastaSauce.imageUrl === imageUrl 
      ? (updatedImages[0] || '') 
      : pastaSauce.imageUrl;

    const updatedPastaSauce = await prisma.pastaSauce.update({
      where: { id: pastaSauceId },
      data: {
        imageUrl: newCurrentImage,
        availableImages: JSON.stringify(updatedImages)
      }
    });

    res.json({
      message: 'Image deleted successfully',
      pastaSauce: updatedPastaSauce
    });
  } catch (error) {
    console.error('Error deleting image for pasta sauce:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// --- Background Image Upload ---

// Upload background image
router.post('/backgrounds/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No background image file provided' });
  }
  try {
    const imageUrl = getRelativeImagePath(req.file.filename);
    
    res.json({
      message: 'Background image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error uploading background image:', error);
    if (req.file) cleanupFile(req.file.path);
    res.status(500).json({ 
      error: 'Failed to upload background image',
      details: error.message 
    });
  }
});

module.exports = router;
