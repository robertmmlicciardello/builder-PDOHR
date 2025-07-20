import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
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
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Award,
  DollarSign,
  FileText,
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
  ArrowLeft,
} from "lucide-react";

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
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
        leaveDate.getFullYear() === thisYear
      );
    }).length;

    // Mock calculations for demo
    const avgSalary = 800000; // Average salary in MMK
    const totalPayroll = activeEmployees.length * avgSalary;

    return {
      totalEmployees: state.personnel.length,
      activeEmployees: activeEmployees.length,
      newHiresThisMonth,
      terminationsThisMonth,
      averageAttendance: 92.5, // Mock percentage
      pendingLeaves: 8, // Mock count
      overdueReviews: 3, // Mock count
      upcomingBirthdays: 5, // Mock count
      totalPayroll,
      avgSalary,
    };
  }, [state.personnel]);

  // Department distribution data
  const departmentData = useMemo(() => {
    const departments = state.organizations || [];
    return departments.map((dept) => {
      const deptEmployees = state.personnel.filter(
        (p) => p.organization === dept.name && p.status === "active",
      );
      return {
        name: dept.name,
        count: deptEmployees.length,
        percentage: (
          (deptEmployees.length / dashboardStats.activeEmployees) *
          100
        ).toFixed(1),
      };
    });
  }, [state.personnel, state.organizations, dashboardStats.activeEmployees]);

  // Attendance trend data (mock)
  const attendanceTrend = [
    { month: "Jan", attendance: 94.2, target: 95 },
    { month: "Feb", attendance: 91.8, target: 95 },
    { month: "Mar", attendance: 96.5, target: 95 },
    { month: "Apr", attendance: 93.7, target: 95 },
    { month: "May", attendance: 92.1, target: 95 },
    { month: "Jun", attendance: 95.3, target: 95 },
  ];

  // Hiring trend data (mock)
  const hiringTrend = [
    { month: "Jan", hires: 12, terminations: 3 },
    { month: "Feb", hires: 8, terminations: 5 },
    { month: "Mar", hires: 15, terminations: 2 },
    { month: "Apr", hires: 6, terminations: 7 },
    { month: "May", hires: 18, terminations: 4 },
    {
      month: "Jun",
      hires: dashboardStats.newHiresThisMonth,
      terminations: dashboardStats.terminationsThisMonth,
    },
  ];

  const colors = ["#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#450a0a"];

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
              <Link to="/position-management">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  {t.positions.management}
                </Button>
              </Link>
              <Link to="/department-management">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red"
                >
                  <Building className="w-4 h-4 mr-2" />
                  {t.settings.manageDepartments}
                </Button>
              </Link>
              <Link to="/performance">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red"
                >
                  <Award className="w-4 h-4 mr-2" />
                  {t.hr.performance}
                </Button>
              </Link>
              <Link to="/admin-settings">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-myanmar-red text-myanmar-red"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Settings
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-myanmar-red text-myanmar-red"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t.actions.generate}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-myanmar-red text-myanmar-red"
              >
                <Download className="w-4 h-4 mr-2" />
                {t.actions.export}
              </Button>
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
        {/* Quick Stats */}
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
                    ပျမ်းမျှ လက်ရှိမှုနှုန���း
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

        {/* Notifications and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">
                  လပ်ရက်အတည်ပြုရန်
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-800">
                {dashboardStats.pendingLeaves}
              </p>
              <p className="text-sm text-orange-600">
                အတည်ပြုရန် စောင့်ဆိုင်းနေသည်
              </p>
              <Link to="/leave-management">
                <Button
                  size="sm"
                  className="mt-2 bg-orange-600 hover:bg-orange-700"
                >
                  ကြည့်ရှုရန်
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">
                  နောက်ကျနေသော သုံးသပ်ချက်များ
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-800">
                {dashboardStats.overdueReviews}
              </p>
              <p className="text-sm text-red-600">
                လုပ်ငန်းစွမ်းရ���် သုံး���ပ်ချက်များ
              </p>
              <Link to="/performance">
                <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                  အရေးပေါ်ကြည့်ရှုရန်
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">
                  မွေးနေ့များ လာမည်
                </h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-800">
                {dashboardStats.upcomingBirthdays}
              </p>
              <p className="text-sm text-blue-600">ယ���ုလအတွင်း</p>
              <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                စာရင်းကြည့်ရှုရန်
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview">ခြုံငုံက��ည့်ရှုရန်</TabsTrigger>
            <TabsTrigger value="attendance">လက်ရှိမှု</TabsTrigger>
            <TabsTrigger value="hiring">အလုပ်ခန့်ထားမှု</TabsTrigger>
            <TabsTrigger value="departments">ဌာနများ</TabsTrigger>
            <TabsTrigger value="performance">စွမ်းရည်</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-myanmar-red" />
                    {getText(
                      "monthlyAttendanceChartTitle",
                      "monthlyAttendanceChartTitleMyanmar",
                      currentLanguage,
                    )}
                  </h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="attendance"
                        stroke="#dc2626"
                        strokeWidth={3}
                        name="လက်ရှိမှု %"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#059669"
                        strokeDasharray="5 5"
                        name="ပန်းတိုင် %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <PieChartIcon className="w-5 h-5 mr-2 text-myanmar-red" />
                    ဌာနအလိုက် ဝန်ထမ်းဖြန့်ဝ���မှု
                  </h3>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name} (${percentage}%)`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={colors[index % colors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="border-myanmar-red/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  လ��်ရှိမှု အသေးစိတ်ခွဲခြမ်းစိတ်ဖြာမှု
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-800">
                      {Math.round(dashboardStats.activeEmployees * 0.925)}
                    </p>
                    <p className="text-sm text-green-600">ယနေ့ လက်ရှိ</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-red-800">
                      {Math.round(dashboardStats.activeEmployees * 0.05)}
                    </p>
                    <p className="text-sm text-red-600">ယနေ့ မလက်ရှိ</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-800">
                      {Math.round(dashboardStats.activeEmployees * 0.025)}
                    </p>
                    <p className="text-sm text-yellow-600">နောက်ကျခဲ့သူများ</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={attendanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#dc2626"
                      strokeWidth={3}
                      name="လက်ရှိမှုနှုန်း %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hiring" className="space-y-6">
            <Card className="border-myanmar-red/20">
              <CardHeader>
                <h3 className="text-lg font-semibold">
                  အ��ုပ်ခန့်ထားမှု နှင့် ထွက်ခွာမှု ခွဲခြမ်းစိတ်ဖြာမှု
                </h3>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hiringTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hires" fill="#059669" name="အသစ်ဝင်သူများ" />
                    <Bar
                      dataKey="terminations"
                      fill="#dc2626"
                      name="ထွက်ခွာသူမ��ား"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentData.map((dept, index) => (
                <Card key={dept.name} className="border-myanmar-red/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{dept.name}</h3>
                      <Building className="w-5 h-5 text-myanmar-red" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-myanmar-black">
                          {dept.count}
                        </p>
                        <p className="text-sm text-myanmar-gray-dark">
                          ဝန်ထမ်းများ ({dept.percentage}%)
                        </p>
                      </div>
                      <Progress
                        value={parseFloat(dept.percentage)}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-myanmar-gray-dark">
                        <span>ပျမ်းမျှ အ���က်: 32 နှစ်</span>
                        <span>ပျမ်းမျှ အတွေ့အကြုံ: 5 နှစ်</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Award className="w-5 h-5 mr-2 text-myanmar-red" />
                    စွမ်းရည်အဆင့်သတ်မှတ်ချက် ဖြန့်ဝေမှု
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        rating: "5 ⭐ (ထူးခ���ား)",
                        count: 8,
                        color: "bg-green-500",
                      },
                      {
                        rating: "4 ⭐ (ကောင်း)",
                        count: 25,
                        color: "bg-blue-500",
                      },
                      {
                        rating: "3 ⭐ (ပျမ်းမျှ)",
                        count: 35,
                        color: "bg-yellow-500",
                      },
                      {
                        rating: "2 ⭐ (တိုးတက်ရန်)",
                        count: 12,
                        color: "bg-orange-500",
                      },
                      {
                        rating: "1 ⭐ (အားနည်း)",
                        count: 3,
                        color: "bg-red-500",
                      },
                    ].map((item) => (
                      <div
                        key={item.rating}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{item.rating}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${item.color}`}
                              style={{ width: `${(item.count / 83) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">
                            {item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-myanmar-red/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-myanmar-red" />
                    လေ့ကျင့်ရေး နှင့် ဖွံ့ဖြိုးတိုးတက်မှု
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>လ��့ကျင့်ရေး ပြီးစီးသူများ</span>
                      <Badge className="bg-green-100 text-green-800">
                        78/95
                      </Badge>
                    </div>
                    <Progress value={(78 / 95) * 100} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>လက်ရှိ လေ့ကျင့်နေသူများ</span>
                      <Badge className="bg-blue-100 text-blue-800">12</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span>သင်တန်းများ ယခုလ</span>
                      <Badge className="bg-myanmar-red text-white">8</Badge>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-myanmar-gray-dark">
                        စုစုပေါင်း လေ့ကျင့်ရေးနာရီများ:{" "}
                        <strong>2,340 နာရီ</strong>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="border-myanmar-red/20 mt-8">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center">
              <Settings className="w-5 h-5 mr-2 text-myanmar-red" />
              မြန်ဆန်သော လုပ်ဆေ���င်ချက်များ
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/add-personnel">
                <Button className="w-full bg-myanmar-red hover:bg-myanmar-red-dark">
                  <UserPlus className="w-4 h-4 mr-2" />
                  ဝန်ထမ်းအသစ်ထည့်ရန်
                </Button>
              </Link>

              <Link to="/attendance">
                <Button
                  variant="outline"
                  className="w-full border-myanmar-red text-myanmar-red"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  လက်ရှိမှုမှတ်တမ်း
                </Button>
              </Link>

              <Link to="/leave-management">
                <Button
                  variant="outline"
                  className="w-full border-myanmar-red text-myanmar-red"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  လပ်ရက်စီမံခန့်ခွဲမှု
                </Button>
              </Link>

              <Link to="/payroll">
                <Button
                  variant="outline"
                  className="w-full border-myanmar-red text-myanmar-red"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  လစာစာရင်းများ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
