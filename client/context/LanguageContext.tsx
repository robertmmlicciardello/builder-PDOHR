import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  TranslationData,
  SupportedLanguage,
  getTranslations,
  defaultLanguage,
} from "../../shared/translations";

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  translations: TranslationData;
  setLanguage: (language: SupportedLanguage) => void;
  availableLanguages: {
    code: SupportedLanguage;
    name: string;
    nativeName: string;
  }[];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

const LANGUAGE_STORAGE_KEY = "pdf-hr-language";

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    () => {
      // Try to get language from localStorage first, fallback to default
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return (stored as SupportedLanguage) || defaultLanguage;
    },
  );

  const [translations, setTranslations] = useState<TranslationData>(() =>
    getTranslations(currentLanguage),
  );

  const availableLanguages = [
    { code: "en" as SupportedLanguage, name: "English", nativeName: "English" },
    { code: "mm" as SupportedLanguage, name: "Myanmar", nativeName: "မြန်မာ" },
  ];

  // Myanmar script is not RTL, but we include this for future language support
  const isRTL = false;

  const setLanguage = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    setTranslations(getTranslations(language));
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    // Update HTML lang attribute for accessibility
    document.documentElement.lang = language === "mm" ? "my" : "en";
  };

  useEffect(() => {
    // Set initial HTML lang attribute
    document.documentElement.lang = currentLanguage === "mm" ? "my" : "en";
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    translations,
    setLanguage,
    availableLanguages,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen">
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Helper hook for easy translation access
export const useTranslation = () => {
  const { translations } = useLanguage();
  return translations;
};

// Helper function to get nested translation values
export const getNestedTranslation = (
  translations: TranslationData,
  path: string,
): string => {
  const keys = path.split(".");
  let value: any = translations;

  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return path; // Return the path if translation not found
    }
  }

  return typeof value === "string" ? value : path;
};

export default LanguageContext;
