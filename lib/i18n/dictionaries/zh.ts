/**
 * 简体中文字典 —— 全站中文文案的唯一数据源，同时也是其他语言字典的结构基准。
 * 修改键结构时必须同步更新 en.ts。
 */
export const zh = {
  /** <html lang> 使用的语言标识 */
  htmlLang: "zh-CN",
  metadata: {
    /** 职位头衔（用于页面标题与关于页） */
    role: "全栈开发工程师",
    /** 站点描述（SEO / Open Graph） */
    description:
      "Alex Chen（陈亦航）的个人作品集 —— 全栈开发工程师，专注高可用 Web 应用，展示精选开源项目与技术技能。",
    /** Open Graph 语言标识 */
    ogLocale: "zh_CN",
  },
  brand: {
    /** 品牌区中的中文姓名（英文站传 null 表示不展示） */
    nativeName: null as string | null,
  },
  nav: {
    projects: "项目",
    skills: "技能",
    about: "关于",
    contact: "联系",
  },
  theme: {
    toggle: "切换主题",
    toLight: "切换为亮色主题",
    toDark: "切换为暗色主题",
  },
  langSwitcher: {
    /** 切换按钮组的无障碍名称 */
    label: "切换语言",
  },
  hero: {
    /** 状态徽章文案 */
    available: "正在寻找新机会",
    /** 主标语（H1） */
    tagline: "构建可靠、高性能的 Web 体验",
    /** 自我介绍段落 */
    intro:
      "我是 Alex Chen（陈亦航），全栈开发工程师，专注高可用 Web 应用与极致的用户体验。",
    ctaProjects: "查看精选项目",
    ctaResume: "下载简历",
    avatarAlt: "Alex Chen 的头像",
  },
  featured: {
    eyebrow: "Featured Projects",
    title: "用成果证明技术深度",
    description:
      "每一个项目都从真实问题出发，下面是其中最能代表我工程能力的三个。",
  },
  skills: {
    eyebrow: "Tech Stack",
    title: "技术技能",
    description: "按场景组织的技能矩阵 —— 从界面到服务端，再到交付链路。",
    /** 技能分类，id 用于映射图标组件 */
    categories: [
      {
        id: "frontend",
        title: "前端",
        hint: "工程化与体验并重",
        skills: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Motion", "Vite"],
      },
      {
        id: "backend",
        title: "后端",
        hint: "高并发与稳定性",
        skills: ["Node.js", "Fastify", "PostgreSQL", "Redis", "WebSocket", "GraphQL"],
      },
      {
        id: "devops",
        title: "DevOps · 工程效能",
        hint: "自动化与可观测",
        skills: ["Docker", "GitHub Actions", "Linux", "Vitest", "OpenTelemetry", "Git"],
      },
    ],
  },
  aboutPreview: {
    eyebrow: "About Me",
    title: "代码之外，还有热爱",
    paragraphs: [
      "6 年全栈开发经验，热衷于把复杂的问题拆解成优雅的模块。我相信好的工程是「让正确的事情更容易发生」—— 无论是设计一个让团队效率翻倍的组件库，还是把接口延迟压到毫秒级。",
      "工作之外，我维护着两个开源项目，喜欢在技术社区分享工程实践；也是个咖啡爱好者，周末常泡在手冲与键盘之间。",
    ],
    more: "了解更多",
    avatarAlt: "Alex Chen 的头像",
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "Let's build something great together.",
    description:
      "如果我的经历与你的团队契合，欢迎随时联系 —— 邮件通常会在 24 小时内回复。",
    resume: "下载简历 PDF",
    email: "发送邮件",
  },
  footer: {
    rights: "保留所有权利",
  },
  projectPage: {
    back: "返回项目列表",
    github: "源码仓库",
    demo: "在线演示",
  },
  about: {
    metadataTitle: "关于我",
    location: "上海 · 支持远程",
    paragraphs: [
      "你好！我是一名热爱构建产品的全栈工程师。比起「能用」，我更追求「好用且可靠」—— 我着迷于那些让用户几乎察觉不到技术存在的体验：毫秒级响应的协作画布、永不丢数据的离线编辑、一行配置就生效的灰度发布。",
      "我相信工程师的价值不只体现在代码里：写清楚的文档、做诚实的复盘、给同伴靠谱的估算，和写出优雅的抽象一样重要。",
    ],
    journey: {
      eyebrow: "Journey",
      title: "职业经历",
      items: [
        {
          period: "2023 — 至今",
          role: "高级全栈工程师 · 某 SaaS 独角兽",
          description:
            "负责核心协作模块的架构演进，主导实时同步层重构，QPS 承载能力提升 5 倍；同时推动组件库落地，支撑 8 条业务线。",
        },
        {
          period: "2020 — 2023",
          role: "全栈工程师 · 某电商平台",
          description:
            "从单体到微服务的迁移主力，设计并落地 API 网关与灰度发布体系；大促期间零故障交付三次。",
        },
        {
          period: "2019 — 2020",
          role: "前端工程师 · 创业公司",
          description:
            "独立负责商家后台从 0 到 1，三个月上线；积累了「小团队、快交付、高质量」的工作习惯。",
        },
      ],
    },
    principles: {
      eyebrow: "How I Work",
      title: "我的工作方式",
      items: [
        {
          title: "先问为什么",
          description:
            "动手前先对齐问题本质与衡量标准，避免优雅地解决一个不存在的问题。",
        },
        {
          title: "简单优先",
          description: "能用简单方案解决的绝不引入复杂度 —— 复杂度是最贵的负债。",
        },
        {
          title: "数据说话",
          description: "性能与体验的每个决策都有量化依据，上线后持续跟踪验证。",
        },
        {
          title: "文档即代码",
          description: "关键设计必有文档与复盘，让团队的经验可以复利积累。",
        },
      ],
    },
    offClock: {
      eyebrow: "Off the Clock",
      title: "键盘之外",
      description:
        "周末的我大概率在手冲咖啡、爬山或读工程类书籍；也活跃在开源社区，欢迎来我的 GitHub 逛逛。",
      ctaContact: "与我联系",
      ctaProjects: "查看项目",
    },
  },
};

/** 字典结构类型：以中文字典为基准，其他语言必须保持完全相同的结构 */
export type Dictionary = typeof zh;
