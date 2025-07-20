import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
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
import { DashboardCustomization } from "../hooks/useDashboardCustomization";

// Collection references
export const positionsCollection = collection(db, "positions");
export const departmentsCollection = collection(db, "departments");
export const performanceReviewsCollection = collection(
  db,
  "performanceReviews",
);
export const attendanceCollection = collection(db, "attendance");
export const leaveRequestsCollection = collection(db, "leaveRequests");
export const leaveBalancesCollection = collection(db, "leaveBalances");
export const trainingsCollection = collection(db, "trainings");
export const documentsCollection = collection(db, "documents");
export const payrollCollection = collection(db, "payroll");
export const customizationCollection = collection(db, "customization");

// Helper function to sanitize data for Firestore
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      }
    }
    return sanitized;
  }

  return obj;
}

// Position Service
export class PositionService {
  static async getPositions(): Promise<Position[]> {
    try {
      const q = query(positionsCollection, orderBy("level", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Position,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch positions: ${error.message}`);
    }
  }

  static async getPositionById(id: string): Promise<Position | null> {
    try {
      const docRef = doc(positionsCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Position;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch position: ${error.message}`);
    }
  }

  static async addPosition(position: Omit<Position, "id">): Promise<string> {
    try {
      const sanitizedPosition = sanitizeForFirestore(position);
      const docRef = await addDoc(positionsCollection, sanitizedPosition);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add position: ${error.message}`);
    }
  }

  static async updatePosition(
    id: string,
    position: Partial<Position>,
  ): Promise<void> {
    try {
      const docRef = doc(positionsCollection, id);
      const sanitizedPosition = sanitizeForFirestore(position);
      await updateDoc(docRef, sanitizedPosition);
    } catch (error: any) {
      throw new Error(`Failed to update position: ${error.message}`);
    }
  }

  static async deletePosition(id: string): Promise<void> {
    try {
      const docRef = doc(positionsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete position: ${error.message}`);
    }
  }
}

// Department Service
export class DepartmentService {
  static async getDepartments(): Promise<Department[]> {
    try {
      const q = query(departmentsCollection, orderBy("name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Department,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch departments: ${error.message}`);
    }
  }

  static async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const docRef = doc(departmentsCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Department;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch department: ${error.message}`);
    }
  }

  static async addDepartment(
    department: Omit<Department, "id">,
  ): Promise<string> {
    try {
      const sanitizedDepartment = sanitizeForFirestore(department);
      const docRef = await addDoc(departmentsCollection, sanitizedDepartment);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add department: ${error.message}`);
    }
  }

  static async updateDepartment(
    id: string,
    department: Partial<Department>,
  ): Promise<void> {
    try {
      const docRef = doc(departmentsCollection, id);
      const sanitizedDepartment = sanitizeForFirestore(department);
      await updateDoc(docRef, sanitizedDepartment);
    } catch (error: any) {
      throw new Error(`Failed to update department: ${error.message}`);
    }
  }

  static async deleteDepartment(id: string): Promise<void> {
    try {
      const docRef = doc(departmentsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete department: ${error.message}`);
    }
  }
}

// Performance Review Service
export class PerformanceService {
  static async getPerformanceReviews(): Promise<PerformanceReview[]> {
    try {
      const q = query(
        performanceReviewsCollection,
        orderBy("updatedAt", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as PerformanceReview,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch performance reviews: ${error.message}`);
    }
  }

  static async getPerformanceReviewsByEmployee(
    employeeId: string,
  ): Promise<PerformanceReview[]> {
    try {
      const q = query(
        performanceReviewsCollection,
        where("employeeId", "==", employeeId),
        orderBy("updatedAt", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as PerformanceReview,
      );
    } catch (error: any) {
      throw new Error(
        `Failed to fetch employee performance reviews: ${error.message}`,
      );
    }
  }

  static async addPerformanceReview(
    review: Omit<PerformanceReview, "id">,
  ): Promise<string> {
    try {
      const sanitizedReview = sanitizeForFirestore(review);
      const docRef = await addDoc(
        performanceReviewsCollection,
        sanitizedReview,
      );
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add performance review: ${error.message}`);
    }
  }

  static async updatePerformanceReview(
    id: string,
    review: Partial<PerformanceReview>,
  ): Promise<void> {
    try {
      const docRef = doc(performanceReviewsCollection, id);
      const sanitizedReview = sanitizeForFirestore(review);
      await updateDoc(docRef, sanitizedReview);
    } catch (error: any) {
      throw new Error(`Failed to update performance review: ${error.message}`);
    }
  }

  static async deletePerformanceReview(id: string): Promise<void> {
    try {
      const docRef = doc(performanceReviewsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete performance review: ${error.message}`);
    }
  }
}

