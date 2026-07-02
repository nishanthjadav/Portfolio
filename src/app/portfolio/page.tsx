import type { Metadata } from "next";
import Link from "next/link";
import EmailDropdown from "./EmailDropdown";
import PortfolioNav from "./PortfolioNav";
import ProjectsSection from "./ProjectsSection";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Projects, experience, and life outside of code — the long-form portfolio of Nishanth Jadav, a Software Engineer studying CS + Math at Villanova.",
  openGraph: {
    title: "Portfolio · Nishanth Jadav",
    description:
      "Projects, experience, and life outside of code — the long-form portfolio of Nishanth Jadav.",
    url: "/portfolio",
    type: "website",
  },
  alternates: { canonical: "/portfolio" },
};

type ExperienceEntry = {
  company: string;
  title: string;
  dates: string;
  description: React.ReactNode;
  logo?: { src: string; alt: string };
};

type MediaItem = {
  src: string;
  alt: string;
  kind?: "image" | "video";
};

type Project = {
  name: string;
  year: string;
  description: string;
  features?: string[];
  media?: MediaItem[];
  links: Array<{ label: string; href: string }>;
};

type LifeEntry = {
  kicker: string;
  title: string;
  span: "wide" | "narrow";
  variant: "trio" | "duo" | "split";
  media: MediaItem[];
};

const experience: ExperienceEntry[] = [
  {
    company: "SAP",
    title: "Software Engineering Intern",
    dates: "May 2026 – Present",
    description: "Cloud infrastructure.",
    logo: { src: "/pictures/logos/sap-logo.png", alt: "SAP logo" },
  },
  {
    company: "Frigate",
    title: "Software Engineering Intern",
    dates: "May 2025 – Aug 2025",
    description: "Building fintech at a startup.",
    logo: { src: "/pictures/logos/frigate-logo.png", alt: "Frigate logo" },
  },
  {
    company: "Villanova University",
    title: "Research Assistant, Developer Intern",
    dates: "Aug 2024 – Present",
    description: (
      <>
        Military vehicle CNN research | maintained the{" "}
        <a
          href="https://www.villanova.edu/university.html"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-accent decoration-1 underline-offset-4 hover:text-ink transition-colors"
        >
          Villanova
        </a>{" "}
        website.
      </>
    ),
    logo: { src: "/pictures/logos/villanova-logo.png", alt: "Villanova University logo" },
  },
];

const projects: Project[] = [
  {
    name: "Politician Trade Copier",
    year: "2026",
    description: "Congress members probably insider trade. Now, you can too.",
    features: [
      "Scrapes CapitolTrades daily and flags unusual trades with an Isolation Forest anomaly model.",
      "One-click copy trading: mirrors any politician's fills into your Alpaca brokerage with live P&L.",
    ],
    media: [
      { src: "/pictures/politician-tracker/main-page.png", alt: "Politician Trade Copier — main dashboard" },
      { src: "/pictures/politician-tracker/anomalies-page.png", alt: "Politician Trade Copier — anomalies view" },
    ],
    links: [
      { label: "Live", href: "https://gov-trade-tracker.vercel.app/" },
      { label: "GitHub", href: "https://github.com/nishanthjadav/GovTradeTracker" },
    ],
  },
  {
    name: "Desk Watcher",
    year: "2026",
    description: "Visualize your productivity, phone usage, lunch break length, etc.",
    features: [
      "Fuses a MediaPipe pose classifier with YOLOv8 phone detection to log sips, breaks, and focus in real time.",
      "Local-only. Video never leaves your machine; only pose keypoints and activity labels are stored.",
    ],
    media: [
      { src: "/pictures/desk-watcher/landing-page1.png", alt: "Desk Watcher — landing page" },
      { src: "/pictures/desk-watcher/landing-page-info.png", alt: "Desk Watcher — how it works" },
      { src: "/pictures/desk-watcher/main-page.png", alt: "Desk Watcher — main dashboard" },
    ],
    links: [
      { label: "Live", href: "https://desk-watcher.vercel.app/" },
      { label: "GitHub", href: "https://github.com/nishanthjadav/Desk-Watcher" },
    ],
  },
  {
    name: "Project Euler Solutions",
    year: "2023 - Present",
    description: "It's like Leetcode, but with more math, so it's better.",
    media: [
      { src: "/pictures/euler/progress.png", alt: "Project Euler — progress" },
      { src: "/pictures/euler/sample-problem.png", alt: "Project Euler — sample problem" },
    ],
    links: [
      { label: "Archive", href: "https://projecteuler.net/archives" },
      { label: "GitHub", href: "https://github.com/nishanthjadav/Project-Euler" },
    ],
  },
];

const life: LifeEntry[] = [
  {
    kicker: "Friends",
    title: "Home base.",
    span: "wide",
    variant: "trio",
    media: [
      { src: "/pictures/friends/friends1.jpg", alt: "Friends 1" },
      { src: "/pictures/friends/friends2.jpg", alt: "Friends 2" },
      { src: "/pictures/friends/friends3.jpg", alt: "Friends 3" },
    ],
  },
  {
    kicker: "Badminton",
    title: "Club Team",
    span: "narrow",
    variant: "duo",
    media: [
      { src: "/pictures/badminton/badminton1.jpg", alt: "Badminton 1" },
      { src: "/pictures/badminton/badminton2.jpg", alt: "Badminton 2" },
    ],
  },
  {
    kicker: "Food",
    title: "Follow me on Beli: @nishanth1",
    span: "narrow",
    variant: "duo",
    media: [
      { src: "/pictures/food/food-1.jpg", alt: "Food 1" },
      { src: "/pictures/food/food-2.jpg", alt: "Food 2" },
    ],
  },
  {
    kicker: "Travel",
    title: "Places lately.",
    span: "wide",
    variant: "split",
    media: [
      { src: "/pictures/travel/travel1.jpg", alt: "Travel 1" },
      { src: "/pictures/travel/travel-2.MOV", alt: "Travel — video", kind: "video" },
    ],
  },
];

