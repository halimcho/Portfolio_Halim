import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";
type Lang = "ko" | "en";

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("site-theme") as Theme | null;
    return saved ?? "dark";
  });
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("site-lang") as Lang | null;
    return saved ?? "ko";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("site-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("site-lang", lang);
  }, [lang]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => (prev === "dark" ? "light" : "dark"));
  const setLang = (l: Lang) => setLangState(l);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme, lang, setLang }), [theme, lang]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeCtx() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeCtx must be used within ThemeProvider");
  return ctx;
}
