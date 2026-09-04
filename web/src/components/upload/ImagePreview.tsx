import { X } from "lucide-react";

interface ImagePreviewProps {
  src: string;
  fileName: string;
  onClear: () => void;
}

export function ImagePreview({ src, fileName, onClear }: ImagePreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <img
        src={src}
        alt={`Preview of ${fileName}`}
        className="max-h-80 w-full object-contain"
      />
      <button
        onClick={onClear}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition-colors hover:bg-slate-900/80"
        aria-label="Remove image"
      >
        <X className="h-5 w-5" />
      </button>
      <p className="truncate px-4 py-2 text-sm text-slate-600">{fileName}</p>
    </div>
  );
}