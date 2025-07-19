import React, { createContext, useContext, useReducer, useEffect } from "react";
import {
  Personnel,
  AuthUser,
  PersonnelFormData,
  PersonnelStatus,
  generatePersonnelId,
  validatePersonnelId,
} from "@shared/personnel";
import { translations } from "@shared/translations";
import { EncryptionService, ENCRYPTED_FIELDS } from "../services/encryption";
import {
  AuthService,
  PersonnelService,
  AuditService,
} from "../services/firebase";

interface AppState {
  user: AuthUser | null;
  personnel: Personnel[];
  isLoading: boolean;
  isOffline: boolean;
  error: string | null;
  ranks: Array<{ id: string; name: string; order: number }>;
  organizations: Array<{ id: string; name: string; type: string }>;
}

type AppAction =
  | { type: "LOGIN"; payload: AuthUser }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_OFFLINE"; payload: boolean }
  | { type: "SET_PERSONNEL"; payload: Personnel[] }
  | { type: "ADD_PERSONNEL"; payload: Personnel }
  | { type: "UPDATE_PERSONNEL"; payload: Personnel }
  | { type: "DELETE_PERSONNEL"; payload: string }
  | {
      type: "SET_RANKS";
      payload: Array<{ id: string; name: string; order: number }>;
    }
  | {
      type: "SET_ORGANIZATIONS";
      payload: Array<{ id: string; name: string; type: string }>;
    };

