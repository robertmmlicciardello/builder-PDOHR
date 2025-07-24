// Government HR System Types
// အစိုးရ ဝန်ထမ်းစီမံခန့်ခွဲမှုစနစ် အမျိုးအစားများ

export interface GovernmentPayScale {
  id: string;
  grade: number; // Grade 1-20 / အဆင့် ၁-၂၀
  step: number; // Step 1-10 within each grade / အဆင့်တစ်ခုအတွင်း ပေါင်းစုံ ၁-၁၀
  basicSalary: number; // Base salary amount / အခြေခံလစာ ပမာဏ
  effectiveDate: Date; // When this scale became effective / ဤ��ာရင်း အသက်ဝင်သည့်နေ့
  allowances: {
    positionAllowance: number; // Based on position level / ရာထူးအဆင့်အရ
    locationAllowance: number; // Based on township/state / မြို့နယ်/ပြည်နယ်အရ
    responsibilityAllowance: number; // For supervisory roles / ကြီးကြပ်ရေး တာဝန်အတွက်
    riskAllowance: number; // For dangerous positions / အန္တရာယ်ရှိသော ရာထူးများအတွက်
    specialAllowance: number; // Special assignments / အထူးတာဝန်များ
  };
  benefits: {
    medicalAllowance: number; // Medical benefits / ဆေးဘက်ဆိုင်ရာ ထောက်ပံ့ကြေး
    transportAllowance: number; // Transport allowance / သယ်ယူပို့ဆောင်ရေး ထောက်ပံ့ကြေး
    foodAllowance: number; // Food allowance / အစားအသောက် ထောက်ပံ့ကြေး
    familyAllowance: number; // Family allowance / မိသားစု ထောက်ပံ့ကြေး
    housingAllowance: number; // Housing allowance / နေရပ် ထောက်ပံ့ကြေး
  };
  isActive: boolean;
  createdBy: string;
  approvedBy: string;
  approvalDate?: Date;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonnelGrade {
  id: string;
  personnelId: string;
  currentGrade: number;
  currentStep: number;
  appointmentDate: Date;
  lastPromotionDate?: Date;
  nextEligibleDate: Date;
  salaryFreeze: boolean;
  gradeHistory: GradeHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeHistory {
  id: string;
  fromGrade: number;
  fromStep: number;
  toGrade: number;
  toStep: number;
  effectiveDate: Date;
  promotionType: "automatic" | "merit" | "special" | "disciplinary";
  orderNumber: string;
  issuedBy: string;
  approvedBy: string;
  remarks: string;
  attachments: string[];
  createdAt: Date;
}

export interface ServiceRecord {
  id: string;
  personnelId: string;
  recordType:
    | "appointment"
    | "promotion"
    | "transfer"
    | "disciplinary"
    | "training"
    | "award"
    | "leave"
    | "resignation";
  title: string;
  titleMyanmar: string;
  description: string;
  descriptionMyanmar: string;
  effectiveDate: Date;
  endDate?: Date;
  fromPosition?: string;
  toPosition?: string;
  fromDepartment?: string;
  toDepartment?: string;
  fromLocation?: string;
  toLocation?: string;
  orderNumber: string;
  issuedBy: string;
  approvedBy: string;
  attachments: ServiceAttachment[];
  status: "draft" | "pending" | "approved" | "rejected" | "cancelled";
  urgency: "low" | "medium" | "high" | "urgent";
  remarks: string;
  remarksMyanmar: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ServiceAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: string;
  description: string;
}

export interface ApprovalWorkflow {
  id: string;
  requestId: string;
  requestType:
    | "leave"
    | "promotion"
    | "transfer"
    | "disciplinary"
    | "training"
    | "expense"
    | "recruitment";
  requestTitle: string;
  requestTitleMyanmar: string;
  requestedBy: string;
  requestedFor: string; // Personnel ID if different from requestedBy
  currentLevel: number;
  totalLevels: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "escalated";
  priority: "low" | "medium" | "high" | "urgent";

  approvalLevels: ApprovalLevel[];
  workflowHistory: WorkflowHistory[];

  submittedAt: Date;
  deadline?: Date;
  completedAt?: Date;

  attachments: WorkflowAttachment[];
  comments: WorkflowComment[];

  createdAt: Date;
  updatedAt: Date;
}

export interface ApprovalLevel {
  level: number;
  approverRole: string;
  approverRoleMyanmar: string;
  approverName?: string;
  approverId?: string;
  isRequired: boolean;
  canDelegate: boolean;
  canSkip: boolean;
  timeoutHours: number;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "skipped"
    | "delegated"
    | "timeout";
  actionDate?: Date;
  comments?: string;
  commentsMyanmar?: string;
  delegation?: DelegationInfo;
}

export interface DelegationInfo {
  delegatedTo: string;
  delegatedToName: string;
  delegatedBy: string;
  delegationDate: Date;
  reason: string;
  reasonMyanmar: string;
  isTemporary: boolean;
  expiryDate?: Date;
  isActive: boolean;
}

export interface WorkflowHistory {
  id: string;
  action:
    | "submitted"
    | "approved"
    | "rejected"
    | "delegated"
    | "escalated"
    | "withdrawn"
    | "timeout";
  actionMyanmar: string;
  performedBy: string;
  performedByName: string;
  performedAt: Date;
  level: number;
  comments: string;
  commentsMyanmar: string;
  previousStatus: string;
  newStatus: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface WorkflowAttachment {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  uploadedBy: string;
  description: string;
  descriptionMyanmar: string;
}

export interface WorkflowComment {
  id: string;
  commentText: string;
  commentTextMyanmar: string;
  commentedBy: string;
  commentedByName: string;
  commentedAt: Date;
  isInternal: boolean;
  attachments: string[];
}

export interface GovernmentLeavePolicy {
  id: string;
  leaveType: string;
  leaveTypeMyanmar: string;
  leaveCode: string;
  entitlementPerYear: number;
  maxCarryForward: number;
  canCarryForward: boolean;
  requiresMedicalCertificate: boolean;
  requiresApproval: boolean;
  maxConsecutiveDays: number;
  minAdvanceNotice: number; // days
  minimumServiceRequired: number; // months
  applicableGrades: number[]; // Which government grades can apply
  applicableGenders: ("male" | "female" | "both")[];
  approvalLevels: string[]; // Required approval hierarchy

  salaryPercentage: number; // 100% for full pay, 50% for half pay, 0% for no pay
  includeWeekends: boolean;
  includeHolidays: boolean;

  description: string;
  descriptionMyanmar: string;
  eligibilityRules: string;
  eligibilityRulesMyanmar: string;

  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  approvedBy: string;
}

export interface PersonnelServiceSummary {
  personnelId: string;
  totalServiceYears: number;
  totalServiceMonths: number;
  totalServiceDays: number;
  currentPosition: string;
  currentDepartment: string;
  currentGrade: number;
  currentStep: number;
  currentSalary: number;
  lastPromotionDate?: Date;
  nextEligiblePromotionDate?: Date;
  nextStepIncrementDate?: Date;

  // Leave Summary
  annualLeaveBalance: number;
  medicalLeaveUsed: number;
  casualLeaveBalance: number;

  // Performance & Disciplinary
  performanceRating?: string;
  disciplinaryActions: number;
  awards: number;
  trainingsCompleted: number;
  transferHistory: number;

  // Calculated fields
  pensionEligibilityDate?: Date;
  retirementDate?: Date;

  lastUpdated: Date;
}

// Government Position Classifications
export interface GovernmentPosition {
  id: string;
  positionTitle: string;
  positionTitleMyanmar: string;
  positionCode: string;
  department: string;
  ministry: string;
  gradeRange: {
    minGrade: number;
    maxGrade: number;
  };
  requiredQualifications: string[];
  responsibilities: string[];
  responsibilitiesMyanmar: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Government Department Structure
export interface GovernmentDepartment {
  id: string;
  departmentName: string;
  departmentNameMyanmar: string;
  departmentCode: string;
  ministry: string;
  ministryMyanmar: string;
  parentDepartment?: string;
  location: {
    state: string;
    township: string;
    address: string;
  };
  headOfDepartment: string;
  contactInfo: {
    phone: string;
    email: string;
    fax?: string;
  };
  isActive: boolean;
  establishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Standard Myanmar Government Ministries
export const MYANMAR_MINISTRIES = [
  {
    code: "MOI",
    name: "Ministry of Information",
    nameMyanmar: "ပြန်ကြားရေးဝန်ကြီးဌာန",
  },
  {
    code: "MOE",
    name: "Ministry of Education",
    nameMyanmar: "ပညာရေးဝန်ကြီးဌာန",
  },
  {
    code: "MOH",
    name: "Ministry of Health and Sports",
    nameMyanmar: "ကျန်းမာရေးနှင့်အားကစားဝန်ကြီးဌာန",
  },
  {
    code: "MOHA",
    name: "Ministry of Home Affairs",
    nameMyanmar: "ပြည်ထဲရေးဝန်ကြီးဌာန",
  },
  {
    code: "MOD",
    name: "Ministry of Defence",
    nameMyanmar: "ကာကွယ်ရေးဝန်ကြီးဌာန",
  },
  {
    code: "MOALI",
    name: "Ministry of Agriculture, Livestock and Irrigation",
    nameMyanmar: "လယ်ယာမွေးမြူရေးနှင့်ရေလုပ်ငန်းဝန်ကြီးဌာန",
  },
  {
    code: "MOPF",
    name: "Ministry of Planning and Finance",
    nameMyanmar: "ကိန်းဂဏန်းနှင့်ဘာရေးဝန်ကြီးဌာန",
  },
  {
    code: "MOTC",
    name: "Ministry of Transport and Communications",
    nameMyanmar: "ပို့ဆောင်ရေးနှင့်ဆက်သွယ်ရေးဝန်ကြီးဌာန",
  },
  {
    code: "MONREC",
    name: "Ministry of Natural Resources and Environmental Conservation",
    nameMyanmar: "သဘာဝသယံဇာတနှင့်သဘာဝပတ်ဝန်းကျင်ထိန်းသိမ်းရေးဝန်ကြီးဌာန",
  },
  {
    code: "MOEE",
    name: "Ministry of Electricity and Energy",
    nameMyanmar: "လျှပ်စစ်နှင့်စွမ်းအင်ဝန်ကြီးဌာန",
  },
] as const;

// Government Leave Types for Myanmar
export const MYANMAR_GOVERNMENT_LEAVE_TYPES = [
  {
    type: "annual",
    typeMyanmar: "နှစ်ပတ်လပ်ရက်",
    entitlement: 20,
    description: "Annual vacation leave",
  },
  {
    type: "medical",
    typeMyanmar: "ဆေးဘက်ဆိုင်ရာလပ်ရက်",
    entitlement: 365,
    description: "Medical leave with certificate",
  },
  {
    type: "maternity",
    typeMyanmar: "မီ��ယပ်လပ်ရက်",
    entitlement: 90,
    description: "Maternity leave for female employees",
  },
  {
    type: "casual",
    typeMyanmar: "ခေတ္တလပ်ရက်",
    entitlement: 10,
    description: "Casual leave for urgent personal matters",
  },
  {
    type: "study",
    typeMyanmar: "ပညာသင်ကြားမှုလပ်ရက်",
    entitlement: 365,
    description: "Study leave for education",
  },
  {
    type: "pilgrimage",
    typeMyanmar: "ဘာသာရေးလပ်ရက်",
    entitlement: 15,
    description: "Religious pilgrimage leave",
  },
] as const;
