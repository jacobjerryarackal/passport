"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "icon-only";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  /** For backwards compatibility */
  icon?: React.ReactNode;
  /** Required accessibility label for icon-only buttons */
  ariaLabel?: string;
  tooltip?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      leadingIcon,
      trailingIcon,
      icon,
      ariaLabel,
      tooltip,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Resolve leading icon (support legacy `icon` prop as leading)
    const activeLeadingIcon = leadingIcon || icon;
    const isIconOnly = variant === "icon-only" || (!children && Boolean(activeLeadingIcon || trailingIcon));

    // Base alignment & typography rules:
    // strict inline-flex, items-center, justify-center, nowrap, font-medium, leading-none
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap font-medium text-center transition-all duration-150 select-none border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.985]";

    // Variant color & depth styling
    const variantClasses = {
      primary:
        "bg-primary text-primary-foreground border-transparent hover:bg-primary-700 active:bg-primary-800 shadow-xs shadow-primary/25",
      secondary:
        "bg-secondary text-secondary-foreground border-border hover:bg-muted active:bg-secondary/70 shadow-2xs",
      outline:
        "bg-transparent text-foreground border-border hover:bg-secondary/80 hover:border-zinc-500/40 active:bg-secondary",
      ghost:
        "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/70 active:bg-secondary",
      danger:
        "bg-destructive text-destructive-foreground border-transparent hover:bg-red-600 active:bg-red-700 shadow-xs shadow-destructive/20",
      "icon-only":
        "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-secondary active:bg-muted shadow-2xs",
    };

    // Strict dimensions: height, horizontal padding, and icon gap
    const sizeClasses = isIconOnly
      ? {
          sm: "h-8 w-8 p-0 rounded-md",
          md: "h-9 w-9 p-0 rounded-md",
          lg: "h-11 w-11 p-0 rounded-md",
        }
      : {
          sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
          md: "h-9 px-3.5 text-xs font-semibold gap-2 rounded-md",
          lg: "h-11 px-5 text-sm font-semibold gap-2.5 rounded-lg",
        };

    // Icon sizing constraints: strictly flex-shrink-0 and aligned
    const iconWrapperClass = "inline-flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:shrink-0";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-label={ariaLabel || (typeof children === "string" ? children : undefined)}
        title={tooltip || ariaLabel}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {loading ? (
          <span className={iconWrapperClass}>
            <Loader2 className="animate-spin text-current" />
          </span>
        ) : activeLeadingIcon ? (
          <span className={iconWrapperClass}>{activeLeadingIcon}</span>
        ) : null}

        {children && <span className="inline-block leading-none truncate">{children}</span>}

        {!loading && trailingIcon ? (
          <span className={iconWrapperClass}>{trailingIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

// Export FintechButton alias for backward compatibility
export const FintechButton = Button;

