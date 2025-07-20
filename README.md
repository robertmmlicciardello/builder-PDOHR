# ပကဖ-နည်းပညာ ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ်

## PDF-Technology HR Management System

A comprehensive Human Resources Management System built for the People's Defense Force Technology Workshop, featuring financial management, personnel tracking, and administrative tools.

---

## 🚀 Quick Start / လျင်မြန်သော စတင်မှု

### Prerequisites / လိုအပ်ချက်များ

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Firebase Project** with Firestore enabled
- Modern web browser with JavaScript enabled

### Installation / ထည့်သွင်းခြင်း

1. **Clone the repository / Repository ကို ကူးယူခြ��်း:**

   ```bash
   git clone [repository-url]
   cd fusion-starter
   ```

2. **Install dependencies / Dependencies များ ထည့်သွင်းခြင်း:**

   ```bash
   npm install
   ```

3. **Firebase Configuration / Firebase ပြင်ဆင်ခြင်း:**

   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Create a web app and copy the configuration
   - Create `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server / Development server စတင်ခြင်း:**

   ```bash
   npm run dev
   ```

5. **Open your browser / Browser ဖွင့်ခြင်း:**
   Navigate to `http://localhost:5173`

---

## 📋 Features / အင်္ဂါရပ်များ

### 👥 Personnel Management / ဝန်ထမ်းစီမံခန့်ခွဲမှု

- **CRUD Operations:** Add, edit, view, and delete personnel records
- **Unique ID System:** Automatic ID generation (P14034 format)
- **Search & Filter:** Real-time search by ID, name, rank, or organization
- **Status Tracking:** Active, Resigned, Deceased status management
- **Bulk Operations:** Import/export personnel data

### 💰 Financial Management / ငွေကြေးစီမံခန့်ခွဲမှု

- **Income Tracking:** Configurable income categories (Tax, Donation)
- **Outcome Tracking:** Free-text outcome entries with descriptions
- **Financial Dashboard:** Summary cards showing totals and balance
- **Category Management:** Admin-configurable income categories
- **Transaction History:** Complete financial record keeping

### 🏢 Organization Management / အဖွဲ့အစည်းစီမံခန့်ခွဲမှု

- **Department Management:** Create and manage departments
- **Rank System:** Configurable rank hierarchy
- **Location Tracking:** State, Township, Ward, Village organization
- **Hierarchical Structure:** Multi-level organizational support

### 📊 Reports & Analytics / အစီရင်ခံစာများနှင့် ခွဲခြမ်းစိတ်ဖြာမှု

- **Personnel Summary:** Active members count and distribution
- **Financial Reports:** Income/outcome analysis with date ranges
- **Export Options:** CSV and PDF export capabilities
- **Dashboard Widgets:** Real-time statistics and charts

### 🔒 Security Features / လုံခြုံရေး အင်္ဂါရပ်များ

- **Firebase Authentication:** Secure login with email/password
- **Role-based Access:** Admin and user permission levels
- **Data Encryption:** AES-256 encryption for sensitive data
- **Offline Support:** LocalStorage backup for offline access
- **Audit Logging:** Complete activity tracking

### 🌐 User Interface / အသုံးပြုသူ မျက်နှာပြင်

- **Bilingual Support:** Myanmar and English language support
- **Responsive Design:** Mobile and desktop optimized
- **Myanmar Colors:** National color scheme (Black, Red, White)
- **Modern UI:** Clean and intuitive interface using Radix UI
- **Accessibility:** WCAG compliant design

---

## 🛠️ Technology Stack / နည်းပညာ Stack

### Frontend

- **React 18** with TypeScript
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **React Router 6** - Client-side routing
- **React Hook Form** - Form management
- **Recharts** - Data visualization

### Backend Services

- **Firebase Authentication** - User authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Hosting** - Web hosting platform

### Libraries & Tools

- **crypto-js** - Data encryption
- **papaparse** - CSV file handling
- **jsPDF** - PDF generation
- **date-fns** - Date manipulation
- **lucide-react** - Icon library

---

## 📱 Usage Guide / အသုံးပြုမှု လမ်းညွှန်

### First Time Setup / ပထမဆုံး အသုံးပြုမှု

1. **Create Admin Account:**

   - Register with email and password
   - First user automatically becomes admin

2. **Configure System Settings:**

   - Go to Admin Settings → System Configuration
   - Set up income categories (Tax, Donation)
   - Configure departments and ranks

3. **Add Personnel Records:**
   - Navigate to Personnel Management
   - Click "Add New Personnel"
   - Fill required information and save

### Daily Operations / နေ့စဉ် လုပ်ငန်းများ

#### Adding Personnel / ဝန်ထမ်း ထည့်ခြင်း

