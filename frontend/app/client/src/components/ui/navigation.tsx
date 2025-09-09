import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";

type Lang = "ko" | "en";
type NavItem = { href: string; label: string };

// --- JWT 디코더 (경량, 라이브러리 없이) ---
function decodeJwt<T = any>(token: string): T | null {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

type JwtPayload = {
  sub?: string;
  nickname?: string;
  email?: string;
  exp?: number;
};

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem("auth_token"));
  const [displayName, setDisplayName] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 토큰 → 닉네임 파싱
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoggedIn(false);
      setDisplayName(null);
      return;
    }
    const payload = decodeJwt<JwtPayload>(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      // 만료되면 정리
      localStorage.removeItem("auth_token");
      setIsLoggedIn(false);
      setDisplayName(null);
      return;
    }
    setIsLoggedIn(true);
    setDisplayName(payload.nickname || payload.email || "사용자");
  }, []);

  // 탭 간 동기화
  useEffect(() => {
    const onStorage = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoggedIn(false);
        setDisplayName(null);
        return;
      }
      const payload = decodeJwt<JwtPayload>(token);
      setIsLoggedIn(!!payload);
      setDisplayName(payload?.nickname || payload?.email || "사용자");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = () => {
    window.location.href = `${API_BASE}/auth/kakao/login`;
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setDisplayName(null);
  };

  const items = NAV_ITEMS[language];

  const Greeting = () =>
    isLoggedIn && displayName ? (
      <span className="text-sm text-foreground/70">환영해요, <b>{displayName}</b>님</span>
    ) : null;

  const DesktopAuth = () => (
    <div className="flex items-center gap-3">
      <Greeting />
      {isLoggedIn ? (
        <button
          onClick={logout}
          className="px-3 py-1 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600"
        >
          로그아웃
        </button>
      ) : (
        <button
          onClick={login}
          className="px-3 py-1 rounded-md bg-yellow-400 text-black font-semibold hover:bg-yellow-500"
        >
          로그인
        </button>
      )}
    </div>
  );

  const MobileAuth = () => (
    <div className="flex flex-col gap-2">
      <Greeting />
      {isLoggedIn ? (
        <button
          onClick={() => {
            logout();
            setOpen(false);
          }}
          className="px-3 py-2 rounded-md bg-red-500 text-white font-semibold hover:bg-red-600 text-left"
        >
          로그아웃
        </button>
      ) : (
        <button
          onClick={() => {
            login();
            setOpen(false);
          }}
          className="px-3 py-2 rounded-md bg-yellow-400 text-black font-semibold hover:bg-yellow-500 text-left"
        >
          로그인
        </button>
      )}
    </div>
  );

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
              <DesktopAuth />
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
              <MobileAuth />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
