// WebSocket handlers for slideshow operations
const slideshowService = require("../../services/slideshowService");

async function handleGetActiveSlideshow(message, ws, { sendToClient }) {
  try {
    const slideshow = await slideshowService.getActiveSlideshow();
    const shouldBeActive = slideshow ? slideshowService.shouldSlideshowBeActive(slideshow) : false;
    
    sendToClient(ws, {
      type: 'activeSlideshow',
      slideshow: shouldBeActive ? slideshow : null,
      isActive: shouldBeActive
    });
  } catch (error) {
    console.error('Error getting active slideshow:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get active slideshow'
    });
  }
}

async function handleGetAllSlideshows(message, ws, { sendToClient }) {
  try {
    const slideshows = await slideshowService.getAllSlideshows();
    sendToClient(ws, {
      type: 'allSlideshows',
      slideshows
    });
  } catch (error) {
    console.error('Error getting all slideshows:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to get slideshows'
    });
  }
}

async function handleCreateSlideshow(message, ws, { sendToClient, broadcastMessage }) {
  try {
    const slideshow = await slideshowService.createSlideshow(message.slideshowData);
    
    sendToClient(ws, {
      type: 'slideshowCreated',
      slideshow
    });

    // Broadcast to all clients that a new slideshow was created
    broadcastMessage({
      type: 'slideshowListUpdated'
    });
  } catch (error) {
    console.error('Error creating slideshow:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to create slideshow'
    });
  }
}

async function handleUpdateSlideshow(message, ws, { sendToClient, broadcastMessage }) {
  try {
    const slideshow = await slideshowService.updateSlideshow(message.slideshowId, message.updates);
    
    sendToClient(ws, {
      type: 'slideshowUpdated',
      slideshow
    });

    // Broadcast update to all clients
    broadcastMessage({
      type: 'slideshowListUpdated'
    });
  } catch (error) {
    console.error('Error updating slideshow:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to update slideshow'
    });
  }
}

async function handleActivateSlideshow(message, ws, { sendToClient, broadcastMessage }) {
  try {
    const slideshow = await slideshowService.activateSlideshow(message.slideshowId);
    
    // Broadcast to all clients that slideshow is now active
    broadcastMessage({
      type: 'slideshowActivated',
      slideshow
    });
  } catch (error) {
    console.error('Error activating slideshow:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to activate slideshow'
    });
  }
}

async function handleDeactivateSlideshow(message, ws, { sendToClient, broadcastMessage }) {
  try {
    await slideshowService.deactivateSlideshow();
    
    // Broadcast to all clients that slideshow is deactivated
    broadcastMessage({
      type: 'slideshowDeactivated'
    });
  } catch (error) {
    console.error('Error deactivating slideshow:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to deactivate slideshow'
    });
  }
}

async function handleAddSlideToSlideshow(message, ws, { sendToClient, broadcastMessage }) {
  try {
    const slide = await slideshowService.addSlideToSlideshow(message.slideshowId, message.slideData);
    
    sendToClient(ws, {
      type: 'slideAdded',
      slide
    });

    // Broadcast update to all clients
    broadcastMessage({
      type: 'slideshowListUpdated'
    });
  } catch (error) {
    console.error('Error adding slide:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to add slide'
    });
  }
}

async function handleRemoveSlideFromSlideshow(message, ws, { sendToClient, broadcastMessage }) {
  try {
    await slideshowService.removeSlideFromSlideshow(message.slideId);
    
    sendToClient(ws, {
      type: 'slideRemoved',
      slideId: message.slideId
    });

    // Broadcast update to all clients
    broadcastMessage({
      type: 'slideshowListUpdated'
    });
  } catch (error) {
    console.error('Error removing slide:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to remove slide'
    });
  }
}

async function handleUpdateSlideOrder(message, ws, { sendToClient, broadcastMessage }) {
  try {
    const slideshow = await slideshowService.updateSlideOrder(message.slideshowId, message.slideOrders);
    
    sendToClient(ws, {
      type: 'slideOrderUpdated',
      slideshow
    });

    // Broadcast update to all clients
    broadcastMessage({
      type: 'slideshowListUpdated'
    });
  } catch (error) {
    console.error('Error updating slide order:', error);
    sendToClient(ws, {
      type: 'error',
      message: 'Failed to update slide order'
    });
  }
}

module.exports = {
  handleGetActiveSlideshow,
  handleGetAllSlideshows,
  handleCreateSlideshow,
  handleUpdateSlideshow,
  handleActivateSlideshow,
  handleDeactivateSlideshow,
  handleAddSlideToSlideshow,
  handleRemoveSlideFromSlideshow,
  handleUpdateSlideOrder
};
