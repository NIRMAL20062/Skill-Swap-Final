# 🚀 SkillSwap Deployment Guide for Render

This guide will help you deploy your SkillSwap application to Render.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: All the values from your `.env.local` file

## 🔧 Environment Variables Setup

### Step 1: Create Environment Group in Render

1. Go to Render Dashboard
2. Click on "Environment Groups" in the sidebar
3. Click "New Environment Group"
4. Name it `skillswap-env`
5. Add the following environment variables:

### 🔥 Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDPESmh_CrqwGB9QSgxtTqFwmmFy7DFD_c
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=local-testing-56e7c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=local-testing-56e7c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=local-testing-56e7c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=119855404887
NEXT_PUBLIC_FIREBASE_APP_ID=1:119855404887:web:dfad44ce81b90cadba5012
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-GNWDNF2DMN
```

### 🤖 AI Configuration
```
GEMINI_API_KEY=AIzaSyDzmpEdUyEJJdWQJdWjjQt29mgWSxgzgHI
```

### 💳 Payment Configuration (Razorpay)
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_JfjVKSSpK7kh1B
RAZORPAY_KEY_SECRET=P5elV6PZlD407O2ILsmby6Lo
```

### 📧 Email Configuration
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=kumar.nirmal2608@gmail.com
EMAIL_PASSWORD=bcnnscxntknznbiv
EMAIL_FROM_NAME=SkillSwap Team
EMAIL_FROM_EMAIL=noreply@skillswap.com
SEND_REAL_EMAILS=true
```

### ⚙️ App Configuration
```
NODE_ENV=production
```

## 🚀 Deployment Steps

### Step 1: Push Your Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Name it `skillswap-app` or similar

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/skillswap-app.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Web Service on Render

1. **Go to Render Dashboard**
2. **Click "New +"** → **Web Service**
3. **Connect GitHub Repository**:
   - Select your SkillSwap repository
   - Click "Connect"

4. **Configure Service**:
   - **Name**: `skillswap` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

5. **Environment Variables**:
   - Select your `skillswap-env` environment group
   - Or add variables manually

6. **Plan**: Start with `Free` (you can upgrade later)

7. **Click "Create Web Service"**

### Step 3: Monitor Deployment

1. **Build Process**: Watch the build logs in real-time
2. **Deployment**: Render will automatically deploy after successful build
3. **URL**: You'll get a URL like `https://skillswap.onrender.com`

## 🔍 Post-Deployment Checklist

### ✅ Test Core Functionality

1. **Authentication**:
   - [ ] User registration works
   - [ ] Email verification works
   - [ ] Google OAuth works
   - [ ] Login/logout works

2. **Profile Management**:
   - [ ] Profile creation works
   - [ ] Profile editing works
   - [ ] Skill updates work

3. **Payment System**:
   - [ ] Razorpay integration works
   - [ ] Coin purchase works
   - [ ] Email confirmations sent
   - [ ] Transaction history updates

4. **Core Features**:
   - [ ] User discovery works
   - [ ] Session booking works
   - [ ] AI features work
   - [ ] Admin panel accessible

### 🔧 Common Issues & Solutions

#### Build Errors
- **Node.js Version**: Render uses Node 18 by default
- **Memory Issues**: Upgrade to Starter plan if needed
- **Dependencies**: Ensure all packages are in `dependencies`, not `devDependencies`

#### Runtime Errors
- **Environment Variables**: Double-check all variables are set correctly
- **Firebase Rules**: Ensure Firestore rules allow production domain
- **Email Service**: Verify Gmail app password is correct

#### Performance Issues
- **Cold Starts**: Free tier has cold starts; upgrade for better performance
- **Build Time**: Large apps may need longer build times

## 🌐 Custom Domain (Optional)

1. **Purchase Domain**: Buy from any domain registrar
2. **Add to Render**:
   - Go to service settings
   - Add custom domain
   - Follow DNS instructions
3. **SSL Certificate**: Automatically provided by Render

## 🔄 Continuous Deployment

Render automatically redeploys when you push to your connected branch:

```bash
git add .
git commit -m "Your changes"
git push origin main  # Automatically triggers deployment
```

## 📊 Monitoring & Logs

1. **Logs**: Real-time logs available in Render dashboard
2. **Metrics**: Basic metrics on Free tier, advanced on paid plans
3. **Alerts**: Set up email alerts for deployments

## 🚨 Production Considerations

### 🔒 Security
- [ ] Use production Firebase project
- [ ] Use production Razorpay keys
- [ ] Enable Firestore security rules
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS only

### 📈 Performance
- [ ] Enable compression
- [ ] Optimize images
- [ ] Use CDN for static assets
- [ ] Monitor performance metrics

### 💾 Database
- [ ] Set up proper Firestore indexes
- [ ] Configure backup strategy
- [ ] Monitor usage quotas

### 📧 Email Service
- [ ] Set up dedicated email service (SendGrid/Mailgun for production)
- [ ] Configure proper SPF/DKIM records
- [ ] Monitor email delivery rates

## 🆘 Support

If you encounter issues:

1. **Check Render Logs**: First place to look for errors
2. **Environment Variables**: Verify all are set correctly
3. **Firebase Console**: Check for authentication/database issues
4. **Razorpay Dashboard**: Verify payment configurations

## 🎉 Congratulations!

Your SkillSwap application is now live! 🚀

**Your live URL**: `https://your-service-name.onrender.com`

Remember to:
- Test thoroughly before promoting to users
- Set up monitoring and alerts
- Plan for scaling as you grow
- Regular backups of your data

---

**Happy Deploying! 🎊**
