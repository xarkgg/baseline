import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronUp, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/i18n";
import AOS from "@/lib/aos/aos";
import "@/lib/aos/aos.css";

type Project = {
  name: string;
  description: string;
  image: string;
  href: string;
  repo?: string;
  tags: string[];
};

const projects: Project[] = [
  {
    name: "Sherwood",
    description:
      "Buy a floor under a stock token, keep every gain above it, and settle against prices read from the chain. If the price never falls through, you simply keep your upside.",
    image: "/sherwood.png",
    href: "https://sherwoodnotes.vercel.app/",
    repo: "https://github.com/xarkgg/sherwood",
    tags: [
      "Solidity contracts + a React app",
      "Foundry, Chainlink, USDG",
      "Robinhood Chain testnet, 46630",
      "Live on testnet · unaudited",
    ],
  },
  {
    name: "Zac",
    description:
      "Send and receive Zcash by a name instead of an address, with payment requests that only the two people involved can read — including from the app's own server.",
    image: "/zac.png",
    href: "https://zacpay.netlify.app/",
    repo: "https://github.com/mhizer-fatai/zac",
    tags: [
      "Non-custodial web app",
      "React 19, Hono, Zcash (ZIP-316/321)",
      "ZECATHON 2026 · Shielded Payments",
      "Live · verified on mainnet",
    ],
  },
  {
    name: "Condition",
    description:
      "Condition is parametric insurance on Midnight. Policy terms and trigger events live on the public ledger. Who claimed — and the proof that their settlement was fair — never does.",
    image: "/condition.png",
    href: "https://trycondition.vercel.app/",
    tags: [
      "Parametric insurance",
      "Live on Midnight preprod",
      "Client-side zero-knowledge proofs",
      "Private claims · public receipts",
    ],
  },
  {
    name: "Exetazo",
    description:
      "Exetazo reads the terms of service for you, then shows the clauses that could cost you money, your data, or your right to sue. Every flag comes with the exact sentence it came from — so you can check it yourself.",
    image: "/exetazo.png",
    href: "https://www.exetazo.xyz/",
    tags: [
      "Terms of service analysis",
      "Risk clause detection",
      "Source-linked findings",
      "Privacy · data · arbitration",
    ],
  },
  {
    name: "Legacy",
    description:
      "A succession layer for tokenized real-world assets — because a contract outlives its account holder.",
    image: "/legacy.png",
    href: "https://legacydemo.vercel.app/",
    tags: [
      "Tokenized real-world assets",
      "Digital succession",
      "Smart contract inheritance",
      "Account continuity",
    ],
  },
  {
    name: "Haqi",
    description:
      "Haqi investigates live air-quality data across scattered sources and answers with a one-glance verdict a 14-year-old understands, plus the weighted evidence chain behind it, every receipt logged.",
    image: "/haqi.png",
    href: "https://haqi-one.vercel.app/",
    tags: [
      "Air-quality intelligence",
      "Live multi-source data",
      "Evidence-weighted answers",
      "Auditable receipts",
    ],
  },
];

export default function Work() {
  const { t } = useI18n();
  const [visibleProjectCount, setVisibleProjectCount] = useState(3);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollTopRendered, setScrollTopRendered] = useState(false);
  const [scrollTopExiting, setScrollTopExiting] = useState(false);

  useEffect(() => {
    document.title = `${t("Work")} | Baseline`;
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      offset: 90,
      once: true,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, [t]);

  useEffect(() => {
    function updateScrollTopVisibility() {
      setShowScrollTop(window.scrollY > 160);
    }
    updateScrollTopVisibility();
    window.addEventListener("scroll", updateScrollTopVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollTopVisibility);
  }, []);

  useEffect(() => {
    if (showScrollTop) {
      setScrollTopRendered(true);
      setScrollTopExiting(false);
    } else if (scrollTopRendered) {
      setScrollTopExiting(true);
    }
  }, [showScrollTop, scrollTopRendered]);

  return (
    <main className="work-page">
      <SiteHeader />

      <section className="work-hero">
        <div className="work-hero-inner content-wrap">
          <h1 className="work-title">{t("We build, then we show the work.")}</h1>
          <p className="work-lede">
            {t("Live products from Baseline — designed, engineered and shipped in the open. Every project here is open to contributors who want a real thing to work on.")}
          </p>
        </div>
      </section>

      <section className="work-list content-wrap" aria-label={t("Selected projects")}>
        {projects.slice(0, visibleProjectCount).map((project, index) => (
          <article
            className="work-card"
            key={project.name}
            data-aos={["fade-up-right", "fade-up", "zoom-in-up", "fade-up-left"][index % 4]}
            data-aos-delay={index * 100}
            data-aos-duration="800"
          >
            <a
              className="work-card-media"
              href={project.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${t("Open the project live site")}: ${project.name}`}
            >
              <img
                src={project.image}
                alt={`${project.name} project preview`}
                width={2694}
                height={1318}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </a>
            <div className="work-card-body">
              <h2>{project.name}</h2>
              <p>{t(project.description)}</p>
              <div className="work-card-foot">
                <div className="work-card-links">
                  <a className="work-card-link" href={project.href} target="_blank" rel="noreferrer">
                    {t("Live site")} <ArrowUpRight aria-hidden="true" />
                  </a>
                  {project.repo && (
                    <a className="work-card-repo" href={project.repo} target="_blank" rel="noreferrer">
                      <Github aria-hidden="true" /> {t("Repository")}
                    </a>
                  )}
                </div>
                <ul className="work-card-tags">
                  {project.tags.map((tag) => (
                    <li key={tag}>{t(tag)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
        {visibleProjectCount < projects.length && (
          <div className="work-see-more-wrap">
            <Button
              className="work-see-more"
              type="button"
              onClick={() => setVisibleProjectCount((count) => Math.min(count + 5, projects.length))}
            >
              {t("See More")}
            </Button>
          </div>
        )}
      </section>

      <section className="work-cta content-wrap">
        <div>
          <h2>{t("More on the workbench.")}</h2>
          <p>{t("New projects land here as they go live. If you want in on one — or have something of your own — we answer every message.")}</p>
        </div>
        <Button asChild className="nav-cta">
          <a href="/contact">{t("Build With Us")}</a>
        </Button>
      </section>

      <SiteFooter />
      {scrollTopRendered && (
        <button
          className={`scroll-top-button${scrollTopExiting ? " is-exiting" : ""}`}
          type="button"
          aria-label={t("Scroll to top")}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          onAnimationEnd={(event) => {
            if (event.animationName !== "scroll-top-out") return;
            setScrollTopRendered(false);
            setScrollTopExiting(false);
          }}
        >
          <ChevronUp aria-hidden="true" />
        </button>
      )}
    </main>
  );
}
