# 🍝 Simple Menu - Digital Restaurant Menu Management System

A modern, real-time digital menu management system built with Angular 20 and Node.js, featuring dynamic content updates, comprehensive pasta management, full-screen slideshow capabilities, live background customization, and complete monitoring solutions. Designed for restaurants, cafes, and food service establishments seeking an interactive digital menu experience.

### 📊 Advanced Analytics & Reporting
- **Sales Analytics**: Revenue tracking, popular items, and sales trends
- **Inventory Management**: Stock tracking and automatic reorder notifications
- **Customer Analytics**: Order patterns, preferences, and loyalty metrics
- **Performance Metrics**: Service times, customer satisfaction, and operational efficiency

### 🌐 Multi-Location & Franchise Support
- **Multi-Restaurant Management**: Centralized management for restaurant chains or franchises
- **Location-Specific Menus**: Different menus and pricing for different locations
- **Centralized Reporting**: Consolidated analytics across all locations
- **Brand Consistency**: Standardized theming and branding across locations

### 🎯 Marketing & Customer Engagement
- **Loyalty Programs**: Points-based rewards and customer retention features
- **Promotional Campaigns**: Time-based discounts, special offers, and seasonal menus
- **Email/SMS Integration**: Automated marketing campaigns and order notifications
- **Social Media Integration**: Share menu items and receive social feedback
- **Review Management**: Integration with review platforms and response management

### 🌍 Internationalization & Accessibility
- **Multi-Language Support**: Full internationalization with language switching
- **Currency Support**: Multiple currency options for international locations
- **Accessibility Features**: WCAG compliance, screen reader support, and keyboard navigation
- **Cultural Customization**: Region-specific menu presentations and dietary considerations

### 🔌 Integration & API Ecosystem
- **POS System Integration**: Connect with existing point-of-sale systems
- **Delivery Platform APIs**: Integration with UberEats, DoorDash, and similar platforms
- **Accounting Software**: QuickBooks, Xero, and other accounting system integrations
- **Supplier Integration**: Direct ordering from suppliers and inventory automation
- **Third-party Services**: Payment processors, SMS services, and email providers

### 🤖 AI & Automation Features
- **AI Menu Optimization**: Automatic menu recommendations based on sales data
- **Predictive Analytics**: Forecast demand and optimize inventory
- **Smart Pricing**: Dynamic pricing based on demand, time, and inventory
- **Chatbot Support**: AI-powered customer service and order assistance
- **Voice Commands**: Voice-controlled menu management and ordering

### 📱 Progressive Web App & Mobile Features
- **Offline Functionality**: Menu viewing and basic operations without internet
- **Push Notifications**: Real-time updates via web push notifications
- **Mobile App**: Native mobile applications for iOS and Android
- **Camera Integration**: QR code scanning and image capture for orders
- **Geolocation**: Location-based features and delivery tracking Version Features:**
- 🎬 **Full-Screen Slideshow System** with time-based scheduling and real-time control
- 🎨 **Dynamic Background Management** with live preview and instant updates 
- 🖼️ **Unified Image Component** for consistent image handling across all displays
- 🏗️ **Angular 20 Architecture** with signals, HttpResource, and SSR compatibility
- 🐳 **Simplified Deployment** with single unified Docker Compose file

## 📋 Table of Contents