export default function Portfolio() {
  return (
    <div id="top" className="min-h-screen">
      <PortfolioNav />

      <main className="pb-24">
        <section className="max-w-4xl mx-auto px-8 pt-16 pb-16">
          <h1 className="text-xl sm:text-2xl font-medium tracking-tight mb-4">
            Nishanth Jadav
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-6">
           I like building fun things. CS + Math @ Villanova '28. 
          </p>

          <figure className="my-10 mx-auto max-w-[620px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pictures/travel/travel3.jpg"
              alt="Travel — hero"
              className="w-full aspect-[1.55/1] rounded-2xl object-cover shadow-[0_18px_45px_rgba(29,44,42,0.08)]"
            />
            <figcaption className="mt-4 text-center text-sm italic text-muted">
              Old San Juan, Puerto Rico
            </figcaption>
          </figure>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm">
            <EmailDropdown />
            <a href="https://github.com/nishanthjadav" className="underline underline-offset-4 hover:text-muted transition-colors">GitHub</a>
            <a href="https://linkedin.com/in/nishanthjadav" className="underline underline-offset-4 hover:text-muted transition-colors">LinkedIn</a>
            <a href="/Nishanth_Jadav_Resume.pdf" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-muted transition-colors">Resume</a>
          </div>
        </section>

        <section id="experience" className="w-[min(1400px,calc(100vw-4rem))] mx-auto py-12 border-t border-hair scroll-mt-20">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Where I&apos;ve been.</p>
            <h2 className="text-[clamp(2rem,5vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.08em]">
            Experience
            </h2>
            <br/>
          </div>
          <ul className="mt-6">
            {experience.map((role) => (
              <li
                key={role.company + role.dates}
                className="grid grid-cols-[120px_minmax(0,1fr)] gap-5 items-center py-6 border-t border-hair"
              >
                <div className="w-[120px] h-[74px] p-3 border border-hair rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                  {role.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={role.logo.src}
                      alt={role.logo.alt}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-muted" aria-hidden="true">logo</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[1.1rem] font-medium tracking-[-0.04em]">{role.company}</h3>
                    <span className="text-[0.82rem] text-muted whitespace-nowrap">{role.dates}</span>
                  </div>
                  <p className="text-[1.04rem] mt-1">{role.title}</p>
                  {role.description ? (
                    <p className="text-sm text-muted leading-relaxed mt-1 max-w-3xl">{role.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section id="projects" className="w-[min(1400px,calc(100vw-4rem))] mx-auto py-12 border-t border-hair scroll-mt-20">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Some things I&apos;ve worked on.</p>
            <h2 className="text-[clamp(2rem,5vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.08em]">
              Projects
            </h2>
            <br/>
          </div>
          <ProjectsSection projects={projects} />
        </section>

        <section id="life" className="w-[min(1400px,calc(100vw-4rem))] mx-auto py-12 border-t border-hair scroll-mt-20">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest text-muted mb-2">Outside of coding.</p>
            <h2 className="text-[clamp(2rem,5vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.08em]">
              Life Lately
            </h2>
            <br/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {life.map((entry) => {
              const panelSpan = entry.span === "wide" ? "md:col-span-7" : "md:col-span-5";
              const gridClass =
                entry.variant === "trio"
                  ? "grid grid-cols-1 sm:grid-cols-3 gap-3"
                  : entry.variant === "duo"
                  ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
                  : "grid grid-cols-1 sm:grid-cols-[0.95fr_1.05fr] gap-3";
              const tileHeight = entry.variant === "split" ? "sm:h-[320px]" : "sm:h-[260px]";
              return (
                <article
                  key={entry.kicker}
                  className={`${panelSpan} p-4 border border-hair rounded-[1.6rem] bg-white/60 shadow-[0_20px_45px_rgba(24,37,35,0.06)]`}
                >
                  <div className="mb-4 px-1">
                    <p className="text-[0.72rem] uppercase tracking-[0.12em] text-muted mb-1">
                      {entry.kicker}
                    </p>
                    <h3 className="text-base font-medium">{entry.title}</h3>
                  </div>
                  <div className={gridClass}>
                    {entry.media.map((m) => (
                      <div
                        key={m.src}
                        className={`w-full aspect-[4/5] sm:aspect-auto ${tileHeight} rounded-[1.2rem] overflow-hidden bg-[#d9d0c3]`}
                      >
                        {m.kind === "video" ? (
                          <video
                            src={m.src}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.src}
                            alt={m.alt}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="w-[min(1400px,calc(100vw-4rem))] mx-auto py-8 border-t border-hair text-xs text-muted flex justify-between">
        <span></span>
        <Link href="/interactive" className="hover:text-ink transition-colors">
          Interactive Mode →
        </Link>
      </footer>
    </div>
  );
}
