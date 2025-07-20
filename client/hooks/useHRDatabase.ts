import { useState, useEffect, useCallback } from "react";
import {
  PositionService,
  DepartmentService,
  PerformanceService,
  AttendanceService,
  LeaveService,
  TrainingService,
  DocumentService,
  PayrollService,
  CustomizationService,
} from "../services/hrDatabase";
import {
  Position,
  Department,
  PerformanceReview,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  Training,
  EmployeeDocument,
  PayrollRecord,
} from "../../shared/hr-system";
import { DashboardCustomization } from "./useDashboardCustomization";

// Loading states interface
interface LoadingStates {
  positions: boolean;
  departments: boolean;
  performance: boolean;
  attendance: boolean;
  leaves: boolean;
  trainings: boolean;
  documents: boolean;
  payroll: boolean;
  customization: boolean;
}

// Error states interface
interface ErrorStates {
  positions: string | null;
  departments: string | null;
  performance: string | null;
  attendance: string | null;
  leaves: string | null;
  trainings: string | null;
  documents: string | null;
  payroll: string | null;
  customization: string | null;
}

export const useHRDatabase = () => {
  // Data states
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<
    PerformanceReview[]
  >([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [customization, setCustomization] =
    useState<DashboardCustomization | null>(null);

  // Loading states
  const [loading, setLoading] = useState<LoadingStates>({
    positions: false,
    departments: false,
    performance: false,
    attendance: false,
    leaves: false,
    trainings: false,
    documents: false,
    payroll: false,
    customization: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorStates>({
    positions: null,
    departments: null,
    performance: null,
    attendance: null,
    leaves: null,
    trainings: null,
    documents: null,
    payroll: null,
    customization: null,
  });

  // Helper function to update loading state
  const setLoadingState = (key: keyof LoadingStates, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };

  // Helper function to update error state
  const setErrorState = (key: keyof ErrorStates, value: string | null) => {
    setErrors((prev) => ({ ...prev, [key]: value }));
  };

  // Position operations
  const loadPositions = useCallback(async () => {
    setLoadingState("positions", true);
    setErrorState("positions", null);
    try {
      const data = await PositionService.getPositions();
      setPositions(data);
    } catch (error: any) {
      setErrorState("positions", error.message);
    } finally {
      setLoadingState("positions", false);
    }
  }, []);

  const addPosition = useCallback(
    async (position: Omit<Position, "id">) => {
      try {
        const id = await PositionService.addPosition(position);
        await loadPositions(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPositions],
  );

  const updatePosition = useCallback(
    async (id: string, position: Partial<Position>) => {
      try {
        await PositionService.updatePosition(id, position);
        await loadPositions(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPositions],
  );

  const deletePosition = useCallback(
    async (id: string) => {
      try {
        await PositionService.deletePosition(id);
        await loadPositions(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPositions],
  );

  // Department operations
  const loadDepartments = useCallback(async () => {
    setLoadingState("departments", true);
    setErrorState("departments", null);
    try {
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
    } catch (error: any) {
      setErrorState("departments", error.message);
    } finally {
      setLoadingState("departments", false);
    }
  }, []);

  const addDepartment = useCallback(
    async (department: Omit<Department, "id">) => {
      try {
        const id = await DepartmentService.addDepartment(department);
        await loadDepartments(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadDepartments],
  );

  const updateDepartment = useCallback(
    async (id: string, department: Partial<Department>) => {
      try {
        await DepartmentService.updateDepartment(id, department);
        await loadDepartments(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadDepartments],
  );

  const deleteDepartment = useCallback(
    async (id: string) => {
      try {
        await DepartmentService.deleteDepartment(id);
        await loadDepartments(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadDepartments],
  );

  // Performance operations
  const loadPerformanceReviews = useCallback(async () => {
    setLoadingState("performance", true);
    setErrorState("performance", null);
    try {
      const data = await PerformanceService.getPerformanceReviews();
      setPerformanceReviews(data);
    } catch (error: any) {
      setErrorState("performance", error.message);
    } finally {
      setLoadingState("performance", false);
    }
  }, []);

  const addPerformanceReview = useCallback(
    async (review: Omit<PerformanceReview, "id">) => {
      try {
        const id = await PerformanceService.addPerformanceReview(review);
        await loadPerformanceReviews(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPerformanceReviews],
  );

  const updatePerformanceReview = useCallback(
    async (id: string, review: Partial<PerformanceReview>) => {
      try {
        await PerformanceService.updatePerformanceReview(id, review);
        await loadPerformanceReviews(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPerformanceReviews],
  );

  const deletePerformanceReview = useCallback(
    async (id: string) => {
      try {
        await PerformanceService.deletePerformanceReview(id);
        await loadPerformanceReviews(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPerformanceReviews],
  );

  // Attendance operations
  const loadAttendanceRecords = useCallback(
    async (employeeId?: string, startDate?: string, endDate?: string) => {
      setLoadingState("attendance", true);
      setErrorState("attendance", null);
      try {
        const data = await AttendanceService.getAttendanceRecords(
          employeeId,
          startDate,
          endDate,
        );
        setAttendanceRecords(data);
      } catch (error: any) {
        setErrorState("attendance", error.message);
      } finally {
        setLoadingState("attendance", false);
      }
    },
    [],
  );

  const clockIn = useCallback(
    async (employeeId: string, location?: string) => {
      try {
        const id = await AttendanceService.clockIn(employeeId, location);
        await loadAttendanceRecords(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadAttendanceRecords],
  );

  const clockOut = useCallback(
    async (recordId: string, location?: string) => {
      try {
        await AttendanceService.clockOut(recordId, location);
        await loadAttendanceRecords(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadAttendanceRecords],
  );

  // Leave operations
  const loadLeaveRequests = useCallback(async (employeeId?: string) => {
    setLoadingState("leaves", true);
    setErrorState("leaves", null);
    try {
      const data = await LeaveService.getLeaveRequests(employeeId);
      setLeaveRequests(data);
    } catch (error: any) {
      setErrorState("leaves", error.message);
    } finally {
      setLoadingState("leaves", false);
    }
  }, []);

  const addLeaveRequest = useCallback(
    async (request: Omit<LeaveRequest, "id">) => {
      try {
        const id = await LeaveService.addLeaveRequest(request);
        await loadLeaveRequests(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadLeaveRequests],
  );

  const updateLeaveRequest = useCallback(
    async (id: string, request: Partial<LeaveRequest>) => {
      try {
        await LeaveService.updateLeaveRequest(id, request);
        await loadLeaveRequests(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadLeaveRequests],
  );

  // Training operations
  const loadTrainings = useCallback(async () => {
    setLoadingState("trainings", true);
    setErrorState("trainings", null);
    try {
      const data = await TrainingService.getTrainings();
      setTrainings(data);
    } catch (error: any) {
      setErrorState("trainings", error.message);
    } finally {
      setLoadingState("trainings", false);
    }
  }, []);

  const addTraining = useCallback(
    async (training: Omit<Training, "id">) => {
      try {
        const id = await TrainingService.addTraining(training);
        await loadTrainings(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadTrainings],
  );

  const updateTraining = useCallback(
    async (id: string, training: Partial<Training>) => {
      try {
        await TrainingService.updateTraining(id, training);
        await loadTrainings(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadTrainings],
  );

  const deleteTraining = useCallback(
    async (id: string) => {
      try {
        await TrainingService.deleteTraining(id);
        await loadTrainings(); // Reload to get updated data
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadTrainings],
  );

  // Payroll operations
  const loadPayrollRecords = useCallback(async (employeeId?: string) => {
    setLoadingState("payroll", true);
    setErrorState("payroll", null);
    try {
      const data = await PayrollService.getPayrollRecords(employeeId);
      setPayrollRecords(data);
    } catch (error: any) {
      setErrorState("payroll", error.message);
    } finally {
      setLoadingState("payroll", false);
    }
  }, []);

  const addPayrollRecord = useCallback(
    async (record: Omit<PayrollRecord, "id">) => {
      try {
        const id = await PayrollService.addPayrollRecord(record);
        await loadPayrollRecords(); // Reload to get updated data
        return id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [loadPayrollRecords],
  );

  // Customization operations
  const loadCustomization = useCallback(async () => {
    setLoadingState("customization", true);
    setErrorState("customization", null);
    try {
      const data = await CustomizationService.getCustomization();
      setCustomization(data);
    } catch (error: any) {
      setErrorState("customization", error.message);
    } finally {
      setLoadingState("customization", false);
    }
  }, []);

  const saveCustomization = useCallback(
    async (customization: DashboardCustomization) => {
      try {
        await CustomizationService.saveCustomization(customization);
        setCustomization(customization);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
    [],
  );

  // Load initial data on mount
  useEffect(() => {
    loadPositions();
    loadDepartments();
    loadPerformanceReviews();
    loadAttendanceRecords();
    loadLeaveRequests();
    loadTrainings();
    loadPayrollRecords();
    loadCustomization();
  }, [
    loadPositions,
    loadDepartments,
    loadPerformanceReviews,
    loadAttendanceRecords,
    loadLeaveRequests,
    loadTrainings,
    loadPayrollRecords,
    loadCustomization,
  ]);

  return {
    // Data
    positions,
    departments,
    performanceReviews,
    attendanceRecords,
    leaveRequests,
    leaveBalances,
    trainings,
    documents,
    payrollRecords,
    customization,

    // Loading states
    loading,

    // Error states
    errors,

    // Position operations
    loadPositions,
    addPosition,
    updatePosition,
    deletePosition,

    // Department operations
    loadDepartments,
    addDepartment,
    updateDepartment,
    deleteDepartment,

    // Performance operations
    loadPerformanceReviews,
    addPerformanceReview,
    updatePerformanceReview,
    deletePerformanceReview,

    // Attendance operations
    loadAttendanceRecords,
    clockIn,
    clockOut,

    // Leave operations
    loadLeaveRequests,
    addLeaveRequest,
    updateLeaveRequest,

    // Training operations
    loadTrainings,
    addTraining,
    updateTraining,
    deleteTraining,

    // Payroll operations
    loadPayrollRecords,
    addPayrollRecord,

    // Customization operations
    loadCustomization,
    saveCustomization,
  };
};
