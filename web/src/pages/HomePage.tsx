import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Scan, Shield, Languages } from "lucide-react";
import { Button } from "../components/ui/Button.js";
import { Card } from "../components/ui/Card.js";
import { checkHealth } from "../lib/apiClient.js";

export function HomePage() {
  const navigate = useNavigate();
  const [health, setHealth] = useState<{ ocr: boolean; tts: boolean } | null>(null);

  useEffect(() => {
    checkHealth()
      .then((h) => setHealth({ ocr: h.ocrConfigured, tts: h.ttsConfigured }))
      .catch(() => setHealth({ ocr: false, tts: false }));
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-10 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-600 text-white shadow-lg"
        >
          <Scan className="h-10 w-10" />
        </motion.div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">RxMedLingo</h1>
        <p className="urdu mt-2 text-xl text-primary-700">آر ایکس میڈ لنگو</p>
        <p className="mx-auto mt-3 max-w-md text-lg text-slate-600">
          Scan your prescription, check for drug interactions, and listen to the results in Urdu.
        </p>
        <p className="urdu mx-auto mt-1 max-w-md text-slate-600">
          نسخہ اسکین کریں، دوائی تعاملات چیک کریں، اور نتائج اردو میں سنے۔
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center">
          <Scan className="mx-auto h-8 w-8 text-primary-600" />
          <h2 className="mt-3 font-semibold text-slate-800">Scan Prescription</h2>
          <p className="urdu mt-1 text-sm text-slate-600">نسخہ اسکین کریں</p>
        </Card>
        <Card className="text-center">
          <Shield className="mx-auto h-8 w-8 text-cyan-600" />
          <h2 className="mt-3 font-semibold text-slate-800">Check Safety</h2>
          <p className="urdu mt-1 text-sm text-slate-600">حفاظت چیک کریں</p>
        </Card>
        <Card className="text-center">
          <Languages className="mx-auto h-8 w-8 text-violet-600" />
          <h2 className="mt-3 font-semibold text-slate-800">Listen in Urdu</h2>
          <p className="urdu mt-1 text-sm text-slate-600">اردو میں سنے</p>
        </Card>
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <Button onClick={() => navigate("/upload")} size="lg" className="w-full sm:w-auto">
          Scan Prescription
          <span className="urdu text-base font-normal"> / نسخہ اسکین کریں</span>
        </Button>

        {health && (!health.ocr || !health.tts) && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            {!health.ocr && <p>OCR.space API key is missing — scanning will not work.</p>}
            {!health.tts && <p>ResponsiveVoice API credentials are missing — Urdu audio will not work.</p>}
          </div>
        )}
      </div>

      <footer className="mt-auto pt-12 text-center text-xs text-slate-400">
        RxMedLingo is for informational purposes only. Always consult a doctor or pharmacist.
        <br />
        <span className="urdu">یہ صرف معلوماتی مقاصد کے لیے ہے۔ ہمیشہ ڈاکٹر یا فارماسسٹ سے مشورہ کریں۔</span>
      </footer>
    </div>
  );
}
