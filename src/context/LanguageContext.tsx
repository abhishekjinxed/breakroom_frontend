import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { LanguageCode, supportedLanguages, TranslationKey, translations } from "../i18n/translations";

const LANGUAGE_KEY = "breakroom_language";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function resolveLanguage(value?: string | null): LanguageCode {
  return supportedLanguages.includes(value as LanguageCode) ? (value as LanguageCode) : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setCurrentLanguage] = useState<LanguageCode>(() => resolveLanguage(getLocales()[0]?.languageCode));

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((saved) => {
      if (saved) setCurrentLanguage(resolveLanguage(saved));
    });
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: async (nextLanguage) => {
      setCurrentLanguage(nextLanguage);
      await AsyncStorage.setItem(LANGUAGE_KEY, nextLanguage);
    },
    t: (key) => translations[language][key] ?? translations.en[key],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
