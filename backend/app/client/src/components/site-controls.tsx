import { useEffect, useState } from "react";
import { ChevronDown, Globe, Sun, Moon } from "lucide-react";
import { useLanguage } from "@/context/language";

export default function SiteControls() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const [isDark, setIsDark] = useState<boolean>(
    document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDark]);

  return (
    <div className="fixed left-4 bottom-4 z-50 select-none">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full px-4 py-2 bg-slate-800 text-white shadow"
      >
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="text-sm">{language === "ko" ? "설정" : "Settings"}</span>
      </button>

      {open && (
        <div className="mt-3 w-80 rounded-xl bg-slate-800 text-white p-4 shadow-2xl ring-1 ring-black/10">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
              <Globe className="h-4 w-4" />
              <span>{language === "ko" ? "언어" : "Language"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLanguage("ko")}
                className={`h-10 rounded-lg border px-3 ${
                  language === "ko"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900 border-slate-700 text-white/80"
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`h-10 rounded-lg border px-3 ${
                  language === "en"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900 border-slate-700 text-white/80"
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-sm opacity-90">
              {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{language === "ko" ? "테마" : "Theme"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsDark(true)}
                className={`h-10 rounded-lg border px-3 ${
                  isDark
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900 border-slate-700 text-white/80"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setIsDark(false)}
                className={`h-10 rounded-lg border px-3 ${
                  !isDark
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900 border-slate-700 text-white/80"
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
