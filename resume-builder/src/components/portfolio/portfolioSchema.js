/**
 * portfolioSchema.js
 * ─────────────────────────────────────────────
 * Single JSON shape shared by ALL three portfolio templates.
 * Pass this object as the `data` prop to any template component.
 */

export const samplePortfolioData = {
  // ── Identity ─────────────────────────────────
  name: "Alex Rivera",
  title: "Senior Product Designer & Engineer",
  tagline: "Crafting digital experiences with precision & soul.",
  bio: "A senior multi-disciplinary designer and developer focused on high-fidelity visual systems and performant user interfaces. Turning complex problems into elegant, gallery-grade solutions.",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaXYZM5FvX93HVIa-gnWtcU66F0TUkn4isLXUIHcPv7Bp1XX-CtFd-yTC9eTeTuCBqCSUBJDXDbdeHBtf8IplhmKfdZxBIpzAFKa7rqX-fVyfH-EhjFyfAH62nP5LpaNVHl4NdKEF34dVgTdOnDD17SXz77WQMbjy2V0dOLwNZoU8rZyWA-cw8i2IdyuNGHB1x7oFEKgZCmMyU5O5NA1iV3I8P04DPEVnpwC_PFPyZHWlQaHLc3MS44GC7bn1IQzqJlr_Xvb6L8CC7",
  availabilityBadge: "Available for new opportunities",
  yearsOfExperience: "8+",

  // ── Current Status ────────────────────────────
  currentRole: "Lead Designer",
  currentCompany: "Linear Flow",
  location: "Remote / London",
  email: "hello@curatedportfolio.com",
  cvUrl: "#",

  // ── Social Links ──────────────────────────────
  socials: {
    linkedin: "#",
    github: "#",
    twitter: "#",
    dribbble: "#",
    instagram: "#",
  },

  // ── Metrics (used by creative-developer) ─────
  metrics: [
    { value: "42+", label: "Projects Completed", color: "blue" },
    { value: "15k", label: "GitHub Commits", color: "green" },
    { value: "12", label: "Awards Won", color: "purple" },
    { value: "99%", label: "Uptime Average", color: "white" },
  ],

  // ── Experience ────────────────────────────────
  experience: [
    {
      period: "2021 — Present",
      role: "Senior Product Designer",
      company: "Creative Digital Agency",
      description:
        "Leading the design direction for Fortune 500 clients, specializing in design systems, accessibility audits, and motion-heavy interactive platforms.",
      bullets: [
        "Orchestrated a $50M operational turnaround resulting in 22% EBITDA growth.",
        "Led cross-functional teams across 4 continents to deliver enterprise-scale ERP solutions.",
      ],
      isCurrent: true,
    },
    {
      period: "2018 — 2021",
      role: "UX Design Lead",
      company: "TechStart Inc.",
      description:
        "Architected the checkout experience for enterprise-level clients. Focused on reducing cognitive load during high-stakes financial transactions.",
      bullets: [
        "Developed market entry strategies for three separate SaaS platforms entering EMEA markets.",
        "Managed a portfolio of $120M in client assets with a 98% retention rate.",
      ],
      isCurrent: false,
    },
    {
      period: "2016 — 2018",
      role: "Visual Designer",
      company: "Airbnb",
      description:
        "Contributed to the 'Experiences' vertical, crafting immersive visual narratives for global travelers.",
      bullets: [],
      isCurrent: false,
    },
  ],

  // ── Skills ────────────────────────────────────
  skills: [
    { label: "React & Next.js", icon: "code", detail: "Expert in SSR, State Management, and Component Architecture.", color: "blue" },
    { label: "Tailwind CSS", icon: "palette", detail: "Building rapid, accessible, and responsive design systems.", color: "green" },
    { label: "Figma", icon: "architecture", detail: "Auto-layout, advanced prototyping, and team libraries.", color: "orange" },
    { label: "Node.js", icon: "terminal", detail: "Scalable backend services and API integration.", color: "purple" },
    { label: "Motion Design", icon: "motion_photos_on", detail: "Lottie, Framer Motion, and CSS keyframe animations.", color: "yellow" },
    { label: "Strategy", icon: "analytics", detail: "A/B Testing, User Research, and OKR frameworks.", color: "red" },
  ],

  // Languages / Certifications (creative-developer sidebar)
  languages: ["TypeScript", "Rust", "Python", "Go"],
  certifications: ["AWS Solutions Architect", "Google Cloud Prof.", "Meta Front-End Spec."],
  coreCompetencies: ["React/Next.js Architecture", "Distributed Systems", "Web3 Integrations", "AI Prompt Engineering"],

  // ── Projects ─────────────────────────────────
  projects: [
    {
      title: "Aether Wallet",
      category: "Fintech",
      type: "Web App",
      description: "Next-gen asset management with real-time analytics.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA3dpAdKZPmtJj7ppJzF57wDC_WpPzl_b5gAQsH5Z6J2GyTM-LILgQlIj_uh6rDJ9Tci_I3aYb3BnfYCFtiejTFEw-q3JHovuhDSZN4DzDMU0pxeC-WBILD8ajO7TzLapR3GCeQROfziWuFQXQPv38TI1Rgl9W3rP5XVOE1PoYymrL4uLrfDoIOT5TLo99lv7-hOupI0cdEI-kL2C-MCIynktyahJq-Owkw_lTkIzXFySpjtoD8Ksp5hR4aflzT8XDqIUsY3N4Rp93W",
      tags: ["REACT", "WEBGL"],
      link: "#",
      isFeatured: true,
    },
    {
      title: "Lumina Shop",
      category: "Lifestyle",
      type: "Mobile Design",
      description: "Minimalist shopping experience for artisan goods.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMfIO_PVHIahrL7BUfDRvA6HkghHW_0ZQhGNEqB5ucBGu7UQyEFc9HT9zn1ytCimqAeA9kWt2NrfRlhKc17mH6b5iIsF-l5L7Piq2aFBMA31KdTNTWV6TeG4rJHObXz7y3J-sj1QtjNH7E6q6lBWaD0ag61HUlTHj7MSVdfRd0JoHGHM6aljLb3p71BeVhNCx5nDYp4yoJeB83cu1XboihOEDzG_w5eBwL308NVqCxnykSAZ9rxrhwG5uMdFwySLK_TKCwv8aFdjhQ",
      tags: ["NODE.JS", "THREE.JS"],
      link: "#",
      isFeatured: false,
    },
    {
      title: "Sentinel Threat Detector",
      category: "Security",
      type: "AI Tool",
      description: "AI-powered network traffic analyzer that detects anomalies and potential security breaches in real-time.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0UmWbKXod7ng8QgELPC4yQEmGH5074gyYq8vNKuT9CUzN9XALZRAQtos6I3mV_QGCrtWVcfWa_mcdCiZqRGPkJ-BgyfklnF7NoFijCAB9WdUouWg57TfmZ4L0VvEmrqL67AZiYrAv-zGccQnZ5URT8AuId3vg87HdEwkN6szYRN0XGM8-K5z3diclyrW8bmXATyIVbVoL3tXJ_jjAf0Y4_Z_KYLs5slO7Pz-EOVT8Yj9ACC4W6GPxo6wtECG-sQT1lljFzGfkUXQs",
      tags: ["PYTHON", "AI"],
      link: "#",
      isFeatured: false,
    },
  ],

  // ── Education ─────────────────────────────────
  education: [
    {
      year: "2016",
      degree: "MSc Computer Science",
      institution: "Stanford University",
      detail: "Specialization in AI & ML",
    },
    {
      year: "2012",
      degree: "BSc Software Engineering",
      institution: "MIT",
      detail: "Dean's List 2016–2018",
    },
  ],

  certificationsList: [
    { icon: "verified_user", label: "PMP® Certified" },
    { icon: "analytics", label: "Six Sigma Black Belt" },
    { icon: "security", label: "CISM Governance" },
    { icon: "school", label: "MIT AI Strategy" },
  ],

  // ── Testimonials (minimalist-pro) ─────────────
  testimonials: [
    {
      quote: "Their ability to translate complex technical requirements into a beautiful, intuitive interface was exactly what our team needed.",
      name: "Sarah Jenkins",
      title: "CTO, Velocity AI",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhGVkzWLj0XTLx4NBtoW-HZarfGCybicbGNowWltejRe6PUmGPgSzFcb0Ypcz2K3NyJBATtV0SDK757UrDjuHxw6MwQu9CvWhcKMV_wBgMqjFSBm6Yg2BRbRqmkuM7qQ4OPnQlhA6eSTAwIzcXkLrdEUWyBfDva7L0ZR6aFqFYGg28W0bBPUnY-cjEPK4GeEOzSonOc3eRc-zzxftloVD4X_B3la5UKNPNfCVsf4ebIm_zZGQk0CA_xUXWtAaVQf3Co6XjdqsbjCY4",
    },
    {
      quote: "The most meticulous designer I've worked with. No pixel was left unexamined, resulting in a flawless product launch.",
      name: "Marcus Thorne",
      title: "VP Design, Lumen",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAubOna_8Ke48csz1f16A_EFATq-QYYTtCkM1xfcQtVZzd4FcWRBh3NEcI46fLQONWexAziluAJLusyrdN0qjqKKsIjUdNO-kXMH0I-2SPOEgi_5w21Am8tEiS5Hh_gnX_3HoONVSS8txichTLUEY-0vmEBsWjaZNy53V_RJBTv6n10vP3Db0c8hExUnHwDlqjDdbuvQtbLLd11llfcCAb6IM-77D-VhTqQm-p5tBt49xOnQcfVRIAbnTuc3CYl99kGGdjr1FYnn_Ee",
    },
    {
      quote: "A rare talent that understands both the 'why' of design and the 'how' of code. A massive asset to any engineering culture.",
      name: "David Chen",
      title: "Founder, NextSpace",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCq-NOWh06QguKQ9nTA5LF7UcayD58MdiLk4fE688iFei-ix_qTwzLucuej8KynQktqoNikG54u4ZnVq41ufSPK2sqwA3rBPDQF6FSWwky1JJpuFjnlRN_scKcTkVGxjlzT-KX9kDrmm9m4JEa2huO9crKF5_9i32aYL6Gdl49PQnhZF-K5yXoaq3GlREAbwZFC2veI1eCxbeXm2MkoFX50r_htesbMtxGuwfqOn1826VuabJ99qx7lOR0JEomBt8FVp6UUjD31MHQl",
    },
  ],

  // ── CTA ───────────────────────────────────────
  cta: {
    heading: "Have a project in mind?",
    subtext: "I'm currently accepting new projects and collaborations. Let's build something remarkable together.",
    primaryLabel: "Start a Conversation",
    secondaryLabel: "View Resume",
  },
};