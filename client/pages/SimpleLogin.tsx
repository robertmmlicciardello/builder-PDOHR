import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, state } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Simple login attempt:', { email, password });
      const success = await login(email, password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, navigating to dashboard');
        setTimeout(() => {
          navigate("/dashboard");
        }, 100);
      } else {
        setError("Invalid credentials. Try: admin@pdf.gov.mm / admin123");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-navigate if already authenticated
  React.useEffect(() => {
    if (state.user?.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [state.user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simple Login
          </h1>
          <p className="text-gray-600">Troubleshooting Login</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-center">Sign In</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pdf.gov.mm"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <h3 className="text-sm font-medium mb-2">Demo Credentials:</h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Admin:</strong> admin@pdf.gov.mm / admin123</p>
                <p><strong>User:</strong> user@pdf.gov.mm / user123</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Debug Mode - Check browser console for logs
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Authentication State: {state.user?.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </p>
          {state.user && (
            <p className="text-xs text-gray-500">
              User: {state.user.email} ({state.user.role})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
