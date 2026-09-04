import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ScanAnimation } from "../components/processing/ScanAnimation.js";
import { StageStepper } from "../components/processing/StageStepper.js";
import { Spinner } from "../components/ui/Spinner.js";

interface LocationState {
  fileName?: string;
  previewUrl?: string;
}

const STAGES = ["ocr", "extraction", "normalization", "interaction"];

export function ProcessingPage() {
  const location = useLocation();
  const { previewUrl } = (location.state as LocationState) ?? {};
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6">
      <ScanAnimation previewUrl={previewUrl ?? null} />

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-center gap-2 text-lg font-semibold text-slate-800">
          <Spinner size="sm" />
          Analyzing your prescription
        </div>
        <p className="urdu text-slate-600">آپ کا نسخہ تجزیہ کیا جا رہا ہے</p>
      </div>

      <div className="mt-8 flex w-full justify-center">
        <StageStepper currentStage={STAGES[stageIndex]} />
      </div>

      <p className="mt-8 max-w-xs text-xs text-slate-400">
        This usually takes a few seconds. Please keep this screen open.
      </p>
    </div>
  );
}
