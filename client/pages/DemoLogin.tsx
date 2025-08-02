import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import {
  User,
  Shield,
  Eye,
  EyeOff,
  LogIn,
  UserCheck,
  Settings,
  Database,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    email: "admin@pdf.gov.mm",
    password: "PDF2024!",
    role: "Administrator",
    permissions: [
      "Full System Access",
      "User Management",
      "Settings",
      "Reports",
    ],
    description: "ဝန်ကြီးမျ���း နှင့် အထက်အရာရှိများအတွက်",
  },
  {
    email: "user@pdf.gov.mm",
    password: "User2024!",
    role: "HR Officer",
    permissions: ["Personnel Management", "View Reports", "Basic Operations"],
    description: "HR အရာရှိများ နှင့် ပုံမှန်အသုံးပြုသူများအတွက်",
  },
];

export default function DemoLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const { login, state } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemo(account.email);
    setIsLoading(true);

    try {
      const success = await login(account.email, account.password);
      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Demo login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-myanmar-red/10 to-myanmar-gold/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demo Accounts Section */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <div className="w-16 h-16 bg-myanmar-red rounded-xl flex items-center justify-center mx-auto lg:mx-0 mb-4">
              <span className="text-white text-2xl font-bold">✊</span>
            </div>
            <h1 className="text-3xl font-bold text-myanmar-black">
              PDF-Tech HR Demo
            </h1>
            <p className="text-myanmar-gray-dark mt-2">
              မြန်မာနိုင်ငံ အစိုးရ လူ့စွမ်းအားစီမံခန့်ခွဲမှု စနစ်
            </p>
          </div>

          <Alert className="border-myanmar-gold/50 bg-myanmar-gold/10">
            <Database className="w-4 h-4" />
            <AlertDescription className="text-myanmar-black">
              <strong>Demo Version:</strong> ဤသည်မှာ နမူနာပြစနစ်ဖြစ်ပြီး
              နမူနာအချက်အလက်များပါဝင်ပါသည်။
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-myanmar-black flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-myanmar-red" />
              Demo Accounts (စမ်းသပ်အကောင့်များ)
            </h3>

            {DEMO_ACCOUNTS.map((account, index) => (
              <Card
                key={account.email}
                className={`border-myanmar-red/20 cursor-pointer transition-all hover:shadow-md ${
                  selectedDemo === account.email
                    ? "ring-2 ring-myanmar-red"
                    : ""
                }`}
                onClick={() => handleDemoLogin(account)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge
                          variant={index === 0 ? "destructive" : "secondary"}
                        >
                          {account.role}
                        </Badge>
                        {index === 0 && (
                          <Shield className="w-4 h-4 text-myanmar-red" />
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div>
                          <strong>Email:</strong> {account.email}
                        </div>
                        <div>
                          <strong>Password:</strong>{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {account.password}
                          </code>
                        </div>
                        <div className="text-myanmar-gray-dark">
                          {account.description}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs text-myanmar-gray-dark mb-1">
                          Permissions:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {account.permissions.map((permission) => (
                            <Badge
                              key={permission}
                              variant="outline"
                              className="text-xs"
                            >
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="bg-myanmar-red hover:bg-myanmar-red-dark text-white ml-4"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemoLogin(account);
                      }}
                    >
                      <LogIn className="w-4 h-4 mr-1" />
                      Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Alert className="border-myanmar-red/30">
            <Settings className="w-4 h-4" />
            <AlertDescription className="text-myanmar-gray-dark">
              Admin account ဖြင့် စနစ်၏ အင်္ဂါရပ်အားလုံးကို စမ်းသပ်နိုင်ပါသည်။
            </AlertDescription>
          </Alert>
        </div>

        {/* Manual Login Form */}
        <Card className="border-myanmar-red/20">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-myanmar-red" />
              <h2 className="text-xl font-semibold text-myanmar-black">
                Manual Login
              </h2>
            </div>
            <p className="text-sm text-myanmar-gray-dark">
              သို့မဟုတ် ကိုယ်တိုင်လက်ဖြင့် ဝင်ရောက်နိုင်ပါသည်
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-myanmar-black">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pdf.gov.mm"
                  className="border-myanmar-red/30 focus:border-myanmar-red"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-myanmar-black">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="PDF2024!"
                    className="border-myanmar-red/30 focus:border-myanmar-red pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-myanmar-gray-dark" />
                    ) : (
                      <Eye className="w-4 h-4 text-myanmar-gray-dark" />
                    )}
                  </Button>
                </div>
              </div>

              {state.error && (
                <Alert className="border-red-500 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {state.error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-myanmar-red hover:bg-myanmar-red-dark text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to System
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-myanmar-red/20">
              <div className="text-xs text-myanmar-gray-dark text-center">
                <p>
                  <strong>For Demo:</strong> Use accounts above or contact
                  PDF-Tech for access
                </p>
                <p className="mt-1">Demo data will reset periodically</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