- [Features](#-features)
- [New in Latest Version](#-new-in-latest-version)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔄 Real-time Updates & WebSocket Communication
- **Live Menu Synchronization**: Real-time updates across all connected clients using WebSockets
- **Instant Notifications**: Immediate reflection of changes on all devices
- **Connection Management**: Automatic reconnection and robust error handling
- **Display Settings Sync**: Real-time synchronization of pasta display preferences
- **CRUD Operations**: Live create, read, update, delete operations via WebSocket
- **Background Configuration**: Real-time background settings management with live preview
- **Multi-client Support**: Synchronized updates across multiple browser sessions

### 🎬 Interactive Slideshow System
- **Full-Screen Display**: Immersive slideshow experience with full viewport coverage
- **Image Management**: Upload, organize, and manage slideshow images with drag-and-drop
- **Auto-Play Controls**: Configurable slideshow intervals with view-only mode
- **Real-time Activation**: Start/stop slideshows instantly via WebSocket
- **Time-based Scheduling**: Auto-start and auto-end based on configurable time windows
- **Seamless Navigation**: Automatic return to home page when slideshow ends
- **Multi-Image Upload**: Bulk image upload with instant preview and organization

### 🍝 Advanced Pasta Management
- **Pasta Types**: Full CRUD operations for pasta varieties with rich image support
- **Pasta Sauces**: Complete sauce management with visual presentation
- **Interactive Display**: Side-by-side pasta and sauce selection interface
- **Image Galleries**: Multiple image support per item with selection interface
- **Display Customization**: Font sizes, image visibility, and description toggles
- **Color Themes**: Custom background and text colors for pasta sections
- **Real-time Updates**: WebSocket-based live updates for all pasta operations

### 🎨 Dynamic Background System
- **Live Background Changes**: Real-time background updates with instant preview
- **Multiple Background Types**: Support for solid colors, gradients, and custom images
- **Simplified Configuration**: Easy background management with type and value system
- **WebSocket Integration**: Background changes broadcast to all connected clients
- **Visual Preview**: Instant background preview in configuration interface

### 📱 Enhanced Multi-Page Menu Display
- **Responsive Layout**: Optimized 3-column layout (pasta + menu sections)
- **Section Organization**: Drag-and-drop section management with visual indicators
- **Menu Integration**: Seamless integration between pasta display and traditional menu sections
- **Page Transitions**: Smooth transitions between different menu views
- **Visual Consistency**: Unified theming across all menu components

### 📑 Advanced Menu Item Management
- **Section-based Organization**: Items automatically organized by customizable sections
- **Drag & Drop**: Intuitive reordering within and between sections
- **Enhanced Image Management**: Upload, manage, and toggle image visibility with consistent image component
- **Price Management**: Easy pricing updates with validation
- **Smart Validation**: Automatic section assignment and validation rules

### �️ Unified Image Handling
- **Reusable Image Component**: Consistent image display across all components
- **Automatic URL Resolution**: Smart image URL construction for server-hosted images
- **Error Handling**: Graceful fallback for missing images
- **Loading States**: Smooth loading animations and error states
- **Format Support**: Support for common image formats (JPG, PNG, WebP, GIF)

### �💾 Enhanced Menu Persistence
- **Save & Load**: Complete menu state persistence with named saves
- **Menu History**: Access to previously saved menu configurations
- **Export/Import**: Full menu data backup and restoration
- **Database Integration**: Robust SQLite integration with Prisma ORM
- **Data Consistency**: Automatic data validation and integrity checks

### 🎨 Modern UI/UX Improvements
- **Component Separation**: Clean separation of HTML, CSS, and TypeScript files
- **Angular 20 Features**: Latest Angular features including HttpResource and signals
- **SSR Compatibility**: Server-side rendering support for better performance
- **PrimeNG Components**: Professional UI components with consistent theming
- **Responsive Design**: Mobile-first design with tablet and desktop optimization
- **Accessibility**: Enhanced ARIA labels and keyboard navigation support

## 🆕 New in Latest Version

### 🎬 Slideshow Management
- **Complete Slideshow System**: Full slideshow creation, management, and display
- **Image Upload & Organization**: Bulk image upload with drag-and-drop organization
- **Auto-Play Configuration**: Configurable intervals with minimum 15-second view-only mode
- **Time-based Controls**: Start and end time configuration for automated slideshow scheduling
- **Real-time Activation**: Instant slideshow start/stop via WebSocket communication
- **Navigation Integration**: Seamless navigation back to home when slideshow ends

### 🎨 Background Configuration Overhaul
- **Simplified Protocol**: Streamlined background change system (removed page concept)
- **Live Preview**: Real-time background preview during configuration
- **Type-based System**: Clean separation of colors, gradients, and images
- **WebSocket Broadcasting**: Background changes instantly visible on all connected devices
- **Enhanced UI**: Improved background selection interface with visual previews

### 🍝 Pasta Display Improvements
- **3-Column Layout**: Optimized layout with pasta types, sauces, and menu sections
- **Background Isolation**: Pasta component no longer handles backgrounds (delegated to parent)
- **Section Integration**: Clean separation between pasta display and menu sections
- **Enhanced Colors**: Improved color management for pasta types and sauces

### 🖼️ Image System Overhaul
- **Unified Image Component**: Single reusable component for all image displays
- **Automatic URL Handling**: Smart construction of full image URLs from relative paths
- **Consistent Error Handling**: Unified error states and loading animations across all components
- **Performance Optimization**: Efficient image loading with proper caching

### 🏗️ Architecture Improvements
- **Component Refactoring**: Separated large components into clean HTML/CSS/TS files
- **HttpResource Integration**: Modern Angular resource management for better performance
- **SSR Compatibility**: Full server-side rendering support for production deployments
- **Signal-based State**: Modern Angular signals for reactive state management
- **WebSocket Optimization**: Improved real-time communication with better error handling

### 🐳 Deployment Simplification
- **Single Docker Compose**: Simplified deployment with unified docker-compose.yml
- **Streamlined Setup**: Reduced complexity while maintaining all functionality
- **Health Monitoring**: Comprehensive health checks for all services
- **Resource Optimization**: Better resource allocation and container management

## 🛠 Tech Stack

### Frontend
- **Angular 20**: Latest Angular framework with standalone components and signals
- **Angular SSR**: Server-side rendering support for production deployments
- **Angular HttpResource**: Modern resource management for reactive data fetching
- **PrimeNG 19**: Comprehensive UI component library with carousel and file upload
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **TypeScript**: Type-safe development with latest language features
- **RxJS**: Reactive programming with WebSocket integration and effect management

### Backend
- **Node.js**: Runtime environment with ES modules support
- **Express.js**: Web application framework with RESTful API design
- **WebSocket (ws)**: Real-time communication for live updates
- **Prisma ORM**: Database toolkit and query builder with migration support
- **SQLite**: Production-ready database (easily configurable for PostgreSQL/MySQL)
- **Multer**: File upload handling with multiple file support
- **CORS**: Cross-origin resource sharing support for LAN access

### Infrastructure & Deployment
- **Docker**: Containerization with optimized multi-stage builds
- **Docker Compose**: Simplified single-file orchestration
- **Nginx**: Production web server for frontend serving
- **Health Checks**: Comprehensive container health monitoring
- **Volume Persistence**: Data persistence across container restarts
- **Environment Configuration**: Flexible configuration for different deployment scenarios

## 🏗 Architecture

Simple Menu follows a modern full-stack architecture with real-time communication:

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    Prisma ORM    ┌─────────────────┐
│   Angular 20    │◄──────────────►│   Node.js API   │◄─────────────────│   SQLite DB     │
│   Frontend      │   HTTP/REST     │   Backend       │   + Migrations   │   + Monitoring  │
└─────────────────┘                └─────────────────┘                  └─────────────────┘
```

**Key Features:**
- **Real-time Sync**: WebSocket-based live updates across all connected clients
- **Modern Angular**: Standalone components, signals, HttpResource, SSR support
- **Database**: SQLite with Prisma ORM for type-safe database operations
- **Monitoring**: Integrated Prometheus + Grafana + ELK stack for observability

For detailed architecture information, see the [Component Reference](docs/COMPONENTS.md).

---

## 🚀 Quick Start

### 🖥️ Local Development

**Prerequisites**: Node.js 18+, npm

```bash
# 1. Clone the repository
git clone <repository-url>
cd Simple-menu

# 2. Start the backend
cd Backend
npm install
npx prisma generate && npx prisma migrate dev --name init
npm start

# 3. Start the frontend (in a new terminal)
cd Frontend/front
npm install
npm start
```

**Access**: 
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

### 🐳 Docker Deployment

**Prerequisites**: Docker & Docker Compose

```bash
# Complete deployment with monitoring
docker-compose -f docker\docker-compose.unified.yml up -d
```

**Includes**:
- 🍝 Simple Menu Application
- 📊 Monitoring (Prometheus + Grafana)
- 📋 Logging (ELK Stack)

**Access Points**:
| Service | URL | Credentials |
|---------|-----|-------------|
| 🍝 **Application** | http://localhost:4200 | - |
| 📊 **Grafana** | http://localhost:3001 | admin/admin |
| 📋 **Kibana** | http://localhost:5601 | - |

## 📚 Documentation

### Setup & Deployment
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete setup instructions for local development and Docker deployment
- **[LAN Setup Guide](docs/LAN-SETUP.md)** - Configure the application for network access across multiple devices

### Development
- **[API Reference](docs/API_REFERENCE.md)** - Complete REST API and WebSocket documentation
- **[Component Reference](docs/COMPONENTS.md)** - Detailed component documentation and architecture
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - File organization and architecture overview

### Operations
- **[Monitoring Guide](docs/MONITORING_SIMPLE.md)** - System monitoring and observability setup
- **[Quick Start Guide](docs/QUICK_START.md)** - Fast track to get the application running

---

## 📁 Project Structure

```
Simple-menu/
├── Backend/                    # Node.js backend server
│   ├── src/                   # Source code
│   ├── prisma/                # Database schema and migrations
│   ├── assets/                # Uploaded images and static files
│   └── package.json           # Dependencies
├── Frontend/front/             # Angular frontend application
│   ├── src/app/               # Angular components and services
│   ├── src/environments/      # Environment configurations
│   └── package.json           # Dependencies
├── docker/                    # Docker orchestration
│   └── docker-compose.unified.yml # Unified deployment with monitoring
├── docs/                      # Documentation
│   ├── API_REFERENCE.md       # API and WebSocket documentation
│   ├── DEPLOYMENT.md          # Setup and deployment guide
│   ├── COMPONENTS.md          # Component architecture reference
│   └── [other guides]         # Additional documentation
├── monitoring/unified/        # Monitoring configurations
├── scripts/                   # Automation scripts
├── start.ps1                  # Interactive deployment script
├── start-unified.ps1          # Quick unified deployment
└── README.md                  # This file
```

For detailed information about the project structure and components, see the [Component Reference](docs/COMPONENTS.md).

---

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


## 🎯 Future Roadmap

### 👥 User Management & Authentication
- **Admin Dashboard**: Comprehensive administrative interface with role-based permissions
- **User Accounts**: Staff accounts with different access levels (manager, kitchen staff, server)
- **Session Management**: Secure login/logout with JWT authentication
- **Permission System**: Granular permissions for menu editing, user management, and system settings
- **Audit Logging**: Track all user actions and menu changes for accountability

### � Customer Ordering System
- **Digital Ordering Interface**: Customer-facing ordering system with table selection
- **Real-time Order Management**: Live order tracking from placement to completion
- **Table Management**: Table assignment and status tracking
- **Order Queue**: Kitchen display system for order preparation workflow
- **Payment Integration**: Support for digital payments and order confirmation
- **Order History**: Customer order history and preferences tracking

### 📱 Enhanced Customer Experience
- **QR Code Integration**: Table-specific QR codes for direct menu access and ordering
- **Customization Options**: Allow customers to customize pasta combinations and portions
- **Order Status Tracking**: Real-time updates on order preparation and estimated completion
- **Customer Preferences**: Save favorite orders and dietary preferences
- **Feedback System**: Customer rating and feedback collection for menu items

### 🔔 Notification & Communication
- **Real-time Notifications**: Push notifications for order updates and kitchen communications
- **Kitchen Display System**: Dedicated kitchen interface for order management
- **Staff Communication**: Internal messaging system for staff coordination
- **Customer Alerts**: Automated notifications for order ready, delays, or special offers

### � Advanced Analytics & Reporting
- **Sales Analytics**: Revenue tracking, popular items, and sales trends
- **Inventory Management**: Stock tracking and automatic reorder notifications
- **Customer Analytics**: Order patterns, preferences, and loyalty metrics
- **Performance Metrics**: Service times, customer satisfaction, and operational efficiency


---

*Built with ❤️ using Angular, Node.js, and modern web technologies*
