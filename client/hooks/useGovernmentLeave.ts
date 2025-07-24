import { useState, useEffect } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/services/firebase";
import {
  GovernmentLeavePolicy,
  MYANMAR_GOVERNMENT_LEAVE_TYPES,
} from "@/types/government";

export const useGovernmentLeave = () => {
  const [leavePolicies, setLeavePolicies] = useState<GovernmentLeavePolicy[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeavePolicies = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "governmentLeavePolicies"),
        where("isActive", "==", true),
        orderBy("leaveType", "asc"),
      );
      const querySnapshot = await getDocs(q);
      const policies: GovernmentLeavePolicy[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        policies.push({
          id: doc.id,
          ...data,
          effectiveDate: data.effectiveDate?.toDate(),
          expiryDate: data.expiryDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as GovernmentLeavePolicy);
      });

      setLeavePolicies(policies);
    } catch (err) {
      setError("Failed to fetch leave policies");
      console.error("Error fetching leave policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const createLeavePolicy = async (
    policy: Omit<GovernmentLeavePolicy, "id" | "createdAt" | "updatedAt">,
  ) => {
    try {
      // Check if leave type already exists
      const existing = leavePolicies.find(
        (p) =>
          p.leaveType.toLowerCase() === policy.leaveType.toLowerCase() &&
          p.isActive,
      );

      if (existing) {
        throw new Error(
          `Leave policy for "${policy.leaveType}" already exists`,
        );
      }

      const docRef = await addDoc(collection(db, "governmentLeavePolicies"), {
        ...policy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await fetchLeavePolicies();
      return docRef.id;
    } catch (err: any) {
      setError(err.message || "Failed to create leave policy");
      console.error("Error creating leave policy:", err);
      throw err;
    }
  };

  const updateLeavePolicy = async (
    id: string,
    updates: Partial<GovernmentLeavePolicy>,
  ) => {
    try {
      const docRef = doc(db, "governmentLeavePolicies", id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });

      await fetchLeavePolicies();
    } catch (err) {
      setError("Failed to update leave policy");
      console.error("Error updating leave policy:", err);
      throw err;
    }
  };

  const deleteLeavePolicy = async (id: string) => {
    try {
      // Soft delete - mark as inactive
      const docRef = doc(db, "governmentLeavePolicies", id);
      await updateDoc(docRef, {
        isActive: false,
        updatedAt: new Date(),
      });

      await fetchLeavePolicies();
    } catch (err) {
      setError("Failed to delete leave policy");
      console.error("Error deleting leave policy:", err);
      throw err;
    }
  };

  const getLeavePolicy = (
    leaveType: string,
  ): GovernmentLeavePolicy | undefined => {
    return leavePolicies.find(
      (policy) =>
        policy.leaveType.toLowerCase() === leaveType.toLowerCase() &&
        policy.isActive,
    );
  };

  const getApplicableLeavePolicies = (
    grade: number,
    gender: "male" | "female",
  ): GovernmentLeavePolicy[] => {
    return leavePolicies.filter(
      (policy) =>
        policy.isActive &&
        policy.applicableGrades.includes(grade) &&
        (policy.applicableGenders.includes("both") ||
          policy.applicableGenders.includes(gender)),
    );
  };

  const validateLeaveRequest = (
    leaveType: string,
    duration: number,
    grade: number,
    gender: "male" | "female",
    serviceMonths: number,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const policy = getLeavePolicy(leaveType);

    if (!policy) {
      errors.push(`Leave policy for "${leaveType}" not found`);
      return { isValid: false, errors };
    }

    // Check grade eligibility
    if (!policy.applicableGrades.includes(grade)) {
      errors.push(
        `Leave type "${leaveType}" is not applicable for Grade ${grade}`,
      );
    }

    // Check gender eligibility
    if (
      !policy.applicableGenders.includes("both") &&
      !policy.applicableGenders.includes(gender)
    ) {
      errors.push(
        `Leave type "${leaveType}" is not applicable for ${gender} employees`,
      );
    }

    // Check minimum service requirement
    if (serviceMonths < policy.minimumServiceRequired) {
      errors.push(
        `Minimum service requirement of ${policy.minimumServiceRequired} months not met`,
      );
    }

    // Check maximum consecutive days
    if (duration > policy.maxConsecutiveDays) {
      errors.push(
        `Maximum consecutive days for "${leaveType}" is ${policy.maxConsecutiveDays} days`,
      );
    }

    // Check annual entitlement (this would require checking existing leave records)
    // For now, we'll just validate against the yearly entitlement
    if (duration > policy.entitlementPerYear) {
      errors.push(
        `Requested duration exceeds annual entitlement of ${policy.entitlementPerYear} days`,
      );
    }

    return { isValid: errors.length === 0, errors };
  };

  const calculateLeavePay = (
    leaveType: string,
    duration: number,
    baseSalary: number,
  ): { totalPay: number; payPercentage: number } => {
    const policy = getLeavePolicy(leaveType);
    if (!policy) {
      return { totalPay: 0, payPercentage: 0 };
    }

    const dailySalary = baseSalary / 30; // Assuming 30 days per month
    const payPercentage = policy.salaryPercentage;
    const totalPay = (dailySalary * duration * payPercentage) / 100;

    return { totalPay, payPercentage };
  };

  const generateDefaultLeavePolicies = async () => {
    try {
      setLoading(true);

      const defaultPolicies: Omit<
        GovernmentLeavePolicy,
        "id" | "createdAt" | "updatedAt"
      >[] = [
        // Annual Leave
        {
          leaveType: "Annual Leave",
          leaveTypeMyanmar: "နှစ်ပတ်လပ်ရက်",
          leaveCode: "AL",
          entitlementPerYear: 20,
          maxCarryForward: 5,
          canCarryForward: true,
          requiresMedicalCertificate: false,
          requiresApproval: true,
          maxConsecutiveDays: 15,
          minAdvanceNotice: 7,
          minimumServiceRequired: 12,
          applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
          applicableGenders: ["both"],
          approvalLevels: ["immediate_supervisor", "department_head"],
          salaryPercentage: 100,
          includeWeekends: false,
          includeHolidays: false,
          description: "Annual vacation leave for personal purposes",
          descriptionMyanmar: "ကိုယ်ရေးကိုယ်တာ ရည်ရွယ်ချက်အတွက် နှစ်ပတ်လပ်ရက်",
          eligibilityRules:
            "Available to all employees after 12 months of service",
          eligibilityRulesMyanmar:
            "ဝန်ထမ်းအားလုံး ၁၂လ ဝန်ထမ်းပြုပြီးနောက် ရရှိနိုင်သည်",
          isActive: true,
          effectiveDate: new Date(),
          createdBy: "system",
          approvedBy: "admin",
        },
        // Medical Leave
        {
          leaveType: "Medical Leave",
          leaveTypeMyanmar: "ဆေးဘက်ဆိုင်ရာလပ်ရက်",
          leaveCode: "ML",
          entitlementPerYear: 365,
          maxCarryForward: 0,
          canCarryForward: false,
          requiresMedicalCertificate: true,
          requiresApproval: true,
          maxConsecutiveDays: 90,
          minAdvanceNotice: 0,
          minimumServiceRequired: 0,
          applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
          applicableGenders: ["both"],
          approvalLevels: [
            "immediate_supervisor",
            "department_head",
            "medical_officer",
          ],
          salaryPercentage: 100,
          includeWeekends: true,
          includeHolidays: true,
          description: "Leave for medical treatment and recovery",
          descriptionMyanmar: "ကုသမှုနှင့် ပြန်လည်ကောင်းမွန်ရေးအတွက် လပ်ရက်",
          eligibilityRules: "Available with valid medical certificate",
          eligibilityRulesMyanmar: "တရားဝင် ဆေးလက်မှတ်ဖြင့် ရရှိနိုင်သည်",
          isActive: true,
          effectiveDate: new Date(),
          createdBy: "system",
          approvedBy: "admin",
        },
        // Maternity Leave
        {
          leaveType: "Maternity Leave",
          leaveTypeMyanmar: "မီးယပ်လပ်ရက်",
          leaveCode: "MAT",
          entitlementPerYear: 90,
          maxCarryForward: 0,
          canCarryForward: false,
          requiresMedicalCertificate: true,
          requiresApproval: true,
          maxConsecutiveDays: 90,
          minAdvanceNotice: 30,
          minimumServiceRequired: 6,
          applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
          applicableGenders: ["female"],
          approvalLevels: [
            "immediate_supervisor",
            "department_head",
            "hr_department",
          ],
          salaryPercentage: 100,
          includeWeekends: true,
          includeHolidays: true,
          description: "Maternity leave for female employees",
          descriptionMyanmar: "အမျိုးသမီး ဝန်ထမ်းများအတွက် မီးယပ်လပ်ရက်",
          eligibilityRules:
            "Available to female employees with 6+ months service",
          eligibilityRulesMyanmar:
            "ဝန်ထမ်းပြု ၆လ ကျော်ရှိသော အမျိုးသမီးများ ရရှိနိုင်သည်",
          isActive: true,
          effectiveDate: new Date(),
          createdBy: "system",
          approvedBy: "admin",
        },
        // Casual Leave
        {
          leaveType: "Casual Leave",
          leaveTypeMyanmar: "ခေတ္တလပ်ရက်",
          leaveCode: "CL",
          entitlementPerYear: 10,
          maxCarryForward: 0,
          canCarryForward: false,
          requiresMedicalCertificate: false,
          requiresApproval: true,
          maxConsecutiveDays: 3,
          minAdvanceNotice: 1,
          minimumServiceRequired: 3,
          applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
          applicableGenders: ["both"],
          approvalLevels: ["immediate_supervisor"],
          salaryPercentage: 100,
          includeWeekends: false,
          includeHolidays: false,
          description: "Short-term leave for urgent personal matters",
          descriptionMyanmar:
            "အရေးပေါ် ကိုယ်ရေးကိုယ်တာ ကိစ္စများအတွက် ခဏတာလပ်ရက်",
          eligibilityRules:
            "Available for urgent personal matters with minimum notice",
          eligibilityRulesMyanmar:
            "အရေးပေါ် ကိုယ်ရေးကိစ္စများအတွက် အနည်းဆုံး ကြိုတင်အကြောင်းကြားမှုဖြင့် ရရှိနိုင်သည်",
          isActive: true,
          effectiveDate: new Date(),
          createdBy: "system",
          approvedBy: "admin",
        },
        // Study Leave
        {
          leaveType: "Study Leave",
          leaveTypeMyanmar: "ပညာသင်ကြားမှုလပ်ရက်",
          leaveCode: "SL",
          entitlementPerYear: 365,
          maxCarryForward: 0,
          canCarryForward: false,
          requiresMedicalCertificate: false,
          requiresApproval: true,
          maxConsecutiveDays: 365,
          minAdvanceNotice: 90,
          minimumServiceRequired: 24,
          applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Lower grades only
          applicableGenders: ["both"],
          approvalLevels: [
            "department_head",
            "ministry_approval",
            "cabinet_approval",
          ],
          salaryPercentage: 50, // Half pay during study leave
          includeWeekends: true,
          includeHolidays: true,
          description:
            "Leave for higher education and professional development",
          descriptionMyanmar:
            "အဆင့်မြင့်ပညာရေးနှင့် အသက်မွေးဝမ်းကြောင်း ဖွံ့ဖြိုးတိုးတက်မှုအတွက် လပ်ရက်",
          eligibilityRules:
            "Available to lower grade employees with 2+ years service",
          eligibilityRulesMyanmar:
            "အဆင့်နိမ့် ဝန်ထမ်းများ (၂နှစ်ကျော် ဝန်ထမ်းပြုရှိသူများ) ရရှိနိုင်သည်",
          isActive: true,
          effectiveDate: new Date(),
          createdBy: "system",
          approvedBy: "admin",
        },
        // Religious/Pilgrimage Leave
        {
          leaveType: "Religious Leave",
          leaveTypeMyanmar: "ဘာသာရေးလပ်ရက်",
          leaveCode: "RL",
          entitlementPerYear: 15,
          maxCarryForward: 0,
          canCarryForward: false,
          requiresMedicalCertificate: false,
          requiresApproval: true,
          maxConsecutiveDays: 15,
          minAdvanceNotice: 21,
          minimumServiceRequired: 12,
          applicableGrades: Array.from({ length: 20 }, (_, i) => i + 1),
          applicableGenders: ["both"],
          approvalLevels: ["immediate_supervisor", "department_head"],
          salaryPercentage: 100,
          includeWeekends: false,
          includeHolidays: false,
          description: "Leave for religious pilgrimage and spiritual purposes",
          descriptionMyanmar:
            "ဘာသာရေး ဘုရားဖူးခရီးနှင့် ဝိညာဏရေးရာ ရည်ရွယ်ချက်အတွက် လပ်ရက်",
          eligibilityRules: "Available once per year with advance notice",
          eligibilityRulesMyanmar:
            "တစ်နှစ်လျှင် တစ်ကြိမ် ကြိုတင်အကြောင်းကြားမှုဖြင့် ရရှိနိုင်သည်",
          isActive: true,
          effectiveDate: new Date(),
          createdBy: "system",
          approvedBy: "admin",
        },
      ];

      for (const policy of defaultPolicies) {
        await createLeavePolicy(policy);
      }
    } catch (err) {
      setError("Failed to generate default leave policies");
      console.error("Error generating default leave policies:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportLeavePolicies = (): string => {
    const csvData = leavePolicies.map((policy) => ({
      "Leave Type": policy.leaveType,
      "Leave Type (Myanmar)": policy.leaveTypeMyanmar,
      Code: policy.leaveCode,
      "Annual Entitlement": policy.entitlementPerYear,
      "Max Consecutive Days": policy.maxConsecutiveDays,
      "Min Service Required (months)": policy.minimumServiceRequired,
      "Applicable Grades": policy.applicableGrades.join(", "),
      "Salary Percentage": `${policy.salaryPercentage}%`,
      "Requires Medical Certificate": policy.requiresMedicalCertificate
        ? "Yes"
        : "No",
      Active: policy.isActive ? "Yes" : "No",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row] || ""}"`)
          .join(","),
      ),
    ].join("\n");

    return csvContent;
  };

  useEffect(() => {
    fetchLeavePolicies();
  }, []);

  return {
    leavePolicies,
    loading,
    error,
    createLeavePolicy,
    updateLeavePolicy,
    deleteLeavePolicy,
    getLeavePolicy,
    getApplicableLeavePolicies,
    validateLeaveRequest,
    calculateLeavePay,
    generateDefaultLeavePolicies,
    exportLeavePolicies,
    refreshPolicies: fetchLeavePolicies,
  };
};

// Hook for individual leave requests
export const useLeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLeaveRequest = async (request: {
    employeeId: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    reason: string;
    reasonMyanmar: string;
    supportingDocuments?: string[];
  }) => {
    try {
      setLoading(true);

      // Create leave request record
      const leaveRequest = {
        ...request,
        status: "pending",
        submittedAt: new Date(),
        approvalHistory: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(
        collection(db, "leaveRequests"),
        leaveRequest,
      );

      // TODO: Create approval workflow for this leave request
      // This would integrate with the approval workflow system

      return docRef.id;
    } catch (err) {
      setError("Failed to submit leave request");
      console.error("Error submitting leave request:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    leaveRequests,
    loading,
    error,
    submitLeaveRequest,
  };
};
