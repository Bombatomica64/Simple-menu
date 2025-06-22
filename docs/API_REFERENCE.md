# 📡 API Reference

This document provides comprehensive API documentation for the Simple Menu application, including REST endpoints and WebSocket event specifications.

## Table of Contents

- [REST API Endpoints](#rest-api-endpoints)
- [WebSocket Events](#websocket-events)
- [Data Models](#data-models)

## REST API Endpoints

### Base URL
- **Local Development**: `http://localhost:3000`
- **Production**: Your deployed server URL

### Menu Items

```http
# WebSocket connection for real-time updates
WebSocket: ws://localhost:3000/menu-updates

# All menu operations are primarily handled via WebSocket
# See WebSocket Events section for detailed menu management
```

### Pasta Types

```http
# Get all pasta types
GET /pasta-types

# Create new pasta type
POST /pasta-types
Content-Type: application/json
{
  "name": "Pasta Name",
  "imageUrl": "http://example.com/image.jpg"
}

# Update pasta type
PUT /pasta-types/:id

# Delete pasta type
DELETE /pasta-types/:id
```

### Pasta Sauces

```http
# Get all pasta sauces
GET /pasta-sauces

# Create new pasta sauce
POST /pasta-sauces
Content-Type: application/json
{
  "name": "Sauce Name",
  "imageUrl": "http://example.com/image.jpg"
}

# Update pasta sauce
PUT /pasta-sauces/:id

# Delete pasta sauce
DELETE /pasta-sauces/:id
```

### Image Management

```http
# Upload image
POST /images/upload
Content-Type: multipart/form-data
{
  "image": <file>
}

# Response:
{
  "success": true,
  "imageUrl": "/assets/image-timestamp-random.ext"
}
```

### Slideshow Management

```http
# Get active slideshow
GET /slideshow/active

# Response:
{
  "slideshow": {
    "id": 1,
    "name": "Restaurant Slideshow",
    "interval": 15000,
    "isActive": true,
    "startTime": "09:00",
    "endTime": "22:00",
    "slides": [...]
  },
  "isActive": true
}

# Get all slideshows
GET /slideshow

# Create new slideshow
POST /slideshow
Content-Type: application/json
{
  "name": "Restaurant Slideshow",
  "interval": 15000,
  "startTime": "09:00",
  "endTime": "22:00"
}

# Update slideshow
PUT /slideshow/:id
Content-Type: application/json
{
  "name": "Updated Slideshow",
  "interval": 20000
}

# Activate slideshow
POST /slideshow/:id/activate

# Deactivate all slideshows
POST /slideshow/deactivate

# Add slide to slideshow
POST /slideshow/:id/slides
Content-Type: application/json
{
  "imageUrl": "/assets/slide-image.jpg",
  "order": 1
}

# Remove slide from slideshow
DELETE /slideshow/slides/:slideId

# Update slide order
PUT /slideshow/:id/slides/order
Content-Type: application/json
{
  "slideOrders": [
    { "slideId": 1, "order": 0 },
    { "slideId": 2, "order": 1 }
  ]
}
```

### Health Check

```http
GET /health

# Response:
{
  "status": "OK",
  "timestamp": "2025-06-22T10:30:00.000Z"
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:3000/menu-updates');
```

### Client to Server Messages

#### Menu Item Management

```typescript
// Add menu item
{
  type: 'addItem',
  item: {
    name: string,
    price: number,
    sectionId?: number,
    imageUrl?: string,
    showImage?: boolean
  }
}

// Remove menu item
{
  type: 'removeItem',
  itemId: number
}

// Update item image
{
  type: 'updateMenuItemImage',
  itemId: number,
  imageUrl: string
}

// Toggle image visibility
{
  type: 'toggleMenuItemShowImage',
  itemId: number,
  showImage: boolean
}
```

#### Section Management

```typescript
// Add section
{
  type: 'addSection',
  section: {
    name: string
  }
}

// Remove section
{
  type: 'removeSection',
  sectionId: number
}

// Update section order
{
  type: 'updateSectionOrder',
  sectionUpdates: Array<{
    id: number,
    position: number
  }>
}

// Move item between sections
{
  type: 'moveItemToSection',
  itemId: number,
  sectionId: number,
  position?: number
}
```

#### Pasta Management

```typescript
// Add pasta type to menu
{
  type: 'addPastaTypeToMenu',
  pastaTypeId: number
}

// Remove pasta type from menu
{
  type: 'removePastaTypeFromMenu',
  pastaTypeId: number
}

// Add pasta sauce to menu
{
  type: 'addPastaSauceToMenu',
  pastaSauceId: number
}

// Remove pasta sauce from menu
{
  type: 'removePastaSauceFromMenu',
  pastaSauceId: number
}
```

#### Display Settings Management

```typescript
// Get pasta sauce display settings
{
  type: 'getPastaSauceDisplaySettings'
}

// Update pasta sauce display settings
{
  type: 'updatePastaSauceDisplaySettings',
  settings: {
    showImages: boolean,
    showDescriptions: boolean,
    imageSize: 'small' | 'medium' | 'large',
    fontSize: 'small' | 'medium' | 'large'
  }
}

// Get pasta type display settings
{
  type: 'getPastaTypeDisplaySettings'
}

// Update pasta type display settings
{
  type: 'updatePastaTypeDisplaySettings',
  settings: {
    showImages: boolean,
    showDescriptions: boolean,
    imageSize: 'small' | 'medium' | 'large',
    fontSize: 'small' | 'medium' | 'large'
  }
}
```

#### Pasta CRUD Operations

```typescript
// Create new pasta type
{
  type: 'createPastaType',
  pastaType: {
    name: string,
    imageUrl?: string,
    description?: string
  }
}

// Delete pasta type
{
  type: 'deletePastaType',
  pastaTypeId: number
}

// Create new pasta sauce
{
  type: 'createPastaSauce',
  pastaSauce: {
    name: string,
    imageUrl?: string,
    description?: string
  }
}

// Delete pasta sauce
{
  type: 'deletePastaSauce',
  pastaSauceId: number
}
```

#### Background Configuration

```typescript
// Get background configuration
{
  type: 'getBackgroundConfig',
  configId: number
}

// Get all background configurations
{
  type: 'getAllBackgroundConfigs'
}

// Update background configuration
{
  type: 'updateBackgroundConfig',
  configId: number,
  config: {
    name?: string,
    imageUrl?: string,
    isActive?: boolean
  }
}

// Delete background configuration
{
  type: 'deleteBackgroundConfig',
  configId: number
}
```

#### Slideshow Management

```typescript
// Get active slideshow
{
  type: 'getActiveSlideshow'
}

// Activate slideshow
{
  type: 'activateSlideshow',
  slideshowId: number
}

// Deactivate slideshow
{
  type: 'deactivateSlideshow'
}

// Update slideshow settings
{
  type: 'updateSlideshow',
  slideshowId: number,
  settings: {
    name?: string,
    interval?: number,
    startTime?: string,
    endTime?: string,
    autoStart?: boolean
  }
}

// Add slide to slideshow
{
  type: 'addSlideToSlideshow',
  slideshowId: number,
  slide: {
    imageUrl: string,
    order: number
  }
}

// Remove slide from slideshow
{
  type: 'removeSlideFromSlideshow',
  slideId: number
}

// Update slide order
{
  type: 'updateSlideOrder',
  slideshowId: number,
  slideOrders: Array<{
    slideId: number,
    order: number
  }>
}
```

#### Menu Persistence

```typescript
// Save current menu
{
  type: 'saveCurrentMenu',
  name: string
}

// Load saved menu
{
  type: 'loadSavedMenu',
  savedMenuId: number
}

// Get all saved menus
{
  type: 'getAllSavedMenus'
}

// Delete saved menu
{
  type: 'deleteSavedMenu',
  savedMenuId: number
}
```

### Server to Client Messages

#### Menu Updates

```typescript
// Complete menu state (sent on connection and after updates)
{
  id: number,
  createdAt: string,
  menuItems: MenuItem[],
  menuSections: MenuSection[],
  pastaTypes: MenuPastaTypeEntry[],
  pastaSauces: MenuPastaSauceEntry[]
}
```

#### Response Messages

```typescript
// Menu saved confirmation
{
  type: 'menuSaved',
  savedMenu: SavedMenu
}

// Menu deleted confirmation
{
  type: 'menuDeleted',
  savedMenuId: number
}

// Saved menus list
{
  type: 'savedMenusList',
  savedMenus: SavedMenu[]
}

// Display settings responses
{
  type: 'pastaSauceDisplaySettings',
  settings: PastaSauceDisplaySettings
}

{
  type: 'pastaTypeDisplaySettings',
  settings: PastaTypeDisplaySettings
}

// Background configuration responses
{
  type: 'backgroundConfig',
  config: BackgroundConfig
}

{
  type: 'allBackgroundConfigs',
  configs: BackgroundConfig[]
}

{
  type: 'backgroundConfigDeleted',
  configId: number
}

// Slideshow responses
{
  type: 'slideshowActivated',
  slideshow: Slideshow,
  isActive: true
}

{
  type: 'slideshowDeactivated',
  isActive: false
}

{
  type: 'slideshowStatusUpdate',
  slideshow: Slideshow,
  isActive: boolean
}

{
  type: 'slideshowUpdated',
  slideshow: Slideshow
}

{
  type: 'activeSlideshow',
  slideshow: Slideshow | null,
  isActive: boolean
}

// Error response
{
  type: 'error',
  message: string
}
```

## Data Models

### MenuItem
```typescript
interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  showImage: boolean;
  sectionId?: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}
```

### MenuSection
```typescript
interface MenuSection {
  id: number;
  name: string;
  position: number;
  menuItems: MenuItem[];
  createdAt: string;
  updatedAt: string;
}
```

### PastaType
```typescript
interface PastaType {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### PastaSauce
```typescript
interface PastaSauce {
  id: number;
  name: string;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Slideshow
```typescript
interface Slideshow {
  id: number;
  name: string;
  interval: number;
  isActive: boolean;
  startTime?: string;
  endTime?: string;
  autoStart: boolean;
  slides: SlideshowSlide[];
  createdAt: string;
  updatedAt: string;
}
```

### SlideshowSlide
```typescript
interface SlideshowSlide {
  id: number;
  imageUrl: string;
  order: number;
  slideshowId: number;
  createdAt: string;
  updatedAt: string;
}
```

### BackgroundConfig
```typescript
interface BackgroundConfig {
  id: number;
  name: string;
  type: 'color' | 'gradient' | 'image';
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

*For more information, see the main [README](../README.md) or other documentation files in the [docs](.) directory.*
