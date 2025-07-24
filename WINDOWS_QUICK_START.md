# Windows Quick Start Guide

# Windows အမြန်စတင်ရန် လမ်းညွှန်

Get the PDF-Tech HR Management System running on your Windows computer in 15 minutes!

---

## 🚀 **Super Quick Setup (5 Steps)**

### **Step 1: Install Node.js**

1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download **LTS Version** (green button)
3. Run installer → Next → Next → Install
4. ✅ Make sure "Add to PATH" is checked

### **Step 2: Download Project**

1. Download project ZIP file or clone with Git
2. Extract to: `C:\Users\%USERNAME%\Desktop\hr-system`

### **Step 3: Run Setup Script**

1. Open project folder
2. **Double-click `setup-windows.bat`**
3. Wait for installation (2-5 minutes)

### **Step 4: Configure Firebase**

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Create new project: `pdf-hr-system`
3. Enable Firestore + Authentication
4. Get config values and edit `.env` file

### **Step 5: Start Application**

1. **Double-click `start-dev.bat`**
2. Open browser: `http://localhost:5173/`
3. Login: `admin@pdf.gov.mm` / `admin123`

**🎉 Done! Your government HR system is ready!**

---

## 📁 **Project File Structure**

```
hr-system/
│
├── 📁 client/                    # Frontend code
│   ├── 📁 pages/                 # All pages
│   │   ├── GovernmentPayScaleManagement.tsx
│   │   ├── ServiceRecordManagement.tsx
│   │   ├── ApprovalWorkflowManagement.tsx
│   │   └── ...
│   ├── 📁 components/            # UI components
│   ├── 📁 hooks/                 # Business logic
│   └── 📁 types/                 # TypeScript types
│
├── 📁 public/                    # Static files
├── 📄 .env                       # Configuration file
├── 📄 package.json               # Dependencies
├── 📄 setup-windows.bat          # 🔧 Setup script
├── 📄 start-dev.bat              # 🚀 Start script
├── 📄 LOCAL_SETUP_GUIDE.md       # 📖 Detailed guide
└── 📄 WINDOWS_QUICK_START.md     # 📖 This file
```

---

## 🛠️ **Useful Commands**

Open **Command Prompt** in project folder and run:

```cmd
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Check for issues
npm audit

# Update packages
npm update
```

---

## 🎯 **Government Features Available**

### **1. 💰 Pay Scale Management**

- **Location:** Government HR → Pay Scale Management
- **Features:** Grade 1-20, Step 1-10, Allowances, Benefits
- **Usage:** Manage government employee salary structures

### **2. 📋 Service Records**

- **Location:** Government HR → Service Records
- **Features:** Promotion, Transfer, Training, Awards, Disciplinary
- **Usage:** Track complete employee service history

### **3. ✅ Approval Workflows**

- **Location:** Government HR → Approval Workflows
- **Features:** Multi-level approvals, Delegation, Progress tracking
- **Usage:** Automate government approval processes

### **4. 🏖️ Leave Policies**

- **Features:** Annual, Medical, Maternity, Casual, Study, Religious
- **Usage:** Myanmar government standard leave types

---

## ⚡ **Troubleshooting**

### **Common Issues:**

**❌ "node is not recognized"**

- **Solution:** Restart Command Prompt after Node.js installation

**❌ Firebase connection error**

- **Solution:** Check `.env` file has correct Firebase config

**❌ Port 5173 already in use**

- **Solution:** Close other applications or restart computer

**❌ npm install fails**

- **Solution:** Run Command Prompt as Administrator

**❌ Slow loading**

- **Solution:** Check internet connection, clear browser cache

---

## 🔄 **Daily Usage**

### **To Start Working:**

1. **Double-click `start-dev.bat`**
2. **Open:** `http://localhost:5173/`
3. **Login and start working!**

### **To Stop:**

1. **Press `Ctrl+C`** in Command Prompt
2. **Close browser tab**

### **To Update:**

1. **Download new project files**
2. **Run `setup-windows.bat` again**
3. **Start with `start-dev.bat`**

---

## 🎓 **Learn More**

- **📖 Complete Setup Guide:** `LOCAL_SETUP_GUIDE.md`
- **📋 Government Features:** `GOVERNMENT_READINESS_ASSESSMENT.md`
- **🚀 Implementation Plan:** `PRIORITY_IMPLEMENTATION_PLAN.md`

---

## 📞 **Need Help?**

### **Check These First:**

1. **Node.js installed?** Run `node --version` in Command Prompt
2. **Internet working?** Check browser can access websites
3. **Firewall blocking?** Allow Node.js through Windows Firewall
4. **Antivirus blocking?** Add project folder to exclusions

### **Quick Fixes:**

```cmd
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rmdir /s node_modules
npm install

# Reset to clean state
git reset --hard HEAD
npm install
```

---

**🏛️ Perfect for Myanmar Government Organizations!**  
**မြန်မာအစိုးရ အဖွဲ့အစည်းများအတွက် ပြီးပြည့်စုံ!**

**Version:** 1.0.0  
**Updated:** January 2025  
**Tested on:** Windows 10/11
