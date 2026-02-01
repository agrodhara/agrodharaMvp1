# Agrodharma MVP1 - Setup & Run Instructions

## 📋 Project Overview

This project consists of three main components:
1. **Web Frontend** (React + Vite) - Located in `webfrontend/webfrontend/`
2. **Mobile App Frontend** (React Native + Expo) - Located in `agro/`
3. **Backend API** (Node.js + Express) - Located in `src/`

---

## 🔧 Prerequisites

### Install Node.js (Required)

**Option 1: Using Homebrew (Recommended for macOS)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

**Option 2: Download from Official Website**
- Visit [https://nodejs.org/](https://nodejs.org/)
- Download and install the **LTS version**
- Restart your terminal after installation

**Option 3: Using nvm (Node Version Manager)**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
```

---

## 🚀 Quick Start Guide

### 1️⃣ Web Frontend Setup & Run

```bash
# Navigate to web frontend directory
cd webfrontend/webfrontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# The app will be available at: http://localhost:5173/
```

**Build for Production:**
```bash
npm run build
npm run preview
```

---

### 2️⃣ Mobile App Setup & Run (React Native + Expo)

```bash
# Navigate to mobile app directory
cd agro

# Install dependencies (first time only)
npm install

# Start Expo development server
npm start

# Run on specific platforms:
npm run android    # For Android emulator/device
npm run ios        # For iOS simulator (macOS only)
npm run web        # For web browser
```

**Note:** You'll need Expo Go app on your phone or an emulator to run the mobile app.

---

### 3️⃣ Backend API Setup & Run

```bash
# Navigate to backend directory
cd src

# Install dependencies (first time only)
npm install

# Start the server
node app.js

# For development with auto-restart:
npx nodemon app.js
```

**Note:** Make sure to configure your environment variables before starting the backend.

---

## 🔄 Running All Services Together

### Terminal 1 - Web Frontend
```bash
cd /Users/sushilkumar/Documents/GitHub/agrodharaMvp1/webfrontend/webfrontend
npm install  # First time only
npm run dev
```

### Terminal 2 - Mobile App
```bash
cd /Users/sushilkumar/Documents/GitHub/agrodharaMvp1/agro
npm install  # First time only
npm start
```

### Terminal 3 - Backend API
```bash
cd /Users/sushilkumar/Documents/GitHub/agrodharaMvp1/src
npm install  # First time only
node app.js
```

---

## 📦 Dependency Installation Summary

Run these commands from the project root to install all dependencies:

```bash
# Web Frontend
cd webfrontend/webfrontend && npm install && cd ../..

# Mobile App
cd agro && npm install && cd ..

# Backend
cd src && npm install && cd ..
```

---

## 🌐 Access URLs

Once all services are running:

| Service | URL | Description |
|---------|-----|-------------|
| **Web Frontend** | http://localhost:5173/ | React web application |
| **Mobile App** | Expo Dev Tools | Opens automatically in browser |
| **Backend API** | http://localhost:PORT | Check `src/app.js` for port number |

---

## 🛠️ Configuration

### Environment Variables

Create `.env` files in the respective directories as needed:

**Backend (`src/.env`):**
```env
PORT=3000
DATABASE_URL=your_database_url
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
# Add other environment variables as needed
```

**Web Frontend (`webfrontend/webfrontend/.env`):**
```env
VITE_API_URL=http://localhost:3000
# Add other environment variables as needed
```

---

## 📝 Common Commands

### Web Frontend (Vite + React)
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

### Mobile App (Expo)
```bash
npm start        # Start Expo dev server
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web
npm test         # Run tests
```

### Backend (Node.js)
```bash
node app.js          # Start server
npx nodemon app.js   # Start with auto-reload
```

---

## 🐛 Troubleshooting

### Issue: `npm: command not found`
**Solution:** Install Node.js (see Prerequisites section above)

### Issue: Port already in use
**Solution:** Stop the existing process or change the port in configuration

### Issue: Dependencies installation fails
**Solution:** 
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Issue: Expo won't start
**Solution:**
```bash
# Clear Expo cache
npx expo start -c
```

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express Documentation](https://expressjs.com/)

---

## 👥 Development Workflow

1. **Start Backend First** - Ensure your API is running
2. **Start Web/Mobile Frontend** - Connect to the backend API
3. **Check Console Logs** - Monitor for errors in browser/terminal
4. **Hot Reload** - Changes will auto-refresh (no restart needed)

---

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep your API keys and secrets secure
- Update dependencies regularly: `npm update`
- Run security audits: `npm audit`

---

## 📱 Mobile App Testing

### Using Physical Device
1. Install **Expo Go** app from App Store/Play Store
2. Run `npm start` in the `agro` directory
3. Scan the QR code with your phone

### Using Emulator/Simulator
- **Android:** Setup Android Studio and create an AVD
- **iOS:** Requires macOS with Xcode installed

---

## ✅ Verification Checklist

- [ ] Node.js and npm installed
- [ ] All dependencies installed (`npm install` in all three directories)
- [ ] Environment variables configured
- [ ] Database connected (if applicable)
- [ ] All three services can start without errors
- [ ] Web frontend accessible at localhost:5173
- [ ] Backend API responding to requests

---

## 🤖 GitHub Actions CI/CD Pipeline

### Automated Deployment Workflows

This project includes GitHub Actions workflows for automated building and deployment:

#### 1. **Web Frontend Workflow** (`.github/workflows/deploy-web-frontend.yml`)

**Triggers:**
- Push to `main` or `dev` branches
- Changes in `webfrontend/webfrontend/` directory
- Manual trigger via `workflow_dispatch`

**What it does:**
- ✅ Installs dependencies
- ✅ Runs linter
- ✅ Builds production bundle
- ✅ Uploads build artifacts
- ✅ Deploys to GitHub Pages (optional)
- ✅ Supports Vercel/Netlify deployment (commented out)

**Setup Required Secrets:**
```bash
# Optional - For deployment
VITE_API_URL              # Your backend API URL
VERCEL_TOKEN              # If deploying to Vercel
NETLIFY_AUTH_TOKEN        # If deploying to Netlify
```

#### 2. **Backend API Workflow** (`.github/workflows/deploy-backend.yml`)

**Triggers:**
- Push to `main` or `dev` branches
- Changes in `src/` directory
- Manual trigger via `workflow_dispatch`

**What it does:**
- ✅ Installs dependencies
- ✅ Creates `.env` file from secrets
- ✅ Runs tests (if available)
- ✅ Uploads artifacts
- ✅ Ready for deployment to various platforms

**Setup Required Secrets:**
```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=fpo_management2

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here

# JWT Secrets
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Application
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
MOBILE_APP_URL=https://your-app-url.com

# Deployment (choose one)
HEROKU_API_KEY            # For Heroku
RAILWAY_TOKEN             # For Railway
RENDER_DEPLOY_HOOK_URL    # For Render
EC2_HOST                  # For AWS EC2
DIGITALOCEAN_ACCESS_TOKEN # For DigitalOcean
```

#### 3. **Mobile App Workflow** (`.github/workflows/deploy-mobile.yml`)

**Triggers:**
- Push to `main` or `dev` branches
- Changes in `agro/` directory
- Manual trigger via `workflow_dispatch`

**What it does:**
- ✅ Installs dependencies
- ✅ Runs Expo doctor check
- ✅ Builds Android APK (on main branch)
- ✅ Publishes to Expo
- ✅ Supports EAS build for production (manual trigger)

**Setup Required Secrets:**
```bash
EXPO_TOKEN=your_expo_token_here
```

### 📝 How to Set Up GitHub Actions

1. **Navigate to your GitHub repository**
2. **Go to Settings → Secrets and variables → Actions**
3. **Add the required secrets** listed above for each workflow
4. **Push your code** to trigger the workflows

### 🚀 Manual Deployment Trigger

You can manually trigger any workflow:

```bash
# Via GitHub UI
1. Go to Actions tab
2. Select the workflow
3. Click "Run workflow"
4. Choose branch and click "Run workflow"

# Via GitHub CLI
gh workflow run deploy-web-frontend.yml
gh workflow run deploy-backend.yml
gh workflow run deploy-mobile.yml
```

### 📊 Viewing Workflow Status

- **GitHub UI**: Go to the "Actions" tab in your repository
- **Status Badge**: Add to your README:

```markdown
![Web Frontend](https://github.com/agrodhara/agrodharaMvp1/workflows/Deploy%20Web%20Frontend/badge.svg)
![Backend API](https://github.com/agrodhara/agrodharaMvp1/workflows/Deploy%20Backend%20API/badge.svg)
![Mobile App](https://github.com/agrodhara/agrodharaMvp1/workflows/Build%20Mobile%20App%20(Expo)/badge.svg)
```

### 🔧 Customizing Workflows

To enable specific deployment platforms, edit the workflow files and:

1. **Uncomment** the deployment step you want to use
2. **Add required secrets** to GitHub repository settings
3. **Push changes** to trigger the workflow

### 💡 Deployment Platform Options

**Web Frontend:**
- ✅ GitHub Pages (included)
- ✅ Vercel (ready to enable)
- ✅ Netlify (ready to enable)

**Backend API:**
- ✅ Heroku (ready to enable)
- ✅ Railway (ready to enable)
- ✅ Render (ready to enable)
- ✅ AWS EC2 (ready to enable)
- ✅ DigitalOcean App Platform (ready to enable)

**Mobile App:**
- ✅ Expo Publish (included)
- ✅ EAS Build (production builds)
- ✅ App Store submission (iOS)
- ✅ Play Store submission (Android)

---

**Last Updated:** February 1, 2026

For questions or issues, please check the project README files in each directory or contact the development team.
