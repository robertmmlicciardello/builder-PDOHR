import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  enableNetwork,
  disableNetwork,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import {
  Personnel,
  AuthUser,
  AuditLog,
  AppSettings,
  PersonnelFilters,
  PAGINATION_CONFIG,
} from "@shared/personnel";

// Firebase configuration - This should be loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (err.code === "failed-precondition") {
    console.warn(
      "Multiple tabs open, persistence can only be enabled in one tab at a time.",
    );
  } else if (err.code === "unimplemented") {
    console.warn("The current browser does not support offline persistence");
  }
}

// Collection references
export const personnelCollection = collection(db, "personnel");
export const auditLogsCollection = collection(db, "auditLogs");
export const settingsCollection = collection(db, "settings");

// Authentication services
export class AuthService {
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Get custom claims for role
      const idTokenResult = await user.getIdTokenResult();
      const role = (idTokenResult.claims.role as "admin" | "user") || "user";

      return {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        isAuthenticated: true,
        role,
        customClaims: idTokenResult.claims,
      };
    } catch (error: any) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  static onAuthStateChange(
    callback: (user: AuthUser | null) => void,
  ): () => void {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          const role =
            (idTokenResult.claims.role as "admin" | "user") || "user";

          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email!,
            displayName: user.displayName || undefined,
            isAuthenticated: true,
            role,
            customClaims: idTokenResult.claims,
          };
          callback(authUser);
        } catch (error) {
          console.error("Error getting user claims:", error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

// Personnel services
export interface PaginatedResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  total: number;
}

export class PersonnelService {
  static async getPersonnel(
    filters?: PersonnelFilters,
    lastDoc?: DocumentSnapshot,
    pageSize: number = PAGINATION_CONFIG.defaultPageSize,
  ): Promise<PaginatedResult<Personnel>> {
    try {
      let q = query(personnelCollection, orderBy("createdAt", "desc"));

      // Apply filters
      if (filters?.status) {
        q = query(q, where("status", "==", filters.status));
      }
      if (filters?.rank) {
        q = query(q, where("rank", "==", filters.rank));
      }
      if (filters?.organization) {
        q = query(q, where("organization", "==", filters.organization));
      }

      // Add pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(pageSize));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Personnel,
      );

      // Filter by search term if provided (client-side for complex text search)
      let filteredData = data;
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = data.filter(
          (person) =>
            person.id.toLowerCase().includes(searchTerm) ||
            person.name.toLowerCase().includes(searchTerm) ||
            person.rank.toLowerCase().includes(searchTerm),
        );
      }

      return {
        data: filteredData,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize,
        total: filteredData.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch personnel: ${error.message}`);
    }
  }

  static async getPersonnelById(id: string): Promise<Personnel | null> {
    try {
      const docRef = doc(personnelCollection, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Personnel;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch personnel: ${error.message}`);
    }
  }

  static async addPersonnel(personnel: Omit<Personnel, "id">): Promise<string> {
    try {
      const sanitizedPersonnel = sanitizeForFirestore(personnel);
      const docRef = await addDoc(personnelCollection, sanitizedPersonnel);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add personnel: ${error.message}`);
    }
  }

  static async updatePersonnel(
    id: string,
    personnel: Partial<Personnel>,
  ): Promise<void> {
    try {
      const docRef = doc(personnelCollection, id);
      const sanitizedPersonnel = sanitizeForFirestore(personnel);
      await updateDoc(docRef, sanitizedPersonnel);
    } catch (error: any) {
      throw new Error(`Failed to update personnel: ${error.message}`);
    }
  }

  static async deletePersonnel(id: string): Promise<void> {
    try {
      const docRef = doc(personnelCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete personnel: ${error.message}`);
    }
  }

  static async checkIdExists(personnelId: string): Promise<boolean> {
    try {
      const q = query(personnelCollection, where("id", "==", personnelId));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error: any) {
      throw new Error(`Failed to check ID: ${error.message}`);
    }
  }
}

// Helper function to sanitize data for Firestore (remove undefined values)
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized;
  }

  return obj;
}

// Audit logging service
export class AuditService {
  static async logAction(auditLog: Omit<AuditLog, "id">): Promise<void> {
    try {
      // Sanitize the audit log data to remove undefined values
      const sanitizedAuditLog = sanitizeForFirestore(auditLog);
      await addDoc(auditLogsCollection, sanitizedAuditLog);
    } catch (error: any) {
      console.error("Failed to log audit action:", error);
      // Don't throw error for audit logging to avoid blocking main operations
    }
  }

  static async getAuditLogs(
    limitCount: number = 100,
    lastDoc?: DocumentSnapshot,
  ): Promise<PaginatedResult<AuditLog>> {
    try {
      let q = query(auditLogsCollection, orderBy("timestamp", "desc"));

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as AuditLog,
      );

      return {
        data,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === limitCount,
        total: data.length,
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }
  }
}

// Settings service
export class SettingsService {
  static async getSettings(): Promise<AppSettings | null> {
    try {
      const docRef = doc(settingsCollection, "app");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }
  }

  static async updateSettings(settings: AppSettings): Promise<void> {
    try {
      const docRef = doc(settingsCollection, "app");
      await updateDoc(docRef, { ...settings });
    } catch (error: any) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }
  }
}

// Network status monitoring
export class NetworkService {
  static async enableOfflineMode(): Promise<void> {
    try {
      await disableNetwork(db);
    } catch (error: any) {
      console.error("Failed to enable offline mode:", error);
    }
  }

  static async enableOnlineMode(): Promise<void> {
    try {
      await enableNetwork(db);
    } catch (error: any) {
      console.error("Failed to enable online mode:", error);
    }
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }
}
