import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/zh";

/** 各语言的懒加载字典装载器（动态 import 以便按语言分包） */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  zh: async () => (await import("./dictionaries/zh")).zh,
  en: async () => (await import("./dictionaries/en")).en,
};

/**
 * 获取指定语言的文案字典。
 *
 * @param locale 目标语言
 * @returns 该语言的完整文案字典
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}

export type { Dictionary };
