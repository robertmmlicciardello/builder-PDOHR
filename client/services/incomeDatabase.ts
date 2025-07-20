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
  IncomeRecord,
  IncomeCategory,
  IncomeSummary,
  IncomeTarget,
  IncomeType,
  IncomeStatus,
  calculateTotalIncome,
  groupIncomeByType,
  generateIncomeSummary,
} from "../../shared/income-system";

// Collection references
export const incomeRecordsCollection = collection(db, "incomeRecords");
export const incomeCategoriesCollection = collection(db, "incomeCategories");
export const incomeSummariesCollection = collection(db, "incomeSummaries");
export const incomeTargetsCollection = collection(db, "incomeTargets");

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

// Income Record Service
export class IncomeRecordService {
  static async getIncomeRecords(
    incomeType?: IncomeType,
    status?: IncomeStatus,
    startDate?: string,
    endDate?: string,
  ): Promise<IncomeRecord[]> {
    try {
      let q = query(incomeRecordsCollection, orderBy("dateReceived", "desc"));

      // Apply filters
      if (incomeType) {
        q = query(q, where("incomeType", "==", incomeType));
      }
      if (status) {
        q = query(q, where("status", "==", status));
      }

      const snapshot = await getDocs(q);
      let records = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as IncomeRecord,
      );

      // Filter by date range if provided (client-side for complex date filtering)
      if (startDate || endDate) {
        records = records.filter((record) => {
          const recordDate = record.dateReceived;
          if (startDate && recordDate < startDate) return false;
          if (endDate && recordDate > endDate) return false;
          return true;
        });
      }

      return records;
    } catch (error: any) {
      throw new Error(`Failed to fetch income records: ${error.message}`);
    }
  }

  static async getIncomeRecordById(id: string): Promise<IncomeRecord | null> {
    try {
      const docRef = doc(incomeRecordsCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as IncomeRecord;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch income record: ${error.message}`);
    }
  }

  static async addIncomeRecord(
    record: Omit<IncomeRecord, "id">,
  ): Promise<string> {
    try {
      const sanitizedRecord = sanitizeForFirestore(record);
      const docRef = await addDoc(incomeRecordsCollection, sanitizedRecord);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add income record: ${error.message}`);
    }
  }

  static async updateIncomeRecord(
    id: string,
    record: Partial<IncomeRecord>,
  ): Promise<void> {
    try {
      const docRef = doc(incomeRecordsCollection, id);
      const sanitizedRecord = sanitizeForFirestore(record);
      await updateDoc(docRef, sanitizedRecord);
    } catch (error: any) {
      throw new Error(`Failed to update income record: ${error.message}`);
    }
  }

  static async deleteIncomeRecord(id: string): Promise<void> {
    try {
      const docRef = doc(incomeRecordsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete income record: ${error.message}`);
    }
  }

  static async updateIncomeStatus(
    id: string,
    status: IncomeStatus,
    approvedBy?: string,
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (status === "approved" && approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedDate = new Date().toISOString();
      }

      await this.updateIncomeRecord(id, updateData);
    } catch (error: any) {
      throw new Error(`Failed to update income status: ${error.message}`);
    }
  }

  static async getIncomeByPeriod(
    startDate: string,
    endDate: string,
    incomeType?: IncomeType,
  ): Promise<IncomeRecord[]> {
    try {
      return await this.getIncomeRecords(
        incomeType,
        undefined,
        startDate,
        endDate,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch income by period: ${error.message}`);
    }
  }

  static async getTotalIncomeByType(
    incomeType: IncomeType,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    try {
      const records = await this.getIncomeRecords(
        incomeType,
        "approved",
        startDate,
        endDate,
      );
      return calculateTotalIncome(records);
    } catch (error: any) {
      throw new Error(`Failed to calculate total income: ${error.message}`);
    }
  }
}

// Income Category Service
export class IncomeCategoryService {
  static async getIncomeCategories(
    incomeType?: IncomeType,
  ): Promise<IncomeCategory[]> {
    try {
      let q = query(incomeCategoriesCollection, orderBy("name"));

      if (incomeType) {
        q = query(q, where("incomeType", "==", incomeType));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as IncomeCategory,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch income categories: ${error.message}`);
    }
  }

  static async addIncomeCategory(
    category: Omit<IncomeCategory, "id">,
  ): Promise<string> {
    try {
      const sanitizedCategory = sanitizeForFirestore(category);
      const docRef = await addDoc(
        incomeCategoriesCollection,
        sanitizedCategory,
      );
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add income category: ${error.message}`);
    }
  }

