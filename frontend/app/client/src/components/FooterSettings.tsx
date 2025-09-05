import { useState } from "react";

export default function FooterSettings() {
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const handleThemeChange = (val: "dark" | "light") => {
    setTheme(val);
    if (val === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="w-full border-t border-slate-700 bg-slate-900 p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
      <select
        aria-label="언어 선택"
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-slate-100"
      >
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>

      <select
        aria-label="테마 선택"
        value={theme}
        onChange={(e) => handleThemeChange(e.target.value as any)}
        className="rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-slate-100"
      >
        <option value="dark">다크 모드</option>
        <option value="light">라이트 모드</option>
      </select>

      <select
        aria-label="화면 모드"
        value={device}
        onChange={(e) => setDevice(e.target.value as any)}
        className="rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-slate-100"
      >
        <option value="desktop">노트북 모드</option>
        <option value="mobile">핸드폰 모드</option>
      </select>
    </div>
  );
}
