import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DropZone } from "../components/upload/DropZone.js";
import { CameraCapture } from "../components/upload/CameraCapture.js";
import { ImagePreview } from "../components/upload/ImagePreview.js";
import { Button } from "../components/ui/Button.js";
import { useAnalyzePrescription } from "../hooks/useAnalyzePrescription.js";
import { checkHealth } from "../lib/apiClient.js";

export function UploadPage() {
  const navigate = useNavigate();
  const { analyze } = useAnalyzePrescription();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    checkHealth().then((h) => setConfigured(h.ocrConfigured));
  }, []);

  const handleFile = useCallback((selected: File) => {
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }, [previewUrl]);

  const handleSubmit = useCallback(() => {
    if (file) analyze(file);
  }, [file, analyze]);

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-6 sm:px-6">
      <button
        onClick={() => navigate("/")}
        className="mb-4 flex w-fit items-center gap-1 rounded-full px-2 py-1 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-slate-900">Upload Prescription</h1>
      <p className="urdu mt-1 text-lg text-slate-600">نسخہ اپلوڈ کریں</p>

      <div className="mt-6 space-y-4">
        {previewUrl && file ? (
          <ImagePreview src={previewUrl} fileName={file.name} onClear={handleClear} />
        ) : (
          <DropZone onFileSelect={handleFile} />
        )}

        <CameraCapture onCapture={handleFile} />

        {configured === false && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Scanner not configured</p>
            <p>Please add an OCR.space API key to .env and restart the server.</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!file}
          size="lg"
          className="w-full"
          aria-label="Analyze prescription"
        >
          Analyze Prescription
          <span className="urdu text-base font-normal"> / نسخہ تجزیہ کریں</span>
        </Button>
      </div>
    </div>
  );
}
