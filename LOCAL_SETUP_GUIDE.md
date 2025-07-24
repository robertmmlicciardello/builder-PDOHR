# Local Setup Guide for Windows

# Windows ကွန်ပြုတာမှာ Local Setup လုပ်နည်း

Complete guide to run the HR Management System on your local Windows computer.

---

## 📋 **Prerequisites / လိုအပ်ချက်များ**

### **1. System Requirements / စနစ် လိုအပ်ချက်များ**

- **Operating System:** Windows 10/11 (64-bit)
- **RAM:** Minimum 8GB, Recommended 16GB
- **Storage:** At least 2GB free space
- **Internet:** Stable internet connection for downloads and Firebase

---

## 🛠️ **Step 1: Install Required Software / လိုအပ်သော Software များ ထည့်သ��င်းခြင်း**

### **1.1 Install Node.js**

**Download and Install:**

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download **LTS Version** (Recommended)
3. Run the installer and follow the setup wizard
4. **Important:** Check "Add to PATH" during installation

**Verify Installation:**

```cmd
# Open Command Prompt (cmd) and type:
node --version
npm --version

# Should show versions like:
# v18.17.0
# 9.6.7
```

### **1.2 Install Git**

**Download and Install:**

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and run the installer
3. **Important Settings during installation:**
   - Select "Git from the command line and also from 3rd-party software"
   - Select "Checkout Windows-style, commit Unix-style line endings"
   - Select "Windows Command Prompt" as terminal

**Verify Installation:**

```cmd
# Open Command Prompt and type:
git --version

# Should show something like:
# git version 2.41.0.windows.1
```

### **1.3 Install VS Code (Recommended)**

**Download and Install:**

1. Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
2. Download and install VS Code
3. **Recommended Extensions:**
   - TypeScript and JavaScript Language Features
   - Prettier - Code formatter
   - ES7+ React/Redux/React-Native snippets
   - GitLens

---

## 📂 **Step 2: Download Project / Project ကူးယူခြင်း**

### **2.1 Create Project Folder**

```cmd
# Open Command Prompt
# Navigate to your desired location (e.g., Desktop)
cd C:\Users\%USERNAME%\Desktop

# Create a new folder for your projects
mkdir MyProjects
cd MyProjects
```

### **2.2 Clone the Project**

**Method A: If you have Git repository URL**

```cmd
# Replace with your actual repository URL
git clone https://github.com/your-username/hr-management-system.git
cd hr-management-system
```

**Method B: If you need to create from current files**

```cmd
# Create new project folder
mkdir hr-management-system
cd hr-management-system

# Initialize git repository
git init
```

**Method C: Download ZIP (if available)**

1. Download the project as ZIP file
2. Extract to `C:\Users\%USERNAME%\Desktop\MyProjects\hr-management-system`
3. Open Command Prompt in that folder

---

## 🔧 **Step 3: Project Setup / Project ပြင်ဆင်ခြင်း**

### **3.1 Install Dependencies**

```cmd
# Make sure you're in the project folder
cd C:\Users\%USERNAME%\Desktop\MyProjects\hr-management-system

# Install all required packages
npm install

# This will take 2-5 minutes depending on internet speed
```

### **3.2 Create Environment File**

**Create `.env` file in project root:**

```cmd
# Copy the example environment file
copy .env.example .env

# Or create manually
notepad .env
```

**Edit `.env` file with the following content:**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Development Settings
NODE_ENV=development
VITE_APP_VERSION=1.0.0

# Optional: If you have measurement ID
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## 🔥 **Step 4: Firebase Setup / Firebase ပြင်ဆင်ခြင်း**

### **4.1 Create Firebase Project**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Click "Add project"**
3. **Enter project name:** `pdf-hr-system` (or your preferred name)
4. **Enable Google Analytics:** Optional
5. **Click "Create project"**

### **4.2 Setup Firestore Database**

1. **In Firebase Console, go to "Firestore Database"**
2. **Click "Create database"**
3. **Choose "Start in test mode"** (for development)
4. **Select location:** `asia-southeast1` (Singapore - closest to Myanmar)
5. **Click "Done"**

### **4.3 Setup Authentication**

1. **Go to "Authentication" → "Sign-in method"**
2. **Enable "Email/Password"**
3. **Click "Save"**

