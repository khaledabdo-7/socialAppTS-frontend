import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sphere-accent disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "shadow-md",
      secondary:
        "bg-sphere-base hover:opacity-90 text-sphere-main border border-sphere-border",
      outline:
        "border border-sphere-border bg-transparent hover:bg-sphere-card text-sphere-main",
      ghost:
        "bg-transparent hover:bg-sphere-card text-sphere-muted hover:text-sphere-main",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/25",
    };

    const primaryStyle: React.CSSProperties =
      variant === "primary"
        ? {
            backgroundColor: "var(--accent-btn)",
            color: "var(--accent-btn-text)",
            ...style,
          }
        : { ...style };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={primaryStyle}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
