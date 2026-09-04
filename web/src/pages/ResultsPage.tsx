import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { DrugCard } from "../components/results/DrugCard.js";
import { InteractionCard } from "../components/results/InteractionCard.js";
import { DuplicateAlert } from "../components/results/DuplicateAlert.js";
import { UrduAudioButton } from "../components/results/UrduAudioButton.js";
import { EmptyState } from "../components/ui/EmptyState.js";
import { useUrduAudio } from "../hooks/useUrduAudio.js";
import { staggerContainer, slideUp } from "../lib/motionVariants.js";
import type { AnalyzeResponse, DrugResult, DuplicateResult, InteractionResult } from "@rxmedlingo/shared";

interface LocationState {
  result?: AnalyzeResponse;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = (location.state as LocationState) ?? {};
  const { play, stop, loading: audioLoading, playing, error: audioError } = useUrduAudio();

  if (!result) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-8">
        <EmptyState
          title="No results found"
          description="Please upload a prescription first."
          urduText="براہ کرم پہلے نسخہ اپلوڈ کریں۔"
        />
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-primary-600 hover:underline"
        >
          Go home
        </button>
      </div>
    );
  }

  const hasWarnings = result.interactions.length > 0 || result.duplicates.length > 0;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900">Your Prescription Results</h1>
      <p className="urdu mt-1 text-lg text-slate-600">آپ کے نسخے کے نتائج</p>

      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          mt-5 flex items-start gap-3 rounded-2xl border p-4
          ${hasWarnings ? "border-red-100 bg-red-50 text-red-800" : "border-green-100 bg-green-50 text-green-800"}
        `}
      >
        {hasWarnings ? <AlertCircle className="h-6 w-6 shrink-0" /> : <CheckCircle className="h-6 w-6 shrink-0" />}
        <div>
          <p className="font-semibold">
            {hasWarnings
              ? `Found ${result.interactions.length + result.duplicates.length} issue(s) to review.`
              : "No serious interactions or duplicates found."}
          </p>
          <p className="urdu text-sm">
            {hasWarnings
              ? "دیکھنے کے لیے مسائل ملے۔"
              : "کوئی سنگین تعامل یا ڈپلیکیٹ نہیں ملا۔"}
          </p>
        </div>
      </motion.div>

      {/* Audio */}
      <div className="mt-6">
        <UrduAudioButton
          onClick={() => (playing ? stop() : play(result.urduNarrative))}
          loading={audioLoading}
          playing={playing}
          error={audioError}
        />
      </div>

      {/* Warnings / degradation */}
      {result.meta.interactionSourceDegraded && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Limited interaction data</p>
          <p>Some interaction checks were skipped because the external data source is slow. High-confidence rules still apply.</p>
        </div>
      )}
      {result.warnings.map((warning, index) => (
        <div
          key={index}
          className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {warning}
        </div>
      ))}

      {/* Drugs */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Medicines Found</h2>
        <p className="urdu text-slate-600">ملی ہوئی دوائیں</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-3 space-y-3"
        >
          {result.drugs.length === 0 ? (
            <EmptyState
              title="No medicines found"
              description="We couldn't identify any medicines. Try a clearer photo."
              urduText="کوئی دوا نہیں ملی۔ واضح تصویر کی کوشش کریں۔"
            />
          ) : (
            result.drugs.map((drug: DrugResult) => (
              <motion.div key={drug.id} variants={slideUp}>
                <DrugCard drug={drug} />
              </motion.div>
            ))
          )}
        </motion.div>
      </section>

      {/* Duplicates */}
      {result.duplicates.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Duplicate Ingredients</h2>
          <p className="urdu text-slate-600">ڈپلیکیٹ اجزاء</p>
          <div className="mt-3 space-y-3">
            {result.duplicates.map((dup: DuplicateResult, index: number) => (
              <DuplicateAlert key={index} duplicate={dup} />
            ))}
          </div>
        </section>
      )}

      {/* Interactions */}
      {result.interactions.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Interactions</h2>
          <p className="urdu text-slate-600">دوائی تعاملات</p>
          <div className="mt-3 space-y-3">
            {result.interactions.map((interaction: InteractionResult, index: number) => (
              <InteractionCard key={index} interaction={interaction} />
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <footer className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
        RxMedLingo is for informational purposes only. Always consult a qualified doctor or pharmacist before changing your medicines.
        <br />
        <span className="urdu">
          یہ صرف معلوماتی مقاصد کے لیے ہے۔ اپنی دوائیوں میں تبدیلی سے پہلے ہمیشہ قابل ڈاکٹر یا فارماسسٹ سے مشورہ کریں۔
        </span>
      </footer>
    </div>
  );
}
