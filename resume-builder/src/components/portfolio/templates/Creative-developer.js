import { useState } from "react";
import { CheckCircleIcon, CodeBracketIcon, LinkIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon, AcademicCapIcon, ChatBubbleOvalLeftEllipsisIcon, BoltIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";

// ─── Inline styles ────────────────────────────────────────────────────────────
const S = {
  glass: {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  terminalGlow: { boxShadow: "inset 0 0 10px rgba(0, 226, 147, 0.1)" },
  textGradient: {
    background: "linear-gradient(to right, #b7c4ff, #00e293)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  glowHover: { transition: "box-shadow 0.2s, border-color 0.2s" },
};

const NAV_LINKS = ["About", "Experience", "Skills", "Projects", "Education"];

const METRIC_COLORS = {
  blue: "#003ec7",
  green: "#00e293",
  purple: "#d1bcff",
  white: "#fff",
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ data }) {
  const [active, setActive] = useState("About");
  return (
    <nav className="border-b bg-slate-900/80 backdrop-blur-md border-slate-800/50 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-xl font-bold tracking-tighter text-white font-epilogue">
          {data.name}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link}`}
              onClick={() => setActive(link)}
              className={`font-epilogue text-sm font-medium tracking-tight transition-opacity duration-200 ${
                active === link
                  ? "text-blue-400 border-b-2 border-blue-600 pb-1"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {link}
            </a>
          ))}
        </div>
        <a
          href={`mailto:${data.email}`}
          className="font-epilogue text-sm font-medium bg-[#0052ff] text-white px-6 py-2 rounded-full hover:opacity-90 active:scale-95 transition-all"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32 grid md:grid-cols-2 gap-12 items-center pt-32" id="About">
      <div>
        <span className="text-xs font-bold tracking-[0.2em] text-[#00e293] block mb-4 uppercase">
          {data.title}
        </span>
        <h1 className="text-[72px] leading-[80px] tracking-[-0.04em] font-extrabold text-white font-epilogue mb-6">
          Building digital{" "}
          <span style={S.textGradient}>architectures</span> that breathe.
        </h1>
        <p className="text-lg text-slate-400 mb-8 max-w-lg">{data.bio}</p>
        <div className="flex gap-4">
          <a
            href="#Projects"
            className="bg-[#003ec7] text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-lg flex items-center gap-2 group hover:shadow-[0_0_20px_rgba(0,62,199,0.4)] transition-all"
          >
            VIEW PROJECTS
            <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href={data.cvUrl}
            className="border border-slate-700 text-white text-xs font-bold tracking-widest uppercase px-8 py-4 rounded-lg hover:bg-slate-800 transition-all"
          >
            DOWNLOAD CV
          </a>
        </div>
      </div>

      <div className="relative">
        <div style={S.glass} className="aspect-square rounded-2xl overflow-hidden p-4">
          <div className="w-full h-full rounded-xl bg-slate-800 overflow-hidden relative">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover mix-blend-overlay opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <CodeBracketIcon className="w-16 h-16 text-[#003ec7] mb-4 block" />
                <div className="font-mono text-sm text-[#00e293] px-4 py-2 bg-slate-900/90 rounded border border-slate-700">
                  {`const developer = { status: 'innovating' };`}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={S.glass} className="absolute -bottom-6 -left-6 p-6 rounded-xl hidden lg:block">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#7000ff] flex items-center justify-center">
              <BoltIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold font-epilogue">
                {data.yearsOfExperience} Years
              </div>
              <div className="text-slate-400 text-xs tracking-widest uppercase">
                Experience
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
function Metrics({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.metrics.map(({ value, label, color }) => (
          <div key={label} style={S.glass} className="p-8 rounded-2xl text-center">
            <div
              className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue mb-2"
              style={{ color: METRIC_COLORS[color] || "#fff" }}
            >
              {value}
            </div>
            <div className="text-xs font-bold tracking-widest uppercase text-slate-500">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────
function Projects({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="Projects">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-4 block">
            PORTFOLIO
          </span>
          <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-white">
            Selected Works
          </h2>
        </div>
        <div className="flex gap-4">
          <button
            className="p-3 border border-slate-700 rounded-full text-slate-400 hover:border-[#003ec7] hover:text-[#003ec7] transition-all"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button
            className="p-3 border border-slate-700 rounded-full text-slate-400 hover:border-[#003ec7] hover:text-[#003ec7] transition-all"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.projects.map(({ title, description, image, tags, link }) => (
          <div
            key={title}
            style={{ ...S.glass, ...S.glowHover }}
            className="group rounded-2xl overflow-hidden border-slate-800 hover:border-[#003ec7] flex flex-col"
          >
            <div className="aspect-[16/10] overflow-hidden relative">
              <img
                src={image}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex gap-2 mb-4 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-slate-800 text-[#003ec7] border border-[#003ec7]/20 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-lg font-semibold text-white font-epilogue mb-2">{title}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-1">{description}</p>
              <a
                href={link}
                className="font-mono text-sm text-[#003ec7] flex items-center gap-2 group/link"
              >
                Case Study{" "}
                <ArrowRightIcon className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────
function Skills({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="Skills">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#d1bcff] mb-4 block">
            TECHNICAL STACK
          </span>
          <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-white mb-8">
            Crafting with the latest technologies.
          </h2>
          <p className="text-slate-400 mb-12">
            My toolkit is curated for speed, scalability, and maintainability. I
            believe in choosing the right tool for the job.
          </p>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4 border-l-2 border-[#003ec7] pl-4">
                Languages
              </h4>
              <ul className="space-y-3 text-slate-400">
                {data.languages.map((lang) => (
                  <li key={lang} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#003ec7] rounded-full" />
                    {lang}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-white mb-4 border-l-2 border-[#00e293] pl-4">
                Certifications
              </h4>
              <ul className="space-y-3 text-slate-400">
                {data.certifications.map((cert) => (
                  <li key={cert} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#00e293] rounded-full" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Terminal card */}
        <div
          style={{ ...S.glass, ...S.terminalGlow }}
          className="rounded-xl overflow-hidden border-slate-700"
        >
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="font-mono text-xs text-slate-500">skills_manifest.json</div>
          </div>
          <div className="p-8 font-mono text-sm leading-relaxed overflow-x-auto">
            <pre className="text-slate-300">
              <span className="text-blue-400">{"{"}</span>{"\n"}
              {"  "}<span className="text-[#00e293]">"core_competencies"</span>
              {": "}<span className="text-blue-400">{"["}</span>{"\n"}
              {data.coreCompetencies.map((c) => (
                `    "${c}",\n`
              )).join("")}
              {"  "}<span className="text-blue-400">{"]"}</span>{",\n"}
              {"  "}<span className="text-[#00e293]">"skills"</span>
              {": "}<span className="text-blue-400">{"["}</span>{"\n"}
              {data.skills.map((s) => (
                `    "${s.label}",\n`
              )).join("")}
              {"  "}<span className="text-blue-400">{"]"}</span>{"\n"}
              <span className="text-blue-400">{"}"}</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Experience & Education ───────────────────────────────────────────────────
function ExperienceEducation({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="Experience">
      <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-white mb-12 text-center">
        Trajectory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Experience */}
        <div style={S.glass} className="md:col-span-2 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8">
            <span className="material-symbols-outlined text-[#003ec7] text-6xl opacity-10">
              work_history
            </span>
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-6 block">
            PROFESSIONAL EXPERIENCE
          </span>
          <div className="space-y-8">
            {data.experience.map(({ period, role, company, description }) => (
              <div key={role} className="flex gap-6">
                <div className="text-slate-500 font-mono text-sm pt-1 shrink-0">
                  {period.replace(" — ", "—")}
                </div>
                <div>
                  <h4 className="text-white font-bold">{role}</h4>
                  <p className="text-[#b7c4ff] mb-2">{company}</p>
                  <p className="text-slate-400 text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div
          style={S.glass}
          className="p-8 rounded-3xl flex flex-col justify-between hover:bg-slate-800 transition-colors"
          id="Education"
        >
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-[#00e293] mb-6 block">
              ACADEMIC BACKGROUND
            </span>
            {data.education.map(({ degree, institution, detail }) => (
              <div key={degree} className="mb-8">
                <h4 className="text-white font-bold">{degree}</h4>
                <p className="text-slate-400 text-sm">{institution}</p>
                {detail && <p className="text-slate-500 text-xs mt-1">{detail}</p>}
              </div>
            ))}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-[#003ec7] font-mono text-sm">
              <CheckBadgeIcon className="w-4 h-4" />
              <span>GPA 3.9 / 4.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Certifications ───────────────────────────────────────────────────────────
// Renders only when data.certificationsList is a non-empty array
function CertificationsSection({ data }) {
  const items = data.certificationsList;
  if (!items?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="text-center mb-12">
        <span className="text-xs font-bold tracking-widest uppercase text-[#d1bcff] mb-3 block">
          Credentials
        </span>
        <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue text-white">
          Certifications
        </h2>
      </div>

      <div
        style={S.glass}
        className="rounded-3xl p-8 flex flex-wrap gap-4"
      >
        {items.map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 hover:border-[#003ec7] hover:shadow-md transition-all group w-fit"
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-600 transition-colors">
              <AcademicCapIcon className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-slate-300 leading-snug">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
// Renders only when data.testimonials is a non-empty array
function TestimonialsSection({ data }) {
  const items = data.testimonials;
  if (!items?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="text-center mb-12">
        <span className="text-xs font-bold tracking-widest uppercase text-[#d1bcff] mb-3 block">
          Kind Words
        </span>
        <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue text-white">
          What People Say
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ quote, name, title, avatar }) => (
          <div
            key={name}
            style={S.glass}
            className="relative p-8 rounded-3xl flex flex-col justify-between gap-8 hover:-translate-y-1 transition-transform duration-300"
          >
            <LinkIcon className="w-12 h-12 absolute -top-6" />

            <p className="text-slate-300 leading-relaxed italic flex-1">
              "{quote}"
            </p>

            <div className="flex items-center gap-4 border-t border-slate-700 pt-6">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-600"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="w-11 h-11 rounded-full bg-slate-700 text-white text-sm font-bold items-center justify-center hidden shrink-0"
              >
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-white font-epilogue leading-tight">
                  {name}
                </p>
                <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mt-0.5">
                  {title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div
        style={S.glass}
        className="rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,82,255,0.1),transparent)]" />
        <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue text-white mb-6 relative z-10">
          {data.cta.heading}
        </h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
          {data.cta.subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <a
            href={`mailto:${data.email}`}
            className="bg-white text-slate-900 text-xs font-bold tracking-widest uppercase px-10 py-5 rounded-full hover:bg-[#003ec7] hover:text-white transition-all shadow-xl"
          >
            {data.cta.primaryLabel.toUpperCase()}
          </a>
          <a
            href={data.socials.github}
            style={S.glass}
            className="text-white text-xs font-bold tracking-widest uppercase px-10 py-5 rounded-full hover:bg-slate-700 transition-all"
          >
            VIEW MY GITHUB
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ data }) {
  const links = [
    { label: "LinkedIn", href: data.socials.linkedin },
    { label: "GitHub", href: data.socials.github },
    { label: "Twitter", href: data.socials.twitter },
    { label: "Email", href: `mailto:${data.email}` },
  ];
  return (
    <footer className="w-full py-12 border-t mt-20 bg-slate-950 border-slate-800">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-epilogue font-bold text-white text-lg">{data.name}</div>
        <p className="font-epilogue text-xs uppercase tracking-widest text-slate-500">
          © 2024 Portfolio Generator. All rights reserved.
        </p>
        <div className="flex gap-8">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-epilogue text-xs uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
/**
 * CreativeDeveloperTemplate
 * @param {{ data: import('./portfolioSchema').samplePortfolioData }} props
 */
export default function CreativeDeveloperTemplate({ data }) {
  return (
    <div style={{ backgroundColor: "#020617", color: "#f8fafc" }} className="antialiased">
      <Navbar data={data} />
      <main>
        <Hero data={data} />
        <Metrics data={data} />
        <Projects data={data} />
        <Skills data={data} />
        <ExperienceEducation data={data} />
        <CertificationsSection data={data} />
        <TestimonialsSection data={data} />
        <CTA data={data} />
      </main>
      <Footer data={data} />
    </div>
  );
}