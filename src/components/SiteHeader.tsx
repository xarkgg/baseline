import { useEffect, useRef, useState, type ReactElement, type SVGProps } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import FlagGB from "country-flag-icons/react/3x2/GB";
import FlagES from "country-flag-icons/react/3x2/ES";
import FlagFR from "country-flag-icons/react/3x2/FR";
import FlagDE from "country-flag-icons/react/3x2/DE";
import FlagPT from "country-flag-icons/react/3x2/PT";
import FlagNG from "country-flag-icons/react/3x2/NG";

import { Button } from "@/components/ui/button";
import { useI18n, type Language } from "@/i18n";

type FlagComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

const defaultLanguage = { code: "ENG", lang: "en", label: "English", Flag: FlagGB as FlagComponent };
const languages = [
  defaultLanguage,
  { code: "SPA", lang: "es", label: "Español", Flag: FlagES as FlagComponent },
  { code: "FRA", lang: "fr", label: "Français", Flag: FlagFR as FlagComponent },
  { code: "DEU", lang: "de", label: "Deutsch", Flag: FlagDE as FlagComponent },
  { code: "POR", lang: "pt", label: "Português", Flag: FlagPT as FlagComponent },
  { code: "NIG", lang: "pcm", label: "Pidgin (Nigeria)", Flag: FlagNG as FlagComponent },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const languageRef = useRef<HTMLDetailsElement>(null);
  const homeHref = "/";
  const teamHref = "/team";
  const contactHref = "/contact";
  const activeLanguage = languages.find((item) => item.lang === language) ?? defaultLanguage;
  const ActiveFlag = activeLanguage.Flag;

  function handleLanguageSelect(lang: Language) {
    setLanguage(lang);
    if (languageRef.current) languageRef.current.open = false;
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = languageRef.current;
      if (!details?.open) return;
      if (event.target instanceof Node && details.contains(event.target)) return;
      details.open = false;
    }
    function handleKeyDown(event: KeyboardEvent) {
      const details = languageRef.current;
      if (event.key !== "Escape" || !details?.open) return;
      details.open = false;
      details.querySelector("summary")?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="site-header">
      <a className="brand" href={homeHref} aria-label={t("Baseline home")}>
        <img className="brand-mark" src="/favicon.png" alt="" width={34} height={34} />
        <span>Baseline</span>
      </a>
      <Button
        variant="ghost"
        size="icon"
        className="mobile-menu-button"
        aria-label={t(menuOpen ? "Close navigation" : "Open navigation")}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </Button>
      <nav className={`main-nav${menuOpen ? " is-open" : ""}`} aria-label={t("Main navigation")}>
        <a href={homeHref} onClick={() => setMenuOpen(false)}>{t("Home")}</a>
        <a href="/work" onClick={() => setMenuOpen(false)}>{t("Work")}</a>
        <a href="/resources" onClick={() => setMenuOpen(false)}>{t("Resources")}</a>
        <a href={teamHref} onClick={() => setMenuOpen(false)}>{t("Team")}</a>
        <a href={contactHref} onClick={() => setMenuOpen(false)}>{t("Contact")}</a>
      </nav>
      <div className="header-actions">
        <details className="language-switcher" ref={languageRef}>
          <summary aria-label={t("Select language")}>
            <span className="language-flag" aria-hidden="true"><ActiveFlag className="language-flag-svg" preserveAspectRatio="none" /></span>
            <span>{activeLanguage.code}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="language-menu">
            {languages.map((lang) => {
              const Flag = lang.Flag;
              return (
                <button key={lang.code} type="button" onClick={() => handleLanguageSelect(lang.lang as Language)}>
                  <span className="language-flag" aria-hidden="true"><Flag className="language-flag-svg" preserveAspectRatio="none" /></span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        </details>
        <Button asChild size="sm" className="nav-cta">
          <a href={contactHref} onClick={() => setMenuOpen(false)}>{t("Build With Us")}</a>
        </Button>
      </div>
    </header>
  );
}
