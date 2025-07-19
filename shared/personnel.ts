export interface Personnel {
  id: string; // e.g., P14034
  rank: string; // e.g., Soldier, Officer
  name: string;
  dateOfJoining: string; // ISO date string
  dateOfLeaving?: string; // ISO date string, optional
  assignedDuties: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonnelFormData {
  id: string;
  rank: string;
  name: string;
  dateOfJoining: string;
  dateOfLeaving?: string;
  assignedDuties: string;
}

export interface PersonnelFilters {
  search?: string; // Search by ID, name, or rank
  rank?: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface PersonnelReport {
  totalMembers: number;
  newEntries: number;
  resignations: number;
  byRank: Record<string, number>;
  dateGenerated: string;
}

export interface AuthUser {
  username: string;
  isAuthenticated: boolean;
}

export const RANKS = [
  "Soldier",
  "Corporal",
  "Sergeant",
  "Lieutenant",
  "Captain",
  "Major",
  "Colonel",
  "General",
] as const;

export type Rank = (typeof RANKS)[number];
