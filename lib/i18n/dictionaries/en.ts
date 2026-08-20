import type { Dictionary } from "./zh";

/**
 * English copy dictionary. Must mirror the structure of the Chinese
 * dictionary (its source-of-truth type) exactly — same keys, same nesting.
 */
export const en: Dictionary = {
  htmlLang: "en",
  metadata: {
    role: "Full-Stack Developer",
    description:
      "Portfolio of Alex Chen — full-stack developer focused on high-availability web applications, featuring selected open-source projects and technical skills.",
    ogLocale: "en_US",
  },
  brand: {
    nativeName: null,
  },
  nav: {
    projects: "Projects",
    skills: "Skills",
    about: "About",
    contact: "Contact",
  },
  theme: {
    toggle: "Toggle theme",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  langSwitcher: {
    label: "Switch language",
  },
  hero: {
    available: "Open to opportunities",
    tagline: "Building reliable, high-performance web experiences",
    intro:
      "I'm Alex Chen, a full-stack developer focused on high-availability web applications and polished user experiences.",
    ctaProjects: "View featured projects",
    ctaResume: "Download resume",
    avatarAlt: "Portrait of Alex Chen",
  },
  featured: {
    eyebrow: "Featured Projects",
    title: "Proven depth, shipped results",
    description:
      "Every project starts from a real problem. These three best represent my engineering abilities.",
  },
  skills: {
    eyebrow: "Tech Stack",
    title: "Technical Skills",
    description:
      "A scenario-driven skill matrix — from the interface to the server, and through the delivery pipeline.",
    categories: [
      {
        id: "frontend",
        title: "Frontend",
        hint: "Engineering rigor meets UX",
        skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Motion", "Vite"],
      },
      {
        id: "backend",
        title: "Backend",
        hint: "High concurrency & stability",
        skills: ["Node.js", "Fastify", "PostgreSQL", "Redis", "WebSocket", "GraphQL"],
      },
      {
        id: "devops",
        title: "DevOps & Tooling",
        hint: "Automation & observability",
        skills: ["Docker", "GitHub Actions", "Linux", "Vitest", "OpenTelemetry", "Git"],
      },
    ],
  },
  aboutPreview: {
    eyebrow: "About Me",
    title: "Beyond the code",
    paragraphs: [
      "Six years of full-stack experience, driven by breaking complex problems into elegant modules. I believe good engineering makes the right thing easier to do — whether that's a component library that doubles team velocity or shaving API latency down to milliseconds.",
      "Outside work I maintain two open-source projects and enjoy sharing engineering practices with the community. I'm also a coffee enthusiast — weekends are usually split between pour-over brews and mechanical keyboards.",
    ],
    more: "Learn more",
    avatarAlt: "Portrait of Alex Chen",
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "Let's build something great together.",
    description:
      "If my experience fits your team, don't hesitate to reach out — I usually reply within 24 hours.",
    resume: "Download resume (PDF)",
    email: "Send an email",
  },
  footer: {
    rights: "All rights reserved",
  },
  projectPage: {
    back: "Back to projects",
    github: "Source code",
    demo: "Live demo",
  },
  about: {
    metadataTitle: "About Me",
    location: "Shanghai · Open to remote",
    paragraphs: [
      "Hi! I'm a product-minded full-stack engineer. Rather than settling for \"it works\", I chase \"it works beautifully and reliably\" — I'm fascinated by experiences where the technology becomes invisible: a collaborative canvas that responds in milliseconds, offline editing that never loses data, canary releases that take a single line of config.",
      "I believe an engineer's value shows beyond the code: writing clear documentation, running honest retrospectives, and giving teammates dependable estimates matter just as much as elegant abstractions.",
    ],
    journey: {
      eyebrow: "Journey",
      title: "Experience",
      items: [
        {
          period: "2023 — Present",
          role: "Senior Full-Stack Engineer · SaaS unicorn",
          description:
            "Own the architecture evolution of the core collaboration module. Led a rebuild of the real-time sync layer for 5× QPS capacity and drove adoption of a shared component library across 8 product lines.",
        },
        {
          period: "2020 — 2023",
          role: "Full-Stack Engineer · E-commerce platform",
          description:
            "Key contributor to the monolith-to-microservices migration; designed and shipped the API gateway and canary release system. Delivered three major sale events with zero incidents.",
        },
        {
          period: "2019 — 2020",
          role: "Frontend Engineer · Startup",
          description:
            "Owned the merchant dashboard from 0 to 1 and shipped it in three months — habits formed: small team, fast delivery, high quality.",
        },
      ],
    },
    principles: {
      eyebrow: "How I Work",
      title: "The Way I Work",
      items: [
        {
          title: "Ask why first",
          description:
            "Align on the real problem and how success is measured before writing code — avoid elegantly solving a problem that doesn't exist.",
        },
        {
          title: "Simplicity first",
          description:
            "Never introduce complexity when a simple solution works — complexity is the most expensive debt.",
        },
        {
          title: "Data over opinion",
          description:
            "Every performance or UX decision is backed by numbers, and tracked after release to verify the outcome.",
        },
        {
          title: "Docs as code",
          description:
            "Key designs always come with documentation and retrospectives, so team experience compounds.",
        },
      ],
    },
    offClock: {
      eyebrow: "Off the Clock",
      title: "Beyond the Keyboard",
      description:
        "On weekends you'll most likely find me brewing pour-over coffee, hiking, or reading engineering books. I'm also active in open source — feel free to look around my GitHub.",
      ctaContact: "Get in touch",
      ctaProjects: "View projects",
    },
  },
};
