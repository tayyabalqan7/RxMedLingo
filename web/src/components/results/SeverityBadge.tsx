import type { Severity } from "@rxmedlingo/shared";

interface SeverityBadgeProps {
  severity: Severity;
  label?: string;
  className?: string;
}

const config: Record<Severity, { classes: string; label: string; urdu: string }> = {
  red: {
    classes: "bg-red-100 text-red-700 border-red-200",
    label: "Warning",
    urdu: "انتباہ",
  },
  amber: {
    classes: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Caution",
    urdu: "احتیاط",
  },
  green: {
    classes: "bg-green-100 text-green-700 border-green-200",
    label: "No issue",
    urdu: "کوئی مسئلہ نہیں",
  },
};

export function SeverityBadge({ severity, label, className = "" }: SeverityBadgeProps) {
  const cfg = config[severity];
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold
        ${cfg.classes} ${className}
      `}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {label ?? cfg.label}
      <span className="urdu text-xs font-normal">({cfg.urdu})</span>
    </span>
  );
}
