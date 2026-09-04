import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "red" | "amber" | "green";
}

const variantClasses = {
  default: "bg-white border-slate-100",
  red: "bg-red-50 border-red-100",
  amber: "bg-amber-50 border-amber-100",
  green: "bg-green-50 border-green-100",
};

export function Card({ children, className = "", variant = "default" }: CardProps) {
  return (
    <div
      className={`
        rounded-3xl border p-5 shadow-sm
        ${variantClasses[variant]} ${className}
      `}
    >
      {children}
    </div>
  );
}
