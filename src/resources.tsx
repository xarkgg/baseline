import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useI18n } from "@/i18n";
import AOS from "@/lib/aos/aos";
import "@/lib/aos/aos.css";

type Service = { name: string; description: string };
type ResourceSection = {
  id: string;
  title: string;
  intro?: string;
  paragraphs?: string[];
  services?: Service[];
};

const sections: ResourceSection[] = [
  {
    id: "scope-and-method",
    title: "Scope and method",
    paragraphs: [
      "Operating software requires infrastructure that a team either runs itself or rents. For a small collective, the price of that infrastructure is frequently the first thing that decides what can be built, and a permanent free tier is what makes a serious side project possible.",
      "This page lists services that offer such a tier and are useful to engineers who build, ship and operate software — the system-administration and infrastructure side of the craft that Baseline practises. Each section opens with a short account of the category and then names a handful of services, with the free-tier limit stated as the vendor states it.",
      "The material is derived from free-for.dev, a community-maintained catalogue of free developer tiers, and reflects that source as retrieved on 16 November 2026. Only as-a-service offerings are included; self-hosted software is out of scope by the source's own rule.",
    ],
  },
  {
    id: "source-code-hosting",
    title: "Source code hosting",
    intro: "Source code hosting is the storage of version-controlled code on a remote server, where a distributed team can collaborate, review proposed changes and run automated checks against them. Contemporary hosts bundle far more than storage: continuous integration, package and container registries, static-site publishing and issue tracking are commonly included in the free tier, which makes the host a project's centre of gravity rather than a place code merely rests.",
    services: [
      { name: "GitHub", description: "Unlimited public and private repositories with unlimited collaborators; includes CI/CD, hosted development environments, static hosting, package and container registries, project management and an AI coding assistant." },
      { name: "GitLab", description: "Unlimited public and private repositories with up to five collaborators; includes CI/CD, static hosting, a container registry, project management and issue tracking." },
      { name: "Codeberg", description: "Unlimited public and private repositories with unlimited collaborators for free and open-source projects; runs on Forgejo, and adds Pages, CI, package and container hosting, and issue tracking." },
      { name: "Bitbucket", description: "Unlimited public and private Git repositories for up to five users, with Pipelines for CI/CD." },
      { name: "GitGud", description: "Unlimited private and public repositories, free permanently; adds CI/CD, static hosting, a container registry, project management and issue tracking." },
    ],
  },
  {
    id: "continuous-integration-and-delivery",
    title: "Continuous integration and delivery",
    intro: "Continuous integration is the practice of merging every change into a shared branch, where an automated pipeline builds it and runs its tests; continuous delivery extends that pipeline so a passing change can be released without manual assembly. Together they replace the error-prone bundle of manual steps that otherwise separates a commit from a deploy. Free tiers for these services are usually metered in build minutes, concurrent jobs or team seats.",
    services: [
      { name: "CircleCI", description: "Free for up to 6,000 execution minutes per month with unlimited collaborators and 30 parallel jobs in private projects; up to 80,000 build minutes for open-source projects. Supports Docker, Windows, macOS and ARM executors." },
      { name: "Buildkite", description: "CI pipelines free for three users and 5,000 job minutes per month; the developer test-analytics tier adds 100,000 test executions per month." },
      { name: "Codemagic", description: "500 build minutes per month free, aimed at mobile build and release automation." },
      { name: "AppVeyor", description: "Continuous delivery for Windows, free for open-source projects." },
      { name: "Trigger.dev", description: "Background jobs and AI-agent tasks with durable, no-timeout execution; the free plan carries $5 of monthly compute, 20 concurrent runs, five team members and ten schedules." },
      { name: "Nx Cloud", description: "Remote caching and task distribution for monorepos, free for up to 30 contributors with 150,000 credits included." },
    ],
  },
  {
    id: "testing-and-quality-assurance",
    title: "Testing and quality assurance",
    intro: "Automated testing covers the range from unit tests that pin a function's behaviour to end-to-end tests that drive a real browser and visual-regression tests that compare rendered output against an approved baseline. Hosted testing services supply the runners, dashboards and saved snapshots that a single machine cannot reasonably hold, and many of them are free without qualification for open-source work.",
    services: [
      { name: "Cypress", description: "The test runner is free and open-source with no restrictions; the dashboard is free for open-source projects of up to five users." },
      { name: "Percy", description: "Visual testing for web apps, style guides and component libraries; unlimited team members and projects with 5,000 snapshots per month." },
      { name: "Argos", description: "Open-source visual testing with unlimited projects and 5,000 screenshots per month." },
      { name: "Lost Pixel", description: "Visual regression testing for Storybook, Ladle and Histoire; 7,000 snapshots per month, free for open-source with unlimited team members." },
      { name: "webhook.site", description: "A temporary URL and email address for inspecting outbound HTTP requests and webhooks; always free." },
      { name: "Qase", description: "Test-case management with the core features in the free tier, 500 MB of attachment storage and up to three users." },
    ],
  },
  {
    id: "code-quality-and-review",
    title: "Code quality and review",
    intro: "Code quality tooling inspects a change and reports the defects that a reviewer would otherwise have to find by hand — coverage gaps, duplicated logic, unsafe dependencies, style drift. Applied through a repository's integration, it comments on each pull request before a human looks, which is where it earns its keep. Almost all of these services are free for public repositories without a limit on how many are scanned.",
    services: [
      { name: "Codacy", description: "Automated review for a wide range of languages, free for unlimited public and private repositories." },
      { name: "Codecov", description: "Test-coverage reporting, free for open-source projects plus one private repository." },
      { name: "CodeRabbit", description: "AI-assisted pull-request review, free permanently for open source; the free tier runs 200 files per hour and three reviews per hour." },
      { name: "CodeFactor", description: "Automated review for Git repositories; unlimited users and public repositories plus one private repository." },
      { name: "DeepSource", description: "Continuous analysis for security, performance and bug-risk issues, integrated with GitHub, GitLab and Bitbucket." },
      { name: "Shields.io", description: "Quality-metadata badges for open-source projects — the small images that report build, coverage and version at a glance." },
    ],
  },
  {
    id: "security-and-certificates",
    title: "Security and certificates",
    intro: "Application security covers the exposure of secrets, the freshness of transport certificates and the provenance of dependencies. A certificate authority issues the TLS certificates that encrypt traffic; scanners then check the configuration that carries them, and secret-scanning and supply-chain tools watch for credentials and malicious packages entering a repository. The tooling that protects a small project is, in the main, free.",
    services: [
      { name: "Let's Encrypt", description: "A free certificate authority issuing TLS certificates trusted by all major browsers, which underpins encrypted transport for most of the open web." },
      { name: "GitGuardian", description: "Automated detection of secrets and sensitive files in Git repositories, scanning for more than 350 types; free for individuals and teams of up to 25 developers." },
      { name: "Socket", description: "Supply-chain security that flags vulnerable and malicious dependencies; free for individual developers, small teams and open-source projects." },
      { name: "Mozilla Observatory", description: "Scans a site's configuration and reports the security headers and settings it should fix." },
      { name: "Internet.nl", description: "Tests a domain against modern Internet standards including IPv6, DNSSEC, HTTPS, DMARC, STARTTLS and DANE." },
      { name: "Have I Been Pwned", description: "A REST API for checking whether an address appears in known data breaches." },
    ],
  },
  {
    id: "monitoring-and-uptime",
    title: "Monitoring and uptime",
    intro: "Monitoring is the continuous observation of a running system to detect failure before a user reports it. Uptime monitoring answers the narrowest and most important question — is the service reachable — while metrics, alerting and status pages add the context needed to act on the answer. These services typically charge by the number of monitors and the frequency at which each is checked; the free tiers are generous enough for a portfolio of small projects.",
    services: [
      { name: "UptimeRobot", description: "Fifty monitors with five-minute check intervals, supporting HTTP, ping, port and keyword checks." },
      { name: "Better Stack", description: "Ten monitors at three-minute frequency, with incident management, on-call scheduling and status pages in the same product." },
      { name: "Pingzen", description: "Up to 55 uptime and API monitors with one-minute check intervals and instant alerts." },
      { name: "Healthchecks.io", description: "Dead-man's-switch monitoring for cron jobs and background tasks; free for up to 20 checks." },
      { name: "Cronitor", description: "Uptime and cron monitoring for jobs, websites and APIs, with a free tier of five monitors." },
      { name: "Grafana Cloud", description: "A composable observability stack free for three users and ten dashboards, with 100 alerts, 10,000 metric series and 50 GB of logs at 14-day retention." },
    ],
  },
  {
    id: "logging-and-error-tracking",
    title: "Logging and error tracking",
    intro: "Logs are the chronological record of what a system did; error tracking is a focused form of the same idea that groups exceptions by cause and reports how often each one occurs. Both matter most in production, where a stack trace without the surrounding context is nearly useless. Free tiers for these services are measured in ingested events or bytes held, and several of the tools can be self-hosted without limit.",
    services: [
      { name: "Sentry", description: "Real-time exception tracking, free for 5,000 errors per month and one user; unrestricted if self-hosted." },
      { name: "GlitchTip", description: "Open-source error tracking compatible with the Sentry SDKs; 1,000 events per month free, or unlimited when self-hosted." },
      { name: "Rollbar", description: "Error and exception monitoring with a free plan of 5,000 errors per month, unlimited users and 30-day retention." },
      { name: "Axiom", description: "Log storage of up to 0.5 TB with 30-day retention and integrations for platforms such as Vercel." },
      { name: "New Relic", description: "Observability for the whole stack with 100 GB of data ingest per month, one full-access user and unlimited primary users." },
      { name: "Middleware.io", description: "Infrastructure monitoring and application performance monitoring for up to two hosts, with log monitoring for up to a million events per month." },
    ],
  },
  {
    id: "application-hosting",
    title: "Application hosting",
    intro: "Application hosting is the platform that builds a repository and serves the result on the public Internet. The category spans static-site hosting, which publishes pre-rendered files to a content delivery network, and platform-as-a-service offerings, which run a long-lived application process and attach a database behind it. Free tiers are usually expressed in bandwidth, build minutes or compute hours, and frequently allow a custom domain with automatic TLS.",
    services: [
      { name: "Vercel", description: "Builds, deploys and hosts web applications with free TLS, a global CDN and a unique preview URL for every push." },
      { name: "Netlify", description: "Free for 300 credits per month, which the vendor equates to 30 GB of bandwidth." },
      { name: "Cloudflare Pages", description: "Five hundred builds per month, 100 custom domains, integrated TLS, unlimited seats and unlimited preview deployments, with full-stack capability through Workers." },
      { name: "Render", description: "A unified cloud with free TLS, a global CDN and auto-deploys from Git; web services, databases and static pages each have a free plan." },
      { name: "Koyeb", description: "A serverless platform whose free hobby plan provides 550 compute hours per month at 512 MB of memory, one PostgreSQL database and custom-domain TLS." },
      { name: "Northflank", description: "Builds and runs containers, jobs and managed databases; the free tier includes two services, two cron jobs and one database." },
    ],
  },
  {
    id: "backend-as-a-service",
    title: "Backend as a service",
    intro: "A backend as a service supplies the server-side half of an application — a database, authentication, file storage and functions — behind an API that the client calls directly. The model removes the need to operate a server for projects whose logic is thin, and it suits prototypes and small products particularly well. Free tiers are measured in stored records, monthly function calls and active users.",
    services: [
      { name: "Supabase", description: "An open-source alternative to Firebase built on PostgreSQL; the free plan offers authentication, a realtime database and object storage." },
      { name: "Appwrite", description: "Unlimited projects with no pausing and WebSocket support; each project's free tier includes one database, three buckets and five functions." },
      { name: "Convex", description: "A reactive backend hosting documents with relationships and ACID transactions, serverless functions and WebSocket streaming; free for up to a million records and five million monthly function calls." },
      { name: "Nhost", description: "A serverless backend whose free plan includes PostgreSQL, GraphQL through Hasura, authentication, storage and serverless functions." },
      { name: "Back4App", description: "A flexible backend built on the open-source Parse platform." },
      { name: "Pusher Beams", description: "Unlimited push notifications for up to 2,000 monthly active users from a single API for iOS and Android." },
    ],
  },
  {
    id: "managed-data-services",
    title: "Managed data services",
    intro: "A managed database is one whose host handles provisioning, backups, patching and failover, leaving the developer only the schema and the queries. Managed offerings exist for the relational, document, key-value, graph and vector models, and the relational and key-value tiers are the ones most often free without a time limit. Limits here are stated in storage, monthly operations or compute-hour allowances, and the smallest tiers pause when idle.",
    services: [
      { name: "Neon", description: "Serverless PostgreSQL with 0.5 GB of storage per project across 100 projects, ten branches per project, 100 compute-unit hours per month and scale-to-zero after five minutes idle." },
      { name: "Turso", description: "SQLite at the edge with a permanent free plan of 9 GB total storage, up to 500 databases, three locations and a billion row reads per month." },
      { name: "Upstash", description: "Serverless Redis free up to 500,000 commands per month, with a 256 MB maximum database size and 20 concurrent connections." },
      { name: "Prisma Postgres", description: "Hosted PostgreSQL 17 with no cold starts; the free plan includes 1.01 GB of storage, 200,000 operations per month and 50 databases." },
      { name: "Aiven", description: "Free single-node PostgreSQL, MySQL and Valkey plans with one CPU, 1 GB of memory and, for the relational engines, 1 GB of storage." },
      { name: "Qdrant", description: "A vector database for embedding data, free at a single node with 0.5 vCPU, 1 GB of memory and 4 GB of disk." },
    ],
  },
  {
    id: "content-delivery-and-dns",
    title: "Content delivery and DNS",
    intro: "A content delivery network caches files at points of presence around the world so that a request is answered from a location near the visitor rather than from the origin server. The domain name system is the look-up layer that turns a name into an address, and the two are commonly operated together behind one edge provider that also filters hostile traffic. The tiers that make this free to a small site are among the most valuable on this page.",
    services: [
      { name: "Cloudflare", description: "Free DNS for unlimited domains with DDoS protection, a CDN and TLS, firewall and page rules, a web application firewall, bot mitigation, rate limiting and analytics." },
      { name: "Cloudflare Workers", description: "Serverless functions on the same global network, free for 100,000 requests per day; the companion R2 store offers 10 GB per month and D1 offers a 1 GB SQLite database with five million row reads per day." },
      { name: "jsDelivr", description: "A free open-source CDN serving packages from npm, GitHub, WordPress and Deno." },
      { name: "Gcore", description: "A global CDN free for 1 TB and one million requests per month, with DNS hosting included." },
      { name: "deSEC", description: "Free DNS hosting with API support, built on open-source software with security as an explicit design goal." },
      { name: "1.1.1.1", description: "A free public DNS resolver that encrypts queries, useful for bypassing provider-level blocking and query logging. It resolves names; it does not host zones." },
    ],
  },
  {
    id: "transactional-email",
    title: "Transactional email",
    intro: "Transactional email is the automated mail an application sends in response to an event — a sign-up confirmation, a password reset, a receipt — as distinct from bulk marketing. Delivering it reliably requires an authenticated sending domain configured with SPF, DKIM and DMARC, so the mail is not rejected as spoofed. Free tiers are counted in monthly messages, usually with a lower daily ceiling.",
    services: [
      { name: "Resend", description: "A transactional email API free for 3,000 messages per month and 100 per day, with one custom domain." },
      { name: "Brevo", description: "Free for 9,000 emails per month and 300 per day." },
      { name: "Mailjet", description: "Free for 6,000 emails per month, with a daily sending limit of 200." },
      { name: "MailerSend", description: "Email API and SMTP free for 500 transactional emails per month and 100 API requests per day." },
      { name: "Postmark", description: "Free for 100 emails per month, with unlimited weekly DMARC digests." },
      { name: "Mailtrap", description: "Free for 4,000 emails per month and 150 per day; its sandbox captures 50 test emails per month so sending can be verified without delivery." },
    ],
  },
  {
    id: "authentication-and-authorization",
    title: "Authentication and authorization",
    intro: "Authentication establishes who a user is; authorization decides what that user may do. Both are areas where a home-grown implementation is a liability, and where a mistake is a breach rather than a bug. Hosted identity services provide sign-in, multi-factor authentication, social-login and, increasingly, fine-grained permission models behind an SDK, and price the free tier by monthly active users.",
    services: [
      { name: "Clerk", description: "User management, authentication, MFA and prebuilt sign-in components; free for unlimited applications with 50,000 monthly retained users per app and three dashboard seats." },
      { name: "Auth0", description: "Hosted single sign-on free for 25,000 monthly active users, with unlimited social connections and a custom domain." },
      { name: "WorkOS", description: "User management and authentication free for up to one million monthly active users, including email and password, social login, magic auth and MFA." },
      { name: "SuperTokens", description: "Open-source authentication that integrates into an application directly; free for up to 5,000 monthly active users." },
      { name: "Logto", description: "Identity for authentication and authorization, free for up to 5,000 monthly active users with a self-hosted option." },
      { name: "ZITADEL Cloud", description: "Turnkey user and access management for multi-tenant applications, free for up to 25,000 authenticated requests with passwordless and one-time-password support." },
    ],
  },
  {
    id: "storage-and-media",
    title: "Storage and media",
    intro: "Object storage holds files as immutable blobs addressed by key, the model underlying most image, video and document delivery. A related class of services adds transformation — resizing an image, transcoding a video — at the point of delivery, so a single stored original can be served at any size. Free tiers are counted in stored bytes, delivery bandwidth or transformation credits, and several reserve their most generous terms for open-source projects.",
    services: [
      { name: "Cloudflare R2", description: "S3-compatible object storage free for 10 GB per month, with one million Class A and ten million Class B operations per month." },
      { name: "Backblaze B2", description: "S3-like object storage free for 10 GB, with no expiry." },
      { name: "Cloudinary", description: "Image upload, transformation and delivery with 25 monthly credits, where one credit is 1,000 transformations, 1 GB of storage or 1 GB of delivery." },
      { name: "ImageKit", description: "An image CDN with automatic optimization and real-time transformation, free up to 20 GB of bandwidth per month." },
      { name: "Gumlet", description: "Image and video hosting, processing and streaming, with 250 GB per month of video and 30 GB per month of image delivery free." },
      { name: "Pinata", description: "Pinning and management of files on the InterPlanetary File System, free for 1 GB of storage with API access." },
    ],
  },
  {
    id: "generative-ai-and-machine-learning",
    title: "Generative AI and machine learning",
    intro: "Generative models produce text, images or code from a prompt, and the tooling around them covers training, evaluation and observability. For an engineer the practical free tiers fall into two groups: inference — access to a hosted model — and the operations layer that traces, evaluates and monitors a model-backed application. Free inference is nearly always rate-limited rather than billed, so it suits experimentation and light production rather than sustained load.",
    services: [
      { name: "OpenRouter", description: "A single API across many models, several of them free, including DeepSeek and Llama variants; the free models are subject to rate limits." },
      { name: "Google AI Studio", description: "Free access to the Gemini and Gemma model families; the free Flash tier allows five requests per minute and 20 per day at up to 250,000 input tokens per minute." },
      { name: "Pollinations.AI", description: "Free image generation with a public API that requires no account or key." },
      { name: "Langfuse", description: "Open-source LLM engineering for debugging and iterating on model-backed applications; free permanently for 50,000 observations per month with all features." },
      { name: "Weights & Biases", description: "Experiment tracking, dataset versioning and model management, free for personal projects with 100 GB of storage." },
      { name: "Arize AX", description: "Observability and evaluation for AI applications, free for unlimited users and evaluations with 25,000 spans and 1 GB of ingestion per month." },
    ],
  },
  {
    id: "issue-tracking-and-project-management",
    title: "Issue tracking and project management",
    intro: "Issue tracking records the work a team intends to do and the state each item is in, and project management adds the boards, documents and diagrams around it. For a small collective the value is chiefly in having one place where a decision, a task and its owner are written down, rather than distributed across chat. Free plans in this category are usually limited by seat count or by the number of active items.",
    services: [
      { name: "Linear", description: "A streamlined issue tracker, free for unlimited members with up to 250 issues and 10 MB file uploads." },
      { name: "Jira", description: "Software project management free for up to ten users." },
      { name: "ClickUp", description: "Project management with a free tier that includes cloud storage, mobile applications and Git integrations." },
      { name: "Basecamp", description: "To-do lists, milestones, messages and file sharing for up to three projects, 20 users and 1 GB of storage." },
      { name: "diagrams.net", description: "Online diagrams stored locally in Google Drive, OneDrive or Dropbox; all features are free at every storage level." },
      { name: "Cloudcraft", description: "A visual designer for cloud architecture diagrams, free for unlimited private diagrams for a single user." },
    ],
  },
  {
    id: "caveats-and-sources",
    title: "Caveats and sources",
    paragraphs: [
      "The limits on this page are transcribed, not estimated. Each figure is the free-tier allowance that free-for.dev recorded as of 16 November 2026, and the vendors themselves are the authority on their own terms — a tier can change, and the pricing page is what governs. Where a service sleeps when idle, pauses after inactivity, or restricts a free plan to one project or one user, that constraint is part of the offer and is named above where the source states it.",
      "The list is intentionally partial. It covers the categories that matter most to engineers building and operating software, which is the work Baseline is built around; the source covers further ground still — analytics, forms, fonts, translation, visitor recording and more — and should be consulted directly for anything outside the scope here. Free-for.dev is a community project maintained by its contributors; this page restates its facts in prose and credits it as the origin.",
    ],
  },
];

