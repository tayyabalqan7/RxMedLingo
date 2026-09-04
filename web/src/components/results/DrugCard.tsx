import { Pill, Clock, Gauge, Layers, Info } from "lucide-react";
import { Card } from "../ui/Card.js";
import type { DrugResult } from "@rxmedlingo/shared";

interface DrugCardProps {
  drug: DrugResult;
}

export function DrugCard({ drug }: DrugCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          <Pill className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{drug.matchedName}</h3>
          {drug.isCombination && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-cyan-600">
              <Layers className="h-3.5 w-3.5" />
              Combination medicine
            </span>
          )}
          <p className="urdu mt-0.5 text-sm text-slate-500">{drug.rawText}</p>

          {drug.commonUse && (
            <p className="mt-1.5 flex items-start gap-1 text-sm text-slate-600">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-500" />
              {drug.commonUse}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {drug.dosage.strength && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                <Gauge className="h-3.5 w-3.5" />
                {drug.dosage.strength}
              </span>
            )}
            {drug.dosage.frequency && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                <Clock className="h-3.5 w-3.5" />
                {drug.dosage.frequency}
              </span>
            )}
            {drug.dosage.duration && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700">
                {drug.dosage.duration}
              </span>
            )}
          </div>

          {drug.confidence === "low" && (
            <p className="mt-2 text-xs text-amber-600">This medicine name could not be fully verified.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
