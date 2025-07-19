import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Use admin/pdf2024");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-myanmar-gray-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-myanmar-red rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="text-white text-3xl font-bold">✊</div>
          </div>
          <h1 className="text-3xl font-bold text-myanmar-black mb-2">
            PDF-Tech
          </h1>
          <p className="text-myanmar-gray-dark">
            People's Defence Force Technology Workshop
          </p>
        </div>

        <Card className="border-myanmar-red/20">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold text-myanmar-black">
              Personnel Management System
            </h2>
            <p className="text-sm text-myanmar-gray-dark">
              Secure access required
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-myanmar-black">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-myanmar-red/30 focus:border-myanmar-red"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-myanmar-black">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-myanmar-red/30 focus:border-myanmar-red"
                  required
                />
              </div>

              {error && (
                <Alert className="border-myanmar-red/50 bg-myanmar-red/10">
                  <AlertDescription className="text-myanmar-red-dark">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-myanmar-red hover:bg-myanmar-red-dark text-white"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-myanmar-red/20">
              <p className="text-xs text-myanmar-gray-dark text-center">
                Demo credentials: admin / pdf2024
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-myanmar-gray-dark">
            Authorized personnel only. All activities are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
}
