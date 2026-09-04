import { Copy } from "lucide-react";
import { Card } from "../ui/Card.js";
import { SeverityBadge } from "./SeverityBadge.js";
import type { DuplicateResult } from "@rxmedlingo/shared";

interface DuplicateAlertProps {
  duplicate: DuplicateResult;
}

export function DuplicateAlert({ duplicate }: DuplicateAlertProps) {
  return (
    <Card variant={duplicate.severity}>
      <div className="flex items-start gap-3">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-full
            ${duplicate.severity === "red" ? "bg-red-200 text-red-700" : "bg-amber-200 text-amber-700"}
          `}
        >
          <Copy className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={duplicate.severity} label="Duplicate" />
          </div>
          <p className="mt-2 text-slate-800">{duplicate.message}</p>
          <p className="urdu mt-1 text-slate-700">{duplicate.messageUrdu}</p>
        </div>
      </div>
    </Card>
  );
}
