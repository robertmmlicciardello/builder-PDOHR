# Database Setup Guide

This HR Management System uses Firebase Firestore as the database backend. Follow these steps to set up the database connection.

## 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Firestore Database:
   - Go to "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location for your database

## 2. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</> icon)
4. Register your app with a nickname
5. Copy the configuration values to your `.env` file

## 4. Firestore Security Rules

For development, you can use these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 5. Database Collections

The system will automatically create these collections:

### Core Collections

- `personnel` - Employee personnel records
- `auditLogs` - System audit logs
- `settings` - Application settings

### HR Module Collections

- `positions` - Job positions and hierarchies
- `departments` - Organizational departments
- `performanceReviews` - Performance review records
- `attendance` - Attendance tracking records
- `leaveRequests` - Leave request records
- `leaveBalances` - Employee leave balances
- `trainings` - Training programs and records
- `documents` - Employee documents
- `payroll` - Payroll records
- `customization` - Dashboard customization settings

## 6. Sample Data Initialization

To initialize with sample data, the system will automatically create default departments and sample records when you first run the application.

## 7. Authentication Setup

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" authentication method
4. Create test users:
   - Admin: `admin@pdf.gov.mm` / `pdf2024`
   - User: `user@pdf.gov.mm` / `user2024`

## 8. Database Status Monitoring

The application includes a database status indicator in the HR Dashboard that shows:

- ✅ **DB Connected** - Database is working properly
- ⚠️ **Testing...** - Checking database connection
- ❌ **DB Error** - Database connection failed

## 9. Offline Support

The system includes offline support with:

- Local data caching
- Offline persistence
- Automatic sync when connection is restored

## 10. Backup and Maintenance

Regular backups are recommended:

1. Use Firebase Console to export data
2. Set up automated backups if needed
3. Monitor usage and performance in Firebase Console

## Troubleshooting

### Common Issues

1. **Authentication Error**: Check if authentication is enabled and users exist
2. **Permission Denied**: Verify Firestore security rules
3. **Network Error**: Check internet connection and Firebase configuration
4. **Quota Exceeded**: Monitor Firebase usage limits

### Debug Mode

To enable debug mode, add this to your environment:

```env
VITE_DEBUG_MODE=true
```

This will show additional logging information in the browser console.

## Production Deployment

For production deployment:

1. Update Firestore security rules for production
2. Set up proper user roles and permissions
3. Configure Firebase hosting or your preferred hosting platform
4. Set up monitoring and alerts
5. Implement proper backup strategies

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase project is properly configured
4. Check the database status indicator in the dashboard
