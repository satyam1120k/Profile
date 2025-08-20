# 🚀 GitHub Pages Deployment Guide

## 📋 Prerequisites

- Your project is pushed to a GitHub repository
- Repository is public (required for GitHub Pages)

## 🔧 Step-by-Step Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Install GitHub Pages Deployment Tool

```bash
npm install --save-dev gh-pages
```

### 3. Update Repository Name (if needed)

Your repository name is `Profile`, so the `base` path in `vite.config.ts` is already correct:

```typescript
base: '/Profile/', // Correct repository name
```

### 4. Build and Deploy

```bash
npm run deploy
```

This command will:

- Build your project (`npm run build`)
- Deploy the `dist` folder to the `gh-pages` branch
- Make your site available on GitHub Pages

### 5. Configure GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Choose **gh-pages** branch
6. Select **/(root)** folder
7. Click **Save**

### 6. Wait for Deployment

- First deployment takes 2-5 minutes
- Look for green checkmark in Actions tab
- Your site will be live at: `https://samir1120k.github.io/Profile/`

## 🌐 Live URL

Your portfolio will be available at:

```
https://samir1120k.github.io/Profile/
```

## 🔄 Update Deployments

To update your live site after making changes:

```bash
git add .
git commit -m "Update portfolio"
git push origin main
npm run deploy
```

## ⚠️ Troubleshooting

### Common Issues:

1. **404 Error**: Check if base path in `vite.config.ts` matches repository name
2. **Build Errors**: Run `npm run build` locally to check for errors
3. **Deployment Fails**: Check GitHub Actions tab for error details
4. **Site Not Loading**: Wait 5-10 minutes for first deployment

### Check Deployment Status:

- Go to **Actions** tab in your repository
- Look for the latest deployment workflow
- Check for any error messages

## 🎯 Quick Commands

```bash
# Install and deploy
npm install
npm run deploy

# Update and redeploy
git add . && git commit -m "Update" && git push
npm run deploy
```

## 🌟 Success!

Once deployed, your 3D anime portfolio will be live on GitHub Pages with:

- Interactive 3D cherry blossom garden
- Animated notebook interface
- Responsive design
- Smooth animations and transitions

---

**Need help?** Check the Actions tab in your repository for deployment logs.
