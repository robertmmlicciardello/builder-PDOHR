import React, { useState, useEffect } from "react";
import {
  Save,
  Upload,
  RefreshCw,
  Eye,
  Settings,
  Palette,
  Type,
  Image,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage, useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { CustomizationService } from "../services/hrDatabase";

// Interface for dashboard customization settings
interface DashboardCustomization {
  // App Branding
  appName: string;
  appNameMyanmar: string;
  subtitle: string;
  subtitleMyanmar: string;
  logoEmoji: string;
  logoUrl?: string;

  // Dashboard Text
  dashboardTitle: string;
  dashboardTitleMyanmar: string;
  dashboardSubtitle: string;
  dashboardSubtitleMyanmar: string;

  // Statistics Labels
  totalPersonnelLabel: string;
  totalPersonnelLabelMyanmar: string;
  activePersonnelLabel: string;
  activePersonnelLabelMyanmar: string;
  averageAttendanceLabel: string;
  averageAttendanceLabelMyanmar: string;
  totalPayrollLabel: string;
  totalPayrollLabelMyanmar: string;

  // Section Titles
  pendingLeavesTitle: string;
  pendingLeavesTitleMyanmar: string;
  overdueReviewsTitle: string;
  overdueReviewsTitleMyanmar: string;
  upcomingBirthdaysTitle: string;
  upcomingBirthdaysTitleMyanmar: string;

  // Tab Labels
  overviewTabLabel: string;
  overviewTabLabelMyanmar: string;
  attendanceTabLabel: string;
  attendanceTabLabelMyanmar: string;
  hiringTabLabel: string;
  hiringTabLabelMyanmar: string;
  departmentsTabLabel: string;
  departmentsTabLabelMyanmar: string;
  performanceTabLabel: string;
  performanceTabLabelMyanmar: string;

  // Chart Titles
  monthlyAttendanceChartTitle: string;
  monthlyAttendanceChartTitleMyanmar: string;
  departmentDistributionTitle: string;
  departmentDistributionTitleMyanmar: string;
  hiringAnalysisTitle: string;
  hiringAnalysisTitleMyanmar: string;
  performanceDistributionTitle: string;
  performanceDistributionTitleMyanmar: string;
  trainingDevelopmentTitle: string;
  trainingDevelopmentTitleMyanmar: string;

  // Quick Actions
  quickActionsTitle: string;
  quickActionsTitleMyanmar: string;
  addPersonnelAction: string;
  addPersonnelActionMyanmar: string;
  attendanceRecordAction: string;
  attendanceRecordActionMyanmar: string;
  leaveManagementAction: string;
  leaveManagementActionMyanmar: string;
  payrollAction: string;
  payrollActionMyanmar: string;

  // Color Theme
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

const defaultCustomization: DashboardCustomization = {
  // App Branding
  appName: "PDF-Technology",
  appNameMyanmar: "ပကဖ-နည်းပညာ",
  subtitle: "People's Defense Force Technology Workshop",
  subtitleMyanmar: "ပြည်သူ့ကာကွယ်ရေးတပ်ဖွဲ့ နည်းပညာလက်ရုံးတပ်",
  logoEmoji: "✊",

  // Dashboard Text
  dashboardTitle: "HR Management System",
  dashboardTitleMyanmar: "HR မန်နေဂျာမင့် စနစ်",
  dashboardSubtitle: "Comprehensive Human Resource Management System",
  dashboardSubtitleMyanmar:
    "ပြည့်စုံတဲ့ လူ့စွမ်းအားရင်းမြစ် စီမံခန့်ခွဲမှုစနစ်",

  // Statistics Labels
  totalPersonnelLabel: "Total Personnel",
  totalPersonnelLabelMyanmar: "စုစုပေါင်း ဝန်ထမ်းများ",
  activePersonnelLabel: "Active Personnel",
  activePersonnelLabelMyanmar: "လက်ရှိ အလုပ်လုပ်နေသူများ",
  averageAttendanceLabel: "Average Attendance",
  averageAttendanceLabelMyanmar: "ပျမ်းမျှ လက်���ှိမှုနှုန်း",
  totalPayrollLabel: "Total Payroll",
  totalPayrollLabelMyanmar: "လစာစုစုပေါင်း",

  // Section Titles
  pendingLeavesTitle: "Leave Approvals",
  pendingLeavesTitleMyanmar: "လပ်ရက်အတည်ပြုရန်",
  overdueReviewsTitle: "Overdue Reviews",
  overdueReviewsTitleMyanmar: "နောက်ကျနေသော သုံးသပ်ချက်များ",
  upcomingBirthdaysTitle: "Upcoming Birthdays",
  upcomingBirthdaysTitleMyanmar: "မွေးနေ့များ လာမည်",

  // Tab Labels
  overviewTabLabel: "Overview",
  overviewTabLabelMyanmar: "ခြုံငုံကြည့်ရှုရန်",
  attendanceTabLabel: "Attendance",
  attendanceTabLabelMyanmar: "လက်ရှိမှု",
  hiringTabLabel: "Hiring",
  hiringTabLabelMyanmar: "အလုပ်ခန့်ထားမှု",
  departmentsTabLabel: "Departments",
  departmentsTabLabelMyanmar: "ဌာနများ",
  performanceTabLabel: "Performance",
  performanceTabLabelMyanmar: "စွမ်းရည်",

  // Chart Titles
  monthlyAttendanceChartTitle: "Monthly Attendance Rate",
  monthlyAttendanceChartTitleMyanmar: "လစဉ် လက်ရှိမှုနှုန်း",
  departmentDistributionTitle: "Employee Distribution by Department",
  departmentDistributionTitleMyanmar: "ဌာနအလိုက် ဝန်ထမ်းဖြန့်ဝေမှု",
  hiringAnalysisTitle: "Hiring and Termination Analysis",
  hiringAnalysisTitleMyanmar:
    "အလုပ်ခန့်ထားမှု နှင့် ထွက်ခွာမှု ခွဲခြမ်းစိတ်ဖြာမှု",
  performanceDistributionTitle: "Performance Rating Distribution",
  performanceDistributionTitleMyanmar: "စွမ်းရည်အဆင့်သတ်မှတ်ချက် ဖြန့်ဝေမှု",
  trainingDevelopmentTitle: "Training & Development",
  trainingDevelopmentTitleMyanmar: "လေ့ကျင့်ရေး နှင့် ဖွံ့ဖြိုးတိုးတက်မှု",

  // Quick Actions
  quickActionsTitle: "Quick Actions",
  quickActionsTitleMyanmar: "မြန်ဆန်သော လုပ်ဆောင်ချက်များ",
  addPersonnelAction: "Add Personnel",
  addPersonnelActionMyanmar: "ဝန်ထမ်းအသစ်ထည့်ရန်",
  attendanceRecordAction: "Attendance Records",
  attendanceRecordActionMyanmar: "လက်ရှိမှုမှတ်တမ်း",
  leaveManagementAction: "Leave Management",
  leaveManagementActionMyanmar: "လပ်ရက်စီမံခန့်ခွဲမှု",
  payrollAction: "Payroll Records",
  payrollActionMyanmar: "လစာစာရင်းများ",

  // Color Theme
  primaryColor: "#dc2626",
  secondaryColor: "#b91c1c",
  accentColor: "#059669",
  backgroundColor: "#f3f4f6",
};

export const AdminSettings: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = useTranslation();

  const [customization, setCustomization] =
    useState<DashboardCustomization>(defaultCustomization);
  const [activeTab, setActiveTab] = useState("branding");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved customization on component mount
  useEffect(() => {
    const loadCustomization = async () => {
      try {
        // First try to load from Firebase
        const firebaseCustomization =
          await CustomizationService.getCustomization();
        if (firebaseCustomization) {
          setCustomization({
            ...defaultCustomization,
            ...firebaseCustomization,
          });
          // Sync with localStorage for backward compatibility
          localStorage.setItem(
            "dashboard-customization",
            JSON.stringify(firebaseCustomization),
          );
        } else {
          // Fallback to localStorage if Firebase data doesn't exist
          const saved = localStorage.getItem("dashboard-customization");
          if (saved) {
            const parsed = JSON.parse(saved);
            setCustomization({ ...defaultCustomization, ...parsed });
            // Save to Firebase for future use
            await CustomizationService.saveCustomization({
              ...defaultCustomization,
              ...parsed,
            });
          }
        }
      } catch (error) {
        console.error("Failed to load customization:", error);
        // Fallback to localStorage
        const saved = localStorage.getItem("dashboard-customization");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCustomization({ ...defaultCustomization, ...parsed });
          } catch (parseError) {
            console.error(
              "Failed to parse localStorage customization:",
              parseError,
            );
          }
        }
      }
    };

    loadCustomization();
  }, []);

  // Handle input changes
  const handleInputChange = (
    field: keyof DashboardCustomization,
    value: string,
  ) => {
    setCustomization((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  // Save customization
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to Firebase first
      await CustomizationService.saveCustomization(customization);

      // Also save to localStorage for offline access
      localStorage.setItem(
        "dashboard-customization",
        JSON.stringify(customization),
      );

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("dashboard-customization-updated", {
          detail: customization,
        }),
      );

      setHasChanges(false);
      // Show success message
      alert("Settings saved successfully to database!");
    } catch (error) {
      console.error("Failed to save customization:", error);
      // Try to save to localStorage as fallback
      try {
        localStorage.setItem(
          "dashboard-customization",
          JSON.stringify(customization),
        );
        alert(
          "Settings saved locally (database connection failed). Changes will sync when connection is restored.",
        );
        setHasChanges(false);
      } catch (localError) {
        alert("Failed to save settings. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all customizations to default values?",
      )
    ) {
      setCustomization(defaultCustomization);
      setHasChanges(true);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleInputChange("logoUrl", result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Admin Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Customize dashboard appearance and content
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
              disabled={isSaving}
            >
              <RefreshCw className="h-4 w-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Quick Management Links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/income-category-settings">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <DollarSign className="w-6 h-6" />
                  <span className="text-sm font-medium">Income Categories</span>
                  <span className="text-xs text-gray-500">
                    Manage income types and categories
                  </span>
                </Button>
              </Link>
              <Link to="/personnel-list">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm font-medium">
                    Personnel Management
                  </span>
                  <span className="text-xs text-gray-500">
                    Manage staff records
                  </span>
                </Button>
              </Link>
              <Link to="/department-management">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 border-myanmar-red/30 hover:bg-myanmar-red hover:text-white"
                >
                  <Building className="w-6 h-6" />
                  <span className="text-sm font-medium">
                    Department Settings
                  </span>
                  <span className="text-xs text-gray-500">
                    Manage departments
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="branding">
              <Image className="h-4 w-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <Settings className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Type className="h-4 w-4 mr-2" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="charts">
              <Type className="h-4 w-4 mr-2" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="h-4 w-4 mr-2" />
              Theme
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appName">App Name (English)</Label>
                    <Input
                      id="appName"
                      value={customization.appName}
                      onChange={(e) =>
                        handleInputChange("appName", e.target.value)
                      }
                      placeholder="PDF-Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="appNameMyanmar">App Name (Myanmar)</Label>
                    <Input
                      id="appNameMyanmar"
                      value={customization.appNameMyanmar}
                      onChange={(e) =>
                        handleInputChange("appNameMyanmar", e.target.value)
                      }
                      placeholder="ပကဖ-နည်းပညာ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subtitle">Subtitle (English)</Label>
                    <Input
                      id="subtitle"
                      value={customization.subtitle}
                      onChange={(e) =>
                        handleInputChange("subtitle", e.target.value)
                      }
                      placeholder="People's Defense Force Technology Workshop"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitleMyanmar">Subtitle (Myanmar)</Label>
                    <Input
                      id="subtitleMyanmar"
                      value={customization.subtitleMyanmar}
                      onChange={(e) =>
                        handleInputChange("subtitleMyanmar", e.target.value)
                      }
                      placeholder="ပြည်သူ့ကာကွယ်��ေးတပ်ဖွဲ့ နည်းပညာလက်ရုံးတပ်"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logoEmoji">Logo Emoji</Label>
                    <Input
                      id="logoEmoji"
                      value={customization.logoEmoji}
                      onChange={(e) =>
                        handleInputChange("logoEmoji", e.target.value)
                      }
                      placeholder="✊"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoUpload">Logo Image (Optional)</Label>
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    {customization.logoUrl && (
                      <img
                        src={customization.logoUrl}
                        alt="Logo preview"
                        className="mt-2 h-16 w-16 object-contain border rounded"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dashboardTitle">
                      Dashboard Title (English)
                    </Label>
                    <Input
                      id="dashboardTitle"
                      value={customization.dashboardTitle}
                      onChange={(e) =>
                        handleInputChange("dashboardTitle", e.target.value)
                      }
                      placeholder="HR Management System"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dashboardTitleMyanmar">
                      Dashboard Title (Myanmar)
                    </Label>
                    <Input
                      id="dashboardTitleMyanmar"
                      value={customization.dashboardTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "dashboardTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="HR မန်နေဂျာမင့် စနစ်"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dashboardSubtitle">
                      Dashboard Subtitle (English)
                    </Label>
                    <Input
                      id="dashboardSubtitle"
                      value={customization.dashboardSubtitle}
                      onChange={(e) =>
                        handleInputChange("dashboardSubtitle", e.target.value)
                      }
                      placeholder="Comprehensive Human Resource Management System"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dashboardSubtitleMyanmar">
                      Dashboard Subtitle (Myanmar)
                    </Label>
                    <Input
                      id="dashboardSubtitleMyanmar"
                      value={customization.dashboardSubtitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "dashboardSubtitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="ပြည့်စုံတဲ့ လူ့စွမ်းအားရင်းမြစ် စီမံခန့်ခွဲမှုစနစ်"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalPersonnelLabel">
                      Total Personnel (English)
                    </Label>
                    <Input
                      id="totalPersonnelLabel"
                      value={customization.totalPersonnelLabel}
                      onChange={(e) =>
                        handleInputChange("totalPersonnelLabel", e.target.value)
                      }
                      placeholder="Total Personnel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalPersonnelLabelMyanmar">
                      Total Personnel (Myanmar)
                    </Label>
                    <Input
                      id="totalPersonnelLabelMyanmar"
                      value={customization.totalPersonnelLabelMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "totalPersonnelLabelMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="စုစု��ေါင်း ဝန်ထမ်းများ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activePersonnelLabel">
                      Active Personnel (English)
                    </Label>
                    <Input
                      id="activePersonnelLabel"
                      value={customization.activePersonnelLabel}
                      onChange={(e) =>
                        handleInputChange(
                          "activePersonnelLabel",
                          e.target.value,
                        )
                      }
                      placeholder="Active Personnel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="activePersonnelLabelMyanmar">
                      Active Personnel (Myanmar)
                    </Label>
                    <Input
                      id="activePersonnelLabelMyanmar"
                      value={customization.activePersonnelLabelMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "activePersonnelLabelMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="လက်ရှိ အလုပ်လုပ်နေသူများ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="averageAttendanceLabel">
                      Average Attendance (English)
                    </Label>
                    <Input
                      id="averageAttendanceLabel"
                      value={customization.averageAttendanceLabel}
                      onChange={(e) =>
                        handleInputChange(
                          "averageAttendanceLabel",
                          e.target.value,
                        )
                      }
                      placeholder="Average Attendance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageAttendanceLabelMyanmar">
                      Average Attendance (Myanmar)
                    </Label>
                    <Input
                      id="averageAttendanceLabelMyanmar"
                      value={customization.averageAttendanceLabelMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "averageAttendanceLabelMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="ပျမ်းမျှ လက်ရှိမှုနှုန်း"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalPayrollLabel">
                      Total Payroll (English)
                    </Label>
                    <Input
                      id="totalPayrollLabel"
                      value={customization.totalPayrollLabel}
                      onChange={(e) =>
                        handleInputChange("totalPayrollLabel", e.target.value)
                      }
                      placeholder="Total Payroll"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalPayrollLabelMyanmar">
                      Total Payroll (Myanmar)
                    </Label>
                    <Input
                      id="totalPayrollLabelMyanmar"
                      value={customization.totalPayrollLabelMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "totalPayrollLabelMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="လစာစုစုပေါင်း"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Section Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pendingLeavesTitle">
                      Pending Leaves (English)
                    </Label>
                    <Input
                      id="pendingLeavesTitle"
                      value={customization.pendingLeavesTitle}
                      onChange={(e) =>
                        handleInputChange("pendingLeavesTitle", e.target.value)
                      }
                      placeholder="Leave Approvals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pendingLeavesTitleMyanmar">
                      Pending Leaves (Myanmar)
                    </Label>
                    <Input
                      id="pendingLeavesTitleMyanmar"
                      value={customization.pendingLeavesTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "pendingLeavesTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="လပ်ရက်အတည်ပြုရန်"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overdueReviewsTitle">
                      Overdue Reviews (English)
                    </Label>
                    <Input
                      id="overdueReviewsTitle"
                      value={customization.overdueReviewsTitle}
                      onChange={(e) =>
                        handleInputChange("overdueReviewsTitle", e.target.value)
                      }
                      placeholder="Overdue Reviews"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overdueReviewsTitleMyanmar">
                      Overdue Reviews (Myanmar)
                    </Label>
                    <Input
                      id="overdueReviewsTitleMyanmar"
                      value={customization.overdueReviewsTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "overdueReviewsTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="နောက်ကျနေသော သုံးသပ်ချက်များ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="upcomingBirthdaysTitle">
                      Upcoming Birthdays (English)
                    </Label>
                    <Input
                      id="upcomingBirthdaysTitle"
                      value={customization.upcomingBirthdaysTitle}
                      onChange={(e) =>
                        handleInputChange(
                          "upcomingBirthdaysTitle",
                          e.target.value,
                        )
                      }
                      placeholder="Upcoming Birthdays"
                    />
                  </div>
                  <div>
                    <Label htmlFor="upcomingBirthdaysTitleMyanmar">
                      Upcoming Birthdays (Myanmar)
                    </Label>
                    <Input
                      id="upcomingBirthdaysTitleMyanmar"
                      value={customization.upcomingBirthdaysTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "upcomingBirthdaysTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="မွေးနေ့များ လာမည်"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tab Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overviewTabLabel">
                      Overview Tab (English)
                    </Label>
                    <Input
                      id="overviewTabLabel"
                      value={customization.overviewTabLabel}
                      onChange={(e) =>
                        handleInputChange("overviewTabLabel", e.target.value)
                      }
                      placeholder="Overview"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overviewTabLabelMyanmar">
                      Overview Tab (Myanmar)
                    </Label>
                    <Input
                      id="overviewTabLabelMyanmar"
                      value={customization.overviewTabLabelMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "overviewTabLabelMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="ခြုံငုံကြည့်ရှုရန်"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="attendanceTabLabel">
                      Attendance Tab (English)
                    </Label>
                    <Input
                      id="attendanceTabLabel"
                      value={customization.attendanceTabLabel}
                      onChange={(e) =>
                        handleInputChange("attendanceTabLabel", e.target.value)
                      }
                      placeholder="Attendance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendanceTabLabelMyanmar">
                      Attendance Tab (Myanmar)
                    </Label>
                    <Input
                      id="attendanceTabLabelMyanmar"
                      value={customization.attendanceTabLabelMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "attendanceTabLabelMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="လက်ရှိမှု"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chart Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyAttendanceChartTitle">
                      Monthly Attendance Chart (English)
                    </Label>
                    <Input
                      id="monthlyAttendanceChartTitle"
                      value={customization.monthlyAttendanceChartTitle}
                      onChange={(e) =>
                        handleInputChange(
                          "monthlyAttendanceChartTitle",
                          e.target.value,
                        )
                      }
                      placeholder="Monthly Attendance Rate"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyAttendanceChartTitleMyanmar">
                      Monthly Attendance Chart (Myanmar)
                    </Label>
                    <Input
                      id="monthlyAttendanceChartTitleMyanmar"
                      value={customization.monthlyAttendanceChartTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "monthlyAttendanceChartTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="လစဉ် လက်ရှိမှုနှုန်း"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departmentDistributionTitle">
                      Department Distribution (English)
                    </Label>
                    <Input
                      id="departmentDistributionTitle"
                      value={customization.departmentDistributionTitle}
                      onChange={(e) =>
                        handleInputChange(
                          "departmentDistributionTitle",
                          e.target.value,
                        )
                      }
                      placeholder="Employee Distribution by Department"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departmentDistributionTitleMyanmar">
                      Department Distribution (Myanmar)
                    </Label>
                    <Input
                      id="departmentDistributionTitleMyanmar"
                      value={customization.departmentDistributionTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "departmentDistributionTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="ဌာနအလိုက် ဝန်ထမ်းဖြန့်ဝေမှု"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quickActionsTitle">
                      Quick Actions Title (English)
                    </Label>
                    <Input
                      id="quickActionsTitle"
                      value={customization.quickActionsTitle}
                      onChange={(e) =>
                        handleInputChange("quickActionsTitle", e.target.value)
                      }
                      placeholder="Quick Actions"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quickActionsTitleMyanmar">
                      Quick Actions Title (Myanmar)
                    </Label>
                    <Input
                      id="quickActionsTitleMyanmar"
                      value={customization.quickActionsTitleMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "quickActionsTitleMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="မြန်ဆန်သော လုပ်ဆောင်ချက်များ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="addPersonnelAction">
                      Add Personnel (English)
                    </Label>
                    <Input
                      id="addPersonnelAction"
                      value={customization.addPersonnelAction}
                      onChange={(e) =>
                        handleInputChange("addPersonnelAction", e.target.value)
                      }
                      placeholder="Add Personnel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addPersonnelActionMyanmar">
                      Add Personnel (Myanmar)
                    </Label>
                    <Input
                      id="addPersonnelActionMyanmar"
                      value={customization.addPersonnelActionMyanmar}
                      onChange={(e) =>
                        handleInputChange(
                          "addPersonnelActionMyanmar",
                          e.target.value,
                        )
                      }
                      placeholder="ဝန်ထမ်းအသစ်ထည့်ရန်"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={customization.primaryColor}
                        onChange={(e) =>
                          handleInputChange("primaryColor", e.target.value)
                        }
                        className="w-16"
                      />
                      <Input
                        value={customization.primaryColor}
                        onChange={(e) =>
                          handleInputChange("primaryColor", e.target.value)
                        }
                        placeholder="#dc2626"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={customization.secondaryColor}
                        onChange={(e) =>
                          handleInputChange("secondaryColor", e.target.value)
                        }
                        className="w-16"
                      />
                      <Input
                        value={customization.secondaryColor}
                        onChange={(e) =>
                          handleInputChange("secondaryColor", e.target.value)
                        }
                        placeholder="#b91c1c"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={customization.accentColor}
                        onChange={(e) =>
                          handleInputChange("accentColor", e.target.value)
                        }
                        className="w-16"
                      />
                      <Input
                        value={customization.accentColor}
                        onChange={(e) =>
                          handleInputChange("accentColor", e.target.value)
                        }
                        placeholder="#059669"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={customization.backgroundColor}
                        onChange={(e) =>
                          handleInputChange("backgroundColor", e.target.value)
                        }
                        className="w-16"
                      />
                      <Input
                        value={customization.backgroundColor}
                        onChange={(e) =>
                          handleInputChange("backgroundColor", e.target.value)
                        }
                        placeholder="#f3f4f6"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg border space-y-2">
                  <div
                    className="text-xl font-bold"
                    style={{ color: customization.primaryColor }}
                  >
                    {currentLanguage === "mm"
                      ? customization.dashboardTitleMyanmar
                      : customization.dashboardTitle}
                  </div>
                  <div className="text-gray-600">
                    {currentLanguage === "mm"
                      ? customization.dashboardSubtitleMyanmar
                      : customization.dashboardSubtitle}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: customization.primaryColor }}
                    ></div>
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: customization.secondaryColor }}
                    ></div>
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: customization.accentColor }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;
