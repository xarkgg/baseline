import { useI18n } from "@/i18n";

export default function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-bottom" data-aos="fade-up" data-aos-offset="0">
        <a className="brand" href="/#home">
          <img className="brand-mark" src="/favicon.png" alt="" width={30} height={30} />
          <span>Baseline</span>
        </a>
        <span>© {new Date().getFullYear()}. {t("All Rights Reserved")}</span>
        <div>{t("An open-source engineering collective")}</div>
      </div>
    </footer>
  );
}
