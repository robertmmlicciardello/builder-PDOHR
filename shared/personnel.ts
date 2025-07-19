export interface Personnel {
  id: string; // Format: Pxxxxx (e.g., P14034)
  name: string;
  rank: string;
  dateOfJoining: string; // ISO date string
  dateOfLeaving?: string; // ISO date string, optional
  assignedDuties: string; // Encrypted field
  status: PersonnelStatus;
  organization: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // User ID who created the record
  updatedBy: string; // User ID who last updated the record
}

export interface PersonnelFormData {
  id: string;
  name: string;
  rank: string;
  dateOfJoining: string;
  dateOfLeaving?: string;
  assignedDuties: string;
  status: PersonnelStatus;
  organization: string;
}

export interface PersonnelFilters {
  search?: string; // Search by ID, name, or rank
  rank?: string;
  status?: PersonnelStatus;
  organization?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PersonnelReport {
  totalMembers: number;
  activeMembers: number;
  resignedMembers: number;
  deceasedMembers: number;
  newEntries: number;
  resignations: number;
  byRank: Record<string, number>;
  byOrganization: Record<string, number>;
  dateGenerated: string;
  filteredBy?: PersonnelFilters;
}

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  isAuthenticated: boolean;
  role: UserRole;
  customClaims?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resourceType: "personnel" | "rank" | "organization" | "settings";
  resourceId: string;
  oldData?: any;
  newData?: any;
  timestamp: string;
  ipAddress?: string;
}

export interface AppSettings {
  ranks: Rank[];
  organizations: Organization[];
  lastUpdated: string;
  updatedBy: string;
}

export interface Rank {
  id: string;
  name: string; // Burmese name
  order: number; // For sorting hierarchy
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string; // Burmese name
  type: OrganizationType;
  parentId?: string; // For hierarchical organizations
  createdAt: string;
  updatedAt: string;
}

export type PersonnelStatus = "active" | "resigned" | "deceased";

export type UserRole = "admin" | "user";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "import"
  | "settings_change";

export type OrganizationType =
  | "headquarters"
  | "region"
  | "township"
  | "ward"
  | "village";

// Default ranks in Burmese
export const DEFAULT_RANKS: Omit<Rank, "id" | "createdAt" | "updatedAt">[] = [
  { name: "တပ်သား", order: 1 },
  { name: "တပ်ကြပ်", order: 2 },
  { name: "တပ်ကြပ်ကြီး", order: 3 },
  { name: "ဒုတပ်မှူး", order: 4 },
  { name: "တပ်မှူး", order: 5 },
  { name: "ဗိုလ်မှူးကြီး", order: 6 },
  { name: "ဗိုလ်မှူးချုပ်", order: 7 },
  { name: "ဗိုလ်ချုပ်", order: 8 },
  { name: "အရာရှိ", order: 9 },
  { name: "တာဝန်ခံ", order: 10 },
];

// Default organizations in Burmese
export const DEFAULT_ORGANIZATIONS: Omit<
  Organization,
  "id" | "createdAt" | "updatedAt"
>[] = [
  { name: "ပကဖ နည်းပညာလက်ရုံးတပ်", type: "headquarters" },
  { name: "ရန်ကုန်တိုင်း", type: "region" },
  { name: "မန္တလေးတိုင်း", type: "region" },
  { name: "စစ်ကိုင်းတိုင်း", type: "region" },
  { name: "ရှမ်းပြည်နယ်", type: "region" },
  { name: "ကရင်ပြည်နယ်", type: "region" },
  { name: "မွန်ပြည်နယ်", type: "region" },
  { name: "ကယားပြည်နယ်", type: "region" },
];

// Personnel ID validation
export const PERSONNEL_ID_REGEX = /^P\d{5}$/;

// Validation functions
export const validatePersonnelId = (id: string): boolean => {
  return PERSONNEL_ID_REGEX.test(id);
};

export const generatePersonnelId = (existingIds: string[]): string => {
  const numbers = existingIds
    .filter((id) => PERSONNEL_ID_REGEX.test(id))
    .map((id) => parseInt(id.substring(1)))
    .filter((num) => !isNaN(num));

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return `P${nextNumber.toString().padStart(5, "0")}`;
};

// Status helpers
export const getStatusInBurmese = (status: PersonnelStatus): string => {
  const statusMap = {
    active: "ဆက်ရှိနေသူ",
    resigned: "နှုတ်ထွက်သူ",
    deceased: "ကျဆုံးသူ",
  };
  return statusMap[status];
};

// Date formatting for Burmese locale
export const formatDateInBurmese = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("my-MM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Encryption configuration
export const ENCRYPTION_CONFIG = {
  algorithm: "AES",
  mode: "GCM",
  keySize: 256,
  ivSize: 12,
  saltSize: 16,
};

// Firebase configuration interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Pagination configuration
export const PAGINATION_CONFIG = {
  defaultPageSize: 100,
  maxPageSize: 500,
  prefetchPages: 2,
};

// Performance monitoring
export interface PerformanceMetrics {
  loadTime: number;
  recordCount: number;
  filterTime: number;
  exportTime: number;
  timestamp: string;
}
