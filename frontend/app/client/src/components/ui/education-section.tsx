import { GraduationCap, Code, Brain } from "lucide-react";

type Lang = "ko" | "en";

type EduItem = {
  icon: any;
  title: string;
  subtitle: string;
  status: string;
  description: string;
  accent: {
    iconBg: string;     
    badgeText: string; 
    border: string;   
    ring: string;       
  };
};

const T: Record<Lang, { title: string; items: EduItem[] }> = {
  ko: {
    title: "Education & Training",
    items: [
      {
        icon: GraduationCap,
        title: "University of British Columbia (UBC)",
        subtitle: "Biomedical Science 전공",
        status: "졸업",
        description:
          "생명과학의 기초를 탄탄히 하며 과학적 사고와 연구 방법론을 습득",
        accent: {
          iconBg: "bg-blue-600",
          badgeText: "text-blue-400",
          border: "border-blue-500/40 dark:border-blue-400/30",
          ring: "focus:ring-blue-500/40",
        },
      },
      {
        icon: Code,
        title: "구름 카카오톡 풀스택 부트캠프",
        subtitle: "13회차 수료",
        status: "2025",
        description:
          "실무 중심의 풀스택 개발 과정으로 프론트엔드부터 백엔드까지 종합적인 웹 개발 역량 구축",
        accent: {
          iconBg: "bg-emerald-600",
          badgeText: "text-emerald-400",
          border: "border-emerald-500/40 dark:border-emerald-400/30",
          ring: "focus:ring-emerald-500/40",
        },
      },
      {
        icon: Brain,
        title: "이어드림 AI/ML 데이터 사이언스",
        subtitle: "4기 수료",
        status: "2024",
        description:
          "머신러닝, 딥러닝, 자연어처리, 데이터 엔지니어링 등 AI/ML 전 영역에 걸친 실무 교육",
        accent: {
          iconBg: "bg-violet-600",
          badgeText: "text-violet-400",
          border: "border-violet-500/40 dark:border-violet-400/30",
          ring: "focus:ring-violet-500/40",
        },
      },
    ],
  },
  en: {
    title: "Education & Training",
    items: [
      {
        icon: GraduationCap,
        title: "University of British Columbia (UBC)",
        subtitle: "Major in Biomedical Science",
        status: "Graduated",
        description:
          "Built a solid foundation in life sciences and developed scientific thinking and research methodology.",
        accent: {
          iconBg: "bg-blue-600",
          badgeText: "text-blue-400",
          border: "border-blue-500/40 dark:border-blue-400/30",
          ring: "focus:ring-blue-500/40",
        },
      },
      {
        icon: Code,
        title: "Goorm KakaoTalk Full-Stack Bootcamp",
        subtitle: "13th Cohort Completed",
        status: "2025",
        description:
          "Hands-on full-stack program covering frontend to backend, building comprehensive web development skills.",
        accent: {
          iconBg: "bg-emerald-600",
          badgeText: "text-emerald-400",
          border: "border-emerald-500/40 dark:border-emerald-400/30",
          ring: "focus:ring-emerald-500/40",
        },
      },
      {
        icon: Brain,
        title: "YeaDream AI/ML Data Science",
        subtitle: "4th Cohort Completed",
        status: "2024",
        description:
          "Practical training across AI/ML: machine learning, deep learning, NLP, and data engineering.",
        accent: {
          iconBg: "bg-violet-600",
          badgeText: "text-violet-400",
          border: "border-violet-500/40 dark:border-violet-400/30",
          ring: "focus:ring-violet-500/40",
        },
      },
    ],
  },
};

export default function EducationSection({ language = "ko" }: { language?: Lang }) {
  const L = T[language];

  return (
    <section id="education" className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{L.title}</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {L.items.map((item, idx) => {
            const Icon = item.icon as any;
            return (
              <article
                key={idx}
                tabIndex={0}
                className={[
                  "group rounded-2xl",
                  "bg-white/70 text-slate-900 border border-slate-200 shadow-xl",
                  "dark:bg-slate-800/60 dark:text-slate-100 dark:border-slate-700/60",
                  "backdrop-blur-sm transition-all",
                  "hover:shadow-2xl focus:outline-none",
                  item.accent.ring,
                  item.accent.border,
                ].join(" ")}
              >
                <div className="p-6 md:p-7 flex items-start gap-5">
                  <div
                    className={[
                      "w-12 h-12 rounded-2xl grid place-items-center shrink-0 text-white",
                      "shadow-md",
                      item.accent.iconBg,
                    ].join(" ")}
                    aria-hidden
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <header className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold leading-tight">
                        {item.title}
                      </h3>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {item.status}
                      </span>
                    </header>

                    <p
                      className={[
                        "mt-1.5 font-medium",
                        item.accent.badgeText,
                      ].join(" ")}
                    >
                      {item.subtitle}
                    </p>

                    <p className="mt-2 text-slate-700 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
