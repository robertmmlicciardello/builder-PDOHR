// Comprehensive HR System Data Models

export interface Employee extends Personnel {
  // Basic Information
  employeeNumber: string; // EMP001, EMP002
  photoUrl?: string;
  personalEmail?: string;
  workEmail: string;
  phoneNumber: string;
  emergencyContact: EmergencyContact;

  // Employment Details
  department: string;
  position: string;
  manager?: string; // Employee ID of manager
  employmentType: EmploymentType;
  contractStartDate: string;
  contractEndDate?: string;
  probationEndDate?: string;

  // Address Information
  currentAddress: Address;
  permanentAddress: Address;

  // Financial Information
  baseSalary: number;
  currency: string;
  bankAccount?: BankAccount;

  // Status and Tracking
  workStatus: WorkStatus;
  lastWorkingDay?: string;
  terminationDate?: string;
  terminationReason?: TerminationReason;
  terminationNotes?: string;
  exitInterviewCompleted?: boolean;
  rehirable: boolean;

  // HR Specific Fields
  onboardingStatus: OnboardingStatus;
  performanceRating?: number; // 1-5 scale
  nextReviewDate?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
}

export interface Address {
  street: string;
  township: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchCode?: string;
}

// Attendance System
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // ISO datetime
  checkOut?: string; // ISO datetime
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtimeHours?: number;
  status: AttendanceStatus;
  location?: string; // GPS or office location
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSettings {
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    breakDuration: number; // minutes
  };
  weeklyHours: number;
  overtimeRate: number; // multiplier
  gracePeriod: number; // minutes
  autoClockOut: boolean;
}

// Leave Management
export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  documents?: string[]; // file URLs
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  year: number;
  leaveType: LeaveType;
  totalAllowance: number;
  used: number;
  pending: number;
  remaining: number;
  carriedForward: number;
  updatedAt: string;
}

export interface LeaveType {
  id: string;
  name: string; // Annual Leave, Sick Leave, etc.
  nameMyanmar: string;
  maxDaysPerYear: number;
  maxConsecutiveDays: number;
  requiresDocuments: boolean;
  requiresApproval: boolean;
  carryForwardAllowed: boolean;
  maxCarryForward: number;
  isActive: boolean;
}

// Performance Management
export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewPeriod: {
    start: string;
    end: string;
  };
  overallRating: number; // 1-5
  goals: PerformanceGoal[];
  competencies: CompetencyRating[];
  achievements: string[];
  areasForImprovement: string[];
  developmentPlan: string[];
  comments: string;
  status: ReviewStatus;
  submittedDate?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceGoal {
  id: string;
  description: string;
  targetDate: string;
  priority: Priority;
  status: GoalStatus;
  rating?: number;
  comments?: string;
}

export interface CompetencyRating {
  competencyName: string;
  rating: number; // 1-5
  comments?: string;
}

