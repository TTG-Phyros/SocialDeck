import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Label } from "./label";
import { Text } from "./text";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  hintClassName?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  hint,
  hintClassName,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("field-group", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <Text tone="mini" as="p" className={hintClassName}>
          {hint}
        </Text>
      ) : null}
    </div>
  );
}