import { useState } from "react";

const NAV_LINKS = ["about", "experience", "skills", "projects", "education"];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ data }) {
  const [active, setActive] = useState("about");
  return (
    <header className="fixed top-0 w-full z-50 border-b bg-white/80 backdrop-blur-md border-slate-200/50 shadow-sm">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-xl font-bold tracking-tighter text-slate-900 font-epilogue">
          {data.name}
        </div>
        <div className="hidden md:flex items-center gap-8 font-epilogue text-sm font-medium tracking-tight">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href={`#${link}`}
              onClick={() => setActive(link)}
              className={`transition-opacity duration-200 capitalize ${
                active === link
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {link}
            </a>
          ))}
        </div>
        <a
          href={`mailto:${data.email}`}
          className="bg-[#003ec7] text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all"
        >
          Contact
        </a>
      </nav>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ data }) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32 pt-32" id="about">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7">
          <h1 className="text-[72px] leading-[80px] tracking-[-0.04em] font-extrabold text-slate-900 font-epilogue mb-8">
            Crafting digital{" "}
            <span className="text-[#003ec7]">experiences</span> with surgical
            precision.
          </h1>
          <p className="text-lg leading-7 text-slate-500 max-w-2xl">{data.bio}</p>
          <div className="mt-12 flex flex-wrap gap-10">
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-1">
                CURRENTLY
              </span>
              <span className="font-semibold text-slate-900">
                {data.currentRole} at {data.currentCompany}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-1">
                LOCATION
              </span>
              <span className="font-semibold text-slate-900">{data.location}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl border border-slate-100 hidden md:block">
            <span className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] block text-[#003ec7] font-epilogue">
              {data.yearsOfExperience}
            </span>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500">
              YEARS OF EXPERTISE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Experience Timeline ──────────────────────────────────────────────────────
function Experience({ data }) {
  return (
    <section className="bg-[#f2f3ff] py-32" id="experience">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#003ec7]">
            PATHWAY
          </span>
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue mt-4">
            Professional Experience
          </h2>
        </div>

        {/* Timeline */}
        <div className="relative space-y-16 pl-8 ml-4 border-l-2 border-slate-300">
          {data.experience.map(({ period, role, company, description, isCurrent }, i) => (
            <div key={role} className="relative group">
              <div
                className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full border-4 border-white transition-colors ${
                  isCurrent || i === 0
                    ? "bg-[#003ec7]"
                    : "bg-slate-300 group-hover:bg-[#003ec7]"
                }`}
              />
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                <span
                  className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full w-fit ${
                    isCurrent || i === 0
                      ? "bg-blue-100 text-[#003ec7]"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {period}
                </span>
                <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue">
                  {role}
                </h3>
                <span className="text-slate-500 text-lg">— {company}</span>
              </div>
              <p className="text-slate-500 max-w-3xl leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────
function Skills({ data }) {
  return (
    <section className="py-32 max-w-7xl mx-auto px-6" id="skills">
      <div className="flex flex-col lg:flex-row gap-16 items-start">
        <div className="lg:w-1/3">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#003ec7]">
            CAPABILITIES
          </span>
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue mt-4 mb-6">
            Technical Arsenal
          </h2>
          <p className="text-slate-500 leading-relaxed">
            A unique intersection of high-end aesthetics and functional
            engineering. I don't just design interfaces; I build them.
          </p>
        </div>
        <div className="lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.skills.map(({ label, icon, detail }) => (
            <div
              key={label}
              className="p-6 bg-white border border-slate-100 rounded-xl hover:shadow-lg transition-shadow"
            >
              <span className="material-symbols-outlined text-[#003ec7] text-3xl mb-4 block">
                {icon}
              </span>
              <h4 className="text-[30px] leading-[38px] font-semibold font-epilogue text-lg mb-2">
                {label}
              </h4>
              <p className="text-sm text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Projects Bento ───────────────────────────────────────────────────────────
function Projects({ data }) {
  return (
    <section className="py-32 bg-slate-900 text-white" id="projects">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20 text-center">
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#50ffaf]">
            SELECTED WORKS
          </span>
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue mt-4">
            Case Studies
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Large feature */}
          <div className="md:col-span-8 group relative overflow-hidden rounded-2xl aspect-[16/10]">
            <img
              src={data.projects[0]?.image}
              alt={data.projects[0]?.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
              <span className="text-xs font-bold tracking-widest uppercase text-[#50ffaf] mb-4">
                {data.projects[0]?.category}
              </span>
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue mb-4">
                {data.projects[0]?.title}
              </h3>
              <p className="text-slate-300 max-w-xl">{data.projects[0]?.description}</p>
            </div>
          </div>

          {/* Side cards */}
          {data.projects.slice(1, 3).map((p) => (
            <div
              key={p.title}
              className="md:col-span-4 group relative overflow-hidden rounded-2xl"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <span className="text-xs font-bold tracking-widest uppercase text-[#50ffaf] mb-4">
                  {p.type}
                </span>
                <h3 className="text-2xl font-semibold font-epilogue">{p.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials({ data }) {
  if (!data.testimonials?.length) return null;
  return (
    <section className="py-32 max-w-7xl mx-auto px-6">
      <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#003ec7] mb-4 block text-center">
        VOICES
      </span>
      <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue text-center mb-20">
        Industry Perspectives
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {data.testimonials.map(({ quote, name, title, avatar }) => (
          <div key={name} className="flex flex-col">
            <span
              className="material-symbols-outlined text-[#0052ff] text-4xl mb-6"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              format_quote
            </span>
            <p className="text-lg italic mb-8 leading-relaxed text-slate-700">"{quote}"</p>
            <div className="flex items-center gap-4">
              <img
                src={avatar}
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold font-epilogue text-base leading-none mb-1">
                  {name}
                </p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
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
    <section className="mb-32 px-6">
      <div className="max-w-7xl mx-auto bg-[#003ec7] rounded-[2rem] p-16 md:p-24 text-center text-white">
        <h2 className="text-[48px] leading-[56px] md:text-6xl font-extrabold font-epilogue mb-8">
          {data.cta.heading}
        </h2>
        <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-12">
          {data.cta.subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href={`mailto:${data.email}`}
            className="bg-white text-[#003ec7] px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-slate-100 transition-colors"
          >
            {data.cta.primaryLabel.toUpperCase()}
          </a>
          <a
            href={data.cvUrl}
            className="border border-white/30 text-white px-10 py-5 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
          >
            {data.cta.secondaryLabel.toUpperCase()}
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
    <footer className="w-full py-12 border-t mt-20 bg-slate-50 border-slate-200">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-epilogue font-bold text-slate-900">{data.name}</div>
        <p className="font-epilogue text-xs uppercase tracking-widest text-slate-500">
          © 2024 Portfolio Generator. All rights reserved.
        </p>
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
      </div>
    </footer>
  );
}

// ─── Root Export ──────────────────────────────────────────────────────────────
/**
 * MinimalistProTemplate
 * @param {{ data: import('./portfolioSchema').samplePortfolioData }} props
 */
export default function MinimalistProTemplate({ data }) {
  return (
    <div className="bg-[#faf8ff] text-slate-900" style={{ WebkitFontSmoothing: "antialiased" }}>
      <Navbar data={data} />
      <main>
        <Hero data={data} />
        <Experience data={data} />
        <Skills data={data} />
        <Projects data={data} />
        <Testimonials data={data} />
        <CTA data={data} />
      </main>
      <Footer data={data} />
    </div>
  );
}