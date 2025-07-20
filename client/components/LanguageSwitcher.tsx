import React from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useLanguage } from "../context/LanguageContext";
import { SupportedLanguage } from "../../shared/translations";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "ghost",
  size = "default",
  showText = true,
}) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  const currentLangInfo = availableLanguages.find(
    (lang) => lang.code === currentLanguage,
  );

  const handleLanguageChange = (languageCode: SupportedLanguage) => {
    setLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          {showText && size !== "icon" && (
            <span className="hidden sm:inline">
              {currentLangInfo?.nativeName || currentLangInfo?.name}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              currentLanguage === language.code
                ? "bg-accent text-accent-foreground"
                : ""
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">
                {language.name}
              </span>
            </div>
            {currentLanguage === language.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
