import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

type Lang = "ko" | "en";
type NavItem = { href: string; label: string };

const NAV_ITEMS: Record<Lang, NavItem[]> = {
  ko: [
    { href: "#home", label: "홈" },
    { href: "#about", label: "소개" },
    { href: "#education", label: "교육" },
    { href: "#skills", label: "기술" },
    { href: "#projects", label: "프로젝트" },
    { href: "#contact", label: "연락처" },
  ],
  en: [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#education", label: "Education" },
    { href: "#skills", label: "Skills" },
    { href: "#projects", label: "Projects" },
    { href: "#contact", label: "Contact" },
  ],
};

export default function Navigation({ language = "ko" }: { language?: Lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = NAV_ITEMS[language];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur bg-background/70 border-b">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-14 flex items-center justify-between">
            <a href="#home" className="font-semibold text-2xl tracking-tight">
              Portfolio
            </a>

            {/* 데스크탑 메뉴 */}
            <div className="hidden md:flex items-center gap-8">
              {items.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  className="text-[17px] leading-none text-foreground/80 hover:text-foreground"
                >
                  {it.label}
                </a>
              ))}
            </div>

            {/* 모바일 메뉴 토글 */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 border"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        <div
          id="mobile-nav"
          ref={ref}
          className={`md:hidden border-t ${open ? "block" : "hidden"}`}
        >
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col gap-3">
              {items.map((it) => (
                <a
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-foreground/80 hover:text-foreground"
                >
                  {it.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
