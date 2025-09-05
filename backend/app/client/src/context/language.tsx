import React, { createContext, useContext, useMemo, useState } from "react";

export type Lang = "ko" | "en";

type Ctx = {
  language: Lang;
  setLanguage: (l: Lang) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>("ko");

  const value = useMemo<Ctx>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((prev) => (prev === "ko" ? "en" : "ko")),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}