export default function Resources() {
  const { t } = useI18n();
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
    document.title = `${t("Resources")} | Baseline`;
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
    <main className="resource-page">
      <a className="resource-skip-link" href="#resource-main">{t("Skip to content")}</a>
      <SiteHeader />

      <section className="resource-hero">
        <div className="resource-hero-inner content-wrap">
          <p className="resource-kicker" data-aos="fade-down"><span /> {t("Reference")} <span className="resource-kicker-divider">/</span> {t("Checked 16 November 2026")}</p>
          <h1 data-aos="zoom-in-up" data-aos-delay="80">{t("The free tier, catalogued.")}</h1>
          <p className="resource-lede" data-aos="fade-up" data-aos-delay="150">{t("A working reference to the services that give engineers a real free tier — what each one provides, and the limit worth knowing before you depend on it. Written as short articles; drawn from free-for.dev and checked on 16 November 2026.")}</p>
          <a className="resource-jump" href="#resource-contents" data-aos="fade-up" data-aos-delay="220">{t("Explore the reference")} <ArrowDown aria-hidden="true" /></a>
        </div>
      </section>

      <div className="resource-layout content-wrap" id="resource-contents">
        <aside className="resource-toc" aria-label={t("Contents")} data-aos="fade-right">
          <p className="resource-toc-heading">{t("Contents")} <span>{String(sections.length).padStart(2, "0")}</span></p>
          <nav>
            {sections.map((section, index) => (
              <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{t(section.title)}</a>
            ))}
          </nav>
        </aside>

        <article className="resource-article" id="resource-main">
          {sections.map((section, index) => (
            <section className="resource-section" id={section.id} key={section.id} data-aos="fade-up">
              <div className="resource-section-heading">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{t(section.title)}</h2>
              </div>
              {section.intro && <p className="resource-intro">{t(section.intro)}</p>}
              {section.paragraphs?.map((paragraph) => <p className="resource-paragraph" key={paragraph}>{t(paragraph)}</p>)}
              {section.services && (
                <div className="resource-service-list">
                  {section.services.map((service, serviceIndex) => (
                    <article className="resource-service" key={service.name} data-aos="fade-up" data-aos-delay={Math.min(serviceIndex * 45, 180)}>
                      <span className="resource-service-number">{String(serviceIndex + 1).padStart(2, "0")}</span>
                      <div><h3>{service.name}</h3><p>{t(service.description)}</p></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
          <p className="resource-source" data-aos="fade-up">{t("Source:")} <a href="https://github.com/ripienaar/free-for-dev" target="_blank" rel="noreferrer">ripienaar/free-for-dev</a> · retrieved 16 November 2026 · the source repository carries no licence file, and every entry remains the factual claim of the vendor named against it.</p>
        </article>
      </div>

      <section className="resource-cta content-wrap" data-aos="zoom-in-up">
        <Button asChild className="nav-cta"><a href="/#get-started">{t("Build With Us")} <ArrowUpRight aria-hidden="true" /></a></Button>
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
