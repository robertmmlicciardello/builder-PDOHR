import { Personnel, PersonnelStatus } from "@shared/personnel";
import {
  GovernmentPayScale,
  ServiceRecord,
  ApprovalWorkflow,
  GovernmentLeavePolicy,
} from "../types/government";

// Sample Personnel Data for Demo
export const SAMPLE_PERSONNEL: Personnel[] = [
  {
    id: "P14001",
    name: "ဦးမြင့်မြတ်",
    rank: "Director",
    dateOfJoining: "2020-01-15T00:00:00.000Z",
    assignedDuties:
      "Overall management and strategic planning for the department",
    status: "active" as PersonnelStatus,
    organization: "Ministry of Planning and Finance",
    createdAt: "2024-01-15T08:00:00.000Z",
    updatedAt: "2024-01-15T08:00:00.000Z",
  },
  {
    id: "P14002",
    name: "ဒေါ်ခင်ဇော်",
    rank: "Deputy Director",
    dateOfJoining: "2021-03-20T00:00:00.000Z",
    assignedDuties: "Human Resources and Administrative Affairs management",
    status: "active" as PersonnelStatus,
    organization: "Ministry of Planning and Finance",
    createdAt: "2024-01-16T08:00:00.000Z",
    updatedAt: "2024-01-16T08:00:00.000Z",
  },
  {
    id: "P14003",
    name: "ဦးသန့်ဝင်း",
    rank: "Assistant Director",
    dateOfJoining: "2022-06-10T00:00:00.000Z",
    assignedDuties: "Financial planning and budget management",
    status: "active" as PersonnelStatus,
    organization: "Department of Budget",
    createdAt: "2024-01-17T08:00:00.000Z",
    updatedAt: "2024-01-17T08:00:00.000Z",
  },
  {
    id: "P14004",
    name: "ဒေါ်နှင်းလေး",
    rank: "Senior Officer",
    dateOfJoining: "2019-09-05T00:00:00.000Z",
    assignedDuties: "Personnel records management and payroll processing",
    status: "active" as PersonnelStatus,
    organization: "Human Resources Department",
    createdAt: "2024-01-18T08:00:00.000Z",
    updatedAt: "2024-01-18T08:00:00.000Z",
  },
  {
    id: "P14005",
    name: "ဦးကျော်ထူး",
    rank: "Officer",
    dateOfJoining: "2023-02-28T00:00:00.000Z",
    assignedDuties: "Data entry and document processing",
    status: "active" as PersonnelStatus,
    organization: "Administrative Department",
    createdAt: "2024-01-19T08:00:00.000Z",
    updatedAt: "2024-01-19T08:00:00.000Z",
  },
  {
    id: "P14006",
    name: "ဒေါ်မီမီသန့်",
    rank: "Junior Officer",
    dateOfJoining: "2023-08-15T00:00:00.000Z",
    assignedDuties: "Filing and basic administrative support",
    status: "active" as PersonnelStatus,
    organization: "Administrative Department",
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-01-20T08:00:00.000Z",
  },
  {
    id: "P14007",
    name: "ဦးအောင်မြင့်",
    rank: "Senior Officer",
    dateOfJoining: "2018-12-01T00:00:00.000Z",
    dateOfLeaving: "2024-01-31T00:00:00.000Z",
    assignedDuties: "IT systems management and maintenance",
    status: "resigned" as PersonnelStatus,
    organization: "IT Department",
    createdAt: "2024-01-21T08:00:00.000Z",
    updatedAt: "2024-01-31T08:00:00.000Z",
  },
  {
    id: "P14008",
    name: "ဒေါ်သင်းသင်း",
    rank: "Assistant Director",
    dateOfJoining: "2020-05-18T00:00:00.000Z",
    assignedDuties: "Training and development coordination",
    status: "active" as PersonnelStatus,
    organization: "Training Department",
    createdAt: "2024-01-22T08:00:00.000Z",
    updatedAt: "2024-01-22T08:00:00.000Z",
  },
];

