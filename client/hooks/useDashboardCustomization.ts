import { useState, useEffect } from "react";

// Interface for dashboard customization settings
export interface DashboardCustomization {
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
  averageAttendanceLabelMyanmar: "ပျမ်းမျှ လက်ရှိမှုနှုန်း",
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

export const useDashboardCustomization = () => {
  const [customization, setCustomization] =
    useState<DashboardCustomization>(defaultCustomization);

  useEffect(() => {
    // Load saved customization from localStorage
    const saved = localStorage.getItem("dashboard-customization");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomization({ ...defaultCustomization, ...parsed });
      } catch (error) {
        console.error("Failed to load customization:", error);
      }
    }

    // Listen for customization updates
    const handleCustomizationUpdate = (event: CustomEvent) => {
      setCustomization(event.detail);
    };

    window.addEventListener(
      "dashboard-customization-updated",
      handleCustomizationUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "dashboard-customization-updated",
        handleCustomizationUpdate as EventListener,
      );
    };
  }, []);

  // Helper function to get text based on current language
  const getText = (
    englishKey: keyof DashboardCustomization,
    myanmarKey: keyof DashboardCustomization,
    currentLanguage: string,
  ): string => {
    return currentLanguage === "mm"
      ? (customization[myanmarKey] as string)
      : (customization[englishKey] as string);
  };

  return {
    customization,
    getText,
  };
};