1. Go to "Personnel Management"
2. Click "Add New Personnel" button
3. Fill in the required fields:
   - ID (auto-generated or manual)
   - Full Name
   - Rank
   - Join Date
   - Organization
   - Duties (in Myanmar)
   - Status
4. Click "Save" to add the record

#### Financial Transactions / င��ေကြေး ငွေရွေးမှု

1. Navigate to "Financial Management"
2. Select transaction type (Income/Outcome)
3. For Income:
   - Choose category (Tax/Donation)
   - Enter amount and description
4. For Outcome:
   - Enter free-text category
   - Add amount and description
5. Save the transaction

#### Generating Reports / အစီရင်ခံစာ ထုတ်ခြင်း

1. Go to respective management page
2. Use filters to narrow down data
3. Click "Export" button
4. Choose format (CSV or PDF)
5. Download the generated file

---

## 🔧 Configuration / ပြင်ဆင်မှု

### Environment Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Analytics
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Firebase Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🧪 Development / Development လုပ်ခြင်း

### Available Scripts / အသုံးပြုနိုင်သော Scripts များ

```bash
# Development server
npm run dev

# Build for production
npm run build

# Build client only
npm run build:client

# Build server only
npm run build:server

# Start production server
npm run start

# Run tests
npm run test

# Format code
npm run format.fix

# Type checking
npm run typecheck
```

### Project Structure / Project တည်ဆောက်ပုံ

```
├── client/                 # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React context providers
│   └── lib/               # Utility functions
├── shared/                # Shared types and utilities
├── server/                # Backend server (optional)
├── public/                # Static assets
└── netlify/               # Serverless functions
```

---

## 🚀 Deployment / Deploy လုပ်ခြင်း

### Firebase Hosting

1. **Install Firebase CLI:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**

   ```bash
   firebase login
   ```

3. **Initialize Firebase:**

   ```bash
   firebase init hosting
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

### Netlify Deployment

1. **Connect your repository to Netlify**
2. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add environment variables in Netlify dashboard**
4. **Deploy automatically on git push**

---

## 🔒 Security Considerations / လုံခြုံရေး ထည့်သွင်းစဉ်းစားရမည်များ

### Data Protection

- All sensitive data is encrypted using AES-256
- Firebase Security Rules restrict unauthorized access
- User authentication required for all operations
- Audit logs track all user activities

### Best Practices

- Regular security updates
- Environment variables for sensitive configuration
- HTTPS enforcement in production
- Content Security Policy headers
- XSS and CSRF protection

---

## 🐛 Troubleshooting / ပြဿနာဖြေရှင်းခြင်း

### Common Issues / သာမန် ပြဿနာများ

#### Firebase Connection Issues

```
Error: Failed to get document because the client is offline
```

**Solution:** The system automatically falls back to localStorage when Firebase is offline. Check your internet connection and Firebase configuration.

#### Build Errors

```
Module not found or import errors
```

**Solution:**

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check import paths and file names
3. Ensure all dependencies are installed

#### Authentication Issues

```
Firebase Auth error
```

**Solution:**

1. Verify Firebase configuration in `.env` file
2. Check Firebase Authentication settings
3. Ensure email/password provider is enabled

### Performance Optimization

- Use pagination for large datasets (100 records per page)
- Implement lazy loading for components
- Optimize images and assets
- Enable Firebase cache for offline support

---

## 📞 Support / ပံ့ပိုးမှု

### Documentation / စာရွက်စာတမ်းများ

- Technical requirements: See `requirements.md`
- Database setup: See `DATABASE_SETUP.md`
- Design guidelines: See `design.md`

### Community / အသိုင်းအဝိုင်း

- For technical issues, create an issue in the repository
- For feature requests, submit a detailed description
- For security concerns, contact the development team directly

---

## 📄 License / လိုင်စင်

This project is proprietary software developed for the People's Defense Force Technology Workshop. All rights reserved.

---

## 🏗️ Contributing / ပါဝင်ကူညီခြင်း

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

### Code Style Guidelines

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes before submitting

---

## 📊 System Requirements / စနစ် လိုအပ်ချက်များ

### Minimum Requirements

- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 1GB free space
- **Network:** Stable internet connection for Firebase
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Specifications

- **RAM:** 16GB for development
- **CPU:** Multi-core processor
- **Storage:** SSD for faster development
- **Network:** High-speed internet for optimal performance

---

## ��� Updates & Maintenance / အပ်ဒိတ်နှင့် ပြုပြင်ထိန်းသိမ်းမှု

### Regular Maintenance

- **Weekly:** Check system logs and performance
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Review and backup data
- **Annually:** Security audit and system optimization

### Update Process

1. Backup current data
2. Test updates in development environment
3. Deploy to staging for final testing
4. Deploy to production during maintenance window
5. Monitor system for issues post-deployment

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Developed for:** People's Defense Force Technology Workshop
