import Navigation from "@/components/ui/navigation";
import HeroSection from "@/components/ui/hero-section";
import AboutSection from "@/components/ui/about-section";
import EducationSection from "@/components/ui/education-section";
import SkillsSection from "@/components/ui/skills-section";
import ProjectsSection from "@/components/ui/projects-section";
import ContactSection from "@/components/ui/contact-section";
import KakaoMap from "@/components/KakaoMap";
import { useThemeCtx } from "@/providers/theme";

export default function Home() {
  const { lang } = useThemeCtx();

  return (
    <div className="bg-background text-foreground font-sans">
      <Navigation language={lang} />

      <HeroSection />
      <AboutSection />
      <EducationSection />
      <SkillsSection />
      <ProjectsSection />

      <div className="max-w-7xl mx-auto px-4">
        <KakaoMap />
      </div>

      <ContactSection />

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2025. All rights reserved. 조하림. 구르미
          </p>
        </div>
      </footer>
    </div>
  );
}
