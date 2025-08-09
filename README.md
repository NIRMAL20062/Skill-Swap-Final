# 🎯 SkillSwap - Trade Skills, Not Money

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Firebase-12.0-orange?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/AI_Powered-Gemini_2.0-red?style=for-the-badge&logo=google&logoColor=white" alt="AI">
</div>

<p align="center">
  <strong>🚀 A modern skill exchange platform where knowledge meets opportunity</strong>
</p>

<p align="center">
  <em>Connect • Learn • Teach • Grow</em>
</p>

---

## ✨ Features Overview

### 🔐 **Authentication & Security**
- 🎭 **Multi-Auth Support**: Email/Password + Google OAuth
- ✅ **Email Verification**: Secure account activation
- 🛡️ **Firebase Security Rules**: Advanced access control
- 👑 **Admin System**: Privileged user management

### 💰 **Coin-Based Economy**
- 🎁 **Welcome Bonus**: 100 SkillCoins for new users
- 💎 **Smart Pricing**: 10 coins/hour session rate
- 📊 **Revenue Split**: 80% mentor, 20% platform
- 💳 **Wallet System**: Complete transaction history

### 🎯 **Skill Discovery**
- 🔍 **Advanced Search**: Find mentors by skills & keywords
- 🎨 **Beautiful Cards**: Intuitive user profiles
- ⭐ **Rating System**: Community-driven quality control
- 🌟 **Public Profiles**: Showcase your expertise

### 📅 **Session Management**
- 📱 **Easy Booking**: Streamlined scheduling system
- 🔄 **Status Tracking**: Pending → Accepted → Completed
- ✅ **Dual Confirmation**: Both parties verify completion
- 🎥 **Google Meet**: Integrated video conferencing

### 🤖 **AI-Powered Features**
- 💬 **Smart Chatbot**: Get instant app assistance
- 🧠 **Skill Suggestions**: AI recommends relevant skills
- 🎯 **Profile Enhancement**: Optimize your visibility

### 👨‍💼 **Admin Dashboard**
- 📊 **Analytics**: Platform statistics & insights
- 👥 **User Management**: Complete user oversight
- 🏆 **Leaderboard**: Top performers showcase
- ⚡ **Privilege Control**: Dynamic admin assignment

---

## 🛠️ Tech Stack

### 🎨 **Frontend**
```bash
⚛️  React 18 + Next.js 15      # Modern React framework
📘 TypeScript                   # Type-safe development
🎨 Tailwind CSS                # Utility-first styling
🧩 Radix UI                    # Accessible components
✨ Framer Motion               # Smooth animations
📋 React Hook Form + Zod       # Form handling & validation
🎭 Lucide React               # Beautiful icons
```

### 🔧 **Backend**
```bash
🔥 Firebase Firestore          # NoSQL cloud database
🔐 Firebase Auth               # User authentication
☁️  Firebase Functions          # Serverless backend
🛡️  Firestore Security Rules    # Access control
📦 Firebase Storage            # File uploads
```

### 🤖 **AI Integration**
```bash
🧠 Google Genkit               # AI development framework
🤖 Gemini 2.0 Flash           # Latest language model
💬 Intelligent Chatbot         # Context-aware assistance
🎯 Skill Recommendation        # Personalized suggestions
```

---

## 📁 Project Structure

```
src/
├── 🎨 app/                     # Next.js App Router pages
│   ├── 🔐 (auth)/             # Authentication flows
│   ├── 📊 dashboard/          # User dashboard
│   ├── 👑 admin/              # Admin interface
│   ├── 🔍 discover/           # Skill discovery
│   ├── 👤 profile/            # User profiles
│   ├── 📅 sessions/           # Session management
│   └── 💰 wallet/             # Coin transactions
├── 🧩 components/
│   ├── 🎨 ui/                 # Reusable UI components
│   ├── ⚡ features/           # Feature components
│   └── 📐 layout/             # Layout components
├── 📚 lib/
│   ├── 🔐 auth.tsx            # Authentication logic
│   ├── 🔥 firebase.ts         # Firebase config
│   ├── 📊 firestore.ts        # Database operations
│   └── 🛠️  utils.ts            # Utilities
├── 🤖 ai/
│   ├── ⚙️  genkit.ts           # AI configuration
│   └── 🌊 flows/              # AI workflows
└── 🎣 hooks/                  # Custom React hooks
```

---

## 🚀 Quick Start

### Prerequisites
- 📦 **Node.js** 18+ installed
- 🔥 **Firebase** account and project
- 🤖 **Google AI Studio** API key

