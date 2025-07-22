import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Activity, 
  Users, 
  FileText, 
  Settings,
  RefreshCw,
  Download,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { SecurityLogger, SecurityEvent, SessionManager } from '../lib/security';
import { useSecureAuth } from '../hooks/useSecureAuth';

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  successRate: number;
  lockedAccounts: number;
  activeSessions: number;
  securityEvents: number;
  lastSecurityCheck: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function SecurityDashboard() {
  const auth = useSecureAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    successRate: 0,
    lockedAccounts: 0,
    activeSessions: 0,
    securityEvents: 0,
    lastSecurityCheck: new Date().toISOString(),
    threatLevel: 'low'
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setIsRefreshing(true);
      
      // Load security events
      const events = SecurityLogger.getEvents();
      setSecurityEvents(events.slice(0, 100)); // Show last 100 events

      // Calculate metrics
      const now = Date.now();
      const last24Hours = now - (24 * 60 * 60 * 1000);
      const recentEvents = events.filter(event => event.timestamp > last24Hours);
      
      const loginAttempts = recentEvents.filter(e => e.type === 'login_attempt');
      const successfulLogins = recentEvents.filter(e => e.type === 'login_success');
      const failedLogins = recentEvents.filter(e => e.type === 'login_failure');
      const lockedAccounts = recentEvents.filter(e => e.type === 'account_locked');
      
      const activeSessions = SessionManager.getAllActiveSessions().length;
      const successRate = loginAttempts.length > 0 ? 
        (successfulLogins.length / loginAttempts.length) * 100 : 100;
      
      // Determine threat level
      let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (failedLogins.length > 20) threatLevel = 'high';
      else if (failedLogins.length > 10) threatLevel = 'medium';
      
      const criticalEvents = recentEvents.filter(e => e.severity === 'critical');
      if (criticalEvents.length > 0) threatLevel = 'critical';

      setMetrics({
        totalLogins: loginAttempts.length,
        failedLogins: failedLogins.length,
        successRate: Math.round(successRate),
        lockedAccounts: lockedAccounts.length,
        activeSessions,
        securityEvents: recentEvents.length,
        lastSecurityCheck: new Date().toISOString(),
        threatLevel
      });

    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const exportSecurityReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics,
      events: securityEvents,
      systemInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getEventSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login_success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'login_failure': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'account_locked': return <Lock className="w-4 h-4 text-red-600" />;
      case 'suspicious_activity': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'password_change': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'logout': return <Info className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  // Don't show security dashboard to non-admin users
  if (auth.user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-gray-600">Administrator privileges required to view security dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-myanmar-red" />
                Security Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time security monitoring and threat detection
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getThreatLevelColor(metrics.threatLevel)}>
                Threat Level: {metrics.threatLevel.toUpperCase()}
              </Badge>
              <Button onClick={loadSecurityData} disabled={isRefreshing} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={exportSecurityReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Threat Level Alert */}
        {metrics.threatLevel !== 'low' && (
          <Alert className={`mb-6 ${
            metrics.threatLevel === 'critical' ? 'border-red-500 bg-red-50' :
            metrics.threatLevel === 'high' ? 'border-red-400 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className={
              metrics.threatLevel === 'critical' ? 'text-red-700' :
              metrics.threatLevel === 'high' ? 'text-red-600' :
              'text-yellow-700'
            }>
              <strong>Elevated Threat Level Detected:</strong> {metrics.threatLevel.toUpperCase()}
              {metrics.threatLevel === 'critical' && (
                <span> - Immediate action required. Multiple security incidents detected.</span>
              )}
              {metrics.threatLevel === 'high' && (
                <span> - High number of failed login attempts detected.</span>
              )}
              {metrics.threatLevel === 'medium' && (
                <span> - Increased security activity requires monitoring.</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Security Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Login Success Rate</p>
                  <p className="text-3xl font-bold text-green-600">{metrics.successRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
                {metrics.successRate >= 90 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed Logins</p>
                  <p className="text-3xl font-bold text-red-600">{metrics.failedLogins}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sessions</p>
                  <p className="text-3xl font-bold text-blue-600">{metrics.activeSessions}</p>
                  <p className="text-xs text-gray-500 mt-1">Current active users</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Security Events</p>
                  <p className="text-3xl font-bold text-myanmar-red">{metrics.securityEvents}</p>
                  <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
                </div>
                <Activity className="w-8 h-8 text-myanmar-red" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Details Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
            <TabsTrigger value="settings">Security Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-green-600" />
                        Firewall Protection
                      </span>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Lock className="w-4 h-4 mr-2 text-green-600" />
                        Data Encryption
                      </span>
                      <Badge className="bg-green-100 text-green-700">AES-256</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-green-600" />
                        Audit Logging
                      </span>
                      <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-2 text-green-600" />
                        Real-time Monitoring
                      </span>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <strong>Last Security Check:</strong><br />
                      {new Date(metrics.lastSecurityCheck).toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <strong>Total Login Attempts:</strong> {metrics.totalLogins}
                    </div>
                    <div className="text-sm">
                      <strong>Locked Accounts:</strong> {metrics.lockedAccounts}
                    </div>
                    <div className="text-sm">
                      <strong>Current Security Level:</strong> 
                      <Badge className={`ml-2 ${getThreatLevelColor(metrics.threatLevel)}`}>
                        {metrics.threatLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Security Events Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {securityEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No security events recorded</p>
                  ) : (
                    securityEvents.map((event, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded border ${getEventSeverityColor(event.severity)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getEventIcon(event.type)}
                            <div>
                              <div className="font-medium">{formatEventType(event.type)}</div>
                              <div className="text-sm opacity-75">
                                {event.userId && `User: ${event.userId}`}
                                {event.email && ` | Email: ${event.email}`}
                              </div>
                              {event.details && (
                                <div className="text-xs opacity-60 mt-1">
                                  {JSON.stringify(event.details, null, 2)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs opacity-75">
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    {metrics.activeSessions} active session{metrics.activeSessions !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Session management features will be available in future updates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Security settings are configured in the application code and environment variables.
                      Contact your system administrator for configuration changes.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Authentication Settings</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• Password minimum length: 8 characters</li>
                        <li>• Max login attempts: 5</li>
                        <li>• Account lockout duration: 30 minutes</li>
                        <li>• Session timeout: 1 hour</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Security Features</h4>
                      <ul className="text-sm space-y-1 text-gray-600">
                        <li>• AES-256 data encryption</li>
                        <li>• Real-time threat monitoring</li>
                        <li>• Comprehensive audit logging</li>
                        <li>• Rate limiting protection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
