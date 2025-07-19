# ပကဖ-နည်းပညာ ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ် - Design Documentation

## Architecture Overview

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   Services      │
│   React App     │◄──►│   Backend       │◄──►│   & Storage     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
├─ Authentication     ├─ Firestore DB       ├─ Cloud Functions
├─ Personnel CRUD     ├─ Auth Service       ├─ Backup Service
├─ Reports & Export   ├─ Security Rules     ├─ Audit Logging
├─ Settings Mgmt     ├─ Offline Support    └─ Monitoring
└─ Audit Logging     └─ Real-time Sync
```

### Component Hierarchy

```
App
├── AuthProvider
├── BrowserRouter
├── TooltipProvider
└── QueryClientProvider
    ├── Login (Public Route)
    ├── Dashboard (Protected Route)
    │   ├── Header
    │   ├── StatsCards
    │   ├── SearchBar
    │   ├── PersonnelTable
    │   └── ActionButtons
    ├── PersonnelForm (Protected Route)
    │   ├── Header
    │   ├── FormFields
    │   ├── ValidationErrors
    │   └── SubmitActions
    ├── Reports (Protected Route)
    │   ├── Header
    │   ├── SummaryStats
    │   ├── Charts
    │   └── ExportButtons
    ├── Settings (Admin Only)
    │   ├── RankManagement
    │   └── OrganizationManagement
    └── NotFound
```

## Data Models

### Personnel Model

```typescript
interface Personnel {
  id: string; // Pxxxxx format
  name: string; // မြန်မာယူနီကုဒ် support
  rank: string; // ရာထူး
  dateOfJoining: string; // ISO date string
  dateOfLeaving?: string; // Optional
  assignedDuties: string; // Encrypted field
  status: PersonnelStatus; // active | resigned | deceased
  organization: string; // အဖွဲ့အစည်း
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID
  updatedBy: string; // User ID
}
```

### User Model

```typescript
interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  isAuthenticated: boolean;
  role: UserRole; // admin | user
  customClaims?: Record<string, any>;
}
```

### Audit Model

```typescript
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction; // create | update | delete | login | logout
  resourceType: string; // personnel | rank | organization
  resourceId: string;
  oldData?: any;
  newData?: any;
  timestamp: string;
  ipAddress?: string;
}
```

## Security Design

### Authentication Flow

```
1. User visits app
2. Check localStorage for saved auth state
3. If authenticated, verify with Firebase
4. If not authenticated, redirect to Login
5. Login with email/password
6. Firebase returns user + custom claims
7. Store auth state in context
8. Redirect to Dashboard
```

### Data Encryption

```
1. Sensitive fields identified: [id, assignedDuties]
2. Before saving to Firestore:
   - Generate salt + IV
   - Derive key using PBKDF2
   - Encrypt using AES-256-GCM
   - Store encrypted data
3. When retrieving data:
   - Decrypt sensitive fields
   - Display in UI
```

### Role-Based Access Control

```typescript
// Route Protection
function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <AccessDenied />;

  return children;
}

// Component Access Control
function AdminOnlyComponent() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Settings /> : null;
}
```

## User Interface Design

### Color Palette

```css
:root {
  /* Myanmar National Colors */
  --myanmar-red: #dc2626; /* Primary red */
  --myanmar-red-dark: #b91c1c; /* Darker red for hover */
  --myanmar-black: #000000; /* Text and accents */
  --myanmar-white: #ffffff; /* Backgrounds */
  --myanmar-gray-light: #f3f4f6; /* Light backgrounds */
  --myanmar-gray-dark: #1f2937; /* Secondary text */
}
```

### Typography

- **Primary Font**: System fonts with Myanmar Unicode support
- **Headings**: Bold, high contrast
- **Body Text**: Readable font sizes (14px minimum)
- **Form Labels**: Clear, descriptive in မြန်မာစာ

### Component Design System

#### Buttons

```typescript
// Primary Button (Myanmar Red)
<Button className="bg-myanmar-red hover:bg-myanmar-red-dark text-white">
  {translations.actions.save}
</Button>

// Secondary Button (Outline)
<Button variant="outline" className="border-myanmar-red text-myanmar-red">
  {translations.actions.cancel}
