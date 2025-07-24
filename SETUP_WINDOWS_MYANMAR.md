# Windows မှာ PDF-Tech HR System ထည့်သွင်းနည်း

# PDF-Tech HR Management System - Windows Setup

မြန်မာ အစိုးရ ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ် Windows ကွန်ပြုတာမှာ အသုံးပြုရန်

---

## 📋 **လိုအပ်သော အရာများ**

### **ကွန်ပြုတာ အနည်းဆုံး လိုအပ်ချက်များ:**

- **Windows 10 သို့မဟုတ် Windows 11**
- **RAM: အနည်းဆုံး 8GB** (16GB ပိုကောင်းတယ်)
- **Hard Disk: အနည်းဆုံး 2GB လွတ်နေရာ**
- **Internet လိုအပ်တယ်** (download များအတွက်)

---

## 🛠️ **အဆင့် ၁: Node.js ထည့်သွင်းခြင်း**

### **Node.js ကို ဘယ်လို download လုပ်မလဲ:**

1. **ဒီ website ကို သွားပါ:** [https://nodejs.org/](https://nodejs.org/)

2. **"LTS" ဆိုတဲ့ စိမ်းရောင် button ကို နှိပ်ပါ**

   - ဒါက အတော်ဆုံး နည်းပညာဗားရှင်းဖြစ်တယ်
   - Windows ကို အလိုအလျောက် သိသွားမယ်

3. **Download ပြီးရင် installer ကို run ပါ**

   - "Run" ကို နှိပ်ပါ (Windows က warning ပေးရင်)
   - "Next" ကို နှိပ်ပြီး continue လုပ်ပါ
   - **အရေးကြီး:** "Add to PATH" ကို ✅ check ချထားပါ

4. **Install ပြီးရင် test လုပ်က���ည့်ပါ:**

   ```cmd
   # Command Prompt ကို ဖွင့်ပြီး ရိုက်ကြည့်ပါ:
   node --version
   # v18.17.0 လို ပြရမယ်

   npm --version
   # 9.6.7 လို ပြရမယ်
   ```

### **Command Prompt ကို ဘယ်လို ဖွင့်မလဲ:**

1. **Windows Key + R** နှိပ်ပါ
2. **"cmd"** ရိုက်ပြီး Enter နှိပ်ပါ
3. သို့မဟုတ် Start Menu မှာ "Command Prompt" ရှာပါ

---

## 📂 **အဆင့် ၂: Project ကို ကူးယူခြင်း**

### **Project folder ဖန်တီးခြင်း:**

1. **Desktop ပေါ်မှာ right-click လုပ်ပါ**
2. **"New" → "Folder" ရွေးပါ**
3. **Folder နာမည်ကို "PDF-HR-System" လို့ ပေးပါ**

### **Project files များ ထည့်ခြင်း:**

**Method 1: ZIP file download လုပ်ရင်**

1. ZIP file ကို download လုပ်ပါ
2. Right-click လုပ်ပြီး "Extract All" နှိပ်ပါ
3. PDF-HR-System folder ထဲမှာ extract လုပ်ပါ

**Method 2: Git နဲ့ clone လုပ်ရင်**

```cmd
# Desktop ကို သွားပါ
cd C:\Users\%USERNAME%\Desktop

# Project ကို clone လုပ်ပါ
git clone https://github.com/your-username/hr-system.git PDF-HR-System

# Project folder ထဲ ဝင်ပါ
cd PDF-HR-System
```

---

## 🔧 **အဆင့် ၃: အလွယ်တကူ Setup လုပ်ခြင်း**

### **Automatic Setup (အကြံပြုထားတဲ့ နည်းလမ်း):**

1. **PDF-HR-System folder ကို ဖွင့်ပါ**

2. **"setup-windows.bat" file ကို double-click လုပ်ပါ**

   - ဒါက အလိုအလျောက် အရာအားလုံး ထည့်သွင်းပေးမယ်
   - 2-5 မိနစ် ကြာနိုင်တယ် (internet အရှိန်ပေါ် မူတည်)

3. **Setup script က ဒီအရာတွေ လုပ်ပေးမယ်:**
   - Node.js ရှိမရှိ စစ်မယ်
   - လိုအပ်တဲ့ packages တွေ ထည့်မယ်
   - .env file ဖန်တီးမယ်
   - အားလုံး အဆင်ပြေရင် အစမ်း run လို့ရမယ်

### **Manual Setup (လက်ဖြင့် လုပ်ချင်ရင်):**

```cmd
# Command Prompt မှာ project folder ကို သွားပါ
cd C:\Users\%USERNAME%\Desktop\PDF-HR-System

# Dependencies တွေ ထည့်ပါ
npm install

# .env file ဖန်တီးပါ
copy .env.example .env
```

---

## 🔥 **အဆင့် ၄: Firebase ပြင်ဆင်ခြင်း**

### **Firebase Project ဖန်တီးခြင်း:**

1. **ဒီ website ကို သွားပါ:** [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Google Account နှ့ Sign in လုပ်ပါ**

3. **"Add project" ကို နှိပ်ပါ**

4. **Project နာမည် ပေးပါ:** "pdf-hr-system"

5. **"Continue" နှိပ်ပြီး project ဖန်တီးပါ**

### **Firestore Database ပြင်ဆင်ခြင်း:**

1. **Firebase Console မှာ "Firestore Database" ကို နှိပ်ပါ**

2. **"Create database" ကို နှိပ်ပါ**

3. **"Start in test mode" ကို ရွေးပါ** (development အတွက်)

4. **Location ကို "asia-southeast1 (Singapore)" ရွေးပါ**
   - ဒါက မြန်မာနိုင်ငံနဲ့ အနီးဆုံးဖြစ်တယ်

### **Authentication ပွင့်ခြင်း:**

1. **"Authentication" ကို နှိပ်ပါ**

2. **"Sign-in method" tab ကို နှိပ်ပါ**

3. **"Email/Password" ကို enable လုပ်ပါ**

4. **"Save" နှိပ်ပါ**

### **Firebase Config ရယူခြင်း:**

1. **Project Settings (gear icon) ကို နှိပ်ပါ**

2. **"Your apps" section ကို ရှာပါ**

3. **"Add app" → "</> Web" icon ကို နှိပ်ပါ**

4. **App နာမည် ပေးပါ:** "hr-management-web"

5. **"Register app" နှိပ်ပါ**

6. **Config object ကို copy လုပ်ပါ:**
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

### **.env file ကို ပြင်ဆင်ခြင်း:**

1. **Project folder မှာ ".env" file ကို ဖွင့်ပါ** (Notepad နဲ့)

2. **Firebase config values တွေ ထည့်ပါ:**

   ```env
   VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   VITE_FIREBASE_AUTH_DOMAIN=pdf-hr-system.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=pdf-hr-system
   VITE_FIREBASE_STORAGE_BUCKET=pdf-hr-system.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
   ```

3. **File ကို save လုပ်ပါ**

---

## 🚀 **အဆင့် ၅: Application စတင်ခြင်း**

### **Development Server စတင်ခြင်း:**

**Method 1: Script file သုံးခြင်း (အလွယ်ဆုံး)**

1. **"start-dev.bat" file ကို double-click လုပ်ပါ**
2. **Command Prompt window ပွင့်လာမယ်**
3. **Browser ကို ဖွင့်ပြီး http://localhost:5173/ ကို သွားပါ**

**Method 2: Command Prompt နဲ့ စတင်ခြင်း**

```cmd
# Project folder ကို သွားပါ
cd C:\Users\%USERNAME%\Desktop\PDF-HR-System

# Development server ကို စတင်ပါ
npm run dev

# အဖြေ: ➜ Local: http://localhost:5173/
```

### **Browser မှာ ဖွင့်ခြင်း:**

1. **Chrome, Edge, သို့မဟုတ် Firefox ဖွင့်ပါ**

2. **Address bar မှာ ရိုက်ပါ:** `http://localhost:5173/`

3. **HR System login page ပေါ်လာရမယ်**

### **Login စမ်းကြည့��ခြင်း:**

**Demo အတွက် သုံးလို့ရတဲ့ username/password:**

- **Admin User:**

  - Email: `admin@pdf.gov.mm`
  - Password: `admin123`

- **Regular User:**
  - Email: `user@pdf.gov.mm`
  - Password: `user123`

---

## 🎯 **အဆင့် ၆: Government Features စမ်းကြည့်ခြင်း**

### **Pay Scale Management စမ်းကြည့်ခြင်း:**

1. **Admin နဲ့ login ဝင်ပါ**

2. **Left menu မှာ "Government HR" ကို နှိပ်ပါ**

3. **"Pay Scale Management" ကို နှိပ်ပါ**

4. **"Generate Defaults" button ကို နှိပ်ပါ**

   - ဒါက Grade 1-20, Step 1-10 အားလုံး ဖန်တီးပေးမယ်

5. **Different grades တွေ ကြည့်ကြည့်ပါ**
   - Grade 1 ကနေ Grade 20 အထိ ရှိမယ်
   - အသီးသီး Step 1-10 ရှိမယ်
   - လစာတွေ အလိုအလျောက် တွက်ပေးမယ်

### **Service Records စမ်းကြည့်ခြင်း:**

1. **"Service Records" ကို နှိပ်ပါ**

2. **"Add Service Record" ကို နှိပ်ပါ**

3. **Record Type က "Promotion" ရွေးပါ**

4. **Sample data ထည့်ပြီး Save လုပ်ကြည့်ပါ**

5. **Timeline view မှာ record ပေါ်လာမယ်**

### **Approval Workflows စမ်းကြည့်ခြင်း:**

1. **"Approval Workflows" ကို နှိပ်ပါ**

2. **အဆင့်စုံ အတည်ပြုမှု လုပ်ငန်းစဉ်တွေ ကြည့်နိုင်မယ်**

3. **Demo workflow တွေ စမ်းကြည့်ပါ**

---

## ⚠️ **ပြဿနာများ နဲ့ ဖြေရှင်းချက်များ**

### **အတော်ဆုံး ကြုံနိုင်တဲ့ ပြဿနာများ:**

#### **❌ "node is not recognized"**

**ဖြေရှင်းချက်:**

1. Node.js ကို ပြန် install လုပ်ပါ
2. "Add to PATH" ကို check ချပါ
3. Command Prompt ကို ပိတ်ပြီး ပြန်ဖွင့်ပါ
4. Computer ကို restart လုပ်ပါ

#### **❌ Firebase connection error**

**ဖြေရှင်းချက်:**

1. .env file မှာ Firebase config စစ်ပါ
2. Firebase Console မှာ project setting စစ်ပါ
3. Internet connection စစ်ပါ

#### **❌ Port 5173 already in use**

**ဖြေရှင်းချက်:**

```cmd
# Port ကို သုံးနေတဲ့ program ကို ပိတ်ပါ
netstat -ano | findstr :5173
# PID ကို ရှာပြီး task manager မှာ ပိတ်ပါ

# သို့မဟုတ် အခြား port သုံးပါ
npm run dev -- --port 3000
```

#### **❌ npm install fails**

**ဖြေရှင်းချက်:**

```cmd
# Admin အနေနဲ့ Command Prompt ဖွင့်ပါ
# Right-click Command Prompt → "Run as administrator"

# Cache ရှင်းပါ
npm cache clean --force

# ပြန် install လုပ်ပါ
npm install
```

### **Performance နှေးရင်:**

1. **RAM သုံးမှု စစ်ပါ** (Task Manager)
2. **Antivirus က block လုပ်နေတာ မဟုတ်ဘူးလား စစ်ပါ**
3. **Browser cache ရှင်းပါ** (Ctrl+Shift+Delete)
4. **Internet speed စစ်ပါ**

---

## 📱 **Mobile မှာ စမ်းကြည့်ခြင်း**

### **Mobile phone နဲ့ access လုပ်နည်း:**

1. **Computer နဲ့ Mobile ကို same WiFi မှာ ချိတ်ပါ**

2. **Command Prompt မှာ ရိုက်ပါ:**

   ```cmd
   # Network access ပွင့်ထ���းပြီး start လုပ်ပါ
   npm run dev:host
   ```

3. **Computer ရဲ့ IP Address ရှာပါ:**

   ```cmd
   ipconfig
   ```

4. **Mobile browser မှာ သွားပါ:** `http://YOUR_IP:5173/`
   - ဥပမာ: `http://192.168.1.100:5173/`

---

## 💾 **Data ကို backup လုপ်နည်း**

### **Regular backup အတွက်:**

1. **Project folder တစ်ခုလုံး copy လုပ်ပါ**

2. **Firebase Console မှာ data export လုပ်ပါ**

3. **.env file ကို သီးခြား backup လုပ်ပါ**

### **အသစ် setup လုပ်ရင်:**

1. **Project folder ကို ပြန် copy လုပ်ပါ**

2. **npm install ပြန် run ပါ**

3. **.env file ကို ပြန် configure လုပ်ပါ**

---

## 🎓 **နောက်ထပ် လေ့လာစရာများ**

### **အသေးစိတ် လမ်းညွှန်များ:**

- **📖 Local Setup Guide:** `LOCAL_SETUP_GUIDE.md`
- **📖 Quick Start:** `WINDOWS_QUICK_START.md`
- **📖 Government Features:** `GOVERNMENT_READINESS_ASSESSMENT.md`

### **Technical အချက်အလက်များ:**

- **📖 Implementation Plan:** `PRIORITY_IMPLEMENTATION_PLAN.md`
- **📖 Production Readiness:** `PRODUCTION_READINESS.md`

### **Daily အသုံးပြုမှု:**

```cmd
# စတင်ရန်
npm run dev

# ပိတ်ရန်
Ctrl+C (Command Prompt မှာ)

# အသစ် update ရယူရန်
git pull origin main
npm install

# Problems ရှိရင် reset လုပ်ရန်
npm run reset
```

---

## 🎉 **အောင်မြင်စွာ ပြီးပါပြီ!**

**သင့်ရဲ့ Windows ကွန်ပြုတာမှာ PDF-Tech HR Management System အသုံးပြုရန် အသင့်ပြီပါပြီ!**

### **နောက်ထပ် လုပ်စရာများ:**

1. **📋 ဝန်ထမ်းများကို စာရင်းပြုစုပါ**
2. **💰 Pay scales တွေ ပြင်ဆင်ပါ**
3. **✅ Approval workflows တွေ setup လုပ်ပါ**
4. **🏖️ Leave policies တွေ configure လုပ်ပါ**
5. **📊 Reports တွေ generate လုပ်ကြည့်ပါ**

**🏛️ မြန်မာအစိုးရ အဖွဲ့အစည်းများအတွက် အပြည့်အဝ အသင့်ပြီ!**

---

**Version:** 1.0.0  
**Updated:** January 2025  
**Language:** Myanmar (Burmese)  
**OS:** Windows 10/11
