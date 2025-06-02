# Digital Menu Application - Startup Guide

This repository contains a complete Digital Menu application with both Backend (Node.js) and Frontend (Angular) components.

## 🚀 One-Click Startup Options

### Option 1: PowerShell Script (Recommended)
Double-click `Start Digital Menu.bat` or run:
```bash
powershell -ExecutionPolicy Bypass -File start.ps1
```

**Features:**
- ✅ Automatically detects and installs Node.js if missing
- ✅ Installs all dependencies for both backend and frontend
- ✅ Generates Prisma client automatically
- ✅ Starts both servers in separate windows
- ✅ Opens browser automatically (optional)
- ✅ Comprehensive error handling

### Option 2: Docker (Alternative)
If you have Docker installed:
```bash
start-docker.bat
```
Or manually:
```bash
docker-compose up --build
```

### Option 3: Manual Batch Script
```bash
start.bat
```

## 📋 Prerequisites

The PowerShell script will automatically handle most prerequisites, but you can manually install:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Docker** (optional, for Docker setup)

## 🔧 What the Script Does

### Backend Setup:
1. Navigates to `Backend/` directory
2. Installs npm dependencies (`npm install`)
3. Generates Prisma client (`npm run generate`)
4. Starts the backend server (`npm run dev`)

### Frontend Setup:
1. Navigates to `Frontend/front/` directory
2. Installs npm dependencies (`npm install`)
3. Checks for Angular CLI (installs if missing)
4. Starts the frontend development server (`ng serve`)

### Access Points:
- **Frontend:** http://localhost:4200
- **Backend API:** http://localhost:3000

## 🛠️ Manual Setup (If Needed)

### Backend:
```bash
cd Backend
npm install
npm run generate
npm run dev
```

### Frontend:
```bash
cd Frontend/front
npm install
ng serve
```

## ❗ Troubleshooting

### PowerShell Execution Policy Issues:
If you get execution policy errors, run PowerShell as administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Node.js Not Found:
The script will attempt to install Node.js automatically using winget or chocolatey. If this fails, manually download from [nodejs.org](https://nodejs.org/).

### Port Already in Use:
If ports 3000 or 4200 are in use:
- Backend: Edit `Backend/package.json` and change the port in the dev script
- Frontend: Use `ng serve --port 4201` or another available port

### Prisma Issues:
If Prisma client generation fails:
```bash
cd Backend
npm install -g prisma
npx prisma generate
```

### Angular CLI Issues:
If Angular CLI is not found:
```bash
npm install -g @angular/cli
```

## 🐳 Docker Setup

The Docker setup includes:
- Backend Node.js service
- Frontend Angular service (built for production)
- PostgreSQL database
- Nginx reverse proxy

Access via:
- **Application:** http://localhost
- **Backend API:** http://localhost/api

## 📝 Development Notes

- Backend runs on port 3000 in development
- Frontend runs on port 4200 in development
- Database configuration in `Backend/.env` or `Backend/prisma/schema.prisma`
- Both servers support hot reload for development

## 🔄 Stopping the Application

### PowerShell/Batch:
Close the PowerShell windows that opened for backend and frontend servers.

### Docker:
```bash
docker-compose down
```

## 📞 Support

If you encounter issues:
1. Check that Node.js 18+ is installed
2. Ensure all directories (`Backend/`, `Frontend/front/`) exist
3. Check that `package.json` files exist in both directories
4. Try running the manual setup commands
5. Check the console output for specific error messages

---

**Quick Start:** Just double-click `Start Digital Menu.bat` and follow the prompts! 🎉
