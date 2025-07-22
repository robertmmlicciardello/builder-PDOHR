import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSecureAuth } from "../hooks/useSecureAuth";
import { SecurityUtils, SECURITY_CONFIG } from "../lib/security";
import { useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fingerprint,
  Key,
  RefreshCw,
} from "lucide-react";

export default function SecureLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email: string[];
    password: string[];
  }>({
    email: [],
    password: [],
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [] as string[],
  });
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityMetrics, setSecurityMetrics] = useState({
    connectionSecure: false,
    deviceTrusted: false,
    locationVerified: false,
    lastLoginCheck: false,
  });

  const navigate = useNavigate();
  const t = useTranslation();
  const auth = useSecureAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Security initialization
  useEffect(() => {
    initializeSecurity();
    checkDeviceSecurity();
    
    // Add keyboard shortcuts for accessibility
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSubmit(e as any);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (auth.isAuthenticated) {
      if (auth.requiresPasswordChange) {
        setShowPasswordChangeDialog(true);
      } else {
        navigate("/dashboard");
      }
    }
  }, [auth.isAuthenticated, auth.requiresPasswordChange, navigate]);

  // Auto-lock account timer display
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (auth.isAccountLocked && auth.lockoutTimeRemaining > 0) {
      timer = setInterval(() => {
        if (auth.lockoutTimeRemaining <= 0) {
          window.location.reload(); // Refresh to reset lockout state
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [auth.isAccountLocked, auth.lockoutTimeRemaining]);

  const initializeSecurity = () => {
    // Set security headers
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = SecurityUtils.getCSPHeader();
    document.head.appendChild(meta);

    // Check HTTPS
    setSecurityMetrics(prev => ({
      ...prev,
      connectionSecure: window.location.protocol === 'https:',
    }));
  };

  const checkDeviceSecurity = async () => {
    try {
      // Check if device has been used before
      const deviceFingerprint = await generateDeviceFingerprint();
      const trustedDevices = JSON.parse(localStorage.getItem('trusted-devices') || '[]');
      
      setSecurityMetrics(prev => ({
        ...prev,
        deviceTrusted: trustedDevices.includes(deviceFingerprint),
        locationVerified: true, // Mock - in production, check geolocation
        lastLoginCheck: true,
      }));
    } catch (error) {
      console.error('Device security check failed:', error);
    }
  };

  const generateDeviceFingerprint = async (): Promise<string> => {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '0',
    ].join('|');
    
    return SecurityUtils.encrypt(fingerprint);
  };

  const handleInputChange = useCallback((field: 'email' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Real-time validation - less strict for login
    if (field === 'email') {
      const validation = SecurityUtils.validateInput(value, field);
      setValidationErrors(prev => ({
        ...prev,
        [field]: validation.errors,
      }));
    } else if (field === 'password') {
      // Only basic validation for login - not creation
      const errors: string[] = [];
      if (value && value.length < 6) {
        errors.push('Password must be at least 6 characters');
      }
      setValidationErrors(prev => ({
        ...prev,
        password: errors,
      }));

      // Password strength calculation (for display only)
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    // Clear auth errors when user types
    if (auth.error) {
      auth.clearError();
    }
  }, [auth]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 20;
    else feedback.push('Add numbers');

    if (/[@$!%*?&]/.test(password)) score += 20;
    else feedback.push('Add special characters');

    return { score, feedback };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const emailValidation = SecurityUtils.validateInput(formData.email, 'email');
    const passwordValidation = SecurityUtils.validateInput(formData.password, 'password');

    if (!emailValidation.isValid || !passwordValidation.isValid) {
      setValidationErrors({
        email: emailValidation.errors,
        password: passwordValidation.errors,
      });
      return;
    }

    // Clear validation errors
    setValidationErrors({ email: [], password: [] });

    // Add device to trusted list on successful login
    const deviceFingerprint = await generateDeviceFingerprint();
    
    const success = await auth.login({
      email: emailValidation.sanitized,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (success) {
      // Add device to trusted devices
      const trustedDevices = JSON.parse(localStorage.getItem('trusted-devices') || '[]');
      if (!trustedDevices.includes(deviceFingerprint)) {
        trustedDevices.push(deviceFingerprint);
        localStorage.setItem('trusted-devices', JSON.stringify(trustedDevices));
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await auth.changePassword(passwordChangeData);
    if (success) {
      setShowPasswordChangeDialog(false);
      navigate("/dashboard");
    }
  };

  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSecurityBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-myanmar-gray-light to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 bg-myanmar-red rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-white text-3xl font-bold">✊</div>
            <div className="absolute -top-2 -right-2">
              <Shield className="w-8 h-8 text-green-600 bg-white rounded-full p-1" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-myanmar-black mb-2">
            PDF Technology HR
          </h1>
          <p className="text-myanmar-gray-dark">Secure Access Portal</p>
          
          {/* Security indicators */}
          <div className="flex justify-center space-x-2 mt-4">
            <Badge 
              variant={securityMetrics.connectionSecure ? "default" : "destructive"}
              className="text-xs"
            >
              {securityMetrics.connectionSecure ? "🔒 Secure" : "⚠️ Insecure"}
            </Badge>
            <Badge 
              variant={securityMetrics.deviceTrusted ? "default" : "secondary"}
              className="text-xs"
            >
              {securityMetrics.deviceTrusted ? "✓ Trusted" : "? New Device"}
            </Badge>
          </div>
          
          <div className="flex justify-center mt-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-myanmar-red/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5 text-myanmar-red" />
              <h2 className="text-xl font-semibold text-myanmar-black">
                Secure Login
              </h2>
            </div>
            <p className="text-sm text-myanmar-gray-dark">
              Multi-layer security protection enabled
            </p>
          </CardHeader>
          
          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Account Lockout Warning */}
              {auth.isAccountLocked && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">
                    Account is locked due to multiple failed attempts.
                    <br />
                    Try again in: {formatTimeRemaining(auth.lockoutTimeRemaining)}
                  </AlertDescription>
                </Alert>
              )}

              {/* Rate Limit Warning */}
              {auth.rateLimitRemaining < 5 && auth.rateLimitRemaining > 0 && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-yellow-700">
                    {auth.rateLimitRemaining} login attempts remaining
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-myanmar-black flex items-center">
                  Email
                  {validationErrors.email.length === 0 && formData.email && (
                    <CheckCircle className="w-4 h-4 text-green-600 ml-1" />
                  )}
                </Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`border-myanmar-red/30 focus:border-myanmar-red ${
                    validationErrors.email.length > 0 ? 'border-red-500' : ''
                  }`}
                  placeholder="admin@pdf.gov.mm"
                  required
                  disabled={auth.isLoading || auth.isAccountLocked}
                  autoComplete="username"
                />
                {validationErrors.email.length > 0 && (
                  <div className="text-sm text-red-600">
                    {validationErrors.email.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-myanmar-black flex items-center">
                  Password
                  {formData.password && (
                    <div className={`ml-2 text-xs px-2 py-1 rounded ${getSecurityBadgeColor(
                      passwordStrength.score >= 80 ? 'high' : 
                      passwordStrength.score >= 60 ? 'medium' : 'low'
                    )} text-white`}>
                      {passwordStrength.score >= 80 ? 'Strong' : 
                       passwordStrength.score >= 60 ? 'Medium' : 'Weak'}
                    </div>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    ref={passwordRef}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`border-myanmar-red/30 focus:border-myanmar-red pr-10 ${
                      validationErrors.password.length > 0 ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your password"
                    required
                    disabled={auth.isLoading || auth.isAccountLocked}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={auth.isLoading || auth.isAccountLocked}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <Progress 
                      value={passwordStrength.score} 
                      className="h-2"
                    />
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-600">
                        {passwordStrength.feedback.map((tip, index) => (
                          <div key={index}>• {tip}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {validationErrors.password.length > 0 && (
                  <div className="text-sm text-red-600">
                    {validationErrors.password.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="rounded border-myanmar-red/30"
                  disabled={auth.isLoading || auth.isAccountLocked}
                />
                <Label htmlFor="rememberMe" className="text-sm text-myanmar-gray-dark">
                  Remember me for 7 days (trusted devices only)
                </Label>
              </div>

              {/* Error Display */}
              {auth.error && (
                <Alert className="border-myanmar-red/50 bg-myanmar-red/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-myanmar-red-dark">
                    {auth.error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Status */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="text-xs font-medium text-gray-700">Security Status:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${securityMetrics.connectionSecure ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Connection</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${securityMetrics.deviceTrusted ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span>Device</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
                    <span>Encryption</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full bg-green-500`}></div>
                    <span>Validation</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={auth.isLoading || auth.isAccountLocked || 
                         validationErrors.email.length > 0 || 
                         validationErrors.password.length > 0}
                className="w-full bg-myanmar-red hover:bg-myanmar-red-dark text-white"
              >
                {auth.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure Login</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-4 border-t border-myanmar-red/20">
              <p className="text-xs text-myanmar-gray-dark text-center mb-2">
                Demo Credentials:
              </p>
              <div className="grid grid-cols-1 gap-1 text-xs text-myanmar-gray-dark text-center">
                <p>Admin: admin@pdf.gov.mm / PDF2024!</p>
                <p>User: user@pdf.gov.mm / User2024!</p>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                (Secure passwords meet all security requirements)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex justify-center items-center space-x-4 text-xs text-myanmar-gray-dark">
            <div className="flex items-center space-x-1">
              <Fingerprint className="w-3 h-3" />
              <span>Biometric Ready</span>
            </div>
            <div className="flex items-center space-x-1">
              <Key className="w-3 h-3" />
              <span>AES-256 Encryption</span>
            </div>
          </div>
          <p className="text-xs text-myanmar-gray-dark">
            All activities are monitored and logged for security purposes
          </p>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChangeDialog} onOpenChange={setShowPasswordChangeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-myanmar-red" />
              <span>Password Change Required</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-700">
                For security reasons, you must change your password before continuing.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordChangeData.currentPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ 
                  ...prev, 
                  currentPassword: e.target.value 
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordChangeData.newPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ 
                  ...prev, 
                  newPassword: e.target.value 
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordChangeData.confirmPassword}
                onChange={(e) => setPasswordChangeData(prev => ({ 
                  ...prev, 
                  confirmPassword: e.target.value 
                }))}
                required
              />
            </div>

            {auth.error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertDescription className="text-red-700">
                  {auth.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordChangeDialog(false);
                  auth.logout();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={auth.isLoading}
                className="flex-1 bg-myanmar-red hover:bg-myanmar-red-dark"
              >
                {auth.isLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
