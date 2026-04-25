import { useState } from "react";

const NAV_LINKS = ["About", "Experience", "Skills", "Projects", "Education"];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ data }) {
  const [active, setActive] = useState("About");
  return (
    <header className="bg-white/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-200/50 shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-xl font-bold tracking-tighter text-slate-900 font-epilogue">
          {data.name}
        </div>
        <nav className="hidden md:flex gap-8 items-center h-full">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link}`}
              onClick={() => setActive(link)}
              className={`font-epilogue text-sm font-medium tracking-tight transition-opacity duration-200 ${
                active === link
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link}
            </a>
          ))}
        </nav>
        <a
          href={`mailto:${data.email}`}
          className="bg-[#003ec7] text-white px-6 py-2 rounded font-epilogue text-sm font-medium active:scale-95 transition-transform"
        >
          Contact
        </a>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ data }) {
  return (
    <section className="relative overflow-hidden bg-[#f2f3ff] py-24 md:py-32 pt-32" id="About">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-4 block">
            Executive Leadership
          </span>
          <h1 className="text-[72px] leading-[80px] tracking-[-0.04em] font-extrabold font-epilogue text-slate-900 mb-6">
            {data.tagline}
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-xl">{data.bio}</p>
          <div className="flex gap-4">
            <a
              href={data.cvUrl}
              className="bg-[#003ec7] text-white px-8 py-3 rounded-lg font-epilogue font-semibold hover:shadow-lg transition-all"
            >
              Download Dossier
            </a>
            <a
              href="#Projects"
              className="border border-slate-400 text-slate-900 px-8 py-3 rounded-lg font-epilogue font-semibold hover:bg-slate-100 transition-all"
            >
              Case Studies
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl border border-slate-100">
            <div className="text-3xl font-bold text-[#003ec7] font-epilogue">
              {data.yearsOfExperience}
            </div>
            <div className="text-xs font-bold tracking-widest uppercase text-slate-500">
              Years of Impact
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────
function Experience({ data }) {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="Experience">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-slate-900 sticky top-24">
            Professional Experience
          </h2>
          <p className="text-slate-500 mt-4">
            A chronological trajectory of leadership roles and transformational milestones.
          </p>
        </div>
        <div className="md:w-2/3 space-y-12">
          {data.experience.map(({ period, role, company, bullets, isCurrent }, i) => (
            <div
              key={role}
              className={`border-l-2 pl-8 relative ${
                isCurrent || i === 0 ? "border-[#b7c4ff]" : "border-[#e2e7ff]"
              }`}
            >
              <div
                className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ${
                  isCurrent || i === 0 ? "bg-[#003ec7]" : "bg-[#e2e7ff]"
                }`}
              />
              <span
                className={`text-xs font-bold tracking-widest uppercase ${
                  isCurrent || i === 0 ? "text-[#003ec7]" : "text-slate-400"
                }`}
              >
                {period}
              </span>
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue text-slate-900 mt-2">
                {role}
              </h3>
              <p className="text-slate-500 font-semibold mb-4">{company}</p>
              {bullets?.length > 0 && (
                <ul className="space-y-3 text-slate-500">
                  {bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span
                        className={`material-symbols-outlined text-sm shrink-0 mt-0.5 ${
                          isCurrent || i === 0 ? "text-[#003ec7]" : "text-slate-400"
                        }`}
                      >
                        check_circle
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills / Competencies ────────────────────────────────────────────────────
function Skills({ data }) {
  return (
    <section className="bg-[#d2d9f4] py-24" id="Skills">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue text-slate-900">
            Core Competencies
          </h2>
          <div className="h-1 w-24 bg-[#003ec7] mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {data.skills.map(({ label, icon, detail }) => (
            <div
              key={label}
              className="bg-white p-8 border border-slate-200 hover:border-[#003ec7] transition-colors"
            >
              <span className="material-symbols-outlined text-[#003ec7] text-3xl mb-4 block">
                {icon}
              </span>
              <h4 className="font-epilogue font-bold text-slate-900 mb-2">{label}</h4>
              <p className="text-sm text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Projects / Publications ──────────────────────────────────────────────────
function Projects({ data }) {
  const [featured, ...rest] = data.projects;
  return (
    <section className="py-24 max-w-7xl mx-auto px-6" id="Projects">
      <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-slate-900 mb-12">
        Thought Leadership &amp; Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large feature */}
        <div className="md:col-span-2 group relative overflow-hidden bg-slate-800 rounded-xl aspect-video md:aspect-auto">
          <img
            src={featured.image}
            alt={featured.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
            <span className="text-xs font-bold tracking-widest uppercase text-[#50ffaf] mb-2">
              CASE STUDY
            </span>
            <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue text-white">
              {featured.title}
            </h3>
            <p className="text-slate-300 mt-2 max-w-lg">{featured.description}</p>
          </div>
        </div>

        {/* Publication cards */}
        <div className="bg-white border border-slate-200 p-8 rounded-xl flex flex-col justify-between hover:shadow-xl transition-shadow">
          <div>
            <span className="material-symbols-outlined text-[#003ec7] mb-4 block">
              menu_book
            </span>
            <h3 className="font-epilogue font-bold text-xl text-slate-900">
              The Agile Executive
            </h3>
            <p className="text-slate-500 mt-2">
              Published in Harvard Business Review, discussing adaptive leadership in volatility.
            </p>
          </div>
          <a
            href="#"
            className="text-[#003ec7] font-bold mt-6 inline-flex items-center gap-2 group"
          >
            Read Paper{" "}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="bg-[#003ec7] p-8 rounded-xl flex flex-col justify-between text-white">
          <div>
            <span className="material-symbols-outlined mb-4 block">stars</span>
            <h3 className="font-epilogue font-bold text-xl">Governance Redefined</h3>
            <p className="text-blue-200 mt-2">
              A framework for ESG compliance in modern manufacturing.
            </p>
          </div>
          <a
            href="#"
            className="font-bold mt-6 inline-flex items-center gap-2 group"
          >
            View Details{" "}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

        {rest[0] && (
          <div className="md:col-span-2 bg-[#f2f3ff] border border-slate-200 p-8 rounded-xl flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2">
              <img
                src={rest[0].image}
                alt={rest[0].title}
                className="rounded-lg shadow-md w-full object-cover"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue text-slate-900">
                {rest[0].title}
              </h3>
              <p className="text-slate-500 mt-4">{rest[0].description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Education & Certifications ───────────────────────────────────────────────
function EducationCerts({ data }) {
  return (
    <section className="py-24 bg-white border-y border-slate-200" id="Education">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Education */}
          <div>
            <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-slate-900 mb-8">
              Academic Foundation
            </h2>
            <div className="space-y-8">
              {data.education.map(({ year, degree, institution, detail }) => (
                <div key={degree} className="flex gap-6">
                  <div className="text-slate-400 text-xs font-bold tracking-widest uppercase pt-1 shrink-0">
                    {year}
                  </div>
                  <div>
                    <h4 className="font-epilogue font-bold text-lg text-slate-900">{degree}</h4>
                    <p className="text-slate-500">{institution}</p>
                    {detail && (
                      <p className="text-sm text-slate-400 mt-1 italic">{detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <h2 className="text-[30px] leading-[38px] font-semibold font-epilogue text-slate-900 mb-8">
              Professional Certifications
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.certificationsList.map(({ icon, label }) => (
                <div
                  key={label}
                  className="bg-[#faf8ff] p-4 border border-slate-100 rounded-lg flex items-center gap-4"
                >
                  <span className="material-symbols-outlined text-[#003ec7]">{icon}</span>
                  <span className="font-medium text-slate-900">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA({ data }) {
  return (
    <section className="py-24 max-w-4xl mx-auto px-6 text-center">
      <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue text-slate-900 mb-6">
        {data.cta.heading}
      </h2>
      <p className="text-lg text-slate-500 mb-10">{data.cta.subtext}</p>
      <div className="inline-flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <a
          href={`mailto:${data.email}`}
          className="bg-[#003ec7] text-white px-12 py-4 rounded-lg font-epilogue font-bold hover:shadow-xl transition-all inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">mail</span>
          Initiate Discussion
        </a>
        <a
          href="#"
          className="border border-slate-400 text-slate-900 px-12 py-4 rounded-lg font-epilogue font-bold hover:bg-slate-50 transition-all inline-flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">calendar_today</span>
          Schedule Briefing
        </a>
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
    <footer className="bg-slate-50 w-full py-12 border-t mt-20 border-slate-200">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-epilogue font-bold text-slate-900">{data.name}</div>
        <div className="flex gap-8">
          {links.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="font-epilogue text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
        <div className="font-epilogue text-xs uppercase tracking-widest text-slate-500">
          © 2024 Portfolio Generator. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
/**
 * CorporateExecutiveTemplate
 * @param {{ data: import('./portfolioSchema').samplePortfolioData }} props
 */
export default function CorporateExecutiveTemplate({ data }) {
  return (
    <div className="bg-[#faf8ff] text-slate-900 font-inter scroll-smooth">
      <Navbar data={data} />
      <main className="pt-16">
        <Hero data={data} />
        <Experience data={data} />
        <Skills data={data} />
        <Projects data={data} />
        <EducationCerts data={data} />
        <CTA data={data} />
      </main>
      <Footer data={data} />
    </div>
  );
}