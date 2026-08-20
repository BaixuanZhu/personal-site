import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** 小标题（英文，装饰性眉题） */
  eyebrow: string;
  /** 主标题 */
  title: string;
  /** 补充描述（可选） */
  description?: string;
  /** 文本对齐方式，默认居左 */
  align?: "left" | "center";
}

/**
 * 区块统一标题：英文眉题 + 主标题 + 描述，保证全站节奏一致。
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center"
      )}
    >
      <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