// Payroll System
export interface PayrollRecord {
  id: string;
  employeeId: string;
  payPeriod: {
    start: string;
    end: string;
  };
  baseSalary: number;
  overtime: OvertimeCalculation;
  allowances: Allowance[];
  deductions: Deduction[];
  grossPay: number;
  netPay: number;
  taxes: TaxCalculation;
  status: PayrollStatus;
  processedDate?: string;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeCalculation {
  regularHours: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
}

export interface Allowance {
  type: string; // Transport, Food, etc.
  amount: number;
  taxable: boolean;
}

export interface Deduction {
  type: string; // Tax, Insurance, etc.
  amount: number;
  mandatory: boolean;
}

export interface TaxCalculation {
  taxableIncome: number;
  incomeTax: number;
  socialSecurity?: number;
  otherTaxes?: number;
  totalTax: number;
}

// Training & Development
export interface Training {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  instructor: string;
  duration: number; // hours
  maxParticipants: number;
  cost: number;
  status: TrainingStatus;
  startDate: string;
  endDate: string;
  location: string;
  materials?: string[]; // file URLs
  certificates: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  trainingId: string;
  employeeId: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  completionDate?: string;
  score?: number;
  certificateUrl?: string;
  feedback?: string;
  rating?: number;
}

// Document Management
export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  expiryDate?: string;
  isConfidential: boolean;
  accessLevel: AccessLevel;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

// Company Structure
export interface Department {
  id: string;
  name: string;
  nameMyanmar: string;
  description?: string;
  parentDepartmentId?: string;
  headOfDepartment?: string; // Employee ID
  budget?: number;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Position {
  id: string;
  title: string;
  titleMyanmar: string;
  departmentId: string;
  level: number; // 1-10, 1 being entry level
  reportsTo?: string; // Position ID
  responsibilities: string[];
  requirements: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Recruitment & Onboarding
export interface JobOpening {
  id: string;
  positionId: string;
  title: string;
  description: string;
  requirements: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  employmentType: EmploymentType;
  location: string;
  status: JobStatus;
  postedDate: string;
  closingDate?: string;
  hiringManager: string;
  applications: number;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  taskName: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  completedDate?: string;
  notes?: string;
  category: OnboardingCategory;
  createdAt: string;
  updatedAt: string;
}

// Analytics & Reporting
export interface HRMetrics {
  id: string;
  date: string;
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
  averageAttendance: number;
  averageSalary: number;
  departmentMetrics: DepartmentMetrics[];
  leaveUtilization: number;
  trainingHours: number;
  performanceMetrics: {
    averageRating: number;
    reviewsCompleted: number;
    goalsAchieved: number;
  };
  createdAt: string;
}

export interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  employeeCount: number;
  averageTenure: number;
  turnoverRate: number;
  averagePerformance: number;
  totalPayroll: number;
}

// Enums
export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "intern"
  | "consultant";
export type WorkStatus =
  | "active"
  | "inactive"
  | "terminated"
  | "resigned"
  | "deceased"
  | "on-leave"
  | "suspended";

export type TerminationReason =
  | "voluntary-resignation"
  | "involuntary-termination"
  | "retirement"
  | "end-of-contract"
  | "death"
  | "abandonment"
  | "disciplinary"
  | "performance"
  | "redundancy"
  | "other";
export type OnboardingStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "delayed";
export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "half-day"
  | "holiday"
  | "weekend";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ReviewStatus = "pending" | "in-progress" | "completed" | "overdue";
export type GoalStatus =
  | "not-started"
  | "in-progress"
  | "completed"
  | "overdue"
  | "cancelled";
export type Priority = "low" | "medium" | "high" | "urgent";
export type PayrollStatus =
  | "draft"
  | "calculated"
  | "approved"
  | "paid"
  | "error";
export type PaymentMethod =
  | "bank-transfer"
  | "cash"
  | "check"
  | "mobile-payment";
export type TrainingCategory =
  | "technical"
  | "soft-skills"
  | "compliance"
  | "leadership"
  | "safety";
export type TrainingStatus = "planned" | "active" | "completed" | "cancelled";
export type EnrollmentStatus =
  | "enrolled"
  | "in-progress"
  | "completed"
  | "dropped"
  | "failed";
export type DocumentType =
  | "contract"
  | "id-card"
  | "certificate"
  | "resume"
  | "photo"
  | "medical"
  | "tax"
  | "other";
export type AccessLevel =
  | "public"
  | "hr-only"
  | "manager-only"
  | "employee-only"
  | "confidential";
export type JobStatus = "open" | "closed" | "on-hold" | "filled";
export type TaskStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "overdue"
  | "cancelled";
export type OnboardingCategory =
  | "documentation"
  | "training"
  | "equipment"
  | "access"
  | "introduction";

// Default leave types for Myanmar organizations
export const DEFAULT_LEAVE_TYPES: Omit<
  LeaveType,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Annual Leave",
    nameMyanmar: "နှစ်ပတ်လပ်ရက်",
    maxDaysPerYear: 21,
    maxConsecutiveDays: 14,
    requiresDocuments: false,
    requiresApproval: true,
    carryForwardAllowed: true,
    maxCarryForward: 5,
    isActive: true,
  },
  {
    name: "Sick Leave",
    nameMyanmar: "ဖျားနာလပ်ရက်",
    maxDaysPerYear: 30,
    maxConsecutiveDays: 7,
    requiresDocuments: true,
    requiresApproval: true,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    isActive: true,
  },
  {
    name: "Maternity Leave",
    nameMyanmar: "မီးဖွားလပ်ရက်",
    maxDaysPerYear: 126, // 18 weeks
    maxConsecutiveDays: 126,
    requiresDocuments: true,
    requiresApproval: true,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    isActive: true,
  },
  {
    name: "Paternity Leave",
    nameMyanmar: "ဖခင်လပ်ရက်",
    maxDaysPerYear: 15,
    maxConsecutiveDays: 15,
    requiresDocuments: true,
    requiresApproval: true,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    isActive: true,
  },
  {
    name: "Emergency Leave",
    nameMyanmar: "အရေးပေါ်လပ်ရက်",
    maxDaysPerYear: 5,
    maxConsecutiveDays: 3,
    requiresDocuments: false,
    requiresApproval: true,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    isActive: true,
  },
  {
    name: "Bereavement Leave",
    nameMyanmar: "ဆွေမျိုးသေဆုံးလပ်ရက်",
    maxDaysPerYear: 7,
    maxConsecutiveDays: 7,
    requiresDocuments: true,
    requiresApproval: true,
    carryForwardAllowed: false,
    maxCarryForward: 0,
    isActive: true,
  },
];

