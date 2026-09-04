import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

interface ScanAnimationProps {
  previewUrl: string | null;
}

export function ScanAnimation({ previewUrl }: ScanAnimationProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-lg">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Prescription being scanned"
          className="h-full w-full object-contain opacity-80"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          <span className="text-sm">Scanning prescription</span>
        </div>
      )}

      {/* Scan line */}
      {!reducedMotion && (
        <motion.div
          className="absolute left-0 right-0 h-1 bg-primary-500/70 shadow-[0_0_20px_rgba(20,184,166,0.6)]"
          initial={{ top: "0%" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Corner brackets */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-3 top-3 h-6 w-6 border-l-4 border-t-4 border-primary-600" />
        <div className="absolute right-3 top-3 h-6 w-6 border-r-4 border-t-4 border-primary-600" />
        <div className="absolute bottom-3 left-3 h-6 w-6 border-b-4 border-l-4 border-primary-600" />
        <div className="absolute bottom-3 right-3 h-6 w-6 border-b-4 border-r-4 border-primary-600" />
      </div>
    </div>
  );
}
