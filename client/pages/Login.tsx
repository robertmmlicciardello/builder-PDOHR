import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { translations } from "@shared/translations";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
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
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError(translations.auth.invalidCredentials);
      }
    } catch (err) {
      setError(translations.messages.error);
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
            {translations.appName}
          </h1>
          <p className="text-myanmar-gray-dark">{translations.subtitle}</p>
        </div>

        <Card className="border-myanmar-red/20">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold text-myanmar-black">
              {translations.personnel.personnelManagement}
            </h2>
            <p className="text-sm text-myanmar-gray-dark">
              {translations.auth.secureAccess}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-myanmar-black">
                  အီးမေးလ်လိပ်စာ
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-myanmar-red/30 focus:border-myanmar-red"
                  placeholder="admin@pdf.gov.mm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-myanmar-black">
                  {translations.auth.password}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-myanmar-red/30 focus:border-myanmar-red"
                  placeholder="စကားဝှက်"
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
                {isLoading
                  ? translations.common.loading
                  : translations.auth.signIn}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-myanmar-red/20">
              <p className="text-xs text-myanmar-gray-dark text-center">
                စီမံခန့်ခွဲသူ: admin@pdf.gov.mm / pdf2024
              </p>
              <p className="text-xs text-myanmar-gray-dark text-center mt-1">
                အသုံးပြုသူ: user@pdf.gov.mm / user2024
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-myanmar-gray-dark">
            {translations.auth.monitoring}
          </p>
        </div>
      </div>
    </div>
  );
}
