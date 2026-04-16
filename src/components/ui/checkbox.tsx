import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, ...props }, ref) => {
  return <input ref={ref} type="checkbox" className={cn("ui-checkbox", className)} {...props} />;
});

Checkbox.displayName = "Checkbox";
