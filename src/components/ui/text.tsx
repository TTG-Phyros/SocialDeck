import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type TextTone = "default" | "muted" | "mini" | "error" | "info";

export type TextProps = HTMLAttributes<HTMLElement> & {
  tone?: TextTone;
  as?: "p" | "span" | "small" | "div";
};

const toneClasses: Record<TextTone, string> = {
  default: "",
  muted: "text-muted",
  mini: "text-mini",
  error: "text-error",
  info: "text-info",
};

export function Text({ as = "p", tone = "default", className, ...props }: TextProps) {
  const Component = as;

  return <Component className={cn(toneClasses[tone], className)} {...props} />;
}