  static async updateIncomeCategory(
    id: string,
    category: Partial<IncomeCategory>,
  ): Promise<void> {
    try {
      const docRef = doc(incomeCategoriesCollection, id);
      const sanitizedCategory = sanitizeForFirestore(category);
      await updateDoc(docRef, sanitizedCategory);
    } catch (error: any) {
      throw new Error(`Failed to update income category: ${error.message}`);
    }
  }

  static async deleteIncomeCategory(id: string): Promise<void> {
    try {
      const docRef = doc(incomeCategoriesCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete income category: ${error.message}`);
    }
  }
}

// Income Summary Service
export class IncomeSummaryService {
  static async generateIncomeSummary(
    startDate: string,
    endDate: string,
    generatedBy: string,
  ): Promise<IncomeSummary> {
    try {
      // Get all income records for the period
      const records = await IncomeRecordService.getIncomeByPeriod(
        startDate,
        endDate,
      );

      // Generate summary
      const summary = generateIncomeSummary(
        records,
        startDate,
        endDate,
        generatedBy,
      );

      // Save summary to database
      const sanitizedSummary = sanitizeForFirestore(summary);
      await addDoc(incomeSummariesCollection, sanitizedSummary);

      return summary;
    } catch (error: any) {
      throw new Error(`Failed to generate income summary: ${error.message}`);
    }
  }

  static async getIncomeSummaries(): Promise<IncomeSummary[]> {
    try {
      const q = query(
        incomeSummariesCollection,
        orderBy("generatedAt", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as IncomeSummary,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch income summaries: ${error.message}`);
    }
  }

  static async getIncomeSummaryById(id: string): Promise<IncomeSummary | null> {
    try {
      const docRef = doc(incomeSummariesCollection, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as IncomeSummary;
      }
      return null;
    } catch (error: any) {
      throw new Error(`Failed to fetch income summary: ${error.message}`);
    }
  }
}

// Income Target Service
export class IncomeTargetService {
  static async getIncomeTargets(
    incomeType?: IncomeType,
    year?: number,
  ): Promise<IncomeTarget[]> {
    try {
      let q = query(incomeTargetsCollection, orderBy("year", "desc"));

      if (incomeType) {
        q = query(q, where("incomeType", "==", incomeType));
      }
      if (year) {
        q = query(q, where("year", "==", year));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as IncomeTarget,
      );
    } catch (error: any) {
      throw new Error(`Failed to fetch income targets: ${error.message}`);
    }
  }

