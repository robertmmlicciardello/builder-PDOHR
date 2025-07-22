#!/bin/bash

# PDF HR Management System - Production Setup Script
echo "🚀 Setting up PDF HR Management System for Production"
echo "=================================================="

# Check if required tools are installed
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v firebase >/dev/null 2>&1 || { echo "❌ Firebase CLI is required. Installing..." >&2; npm install -g firebase-tools; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual Firebase configuration values"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install additional production dependencies
echo "��� Installing production-specific packages..."
npm install --save-dev @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier prettier vitest @testing-library/react @testing-library/jest-dom

# Install security and monitoring packages
npm install helmet crypto-js bcryptjs rate-limiter-flexible validator

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p src/tests/unit
mkdir -p src/tests/integration
mkdir -p src/tests/e2e
mkdir -p docs
mkdir -p logs
mkdir -p backups

# Initialize Firebase project (if not already done)
if [ ! -f firebase.json ]; then
    echo "🔥 Initializing Firebase project..."
    firebase init firestore storage functions
else
    echo "✅ Firebase project already initialized"
fi

# Copy security rules
echo "🔒 Setting up Firebase security rules..."
cp firestore.rules ./firestore.rules
cp storage.rules ./storage.rules

# Create TypeScript config for stricter type checking
echo "⚙️  Updating TypeScript configuration for production..."
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["src", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

# Create ESLint configuration
echo "🔧 Setting up ESLint configuration..."
cat > .eslintrc.js << EOF
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
}
EOF

# Create Prettier configuration
echo "💅 Setting up Prettier configuration..."
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Create basic test setup
echo "🧪 Setting up testing framework..."
cat > src/tests/setup.ts << EOF
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  AuthService: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  PersonnelService: {
    getPersonnel: jest.fn(),
    addPersonnel: jest.fn(),
    updatePersonnel: jest.fn(),
    deletePersonnel: jest.fn(),
  },
}));
EOF

# Update package.json scripts
echo "📝 Updating package.json scripts..."
npm pkg set scripts.lint="eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
npm pkg set scripts.lint:fix="eslint . --ext ts,tsx --fix"
npm pkg set scripts.format="prettier --write ."
npm pkg set scripts.format:check="prettier --check ."
npm pkg set scripts.test:unit="vitest run src/tests/unit"
npm pkg set scripts.test:integration="vitest run src/tests/integration"
npm pkg set scripts.test:watch="vitest"
npm pkg set scripts.test:coverage="vitest run --coverage"
npm pkg set scripts.security:audit="npm audit"
npm pkg set scripts.build:production="npm run lint && npm run test:unit && npm run build"

# Create GitHub Actions workflow
echo "🔄 Setting up CI/CD pipeline..."
mkdir -p .github/workflows
cat > .github/workflows/production.yml << EOF
name: Production CI/CD

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run typecheck
    
    - name: Run tests
      run: npm run test:unit
    
    - name: Security audit
      run: npm audit --audit-level moderate
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: npm run build:production
      env:
        VITE_FIREBASE_API_KEY: \${{ secrets.FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: \${{ secrets.FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: \${{ secrets.FIREBASE_PROJECT_ID }}
        VITE_FIREBASE_STORAGE_BUCKET: \${{ secrets.FIREBASE_STORAGE_BUCKET }}
        VITE_FIREBASE_MESSAGING_SENDER_ID: \${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
        VITE_FIREBASE_APP_ID: \${{ secrets.FIREBASE_APP_ID }}
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: \${{ secrets.GITHUB_TOKEN }}
        firebaseServiceAccount: \${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        projectId: \${{ secrets.FIREBASE_PROJECT_ID }}
        channelId: live
EOF

# Create security checklist
echo "🔒 Creating security checklist..."
cat > SECURITY_CHECKLIST.md << EOF
# Security Checklist for Production

## Pre-Deployment Security Checks

### Authentication & Authorization
- [ ] Firebase Authentication properly configured
- [ ] Custom claims for user roles implemented
- [ ] Password complexity requirements enforced
- [ ] Multi-factor authentication enabled
- [ ] Session timeout configured
- [ ] Account lockout after failed attempts

### Data Protection
- [ ] All sensitive data encrypted at rest
- [ ] Encryption in transit (HTTPS only)
- [ ] Input validation on all forms
- [ ] SQL injection protection implemented
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented

### Firebase Security
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] API keys restricted to specific domains
- [ ] Cloud Functions authentication enabled
- [ ] Database access logging enabled

### Network Security
- [ ] CORS properly configured
- [ ] Content Security Policy headers set
- [ ] HTTPS redirect enforced
- [ ] Security headers implemented
- [ ] Rate limiting enabled

### Monitoring & Logging
- [ ] Error tracking configured (Sentry)
- [ ] Security event logging enabled
- [ ] Failed login attempt monitoring
- [ ] Suspicious activity detection
- [ ] Regular security audit schedule

### Data Privacy
- [ ] Privacy policy implemented
- [ ] GDPR compliance measures
- [ ] Data retention policies
- [ ] User data deletion procedures
- [ ] Data anonymization for analytics

### Backup & Recovery
- [ ] Automated backup system
- [ ] Backup encryption
- [ ] Disaster recovery plan
- [ ] Data integrity checks
- [ ] Recovery testing completed
EOF

# Create deployment checklist
echo "📋 Creating deployment checklist..."
cat > DEPLOYMENT_CHECKLIST.md << EOF
# Production Deployment Checklist

## Pre-Deployment
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Firebase project setup complete
- [ ] Security rules deployed
- [ ] SSL certificate configured

## Deployment
- [ ] Backup current production data
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Deploy to production
- [ ] Verify deployment success
- [ ] Test critical user flows
- [ ] Monitor error rates

## Post-Deployment
- [ ] Monitor application performance
- [ ] Check error logs
- [ ] Verify all integrations working
- [ ] Test authentication flows
- [ ] Confirm data integrity
- [ ] Update documentation
- [ ] Notify stakeholders

## Rollback Plan
- [ ] Database rollback procedure
- [ ] Application rollback procedure
- [ ] Communication plan
- [ ] Incident response team contacts
EOF

echo ""
echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Firebase configuration"
echo "2. Run: firebase deploy --only firestore:rules,storage"
echo "3. Run: npm run test:unit"
echo "4. Run: npm run build:production"
echo "5. Review SECURITY_CHECKLIST.md"
echo "6. Review DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🔧 Development commands:"
echo "  npm run dev          - Start development server"
echo "  npm run lint         - Run linting"
echo "  npm run test:unit    - Run unit tests"
echo "  npm run build        - Build for production"
echo ""
echo "⚠️  IMPORTANT: Update .env with real Firebase values before deployment!"
