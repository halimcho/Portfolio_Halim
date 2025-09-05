import { GraduationCap, Code, Brain } from "lucide-react";

type Lang = "ko" | "en";

const T = {
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
        borderColor: "border-blue-600",
        iconBg: "bg-blue-600",
      },
      {
        icon: Code,
        title: "구름 카카오톡 풀스택 부트캠프",
        subtitle: "13회차 수료",
        status: "2025",
        description:
          "실무 중심의 풀스택 개발 과정으로 프론트엔드부터 백엔드까지 종합적인 웹 개발 역량 구축",
        borderColor: "border-green-600",
        iconBg: "bg-green-600",
      },
      {
        icon: Brain,
        title: "이어드림 AI/ML 데이터 사이언스",
        subtitle: "4기 수료",
        status: "2024",
        description:
          "머신러닝, 딥러닝, 자연어처리, 데이터 엔지니어링 등 AI/ML 전 영역에 걸친 실무 교육",
        borderColor: "border-purple-600",
        iconBg: "bg-purple-600",
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
        borderColor: "border-blue-600",
        iconBg: "bg-blue-600",
      },
      {
        icon: Code,
        title: "Goorm KakaoTalk Full-Stack Bootcamp",
        subtitle: "13th Cohort Completed",
        status: "2025",
        description:
          "Hands-on full-stack program covering frontend to backend, building comprehensive web development skills.",
        borderColor: "border-green-600",
        iconBg: "bg-green-600",
      },
      {
        icon: Brain,
        title: "YeaDream AI/ML Data Science",
        subtitle: "4th Cohort Completed",
        status: "2024",
        description:
          "Practical training across AI/ML: machine learning, deep learning, NLP, and data engineering.",
        borderColor: "border-purple-600",
        iconBg: "bg-purple-600",
      },
    ],
  },
};

export default function EducationSection({ language = "ko" }: { language?: Lang }) {
  const L = T[language];
  const educationItems = L.items;

  return (
    <section id="education" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">{L.title}</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto" />
        </div>

        <div className="space-y-8">
          {educationItems.map((item, index) => {
            const IconComponent = item.icon as any;
            return (
              <div key={index} className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 ${item.iconBg} rounded-full grid place-items-center text-white`}
                  >
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>

                {/* 라이트=연회색, 다크=네이비 */}
                <div
                  className={`flex-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border-l-4 ${item.borderColor}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <span className="text-gray-700 dark:text-slate-300 text-sm">
                      {item.status}
                    </span>
                  </div>

                  <p
                    className={`font-medium mb-2 ${
                      item.iconBg === "bg-blue-600"
                        ? "text-blue-500"
                        : item.iconBg === "bg-green-600"
                        ? "text-green-500"
                        : "text-purple-500"
                    }`}
                  >
                    {item.subtitle}
                  </p>

                  <p className="text-gray-700 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
