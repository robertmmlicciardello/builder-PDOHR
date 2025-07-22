import CryptoJS from 'crypto-js';

// Security configuration
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
  TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || 'pdf-hr-system-2024-secure-key-32-chars',
  CSRF_TOKEN_LENGTH: 32,
  NONCE_LENGTH: 16,
} as const;

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE: /^(\+95|09)\d{7,11}$/,
  PERSONNEL_ID: /^P\d{5}$/,
  SAFE_STRING: /^[a-zA-Z0-9\s\u1000-\u109F._-]+$/,
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b|['";]|--|\*|\/\*|\*\/)/i,
  XSS_PATTERNS: /<script|javascript:|onload=|onerror=|onclick=|onmouseover=|<iframe|<object|<embed|<link|<meta/i,
} as const;

// Security utilities class
export class SecurityUtils {
  /**
   * Input sanitization and validation
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/&/g, '&amp;')
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email) {
      return { isValid: false, error: 'Email is required' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email is too long' };
    }

    if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      return { isValid: false, errors: ['Password is required'] };
    }

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (password.length > SECURITY_CONFIG.PASSWORD_MAX_LENGTH) {
      errors.push(`Password must not exceed ${SECURITY_CONFIG.PASSWORD_MAX_LENGTH} characters`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    // Check for common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Check for SQL injection patterns
   */
  static checkSQLInjection(input: string): boolean {
    return VALIDATION_PATTERNS.SQL_INJECTION.test(input);
  }

  /**
   * Check for XSS patterns
   */
  static checkXSS(input: string): boolean {
    return VALIDATION_PATTERNS.XSS_PATTERNS.test(input);
  }

  /**
   * Validate general input
   */
  static validateInput(input: string, type: 'email' | 'password' | 'text' | 'phone' | 'personnel_id' = 'text'): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = this.sanitizeInput(input);

    // Check for malicious patterns
    if (this.checkSQLInjection(input)) {
      errors.push('Input contains potentially malicious content');
    }

    if (this.checkXSS(input)) {
      errors.push('Input contains potentially malicious scripts');
    }

    // Type-specific validation
    switch (type) {
      case 'email':
        const emailValidation = this.validateEmail(sanitized);
        if (!emailValidation.isValid) {
          errors.push(emailValidation.error!);
        }
        break;

      case 'password':
        const passwordValidation = this.validatePassword(input); // Don't sanitize passwords
        sanitized = input; // Keep original password
        errors.push(...passwordValidation.errors);
        break;

      case 'phone':
        if (!VALIDATION_PATTERNS.PHONE.test(sanitized)) {
          errors.push('Invalid phone number format');
        }
        break;

      case 'personnel_id':
        if (!VALIDATION_PATTERNS.PERSONNEL_ID.test(sanitized)) {
          errors.push('Personnel ID must be in format P00000');
        }
        break;

      case 'text':
        if (sanitized.length > 1000) {
          errors.push('Text is too long');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  /**
   * Encrypt sensitive data
   */
  static encrypt(text: string): string {
    try {
      return CryptoJS.AES.encrypt(text, SECURITY_CONFIG.ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return '';
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, SECURITY_CONFIG.ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return CryptoJS.lib.WordArray.random(SECURITY_CONFIG.CSRF_TOKEN_LENGTH).toString();
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Hash password (for client-side hashing before transmission)
   */
  static hashPassword(password: string, salt?: string): string {
    const useSalt = salt || CryptoJS.lib.WordArray.random(128/8).toString();
    return CryptoJS.PBKDF2(password, useSalt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
  }

  /**
   * Generate secure session ID
   */
  static generateSessionId(): string {
    const timestamp = Date.now().toString();
    const random = this.generateSecureRandom();
    return CryptoJS.SHA256(timestamp + random).toString();
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (file.size > maxSize) {
      errors.push('File size must not exceed 10MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not allowed');
    }

    // Check file name for malicious patterns
    if (/\.(exe|bat|cmd|scr|pif|com|jar|vbs|js|html|htm|php|asp|jsp)$/i.test(file.name)) {
      errors.push('File type potentially dangerous');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Content Security Policy
   */
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://firestore.googleapis.com https://firebase.googleapis.com",
      "frame-src 'self' https://firebase.googleapis.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "block-all-mixed-content",
      "upgrade-insecure-requests"
    ].join('; ');
  }
}

// Rate limiting for client-side
export class RateLimiter {
  private static requests: Map<string, number[]> = new Map();

  static isAllowed(identifier: string, maxRequests: number = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS): boolean {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    const userRequests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    
    return true;
  }

  static getRemainingRequests(identifier: string, maxRequests: number = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS): number {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, maxRequests - recentRequests.length);
  }

  static getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + SECURITY_CONFIG.RATE_LIMIT_WINDOW;
  }
}

// Session management
export class SessionManager {
  private static sessionData: Map<string, any> = new Map();
  private static sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();

  static createSession(sessionId: string, data: any): void {
    this.sessionData.set(sessionId, {
      ...data,
      createdAt: Date.now(),
      lastActivity: Date.now()
    });

    this.refreshSessionTimeout(sessionId);
  }

  static getSession(sessionId: string): any {
    const session = this.sessionData.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
      this.refreshSessionTimeout(sessionId);
    }
    return session;
  }

  static updateSession(sessionId: string, data: any): void {
    const existing = this.sessionData.get(sessionId);
    if (existing) {
      this.sessionData.set(sessionId, {
        ...existing,
        ...data,
        lastActivity: Date.now()
      });
      this.refreshSessionTimeout(sessionId);
    }
  }

  static destroySession(sessionId: string): void {
    this.sessionData.delete(sessionId);
    const timeout = this.sessionTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimeouts.delete(sessionId);
    }
  }

  private static refreshSessionTimeout(sessionId: string): void {
    const existing = this.sessionTimeouts.get(sessionId);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      this.destroySession(sessionId);
    }, SECURITY_CONFIG.SESSION_TIMEOUT);

    this.sessionTimeouts.set(sessionId, timeout);
  }

  static isSessionValid(sessionId: string): boolean {
    return this.sessionData.has(sessionId);
  }

  static getAllActiveSessions(): string[] {
    return Array.from(this.sessionData.keys());
  }
}

// Security event logging
export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'account_locked' | 
        'password_change' | 'permission_denied' | 'suspicious_activity' | 
        'file_upload' | 'data_access' | 'logout';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityLogger {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 10000;

  static logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(securityEvent);

    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('Security Event:', securityEvent);
    }

    // In production, send to monitoring service
    this.sendToMonitoringService(securityEvent);
  }

  static getEvents(filter?: Partial<SecurityEvent>): SecurityEvent[] {
    if (!filter) return [...this.events];

    return this.events.filter(event => {
      return Object.entries(filter).every(([key, value]) => {
        return event[key as keyof SecurityEvent] === value;
      });
    });
  }

  static getEventsByTimeRange(startTime: number, endTime: number): SecurityEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }

  private static sendToMonitoringService(event: SecurityEvent): void {
    // In production, send to external monitoring service
    // For now, store in localStorage for audit
    try {
      const stored = localStorage.getItem('security-events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      
      // Keep only last 1000 events in localStorage
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem('security-events', JSON.stringify(events));
    } catch (error) {
      console.error('Failed to store security event:', error);
    }
  }
}

export default SecurityUtils;
