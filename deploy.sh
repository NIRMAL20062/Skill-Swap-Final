#!/bin/bash

# SkillSwap Deployment Helper Script

echo "🚀 SkillSwap Deployment Helper"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check if all files are committed
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Uncommitted changes detected. Committing all changes..."
    git add .
    read -p "Enter commit message: " commit_message
    git commit -m "$commit_message"
else
    echo "✅ All changes committed"
fi

# Push to remote
echo "📤 Pushing to remote repository..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🔗 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Create new Web Service"
echo "3. Connect your GitHub repository"
echo "4. Use the following configuration:"
echo "   - Build Command: npm install && npm run build"
echo "   - Start Command: npm start"
echo "   - Environment Group: skillswap-env"
echo ""
echo "📖 Full deployment guide: ./DEPLOYMENT.md"
echo ""
echo "🎉 Happy Deploying!"
