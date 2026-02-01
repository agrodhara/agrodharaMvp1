# GitHub Actions Setup Guide

## 🎯 Quick Setup Checklist

### Step 1: Add GitHub Secrets

Go to your repository: **Settings → Secrets and variables → Actions → New repository secret**

### Step 2: Add Backend Secrets

```
MONGODB_URI = mongodb+srv://agrodhara1_db_user:LjtIZOHaOu0hJwpv@agronew1.l7ezqas.mongodb.net/
DB_NAME = fpo_management2
AWS_REGION = ap-south-1
AWS_ACCESS_KEY_ID = your_aws_key
AWS_SECRET_ACCESS_KEY = your_aws_secret
JWT_SECRET = your_secret_key_here
ACCESS_TOKEN_SECRET = your_access_token_secret
REFRESH_TOKEN_SECRET = your_refresh_token_secret
PORT = 5000
NODE_ENV = production
FRONTEND_URL = https://your-frontend.com
MOBILE_APP_URL = https://your-app.com
```

### Step 3: Add Frontend Secrets (Optional)

```
VITE_API_URL = https://your-backend-api.com
```

### Step 4: Add Mobile App Secrets

```
EXPO_TOKEN = your_expo_access_token
```

## 📱 Getting Expo Token

1. Install Expo CLI:
   ```bash
   npm install -g expo-cli
   ```

2. Login to Expo:
   ```bash
   expo login
   ```

3. Generate token:
   ```bash
   expo whoami --token
   ```

4. Copy the token and add it as `EXPO_TOKEN` secret in GitHub

## 🚀 Deployment Platform Setup

### Option 1: Deploy to GitHub Pages (Web Frontend)

1. Enable GitHub Pages:
   - Go to **Settings → Pages**
   - Source: **GitHub Actions**
   
2. The workflow will automatically deploy on push to `main`

3. Your site will be available at: `https://agrodhara.github.io/agrodharaMvp1/`

### Option 2: Deploy to Vercel (Web Frontend)

1. Get Vercel token:
   - Visit https://vercel.com/account/tokens
   - Create new token
   
2. Get Project IDs:
   ```bash
   npm i -g vercel
   vercel link
   ```
   
3. Add secrets:
   ```
   VERCEL_TOKEN = your_token
   VERCEL_ORG_ID = your_org_id
   VERCEL_PROJECT_ID = your_project_id
   ```
   
4. Uncomment Vercel section in `.github/workflows/deploy-web-frontend.yml`

### Option 3: Deploy to Heroku (Backend)

1. Get Heroku API key:
   - Visit https://dashboard.heroku.com/account
   - Copy API Key
   
2. Create Heroku app:
   ```bash
   heroku create your-app-name
   ```
   
3. Add secrets:
   ```
   HEROKU_API_KEY = your_api_key
   HEROKU_APP_NAME = your_app_name
   HEROKU_EMAIL = your_email
   ```
   
4. Uncomment Heroku section in `.github/workflows/deploy-backend.yml`

### Option 4: Deploy to Railway (Backend)

1. Get Railway token:
   - Visit https://railway.app/account/tokens
   - Create new token
   
2. Add secrets:
   ```
   RAILWAY_TOKEN = your_token
   RAILWAY_SERVICE = your_service_name
   ```
   
3. Uncomment Railway section in `.github/workflows/deploy-backend.yml`

## 🔄 Testing the Workflows

1. Make a small change in your code
2. Commit and push to `main` or `dev` branch:
   ```bash
   git add .
   git commit -m "Test GitHub Actions"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to see the workflow running

## 📊 Monitoring Deployments

- **GitHub Actions**: https://github.com/agrodhara/agrodharaMvp1/actions
- **Deployment Logs**: Click on any workflow run to see detailed logs
- **Build Artifacts**: Download from completed workflow runs

## ⚠️ Troubleshooting

### Workflow Not Running?
- Check if the changed files match the `paths` filter in the workflow
- Verify branch name matches (`main` or `dev`)
- Check if GitHub Actions is enabled in repository settings

### Build Failing?
- Check the logs in the Actions tab
- Verify all required secrets are added
- Ensure Node.js version compatibility (using v22)

### Deployment Failing?
- Verify deployment platform secrets are correct
- Check deployment platform status/logs
- Ensure the deployment step is uncommented in workflow file

## 🎓 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo EAS Documentation](https://docs.expo.dev/eas/)
- [Vercel Deployment](https://vercel.com/docs)
- [Heroku Deployment](https://devcenter.heroku.com/)
- [Railway Documentation](https://docs.railway.app/)

---

**Need Help?** Contact the development team or create an issue in the repository.
