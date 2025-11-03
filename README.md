# 🏋️ FitCoach AI - React Native

A comprehensive fitness coaching application built with React Native and Expo, featuring AI-powered chat, progress tracking, rewards system, and shopping functionality.

## ✨ Features

- **🤖 AI Chat Coach**: Personalized fitness guidance and conversation
- **📈 Progress Tracking**: Photo uploads and progress monitoring  
- **🏆 Rewards System**: Points-based gamification with streaks and achievements
- **🛍️ Shop System**: In-app purchases and discount codes
- **🌙 Dark/Light Theme**: Complete theme support
- **👤 User Authentication**: Secure login and profile management

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. **Clone and install**:
```bash
git clone <repository-url>
cd fitcoach-ai
npm install
```

2. **Start development**:
```bash
npm start
```

3. **Run on device**:
```bash
npm run android  # Android
npm run ios      # iOS  
npm run web      # Web browser
```

## Project Structure

```
src/
├── components/          # React Native components
│   ├── Chat.js         # Main chat interface
│   ├── Loading.js      # Loading screen
│   ├── Welcome.js      # Welcome screen
│   ├── Onboarding.js   # User onboarding flow
│   ├── Progress.js     # Progress tracking
│   ├── Rewards.js      # Gamification system
│   ├── Shop.js         # Points shop
│   ├── Settings.js     # App settings
│   ├── ProfileEdit.js  # Profile editing
│   └── config.js       # App configuration
├── context/            # React Context providers
│   ├── AuthContext.js  # Authentication state
│   └── ThemeContext.js # Theme management
└── assets/             # Images and static files
```

## 🎯 Key Features

### 🤖 AI Chat System
- Personalized fitness coaching
- Natural conversation flow
- Progress-aware responses
- Motivational support

### 🏆 Rewards System
- Daily login streaks
- Progress photo rewards
- Referral program
- Points shop with real items
- Discount code generation

### 🛍️ Shopping System
- 13+ fitness products
- Category-based browsing
- Search and filtering
- Points-based discounts
- Secure checkout flow

### 📊 Progress Tracking
- Photo upload system
- Progress visualization
- Goal setting and tracking
- Achievement milestones

## 🛠️ Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build platform
- **React Navigation** - Navigation and routing
- **AsyncStorage** - Local data persistence
- **Linear Gradient** - Beautiful UI gradients
- **Vector Icons** - Comprehensive icon library

## 🔧 Building

### Development Build
```bash
npm run build:android
```

### Production Build  
```bash
npm run build:android:production
```

### Quick Build (Windows)
```bash
build-apk.bat
```

## 📚 Documentation

- **[Build Instructions](BUILD_INSTRUCTIONS.md)** - Complete build and deployment guide
- **[Project Summary](PROJECT_SUMMARY.md)** - Detailed project overview
- **[Rewards System](REACT_NATIVE_REWARDS_FINAL.md)** - Comprehensive rewards documentation
- **[Shop System](SHOP_SYSTEM_FINAL.md)** - Complete shopping system guide

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for fitness enthusiasts**