// Default departments for PDF organization
export const DEFAULT_DEPARTMENTS: Omit<
  Department,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    name: "Technology Workshop",
    nameMyanmar: "နည်းပညာလက်ရုံးတပ်",
    description: "Main technology and engineering unit",
    budget: 1000000,
    isActive: true,
  },
  {
    name: "Operations",
    nameMyanmar: "စစ်ဆင်ရေး",
    description: "Field operations and logistics",
    budget: 2000000,
    isActive: true,
  },
  {
    name: "Intelligence",
    nameMyanmar: "ထောက်လှမ်းရေး",
    description: "Information gathering and analysis",
    budget: 500000,
    isActive: true,
  },
  {
    name: "Training",
    nameMyanmar: "လေ့ကျင့်ရေး",
    description: "Personnel training and development",
    budget: 300000,
    isActive: true,
  },
  {
    name: "Medical",
    nameMyanmar: "ဆေးဝါးရေး",
    description: "Medical services and health care",
    budget: 400000,
    isActive: true,
  },
  {
    name: "Administration",
    nameMyanmar: "အုပ်ချုပ်ရေး",
    description: "Human resources and administration",
    budget: 200000,
    isActive: true,
  },
];

// Validation helpers
export function validateEmployee(employee: Partial<Employee>): string[] {
  const errors: string[] = [];

  if (!employee.employeeNumber) {
    errors.push("ဝန်ထမ်းနံပါတ် လိုအပ်သည်");
  }

  if (!employee.workEmail) {
    errors.push("အလုပ်အီးမေးလ် လိုအပ်သည်");
  }

  if (!employee.phoneNumber) {
    errors.push("ဖုန်းနံပါတ် လိုအပ်သည်");
  }

  if (!employee.department) {
    errors.push("ဌာနခွဲ လိုအပ်သည်");
  }

  if (!employee.position) {
    errors.push("ရာထူး လိုအပ်သည်");
  }

  if (!employee.baseSalary || employee.baseSalary <= 0) {
    errors.push("လစာ မှန်ကန်စွာ ဖြည့်စွက်ရန်");
  }

  return errors;
}

export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function calculateTenure(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 365.25); // Account for leap years
}

export function generateEmployeeNumber(prefix: string = "EMP"): string {
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}
