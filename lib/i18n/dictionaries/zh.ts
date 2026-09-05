/**
 * 简体中文字典 —— 全站中文文案的唯一数据源，同时也是其他语言字典的结构基准。
 * 修改键结构时必须同步更新 en.ts。
 */
export const zh = {
  /** <html lang> 使用的语言标识 */
  htmlLang: "zh-CN",
  metadata: {
    /** 职位头衔（用于页面标题与关于页） */
    role: "Java 后端工程师 · AI 工程化",
    /** 站点描述（SEO / Open Graph） */
    description:
      "朱柏轩（Galaxy）的个人作品集 —— Java 后端工程师，打造开源开发者工具与 AI Agent 技能：DevTools、jvm、Agent Skills 等。",
    /** Open Graph 语言标识 */
    ogLocale: "zh_CN",
  },
  brand: {
    /** 品牌区中的中文姓名（null 表示不展示） */
    nativeName: "朱柏轩" as string | null,
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
    tagline: "构建可靠的 Java 后端，打造顺手的开发工具",
    /** 自我介绍段落 */
    intro:
      "我是朱柏轩（Galaxy），Java 后端工程师，深耕 Spring 生态与开发者体验。我维护着多个开源项目：浏览器端工具箱 DevTools、Windows JDK 版本管理器 jvm，以及面向中文 Java 生态的 Agent Skills 套件。",
    ctaEmail: "邮件联系我",
  },
  featured: {
    eyebrow: "Featured Projects",
    title: "用成果证明技术深度",
    description:
      "每个项目都从真实痛点出发、在持续迭代中 —— 点击卡片查看架构与实现的完整拆解。",
  },
  skills: {
    eyebrow: "Tech Stack",
    title: "技术技能",
    description: "按场景组织的技能矩阵 —— 后端为主力，前端与 AI 工具链为两翼。",
    /** 六边形雷达图：自评熟练度（0-100），数值可随成长随时调整 */
    radar: {
      title: "能力雷达",
      hint: "自评熟练度，满分 100",
      axes: [
        { label: "后端开发", value: 90, description: "Spring 生态主力栈，多个生产项目落地" },
        { label: "AI 工程化", value: 82, description: "10 个 Agent 技能 + Claude Code 插件开发" },
        { label: "数据库", value: 80, description: "MySQL 索引/事务调优，Redis 缓存设计" },
        { label: "CI/CD 工程化", value: 75, description: "GitHub Actions 流水线与质量门禁自动化" },
        { label: "开源协作", value: 72, description: "4 个活跃开源仓库，持续迭代响应 issue" },
        { label: "前端开发", value: 65, description: "全栈补位：Vue 3 / Astro / React 工具站" },
      ],
    },
    /** 技能分类，id 用于映射图标组件 */
    categories: [
      {
        id: "backend",
        title: "后端开发",
        hint: "Java 生态主力技术栈",
        skills: ["Java", "Spring Boot", "Sa-Token", "MyBatis-Plus", "MySQL", "Redis", "Maven"],
      },
      {
        id: "frontend",
        title: "前端开发",
        hint: "全栈补位与工具型站点",
        skills: ["Vue 3", "Astro", "React", "Next.js", "TypeScript", "Tailwind CSS"],
      },
      {
        id: "ai",
        title: "AI 工程化与工具链",
        hint: "让 AI 融入开发工作流",
        skills: ["Claude Code 插件", "Agent Skills 设计", "Prompt Engineering", "Go", "Python", "GitHub Actions"],
      },
    ],
  },
  aboutPreview: {
    eyebrow: "About Me",
    title: "把痛点做成工具",
    paragraphs: [
      "Java 后端工程师，主力技术栈是 Spring Boot + Sa-Token + MyBatis-Plus。比起「能跑就行」，我更在意规范与可维护性 —— 也因此总在给团队造工具：把重复劳动变成一条命令。",
      "近一年我深入 AI 辅助编程方向：把编码规范、质量门禁、单元测试方法沉淀为 10 个可安装的 Agent 技能，让 AI 在真实 Java 项目里表现得更专业。所有项目都在 GitHub 开源。",
    ],
    more: "了解更多",
  },
  contact: {
    eyebrow: "Get in Touch",
    title: "聊聊合作机会",
    description:
      "如果你的团队需要一个既懂 Java 后端、又能搭建 AI 工程化工具链的人，欢迎邮件联系 —— 通常 24 小时内回复。",
    email: "发送邮件",
  },
  /** 项目仓库实时元信息（浏览器端从 GitHub API 拉取） */
  repoMeta: {
    /** 最近更新文案前缀 */
    updatedLabel: "更新于",
    /** 提交次数文案后缀 */
    commitsSuffix: "次提交",
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
    location: "支持远程协作",
    paragraphs: [
      "你好！我是朱柏轩（Galaxy）。我的主线是 Java 后端开发 —— Spring Boot、Sa-Token、MyBatis-Plus 这一整套中文互联网团队最常用的技术栈。我关注的不只是把功能写出来，而是让代码经得起半年后的自己回来看。",
      "另一条线是开发者工具与 AI 工程化。团队里最值钱的往往是那些「看不见的工程知识」：为什么这样设计、哪些坑不能踩。我把它们做成工具和 Agent 技能 —— jvm 解决 Windows 上的 JDK 版本管理，DevTools 把 40 个常用工具搬进浏览器，Agent Skills 让 AI 编码助手遵守工程规范。",
    ],
    journey: {
      eyebrow: "Journey",
      title: "开源时间线",
      items: [
        {
          period: "2026.05",
          role: "Claude Code GUI Hooks",
          description:
            "第一个为解决自身痛点而生的开源工具：用原生对话框替换终端权限提示，零依赖、跨平台，后演进为插件市场分发。",
        },
        {
          period: "2026.06",
          role: "DevTools 上线",
          description:
            "浏览器端开发者工具箱上线 tools.baixuanz.cn —— 40 个工具、12 个分类，全部本地运算，单页 JS 不到 50KB。",
        },
        {
          period: "2026.08",
          role: "jvm · Agent Skills",
          description:
            "十天迭代 11 个版本发布 jvm（Go 编写的 Windows JDK 管理器）；同期发布 10 个中文 Java 生态 Agent 技能，适配 41+ AI 编码工具。",
        },
      ],
    },
    principles: {
      eyebrow: "How I Work",
      title: "我的工作方式",
      items: [
        {
          title: "零配置优先",
          description:
            "好工具装完即用：jvm 首次运行自动配好 PATH 与 shell 集成，用户不需要翻文档。",
        },
        {
          title: "本地与隐私优先",
          description:
            "能留在浏览器里的数据就不该上传：DevTools 的 40 个工具全部本地运算、断网可用。",
        },
        {
          title: "评测驱动",
          description:
            "AI 技能的好坏不靠感觉：每个技能都有公开、可复现的达尔文评估产物。",
        },
        {
          title: "规范即资产",
          description:
            "把编码规范与测试方法沉淀成 Agent 可执行的技能，规范才会真正被执行，而不是躺在文档里。",
        },
      ],
    },
    offClock: {
      eyebrow: "Off the Clock",
      title: "键盘之外",
      description:
        "键盘之外，我大概率仍在折腾效率：给 AI 助手写插件、调教技能包，或者用自己写的工具武装工作流。开源是我最好的名片，欢迎来 GitHub 逛逛。",
      ctaContact: "与我联系",
      ctaProjects: "查看项目",
    },
  },
};

/** 字典结构类型：以中文字典为基准，其他语言必须保持完全相同的结构 */
export type Dictionary = typeof zh;
