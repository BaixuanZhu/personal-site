import type { Dictionary } from "./zh";

/**
 * English copy dictionary. Must mirror the structure of the Chinese
 * dictionary (its source-of-truth type) exactly — same keys, same nesting.
 */
export const en: Dictionary = {
  htmlLang: "en",
  metadata: {
    role: "Java Backend Engineer · AI Tooling",
    description:
      "Portfolio of Baixuan Zhu (Galaxy) — a Java backend engineer building open-source developer tools and AI agent skills: DevTools, jvm, Agent Skills and more.",
    ogLocale: "en_US",
  },
  brand: {
    nativeName: "朱柏轩",
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
    tagline: "Building reliable Java backends and delightful dev tools",
    intro:
      "I'm Baixuan Zhu (Galaxy), a Java backend engineer deep in the Spring ecosystem and developer experience. I maintain several open-source projects: DevTools (a 40-tool browser toolbox), jvm (a Windows JDK version manager written in Go), and an Agent Skills suite for Chinese Java teams.",
    ctaBoss: "Hire me on BOSS Zhipin",
    avatarAlt: "Portrait of Baixuan Zhu",
  },
  featured: {
    eyebrow: "Featured Projects",
    title: "Proven depth, shipped results",
    description:
      "Every project starts from a real pain point and keeps shipping. Open a card for the full architecture and implementation breakdown.",
  },
  skills: {
    eyebrow: "Tech Stack",
    title: "Technical Skills",
    description:
      "A scenario-driven skill matrix — backend at the core, flanked by frontend and AI tooling.",
    radar: {
      title: "Ability Radar",
      hint: "Self-assessed proficiency, out of 100",
      axes: [
        { label: "Backend", value: 90 },
        { label: "AI Tooling", value: 82 },
        { label: "Databases", value: 80 },
        { label: "CI/CD", value: 75 },
        { label: "Open Source", value: 72 },
        { label: "Frontend", value: 65 },
      ],
    },
    categories: [
      {
        id: "backend",
        title: "Backend",
        hint: "Core Java ecosystem stack",
        skills: ["Java", "Spring Boot", "Sa-Token", "MyBatis-Plus", "MySQL", "Redis", "Maven"],
      },
      {
        id: "frontend",
        title: "Frontend",
        hint: "Full-stack support & tool sites",
        skills: ["Vue 3", "Astro", "React", "Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        id: "ai",
        title: "AI & Tooling",
        hint: "Weaving AI into the workflow",
        skills: ["Claude Code Plugins", "Agent Skills Design", "Prompt Engineering", "Go", "Python", "GitHub Actions"],
      },
    ],
  },
  aboutPreview: {
    eyebrow: "About Me",
    title: "Turning pain points into tools",
    paragraphs: [
      "A Java backend engineer whose core stack is Spring Boot, Sa-Token and MyBatis-Plus. Beyond \"it works\", I care about standards and maintainability — which is why I keep building tools that turn repetitive work into a single command.",
      "Over the past year I've gone deep on AI-assisted coding: distilling coding standards, quality gates and unit-test practices into 10 installable agent skills, so AI assistants behave professionally on real Java projects. Everything is open source on GitHub.",
    ],
    more: "Learn more",
    avatarAlt: "Portrait of Baixuan Zhu",
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "Let's build something great together.",
    description:
      "If your team needs someone who knows Java backends and can also build AI-era tooling, drop me an email — I usually reply within 24 hours.",
    boss: "Full resume on BOSS Zhipin",
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
    location: "Open to remote",
    paragraphs: [
      "Hi! I'm Baixuan Zhu (Galaxy). My main track is Java backend development — the Spring Boot, Sa-Token and MyBatis-Plus stack that Chinese product teams live on. I care about more than shipping features: the code should survive a visit from me six months later.",
      "The other track is developer tooling and AI engineering. The most valuable things on a team are often the invisible engineering knowledge — why it was designed this way, which pits not to fall into. I turn them into tools and agent skills: jvm tames JDK version management on Windows, DevTools moves 40 everyday tools into the browser, and Agent Skills make AI coding assistants follow engineering standards.",
    ],
    journey: {
      eyebrow: "Journey",
      title: "Open-Source Timeline",
      items: [
        {
          period: "2026.05",
          role: "Claude Code GUI Hooks",
          description:
            "The first open-source tool born from my own pain: replacing terminal permission prompts with native dialogs — zero dependencies, cross-platform, later shipped as a plugin.",
        },
        {
          period: "2026.06",
          role: "DevTools went live",
          description:
            "A browser-based developer toolbox launched at tools.baixuanz.cn — 40 tools across 12 categories, all computed locally, under 50KB of JS per page.",
        },
        {
          period: "2026.08",
          role: "jvm · Agent Skills",
          description:
            "Shipped 11 releases of jvm in ten days (a Go-based Windows JDK manager), plus a 10-skill Agent suite for the Chinese Java ecosystem compatible with 41+ AI coding agents.",
        },
      ],
    },
    principles: {
      eyebrow: "How I Work",
      title: "The Way I Work",
      items: [
        {
          title: "Zero-config first",
          description:
            "Great tools work out of the box: jvm sets up PATH and shell integration on first run — no manual steps, no docs to read.",
        },
        {
          title: "Local & private first",
          description:
            "Data that can stay in the browser should: all 40 DevTools run locally and work offline.",
        },
        {
          title: "Evaluation-driven",
          description:
            "Agent skills aren't judged by feel: every skill ships public, reproducible Darwin-style eval artifacts.",
        },
        {
          title: "Standards as assets",
          description:
            "Coding standards and test practices only pay off when they're executable — so I package them as agent skills instead of documents.",
        },
      ],
    },
    offClock: {
      eyebrow: "Off the Clock",
      title: "Beyond the Keyboard",
      description:
        "Away from the keyboard I'm probably still tweaking my workflow — writing plugins for AI assistants, tuning skill packs, or arming my toolbox. Open source is my best business card; feel free to look around my GitHub.",
      ctaContact: "Get in touch",
      ctaProjects: "View projects",
    },
  },
};
