// Income Management System Data Models

export interface IncomeRecord {
  id: string;
  type: TransactionType; // Income or Expense
  incomeType?: IncomeType; // Only for income records
  amount: number;
  currency: string;
  description: string;
  descriptionMyanmar: string;
  source?: string; // Source of income
  sourceMyanmar?: string;
  expenseCategory?: string; // For expenses - free text field
  dateReceived: string; // ISO date (or expense date)
  receivedBy: string; // Employee who received/recorded
  category?: IncomeCategory; // Only for predefined income categories
  status: IncomeStatus;
  documentUrl?: string; // Receipt or document
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeSummary {
  id: string;
  period: {
    start: string;
    end: string;
  };
  taxIncome: {
    total: number;
    count: number;
    records: IncomeRecord[];
  };
  donationIncome: {
    total: number;
    count: number;
    records: IncomeRecord[];
  };
  totalIncome: number;
  currency: string;
  generatedBy: string;
  generatedAt: string;
}

export interface IncomeCategory {
  id: string;
  name: string;
  nameMyanmar: string;
  description?: string;
  incomeType: IncomeType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeTarget {
  id: string;
  incomeType: IncomeType;
  targetAmount: number;
  period: "monthly" | "quarterly" | "yearly";
  year: number;
  month?: number; // For monthly targets
  quarter?: number; // For quarterly targets
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Enums
export type TransactionType = "income" | "expense";
export type IncomeType = "tax" | "donation";
export type IncomeStatus = "pending" | "verified" | "approved" | "rejected";

// Default income categories
export const DEFAULT_INCOME_CATEGORIES: Omit<
  IncomeCategory,
  "id" | "createdAt" | "updatedAt"
>[] = [
  // Tax Income Categories
  {
    name: "Income Tax",
    nameMyanmar: "ဝင်ငွေခွန်",
    description: "Personal and corporate income tax collections",
    incomeType: "tax",
    isActive: true,
  },
  {
    name: "Commercial Tax",
    nameMyanmar: "စီးပွားရေးခွန်",
    description: "Commercial tax from businesses",
    incomeType: "tax",
    isActive: true,
  },
  {
    name: "Property Tax",
    nameMyanmar: "ပစ္���ည်းခွန်",
    description: "Tax from property ownership",
    incomeType: "tax",
    isActive: true,
  },
  {
    name: "Service Tax",
    nameMyanmar: "ဝန်ဆောင်မှုခွန်",
    description: "Tax from services provided",
    incomeType: "tax",
    isActive: true,
  },
  {
    name: "Import/Export Tax",
    nameMyanmar: "တင်သွင်း/တင်ပို့ခွန်",
    description: "Customs and trade taxes",
    incomeType: "tax",
    isActive: true,
  },

  // Donation Categories
  {
    name: "Individual Donations",
    nameMyanmar: "ကိုယ်တိုင်အလှူ",
    description: "Donations from individuals",
    incomeType: "donation",
    isActive: true,
  },
  {
    name: "Corporate Donations",
    nameMyanmar: "ကုမ္ပဏီအလှူ",
    description: "Donations from businesses and corporations",
    incomeType: "donation",
    isActive: true,
  },
  {
    name: "International Donations",
    nameMyanmar: "နိုင်ငံတကာအလှူ",
    description: "Donations from international organizations",
    incomeType: "donation",
    isActive: true,
  },
  {
    name: "Community Donations",
    nameMyanmar: "လူမှုအလှူ",
    description: "Donations from community groups",
    incomeType: "donation",
    isActive: true,
  },
  {
    name: "Emergency Donations",
    nameMyanmar: "အရေးပေါ်အလှူ",
    description: "Emergency and disaster relief donations",
    incomeType: "donation",
    isActive: true,
  },
];

// Helper functions
export function calculateTotalIncome(records: IncomeRecord[]): number {
  return records.reduce((total, record) => {
    if (record.status === "approved") {
      return total + record.amount;
    }
    return total;
  }, 0);
}

export function groupIncomeByType(records: IncomeRecord[]): {
  taxIncome: IncomeRecord[];
  donationIncome: IncomeRecord[];
} {
  const taxIncome = records.filter((record) => record.incomeType === "tax");
  const donationIncome = records.filter(
    (record) => record.incomeType === "donation",
  );

  return { taxIncome, donationIncome };
}

export function calculateIncomeByPeriod(
  records: IncomeRecord[],
  startDate: string,
  endDate: string,
): IncomeRecord[] {
  return records.filter((record) => {
    const recordDate = record.dateReceived;
    return recordDate >= startDate && recordDate <= endDate;
  });
}

export function generateIncomeSummary(
  records: IncomeRecord[],
  startDate: string,
  endDate: string,
  generatedBy: string,
): IncomeSummary {
  const periodRecords = calculateIncomeByPeriod(records, startDate, endDate);
  const { taxIncome, donationIncome } = groupIncomeByType(periodRecords);

  const taxTotal = calculateTotalIncome(taxIncome);
  const donationTotal = calculateTotalIncome(donationIncome);

  return {
    id: `summary-${Date.now()}`,
    period: {
      start: startDate,
      end: endDate,
    },
    taxIncome: {
      total: taxTotal,
      count: taxIncome.length,
      records: taxIncome,
    },
    donationIncome: {
      total: donationTotal,
      count: donationIncome.length,
      records: donationIncome,
    },
    totalIncome: taxTotal + donationTotal,
    currency: "MMK",
    generatedBy,
    generatedAt: new Date().toISOString(),
  };
}

export function validateIncomeRecord(record: Partial<IncomeRecord>): string[] {
  const errors: string[] = [];

  if (!record.amount || record.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (!record.description?.trim()) {
    errors.push("Description is required");
  }

  if (!record.source?.trim()) {
    errors.push("Income source is required");
  }

  if (!record.dateReceived) {
    errors.push("Date received is required");
  }

  if (!record.receivedBy?.trim()) {
    errors.push("Received by is required");
  }

  if (!record.incomeType) {
    errors.push("Income type is required");
  }

  return errors;
}

export function formatCurrency(
  amount: number,
  currency: string = "MMK",
): string {
  return `${amount.toLocaleString()} ${currency}`;
}

export function getIncomeTypeLabel(
  type: IncomeType,
  language: "en" | "mm" = "en",
): string {
  const labels = {
    tax: {
      en: "Tax Income",
      mm: "အခွန်ဝင်ငွေ",
    },
    donation: {
      en: "Donation Income",
      mm: "အလှူဝင်ငွေ",
    },
  };

  return labels[type][language];
}

export function getIncomeStatusLabel(
  status: IncomeStatus,
  language: "en" | "mm" = "en",
): string {
  const labels = {
    pending: {
      en: "Pending",
      mm: "စောင့်ဆိုင်းနေ",
    },
    verified: {
      en: "Verified",
      mm: "အတည်ပြ���ပြီး",
    },
    approved: {
      en: "Approved",
      mm: "ခွင့်ပြုပြီး",
    },
    rejected: {
      en: "Rejected",
      mm: "ပယ်ချပြီး",
    },
  };

  return labels[status][language];
}

export function getTransactionTypeLabel(
  type: TransactionType,
  language: "en" | "mm" = "en",
): string {
  const labels = {
    income: {
      en: "Income",
      mm: "ဝင်ငွေ",
    },
    expense: {
      en: "Expense",
      mm: "သုံးငွေ",
    },
  };

  return labels[type][language];
}

export function groupTransactionsByType(records: IncomeRecord[]): {
  incomeRecords: IncomeRecord[];
  expenseRecords: IncomeRecord[];
} {
  const incomeRecords = records.filter((record) => record.type === "income");
  const expenseRecords = records.filter((record) => record.type === "expense");

  return { incomeRecords, expenseRecords };
}

export function calculateBalance(records: IncomeRecord[]): {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
} {
  const { incomeRecords, expenseRecords } = groupTransactionsByType(records);

  const totalIncome = calculateTotalIncome(incomeRecords);
  const totalExpenses = expenseRecords.reduce((total, record) => {
    if (record.status === "approved") {
      return total + record.amount;
    }
    return total;
  }, 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

// Category Management Functions
export function validateIncomeCategory(
  category: Partial<IncomeCategory>,
): string[] {
  const errors: string[] = [];

  if (!category.name?.trim()) {
    errors.push("Category name is required");
  }

  if (!category.nameMyanmar?.trim()) {
    errors.push("Myanmar name is required");
  }

  if (!category.incomeType) {
    errors.push("Income type is required");
  }

  return errors;
}
