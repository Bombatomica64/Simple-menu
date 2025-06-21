const express = require('express');
const slideshowService = require('../services/slideshowService');
const { broadcastMessage } = require('../websocket/manager');
const router = express.Router();

// Get active slideshow
router.get('/active', async (req, res) => {
  try {
    const slideshow = await slideshowService.getActiveSlideshow();
    
    if (!slideshow) {
      return res.json({ slideshow: null, isActive: false });
    }

    // Check if slideshow should be active based on time
    const shouldBeActive = slideshowService.shouldSlideshowBeActive(slideshow);
    
    res.json({ 
      slideshow: shouldBeActive ? slideshow : null, 
      isActive: shouldBeActive 
    });
  } catch (error) {
    console.error('Error fetching active slideshow:', error);
    res.status(500).json({ error: 'Failed to fetch active slideshow' });
  }
});

// Get all slideshows
router.get('/', async (req, res) => {
  try {
    const slideshows = await slideshowService.getAllSlideshows();
    res.json(slideshows);
  } catch (error) {
    console.error('Error fetching slideshows:', error);
    res.status(500).json({ error: 'Failed to fetch slideshows' });
  }
});

// Create new slideshow
router.post('/', async (req, res) => {
  try {
    const slideshow = await slideshowService.createSlideshow(req.body);
    res.status(201).json(slideshow);
  } catch (error) {
    console.error('Error creating slideshow:', error);
    res.status(500).json({ error: 'Failed to create slideshow' });
  }
});

// Update slideshow
router.put('/:id', async (req, res) => {
  try {
    const slideshowId = parseInt(req.params.id);
    const slideshow = await slideshowService.updateSlideshow(slideshowId, req.body);
    res.json(slideshow);
  } catch (error) {
    console.error('Error updating slideshow:', error);
    res.status(500).json({ error: 'Failed to update slideshow' });
  }
});

// Activate slideshow
router.post('/:id/activate', async (req, res) => {
  try {
    const slideshowId = parseInt(req.params.id);
    const slideshow = await slideshowService.activateSlideshow(slideshowId);
    
    // Broadcast to all WebSocket clients that slideshow is now active
    broadcastMessage({
      type: 'slideshowActivated',
      slideshow,
      isActive: true
    });
    
    res.json(slideshow);
  } catch (error) {
    console.error('Error activating slideshow:', error);
    res.status(500).json({ error: 'Failed to activate slideshow' });
  }
});

// Deactivate all slideshows
router.post('/deactivate', async (req, res) => {
  try {
    await slideshowService.deactivateSlideshow();
    
    // Broadcast to all WebSocket clients that slideshow is deactivated
    broadcastMessage({
      type: 'slideshowDeactivated',
      isActive: false
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deactivating slideshow:', error);
    res.status(500).json({ error: 'Failed to deactivate slideshow' });
  }
});

// Add slide to slideshow
router.post('/:id/slides', async (req, res) => {
  try {
    const slideshowId = parseInt(req.params.id);
    const slide = await slideshowService.addSlideToSlideshow(slideshowId, req.body);
    res.status(201).json(slide);
  } catch (error) {
    console.error('Error adding slide:', error);
    res.status(500).json({ error: 'Failed to add slide' });
  }
});

// Remove slide from slideshow
router.delete('/slides/:slideId', async (req, res) => {
  try {
    const slideId = parseInt(req.params.slideId);
    await slideshowService.removeSlideFromSlideshow(slideId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing slide:', error);
    res.status(500).json({ error: 'Failed to remove slide' });
  }
});

// Update slide order
router.put('/:id/slides/order', async (req, res) => {
  try {
    const slideshowId = parseInt(req.params.id);
    const slideshow = await slideshowService.updateSlideOrder(slideshowId, req.body.slideOrders);
    res.json(slideshow);
  } catch (error) {
    console.error('Error updating slide order:', error);
    res.status(500).json({ error: 'Failed to update slide order' });
  }
});

module.exports = router;