### **4.4 Get Firebase Configuration**

1. **Go to Project Settings** (gear icon)
2. **Scroll down to "Your apps" section**
3. **Click "Add app" → Web app (</>) icon**
4. **Enter app nickname:** `hr-management-web`
5. **Check "Also set up Firebase Hosting"** (optional)
6. **Click "Register app"**
7. **Copy the config object** and update your `.env` file

**Example config:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "pdf-hr-system.firebaseapp.com",
  projectId: "pdf-hr-system",
  storageBucket: "pdf-hr-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
};
```

**Update your `.env` file:**

```env
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=pdf-hr-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pdf-hr-system
VITE_FIREBASE_STORAGE_BUCKET=pdf-hr-system.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
```

### **4.5 Setup Firestore Security Rules**

**In Firestore → Rules, replace with:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access on all documents to any user signed in to the application
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Click "Publish"**

---

## 🚀 **Step 5: Run the Application / Application စတင်ခြင်း**

### **5.1 Start Development Server**

```cmd
# Make sure you're in the project directory
cd C:\Users\%USERNAME%\Desktop\MyProjects\hr-management-system

# Start the development server
npm run dev

# You should see output like:
# VITE v4.4.5  ready in 1234 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### **5.2 Open in Browser**

1. **Open your web browser**
2. **Go to:** `http://localhost:5173/`
3. **You should see the login page**

### **5.3 Test Login**

**Use demo credentials:**

- **Admin:** admin@pdf.gov.mm / admin123
- **User:** user@pdf.gov.mm / user123

---

## 🎯 **Step 6: Verify Government Features / အစိုးရ လုပ်ဆောင်ချက်များ စစ်ဆေးခြင်း**

### **6.1 Test Government Pay Scale**

1. **Login as admin**
2. **Go to:** Government HR → Pay Scale Management
3. **Click "Generate Defaults"** to create sample data
4. **Verify:** Grade 1-20, Step 1-10 tables appear

### **6.2 Test Service Records**

1. **Go to:** Government HR → Service Records
2. **Click "Add Service Record"**
3. **Create a sample promotion record**
4. **Verify:** Record appears in timeline view

### **6.3 Test Approval Workflows**

1. **Go to:** Government HR → Approval Workflows
2. **Check:** Pending approvals section
3. **Verify:** Multi-level approval structure works

---

## 🔧 **Troubleshooting / ပြဿနာဖြေရှင်းခြင်း**

### **Common Issues / သာမန် ပြဿနာများ**

#### **Issue 1: "node" is not recognized**

```cmd
# Solution: Add Node.js to PATH
# 1. Search for "Environment Variables" in Windows Start Menu
# 2. Click "Edit the system environment variables"
# 3. Click "Environment Variables"
# 4. Find "Path" in System Variables, click "Edit"
# 5. Add: C:\Program Files\nodejs\
# 6. Restart Command Prompt
```

#### **Issue 2: Firebase connection errors**

```cmd
# Check your .env file
# Make sure all VITE_FIREBASE_* variables are set correctly
# Verify Firebase project settings match your .env values

# Test Firebase connection
npm run dev
# Check browser console (F12) for Firebase errors
```

#### **Issue 3: Port 5173 is already in use**

```cmd
# Kill process using the port
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or use different port
npm run dev -- --port 3000
```

#### **Issue 4: Permission denied errors**

```cmd
# Run Command Prompt as Administrator
# Right-click Command Prompt → "Run as administrator"
```

#### **Issue 5: npm install fails**

```cmd
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rmdir /s node_modules
del package-lock.json
npm install
```

### **Performance Issues / စွမ်းဆောင်ရည် ပြဿနာများ**

#### **Slow Loading**

```cmd
# Build for production to test performance
npm run build
npm run preview

# Check network tab in browser developer tools
# Optimize images if needed
```

#### **Memory Issues**

```cmd
# Increase Node.js memory limit
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
```

---

## 📱 **Step 7: Mobile Testing / မိုဘိုင်းဖုန်း စစ်ဆေးခြင်း**

### **7.1 Test on Mobile Devices**

```cmd
# Start dev server with network access
npm run dev -- --host

# Find your computer's IP address
ipconfig

# On mobile browser, go to:
# http://YOUR_COMPUTER_IP:5173/
# Example: http://192.168.1.100:5173/
```