// Attendance Service
export class AttendanceService {
  static async getAttendanceRecords(
    employeeId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<AttendanceRecord[]> {
    try {
      let q = query(attendanceCollection, orderBy("date", "desc"));

      if (employeeId) {
        q = query(q, where("employeeId", "==", employeeId));
      }

      const snapshot = await getDocs(q);
      let records = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as AttendanceRecord,
      );

      // Filter by date range if provided
      if (startDate || endDate) {
        records = records.filter((record) => {
          const recordDate = record.date;
          if (startDate && recordDate < startDate) return false;
          if (endDate && recordDate > endDate) return false;
          return true;
        });
      }

      return records;
    } catch (error: any) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }
  }

  static async addAttendanceRecord(
    record: Omit<AttendanceRecord, "id">,
  ): Promise<string> {
    try {
      const sanitizedRecord = sanitizeForFirestore(record);
      const docRef = await addDoc(attendanceCollection, sanitizedRecord);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add attendance record: ${error.message}`);
    }
  }

  static async updateAttendanceRecord(
    id: string,
    record: Partial<AttendanceRecord>,
  ): Promise<void> {
    try {
      const docRef = doc(attendanceCollection, id);
      const sanitizedRecord = sanitizeForFirestore(record);
      await updateDoc(docRef, sanitizedRecord);
    } catch (error: any) {
      throw new Error(`Failed to update attendance record: ${error.message}`);
    }
  }

  static async clockIn(employeeId: string, location?: string): Promise<string> {
    const now = new Date();
    const record: Omit<AttendanceRecord, "id"> = {
      employeeId,
      date: now.toISOString().split("T")[0],
      checkIn: now.toISOString(),
      status: "present",
      location,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    return this.addAttendanceRecord(record);
  }

  static async clockOut(recordId: string, location?: string): Promise<void> {
    const now = new Date();
    await this.updateAttendanceRecord(recordId, {
      checkOut: now.toISOString(),
      location,
      updatedAt: now.toISOString(),
    });
  }
}

// Leave Request Service
export class LeaveService {
  static async getLeaveRequests(employeeId?: string): Promise<LeaveRequest[]> {
    try {
      let q = query(leaveRequestsCollection, orderBy("appliedDate", "desc"));

      if (employeeId) {
        q = query(q, where("employeeId", "==", employeeId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as LeaveRequest,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch leave requests: ${error.message}`);
    }
  }

  static async addLeaveRequest(
    request: Omit<LeaveRequest, "id">,
  ): Promise<string> {
    try {
      const sanitizedRequest = sanitizeForFirestore(request);
      const docRef = await addDoc(leaveRequestsCollection, sanitizedRequest);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add leave request: ${error.message}`);
    }
  }

  static async updateLeaveRequest(
    id: string,
    request: Partial<LeaveRequest>,
  ): Promise<void> {
    try {
      const docRef = doc(leaveRequestsCollection, id);
      const sanitizedRequest = sanitizeForFirestore(request);
      await updateDoc(docRef, sanitizedRequest);
    } catch (error: any) {
      throw new Error(`Failed to update leave request: ${error.message}`);
    }
  }

  static async getLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    try {
      const q = query(
        leaveBalancesCollection,
        where("employeeId", "==", employeeId),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as LeaveBalance,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch leave balances: ${error.message}`);
    }
  }

  static async updateLeaveBalance(
    id: string,
    balance: Partial<LeaveBalance>,
  ): Promise<void> {
    try {
      const docRef = doc(leaveBalancesCollection, id);
      const sanitizedBalance = sanitizeForFirestore(balance);
      await updateDoc(docRef, sanitizedBalance);
    } catch (error: any) {
      throw new Error(`Failed to update leave balance: ${error.message}`);
    }
  }
}

