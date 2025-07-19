import React, { createContext, useContext, useReducer, useEffect } from "react";
import { Personnel, AuthUser, PersonnelFormData } from "@shared/personnel";

interface AppState {
  user: AuthUser | null;
  personnel: Personnel[];
  isLoading: boolean;
}

type AppAction =
  | { type: "LOGIN"; payload: AuthUser }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PERSONNEL"; payload: Personnel[] }
  | { type: "ADD_PERSONNEL"; payload: Personnel }
  | { type: "UPDATE_PERSONNEL"; payload: Personnel }
  | { type: "DELETE_PERSONNEL"; payload: string };

const initialState: AppState = {
  user: null,
  personnel: [],
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
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
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addPersonnel: (data: PersonnelFormData) => Promise<void>;
  updatePersonnel: (data: Personnel) => Promise<void>;
  deletePersonnel: (id: string) => Promise<void>;
  loadPersonnel: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("pdf-user");
    const savedPersonnel = localStorage.getItem("pdf-personnel");

    if (savedUser) {
      const user = JSON.parse(savedUser);
      dispatch({ type: "LOGIN", payload: user });
    }

    if (savedPersonnel) {
      const personnel = JSON.parse(savedPersonnel);
      dispatch({ type: "SET_PERSONNEL", payload: personnel });
    }
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    // Simple authentication - in real app would call API
    if (username === "admin" && password === "pdf2024") {
      const user: AuthUser = { username, isAuthenticated: true };
      localStorage.setItem("pdf-user", JSON.stringify(user));
      dispatch({ type: "LOGIN", payload: user });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("pdf-user");
    dispatch({ type: "LOGOUT" });
  };

  const savePersonnelToStorage = (personnel: Personnel[]) => {
    localStorage.setItem("pdf-personnel", JSON.stringify(personnel));
  };

  const addPersonnel = async (data: PersonnelFormData): Promise<void> => {
    const newPersonnel: Personnel = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPersonnel = [...state.personnel, newPersonnel];
    savePersonnelToStorage(updatedPersonnel);
    dispatch({ type: "ADD_PERSONNEL", payload: newPersonnel });
  };

  const updatePersonnel = async (data: Personnel): Promise<void> => {
    const updatedData = { ...data, updatedAt: new Date().toISOString() };
    const updatedPersonnel = state.personnel.map((p) =>
      p.id === data.id ? updatedData : p,
    );
    savePersonnelToStorage(updatedPersonnel);
    dispatch({ type: "UPDATE_PERSONNEL", payload: updatedData });
  };

  const deletePersonnel = async (id: string): Promise<void> => {
    const updatedPersonnel = state.personnel.filter((p) => p.id !== id);
    savePersonnelToStorage(updatedPersonnel);
    dispatch({ type: "DELETE_PERSONNEL", payload: id });
  };

  const loadPersonnel = async (): Promise<void> => {
    // In real app, would fetch from API
    const saved = localStorage.getItem("pdf-personnel");
    if (saved) {
      const personnel = JSON.parse(saved);
      dispatch({ type: "SET_PERSONNEL", payload: personnel });
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
