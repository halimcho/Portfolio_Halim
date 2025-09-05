import React, { useMemo } from "react";
import { Download, Mail, MapPin } from "lucide-react";
import { useLocation } from "@/hooks/use-location";
import { Button } from "./button";
import { motion } from "framer-motion";

type Lang = "ko" | "en";

const T = {
  ko: {
    name: "조하림",
    ready: "💼 채용 가능합니다! ✨",
    role: "Full Stack Developer & Data Scientist",
    bio:
      "Biomedical Science 전공으로 시작해 AI/ML과 풀스택 개발의 세계로 확장한 개발자입니다. 데이터의 통찰력과 웹 기술의 혁신을 결합하여 의미 있는 솔루션을 만들어갑니다.",
    download: "이력서 다운로드",
    contact: "연락하기",
    loading: "로딩 중...",
  },
  en: {
    name: "Halim Cho",
    ready: "💼 Ready to be hired! ✨",
    role: "Full Stack Developer & Data Scientist",
    bio:
      "Starting from Biomedical Science, I expanded into AI/ML and full-stack development. I combine data insights with web innovation to build meaningful solutions.",
    download: "Download Resume",
    contact: "Contact Me",
    loading: "Loading...",
  },
};

export default function HeroSection({ language = "ko" }: { language?: Lang }) {
  const L = T[language];
  const { location, loading } = useLocation();

  const handleDownloadResume = () => {
    const a = document.createElement("a");
    a.href = "/resume.pdf";
    a.download = "Halim_Cho_Resume.pdf";
    a.click();
  };

  const handleContactClick = () => {
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      contactSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const parent = useMemo(
    () => ({
      hidden: { opacity: 0, y: 12 },
      show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 120, damping: 18 },
      },
    }),
    []
  );

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background text-foreground"
    >

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="relative w-40 h-40 mx-auto mb-6">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                <img
                  src="/KakaoTalk_Photo_2025-08-08-19-04-56_1754647699856.jpeg"
                  alt={language === "ko" ? "조하림 프로필 사진" : "Halim Cho Profile"}
                  className="w-full h-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.style.display = "none";
                    const sibling =
                      e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (sibling) sibling.style.display = "flex";
                  }}
                />
                <div className="w-full h-full hidden items-center justify-center text-4xl font-bold text-foreground">
                  {L.name.charAt(0)}
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -right-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs px-4 py-2 rounded-full shadow-lg animate-bounce">
              <div className="relative">
                <span className="whitespace-nowrap font-medium">
                  {L.ready}
                </span>
                <div className="absolute top-full left-1/2 -translate-x-1/2">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={parent}
          className="text-5xl md:text-7xl font-bold mb-6 text-foreground"
        >
          {L.name}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={parent}
          className="text-xl md:text-2xl text-gray-700 dark:text-slate-300 mb-8 font-light"
        >
          {L.role}
        </motion.p>

        <motion.p
          initial="hidden"
          animate="show"
          variants={parent}
          className="text-lg text-gray-700 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {L.bio}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 120, damping: 18 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-center max-w-2xl mx-auto"
        >
          <Button
            onClick={handleDownloadResume}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-6 font-medium transition-all transform hover:scale-[1.02]"
          >
            <Download className="mr-2 h-4 w-4" />
            {L.download}
          </Button>

          <Button
            onClick={handleContactClick}
            variant="outline"
            className="h-12 border-border text-foreground hover:bg-accent px-6 font-medium transition-all"
          >
            <Mail className="mr-2 h-4 w-4" />
            {L.contact}
          </Button>

          <Button
            type="button"
            disabled
            aria-live="polite"
            aria-busy={loading}
            variant="outline"
            className="h-12 border-border bg-muted text-foreground/80 hover:bg-muted px-6 font-medium justify-center"
          >
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <MapPin size={14} className="mr-2 text-primary" />
            {loading ? (
              <span className="animate-pulse text-muted-foreground text-sm">{L.loading}</span>
            ) : (
              <span className="text-muted-foreground text-sm font-medium">{location}</span>
            )}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