// Training Service
export class TrainingService {
  static async getTrainings(): Promise<Training[]> {
    try {
      const q = query(trainingsCollection, orderBy("startDate", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Training,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch trainings: ${error.message}`);
    }
  }

  static async addTraining(training: Omit<Training, "id">): Promise<string> {
    try {
      const sanitizedTraining = sanitizeForFirestore(training);
      const docRef = await addDoc(trainingsCollection, sanitizedTraining);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add training: ${error.message}`);
    }
  }

  static async updateTraining(
    id: string,
    training: Partial<Training>,
  ): Promise<void> {
    try {
      const docRef = doc(trainingsCollection, id);
      const sanitizedTraining = sanitizeForFirestore(training);
      await updateDoc(docRef, sanitizedTraining);
    } catch (error: any) {
      throw new Error(`Failed to update training: ${error.message}`);
    }
  }

  static async deleteTraining(id: string): Promise<void> {
    try {
      const docRef = doc(trainingsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete training: ${error.message}`);
    }
  }
}

// Document Service
export class DocumentService {
  static async getEmployeeDocuments(
    employeeId: string,
  ): Promise<EmployeeDocument[]> {
    try {
      const q = query(
        documentsCollection,
        where("employeeId", "==", employeeId),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as EmployeeDocument,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch employee documents: ${error.message}`);
    }
  }

  static async addDocument(
    document: Omit<EmployeeDocument, "id">,
  ): Promise<string> {
    try {
      const sanitizedDocument = sanitizeForFirestore(document);
      const docRef = await addDoc(documentsCollection, sanitizedDocument);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add document: ${error.message}`);
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const docRef = doc(documentsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }
}

// Payroll Service
export class PayrollService {
  static async getPayrollRecords(
    employeeId?: string,
  ): Promise<PayrollRecord[]> {
    try {
      let q = query(payrollCollection, orderBy("payPeriod.end", "desc"));

      if (employeeId) {
        q = query(q, where("employeeId", "==", employeeId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as PayrollRecord,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch payroll records: ${error.message}`);
    }
  }

  static async addPayrollRecord(
    record: Omit<PayrollRecord, "id">,
  ): Promise<string> {
    try {
      const sanitizedRecord = sanitizeForFirestore(record);
      const docRef = await addDoc(payrollCollection, sanitizedRecord);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add payroll record: ${error.message}`);
    }
  }

  static async updatePayrollRecord(
    id: string,
    record: Partial<PayrollRecord>,
  ): Promise<void> {
    try {
      const docRef = doc(payrollCollection, id);
      const sanitizedRecord = sanitizeForFirestore(record);
      await updateDoc(docRef, sanitizedRecord);
    } catch (error: any) {
      throw new Error(`Failed to update payroll record: ${error.message}`);
    }
  }
}

// Dashboard Customization Service
export class CustomizationService {
  static async getCustomization(): Promise<DashboardCustomization | null> {
    try {
      const docRef = doc(customizationCollection, "dashboard");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as DashboardCustomization;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch customization: ${error.message}`);
    }
  }

  static async saveCustomization(
    customization: DashboardCustomization,
  ): Promise<void> {
    try {
      const docRef = doc(customizationCollection, "dashboard");
      const sanitizedCustomization = sanitizeForFirestore(customization);

      // Check if document exists
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(docRef, sanitizedCustomization);
      } else {
        // Create new document with specific ID
        const { setDoc } = await import("firebase/firestore");
        await setDoc(docRef, sanitizedCustomization);
      }
    } catch (error: any) {
      throw new Error(`Failed to save customization: ${error.message}`);
    }
  }
}

// Bulk Operations Service
export class BulkOperationsService {
  static async bulkUpdatePositions(positions: Position[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      positions.forEach((position) => {
        const docRef = doc(positionsCollection, position.id);
        const sanitizedPosition = sanitizeForFirestore(position);
        batch.update(docRef, sanitizedPosition);
      });
      await batch.commit();
    } catch (error: any) {
      throw new Error(`Failed to bulk update positions: ${error.message}`);
    }
  }

  static async bulkUpdateDepartments(departments: Department[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      departments.forEach((department) => {
        const docRef = doc(departmentsCollection, department.id);
        const sanitizedDepartment = sanitizeForFirestore(department);
        batch.update(docRef, sanitizedDepartment);
      });
      await batch.commit();
    } catch (error: any) {
      throw new Error(`Failed to bulk update departments: ${error.message}`);
    }
  }
}