### **7.2 Responsive Design Testing**

1. **Open browser developer tools (F12)**
2. **Click device toolbar icon**
3. **Test different screen sizes:**
   - Mobile: 375x667 (iPhone)
   - Tablet: 768x1024 (iPad)
   - Desktop: 1920x1080

---

## 💾 **Step 8: Data Backup / ဒေတာ မိတ္တူကူးခြင်း**

### **8.1 Export Firestore Data**

```cmd
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set project
firebase use your-project-id

# Export data
firebase firestore:delete --all-collections --project your-project-id
# This exports data to Cloud Storage bucket
```

### **8.2 Backup Project Files**

```cmd
# Create backup folder
mkdir C:\Users\%USERNAME%\Desktop\HR-System-Backup

# Copy project (excluding node_modules)
xcopy C:\Users\%USERNAME%\Desktop\MyProjects\hr-management-system C:\Users\%USERNAME%\Desktop\HR-System-Backup /E /I /H /K /exclude:node_modules
```

---

## 🔄 **Step 9: Updates & Maintenance / အပ်ဒိတ်နှင့် ပြုပြင်ထိန်းသိမ်းမှု**

### **9.1 Update Dependencies**

```cmd
# Check for updates
npm outdated

# Update all packages
npm update

# Update specific package
npm install package-name@latest
```

### **9.2 Pull Latest Changes**

```cmd
# If using Git repository
git pull origin main

# Reinstall dependencies if needed
npm install

# Restart development server
npm run dev
```

### **9.3 Regular Maintenance**

```cmd
# Weekly maintenance
npm audit
npm audit fix

# Clear cache if issues
npm cache clean --force

# Rebuild node_modules if needed
rmdir /s node_modules
npm install
```

---

## 🎓 **Step 10: Advanced Configuration / အဆင့်မြင့် ပြင်ဆင်မှု**

### **10.1 VS Code Setup**

**Install recommended extensions:**

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-eslint"
  ]
}
```

**VS Code Settings (Ctrl+Shift+P → "Preferences: Open Settings JSON"):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### **10.2 Environment Configuration**

**Create additional environment files:**

**.env.local** (for local overrides):

```env
# Local development overrides
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

**.env.production** (for production builds):

```env
# Production settings
VITE_API_URL=https://your-production-api.com
VITE_DEBUG=false
NODE_ENV=production
```

### **10.3 Build Optimization**

**For production builds:**

```cmd
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets
```

---

## 🎯 **Quick Start Checklist / လျင်မြန်သော စတင်ရန် စာရင်းစစ်**

- [ ] **Node.js installed** (v18+)
- [ ] **Git installed**
- [ ] **VS Code installed** (recommended)
- [ ] **Project downloaded/cloned**
- [ ] **Dependencies installed** (`npm install`)
- [ ] **Firebase project created**
- [ ] **Firestore database setup**
- [ ] **Authentication enabled**
- [ ] **`.env` file configured**
- [ ] **Development server running** (`npm run dev`)
- [ ] **Application accessible** at `http://localhost:5173/`
- [ ] **Login working** with demo credentials
- [ ] **Government features tested**

---

## 🆘 **Need Help? / အကူအညီလိုအပ်ပါသလား?**

### **Resources / ���ရင်းအမြစ်များ**

1. **Node.js Documentation:** [https://nodejs.org/docs/](https://nodejs.org/docs/)
2. **Git Documentation:** [https://git-scm.com/doc](https://git-scm.com/doc)
3. **Firebase Documentation:** [https://firebase.google.com/docs](https://firebase.google.com/docs)
4. **Vite Documentation:** [https://vitejs.dev/guide/](https://vitejs.dev/guide/)
5. **React Documentation:** [https://react.dev/](https://react.dev/)

### **Common Commands Reference / အသုံးများသော Commands များ**

```cmd
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Install new package
npm install package-name

# Check project health
npm audit

# Format code
npm run format

# Type checking
npm run typecheck
```

---

**🎉 Congratulations! Your local HR Management System is now ready for government use! / ဂုဏ်ယူပါတယ်! သင့်ရဲ့ Local HR System က အစိုးရအသုံးပြုရန် အသင့်ပြီပါပြီ!**

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Compatibility:** Windows 10/11, Node.js 18+
