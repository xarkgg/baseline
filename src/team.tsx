import { useEffect, useState } from "react";
import { ArrowRight, Check, ChevronUp, GitBranchPlus, Github, Plus, UserRoundCheck, Warehouse } from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/i18n";
import AOS from "@/lib/aos/aos";
import "@/lib/aos/aos.css";

const people = [
  {
    username: "xarkgg",
    name: "Manass Kusko",
    photo: "/manasseh.jpg",
    cover: "/manasseh-cover.jpg",
    email: "manasseh@baseline.dev",
    github: "https://github.com/xarkgg",
    twitter: "https://x.com/xarkgg",
    site: "https://xarkgg.vercel.app/",
  },
  {
    username: "TheRealNajim",
    name: "Najimdeen Ajadi",
    photo: "/najimdeen.jpg",
    cover: "/najimdeen-cover.jpeg",
    email: "najimdeen@baseline.dev",
    github: "https://github.com/TheRealNajim",
    twitter: "https://x.com/TheRealNajim",
    site: "https://github.com/TheRealNajim",
  },
  {
    username: "TimothyBayode",
    name: "Timothy Bayode",
    photo: "/timothy.jpg",
    cover: "/timothy-cover.jpeg",
    email: "timothy@baseline.dev",
    github: "https://github.com/TimothyBayode",
    twitter: "https://x.com/TimothyBayode",
    site: "https://timothybayode.vercel.app/",
  },
  {
    username: "mhizer-fatai",
    name: "Mhizer Fatai",
    photo: "/fatai.jpg",
    cover: "/fatai-cover.jpeg",
    email: "fatai@baseline.dev",
    github: "https://github.com/mhizer-fatai",
    twitter: "https://x.com/playmaster001",
    site: "https://github.com/mhizer-fatai",
  },
];

const contactTones: Record<string, string> = {
  xarkgg: " contact-blue",
  TheRealNajim: " contact-cyan",
  TimothyBayode: " contact-orange",
};

type GitHubStats = { repositories: number; contributions: number; followers: number };

async function fetchGitHubStats(username: string, signal: AbortSignal): Promise<GitHubStats> {
  const encodedUsername = encodeURIComponent(username);
  const [profileResponse, contributionsResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodedUsername}`, { headers: { Accept: "application/vnd.github+json" }, signal }),
    fetch(`https://github-contributions-api.jogruber.de/v4/${encodedUsername}?y=last`, { signal }),
  ]);

  if (!profileResponse.ok || !contributionsResponse.ok) throw new Error(`Could not load GitHub stats for ${username}`);
  const [profile, contributions] = await Promise.all([
    profileResponse.json() as Promise<{ public_repos: number; followers: number }>,
    contributionsResponse.json() as Promise<{ total: Record<string, number> }>,
  ]);
  const lastYearContributions = contributions.total.lastYear;
  if (typeof lastYearContributions !== "number") throw new Error(`No last-year contribution total found for ${username}`);
  return { repositories: profile.public_repos, contributions: lastYearContributions, followers: profile.followers };
}

