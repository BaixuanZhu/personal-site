import type { Dictionary } from "./zh";

/**
 * English copy dictionary. Must mirror the structure of the Chinese
 * dictionary (its source-of-truth type) exactly — same keys, same nesting.
 */
export const en: Dictionary = {
  htmlLang: "en",
  a11y: {
    skipToContent: "Skip to content",
  },
  metadata: {
    role: "Java Backend Engineer · AI Tooling",
    description:
      "Portfolio of Baixuan Zhu (Galaxy) — a Java backend engineer building open-source developer tools, MCP servers and AI agent skills: DevTools, jvm, civitai-cli, Danbooru Tag MCP, Agent Skills and more.",
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
  /** Mobile navigation drawer copy */
  mobileNav: {
    open: "Open menu",
    close: "Close menu",
    label: "Navigation menu",
  },
  hero: {
    available: "Open to opportunities",
    tagline: "Building reliable Java backends and delightful dev tools",
    intro:
      "I'm Baixuan Zhu (Galaxy), a Java backend engineer deep in the Spring ecosystem and developer experience. I maintain several open-source projects: DevTools (a 55-tool browser toolbox), jvm (a Windows JDK version manager written in Go), civitai-cli (Civitai model discovery and vetting for AI art workflows), Danbooru Tag MCP (tag retrieval for AI art prompts), and an Agent Skills suite for Chinese Java teams.",
    ctaEmail: "Email me",
  },
  featured: {
    eyebrow: "Featured Projects",
    title: "Proven depth, shipped results",
    description:
      "Every project starts from a real pain point and keeps shipping. Open a card for the full architecture and implementation breakdown.",
    /** Entry point to the projects index */
    viewAll: "View all projects",
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
        { label: "Backend", value: 90, description: "Core Spring stack, shipped in production" },
        { label: "AI Tooling", value: 82, description: "10 agent skills plus Claude Code plugins" },
        { label: "Databases", value: 80, description: "MySQL tuning and Redis caching design" },
        { label: "CI/CD", value: 75, description: "GitHub Actions pipelines with quality gates" },
        { label: "Open Source", value: 72, description: "6 active repos, continuous releases" },
        { label: "Frontend", value: 65, description: "Full-stack support for tool sites" },
      ],
    },
    categories: [
      {
        id: "backend",
        title: "Backend",
        hint: "Core Java ecosystem stack",
        skills: ["Java", "Spring Boot", "Sa-Token", "MyBatis-Plus", "MySQL", "Redis", "RabbitMQ", "Maven"],
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
        skills: ["Claude Code Plugins", "Agent Skills Design", "MCP", "Prompt Engineering", "Go", "Python", "GitHub Actions"],
      },
    ],
  },
  aboutPreview: {
    eyebrow: "About Me",
    title: "Turning pain points into tools",
    paragraphs: [
      "I'm Baixuan Zhu (Galaxy) — a Java backend engineer with zero tolerance for repeated toil: if a task happens three times, it becomes a command or a tool. Core stack: Spring Boot, Sa-Token and MyBatis-Plus.",
      "I invest heavily in AI engineering: 10 installable agent skills distilled from coding standards, quality gates and unit-test practice, plus Danbooru Tag MCP and civitai-cli for AI art workflows. One principle throughout: check the facts first, then let the model act. Everything is open source on GitHub.",
    ],
    more: "Learn more",
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "Let's build something great together.",
    description:
      "If your team needs someone who knows Java backends and can also build AI-era tooling, drop me an email — I usually reply within 24 hours.",
    email: "Send an email",
  },
  /** Live repo metadata shown on project cards (fetched client-side from the GitHub API) */
  repoMeta: {
    /** Prefix before the last-updated date */
    updatedLabel: "Updated",
    /** Suffix after the commit count */
    commitsSuffix: "commits",
  },
  footer: {
    rights: "All rights reserved",
  },
  projectPage: {
    back: "Back to projects",
    github: "Source code",
    demo: "Live demo",
  },
  /** Projects index copy */
  projectsIndex: {
    eyebrow: "All Projects",
    title: "All Open-Source Projects",
    description:
      "From Java version management to model discovery and MCP services for AI art workflows — every project starts from a real workflow pain point and keeps shipping.",
    backHome: "Back to home",
  },
  about: {
    metadataTitle: "About Me",
    location: "Open to remote",
    paragraphs: [
      "Hi! I'm Baixuan Zhu (Galaxy), a Java backend engineer. Day to day I write Spring Boot, Sa-Token and MyBatis-Plus — the standard stack of Chinese product teams. Beyond \"it works\", I care about how the code looks six months later: conventions, maintainability, and surviving a new colleague's questions.",
      "Outside work I have an incurable habit: whatever burns me gets a tool. Managing JDKs on Windows was painful — I wrote jvm. Everyday dev utilities were scattered across the web — I moved 55 of them into one browser toolbox, DevTools. AI coding assistants kept ignoring engineering standards — I distilled our team knowledge into 10 agent skills. Fake tags and wrong models in AI art — that's Danbooru Tag MCP and civitai-cli. These projects proved one thing to me: invisible engineering knowledge only gets reused when it ships as a tool.",
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
            "A browser-based developer toolbox launched at tools.baixuanz.cn — 55 tools across 7 categories, all computed locally, under 50KB of JS per page.",
        },
        {
          period: "2026.08",
          role: "jvm · Agent Skills",
          description:
            "Shipped 10 releases of jvm in ten days (a Go-based Windows JDK manager), plus a 10-skill Agent suite for the Chinese Java ecosystem compatible with 41+ AI coding agents.",
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
            "Data that can stay in the browser should: all 55 DevTools run locally and work offline.",
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