### Installation

```bash
# Clone the repository
git clone https://github.com/NIRMAL20062/Skill-Swap-F.git
cd Skill-Swap-F

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Firebase config and API keys
```

### Environment Setup

```env
# 🔥 Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# 🤖 AI Configuration
GEMINI_API_KEY="your-gemini-api-key"
```

### Development

```bash
# Start development server
npm run dev

# Start AI development server (separate terminal)
npm run genkit:dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🎯 Key Features Demo

### 🔐 Authentication Flow
```typescript
// Multi-provider authentication with verification
- Email/Password with email verification
- Google OAuth integration
- Real-time auth state management
- Secure profile creation
```

### 💰 Coin Economy
```typescript
// Smart economy system
- Welcome bonus: 100 coins
- Session pricing: 10 coins/hour
- Automatic revenue distribution
- Complete transaction history
```

### 🤖 AI Features
```typescript
// Intelligent assistance
- Context-aware chatbot
- Personalized skill suggestions
- Profile optimization tips
```

---

## 🗄️ Database Schema

### 👤 Users Collection
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  skills: string[];
  bio?: string;
  photoURL?: string;
  coins: number;
  rating: number;
  reviewCount: number;
  admin: boolean;
  createdAt: Timestamp;
}
```

### 📅 Sessions Collection
```typescript
interface Session {
  id: string;
  menteeId: string;
  mentorId: string;
  skill: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  duration: number;
  cost: number;
  scheduledFor: Timestamp;
  createdAt: Timestamp;
}
```

### ⭐ Reviews Collection
```typescript
interface Review {
  id: string;
  sessionId: string;
  menteeId: string;
  mentorId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}
```

---

## 🛡️ Security Features

### 🔒 Firestore Security Rules
```javascript
// Example security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read profiles, edit only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId || isAdmin();
    }
    
    // Sessions visible only to participants
    match /sessions/{sessionId} {
      allow read: if request.auth.uid in [
        resource.data.menteeId, 
        resource.data.mentorId
      ] || isAdmin();
    }
  }
}
```

---

## 🎨 UI Components

### 🧩 Component Library
- **Radix UI**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Lucide React**: Consistent iconography

### 🎭 Design System
- **Modern**: Clean, minimalist interface
- **Responsive**: Mobile-first design
- **Accessible**: WCAG compliant
- **Dark Mode**: System preference support

---

## 📊 Performance

### ⚡ Optimizations
- **Next.js 15**: Latest performance features
- **Server Components**: Reduced client bundle
- **Image Optimization**: Automatic WebP conversion
- **Code Splitting**: Lazy-loaded components
- **Bundle Analysis**: Optimized dependencies

### 📈 Metrics
- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Excellent ratings
- **Bundle Size**: Optimized for fast loading
- **SEO Ready**: Meta tags and structured data

---

## 🚀 Deployment

### ☁️ Hosting Options
- **Vercel**: Recommended for Next.js apps
- **Render**: Full-stack deployment
- **Firebase Hosting**: Native Firebase integration

### 🔄 CI/CD Pipeline
```bash
# Automated deployment workflow
git push → Build → Test → Deploy
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. 🍴 **Fork** the repository
2. 🌿 **Create** a feature branch
3. ✨ **Make** your changes
4. ✅ **Test** thoroughly
5. 📝 **Submit** a pull request

### 📋 Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation

---

## � Deployment

### 🌐 Deploy to Render

SkillSwap is configured for easy deployment to Render:

1. **📁 Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **🔗 Connect to Render**:
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository

3. **⚙️ Configuration**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node.js
   - Plan: Free (upgrade as needed)

4. **🔐 Environment Variables**:
   - Create environment group `skillswap-env`
   - Add all variables from `.env.local`
   - See `DEPLOYMENT.md` for complete list

### 🌟 Live Demo
**🔗 [View Live Application](https://skillswap.onrender.com)**

### 📖 Complete Deployment Guide
For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### ☁️ Alternative Platforms
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Firebase Hosting**: `firebase deploy`

---

## �📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

<div align="center">

### 🎯 Built with ❤️ by the SkillSwap Team

**🚀 Empowering knowledge exchange, one skill at a time**

</div>

---

<div align="center">
  <p>
    <strong>⭐ Star this repo if you found it helpful!</strong>
  </p>
  <p>
    <a href="#-skillswap---trade-skills-not-money">Back to Top ⬆️</a>
  </p>
</div>
