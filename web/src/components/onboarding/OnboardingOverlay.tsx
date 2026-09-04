import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Search, Volume2, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/Button.js";

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Camera,
    title: "Scan your prescription",
    urduTitle: "اپنا نسخہ اسکین کریں",
    description: "Take or upload a clear photo of your prescription.",
    urduDescription: "اپنے نسخے کی واضح تصویر لیں یا اپلوڈ کریں۔",
    color: "text-primary-600",
    bg: "bg-primary-100",
  },
  {
    icon: Search,
    title: "Check for interactions",
    urduTitle: "تعاملات چیک کریں",
    description: "We find your medicines and check for dangerous combinations.",
    urduDescription: "ہم آپ کی دوائیں تلاش کرتے ہیں اور خطرناک امتزاج چیک کرتے ہیں۔",
    color: "text-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    icon: Volume2,
    title: "Listen in Urdu",
    urduTitle: "اردو میں سنے",
    description: "Tap the button to hear your results explained in simple Urdu.",
    urduDescription: "آپ کے نتائج کو سادہ اردو میں سننے کے لیے بٹن دبائیں۔",
    color: "text-violet-600",
    bg: "bg-violet-100",
  },
];

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => onComplete();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={skip}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Skip introduction"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex justify-center gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${index === step ? "w-8 bg-primary-600" : "w-2 bg-slate-200"}`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <div
              className={`mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full ${slides[step].bg} ${slides[step].color}`}
            >
              {(() => {
                const Icon = slides[step].icon;
                return <Icon className="h-12 w-12" />;
              })()}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{slides[step].title}</h2>
            <p className="urdu mt-1 text-lg text-slate-700">{slides[step].urduTitle}</p>
            <p className="mt-3 text-slate-600">{slides[step].description}</p>
            <p className="urdu mt-1 text-slate-600">{slides[step].urduDescription}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex flex-col gap-3">
          <Button onClick={next} size="lg" className="w-full">
            {step === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="h-5 w-5" />
          </Button>
          {step < slides.length - 1 && (
            <Button onClick={skip} variant="ghost" className="w-full">
              Skip
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