// Sample Government Pay Scales
export const SAMPLE_PAY_SCALES: GovernmentPayScale[] = [
  {
    id: "pay-1",
    grade: 1,
    step: 1,
    basicSalary: 2500000,
    allowances: {
      housing: 300000,
      transport: 150000,
      meal: 100000,
      position: 200000,
    },
    totalSalary: 3250000,
    effectiveDate: "2024-01-01T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "pay-2",
    grade: 2,
    step: 3,
    basicSalary: 1800000,
    allowances: {
      housing: 250000,
      transport: 120000,
      meal: 80000,
      position: 150000,
    },
    totalSalary: 2400000,
    effectiveDate: "2024-01-01T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "pay-3",
    grade: 5,
    step: 2,
    basicSalary: 1200000,
    allowances: {
      housing: 180000,
      transport: 90000,
      meal: 60000,
      position: 100000,
    },
    totalSalary: 1630000,
    effectiveDate: "2024-01-01T00:00:00.000Z",
    isActive: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
];

// Sample Service Records
export const SAMPLE_SERVICE_RECORDS: ServiceRecord[] = [
  {
    id: "service-1",
    personnelId: "P14001",
    recordType: "promotion",
    title: "Promoted to Director Position",
    description:
      "Promoted from Deputy Director to Director based on excellent performance and leadership skills",
    date: "2023-01-15T00:00:00.000Z",
    attachments: [],
    createdBy: "admin",
    createdAt: "2023-01-15T08:00:00.000Z",
    updatedAt: "2023-01-15T08:00:00.000Z",
  },
  {
    id: "service-2",
    personnelId: "P14002",
    recordType: "training",
    title: "Leadership Development Program",
    description:
      "Successfully completed 3-month leadership development training program",
    date: "2023-06-30T00:00:00.000Z",
    attachments: [],
    createdBy: "admin",
    createdAt: "2023-06-30T08:00:00.000Z",
    updatedAt: "2023-06-30T08:00:00.000Z",
  },
  {
    id: "service-3",
    personnelId: "P14003",
    recordType: "award",
    title: "Best Employee of the Year 2023",
    description:
      "Awarded for outstanding contribution to financial planning and budget management",
    date: "2023-12-31T00:00:00.000Z",
    attachments: [],
    createdBy: "admin",
    createdAt: "2023-12-31T08:00:00.000Z",
    updatedAt: "2023-12-31T08:00:00.000Z",
  },
];

// Sample Leave Policies
export const SAMPLE_LEAVE_POLICIES: GovernmentLeavePolicy[] = [
  {
    id: "leave-1",
    leaveType: "annual",
    entitlementDays: 21,
    carryForwardDays: 7,
    description: "Annual leave entitlement for government employees",
    isActive: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "leave-2",
    leaveType: "sick",
    entitlementDays: 30,
    carryForwardDays: 0,
    description: "Sick leave entitlement for government employees",
    isActive: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
  {
    id: "leave-3",
    leaveType: "maternity",
    entitlementDays: 105,
    carryForwardDays: 0,
    description: "Maternity leave for female government employees",
    isActive: true,
    createdAt: "2024-01-01T08:00:00.000Z",
    updatedAt: "2024-01-01T08:00:00.000Z",
  },
];

// Function to load sample data to localStorage
export const loadSampleData = () => {
  // Always load personnel data for demo (overwrite existing)
  localStorage.setItem("pdf-personnel", JSON.stringify(SAMPLE_PERSONNEL));
  console.log("Loaded", SAMPLE_PERSONNEL.length, "sample personnel records");

  // Load pay scale data
  const existingPayScales = localStorage.getItem("pdf-pay-scales");
  if (!existingPayScales) {
    localStorage.setItem("pdf-pay-scales", JSON.stringify(SAMPLE_PAY_SCALES));
  }

  // Load service records
  const existingServiceRecords = localStorage.getItem("pdf-service-records");
  if (!existingServiceRecords) {
    localStorage.setItem(
      "pdf-service-records",
      JSON.stringify(SAMPLE_SERVICE_RECORDS),
    );
  }

  // Load leave policies
  const existingLeavePolicies = localStorage.getItem("pdf-leave-policies");
  if (!existingLeavePolicies) {
    localStorage.setItem(
      "pdf-leave-policies",
      JSON.stringify(SAMPLE_LEAVE_POLICIES),
    );
  }

  console.log("Sample data loaded successfully!");
};

// Function to clear all sample data
export const clearSampleData = () => {
  localStorage.removeItem("pdf-personnel");
  localStorage.removeItem("pdf-pay-scales");
  localStorage.removeItem("pdf-service-records");
  localStorage.removeItem("pdf-leave-policies");
  console.log("Sample data cleared!");
};

// Function to reset to sample data
export const resetToSampleData = () => {
  clearSampleData();
  loadSampleData();
};