const initialState: AppState = {
  user: null,
  personnel: [],
  isLoading: false,
  isOffline: false,
  error: null,
  ranks: [
    { id: "1", name: "တပ်သား", order: 1 },
    { id: "2", name: "တပ်ကြပ်", order: 2 },
    { id: "3", name: "တပ်ကြပ်ကြီး", order: 3 },
    { id: "4", name: "ဒုတပ်မှူး", order: 4 },
    { id: "5", name: "တပ်မှူး", order: 5 },
    { id: "6", name: "အရာရှိ", order: 6 },
    { id: "7", name: "တာဝန်ခံ", order: 7 },
  ],
  organizations: [
    { id: "1", name: "ပ���ဖ နည်းပညာလက်ရုံးတပ်", type: "headquarters" },
    { id: "2", name: "ရန်ကုန်တိုင်း", type: "region" },
    { id: "3", name: "မန္တလေးတိုင်း", type: "region" },
    { id: "4", name: "စစ်ကိုင်းတိုင်း", type: "region" },
  ],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload, error: null };
    case "LOGOUT":
      return { ...state, user: null, personnel: [] };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "SET_OFFLINE":
      return { ...state, isOffline: action.payload };
    case "SET_PERSONNEL":
      return { ...state, personnel: action.payload };
    case "ADD_PERSONNEL":
      return { ...state, personnel: [...state.personnel, action.payload] };
    case "UPDATE_PERSONNEL":
      return {
        ...state,
        personnel: state.personnel.map((p) =>
          p.id === action.payload.id ? action.payload : p,
        ),
      };
    case "DELETE_PERSONNEL":
      return {
        ...state,
        personnel: state.personnel.filter((p) => p.id !== action.payload),
      };
    case "SET_RANKS":
      return { ...state, ranks: action.payload };
    case "SET_ORGANIZATIONS":
      return { ...state, organizations: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addPersonnel: (data: PersonnelFormData) => Promise<void>;
  updatePersonnel: (data: Personnel) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  loadPersonnel: () => Promise<void>;
  generateNewId: () => string;
  validateForm: (data: PersonnelFormData, isEditing?: boolean) => string[];
  showNotification: (
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    // Initialize encryption
    EncryptionService.initialize();

    // Load saved data for offline support
    loadOfflineData();

    // Monitor network status
    const handleOnline = () =>
      dispatch({ type: "SET_OFFLINE", payload: false });
    const handleOffline = () =>
      dispatch({ type: "SET_OFFLINE", payload: true });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial offline status
    dispatch({ type: "SET_OFFLINE", payload: !navigator.onLine });

    // Listen for auth state changes
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      if (user) {
        dispatch({ type: "LOGIN", payload: user });
        loadPersonnel();
      } else {
        dispatch({ type: "LOGOUT" });
      }
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const savedPersonnel = localStorage.getItem("pdf-personnel");
      const savedRanks = localStorage.getItem("pdf-ranks");
      const savedOrgs = localStorage.getItem("pdf-organizations");

      if (savedPersonnel) {
        const personnel = JSON.parse(savedPersonnel);
        // Decrypt sensitive fields for local display
        const decryptedPersonnel = personnel.map((p: Personnel) => ({
          ...p,
          assignedDuties: p.assignedDuties
            ? p.assignedDuties.includes("encrypted:")
              ? EncryptionService.decrypt(
                  p.assignedDuties.replace("encrypted:", ""),
                )
              : p.assignedDuties
            : "",
        }));
        dispatch({ type: "SET_PERSONNEL", payload: decryptedPersonnel });
      }

      if (savedRanks) {
        dispatch({ type: "SET_RANKS", payload: JSON.parse(savedRanks) });
      }

      if (savedOrgs) {
        dispatch({ type: "SET_ORGANIZATIONS", payload: JSON.parse(savedOrgs) });
      }
    } catch (error) {
      console.error("Failed to load offline data:", error);
    }
  };

  const saveOfflineData = (personnelData: Personnel[]) => {
    try {
      // Encrypt sensitive fields before saving
      const encryptedPersonnel = personnelData.map((p) => ({
        ...p,
        assignedDuties: p.assignedDuties
          ? "encrypted:" + EncryptionService.encrypt(p.assignedDuties)
          : "",
      }));
      localStorage.setItem("pdf-personnel", JSON.stringify(encryptedPersonnel));
    } catch (error) {
      console.error("Failed to save offline data:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      // For demo purposes, use simple credentials
      if (email === "admin@pdf.gov.mm" && password === "pdf2024") {
        const user: AuthUser = {
          uid: "admin-123",
          email,
          displayName: "PDF Administrator",
          isAuthenticated: true,
          role: "admin",
        };
        dispatch({ type: "LOGIN", payload: user });

        // Log audit
        AuditService.logAction({
          userId: user.uid,
          userName: user.displayName || user.email,
          action: "login",
          resourceType: "personnel",
          resourceId: "",
          timestamp: new Date().toISOString(),
        });

        showNotification(translations.messages.saved, "success");
        return true;
      } else if (email === "user@pdf.gov.mm" && password === "user2024") {
        const user: AuthUser = {
          uid: "user-456",
          email,
          displayName: "PDF User",
          isAuthenticated: true,
          role: "user",
        };
        dispatch({ type: "LOGIN", payload: user });
        showNotification(translations.messages.saved, "success");
        return true;
      }

      // In production, use Firebase Auth
      // const user = await AuthService.signIn(email, password);
      // dispatch({ type: "LOGIN", payload: user });

      dispatch({
        type: "SET_ERROR",
        payload: translations.auth.invalidCredentials,
      });
      return false;
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async () => {
    try {
      if (state.user) {
        // Log audit
        AuditService.logAction({
          userId: state.user.uid,
          userName: state.user.displayName || state.user.email,
          action: "logout",
          resourceType: "personnel",
          resourceId: "",
          timestamp: new Date().toISOString(),
        });
      }

      // In production, use Firebase Auth
      // await AuthService.signOut();

      dispatch({ type: "LOGOUT" });
      localStorage.removeItem("pdf-user");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const generateNewId = (): string => {
    const existingIds = state.personnel.map((p) => p.id);
    return generatePersonnelId(existingIds);
  };

  const validateForm = (
    data: PersonnelFormData,
    isEditing = false,
  ): string[] => {
    const errors: string[] = [];

    if (!data.id.trim()) {
      errors.push(
        translations.validation.required + ": " + translations.personnel.id,
      );
    } else if (!validatePersonnelId(data.id)) {
      errors.push(translations.validation.idFormat);
    } else if (!isEditing && state.personnel.some((p) => p.id === data.id)) {
      errors.push(translations.validation.duplicateId);
    }

    if (!data.name.trim()) {
      errors.push(
        translations.validation.required + ": " + translations.personnel.name,
      );
    }

    if (!data.rank.trim()) {
      errors.push(
        translations.validation.required + ": " + translations.personnel.rank,
      );
    }

    if (!data.dateOfJoining) {
      errors.push(
        translations.validation.required +
          ": " +
          translations.personnel.dateOfJoining,
      );
    }

    if (!data.assignedDuties.trim()) {
      errors.push(
        translations.validation.required +
          ": " +
          translations.personnel.assignedDuties,
      );
    }

    if (!data.organization.trim()) {
      errors.push(
        translations.validation.required +
          ": " +
          translations.personnel.organization,
      );
    }

    if (
      data.dateOfLeaving &&
      data.dateOfJoining &&
      new Date(data.dateOfLeaving) < new Date(data.dateOfJoining)
    ) {
      errors.push(translations.validation.leavingBeforeJoining);
    }

    return errors;
  };

  const addPersonnel = async (data: PersonnelFormData): Promise<void> => {
    if (!state.user) throw new Error("User not authenticated");

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const newPersonnel: Personnel = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: state.user.uid,
        updatedBy: state.user.uid,
      };

      // In production, save to Firebase
      // await PersonnelService.addPersonnel(newPersonnel);

      const updatedPersonnel = [...state.personnel, newPersonnel];
      saveOfflineData(updatedPersonnel);
      dispatch({ type: "ADD_PERSONNEL", payload: newPersonnel });

      // Log audit
      AuditService.logAction({
        userId: state.user.uid,
        userName: state.user.displayName || state.user.email,
        action: "create",
        resourceType: "personnel",
        resourceId: newPersonnel.id,
        newData: newPersonnel,
        timestamp: new Date().toISOString(),
      });

      showNotification(translations.messages.saved, "success");
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updatePersonnel = async (data: Personnel): Promise<void> => {
    if (!state.user) throw new Error("User not authenticated");

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const oldData = state.personnel.find((p) => p.id === data.id);
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: state.user.uid,
      };

      // In production, save to Firebase
      // await PersonnelService.updatePersonnel(data.id, updatedData);

      const updatedPersonnel = state.personnel.map((p) =>
        p.id === data.id ? updatedData : p,
      );
      saveOfflineData(updatedPersonnel);
      dispatch({ type: "UPDATE_PERSONNEL", payload: updatedData });

      // Log audit
      AuditService.logAction({
        userId: state.user.uid,
        userName: state.user.displayName || state.user.email,
        action: "update",
        resourceType: "personnel",
        resourceId: data.id,
        oldData,
        newData: updatedData,
        timestamp: new Date().toISOString(),
      });

      showNotification(translations.messages.updated, "success");
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const deletePersonnel = async (id: string): Promise<void> => {
    if (!state.user) throw new Error("User not authenticated");

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const personToDelete = state.personnel.find((p) => p.id === id);

      // In production, delete from Firebase
      // await PersonnelService.deletePersonnel(id);

      const updatedPersonnel = state.personnel.filter((p) => p.id !== id);
      saveOfflineData(updatedPersonnel);
      dispatch({ type: "DELETE_PERSONNEL", payload: id });

      // Log audit
      AuditService.logAction({
        userId: state.user.uid,
        userName: state.user.displayName || state.user.email,
        action: "delete",
        resourceType: "personnel",
        resourceId: id,
        oldData: personToDelete,
        timestamp: new Date().toISOString(),
      });

      showNotification(translations.messages.deleted, "success");
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const loadPersonnel = async (): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // In production, load from Firebase
      // const result = await PersonnelService.getPersonnel();
      // dispatch({ type: "SET_PERSONNEL", payload: result.data });

      // For now, keep using localStorage
      loadOfflineData();
    } catch (error: any) {
      dispatch({ type: "SET_ERROR", payload: error.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    // This would integrate with a toast notification system
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Simple browser notification for now
    if (type === "error") {
      console.error(message);
    } else {
      console.log(message);
    }
  };

  return (
    <AppContext.Provider
      value={{
        state,
        login,
        logout,
        addPersonnel,
        updatePersonnel,
        deletePersonnel,
        loadPersonnel,
        generateNewId,
        validateForm,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
