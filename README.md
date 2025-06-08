# 🍝 Simple Menu - Digital Restaurant Menu Management System

A modern, real-time digital menu management system built with Angular and Node.js, featuring dynamic content updates, section-based organization, and comprehensive pasta menu management.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Docker Deployment](#-docker-deployment)
- [LAN Setup](#-lan-setup)
- [API Documentation](#-api-documentation)
- [WebSocket Events](#-websocket-events)
- [Project Structure](#-project-structure)
- [Component Overview](#-component-overview)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔄 Real-time Updates & WebSocket Communication
- **Live Menu Synchronization**: Real-time updates across all connected clients using WebSockets
- **Instant Notifications**: Immediate reflection of changes on all devices
- **Connection Management**: Automatic reconnection and robust error handling
- **Display Settings Sync**: Real-time synchronization of pasta display preferences
- **CRUD Operations**: Live create, read, update, delete operations via WebSocket
- **Background Configuration**: Real-time background settings management
- **Multi-client Support**: Synchronized updates across multiple browser sessions

### 📱 Multi-Page Menu Display
- **Automatic Page Transitions**: Configurable auto-rotation between menu pages
- **Responsive Grid Layout**: 2-column responsive design for optimal viewing
- **Section-based Organization**: Organized menu sections with drag-and-drop reordering
- **Visual Indicators**: Page indicators and transition status

### 🍝 Comprehensive Pasta Management
- **Pasta Types**: Full CRUD operations for pasta varieties with image support
- **Pasta Sauces**: Complete sauce management with visual presentation
- **Combo Selection**: Interactive pasta and sauce pairing interface
- **Image Galleries**: Multiple image support per item with selection interface
- **Display Settings**: Customizable display options for pasta types and sauces
- **Real-time Updates**: WebSocket-based live updates for all pasta operations

### 📑 Menu Item Management
- **Section-based Organization**: Items automatically organized by customizable sections
- **Drag & Drop**: Intuitive reordering within and between sections
- **Image Management**: Upload, manage, and toggle image visibility
- **Price Management**: Easy pricing updates with validation
- **Smart Validation**: Automatic section assignment and validation rules

### 💾 Menu Persistence
- **Save & Load**: Complete menu state persistence with named saves
- **Menu History**: Access to previously saved menu configurations
- **Export/Import**: Full menu data backup and restoration
- **Database Integration**: Robust PostgreSQL integration with Prisma ORM

### 🖼️ Advanced Image Handling
- **File Upload**: Direct image upload with preview
- **Multiple Images**: Support for multiple images per item
- **Image Gallery**: Built-in image management interface
- **Format Support**: Support for common image formats (JPG, PNG, WebP)
- **Size Optimization**: Automatic image handling and optimization

### 🎨 Modern UI/UX
- **PrimeNG Components**: Professional UI components with consistent theming
- **Dark/Light Mode**: Automatic theme switching support
- **Responsive Design**: Mobile-first design with tablet and desktop optimization
- **Accessibility**: ARIA labels and keyboard navigation support
- **Loading States**: Comprehensive loading and error state management

## 🛠 Tech Stack

### Frontend
- **Angular 20**: Latest Angular framework with standalone components
- **PrimeNG 19**: Comprehensive UI component library
- **TailwindCSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming with WebSocket integration
- **Angular SSR**: Server-side rendering support

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **WebSocket (ws)**: Real-time communication
- **Prisma ORM**: Database toolkit and query builder
- **SQLite**: Development database (easily configurable for PostgreSQL/MySQL)
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing support

### DevOps & Deployment
- **Docker**: Containerization with multi-stage builds
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Production web server (frontend)
- **Health Checks**: Container health monitoring
- **Volume Persistence**: Data persistence across container restarts

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Angular 20)                    │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  ├── Home (Multi-page Menu Display)                         │
│  ├── Submit (Menu Management)                               │
│  ├── Menu Sections (Section Management)                     │
│  ├── Menu Item Cards (Item Management)                      │
│  └── Saved Menus (Persistence)                             │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                  │
│  ├── WebSocket Resource (Real-time Communication)           │
│  ├── Menu Service (State Management)                        │
│  └── HTTP Client (API Communication)                        │
└─────────────────────────────────────────────────────────────┘
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                        │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints:                                             │
│  ├── /pasta-types (CRUD Operations)                         │
│  ├── /pasta-sauces (CRUD Operations)                        │
│  ├── /images (Upload & Management)                          │
│  └── /health (Health Checks)                               │
├─────────────────────────────────────────────────────────────┤
│  WebSocket: /menu-updates (Real-time Events)                │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                  │
│  ├── Menu Service (Business Logic)                          │
│  ├── Seed Service (Initial Data)                            │
│  └── WebSocket Middleware (Real-time Updates)               │
└─────────────────────────────────────────────────────────────┘
                              │ Prisma ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (SQLite/PostgreSQL)              │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│  ├── Menu (Menu Instances)                                  │
│  ├── MenuItem (Individual Items)                            │
│  ├── MenuSection (Section Organization)                     │
│  ├── PastaType (Pasta Varieties)                           │
│  ├── PastaSauce (Sauce Options)                            │
│  └── SavedMenu (Menu Persistence)                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Simple-menu
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:3000
   - **WebSocket**: ws://localhost:3000/menu-updates

### Manual Setup

1. **Backend Setup**
   ```bash
   cd Backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm start
   ```

2. **Frontend Setup**
   ```bash
   cd Frontend/front
   npm install
   ng serve
   ```

## 🔧 Development Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** (optional, for containerized development)
- **Git**

### Backend Development

1. **Install dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Database setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed  # Optional: seed with initial data
   ```

3. **Environment configuration**
   ```bash
   # Backend runs on port 3000 by default
   # WebSocket endpoint: ws://localhost:3000/menu-updates
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

### Frontend Development

1. **Install dependencies**
   ```bash
   cd Frontend/front
   npm install
   ```

2. **Start development server**
   ```bash
   ng serve
   # Access at http://localhost:4200
   ```

3. **Build for production**
   ```bash
   ng build --configuration production
   ```

### Database Management

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## 🐳 Docker Deployment

### Production Deployment

1. **Build and run**
   ```bash
   docker-compose up -d
   ```

2. **Check health status**
   ```bash
   docker-compose ps
   curl http://localhost:3000/health
   curl http://localhost:4200
   ```

3. **View logs**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

### Docker Configuration

The application uses multi-stage Docker builds for optimization:

- **Frontend**: Nginx-based serving with Angular SSR support
- **Backend**: Node.js with health checks and volume persistence
- **Network**: Isolated Docker network for inter-service communication
- **Volumes**: Persistent storage for database and uploaded images

## 🌐 LAN Setup

### Automatic LAN Configuration

For LAN access across multiple devices:

#### Windows
```powershell
.\setup-lan-auto.ps1
```

#### Linux/macOS
```bash
./setup-lan.sh
```

### Manual LAN Configuration

1. **Find your local IP address**
   ```bash
   # Linux/macOS
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. **Update environment configuration**
   ```typescript
   // Frontend: src/environments/environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://YOUR_IP:3000',
     wsUrl: 'ws://YOUR_IP:3000/menu-updates'
   };
   ```

3. **Rebuild and deploy**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

4. **Access from any device on the network**
   - **Frontend**: http://YOUR_IP:4200
   - **Backend**: http://YOUR_IP:3000

## 📡 API Documentation

### Menu Items
```http
# WebSocket connection for real-time updates
WebSocket: ws://localhost:3000/menu-updates

# WebSocket Events (see WebSocket Events section for details)
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

### Health Check
```http
GET /health

# Response:
{
  "status": "OK",
  "timestamp": "2025-06-04T10:30:00.000Z"
}
```

## 🔌 WebSocket Events

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

// Error response
{
  type: 'error',
  message: string
}
```

## 📁 Project Structure

```
Simple-menu/
├── Backend/                    # Node.js backend server
│   ├── src/
│   │   ├── config/            # Database, CORS, Multer configuration
│   │   ├── middleware/        # WebSocket middleware
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic services
│   │   ├── utils/             # Utility functions and constants
│   │   └── index.js           # Application entry point
│   ├── prisma/                # Database schema and migrations
│   ├── assets/                # Uploaded images and static files
│   ├── Dockerfile             # Backend container configuration
│   └── package.json           # Backend dependencies
├── Frontend/
│   └── front/                 # Angular frontend application
│       ├── src/
│       │   ├── app/
│       │   │   ├── home/      # Menu display component
│       │   │   ├── submit/    # Menu management component
│       │   │   ├── menu-sections/  # Section management
│       │   │   ├── menu-item-card/ # Item display component
│       │   │   ├── saved-menus/    # Menu persistence
│       │   │   ├── pasta/     # Pasta display component
│       │   │   └── Menu/      # Menu models and services
│       │   └── environments/  # Environment configurations
│       ├── Dockerfile         # Frontend container configuration
│       └── package.json       # Frontend dependencies
├── docker-compose.yml         # Multi-container orchestration
├── docker-compose.override.yml # Development overrides
├── setup-lan-auto.ps1         # Automatic LAN setup (Windows)
├── setup-lan.sh              # Automatic LAN setup (Linux/macOS)
└── README.md                 # This file
```

## 🧩 Component Overview

### Frontend Components

#### HomeComponent (`/home`)
- **Purpose**: Main menu display for customers
- **Features**:
  - Multi-page menu presentation
  - Automatic page transitions
  - Responsive 2-column grid layout
  - Real-time menu updates
  - Pasta selection interface

#### SubmitComponent (`/menu`)
- **Purpose**: Administrative menu management interface
- **Features**:
  - Menu item CRUD operations
  - Pasta type and sauce management
  - Image upload and management
  - Menu persistence (save/load)
  - Real-time preview

#### MenuSectionsComponent
- **Purpose**: Section-based menu organization
- **Features**:
  - Section creation and management
  - Drag-and-drop item reordering
  - Cross-section item movement
  - Position management

#### MenuItemCardComponent
- **Purpose**: Individual menu item display and management
- **Features**:
  - Item information display
  - Image toggle functionality
  - Quick actions (edit, delete, move)
  - Drag handle for reordering

#### SavedMenusComponent
- **Purpose**: Menu persistence and history management
- **Features**:
  - Save current menu state
  - Load previously saved menus
  - Menu deletion and management
  - Metadata display (save date, item counts)

### Backend Services

#### MenuService
- **Purpose**: Core menu business logic
- **Features**:
  - In-memory menu state management
  - Database persistence
  - CRUD operations for all entities
  - Transaction management

#### WebSocket Middleware
- **Purpose**: Real-time communication handling
- **Features**:
  - Event routing and processing
  - Client connection management
  - Broadcast functionality
  - Error handling and recovery

#### Seed Service
- **Purpose**: Initial data population
- **Features**:
  - Default pasta types and sauces
  - Sample menu structure
  - Development data setup

## 🔧 Configuration

### Environment Variables

#### Backend
```bash
PORT=3000                    # Server port
NODE_ENV=production          # Environment mode
DATABASE_URL=file:./dev.db   # Database connection string
```

#### Frontend
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000/menu-updates'
};
```

### Database Configuration

The application uses Prisma ORM with SQLite by default. To use PostgreSQL or MySQL:

1. **Update database URL**
   ```bash
   # For PostgreSQL
   DATABASE_URL="postgresql://user:password@localhost:5432/menu_db"
   
   # For MySQL
   DATABASE_URL="mysql://user:password@localhost:3306/menu_db"
   ```

2. **Update Prisma schema**
   ```prisma
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"  // or "mysql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate dev
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   # Frontend
   cd Frontend/front
   ng test
   ng lint
   
   # Backend
   cd Backend
   npm test  # if tests are implemented
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Guidelines

- Follow Angular and Node.js best practices
- Use TypeScript for type safety
- Write meaningful commit messages
- Update documentation for new features
- Ensure responsive design compatibility
- Test on multiple devices and browsers

## 📝 License

This project is licensed under a Custom License - see the [LICENSE](LICENSE) file for details.

**Summary**: Commercial use is permitted only for the original author (Lorenzo). All other users are restricted to personal, non-commercial use only.

---

## 🆘 Troubleshooting

### Common Issues

#### WebSocket Connection Issues
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check WebSocket connection
wscat -c ws://localhost:3000/menu-updates
```

#### Database Issues
```bash
# Reset database (development only)
cd Backend
npx prisma migrate reset

# Check database schema
npx prisma studio
```

#### Docker Issues
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

#### LAN Access Issues
1. Check firewall settings
2. Verify IP address configuration
3. Ensure ports 3000 and 4200 are open
4. Update environment configuration with correct IP

### Performance Optimization

1. **Image Optimization**: Compress images before upload
2. **Database Indexing**: Add indexes for frequently queried fields
3. **Caching**: Implement Redis caching for frequently accessed data
4. **CDN**: Use CDN for static assets in production
5. **Bundle Optimization**: Use Angular's built-in optimization features

---

## 🚀 What's Next?

### Planned Features

- [ ] **User Authentication**: Admin and customer roles
- [ ] **Order Management**: Table ordering functionality
- [ ] **Analytics Dashboard**: Usage and popularity metrics
- [ ] **Multi-language Support**: Internationalization
- [ ] **Print Templates**: PDF menu generation
- [ ] **Inventory Integration**: Stock management
- [ ] **Nutritional Information**: Dietary information display
- [ ] **Progressive Web App**: Offline functionality
- [ ] **Voice Interface**: Voice-controlled navigation
- [ ] **AI Recommendations**: Smart menu suggestions

### Performance Enhancements

- [ ] **Redis Caching**: Response caching
- [ ] **Database Optimization**: Query optimization and indexing
- [ ] **CDN Integration**: Static asset optimization
- [ ] **Image Compression**: Automatic image optimization
- [ ] **Lazy Loading**: Component and route lazy loading

---

*Built with ❤️ using Angular, Node.js, and modern web technologies*
