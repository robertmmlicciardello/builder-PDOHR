import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { LanguageProvider } from "./context/LanguageContext";
import Login from "./pages/Login";
import SecureLogin from "./pages/SecureLogin";
import SimpleLogin from "./pages/SimpleLogin";
import DemoLogin from "./pages/DemoLogin";
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/HRDashboard";
import AttendanceSystem from "./pages/AttendanceSystem";
import LeaveManagement from "./pages/LeaveManagement";
import PositionManagement from "./pages/PositionManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import PerformanceManagement from "./pages/PerformanceManagement";
import AdminSettings from "./pages/AdminSettings";
import IncomeManagement from "./pages/IncomeManagement";
import FinancialManagement from "./pages/FinancialManagement";
import IncomeCategorySettings from "./pages/IncomeCategorySettings";
import OutcomeCategorySettings from "./pages/OutcomeCategorySettings";
import MeetingManagement from "./pages/MeetingManagement";
import SecurityDashboard from "./pages/SecurityDashboard";
import PersonnelForm from "./pages/PersonnelForm";
import PersonnelList from "./pages/PersonnelList";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import GovernmentPayScaleManagement from "./pages/GovernmentPayScaleManagement";
import ServiceRecordManagement from "./pages/ServiceRecordManagement";
import ApprovalWorkflowManagement from "./pages/ApprovalWorkflowManagement";
import { ProtectedRoute } from "./components/SecurityWrapper";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  if (!state.user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  if (state.user?.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <PublicRoute>
          <Navigate to="/login" replace />
        </PublicRoute>
      }
    />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <DemoLogin />
        </PublicRoute>
      }
    />
    <Route
      path="/legacy-login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/simple-login"
      element={
        <PublicRoute>
          <SimpleLogin />
        </PublicRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute minSecurityLevel="medium">
          <HRDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/hr-dashboard"
      element={
        <ProtectedRoute>
          <HRDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/attendance"
      element={
        <ProtectedRoute>
          <AttendanceSystem />
        </ProtectedRoute>
      }
    />
    <Route
      path="/leave-management"
      element={
        <ProtectedRoute>
          <LeaveManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/position-management"
      element={
        <ProtectedRoute>
          <PositionManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/department-management"
      element={
        <ProtectedRoute>
          <DepartmentManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/performance"
      element={
        <ProtectedRoute>
          <PerformanceManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin-settings"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_settings"]}
        >
          <AdminSettings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/income-management"
      element={
        <ProtectedRoute>
          <IncomeManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/financial-management"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_finances"]}
        >
          <FinancialManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/income-category-settings"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_settings"]}
        >
          <IncomeCategorySettings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/outcome-category-settings"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_settings"]}
        >
          <OutcomeCategorySettings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/meeting-management"
      element={
        <ProtectedRoute>
          <MeetingManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/security-dashboard"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_security", "view_audit_logs"]}
        >
          <SecurityDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/old-dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/personnel-list"
      element={
        <ProtectedRoute>
          <PersonnelList />
        </ProtectedRoute>
      }
    />
    <Route
      path="/add-personnel"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_personnel"]}
        >
          <PersonnelForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit-personnel/:id"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_personnel"]}
        >
          <PersonnelForm />
        </ProtectedRoute>
      }
    />
    <Route
      path="/reports"
      element={
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      }
    />
    <Route
      path="/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/government-pay-scale"
      element={
        <ProtectedRoute
          requiredRole="admin"
          minSecurityLevel="high"
          requiredPermissions={["manage_pay_scales"]}
        >
          <GovernmentPayScaleManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/service-records"
      element={
        <ProtectedRoute
          minSecurityLevel="medium"
          requiredPermissions={["view_service_records"]}
        >
          <ServiceRecordManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/service-records/:personnelId"
      element={
        <ProtectedRoute
          minSecurityLevel="medium"
          requiredPermissions={["view_service_records"]}
        >
          <ServiceRecordManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/approval-workflows"
      element={
        <ProtectedRoute
          minSecurityLevel="medium"
          requiredPermissions={["manage_approvals"]}
        >
          <ApprovalWorkflowManagement />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <LanguageProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AppProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
