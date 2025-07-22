import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { DatabaseStatus } from "../components/DatabaseStatus";
import { IncomeSummaryWidget } from "../components/IncomeSummaryWidget";
import { OutcomeSummaryWidget } from "../components/OutcomeSummaryWidget";
import { useDashboardCustomization } from "../hooks/useDashboardCustomization";
import {
  HRMetrics,
  AttendanceRecord,
  LeaveRequest,
  PerformanceReview,
} from "@shared/hr-system";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UserPlus,
  UserMinus,
  UserX,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  DollarSign,
  FileText,
  Skull,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Briefcase,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Building,
  GraduationCap,
  Heart,
  Shield,
} from "lucide-react";

interface DepartmentStats {
  name: string;
  count: number;
  percentage: string;
}

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  resignedEmployees: number;
  terminatedEmployees: number;
  deceasedEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  resignationsThisMonth: number;
  actualTerminationsThisMonth: number;
  averageAttendance: number;
  pendingLeaves: number;
  overdueReviews: number;
  upcomingBirthdays: number;
  totalPayroll: number;
  avgSalary: number;
}

export default function HRDashboard() {
  const { state } = useApp();
  const { currentLanguage } = useLanguage();
  const t = useTranslation();
  const { customization, getText } = useDashboardCustomization();
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Calculate comprehensive HR metrics
  const dashboardStats = useMemo((): DashboardStats => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const activeEmployees = state.personnel.filter(
      (p) => p.status === "active",
    );

    const resignedEmployees = state.personnel.filter(
      (p) => p.status === "resigned",
    );

    const terminatedEmployees = state.personnel.filter(
      (p) => p.status === "terminated",
    );

    const deceasedEmployees = state.personnel.filter(
      (p) => p.status === "deceased",
    );

    const newHiresThisMonth = state.personnel.filter((p) => {
      const joinDate = new Date(p.dateOfJoining);
      return (
        joinDate.getMonth() === thisMonth &&
        joinDate.getFullYear() === thisYear &&
        p.status === "active"
      );
    }).length;

    const terminationsThisMonth = state.personnel.filter((p) => {
      if (!p.dateOfLeaving) return false;
      const leaveDate = new Date(p.dateOfLeaving);
      return (
        leaveDate.getMonth() === thisMonth &&
        leaveDate.getFullYear() === thisYear &&
        (p.status === "resigned" ||
          p.status === "terminated" ||
          p.status === "deceased")
      );
    }).length;

    const resignationsThisMonth = state.personnel.filter((p) => {
      if (!p.dateOfLeaving || p.status !== "resigned") return false;
      const leaveDate = new Date(p.dateOfLeaving);
      return (
        leaveDate.getMonth() === thisMonth &&
        leaveDate.getFullYear() === thisYear
      );
    }).length;

    const actualTerminationsThisMonth = state.personnel.filter((p) => {
      if (!p.dateOfLeaving || p.status !== "terminated") return false;
      const leaveDate = new Date(p.dateOfLeaving);
      return (
        leaveDate.getMonth() === thisMonth &&
        leaveDate.getFullYear() === thisYear
      );
    }).length;

    // Mock calculations for demo
    const avgSalary = 800000; // Average salary in MMK
    const totalPayroll = activeEmployees.length * avgSalary;

    return {
      totalEmployees: state.personnel.length,
      activeEmployees: activeEmployees.length,
      resignedEmployees: resignedEmployees.length,
      terminatedEmployees: terminatedEmployees.length,
      deceasedEmployees: deceasedEmployees.length,
      newHiresThisMonth,
      terminationsThisMonth,
      resignationsThisMonth,
      actualTerminationsThisMonth,
      averageAttendance: 92.5, // Mock percentage
      pendingLeaves: 8, // Mock count
      overdueReviews: 3, // Mock count
      upcomingBirthdays: 5, // Mock count
      totalPayroll,
      avgSalary,
    };
  }, [state.personnel]);

  return (
    <div className="min-h-screen bg-myanmar-gray-light">
      {/* Header */}
      <header className="bg-white border-b border-myanmar-red/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-myanmar-red rounded-lg flex items-center justify-center">
                {customization.logoUrl ? (
                  <img
                    src={customization.logoUrl}
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-white text-xl font-bold">
                    {customization.logoEmoji}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-myanmar-black">
                  {getText(
                    "dashboardTitle",
                    "dashboardTitleMyanmar",
                    currentLanguage,
                  )}
                </h1>
                <p className="text-sm text-myanmar-gray-dark">
                  {getText(
                    "dashboardSubtitle",
                    "dashboardSubtitleMyanmar",
                    currentLanguage,
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/personnel-list">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Personnel List
                </Button>
              </Link>
              <DatabaseStatus />
              <LanguageSwitcher />
              <div className="relative">
                <Bell className="w-6 h-6 text-myanmar-red cursor-pointer" />
                <span className="absolute -top-1 -right-1 bg-myanmar-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {dashboardStats.pendingLeaves + dashboardStats.overdueReviews}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Personnel Status Overview */}
        <Card className="border-myanmar-red/20 mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-myanmar-black">
              Personnel Status Overview
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {dashboardStats.activeEmployees}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                  <UserMinus className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardStats.resignedEmployees}
                </p>
                <p className="text-sm text-gray-600">Resigned</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {dashboardStats.terminatedEmployees}
                </p>
                <p className="text-sm text-gray-600">Terminated</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mx-auto mb-2">
                  <Skull className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-2xl font-bold text-gray-600">
                  {dashboardStats.deceasedEmployees}
                </p>
                <p className="text-sm text-gray-600">Deceased</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>This Month Activity:</span>
                <div className="flex space-x-4">
                  <span className="text-green-600">
                    +{dashboardStats.newHiresThisMonth} hires
                  </span>
                  <span className="text-yellow-600">
                    -{dashboardStats.resignationsThisMonth} resigned
                  </span>
                  <span className="text-red-600">
                    -{dashboardStats.actualTerminationsThisMonth} terminated
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-myanmar-red/20 mb-8">
          <CardHeader>
            <h3 className="text-lg font-semibold text-myanmar-black flex items-center">
              <UserPlus className="w-5 h-5 text-myanmar-red mr-2" />
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/personnel-list">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">View Personnel</span>
                </Button>
              </Link>
              <Link to="/add-personnel">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <UserPlus className="w-6 h-6" />
                  <span className="text-sm font-medium">Add Personnel</span>
                </Button>
              </Link>
              <Link to="/attendance">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <Clock className="w-6 h-6" />
                  <span className="text-sm font-medium">Attendance</span>
                </Button>
              </Link>
              <Link to="/admin-settings">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-sm font-medium">Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    {getText(
                      "totalPersonnelLabel",
                      "totalPersonnelLabelMyanmar",
                      currentLanguage,
                    )}
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {dashboardStats.totalEmployees}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {(
                      (dashboardStats.newHiresThisMonth /
                        dashboardStats.totalEmployees) *
                      100
                    ).toFixed(1)}
                    % လက်ရှိလ
                  </p>
                </div>
                <Users className="w-12 h-12 text-myanmar-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    {getText(
                      "activePersonnelLabel",
                      "activePersonnelLabelMyanmar",
                      currentLanguage,
                    )}
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {dashboardStats.activeEmployees}
                  </p>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-sm text-green-600 flex items-center">
                      <UserPlus className="w-3 h-3 mr-1" />+
                      {dashboardStats.newHiresThisMonth}
                    </span>
                    <span className="text-sm text-red-600 flex items-center">
                      <UserMinus className="w-3 h-3 mr-1" />-
                      {dashboardStats.terminationsThisMonth}
                    </span>
                  </div>
                </div>
                <Activity className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    ပျမ်းမျှ လက်ရှိမှုနှုန်း
                  </p>
                  <p className="text-3xl font-bold text-myanmar-black">
                    {dashboardStats.averageAttendance}%
                  </p>
                  <Progress
                    value={dashboardStats.averageAttendance}
                    className="mt-2 h-2"
                  />
                </div>
                <Clock className="w-12 h-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-myanmar-red/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-myanmar-gray-dark">
                    {t.common.total} {t.hr.payroll}
                  </p>
                  <p className="text-2xl font-bold text-myanmar-black">
                    {(dashboardStats.totalPayroll / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-myanmar-gray-dark">
                    ပျမ်းမျှ: {(dashboardStats.avgSalary / 1000).toFixed(0)}K
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary Section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-myanmar-black mb-2">
              Financial Overview
            </h2>
            <p className="text-sm text-myanmar-gray-dark">
              Income and outcome summary for this period
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <IncomeSummaryWidget />
            </div>

            <div className="lg:col-span-1">
              <OutcomeSummaryWidget />
            </div>

            <div className="lg:col-span-1">
              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-myanmar-black">
                    Recent Activity
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-myanmar-gray-dark">
                    Latest financial transactions and personnel activities will be displayed here.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
