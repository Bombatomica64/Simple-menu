# 🧩 Component Reference

This document provides detailed information about all components in the Simple Menu application, including their purposes, features, and implementation details.

## Table of Contents

- [Frontend Components](#frontend-components)
- [Backend Services](#backend-services)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)

## Frontend Components

### Core Display Components

#### HomeComponent (`/home`)
**Purpose**: Main menu display interface for customers

**Key Features**:
- Multi-page menu presentation with automatic transitions
- Responsive 3-column layout (pasta types, pasta sauces, menu sections)
- Real-time menu updates via WebSocket
- Background management and live preview
- Page navigation and section organization

**Files**:
- `home.component.ts` - Component logic with Angular signals
- `home.component.html` - Template with PrimeNG components
- `home.component.scss` - Responsive styling

**Dependencies**: WebSocket connection, Menu service, Background configuration

---

#### SubmitComponent (`/menu`)
**Purpose**: Administrative menu management interface

**Key Features**:
- Complete menu item CRUD operations
- Pasta type and sauce management
- Image upload and management system
- Menu persistence (save/load functionality)
- Real-time preview of changes
- Section management and organization

**Files**:
- `submit.component.ts` - Admin logic with HttpResource
- `submit.component.html` - Management interface
- `submit.component.scss` - Admin panel styling

**Dependencies**: Menu service, Image upload service, WebSocket connection

---

#### SlideshowComponent (`/slideshow`)
**Purpose**: Full-screen slideshow display for promotional content

**Key Features**:
- Full-screen immersive display mode
- Auto-advancing slides with configurable intervals (minimum 15 seconds)
- Time-based activation/deactivation scheduling
- Real-time WebSocket control for start/stop
- Automatic navigation to home when slideshow ends
- SSR-compatible image loading and display

**Files**:
- `slideshow.component.ts` - Slideshow logic with Angular signals
- `slideshow.component.html` - Full-screen carousel template
- `slideshow.component.scss` - Full-screen styling

**Dependencies**: Slideshow service, WebSocket connection, Router navigation

---

### Management Components

#### SlideshowManagementComponent
**Purpose**: Administrative slideshow creation and management

**Key Features**:
- Slideshow creation and configuration
- Bulk image upload with drag-and-drop support
- Slide order management with drag-and-drop
- Time-based scheduling (start/end times)
- Real-time slideshow activation/deactivation
- Image gallery management with preview

**Files**:
- `slideshow-management.component.ts` - Management logic
- `slideshow-management.component.html` - Admin interface
- `slideshow-management.component.scss` - Management styling

**Dependencies**: Slideshow service, File upload, WebSocket connection

---

#### MenuSectionsComponent
**Purpose**: Section-based menu organization and management

**Key Features**:
- Section creation, editing, and deletion
- Drag-and-drop item reordering within sections
- Cross-section item movement
- Position management and validation
- Real-time updates across all clients

**Files**:
- `menu-sections.component.ts` - Section management logic
- `menu-sections.component.html` - Section interface
- `menu-sections.component.scss` - Section styling

**Dependencies**: Menu service, WebSocket connection

---

#### MenuItemCardComponent
**Purpose**: Individual menu item display and management

**Key Features**:
- Item information display (name, price, image)
- Image toggle functionality
- Quick actions (edit, delete, move)
- Drag handle for reordering
- Real-time price and image updates

**Files**:
- `menu-item-card.component.ts` - Item logic
- `menu-item-card.component.html` - Item template
- `menu-item-card.component.scss` - Card styling

**Dependencies**: Menu service, Image service

---

### Specialized Components

#### AppImageComponent
**Purpose**: Unified image display component for consistent image handling

**Key Features**:
- Automatic URL resolution for server-hosted images
- Consistent error handling and loading states
- Support for multiple image formats (JPG, PNG, WebP, GIF)
- Responsive image sizing and optimization
- Graceful fallback for missing images
- Loading animations and error states

**Files**:
- `shared/components/app-image/app-image.component.ts` - Image logic
- Template and styling inline

**Usage**: Used throughout the application for all image displays (pasta, sauces, menu items, slideshow)

---

#### BackgroundPaletteComponent
**Purpose**: Dynamic background configuration and management

**Key Features**:
- Real-time background preview
- Support for solid colors, gradients, and custom images
- Live background updates across all connected clients
- Simplified background type and value system
- WebSocket-based background broadcasting
- Visual color picker and gradient editor

**Files**:
- `background-palette.component.ts` - Background management logic
- `background-palette.component.html` - Configuration interface
- `background-palette.component.scss` - Palette styling

**Dependencies**: Background service, WebSocket connection

---

#### PastaComponent
**Purpose**: Pasta types and sauces display management

**Key Features**:
- Side-by-side pasta and sauce selection interface
- Image galleries with multiple image support
- Display customization (font sizes, image visibility)
- Color themes and background integration
- Real-time updates via WebSocket
- Responsive layout for different screen sizes

**Files**:
- `pasta.component.ts` - Pasta display logic
- `pasta.component.html` - Pasta interface template
- `pasta.component.scss` - Pasta styling

**Dependencies**: Pasta service, WebSocket connection

---

#### SavedMenusComponent
**Purpose**: Menu persistence and history management

**Key Features**:
- Save current menu state with custom names
- Load previously saved menu configurations
- Menu deletion and management
- Metadata display (save date, item counts)
- Import/export functionality

**Files**:
- `saved-menus.component.ts` - Persistence logic
- `saved-menus.component.html` - Saved menus interface
- `saved-menus.component.scss` - Persistence styling

**Dependencies**: Menu service, WebSocket connection

---

## Backend Services

### Core Services

#### MenuService
**Purpose**: Core menu business logic and state management

**Key Features**:
- In-memory menu state management
- Database persistence with Prisma ORM
- CRUD operations for all menu entities
- Transaction management and data integrity
- Menu validation and business rules
- Real-time state synchronization

**Files**:
- `src/services/menuService.js` - Main service logic
- Database models in Prisma schema

---

#### SlideshowService
**Purpose**: Slideshow management and business logic

**Key Features**:
- Slideshow CRUD operations
- Slide management and ordering
- Time-based activation/deactivation logic
- Real-time status broadcasting via WebSocket
- Image URL management and validation
- Scheduling and automation

**Files**:
- `src/services/slideshowService.js` - Slideshow logic
- `src/routes/slideshow.js` - API endpoints

---

#### WebSocket Manager
**Purpose**: Real-time communication handling and client management

**Key Features**:
- Event routing and processing
- Client connection management
- Broadcast functionality across all clients
- Error handling and recovery
- Message validation and sanitization
- Connection state management

**Files**:
- `src/websocket/manager.js` - WebSocket management
- `src/websocket/handlers/` - Event handlers

---

### Supporting Services

#### Background Configuration Service
**Purpose**: Dynamic background management

**Key Features**:
- Background configuration persistence
- Real-time background updates
- Type-based background handling (color, gradient, image)
- WebSocket broadcasting of background changes
- Background validation and preprocessing

---

#### Image Management Service
**Purpose**: File upload and image handling

**Key Features**:
- Secure file upload with validation
- Image format support and conversion
- File size optimization
- Storage management and cleanup
- URL generation and resolution

---

#### Seed Service
**Purpose**: Initial data population and development setup

**Key Features**:
- Default pasta types and sauces creation
- Sample menu structure generation
- Development data setup
- Database initialization

---

## Component Architecture

### Data Flow Pattern

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │───▶│   Component     │───▶│   WebSocket     │
│                 │    │                 │    │   Message       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │◀───│   Backend       │◀───│   WebSocket     │
│   Update        │    │   Service       │    │   Handler       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Update     │◀───│   Component     │◀───│   WebSocket     │
│   (All Clients) │    │   (All Clients) │    │   Broadcast     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Angular Features Used

#### Modern Angular 20 Features
- **Standalone Components**: All components are standalone with explicit imports
- **Signals**: Reactive state management with Angular signals
- **HttpResource**: Modern data fetching with automatic caching
- **SSR Compatibility**: Server-side rendering support
- **Effect API**: Side effect management for reactive updates

#### State Management
- **Local State**: Component-level state with signals
- **Global State**: WebSocket-based real-time state synchronization
- **Computed Values**: Derived state with computed signals
- **Resource Management**: HttpResource for data fetching and caching

### Component Communication

#### Parent-Child Communication
- **Input Properties**: Data passing from parent to child
- **Output Events**: Child to parent communication
- **Two-way Binding**: Synchronized state between components

#### Service-based Communication
- **WebSocket Service**: Real-time updates across all components
- **HTTP Services**: RESTful API communication
- **Shared Services**: Cross-component state management

#### Real-time Updates
- **WebSocket Events**: Instant updates across all connected clients
- **Signal Reactivity**: Automatic UI updates when data changes
- **Effect Handlers**: Side effect management for complex updates

---

## Related Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Quick setup and deployment guide
- **[API_REFERENCE.md](API_REFERENCE.md)** - REST API and WebSocket documentation
- **[MONITORING_OPTIONS.md](MONITORING_OPTIONS.md)** - Detailed monitoring information
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Project organization overview

*For more information, see the [API Reference](API_REFERENCE.md), [Deployment Guide](DEPLOYMENT.md), or the main [README](../README.md).*
