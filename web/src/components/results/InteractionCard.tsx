import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Card } from "../ui/Card.js";
import { SeverityBadge } from "./SeverityBadge.js";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";
import type { InteractionResult, Severity } from "@rxmedlingo/shared";

interface InteractionCardProps {
  interaction: InteractionResult;
}

const severityVariant: Record<Severity, "red" | "amber" | "green"> = {
  red: "red",
  amber: "amber",
  green: "green",
};

export function InteractionCard({ interaction }: InteractionCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
      animate={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
      {...(interaction.severity === "red" && !reducedMotion ? { whileInView: { scale: [1, 1.015, 1] } } : {})}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      <Card variant={severityVariant[interaction.severity]}>
        <div className="flex items-start gap-3">
          <div
            className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-full
              ${interaction.severity === "red" ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"}
            `}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={interaction.severity} />
              <span className="text-sm font-medium text-slate-700">
                {interaction.drugA} + {interaction.drugB}
              </span>
            </div>
            <p className="mt-2 text-slate-800">{interaction.summary}</p>
            <p className="urdu mt-1 text-slate-700">{interaction.summaryUrdu}</p>
            {interaction.labelExcerpt && (
              <p className="mt-2 border-l-2 border-current pl-3 text-xs italic text-slate-600">
                {interaction.labelExcerpt}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Source: {interaction.evidenceSource === "curated-rules" ? "clinical rules" : "FDA drug label"}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
