import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

// English namespace imports
import commonEN from "../public/locales/en/common.json";
import dashboardEN from "../public/locales/en/dashboard.json";
import evaluationEN from "../public/locales/en/evaluation.json";
import featuresEN from "../public/locales/en/features.json";
import formsEN from "../public/locales/en/forms.json";
import landingEN from "../public/locales/en/landing.json";
import navigationEN from "../public/locales/en/navigation.json";
import propertyEN from "../public/locales/en/property.json";

// Romanian namespace imports
import commonRO from "../public/locales/ro/common.json";
import dashboardRO from "../public/locales/ro/dashboard.json";
import evaluationRO from "../public/locales/ro/evaluation.json";
import featuresRO from "../public/locales/ro/features.json";
import formsRO from "../public/locales/ro/forms.json";
import landingRO from "../public/locales/ro/landing.json";
import navigationRO from "../public/locales/ro/navigation.json";
import propertyRO from "../public/locales/ro/property.json";

const resources = {
  en: {
    common: commonEN,
    navigation: navigationEN,
    property: propertyEN,
    evaluation: evaluationEN,
    dashboard: dashboardEN,
    forms: formsEN,
    landing: landingEN,
    features: featuresEN,
  },
  ro: {
    common: commonRO,
    navigation: navigationRO,
    property: propertyRO,
    evaluation: evaluationRO,
    dashboard: dashboardRO,
    forms: formsRO,
    landing: landingRO,
    features: featuresRO,
  },
};

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources,
    fallbackLng: "ro", // Default to Romanian
    lng: "ro", // Default language
    debug: false, // Disable verbose console output

    // Default namespace
    defaultNS: "common",

    // Available namespaces
    ns: [
      "common",
      "navigation",
      "property",
      "evaluation",
      "dashboard",
      "forms",
      "landing",
      "features",
    ],

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    // Language detection options
    detection: {
      order: ["localStorage", "cookie", "navigator", "htmlTag"],
      lookupLocalStorage: "language",
      lookupCookie: "language",
      caches: ["localStorage", "cookie"],
      excludeCacheFor: ["cimode"], // languages to not persist (only in memory)
    },

    // React specific options
    react: {
      useSuspense: false,
    },
  });

export default i18n;