</Button>
```

#### Form Fields

```typescript
// Standard Input with Myanmar support
<Input
  placeholder="အမည်ရေးထည့်ရန်"
  className="border-myanmar-red/30 focus:border-myanmar-red"
/>

// Validation Error Display
{errors.name && (
  <p className="text-sm text-red-500">{errors.name}</p>
)}
```

#### Cards and Layout

```typescript
// Standard Card Component
<Card className="border-myanmar-red/20">
  <CardHeader>
    <h3 className="text-lg font-semibold text-myanmar-black">
      {translations.personnel.personnelRecords}
    </h3>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

## State Management

### Context Structure

```typescript
interface AppState {
  user: AuthUser | null;
  personnel: Personnel[];
  ranks: Rank[];
  organizations: Organization[];
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
}

// Actions
type AppAction =
  | { type: "LOGIN"; payload: AuthUser }
  | { type: "LOGOUT" }
  | { type: "SET_PERSONNEL"; payload: Personnel[] }
  | { type: "ADD_PERSONNEL"; payload: Personnel }
  | { type: "UPDATE_PERSONNEL"; payload: Personnel }
  | { type: "DELETE_PERSONNEL"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
```

### Data Flow

```
1. Component dispatches action
2. Reducer updates state
3. UI re-renders with new state
4. Side effects (API calls) triggered
5. Results update state again
6. Audit log created
7. Offline backup saved
```

## Database Design

### Firestore Collections

```
/personnel/{documentId}
  - id: string
  - name: string (encrypted)
  - rank: string
  - dateOfJoining: timestamp
  - dateOfLeaving: timestamp?
  - assignedDuties: string (encrypted)
  - status: string
  - organization: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - createdBy: string
  - updatedBy: string

/auditLogs/{documentId}
  - userId: string
  - userName: string
  - action: string
  - resourceType: string
  - resourceId: string
  - oldData: object?
  - newData: object?
  - timestamp: timestamp
  - ipAddress: string?

/settings/app
  - ranks: Rank[]
  - organizations: Organization[]
  - lastUpdated: timestamp
  - updatedBy: string

/users/{userId}
  - email: string
  - displayName: string
  - role: string
  - lastLogin: timestamp
  - createdAt: timestamp
```

### Indexes

```javascript
// Composite Indexes for Efficient Queries
{
  collectionGroup: "personnel",
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

{
  collectionGroup: "personnel",
  fields: [
    { fieldPath: "rank", order: "ASCENDING" },
    { fieldPath: "organization", order: "ASCENDING" }
  ]
}

{
  collectionGroup: "auditLogs",
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "timestamp", order: "DESCENDING" }
  ]
}
```

## Performance Optimization

### Data Loading Strategy

```typescript
// Pagination Implementation
const ITEMS_PER_PAGE = 100;

async function loadPersonnel(lastDoc?: DocumentSnapshot) {
  const query = collection(db, "personnel")
    .orderBy("createdAt", "desc")
    .limit(ITEMS_PER_PAGE);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await getDocs(query);
  return {
    data: snapshot.docs.map((doc) => doc.data()),
    lastDoc: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === ITEMS_PER_PAGE,
  };
}
```

### Caching Strategy

```typescript
// Local Storage Caching
const CACHE_KEYS = {
  PERSONNEL: "pdf-personnel",
  RANKS: "pdf-ranks",
  ORGANIZATIONS: "pdf-organizations",
  USER: "pdf-user",
};

function cacheData(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Cache storage failed:", error);
  }
}

function getCachedData(key: string) {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn("Cache retrieval failed:", error);
    return null;
  }
}
```

### Image and Asset Optimization

```typescript
// Logo optimization
const LOGO_SIZES = {
  small: "24x24", // Navigation
  medium: "48x48", // Cards
  large: "96x96", // Headers
  hero: "192x192", // Login page
};

// Lazy loading for tables
const PersonnelTable = React.lazy(() => import("./PersonnelTable"));
```

## Error Handling

### Error Boundary Strategy

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to audit service
    AuditService.logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Network Error Handling

