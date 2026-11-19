import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, ChevronUp, GitBranchPlus, Mail, Plus, UserRoundCheck, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import StatValue from "@/components/StatValue";
import { useI18n } from "@/i18n";
import SiteFooter from "@/components/SiteFooter";
import AOS from "@/lib/aos/aos";
import "@/lib/aos/aos.css";
import teamDiscussion from "@/assets/team-discussion.jpg";
import credentialsFirst from "@/assets/credentials-first.jpg";
import paywalledTools from "@/assets/paywalled-tools.jpg";
import closedSystems from "@/assets/closed-systems.jpg";
import noFirstProject from "@/assets/no-first-project.jpg";

function formatStatCount(target: number, progress: number, suffix: string) {
  const count = Math.round(target * progress);
  if (target >= 10_000 && count >= 1_000) {
    return `${Math.floor(count / 1_000)}K${suffix}`;
  }
  return `${count}${suffix}`;
}

const sherwoodLiveUrl = "https://sherwoodnotes.vercel.app/";
const zacLiveUrl = "https://zacpay.netlify.app/";

const githubProfiles = [
  { username: "xarkgg", tone: "blue", name: "Manass Kusko", photo: "/manasseh.jpg", cover: "/manasseh-cover.jpg", email: "manasseh@baseline.dev", site: "https://xarkgg.vercel.app/" },
  { username: "TheRealNajim", tone: "purple", name: "Najimdeen Ajadi", photo: "/najimdeen.jpg", cover: "/najimdeen-cover.jpeg", email: "najimdeen@baseline.dev", site: "https://github.com/TheRealNajim" },
  { username: "TimothyBayode", tone: "orange", name: "Timothy Bayode", photo: "/timothy.jpg", cover: "/timothy-cover.jpeg", email: "timothy@baseline.dev", site: "https://timothybayode.vercel.app/" },
  { username: "mhizer-fatai", tone: "green", name: "Mhizer Fatai", photo: "/fatai.jpg", cover: "/fatai-cover.jpeg", email: "fatai@baseline.dev", site: "https://github.com/mhizer-fatai" },
];

type GitHubStats = { repositories: number; contributions: number; followers: number };

async function fetchGitHubStats(username: string, signal: AbortSignal): Promise<GitHubStats> {
  const encodedUsername = encodeURIComponent(username);
  const [profileResponse, contributionsResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${encodedUsername}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal,
    }),
    fetch(`https://github-contributions-api.jogruber.de/v4/${encodedUsername}?y=last`, { signal }),
  ]);

  if (!profileResponse.ok || !contributionsResponse.ok) {
    throw new Error(`Could not load GitHub stats for ${username}`);
  }

  const [profile, contributions] = await Promise.all([
    profileResponse.json() as Promise<{ public_repos: number; followers: number }>,
    contributionsResponse.json() as Promise<{ total: Record<string, number> }>,
  ]);
  const lastYearContributions = contributions.total.lastYear;
  if (typeof lastYearContributions !== "number") {
    throw new Error(`No last-year contribution total found for ${username}`);
  }

  return {
    repositories: profile.public_repos,
    contributions: lastYearContributions,
    followers: profile.followers,
  };
}

let aosStarted = false;

