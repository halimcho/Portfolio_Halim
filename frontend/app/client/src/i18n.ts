import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ko: { translation: { nav: { home: "홈", projects: "프로젝트", contact: "연락처" } } },
  en: { translation: { nav: { home: "Home", projects: "Projects", contact: "Contact" } } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ko",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
