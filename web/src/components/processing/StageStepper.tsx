import { Check } from "lucide-react";
import { motion } from "motion/react";

interface Stage {
  key: string;
  label: string;
  urduLabel: string;
}

const STAGES: Stage[] = [
  { key: "ocr", label: "Reading prescription", urduLabel: "نسخہ پڑھنا" },
  { key: "extraction", label: "Finding medicines", urduLabel: "دوائیں تلاش کرنا" },
  { key: "normalization", label: "Checking drug database", urduLabel: "دوائی ڈیٹا بیس چیک کرنا" },
  { key: "interaction", label: "Checking interactions", urduLabel: "تعاملات چیک کرنا" },
];

interface StageStepperProps {
  currentStage: string;
}

export function StageStepper({ currentStage }: StageStepperProps) {
  const activeIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full max-w-md space-y-3">
      {STAGES.map((stage, index) => {
        const isComplete = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isActive || isComplete ? 1 : 0.5 }}
            className="flex items-center gap-4"
          >
            <div
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold
                ${isComplete ? "border-green-500 bg-green-500 text-white" : ""}
                ${isActive ? "border-primary-600 bg-primary-600 text-white" : ""}
                ${!isActive && !isComplete ? "border-slate-300 text-slate-400" : ""}
              `}
            >
              {isComplete ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
            </div>
            <div>
              <p className={`font-semibold ${isActive ? "text-slate-900" : "text-slate-600"}`}>{stage.label}</p>
              <p className="urdu text-sm text-slate-500">{stage.urduLabel}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
