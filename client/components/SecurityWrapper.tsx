import React, { useEffect, useState, useCallback } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { SecurityUtils, SecurityLogger, SessionManager } from "../lib/security";
import { useSecureAuth } from "../hooks/useSecureAuth";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Clock,
  RefreshCw,
  LogOut,
  Settings,
} from "lucide-react";

interface SecurityWrapperProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  minSecurityLevel?: "low" | "medium" | "high";
  requiresPasswordChange?: boolean;
  allowedRoles?: ("admin" | "user")[];
}

interface SecurityCheck {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
}

export const SecurityWrapper: React.FC<SecurityWrapperProps> = ({
  children,
  requiredPermissions = [],
  minSecurityLevel = "medium",
  requiresPasswordChange = false,
  allowedRoles = ["admin", "user"],
}) => {
  const auth = useSecureAuth();
  const location = useLocation();
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [isPerformingChecks, setIsPerformingChecks] = useState(true);

  // Perform security checks on mount and route change
  useEffect(() => {
    performSecurityChecks();
  }, [location.pathname, auth.user]);

  // Monitor for security threats
  useEffect(() => {
    const interval = setInterval(() => {
      monitorSecurityThreats();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const performSecurityChecks = useCallback(async () => {
    setIsPerformingChecks(true);
    const checks: SecurityCheck[] = [];

    try {
      // 1. Authentication Check
      if (!auth.isAuthenticated) {
        checks.push({
          id: "auth",
          name: "Authentication",
          status: "fail",
          message: "User not authenticated",
          severity: "critical",
        });
      } else {
        checks.push({
          id: "auth",
          name: "Authentication",
          status: "pass",
          message: "User authenticated successfully",
          severity: "low",
        });
      }

      // 2. Session Validation
      const sessionValid = SessionManager.isSessionValid(auth.user?.sessionId);
      checks.push({
        id: "session",
        name: "Session Validity",
        status: sessionValid ? "pass" : "fail",
        message: sessionValid
          ? "Session is valid"
          : "Session expired or invalid",
        severity: sessionValid ? "low" : "high",
      });

      // 3. Role Authorization
      const hasValidRole = auth.user && allowedRoles.includes(auth.user.role);
      checks.push({
        id: "role",
        name: "Role Authorization",
        status: hasValidRole ? "pass" : "fail",
        message: hasValidRole
          ? `User has valid role: ${auth.user?.role}`
          : "User does not have required role",
        severity: hasValidRole ? "low" : "high",
      });

      // 4. Permission Check
      const hasPermissions = requiredPermissions.every((permission) =>
        auth.hasPermission(permission),
      );
      checks.push({
        id: "permissions",
        name: "Permissions",
        status: hasPermissions ? "pass" : "fail",
        message: hasPermissions
          ? "All required permissions granted"
          : `Missing permissions: ${requiredPermissions.join(", ")}`,
        severity: hasPermissions ? "low" : "medium",
      });

      // 5. Security Level Check
      const meetsSecurity =
        auth.securityLevel === "high" ||
        (minSecurityLevel === "medium" &&
          ["medium", "high"].includes(auth.securityLevel)) ||
        minSecurityLevel === "low";
      checks.push({
        id: "security_level",
        name: "Security Level",
        status: meetsSecurity ? "pass" : "warning",
        message: `Current: ${auth.securityLevel}, Required: ${minSecurityLevel}`,
        severity: meetsSecurity ? "low" : "medium",
      });

      // 6. Password Change Requirement
      if (requiresPasswordChange && auth.requiresPasswordChange) {
        checks.push({
          id: "password_change",
          name: "Password Change",
          status: "fail",
          message: "Password change required before accessing this resource",
          severity: "high",
        });
      } else {
        checks.push({
          id: "password_change",
          name: "Password Change",
          status: "pass",
          message: "Password requirements met",
          severity: "low",
        });
      }

      // 7. HTTPS Check
      const isHTTPS = window.location.protocol === "https:";
      checks.push({
        id: "https",
        name: "Secure Connection",
        status: isHTTPS ? "pass" : "warning",
        message: isHTTPS
          ? "Connection is encrypted"
          : "Connection is not encrypted",
        severity: isHTTPS ? "low" : "medium",
      });

      // 8. Browser Security
      const browserSecure = checkBrowserSecurity();
      checks.push({
        id: "browser",
        name: "Browser Security",
        status: browserSecure.secure ? "pass" : "warning",
        message: browserSecure.message,
        severity: browserSecure.secure ? "low" : "medium",
      });

      // 9. Rate Limiting Check
      const rateLimitOK = auth.rateLimitRemaining > 0;
      checks.push({
        id: "rate_limit",
        name: "Rate Limiting",
        status: rateLimitOK ? "pass" : "fail",
        message: `${auth.rateLimitRemaining} requests remaining`,
        severity: rateLimitOK ? "low" : "high",
      });

      // 10. Account Lock Check
      checks.push({
        id: "account_lock",
        name: "Account Status",
        status: auth.isAccountLocked ? "fail" : "pass",
        message: auth.isAccountLocked
          ? `Account locked for ${Math.ceil(auth.lockoutTimeRemaining / 60000)} minutes`
          : "Account is not locked",
        severity: auth.isAccountLocked ? "critical" : "low",
      });

      setSecurityChecks(checks);

      // Log security check results
      const failedChecks = checks.filter((check) => check.status === "fail");
      if (failedChecks.length > 0) {
        SecurityLogger.logEvent({
          type: "suspicious_activity",
          userId: auth.user?.uid,
          details: {
            location: location.pathname,
            failedChecks: failedChecks.map((c) => c.name),
            userAgent: navigator.userAgent,
          },
          severity: "high",
        });
      }
    } catch (error) {
      console.error("Security checks failed:", error);
      SecurityLogger.logEvent({
        type: "suspicious_activity",
        details: {
          error: (error as Error).message,
          location: location.pathname,
        },
        severity: "critical",
      });
    } finally {
      setIsPerformingChecks(false);
    }
  }, [
    auth,
    location.pathname,
    requiredPermissions,
    minSecurityLevel,
    allowedRoles,
    requiresPasswordChange,
  ]);

  const monitorSecurityThreats = useCallback(() => {
    // Check for suspicious activity patterns
    const suspiciousPatterns = [
      // Rapid page changes
      checkRapidNavigation(),
      // Multiple failed permission checks
      checkPermissionFailures(),
      // Unusual user agent
      checkUserAgent(),
      // Local storage tampering
      checkStorageTampering(),
    ];

    const threats = suspiciousPatterns.filter((pattern) => pattern.detected);

    if (threats.length > 0) {
      SecurityLogger.logEvent({
        type: "suspicious_activity",
        userId: auth.user?.uid,
        details: {
          threats: threats.map((t) => t.type),
          location: location.pathname,
        },
        severity: "high",
      });

      // Auto-logout on critical threats
      const criticalThreats = threats.filter((t) => t.severity === "critical");
      if (criticalThreats.length > 0) {
        auth.logout();
      }
    }
  }, [auth, location.pathname]);

  const checkBrowserSecurity = () => {
    const checks = {
      localStorage: typeof Storage !== "undefined",
      sessionStorage: typeof sessionStorage !== "undefined",
      crypto: typeof crypto !== "undefined",
      https: window.location.protocol === "https:",
    };

    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return {
      secure: passed >= total - 1, // Allow 1 failure
      message: `Browser security: ${passed}/${total} checks passed`,
    };
  };

  const checkRapidNavigation = () => {
    const navigationHistory = JSON.parse(
      sessionStorage.getItem("navigation-history") || "[]",
    );

    const now = Date.now();
    const recentNavigation = navigationHistory.filter(
      (time: number) => now - time < 10000,
    ); // Last 10 seconds

    // Update history
    navigationHistory.push(now);
    const trimmedHistory = navigationHistory.slice(-20); // Keep last 20
    sessionStorage.setItem(
      "navigation-history",
      JSON.stringify(trimmedHistory),
    );

    return {
      detected: recentNavigation.length > 10, // More than 10 navigations in 10 seconds
      type: "rapid_navigation",
      severity: "medium" as const,
    };
  };

  const checkPermissionFailures = () => {
    const failures = JSON.parse(
      sessionStorage.getItem("permission-failures") || "[]",
    );

    const now = Date.now();
    const recentFailures = failures.filter(
      (time: number) => now - time < 300000,
    ); // Last 5 minutes

    return {
      detected: recentFailures.length > 5,
      type: "permission_enumeration",
      severity: "high" as const,
    };
  };

  const checkUserAgent = () => {
    const knownBots = [
      "bot",
      "crawler",
      "spider",
      "scraper",
      "curl",
      "wget",
      "python",
    ];

    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = knownBots.some((bot) => userAgent.includes(bot));

    return {
      detected: isBot,
      type: "bot_detection",
      severity: "medium" as const,
    };
  };

  const checkStorageTampering = () => {
    try {
      const securityToken = localStorage.getItem("security-token");
      const expectedToken = SecurityUtils.generateSecureRandom(16);

      // First time setup
      if (!securityToken) {
        localStorage.setItem("security-token", expectedToken);
        return {
          detected: false,
          type: "storage_tampering",
          severity: "low" as const,
        };
      }

      // Check if token was modified
      const tokenAge =
        Date.now() - parseInt(localStorage.getItem("token-timestamp") || "0");
      if (tokenAge > 3600000) {
        // 1 hour
        localStorage.setItem("security-token", expectedToken);
        localStorage.setItem("token-timestamp", Date.now().toString());
      }

      return {
        detected: false,
        type: "storage_tampering",
        severity: "low" as const,
      };
    } catch (error) {
      return {
        detected: true,
        type: "storage_tampering",
        severity: "high" as const,
      };
    }
  };

  // Determine if access should be denied
  const shouldDenyAccess = () => {
    const criticalFailures = securityChecks.filter(
      (check) =>
        check.status === "fail" &&
        ["critical", "high"].includes(check.severity),
    );

    return criticalFailures.length > 0;
  };

  // Get security level color
  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Render loading state
  if (isPerformingChecks) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-myanmar-red" />
            <h3 className="text-lg font-semibold mb-2">Security Check</h3>
            <p className="text-gray-600">Verifying access permissions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render access denied
  if (shouldDenyAccess()) {
    const criticalFailures = securityChecks.filter(
      (check) =>
        check.status === "fail" &&
        ["critical", "high"].includes(check.severity),
    );

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                Your access has been denied due to security policy violations.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Security Issues:</h4>
              {criticalFailures.map((failure) => (
                <div
                  key={failure.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>
                    {failure.name}: {failure.message}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => auth.logout()}
                variant="outline"
                className="flex-1"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 bg-myanmar-red hover:bg-myanmar-red-dark"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render security warnings if any
  const warnings = securityChecks.filter((check) => check.status === "warning");

  return (
    <div className="relative">
      {/* Security Status Bar */}
      {(warnings.length > 0 || showSecurityPanel) && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-2">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">
                {warnings.length} security warning
                {warnings.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecurityPanel(!showSecurityPanel)}
              className="text-yellow-700 hover:text-yellow-800"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showSecurityPanel ? "Hide" : "View"} Details
            </Button>
          </div>
        </div>
      )}

      {/* Security Panel */}
      {showSecurityPanel && (
        <div className="bg-white border-b shadow-sm p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Security Status</h3>
              <div className="flex items-center space-x-2">
                <Badge className={getSecurityLevelColor(auth.securityLevel)}>
                  Security Level: {auth.securityLevel.toUpperCase()}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecurityPanel(false)}
                >
                  ×
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {securityChecks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3 rounded border text-sm ${
                    check.status === "pass"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : check.status === "warning"
                        ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                        : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{check.name}</span>
                    <div className="flex items-center">
                      {check.status === "pass" ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : check.status === "warning" ? (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-80">{check.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Security Floating Button */}
      <button
        onClick={() => setShowSecurityPanel(!showSecurityPanel)}
        className="fixed bottom-4 right-4 bg-myanmar-red text-white p-3 rounded-full shadow-lg hover:bg-myanmar-red-dark transition-colors z-50"
        title="Security Status"
      >
        <Shield className="w-5 h-5" />
        {warnings.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {warnings.length}
          </div>
        )}
      </button>
    </div>
  );
};

// Enhanced Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRole?: "admin" | "user";
  minSecurityLevel?: "low" | "medium" | "high";
  requiresPasswordChange?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requiredRole,
  minSecurityLevel = "medium",
  requiresPasswordChange = false,
}) => {
  const auth = useSecureAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Account locked - show lockout message
  if (auth.isAccountLocked) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  const allowedRoles = requiredRole ? [requiredRole] : ["admin", "user"];

  return (
    <SecurityWrapper
      requiredPermissions={requiredPermissions}
      minSecurityLevel={minSecurityLevel}
      requiresPasswordChange={requiresPasswordChange}
      allowedRoles={allowedRoles}
    >
      {children}
    </SecurityWrapper>
  );
};

export default SecurityWrapper;
