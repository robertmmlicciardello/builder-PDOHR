import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updatePassword,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  isAuthenticated: boolean;
  role: "admin" | "user";
  customClaims?: any;
  lastLogin?: string;
  loginAttempts?: number;
  accountLocked?: boolean;
  mustChangePassword?: boolean;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecuritySettings {
  maxLoginAttempts: number;
  lockoutDuration: number; // in minutes
  passwordMinLength: number;
  requireSpecialChars: boolean;
  sessionTimeout: number; // in minutes
  requirePasswordChange: boolean;
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  passwordMinLength: 8,
  requireSpecialChars: true,
  sessionTimeout: 60,
  requirePasswordChange: false,
};

export class EnhancedAuthService {
  private static loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private static sessionTimer: NodeJS.Timeout | null = null;

  /**
   * Enhanced sign-in with security features
   */
  static async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      // Check if account is locked
      const isLocked = await this.isAccountLocked(email);
      if (isLocked) {
        throw new Error(
          "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
        );
      }

      // Validate input
      if (!this.validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      // Attempt authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Log successful login attempt
      await this.logLoginAttempt(email, true);

      // Get user profile and custom claims
      const userProfile = await this.getUserProfile(user.uid);
      const idTokenResult = await user.getIdTokenResult();
      const role = (idTokenResult.claims.role as "admin" | "user") || "user";

      // Update last login timestamp
      await this.updateLastLogin(user.uid);

      // Start session timeout
      this.startSessionTimeout();

      const authUser: AuthUser = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || userProfile?.displayName || undefined,
        isAuthenticated: true,
        role,
        customClaims: idTokenResult.claims,
        lastLogin: new Date().toISOString(),
        loginAttempts: 0,
        accountLocked: false,
        mustChangePassword: userProfile?.mustChangePassword || false,
      };

      // Clear failed login attempts on successful login
      this.loginAttempts.delete(email);