export default function Team() {
  const { t } = useI18n();
  const [githubStats, setGithubStats] = useState<Record<string, GitHubStats | null>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollTopRendered, setScrollTopRendered] = useState(false);
  const [scrollTopExiting, setScrollTopExiting] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      offset: 90,
      once: true,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

  useEffect(() => {
    document.title = `${t("The people")} | Baseline`;
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

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    Promise.all(people.map(async (person) => {
      try {
        const stats = await fetchGitHubStats(person.username, controller.signal);
        if (active) setGithubStats((current) => ({ ...current, [person.username]: stats }));
      } catch {
        if (active) setGithubStats((current) => ({ ...current, [person.username]: null }));
      }
    }));
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <main className="team-page">
      <SiteHeader />
      <section className="team-hero">
        <div className="team-hero-inner content-wrap">
          <h1 data-aos="zoom-in-up">{t("The people")}<span>.</span></h1>
          <p data-aos="fade-up" data-aos-delay="100">{t("Four of us to start. Room for you, too.")}</p>
        </div>
      </section>
      <section className="team-members content-wrap" aria-label={t("The people")}>
        <div className="insight-cards">
          {people.map((person, index) => {
            const stats = githubStats[person.username];
            return (
              <article className="insight-card" key={person.username} data-aos={["fade-up-right", "fade-up", "zoom-in-up", "fade-up-left"][index % 4]} data-aos-delay={index * 100} data-aos-duration="800">
                <div className="insight-card-image" style={{ backgroundImage: `url(${person.cover})` }} />
                <div className="insight-card-avatar"><img src={person.photo} alt="" loading="lazy" /></div>
                <div className="insight-card-profile">
                  <div className="insight-card-person"><strong>{person.name}</strong><span>@{person.username}</span></div>
                  <div className="team-card-actions">
                    {person.twitter && <a className="team-card-github team-card-x" href={person.twitter} target="_blank" rel="noreferrer" aria-label={`${person.name} on X`}><img src="/x-logo.png" alt="" /></a>}
                    <a className="team-card-github" href={person.github} target="_blank" rel="noreferrer" aria-label={`${person.name} on GitHub`}><Github aria-hidden="true" /></a>
                    <a className="insight-card-open" href={person.site} target="_blank" rel="noreferrer">{t("Visit")}</a>
                  </div>
                </div>
                <div className="insight-card-divider" aria-hidden="true" />
                <div className="insight-card-stats">
                  <div><strong className="insight-card-repositories-value"><Warehouse aria-hidden="true" />{stats?.repositories.toLocaleString() ?? "—"}</strong><span>{t("Repositories")}</span></div>
                  <div><strong className="insight-card-contributions-value"><GitBranchPlus aria-hidden="true" />{stats?.contributions.toLocaleString() ?? "—"}</strong><span>{t("Contributions")}</span></div>
                  <div><strong className="insight-card-followers-value"><UserRoundCheck aria-hidden="true" />{stats?.followers.toLocaleString() ?? "—"}</strong><span>{t("Followers")}</span></div>
                </div>
                <a className={`insight-card-contact${contactTones[person.username] ?? ""}`} href={`mailto:${person.email}`}>
                  <span className="insight-card-contact-icon">
                    <ArrowRight className="insight-card-contact-arrow" aria-hidden="true" />
                    <Check className="insight-card-contact-check" aria-hidden="true" />
                  </span>
                  <span className="insight-card-contact-label">{t("Get in Touch")}</span>
                  <span className="insight-card-contact-email">{person.email}</span>
                </a>
              </article>
            );
          })}
          <article className="insight-card team-invite-card" data-aos="zoom-in-up" data-aos-delay="400" data-aos-duration="800">
            <div className="insight-card-image team-invite-cover" />
            <div className="insight-card-avatar team-invite-avatar"><Plus aria-hidden="true" /></div>
            <div className="insight-card-profile">
              <div className="insight-card-person"><strong>{t("You")}</strong><span>{t("Build with us")}</span></div>
              <a className="insight-card-open" href="/work">{t("Explore")}</a>
            </div>
            <div className="insight-card-divider" aria-hidden="true" />
            <p className="team-invite-message">{t("Pick an open project and help make it better. There’s room for you here.")}</p>
            <a className="insight-card-contact" href="mailto:hello@ourbaseline.xyz">
              <span className="insight-card-contact-icon">
                <ArrowRight className="insight-card-contact-arrow" aria-hidden="true" />
                <Check className="insight-card-contact-check" aria-hidden="true" />
              </span>
              <span className="insight-card-contact-label">{t("Get in Touch")}</span>
              <span className="insight-card-contact-email">hello@ourbaseline.xyz</span>
            </a>
          </article>
        </div>
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