  static async addIncomeTarget(
    target: Omit<IncomeTarget, "id">,
  ): Promise<string> {
    try {
      const sanitizedTarget = sanitizeForFirestore(target);
      const docRef = await addDoc(incomeTargetsCollection, sanitizedTarget);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Failed to add income target: ${error.message}`);
    }
  }

  static async updateIncomeTarget(
    id: string,
    target: Partial<IncomeTarget>,
  ): Promise<void> {
    try {
      const docRef = doc(incomeTargetsCollection, id);
      const sanitizedTarget = sanitizeForFirestore(target);
      await updateDoc(docRef, sanitizedTarget);
    } catch (error: any) {
      throw new Error(`Failed to update income target: ${error.message}`);
    }
  }

  static async deleteIncomeTarget(id: string): Promise<void> {
    try {
      const docRef = doc(incomeTargetsCollection, id);
      await deleteDoc(docRef);
    } catch (error: any) {
      throw new Error(`Failed to delete income target: ${error.message}`);
    }
  }
}

// Income Analytics Service
export class IncomeAnalyticsService {
  static async getIncomeAnalytics(
    startDate: string,
    endDate: string,
  ): Promise<{
    totalIncome: number;
    taxIncome: number;
    donationIncome: number;
    taxPercentage: number;
    donationPercentage: number;
    monthlyBreakdown: Array<{
      month: string;
      taxIncome: number;
      donationIncome: number;
      totalIncome: number;
    }>;
    categoryBreakdown: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
      percentage: number;
    }>;
  }> {
    try {
      const records = await IncomeRecordService.getIncomeByPeriod(
        startDate,
        endDate,
      );
      const approvedRecords = records.filter((r) => r.status === "approved");

      const { taxIncome: taxRecords, donationIncome: donationRecords } =
        groupIncomeByType(approvedRecords);

      const taxIncome = calculateTotalIncome(taxRecords);
      const donationIncome = calculateTotalIncome(donationRecords);
      const totalIncome = taxIncome + donationIncome;

      const taxPercentage =
        totalIncome > 0 ? (taxIncome / totalIncome) * 100 : 0;
      const donationPercentage =
        totalIncome > 0 ? (donationIncome / totalIncome) * 100 : 0;

      // Monthly breakdown
      const monthlyData: Record<string, any> = {};
      approvedRecords.forEach((record) => {
        const date = new Date(record.dateReceived);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            }),
            taxIncome: 0,
            donationIncome: 0,
            totalIncome: 0,
          };
        }

        if (record.incomeType === "tax") {
          monthlyData[monthKey].taxIncome += record.amount;
        } else {
          monthlyData[monthKey].donationIncome += record.amount;
        }
        monthlyData[monthKey].totalIncome += record.amount;
      });

      const monthlyBreakdown = Object.values(monthlyData);

      // Category breakdown
      const categoryData: Record<string, any> = {};
      approvedRecords.forEach((record) => {
        const categoryId = record.category.id;
        if (!categoryData[categoryId]) {
          categoryData[categoryId] = {
            categoryId,
            categoryName: record.category.name,
            amount: 0,
            percentage: 0,
          };
        }
        categoryData[categoryId].amount += record.amount;
      });

      const categoryBreakdown = Object.values(categoryData).map((cat: any) => ({
        ...cat,
        percentage: totalIncome > 0 ? (cat.amount / totalIncome) * 100 : 0,
      }));

      return {
        totalIncome,
        taxIncome,
        donationIncome,
        taxPercentage,
        donationPercentage,
        monthlyBreakdown,
        categoryBreakdown,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate income analytics: ${error.message}`);
    }
  }

  static async getIncomeComparison(
    currentStartDate: string,
    currentEndDate: string,
    previousStartDate: string,
    previousEndDate: string,
  ): Promise<{
    current: { taxIncome: number; donationIncome: number; totalIncome: number };
    previous: {
      taxIncome: number;
      donationIncome: number;
      totalIncome: number;
    };
    growth: { taxGrowth: number; donationGrowth: number; totalGrowth: number };
  }> {
    try {
      const [currentRecords, previousRecords] = await Promise.all([
        IncomeRecordService.getIncomeByPeriod(currentStartDate, currentEndDate),
        IncomeRecordService.getIncomeByPeriod(
          previousStartDate,
          previousEndDate,
        ),
      ]);

      const currentApproved = currentRecords.filter(
        (r) => r.status === "approved",
      );
      const previousApproved = previousRecords.filter(
        (r) => r.status === "approved",
      );

      const currentGrouped = groupIncomeByType(currentApproved);
      const previousGrouped = groupIncomeByType(previousApproved);

      const current = {
        taxIncome: calculateTotalIncome(currentGrouped.taxIncome),
        donationIncome: calculateTotalIncome(currentGrouped.donationIncome),
        totalIncome: calculateTotalIncome(currentApproved),
      };

      const previous = {
        taxIncome: calculateTotalIncome(previousGrouped.taxIncome),
        donationIncome: calculateTotalIncome(previousGrouped.donationIncome),
        totalIncome: calculateTotalIncome(previousApproved),
      };

      const growth = {
        taxGrowth:
          previous.taxIncome > 0
            ? ((current.taxIncome - previous.taxIncome) / previous.taxIncome) *
              100
            : 0,
        donationGrowth:
          previous.donationIncome > 0
            ? ((current.donationIncome - previous.donationIncome) /
                previous.donationIncome) *
              100
            : 0,
        totalGrowth:
          previous.totalIncome > 0
            ? ((current.totalIncome - previous.totalIncome) /
                previous.totalIncome) *
              100
            : 0,
      };

      return { current, previous, growth };
    } catch (error: any) {
      throw new Error(`Failed to generate income comparison: ${error.message}`);
    }
  }
}

// Bulk Operations Service
export class IncomeBulkOperationsService {
  static async bulkUpdateIncomeStatus(
    recordIds: string[],
    status: IncomeStatus,
    approvedBy?: string,
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      };

      if (status === "approved" && approvedBy) {
        updateData.approvedBy = approvedBy;
        updateData.approvedDate = new Date().toISOString();
      }

      recordIds.forEach((id) => {
        const docRef = doc(incomeRecordsCollection, id);
        batch.update(docRef, updateData);
      });

      await batch.commit();
    } catch (error: any) {
      throw new Error(`Failed to bulk update income status: ${error.message}`);
    }
  }

  static async bulkDeleteIncomeRecords(recordIds: string[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      recordIds.forEach((id) => {
        const docRef = doc(incomeRecordsCollection, id);
        batch.delete(docRef);
      });
      await batch.commit();
    } catch (error: any) {
      throw new Error(`Failed to bulk delete income records: ${error.message}`);
    }
  }
}
