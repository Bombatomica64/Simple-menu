// Slideshow service for managing slideshow functionality
const { prisma } = require("../config/database");

// Get the active slideshow with slides
async function getActiveSlideshow() {
  try {
    const slideshow = await prisma.slideshow.findFirst({
      where: { isActive: true },
      include: {
        slides: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        }
      }
    });
    return slideshow;
  } catch (error) {
    console.error('Error fetching active slideshow:', error);
    return null;
  }
}

// Get all slideshows
async function getAllSlideshows() {
  try {
    const slideshows = await prisma.slideshow.findMany({
      include: {
        slides: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return slideshows;
  } catch (error) {
    console.error('Error fetching slideshows:', error);
    return [];
  }
}

// Create a new slideshow
async function createSlideshow(slideshowData) {
  try {
    const slideshow = await prisma.slideshow.create({
      data: {
        name: slideshowData.name || 'New Slideshow',
        intervalMs: slideshowData.intervalMs || 5000,
        autoStart: slideshowData.autoStart || false,
        startTime: slideshowData.startTime || null,
        endTime: slideshowData.endTime || null
      },
      include: {
        slides: {
          orderBy: { position: 'asc' }
        }
      }
    });
    return slideshow;
  } catch (error) {
    console.error('Error creating slideshow:', error);
    throw error;
  }
}

// Update slideshow
async function updateSlideshow(slideshowId, updates) {
  try {
    const slideshow = await prisma.slideshow.update({
      where: { id: slideshowId },
      data: updates,
      include: {
        slides: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        }
      }
    });
    return slideshow;
  } catch (error) {
    console.error('Error updating slideshow:', error);
    throw error;
  }
}

// Activate a slideshow (deactivates all others)
async function activateSlideshow(slideshowId) {
  try {
    // Deactivate all slideshows first
    await prisma.slideshow.updateMany({
      data: { isActive: false }
    });

    // Activate the selected slideshow
    const slideshow = await prisma.slideshow.update({
      where: { id: slideshowId },
      data: { isActive: true },
      include: {
        slides: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        }
      }
    });
    return slideshow;
  } catch (error) {
    console.error('Error activating slideshow:', error);
    throw error;
  }
}

// Deactivate slideshow
async function deactivateSlideshow() {
  try {
    await prisma.slideshow.updateMany({
      data: { isActive: false }
    });
    return true;
  } catch (error) {
    console.error('Error deactivating slideshow:', error);
    throw error;
  }
}

// Add slide to slideshow
async function addSlideToSlideshow(slideshowId, slideData) {
  try {
    // Get next position
    const maxPosition = await prisma.slideshowSlide.findFirst({
      where: { slideshowId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const nextPosition = maxPosition ? maxPosition.position + 1 : 0;

    const slide = await prisma.slideshowSlide.create({
      data: {
        imageUrl: slideData.imageUrl,
        title: slideData.title || null,
        description: slideData.description || null,
        position: nextPosition,
        slideshowId: slideshowId
      }
    });
    return slide;
  } catch (error) {
    console.error('Error adding slide:', error);
    throw error;
  }
}

// Remove slide from slideshow
async function removeSlideFromSlideshow(slideId) {
  try {
    const slide = await prisma.slideshowSlide.update({
      where: { id: slideId },
      data: { isActive: false }
    });
    return slide;
  } catch (error) {
    console.error('Error removing slide:', error);
    throw error;
  }
}

// Update slide order
async function updateSlideOrder(slideshowId, slideOrders) {
  try {
    const updatePromises = slideOrders.map((order, index) => 
      prisma.slideshowSlide.update({
        where: { id: order.id },
        data: { position: index }
      })
    );

    await Promise.all(updatePromises);
    
    // Return updated slideshow
    const slideshow = await prisma.slideshow.findUnique({
      where: { id: slideshowId },
      include: {
        slides: {
          where: { isActive: true },
          orderBy: { position: 'asc' }
        }
      }
    });
    return slideshow;
  } catch (error) {
    console.error('Error updating slide order:', error);
    throw error;
  }
}

// Check if slideshow should be active based on time
function shouldSlideshowBeActive(slideshow) {
  if (!slideshow || !slideshow.autoStart) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  // If no time constraints, slideshow can be active
  if (!slideshow.startTime && !slideshow.endTime) return slideshow.isActive;
  
  // Check if current time is before end time (e.g., before 12:30)
  if (slideshow.endTime && currentTime >= slideshow.endTime) {
    return false;
  }
  
  return slideshow.isActive;
}

module.exports = {
  getActiveSlideshow,
  getAllSlideshows,
  createSlideshow,
  updateSlideshow,
  activateSlideshow,
  deactivateSlideshow,
  addSlideToSlideshow,
  removeSlideFromSlideshow,
  updateSlideOrder,
  shouldSlideshowBeActive
};
