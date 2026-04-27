
import { useState } from "react";
import { RocketLaunchIcon, DocumentArrowDownIcon, CodeBracketSquareIcon, EyeIcon, ArrowUpRightIcon, EnvelopeIcon, ChatBubbleOvalLeftEllipsisIcon, CheckBadgeIcon, PlusCircleIcon, AcademicCapIcon, CommandLineIcon, IdentificationIcon, InboxStackIcon, LinkIcon, BookOpenIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import * as HistoryIconModule from "@icons/material/HistoryIcon";
import * as WorkerIconModule from "@icons/material/WorkerIcon";
import * as CopyrightIconModule from "@icons/material/CopyrightIcon";
import { AvatarUser, AvatarWorks } from "../../../utils/createAvatar";


const HistoryIcon = HistoryIconModule.default;
const WorkerIcon = WorkerIconModule.default;
const CopyrightIcon = CopyrightIconModule.default;


// ─── Inline styles ────────────────────────────────────────────────────────────
const S = {
  glassCard: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: "0 8px 32px 0 rgba(0, 76, 237, 0.05)",
  },
  floatingBlob: {
    position: "absolute",
    zIndex: -1,
    filter: "blur(80px)",
    opacity: 0.4,
    borderRadius: "50%",
  },
  textGradient: {
    background: "linear-gradient(135deg, #003ec7 0%, #5400c3 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
};

const NAV_LINKS = ["about", "experience", "skills", "projects", "education"];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ data }) {
  const [active, setActive] = useState("about");

  return (
    <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-xl font-bold tracking-tighter text-slate-900 font-epilogue">
          {data.name}
        </div>
        <div className="hidden md:flex items-center gap-8 font-epilogue text-sm font-medium tracking-tight">
          {NAV_LINKS.map((link) => (

            ((link === 'about' && data['bio']) || data[link]) && <a
              key={link}
              href={`#${link}`}
              onClick={() => setActive(link)}
              className={
                active === link
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1 capitalize"
                  : "text-slate-600 hover:text-slate-900 transition-opacity duration-200 capitalize"
              }
            >
              {link}
            </a>
          ))}
        </div>
        <a
          href={`mailto:${data.email}`}
          className="bg-[#003ec7] text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ data }) {
  // Pick the top metric for the floating badge
  const badge = data.metrics?.[0];

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="about">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        {/* Left copy */}
        <div className="lg:w-3/5 space-y-8">
          {data.availabilityBadge && (
            <div className="inline-flex items-center gap-2 bg-green-100/60 text-green-600 px-4 py-1.5 rounded-full border border-green-200 text-xs font-bold tracking-widest uppercase">
              <CheckBadgeIcon className="w-4 h-4" />
              {data.availabilityBadge}
            </div>
          )}
          <h1 className="text-[72px] leading-[80px] tracking-[-0.04em] font-extrabold text-slate-900 font-epilogue">
            <span style={S.textGradient}>{data.tagline.split(" ").slice(0, 2).join(" ")}</span>{" "}
            {data.tagline.split(" ").slice(2).join(" ")}
          </h1>
          <p className="text-lg leading-7 text-slate-500 max-w-2xl">{data.bio}</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <a
              href={data.cvUrl}
              className="bg-[#003ec7] text-white px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-xl"
            >
              <DocumentArrowDownIcon className="w-4 h-4" />
              Download CV
            </a>
            <a
              href="#projects"
              className="bg-white text-slate-800 border border-slate-300 px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors"
            >
              View Portfolio
            </a>
          </div>
        </div>

        {/* Right avatar */}
        <div className="lg:w-2/5 relative">
          <div
            style={S.glassCard}
            className="aspect-square rounded-3xl overflow-hidden p-4 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl"
          >
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => { e.target.src = AvatarUser({ seed: data.name }) }}
            />
          </div>

          {/* Floating badge — driven by first metric */}
          {badge && (
            <div
              style={S.glassCard}
              className="absolute -bottom-6 -left-10 p-4 rounded-2xl flex items-center gap-4 animate-bounce"
            >
              <div className="w-12 h-12 bg-[#00754a] rounded-full flex items-center justify-center text-[#69ffb5]">
                <RocketLaunchIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase text-slate-800">
                  {badge.value} {badge.label}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                  Delivered
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────
function ExperienceSection({ data }) {
  const current = data.experience.find((e) => e.isCurrent) || data.experience[0];
  const previous = data.experience.find((e) => !e.isCurrent) || data.experience[1];
  const rest = data.experience.slice(2);

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="experience">
      <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue mb-12">
        Experience
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current role — large card */}
        <div
          style={S.glassCard}
          className="md:col-span-2 p-8 rounded-3xl flex flex-col justify-between min-h-[320px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-2 block">
                Current Role
              </span>
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue">
                {current.role}
              </h3>
              <p className="text-slate-500">
                {current.company} • {current.period}
              </p>
            </div>
            <WorkerIcon className="w-16 h-16" />
          </div>
          <p className="text-slate-500 mt-6">{current.description}</p>
        </div>

        {/* Previous role — accent card */}
        {previous && (
          <div className="bg-[#7000ff] text-white p-8 rounded-3xl flex flex-col justify-between shadow-xl">
            <HistoryIcon className="w-4 h-4" />
            <div>
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue">
                {previous.role}
              </h3>
              <p className="opacity-80">
                {previous.company} • {previous.period}
              </p>
            </div>
            <p className="text-white mt-6">{current.description}</p>
          </div>
        )}

        {/* "View earlier" card — only shown if there's more history */}
        {rest.length > 0 && (
          <div
            style={S.glassCard}
            className="p-8 rounded-3xl border-dashed border-2 border-slate-300 flex items-center justify-center text-center cursor-pointer hover:border-[#003ec7] transition-colors"
          >
            <div>
              <PlusCircleIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
                {rest.length} Earlier {rest.length === 1 ? "Role" : "Roles"}
              </p>
            </div>
          </div>
        )}

        {/* Years of experience stat card */}
        <div
          style={S.glassCard}
          className="md:col-span-2 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="w-full lg:w-1/3 bg-slate-100 rounded-2xl p-6 text-center">
            <p className="text-[clamp(2rem,6vw,4.5rem)] font-extrabold text-[#003ec7] leading-tight">
              {data.yearsOfExperience}
            </p>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              Years of Craft
            </p>
          </div>
          <p className="w-full md:w-2/3 text-slate-500">
            Collaborated with global teams to launch products used by millions,
            maintaining a focus on pixel-perfect execution and strategic business goals.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────
function SkillsSection({ data }) {

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="skills">
      <div style={S.glassCard} className="rounded-[40px] p-12 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue mb-8">
            Technical Stack
          </h2>
          <div className="flex flex-wrap gap-4">
            {data.skills.map(({ label, detail, color }) => (
              <div
                key={label}
                className="group relative bg-white border border-slate-200 px-6 py-3 rounded-full flex items-center gap-3 cursor-help hover:border-[#003ec7] transition-colors"
              >
                <span className={`w-2 h-2 rounded-full bg-slate-400}`} style={{ background: color }} />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-800">
                  {label}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-52 p-3 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 leading-relaxed">
                  {detail}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/40 to-transparent opacity-50" />
      </div>
    </section>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────
function ProjectsSection({ data }) {
  const HOVER_COLORS = [
    "bg-[#003ec7]/20",
    "bg-[#5400c3]/20",
    "bg-[#00754a]/20",
    "bg-[#0052ff]/20",
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="projects">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue">
            Selected Works
          </h2>
          <p className="text-slate-500 max-w-lg">
            A showcase of design-led engineering and strategic product thinking.
          </p>
        </div>
        <div className="flex gap-4">
          <CodeBracketSquareIcon className="w-16 h-16" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.projects.slice(0, 4).map(({ title, description, image, category, type }, i) => (
          <div key={title} className="group cursor-pointer">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] mb-6 shadow-2xl">
              <img
                src={image}
                alt={title}
                onError={(e) => { e.target.src = AvatarWorks({ seed: title }) }}
                className="w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className={`absolute inset-0 ${HOVER_COLORS[i % HOVER_COLORS.length]} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm`}
              >
                <div className="bg-white p-4 rounded-full">
                  <EyeIcon className="w-16 h-16" />
                </div>
              </div>
            </div>
            <div className="px-2">
              <div className="flex gap-3 mb-3">
                {[category, type].filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue mb-2 group-hover:text-[#003ec7] transition-colors">
                {title}
              </h3>
              <p className="text-slate-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Contact / Social ─────────────────────────────────────────────────────────
function ContactSection({ data }) {
  const socialLinks = [
    { name: "Dribbble", href: data.socials?.dribbble || "#" },
    { name: "LinkedIn", href: data.socials?.linkedin || "#" },
    { name: "Instagram", href: data.socials?.instagram || "#" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Social links */}
        <div
          style={S.glassCard}
          className="lg:col-span-1 p-10 rounded-[32px] flex flex-col justify-between"
        >
          <div>
            <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue mb-4">
              Let's Connect
            </h2>
            <p className="text-slate-500">
              Stay updated with my latest experiments and process updates.
            </p>
          </div>
          <div className="space-y-4 mt-12">
            {socialLinks.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                className="flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-blue-50 transition-colors border border-slate-200 group"
              >
                <span className="text-xs font-bold tracking-widest uppercase text-slate-800">
                  {name}
                </span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* CTA dark card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 text-white rounded-[32px] p-12">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="max-w-md">
              <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue mb-6">
                {data.cta.heading}
              </h2>
              <p className="text-lg text-slate-400 mb-12">{data.cta.subtext}</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <a
                href={`mailto:${data.email}`}
                className="bg-[#003ec7] text-white px-10 py-5 rounded-2xl text-xs font-bold tracking-widest uppercase shadow-2xl hover:scale-105 transition-transform active:scale-95"
              >
                {data.cta.primaryLabel}
              </a>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase">Email Me</p>
                  <p className="text-white">{data.email}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#0052ff] rounded-full blur-[100px] opacity-20" />
          <div className="absolute top-10 right-10 flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
            <div className="w-3 h-3 rounded-full bg-green-500/30" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Education ────────────────────────────────────────────────────────────────
// Renders only when data.education is a non-empty array
function EducationSection({ data }) {
  const items = data.education;
  if (!items?.length) return null;
 
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="education">
      <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue mb-12">
        Education
      </h2>
 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(({ year, degree, institution, detail }, i) => (
          <div
            key={degree}
            style={S.glassCard}
            className="p-8 rounded-3xl flex flex-col justify-between gap-6 hover:-translate-y-1 transition-transform duration-300"
          >
            {/* Top row — year badge + icon */}
            <div className="flex items-start justify-between">
              <span className="inline-block bg-blue-100 text-[#003ec7] text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full">
                {year}
              </span>
              {i === 0 ? <BookOpenIcon className="w-10 h-10"/>
              : <BuildingOffice2Icon className="w-10 h-10"/>}
              
            </div>
 
            {/* Degree & institution */}
            <div>
              <h3 className="text-[22px] leading-[30px] font-semibold font-epilogue text-slate-900 mb-1">
                {degree}
              </h3>
              <p className="text-slate-500 font-medium">{institution}</p>
            </div>
 
            {/* Detail line — GPA, honours, specialization etc. */}
            {detail && (
              <p className="text-sm text-slate-400 border-t border-slate-200/70 pt-4">
                {detail}
              </p>
            )}
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
      {/* Section header */}
      <div className="mb-12">
        <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-3 block">
          Kind Words
        </span>
        <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue">
          What People Say
        </h2>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ quote, name, title, avatar }) => (
          <div
            key={name}
            style={S.glassCard}
            className="relative p-8 rounded-3xl flex flex-col justify-between gap-8 hover:-translate-y-1 transition-transform duration-300"
          >
            {/* Quote mark */}
            <LinkIcon className="w-12 h-12 absolute -top-6"/>
 
            {/* Quote text */}
            <p className="text-slate-600 leading-relaxed italic flex-1">
              "{quote}"
            </p>
 
            {/* Author */}
            <div className="flex items-center gap-4 border-t border-slate-200/70 pt-6">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
                  onError={(e) => {
                    // Fallback to initials avatar if image fails to load
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              {/* Initials fallback — hidden by default, shown via onError above */}
              <div
                className="w-11 h-11 rounded-full bg-blue-100 text-[#003ec7] text-sm font-bold items-center justify-center hidden shrink-0"
              >
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-slate-900 font-epilogue leading-tight">
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
 
// ─── Certifications ───────────────────────────────────────────────────────────
// Renders only when data.certificationsList is a non-empty array
function CertificationsSection({ data }) {
  const items = data.certificationsList;
  if (!items?.length) return null;
 
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      {/* Section header */}
      <div className="mb-12">
        <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-3 block">
          Credentials
        </span>
        <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue">
          Certifications
        </h2>
      </div>
 
      <div
        style={S.glassCard}
        className="rounded-3xl p-8 flex flex-wrap gap-4"
      >
        {items.map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl px-5 py-4 hover:border-[#003ec7] hover:shadow-md transition-all group w-fit"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <AcademicCapIcon className="w-4 h-4"/>
            </div>
            <p className="text-sm font-medium text-slate-700 leading-snug">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ data }) {
  const links = [
    { label: "LinkedIn", href: data.socials?.linkedin || "#" },
    { label: "GitHub", href: data.socials?.github || "#" },
    { label: "Twitter", href: data.socials?.twitter || "#" },
    { label: "Email", href: `mailto:${data.email}` },
  ];
  return (
    <footer className="w-full py-12 border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-bold text-slate-900 font-epilogue text-xl">{data.name}</div>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-epilogue">
          <CopyrightIcon className="w-4 h-4 inline-block mr-1" /> {new Date().getFullYear()} {data.name.split(" ")[0]} - all rights reserved.
        </p>
        <div className="flex gap-8">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors font-epilogue"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────
function FAB({ data }) {
  return (
    <a
      href={`mailto:${data.email}`}
      className="fixed bottom-8 right-8 w-16 h-16 bg-[#003ec7] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
    >
      <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
      <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Let's Talk!
      </span>
    </a>
  );
}


// ─── Root Export ──────────────────────────────────────────────────────────────
/**
 * ModernInteractiveTemplate  (formerly PortfolioPreview)
 * @param {{ data: import('./portfolioSchema').samplePortfolioData }} props
 */
export default function ModernInteractiveTemplate({ data }) {
  return (
    <>
      {/*
        Add to your index.html <head>:
        <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      */}
      <div className="bg-[#faf8ff] font-inter text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar data={data} />

        <main className="relative pt-32 pb-20 overflow-hidden">
          {/* Ambient blobs */}
          <div style={{ ...S.floatingBlob, width: 384, height: 384, top: -80, left: -80 }} className="bg-blue-100" />
          <div style={{ ...S.floatingBlob, width: 500, height: 500, top: "50%", right: -160 }} className="bg-purple-100" />
          <div style={{ ...S.floatingBlob, width: 320, height: 320, bottom: 0, left: "25%" }} className="bg-green-100" />

          <HeroSection data={data} />
          <ExperienceSection data={data} />
          <SkillsSection data={data} />
          <ProjectsSection data={data} />
          <EducationSection data={data} />
          <CertificationsSection data={data} />
          <TestimonialsSection data={data} />
          <ContactSection data={data} />
        </main>

        <Footer data={data} />
        <FAB data={data} />
      </div>
    </>
  );
}