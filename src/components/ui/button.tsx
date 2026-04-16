import Link from "next/link";
import {
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  forwardRef,
} from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "small" | "normal" | "big";

type CommonButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "btn-small",
  normal: "btn-normal",
  big: "btn-big",
};

export function getButtonClasses(options?: CommonButtonProps): string {
  const variant = options?.variant ?? "primary";
  const size = options?.size ?? "normal";

  return cn(
    "btn-base",
    variantClasses[variant],
    sizeClasses[size],
    options?.fullWidth ? "btn-full" : undefined,
    options?.className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & CommonButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "normal", fullWidth = false, className, type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={getButtonClasses({ variant, size, fullWidth, className })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export type ButtonLinkProps = CommonButtonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className">;

export function ButtonLink({
  variant = "primary",
  size = "normal",
  fullWidth = false,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
