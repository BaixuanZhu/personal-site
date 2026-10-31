import vitesseBlack from "shiki/themes/vitesse-black.mjs";
import type { ThemeRegistrationRaw } from "shiki";

/**
 * vitesse-black 的标点与注释色在纯黑底上低于 WCAG AA 4.5:1，
 * 构建期统一替换为同色系高对比度颜色，避免运行时 CSS 覆盖。
 */
const COLOR_REPLACEMENTS: Record<string, string> = {
  "#444444": "#808080",
  "#758575dd": "#758575",
  "#c98a7d77": "#c98a7d",
};

export const codeTheme: ThemeRegistrationRaw = {
  ...vitesseBlack,
  tokenColors: vitesseBlack.tokenColors?.map((token) => {
    const foreground = token.settings?.foreground;
    if (typeof foreground !== "string") return token;
    const replacement = COLOR_REPLACEMENTS[foreground.toLowerCase()];
    return replacement
      ? { ...token, settings: { ...token.settings, foreground: replacement } }
      : token;
  }),
};