```typescript
async function handleNetworkRequest<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error.code === "permission-denied") {
      throw new Error(translations.errors.accessDenied);
    } else if (error.code === "unavailable") {
      throw new Error(translations.errors.networkUnavailable);
    } else {
      throw new Error(translations.errors.unknownError);
    }
  }
}
```

## Internationalization (i18n)

### Translation Structure

```typescript
const translations = {
  // Authentication
  auth: {
    login: "ဝင်ရောက်ရန်",
    logout: "ထွက်ရန်",
    username: "အသုံးပြုသူအမည်",
    password: "စကားဝှက်",
  },

  // Personnel Management
  personnel: {
    id: "ဝန်ထမ်းကုဒ်",
    name: "အမည်အပြည့်အစုံ",
    rank: "ရာထူး/ရာထားး",
  },

  // Actions
  actions: {
    add: "ထည့်ရန်",
    edit: "ပြင်ရန်",
    delete: "ဖျက်ရန်",
    save: "သိမ်းရန်",
  },
};
```

### Font Support

```css
@font-face {
  font-family: "Myanmar";
  src: url("./fonts/NotoSansMyanmar-Regular.woff2") format("woff2");
  unicode-range: U+1000-109F; /* Myanmar Unicode range */
}

body {
  font-family: "Myanmar", system-ui, sans-serif;
}
```

## Testing Strategy

### Unit Testing

```typescript
// Component Testing with React Testing Library
describe('PersonnelForm', () => {
  test('validates required fields', async () => {
    render(<PersonnelForm />);

    const submitButton = screen.getByRole('button', { name: /သိမ်းရန်/ });
    fireEvent.click(submitButton);

    expect(screen.getByText(/ထည့်စရန် လိုအပ်သည်/)).toBeInTheDocument();
  });

  test('encrypts sensitive data before submission', async () => {
    const mockSubmit = jest.fn();
    render(<PersonnelForm onSubmit={mockSubmit} />);

    // Fill form and submit
    // Verify encrypted data in submission
  });
});
```

### Integration Testing

```typescript
// Firebase Integration Tests
describe("PersonnelService", () => {
  test("adds personnel with encryption", async () => {
    const testPersonnel = {
      id: "P12345",
      name: "Test User",
      duties: "Secret duties",
    };

    const docId = await PersonnelService.addPersonnel(testPersonnel);
    const retrieved = await PersonnelService.getPersonnelById(docId);

    expect(retrieved.duties).toBe("Secret duties"); // Decrypted
  });
});
```

## Deployment Architecture

### Build Process

```bash
# Production Build
npm run build:client     # Vite build for frontend
npm run build:server     # Server bundle (if needed)
npm run typecheck        # Type validation
npm run test            # Run all tests
```

### Environment Configuration

```typescript
// Environment Variables
interface Config {
  REACT_APP_FIREBASE_API_KEY: string;
  REACT_APP_FIREBASE_AUTH_DOMAIN: string;
  REACT_APP_FIREBASE_PROJECT_ID: string;
  REACT_APP_ENCRYPTION_KEY: string;
  REACT_APP_ENVIRONMENT: "development" | "production";
}
```

### Deployment Pipeline

```yaml
# Firebase Deployment
1. Code pushed to main branch
2. GitHub Actions triggered
3. Run tests and type checking
4. Build production bundle
5. Deploy to Firebase Hosting
6. Update Firestore security rules
7. Verify deployment health
```

## Monitoring and Analytics

### Performance Monitoring

```typescript
// Web Vitals Tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric: any) {
  // Send to monitoring service
  console.log("Performance metric:", metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Error Tracking

```typescript
// Global Error Handler
window.addEventListener("error", (event) => {
  AuditService.logError({
    message: event.error.message,
    stack: event.error.stack,
    filename: event.filename,
    lineno: event.lineno,
    timestamp: new Date().toISOString(),
  });
});
```

## Security Considerations

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' *.googleapis.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  font-src 'self' *.gstatic.com;
  connect-src 'self' *.googleapis.com *.firebaseapp.com;
  img-src 'self' data: *.googleapis.com;
"
/>
```

### Input Sanitization

```typescript
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");
}
```

This design documentation provides a comprehensive overview of the system architecture, implementation details, and best practices for the PDF Personnel Management System.
