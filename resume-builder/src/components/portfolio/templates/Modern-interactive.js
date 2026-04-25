import { useState } from "react";

// ─── Inline styles for glass + blobs (can't use arbitrary Tailwind in plain CRA) ───
const styles = {
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  const navLinks = ["about", "experience", "skills", "projects", "education"];
  const [active, setActive] = useState("about");

  return (
    <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md shadow-sm">
      <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-16">
        <div className="text-xl font-bold tracking-tighter text-slate-900 font-epilogue">
          CuratedPortfolio
        </div>
        <div className="hidden md:flex items-center gap-8 font-epilogue text-sm font-medium tracking-tight">
          {navLinks.map((link) => (
            <a
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
        <button className="bg-[#003ec7] text-white px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase hover:opacity-90 active:scale-95 transition-all shadow-lg">
          Contact
        </button>
      </nav>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="about">
      <div className="flex flex-col lg:flex-row items-center gap-16">
        {/* Left copy */}
        <div className="lg:w-3/5 space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-100/60 text-blue-800 px-4 py-1.5 rounded-full border border-blue-200 text-xs font-bold tracking-widest uppercase">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            Available for new opportunities
          </div>
          <h1 className="text-[72px] leading-[80px] tracking-[-0.04em] font-extrabold text-slate-900 font-epilogue">
            Crafting{" "}
            <span style={styles.textGradient}>Digital Experiences</span> with
            Precision &amp; Soul.
          </h1>
          <p className="text-lg leading-7 text-slate-500 max-w-2xl">
            A senior multi-disciplinary designer and developer focused on
            high-fidelity visual systems and performant user interfaces. Turning
            complex problems into elegant, gallery-grade solutions.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-[#003ec7] text-white px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:-translate-y-0.5 transition-transform shadow-xl">
              <span className="material-symbols-outlined">download</span>
              Download CV
            </button>
            <button className="bg-white text-slate-800 border border-slate-300 px-8 py-4 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-slate-50 transition-colors">
              View Portfolio
            </button>
          </div>
        </div>

        {/* Right avatar */}
        <div className="lg:w-2/5 relative">
          <div
            style={styles.glassCard}
            className="aspect-square rounded-3xl overflow-hidden p-4 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl"
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaXYZM5FvX93HVIa-gnWtcU66F0TUkn4isLXUIHcPv7Bp1XX-CtFd-yTC9eTeTuCBqCSUBJDXDbdeHBtf8IplhmKfdZxBIpzAFKa7rqX-fVyfH-EhjFyfAH62nP5LpaNVHl4NdKEF34dVgTdOnDD17SXz77WQMbjy2V0dOLwNZoU8rZyWA-cw8i2IdyuNGHB1x7oFEKgZCmMyU5O5NA1iV3I8P04DPEVnpwC_PFPyZHWlQaHLc3MS44GC7bn1IQzqJlr_Xvb6L8CC7"
              alt="Professional portrait"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {/* Floating badge */}
          <div
            style={styles.glassCard}
            className="absolute -bottom-6 -left-10 p-4 rounded-2xl flex items-center gap-4 animate-bounce"
          >
            <div className="w-12 h-12 bg-[#00754a] rounded-full flex items-center justify-center text-[#69ffb5]">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-slate-800">
                120+ Projects
              </p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Delivered
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="experience">
      <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue mb-12 flex items-center gap-4">
        Experience
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large card */}
        <div
          style={styles.glassCard}
          className="md:col-span-2 p-8 rounded-3xl flex flex-col justify-between min-h-[320px]"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-[#003ec7] mb-2 block">
                Current Role
              </span>
              <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue">
                Senior Product Designer
              </h3>
              <p className="text-slate-500">
                Creative Digital Agency • 2021 — Present
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-[#0052ff]">
              work
            </span>
          </div>
          <p className="text-slate-500 mt-6">
            Leading the design direction for Fortune 500 clients, specializing
            in design systems, accessibility audits, and motion-heavy interactive
            platforms.
          </p>
        </div>

        {/* Purple card */}
        <div className="bg-[#7000ff] text-white p-8 rounded-3xl flex flex-col justify-between shadow-xl">
          <span className="material-symbols-outlined text-4xl">history</span>
          <div>
            <h3 className="text-[30px] leading-[38px] font-semibold font-epilogue">
              UX Lead
            </h3>
            <p className="opacity-80">TechStart Inc • 2018 — 2021</p>
          </div>
        </div>

        {/* Dashed card */}
        <div
          style={styles.glassCard}
          className="p-8 rounded-3xl border-dashed border-2 border-slate-300 flex items-center justify-center text-center cursor-pointer hover:border-[#003ec7] transition-colors"
        >
          <div>
            <span className="material-symbols-outlined text-4xl text-slate-400 mb-4 block">
              add_circle
            </span>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              View Earlier History
            </p>
          </div>
        </div>

        {/* Years card */}
        <div
          style={styles.glassCard}
          className="md:col-span-2 p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="w-full md:w-1/3 bg-slate-100 rounded-2xl p-6 text-center">
            <p className="text-[72px] leading-[80px] font-extrabold text-[#003ec7] font-epilogue">
              8+
            </p>
            <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
              Years of Craft
            </p>
          </div>
          <p className="w-full md:w-2/3 text-slate-500">
            Collaborated with global teams to launch products used by millions,
            maintaining a focus on pixel-perfect execution and strategic business
            goals.
          </p>
        </div>
      </div>
    </section>
  );
}

const skillsList = [
  { label: "React & Next.js", color: "bg-blue-500", tip: "Expert in SSR, State Management, and Component Architecture." },
  { label: "Tailwind CSS", color: "bg-green-500", tip: "Building rapid, accessible, and responsive design systems." },
  { label: "Figma Masters", color: "bg-orange-500", tip: "Auto-layout, advanced prototyping, and team libraries." },
  { label: "Node.js", color: "bg-purple-500", tip: "Scalable backend services and API integration." },
  { label: "Motion Design", color: "bg-yellow-500", tip: "Lottie, Framer Motion, and CSS keyframe animations." },
];

function SkillsSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-32" id="skills">
      <div
        style={styles.glassCard}
        className="rounded-[40px] p-12 overflow-hidden relative"
      >
        <div className="relative z-10">
          <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] text-slate-900 font-epilogue mb-8">
            Technical Stack
          </h2>
          <div className="flex flex-wrap gap-4">
            {skillsList.map(({ label, color, tip }) => (
              <div
                key={label}
                className="group relative bg-white border border-slate-200 px-6 py-3 rounded-full flex items-center gap-3 cursor-help hover:border-[#003ec7] transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs font-bold tracking-widest uppercase text-slate-800">
                  {label}
                </span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {tip}
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

const projects = [
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3dpAdKZPmtJj7ppJzF57wDC_WpPzl_b5gAQsH5Z6J2GyTM-LILgQlIj_uh6rDJ9Tci_I3aYb3BnfYCFtiejTFEw-q3JHovuhDSZN4DzDMU0pxeC-WBILD8ajO7TzLapR3GCeQROfziWuFQXQPv38TI1Rgl9W3rP5XVOE1PoYymrL4uLrfDoIOT5TLo99lv7-hOupI0cdEI-kL2C-MCIynktyahJq-Owkw_lTkIzXFySpjtoD8Ksp5hR4aflzT8XDqIUsY3N4Rp93W",
    alt: "Fintech dashboard project",
    tags: ["Fintech", "Web App"],
    title: "Aether Wallet",
    desc: "Next-gen asset management with real-time analytics.",
    hoverColor: "bg-[#003ec7]/20",
    titleHover: "hover:text-[#003ec7]",
  },
  {
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMfIO_PVHIahrL7BUfDRvA6HkghHW_0ZQhGNEqB5ucBGu7UQyEFc9HT9zn1ytCimqAeA9kWt2NrfRlhKc17mH6b5iIsF-l5L7Piq2aFBMA31KdTNTWV6TeG4rJHObXz7y3J-sj1QtjNH7E6q6lBWaD0ag61HUlTHj7MSVdfRd0JoHGHM6aljLb3p71BeVhNCx5nDYp4yoJeB83cu1XboihOEDzG_w5eBwL308NVqCxnykSAZ9rxrhwG5uMdFwySLK_TKCwv8aFdjhQ",
    alt: "E-commerce branding",
    tags: ["Lifestyle", "Mobile Design"],
    title: "Lumina Shop",
    desc: "Minimalist shopping experience for artisan goods.",
    hoverColor: "bg-[#5400c3]/20",
    titleHover: "hover:text-[#5400c3]",
  },
];

function ProjectsSection() {
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
          {["arrow_back", "arrow_forward"].map((icon) => (
            <button
              key={icon}
              className="p-3 border border-slate-200 rounded-full hover:bg-[#003ec7] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">{icon}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {projects.map(({ src, alt, tags, title, desc, hoverColor, titleHover }) => (
          <div key={title} className="group cursor-pointer">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[32px] mb-6 shadow-2xl">
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div
                className={`absolute inset-0 ${hoverColor} opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm`}
              >
                <div className="bg-white p-4 rounded-full">
                  <span className="material-symbols-outlined text-3xl text-[#003ec7]">
                    visibility
                  </span>
                </div>
              </div>
            </div>
            <div className="px-2">
              <div className="flex gap-3 mb-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold tracking-widest uppercase bg-slate-100 px-3 py-1 rounded-full text-slate-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3
                className={`text-[30px] leading-[38px] font-semibold font-epilogue mb-2 ${titleHover} transition-colors`}
              >
                {title}
              </h3>
              <p className="text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const socialLinks = ["Dribbble", "LinkedIn", "Instagram"];

  return (
    <section className="max-w-7xl mx-auto px-6 mb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Social links */}
        <div
          style={styles.glassCard}
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
            {socialLinks.map((name) => (
              <a
                key={name}
                href="#"
                className="flex items-center justify-between p-4 bg-white rounded-2xl hover:bg-blue-50 transition-colors border border-slate-200 group"
              >
                <span className="text-xs font-bold tracking-widest uppercase text-slate-800">
                  {name}
                </span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  north_east
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* CTA dark card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-slate-900 text-white rounded-[32px] p-12">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="max-w-md">
              <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-epilogue mb-6">
                Have a project in mind?
              </h2>
              <p className="text-lg text-slate-400 mb-12">
                I'm currently accepting new freelance projects and full-time
                opportunities starting Q3 2024.
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <button className="bg-[#003ec7] text-white px-10 py-5 rounded-2xl text-xs font-bold tracking-widest uppercase shadow-2xl hover:scale-105 transition-transform active:scale-95">
                Start a Conversation
              </button>
              <div className="flex items-center gap-4 text-slate-400">
                <div className="w-12 h-12 rounded-full border border-slate-600 flex items-center justify-center">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase">
                    Email Me
                  </p>
                  <p className="text-white">hello@curatedportfolio.com</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative blobs */}
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

function Footer() {
  const links = ["LinkedIn", "GitHub", "Twitter", "Email"];
  return (
    <footer className="w-full py-12 border-t border-slate-200 bg-slate-50">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-bold text-slate-900 font-epilogue text-xl">
          CuratedPortfolio
        </div>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-epilogue">
          © 2024 Portfolio Generator. All rights reserved.
        </p>
        <div className="flex gap-8">
          {links.map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors font-epilogue"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FAB() {
  return (
    <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#003ec7] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
      <span className="material-symbols-outlined text-3xl">chat_bubble</span>
      <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Let's Talk!
      </span>
    </button>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function ModernInteractivePortfolio() {
  return (
    <>
      {/* Google Fonts — add to your index.html <head> if not already present */}
      {/* 
        <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      */}

      <div className="bg-[#faf8ff] font-inter text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <Navbar />

        <main className="relative pt-32 pb-20 overflow-hidden">
          {/* Ambient blobs */}
          <div
            style={{ ...styles.floatingBlob, width: 384, height: 384, top: -80, left: -80 }}
            className="bg-blue-100"
          />
          <div
            style={{ ...styles.floatingBlob, width: 500, height: 500, top: "50%", right: -160 }}
            className="bg-purple-100"
          />
          <div
            style={{ ...styles.floatingBlob, width: 320, height: 320, bottom: 0, left: "25%" }}
            className="bg-green-100"
          />

          <HeroSection />
          <ExperienceSection />
          <SkillsSection />
          <ProjectsSection />
          <ContactSection />
        </main>

        <Footer />
        <FAB />
      </div>
    </>
  );
}