      return authUser;
    } catch (error: any) {
      // Log failed login attempt
      await this.logLoginAttempt(email, false);

      // Check if account should be locked
      await this.checkAndLockAccount(email);

      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Enhanced sign-out with cleanup
   */
  static async signOut(): Promise<void> {
    try {
      // Clear session timer
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = null;
      }

      await signOut(auth);
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }

  /**
   * Password change with validation
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error("No authenticated user found");
      }

      // Validate new password
      if (!this.validatePassword(newPassword)) {
        throw new Error("Password does not meet security requirements");
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Update user profile to mark password as changed
      await this.updateUserProfile(user.uid, {
        mustChangePassword: false,
        passwordLastChanged: new Date().toISOString(),
      });

      // Log security event
      await this.logSecurityEvent(user.uid, "password_changed");
    } catch (error: any) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      if (!this.validateEmail(email)) {
        throw new Error("Invalid email format");
      }

      await sendPasswordResetEmail(auth, email);

      // Log security event
      await this.logSecurityEvent(null, "password_reset_requested", { email });
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    uid: string,
    updates: Partial<{
      displayName: string;
      mustChangePassword: boolean;
      passwordLastChanged: string;
      role: "admin" | "user";
    }>,
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth profile if displayName is being updated
      if (updates.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName,
        });
      }
    } catch (error: any) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Get user profile from Firestore
   */
  static async getUserProfile(uid: string): Promise<any> {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data();
      }

      return null;
    } catch (error: any) {
      console.error("Failed to get user profile:", error);
      return null;
    }
  }

  /**
   * Enhanced auth state observer
   */
  static onAuthStateChange(
    callback: (user: AuthUser | null) => void,
  ): () => void {
    return onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const userProfile = await this.getUserProfile(user.uid);
          const idTokenResult = await user.getIdTokenResult();
          const role =
            (idTokenResult.claims.role as "admin" | "user") || "user";

          const authUser: AuthUser = {
            uid: user.uid,
            email: user.email!,
            displayName:
              user.displayName || userProfile?.displayName || undefined,
            isAuthenticated: true,
            role,
            customClaims: idTokenResult.claims,
            lastLogin: userProfile?.lastLogin,
            loginAttempts: userProfile?.loginAttempts || 0,
            accountLocked: userProfile?.accountLocked || false,
            mustChangePassword: userProfile?.mustChangePassword || false,
          };

          // Start session timeout
          this.startSessionTimeout();

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

  /**
   * Validate email format
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private static validatePassword(password: string): boolean {
    const settings = DEFAULT_SECURITY_SETTINGS;

    if (password.length < settings.passwordMinLength) {
      return false;
    }

    if (settings.requireSpecialChars) {
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password,
      );
      const hasNumber = /\d/.test(password);
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);

      return hasSpecialChar && hasNumber && hasUpperCase && hasLowerCase;
    }

    return true;
  }

  /**
   * Check if account is locked
   */
  private static async isAccountLocked(email: string): Promise<boolean> {
    try {
      const attempts = this.loginAttempts.get(email) || [];
      const recentAttempts = attempts.filter(
        (attempt) =>
          Date.now() - attempt.timestamp <
          DEFAULT_SECURITY_SETTINGS.lockoutDuration * 60 * 1000,
      );

      const failedAttempts = recentAttempts.filter(
        (attempt) => !attempt.success,
      );
      return (
        failedAttempts.length >= DEFAULT_SECURITY_SETTINGS.maxLoginAttempts
      );
    } catch (error) {
      console.error("Error checking account lock status:", error);
      return false;
    }
  }

  /**
   * Log login attempt
   */
  private static async logLoginAttempt(
    email: string,
    success: boolean,
  ): Promise<void> {
    try {
      const attempt: LoginAttempt = {
        email,
        timestamp: Date.now(),
        success,
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
      };

      const attempts = this.loginAttempts.get(email) || [];
      attempts.push(attempt);

      // Keep only recent attempts (last 24 hours)
      const recentAttempts = attempts.filter(
        (a) => Date.now() - a.timestamp < 24 * 60 * 60 * 1000,
      );

      this.loginAttempts.set(email, recentAttempts);

      // Log to Firestore for audit trail
      await this.logSecurityEvent(null, "login_attempt", {
        email,
        success,
        timestamp: new Date().toISOString(),
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent,
      });
    } catch (error) {
      console.error("Failed to log login attempt:", error);
    }
  }

  /**
   * Check and lock account if necessary
   */
  private static async checkAndLockAccount(email: string): Promise<void> {
    const isLocked = await this.isAccountLocked(email);
    if (isLocked) {
      await this.logSecurityEvent(null, "account_locked", { email });
    }
  }

  /**
   * Update last login timestamp
   */
  private static async updateLastLogin(uid: string): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        loginAttempts: 0,
        accountLocked: false,
      });
    } catch (error) {
      console.error("Failed to update last login:", error);
    }
  }

  /**
   * Start session timeout
   */
  private static startSessionTimeout(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    this.sessionTimer = setTimeout(
      async () => {
        await this.signOut();
        // Optionally show a session timeout message
        console.warn("Session expired due to inactivity");
      },
      DEFAULT_SECURITY_SETTINGS.sessionTimeout * 60 * 1000,
    );
  }

  /**
   * Log security events
   */
  private static async logSecurityEvent(
    uid: string | null,
    eventType: string,
    details?: any,
  ): Promise<void> {
    try {
      const securityLogRef = doc(
        db,
        "securityLogs",
        `${Date.now()}-${Math.random()}`,
      );
      await setDoc(securityLogRef, {
        uid,
        eventType,
        details,
        timestamp: serverTimestamp(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  }

  /**
   * Get client IP address (simplified version)
   */
  private static async getClientIP(): Promise<string> {
    try {
      // In production, you would use a proper IP detection service
      return "unknown";
    } catch (error) {
      return "unknown";
    }
  }

  /**
   * Refresh session timeout
   */
  static refreshSession(): void {
    if (auth.currentUser) {
      this.startSessionTimeout();
    }
  }

  /**
   * Check if user has permission
   */
  static hasPermission(user: AuthUser | null, permission: string): boolean {
    if (!user || !user.isAuthenticated) {
      return false;
    }

    // Admin has all permissions
    if (user.role === "admin") {
      return true;
    }

    // Define permission matrix
    const userPermissions = [
      "read_own_data",
      "update_own_profile",
      "view_meetings",
      "join_meetings",
    ];

    const adminPermissions = [
      ...userPermissions,
      "manage_personnel",
      "manage_finances",
      "manage_meetings",
      "manage_settings",
      "view_reports",
      "manage_users",
    ];

    const allowedPermissions =
      user.role === "admin" ? adminPermissions : userPermissions;
    return allowedPermissions.includes(permission);
  }
}

export default EnhancedAuthService;
