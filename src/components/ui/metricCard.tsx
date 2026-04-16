import { cn } from "@/lib/cn";

import { Text } from "./text";

type MetricCardProps = {
  label: string;
  value: number | string;
  className?: string;
};

export function MetricCard({ label, value, className }: MetricCardProps) {
  return (
    <article className={cn("metric-card", className)}>
      <Text as="p">{label}</Text>
      <strong>{value}</strong>
    </article>
  );
}