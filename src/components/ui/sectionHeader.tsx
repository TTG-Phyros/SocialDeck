import { cn } from "@/lib/cn";

import { Text } from "./text";

type HeadingLevel = 1 | 2 | 3;

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  level?: HeadingLevel;
  className?: string;
  subtitleClassName?: string;
};

const headingTags: Record<HeadingLevel, "h1" | "h2" | "h3"> = {
  1: "h1",
  2: "h2",
  3: "h3",
};

export function SectionHeader({
  title,
  subtitle,
  level = 2,
  className,
  subtitleClassName,
}: SectionHeaderProps) {
  const HeadingTag = headingTags[level];

  return (
    <div className={cn("section-header", className)}>
      <HeadingTag className="section-title">{title}</HeadingTag>

      {subtitle ? (
        <Text className={cn("section-subtitle", subtitleClassName)} as="p">
          {subtitle}
        </Text>
      ) : null}
    </div>
  );
}