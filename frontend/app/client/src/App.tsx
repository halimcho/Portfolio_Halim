import { useLanguage } from "@/context/language";
import Navigation from "@/components/ui/navigation";

import HeroSection from "@/components/ui/hero-section";
import AboutSection from "@/components/ui/about-section";
import EducationSection from "@/components/ui/education-section";
import SkillsSection from "@/components/ui/skills-section";
import ProjectsSection from "@/components/ui/projects-section";
import ContactSection from "@/components/ui/contact-section";
import KakaoMap from "@/components/KakaoMap";

import FooterControls from "@/components/ui/footer-controls";

function AppBody() {
  const { language } = useLanguage();

  return (
    <>
      <Navigation language={language} />

      <main className="pt-14">
        <HeroSection language={language} />
        <AboutSection language={language} />
        <EducationSection language={language} />
        <SkillsSection language={language} />
        <ProjectsSection language={language} />

        <section className="py-12 bg-background">
          <div className="max-w-6xl mx-auto px-4">
            <KakaoMap
              key={language}                 
              language={language}      
              level={3}
              draggable
              scrollwheel
              showZoomControl
              showMapTypeControl
              enableGeolocate
              enableSearch
            />
          </div>
        </section>

        <ContactSection language={language} />
      </main>

      <FooterControls />
    </>
  );
}

export default function App() {
  return <AppBody />;
}
