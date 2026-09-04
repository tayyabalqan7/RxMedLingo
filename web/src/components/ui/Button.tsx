import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
  > {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
  asChild?: boolean;
}

const variantClasses = {
  primary: "bg-primary-600 text-white shadow-md hover:bg-primary-700 active:bg-primary-800",
  secondary: "bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50 active:bg-slate-100",
  danger: "bg-red-600 text-white shadow-md hover:bg-red-700 active:bg-red-800",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading,
  asChild,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const reducedMotion = useReducedMotion();
  const classes = `
    inline-flex items-center justify-center gap-2 rounded-2xl font-semibold
    transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]} ${sizeClasses[size]} ${className}
  `;

  if (asChild) {
    return (
      <motion.span
        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
        whileTap={reducedMotion ? undefined : { scale: 0.98 }}
        className={classes}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
        {children}
      </motion.span>
    );
  }

  return (
    <motion.button
      whileHover={reducedMotion ? undefined : { scale: 1.02 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </motion.button>
  );
}