function App() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollTopRendered, setScrollTopRendered] = useState(false);
  const [scrollTopExiting, setScrollTopExiting] = useState(false);
  const [statsProgress, setStatsProgress] = useState(0);
  const [githubStats, setGithubStats] = useState<Record<string, GitHubStats | null>>({});
  const statsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (aosStarted) return;
    aosStarted = true;

    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      offset: 90,
      once: true,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }, []);

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

    Promise.all(githubProfiles.map(async (profile) => {
      try {
        const stats = await fetchGitHubStats(profile.username, controller.signal);
        if (active) setGithubStats((current) => ({ ...current, [profile.username]: stats }));
      } catch {
        if (active) setGithubStats((current) => ({ ...current, [profile.username]: null }));
      }
    }));

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const section = statsSectionRef.current;
    if (!section) return;

    let frame = 0;
    let startTime: number | null = null;
    const duration = 1400;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(timestamp: number) {
      if (startTime === null) startTime = timestamp;
      const elapsed = Math.min((timestamp - startTime) / duration, 1);
      setStatsProgress(1 - (1 - elapsed) ** 3);
      if (elapsed < 1) frame = window.requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        if (prefersReducedMotion) {
          setStatsProgress(1);
        } else {
          startTime = null;
          frame = window.requestAnimationFrame(animate);
        }
      } else {
        window.cancelAnimationFrame(frame);
        startTime = null;
        setStatsProgress(0);
      }
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) setSubmitted(true);
  }

  return (
    <main>
      <SiteHeader />

      <section className="hero" id="home">
        <div className="hero-inner">
          <div className="orbit orbit-one" aria-hidden="true"><img src="/manasseh.jpg" alt="" width={96} height={96} /><span>Manasseh</span></div>
          <div className="orbit orbit-two" aria-hidden="true"><img src="/najimdeen.jpg" alt="" width={96} height={96} /><span>Najimdeen</span></div>
          <div className="orbit orbit-four" aria-hidden="true"><Plus className="orbit-upload-icon" /><span>You</span></div>
          <div className="orbit orbit-five" aria-hidden="true"><img src="/fatai.jpg" alt="" width={96} height={96} /><span>Fatai</span></div>
          <div className="orbit orbit-six" aria-hidden="true"><img src="/timothy.jpg" alt="" width={96} height={96} /><span>Timothy</span></div>
          <div className="hero-thread hero-thread-left" aria-hidden="true">
            <span className="thread-arm" />
            <span className="thread-jog" />
            <span className="thread-turn" />
          </div>
          <div className="hero-thread hero-thread-right" aria-hidden="true" />
          <div className="hero-thread thread-lower-right" aria-hidden="true" />
          <h1>
            <span className="hero-heading-line">{t("Collaborate")} <span className="play-mark" aria-hidden="true">▶</span></span>{" "}
            <span className="hero-heading-line hero-heading-build-and">{t("Build")}<br className="hero-heading-desktop-break" /> {t("and")}</span>{" "}
            <span className="hero-heading-line">{t("Succeed with")}</span><br className="hero-heading-desktop-break" />
            <span className="hero-heading-line"><span className="highlight">Baseline<span className="tm-mark" aria-hidden="true" /></span></span>
          </h1>
          <p className="hero-copy">{t("We build products, improve how engineering is practised and make engineering & artificial intelligence accessible to everyone.")}</p>
          <div className="contacts-actions" data-aos="fade-up" data-aos-delay="220">
            <a className="insight-card-contact contacts-email-pill" href="mailto:hello@ourbaseline.xyz">
              <span className="insight-card-contact-icon">
                <Mail className="insight-card-contact-arrow" aria-hidden="true" />
                <Check className="insight-card-contact-check" aria-hidden="true" />
              </span>
              <span className="insight-card-contact-label">{t("Get in Touch")}</span>
              <span className="insight-card-contact-email">hello@ourbaseline.xyz</span>
            </a>
          </div>
        </div>
      </section>

      <section className="stats-section content-wrap" id="features" ref={statsSectionRef}>
        <div className="section-intro stats-intro" data-aos="fade-right">
          <h2>{t("An independent engineering collective.")}</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-copy" data-aos="fade-up" data-aos-delay="100">
          <p>{t("Baseline is an independent, open-source engineering collective focused on building products, improving how engineering is practised and making engineering and artificial intelligence more accessible.")}</p>
            <hr className="stat-divider" aria-hidden="true" />
            <p>{t("We believe everyone should have a clear path into engineering. Whether someone is taking their first steps into technology or already building complex systems, Baseline provides the knowledge, resources, tools and opportunities to help them grow.")}</p>
          </div>
          <div className="stat-tile stat-blue" data-aos="zoom-in" data-aos-delay="50"><strong>{formatStatCount(50, statsProgress, "+")}</strong><span>{t("Project Tools & Software")}</span></div>
          <div className="stat-tile stat-green" data-aos="zoom-in" data-aos-delay="150"><strong>{formatStatCount(97, statsProgress, "%")}</strong><span>{t("Our Satisfied Users")}</span></div>
          <div className="stat-tile stat-coral" data-aos="zoom-in" data-aos-delay="250"><strong>{formatStatCount(10_000, statsProgress, "+")}</strong><span>{t("Task Management Updates")}</span></div>
          <div className="stat-tile stat-yellow" data-aos="zoom-in" data-aos-delay="350"><strong>{formatStatCount(20, statsProgress, "+")}</strong><span>{t("Office in Countries")}</span></div>
        </div>
      </section>

      <section className="daily-section content-wrap">
        <div className="daily-visual" data-aos="fade-right">
          <a className="daily-project daily-project-tall" href={zacLiveUrl} target="_blank" rel="noreferrer">
            <img src="/zac.png" alt="Zac project preview" width={3032} height={1496} loading="lazy" />
            <span className="daily-project-overlay">
              <span className="daily-project-name">Zac</span>
              <span className="daily-project-live">{t("Live site")} <ArrowUpRight aria-hidden="true" /></span>
            </span>
          </a>
          <a className="daily-project" href={sherwoodLiveUrl} target="_blank" rel="noreferrer">
            <img src="/sherwood.png" alt="Sherwood project preview" width={2694} height={1318} loading="lazy" />
            <span className="daily-project-overlay">
              <span className="daily-project-name">Sherwood</span>
              <span className="daily-project-live">{t("Live site")} <ArrowUpRight aria-hidden="true" /></span>
            </span>
          </a>
        </div>
        <div className="section-copy" data-aos="fade-left" data-aos-duration="800">
          <h2>{t("We build, then we show the work.")}</h2>
          <p>{t("We build and launch products, contribute to open-source projects, share what we learn and create opportunities for people to take part in meaningful engineering work.")}</p>
          <p>{t("Our work puts the")} <u>{t("next generation of engineers")}</u> {t("first, while making room for experienced practitioners to collaborate, research and keep growing.")}</p>
          <a className="insight-card-contact view-all-projects" href="/work">
            <span className="insight-card-contact-icon">
              <ArrowRight className="insight-card-contact-arrow" aria-hidden="true" />
              <ArrowUpRight className="insight-card-contact-check" aria-hidden="true" />
            </span>
            <span className="insight-card-contact-label">{t("View All Projects")}</span>
          </a>
        </div>
      </section>

      <section className="workflow-section content-wrap" id="workflow">
        <div className="center-intro" data-aos="fade-up">
          <h2>{t("The gate is rarely the talent.")}</h2>
          <p>{t("The same four walls show up wherever engineering is taught, hired or credited. We build around them instead of building on top of them.")}</p>
        </div>
        <div className="workflow-grid">
          <WorkflowCard animation="flip-up" delay={0} image={credentialsFirst} alt="Stack of framed diplomas waiting to be handed out" title="Credentials first" description="What you can show beats what you can do — so people without the right school never get the first look." />
          <WorkflowCard animation="flip-up" delay={100} image={paywalledTools} alt="Credit cards resting on a laptop keyboard" title="Paywalled tools" description="The stack that teaches you fastest is priced like the job you're trying to get." />
          <WorkflowCard animation="flip-up" delay={200} image={closedSystems} alt="Engineer monitoring server racks behind a glass wall" title="Closed systems" description="Learn to use it, never to understand it. The machinery stays behind glass, and so does the knowledge." />
          <WorkflowCard animation="flip-up" delay={300} image={noFirstProject} alt="Man sitting in front of a laptop, deep in thought" title="No first project" description="A path into engineering needs somewhere real to start — a first shipped thing, not another tutorial." />
        </div>
      </section>

      <section className="feature-row solution-row content-wrap" id="solutions">
        <div className="team-visual" data-aos="zoom-in" data-aos-duration="800">
          <img src={teamDiscussion} alt="Two developers discussing a project over laptops" width={1400} height={933} loading="lazy" />
        </div>
        <div className="section-copy" data-aos="fade-left" data-aos-duration="800">
          <h2>{t("Understand it, improve it, build what comes next.")}</h2>
          <p>{t("We want people to understand what we build, improve it and use that knowledge to build what comes next. Everything we ship is meant to be read, forked and argued with.")}</p>
        </div>
      </section>

      <section className="feature-row insight-row content-wrap" id="insights">
        <div className="section-copy" data-aos="fade-right" data-aos-duration="800">
          <h2>{t("Four to start. Open by design.")}</h2>
          <p>{t("Baseline is a collective, not a founders' club. The four of us started it; every project here is open to contributors who want a real thing to work on.")}</p>
        </div>
        <div className="insight-cards">
          {githubProfiles.map((profile, index) => {
            const stats = githubStats[profile.username];
            return (
              <article
                className={`insight-card tone-${profile.tone}`}
                key={profile.username}
                data-aos={["fade-up-right", "fade-up", "zoom-in-up", "fade-up-left"][index % 4]}
                data-aos-delay={index * 100}
                data-aos-duration="800"
              >
                <div className="insight-card-image" style={{ backgroundImage: `url(${profile.cover})` }} />
                <div className="insight-card-avatar"><img src={profile.photo} alt="" /></div>
                <div className="insight-card-profile">
                  <div className="insight-card-person">
                    <strong>
                      <a className="insight-card-name" href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer" aria-label={`${profile.name} on GitHub`}>{profile.name}</a>
                    </strong>
                    <span>@{profile.username}</span>
                  </div>
                  <a className="insight-card-open" href={profile.site} target="_blank" rel="noreferrer">{t("Visit")}</a>
                </div>
                <div className="insight-card-divider" aria-hidden="true" />
                <div className="insight-card-stats">
                  <div><strong className="insight-card-repositories-value"><Warehouse aria-hidden="true" /><StatValue value={stats === null ? null : stats?.repositories} /></strong><span>{t("Repositories")}</span></div>
                  <div><strong className="insight-card-contributions-value"><GitBranchPlus aria-hidden="true" /><StatValue value={stats === null ? null : stats?.contributions} /></strong><span>{t("Contributions")}</span></div>
                  <div><strong className="insight-card-followers-value"><UserRoundCheck aria-hidden="true" /><StatValue value={stats === null ? null : stats?.followers} /></strong><span>{t("Followers")}</span></div>
                </div>
                <div className="insight-card-contact">
                  <span className="insight-card-contact-icon">
                    <ArrowRight className="insight-card-contact-arrow" aria-hidden="true" />
                    <Check className="insight-card-contact-check" aria-hidden="true" />
                  </span>
                  <span className="insight-card-contact-label">{t("Get in Touch")}</span>
                  <span className="insight-card-contact-email">{profile.email}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="final-cta content-wrap" id="pricing" data-aos="fade-up" data-aos-duration="800">
        <h2>{t("Achieve Milestones")}<br />{t("Faster with")} <span className="highlight">Baseline<span className="tm-mark" aria-hidden="true" /></span></h2>
        <p className="cta-copy">{t("Working on something real, or want in on one of ours? We answer every message.")}</p>
        <SignupForm
          email={email}
          submitted={submitted}
          setEmail={setEmail}
          onSubmit={handleSubmit}
          compact
          id="get-started"
        />
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

function SignupForm({
  email,
  submitted,
  setEmail,
  onSubmit,
  compact = false,
  id,
}: {
  email: string;
  submitted: boolean;
  setEmail: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  compact?: boolean;
  id: string;
}) {
  const { t } = useI18n();
  return (
    <form className={`signup-form${compact ? " compact" : ""}`} onSubmit={onSubmit} id={id}>
      {submitted ? (
        <p className="signup-success" role="status"><Check aria-hidden="true" /> {t("You’re on the list — we’ll be in touch.")}</p>
      ) : (
        <>
          <label className="sr-only" htmlFor={`${id}-email`}>{t("Your email address")}</label>
          <input id={`${id}-email`} type="email" placeholder="name@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Button type="submit" className="signup-button">{t("Build With Us")} <ArrowRight aria-hidden="true" /></Button>
        </>
      )}
    </form>
  );
}

function WorkflowCard({ image, alt, title, description, animation, delay = 0 }: { image: string; alt: string; title: string; description: string; animation: string; delay?: number }) {
  const { t } = useI18n();
  return (
    <article className="workflow-card" data-aos={animation} data-aos-delay={delay} data-aos-duration="900">
      <div className="workflow-image"><img src={image} alt={alt} width={1024} height={1024} loading="lazy" /></div>
      <h3>{t(title)}</h3>
      <p>{t(description)}</p>
    </article>
  );
}
export default App;
