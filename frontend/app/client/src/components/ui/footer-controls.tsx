import { useState, useEffect } from "react";
import { useLanguage } from "@/context/language";
import { Settings, Globe, Sun } from "lucide-react";

export default function FooterControls() {
  const { language, setLanguage, toggleLanguage } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <div className="fixed left-4 bottom-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-4 py-2 rounded-full bg-slate-800 text-white shadow hover:bg-slate-700"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm">설정</span>
      </button>

      {open && (
        <div className="mt-2 w-56 rounded-2xl bg-slate-900 text-white shadow-xl p-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
              <Globe className="w-4 h-4" />
              <span>언어</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage("ko")}
                className={`px-3 py-2 rounded-md text-sm ${
                  language === "ko"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-2 rounded-md text-sm ${
                  language === "en"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-gray-300 mb-2">
              <Sun className="w-4 h-4" />
              <span>테마</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme("dark")}
                className={`px-3 py-2 rounded-md text-sm ${
                  theme === "dark"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`px-3 py-2 rounded-md text-sm ${
                  theme === "light"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
