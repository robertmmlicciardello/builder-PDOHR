import { useState, useEffect, useCallback, useRef } from 'react';
import { SecurityUtils, RateLimiter, SessionManager, SecurityLogger, SECURITY_CONFIG } from '../lib/security';

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccountLockInfo {
  email: string;
  lockedAt: number;
  attempts: number;
  unlockAt: number;
}

export interface SecurityState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  isAccountLocked: boolean;
  lockoutTimeRemaining: number;
  rateLimitRemaining: number;
  sessionExpiresAt: number | null;
  requiresPasswordChange: boolean;
  lastLoginAttempt: number | null;
  securityLevel: 'low' | 'medium' | 'high';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  captcha?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useSecureAuth = () => {
  const [state, setState] = useState<SecurityState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    loginAttempts: 0,
    isAccountLocked: false,
    lockoutTimeRemaining: 0,
    rateLimitRemaining: SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    sessionExpiresAt: null,
    requiresPasswordChange: false,
    lastLoginAttempt: null,
    securityLevel: 'medium',
  });

  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const lockoutTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize security monitoring
  useEffect(() => {
    loadStoredSecurityData();
    startSessionMonitoring();
    startHeartbeat();
    
    return () => {
      stopSessionMonitoring();
      stopHeartbeat();
      clearLockoutTimer();
    };
  }, []);

  // Load stored security data
  const loadStoredSecurityData = useCallback(() => {
    try {
      const storedAttempts = localStorage.getItem('login-attempts');
      const storedLockout = localStorage.getItem('account-lockout');
      const storedSession = localStorage.getItem('secure-session');
      
      if (storedAttempts) {
        const attempts = JSON.parse(storedAttempts);
        setState(prev => ({ ...prev, loginAttempts: attempts.count || 0 }));
      }
      
      if (storedLockout) {
        const lockout: AccountLockInfo = JSON.parse(storedLockout);
        const now = Date.now();
        
        if (lockout.unlockAt > now) {
          setState(prev => ({
            ...prev,
            isAccountLocked: true,
            lockoutTimeRemaining: lockout.unlockAt - now
          }));
          startLockoutTimer(lockout.unlockAt - now);
        }
      }
      
      if (storedSession) {
        const session = JSON.parse(storedSession);
        if (session.expiresAt > Date.now()) {
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: session.user,
            sessionExpiresAt: session.expiresAt,
            requiresPasswordChange: session.requiresPasswordChange || false
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  }, []);

  // Enhanced login with security features
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    const { email, password, rememberMe = false } = credentials;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Rate limiting check
      const clientId = await getClientFingerprint();
      if (!RateLimiter.isAllowed(clientId, 10)) { // 10 login attempts per window
        const remaining = RateLimiter.getRemainingRequests(clientId, 10);
        setState(prev => ({ 
          ...prev, 
          error: `Too many login attempts. ${remaining} attempts remaining.`,
          rateLimitRemaining: remaining,
          isLoading: false 
        }));
        
        SecurityLogger.logEvent({
          type: 'login_attempt',
          email,
          details: { reason: 'rate_limited', clientId },
          severity: 'medium'
        });
        
        return false;
      }

      // Input validation
      const emailValidation = SecurityUtils.validateInput(email, 'email');

      if (!emailValidation.isValid) {
        setState(prev => ({
          ...prev,
          error: emailValidation.errors.join(', '),
          isLoading: false
        }));
        return false;
      }

      // Basic password validation for login (not creation)
      if (!password || password.length < 6) {
        setState(prev => ({
          ...prev,
          error: 'Password must be at least 6 characters',
          isLoading: false
        }));
        return false;
      }

      // Check account lockout
      if (await isAccountLocked(email)) {
        const lockInfo = getLockoutInfo(email);
        setState(prev => ({
          ...prev,
          error: `Account is locked. Try again in ${Math.ceil(lockInfo.timeRemaining / 60000)} minutes.`,
          isAccountLocked: true,
          lockoutTimeRemaining: lockInfo.timeRemaining,
          isLoading: false
        }));
        return false;
      }

      // Simulate authentication (replace with real auth service)
      const authResult = await authenticateUser(emailValidation.sanitized, password);
      
      if (authResult.success) {
        // Clear failed attempts
        clearLoginAttempts(email);
        
        // Create secure session
        const sessionId = SecurityUtils.generateSessionId();
        const expiresAt = Date.now() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : SECURITY_CONFIG.SESSION_TIMEOUT);
        
        const sessionData = {
          sessionId,
          user: authResult.user,
          expiresAt,
          requiresPasswordChange: authResult.requiresPasswordChange || false,
          securityLevel: calculateSecurityLevel(authResult.user)
        };

        // Store session
        SessionManager.createSession(sessionId, sessionData);
        localStorage.setItem('secure-session', JSON.stringify(sessionData));

        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: authResult.user,
          sessionExpiresAt: expiresAt,
          requiresPasswordChange: authResult.requiresPasswordChange || false,
          securityLevel: sessionData.securityLevel,
          loginAttempts: 0,
          isLoading: false,
          error: null
        }));

        SecurityLogger.logEvent({
          type: 'login_success',
          userId: authResult.user.uid,
          email: authResult.user.email,
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent,
          details: { sessionId, rememberMe },
          severity: 'low'
        });

        return true;
      } else {
        // Handle failed login
        await handleFailedLogin(email);
        
        setState(prev => ({
          ...prev,
          error: 'Invalid credentials',
          isLoading: false,
          lastLoginAttempt: Date.now()
        }));

        SecurityLogger.logEvent({
          type: 'login_failure',
          email,
          ipAddress: await getClientIP(),
          userAgent: navigator.userAgent,
          details: { reason: authResult.reason },
          severity: 'medium'
        });

        return false;
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Login failed',
        isLoading: false
      }));

      SecurityLogger.logEvent({
        type: 'login_failure',
        email,
        details: { error: error.message },
        severity: 'high'
      });

      return false;
    }
  }, []);

  // Secure logout
  const logout = useCallback(async () => {
    try {
      const sessionData = localStorage.getItem('secure-session');
      let userId: string | undefined;
      
      if (sessionData) {
        const session = JSON.parse(sessionData);
        userId = session.user?.uid;
        SessionManager.destroySession(session.sessionId);
      }

      // Clear all stored data
      localStorage.removeItem('secure-session');
      localStorage.removeItem('auth-token');
      
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        sessionExpiresAt: null,
        requiresPasswordChange: false,
        securityLevel: 'medium'
      }));

      SecurityLogger.logEvent({
        type: 'logout',
        userId,
        severity: 'low'
      });

      stopSessionMonitoring();
      stopHeartbeat();
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Change password with security validation
  const changePassword = useCallback(async (request: PasswordChangeRequest): Promise<boolean> => {
    try {
      const { currentPassword, newPassword, confirmPassword } = request;

      // Validate inputs
      if (newPassword !== confirmPassword) {
        setState(prev => ({ ...prev, error: 'Passwords do not match' }));
        return false;
      }

      const passwordValidation = SecurityUtils.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        setState(prev => ({ 
          ...prev, 
          error: passwordValidation.errors.join(', ') 
        }));
        return false;
      }

      // Check if new password is different from current
      if (currentPassword === newPassword) {
        setState(prev => ({ 
          ...prev, 
          error: 'New password must be different from current password' 
        }));
        return false;
      }

      // Simulate password change (replace with real auth service)
      const result = await changeUserPassword(state.user?.uid, currentPassword, newPassword);
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          requiresPasswordChange: false,
          error: null
        }));

        SecurityLogger.logEvent({
          type: 'password_change',
          userId: state.user?.uid,
          severity: 'medium'
        });

        return true;
      } else {
        setState(prev => ({ ...prev, error: result.error }));
        return false;
      }
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      return false;
    }
  }, [state.user]);

  // Check session validity
  const checkSession = useCallback(() => {
    const sessionData = localStorage.getItem('secure-session');
    if (!sessionData) {
      logout();
      return;
    }

    try {
      const session = JSON.parse(sessionData);
      const now = Date.now();
      
      if (session.expiresAt <= now) {
        logout();
        SecurityLogger.logEvent({
          type: 'logout',
          userId: session.user?.uid,
          details: { reason: 'session_expired' },
          severity: 'low'
        });
      } else {
        // Update session activity
        session.lastActivity = now;
        localStorage.setItem('secure-session', JSON.stringify(session));
        SessionManager.updateSession(session.sessionId, { lastActivity: now });
      }
    } catch (error) {
      console.error('Session check error:', error);
      logout();
    }
  }, [logout]);

  // Start session monitoring
  const startSessionMonitoring = useCallback(() => {
    sessionCheckInterval.current = setInterval(checkSession, 60000); // Check every minute
  }, [checkSession]);

  // Stop session monitoring
  const stopSessionMonitoring = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
      sessionCheckInterval.current = null;
    }
  }, []);

  // Start heartbeat to track user activity
  const startHeartbeat = useCallback(() => {
    heartbeatInterval.current = setInterval(() => {
      if (state.isAuthenticated) {
        checkSession();
      }
    }, SECURITY_CONFIG.TOKEN_REFRESH_INTERVAL);
  }, [state.isAuthenticated, checkSession]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
      heartbeatInterval.current = null;
    }
  }, []);

  // Handle failed login attempts
  const handleFailedLogin = async (email: string) => {
    const attempts = getLoginAttempts(email) + 1;
    setLoginAttempts(email, attempts);
    
    setState(prev => ({ ...prev, loginAttempts: attempts }));

    if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      await lockAccount(email);
      
      SecurityLogger.logEvent({
        type: 'account_locked',
        email,
        details: { attempts },
        severity: 'high'
      });
    }
  };

  // Account lockout functions
  const lockAccount = async (email: string) => {
    const unlockAt = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
    const lockInfo: AccountLockInfo = {
      email,
      lockedAt: Date.now(),
      attempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      unlockAt
    };

    localStorage.setItem('account-lockout', JSON.stringify(lockInfo));
    
    setState(prev => ({
      ...prev,
      isAccountLocked: true,
      lockoutTimeRemaining: SECURITY_CONFIG.LOCKOUT_DURATION
    }));

    startLockoutTimer(SECURITY_CONFIG.LOCKOUT_DURATION);
  };

  const startLockoutTimer = (duration: number) => {
    clearLockoutTimer();
    
    lockoutTimer.current = setTimeout(() => {
      localStorage.removeItem('account-lockout');
      setState(prev => ({
        ...prev,
        isAccountLocked: false,
        lockoutTimeRemaining: 0,
        loginAttempts: 0
      }));
    }, duration);
  };

  const clearLockoutTimer = () => {
    if (lockoutTimer.current) {
      clearTimeout(lockoutTimer.current);
      lockoutTimer.current = null;
    }
  };

  // Helper functions
  const isAccountLocked = async (email: string): Promise<boolean> => {
    const lockout = localStorage.getItem('account-lockout');
    if (!lockout) return false;

    try {
      const lockInfo: AccountLockInfo = JSON.parse(lockout);
      return lockInfo.email === email && lockInfo.unlockAt > Date.now();
    } catch {
      return false;
    }
  };

  const getLockoutInfo = (email: string) => {
    const lockout = localStorage.getItem('account-lockout');
    if (!lockout) return { timeRemaining: 0, attempts: 0 };

    try {
      const lockInfo: AccountLockInfo = JSON.parse(lockout);
      if (lockInfo.email === email) {
        return {
          timeRemaining: Math.max(0, lockInfo.unlockAt - Date.now()),
          attempts: lockInfo.attempts
        };
      }
    } catch {}
    
    return { timeRemaining: 0, attempts: 0 };
  };

  const getLoginAttempts = (email: string): number => {
    try {
      const stored = localStorage.getItem(`login-attempts-${email}`);
      return stored ? parseInt(stored) : 0;
    } catch {
      return 0;
    }
  };

  const setLoginAttempts = (email: string, attempts: number) => {
    localStorage.setItem(`login-attempts-${email}`, attempts.toString());
  };

  const clearLoginAttempts = (email: string) => {
    localStorage.removeItem(`login-attempts-${email}`);
  };

  const calculateSecurityLevel = (user: any): 'low' | 'medium' | 'high' => {
    // Calculate based on user permissions, recent activity, etc.
    if (user.role === 'admin') return 'high';
    if (user.mustChangePassword) return 'low';
    return 'medium';
  };

  // Utility functions
  const getClientFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx!.textBaseline = 'top';
    ctx!.font = '14px Arial';
    ctx!.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    return SecurityUtils.encrypt(fingerprint);
  };

  const getClientIP = async (): Promise<string> => {
    // In production, use proper IP detection service
    return 'unknown';
  };

  // Mock authentication functions (replace with real implementation)
  const authenticateUser = async (email: string, password: string) => {
    // Mock users for demo - simple passwords for easy testing
    const users = {
      'admin@pdf.gov.mm': {
        password: 'admin123',
        uid: 'admin-001',
        role: 'admin',
        name: 'Administrator',
        requiresPasswordChange: false
      },
      'user@pdf.gov.mm': {
        password: 'user123',
        uid: 'user-001',
        role: 'user',
        name: 'Regular User',
        requiresPasswordChange: false
      }
    };

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Check new secure passwords first
    let user = users[email as keyof typeof users];

    // If not found or password doesn't match, check legacy passwords
    if (!user || user.password !== password) {
      const legacyPasswords = {
        'admin@pdf.gov.mm': ['pdf2024', 'PDF2024!'],
        'user@pdf.gov.mm': ['user2024', 'User2024!']
      };

      const possiblePasswords = legacyPasswords[email as keyof typeof legacyPasswords];
      if (possiblePasswords && possiblePasswords.includes(password)) {
        // Found with legacy password - return user with password change requirement
        user = users[email as keyof typeof users] || {
          uid: email === 'admin@pdf.gov.mm' ? 'admin-001' : 'user-001',
          password: password,
          role: email === 'admin@pdf.gov.mm' ? 'admin' : 'user',
          name: email === 'admin@pdf.gov.mm' ? 'Administrator' : 'Regular User',
          requiresPasswordChange: true
        };

        return {
          success: true,
          user: {
            uid: user.uid,
            email,
            name: user.name,
            role: user.role
          },
          requiresPasswordChange: true // Force password change for legacy passwords
        };
      }
    }

    if (user && user.password === password) {
      return {
        success: true,
        user: {
          uid: user.uid,
          email,
          name: user.name,
          role: user.role
        },
        requiresPasswordChange: user.requiresPasswordChange
      };
    }

    return { success: false, reason: 'invalid_credentials' };
  };

  const changeUserPassword = async (uid: string, currentPassword: string, newPassword: string) => {
    // Mock password change
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  };

  return {
    ...state,
    login,
    logout,
    changePassword,
    checkSession,
    refreshSession: checkSession,
    clearError: () => setState(prev => ({ ...prev, error: null })),
    getSecurityEvents: () => SecurityLogger.getEvents(),
    hasPermission: (permission: string) => {
      if (!state.user) return false;
      // Implement permission checking logic
      return state.user.role === 'admin' || ['read', 'view'].includes(permission);
    }
  };
};

export default useSecureAuth;
