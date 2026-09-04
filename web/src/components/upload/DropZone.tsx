import { useCallback, useState } from "react";
import type { DragEvent, ChangeEvent } from "react";
import { UploadCloud } from "lucide-react";
import { motion } from "motion/react";
import { useReducedMotion } from "../../hooks/useReducedMotion.js";

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

export function DropZone({ onFileSelect, accept = "image/*" }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleDragOver = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <motion.label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      animate={reducedMotion ? undefined : isDragging ? { scale: 1.02 } : { scale: 1 }}
      className={`
        flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed
        p-8 text-center transition-colors
        ${isDragging ? "border-primary-500 bg-primary-50" : "border-slate-300 bg-white hover:bg-slate-50"}
      `}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        aria-label="Upload prescription image"
      />
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <UploadCloud className="h-8 w-8" />
      </div>
      <p className="text-lg font-semibold text-slate-800">Tap or drag a prescription photo here</p>
      <p className="urdu mt-1 text-slate-600">نسخے کی تصویر یہاں رکھیں یا منتخب کریں</p>
      <p className="mt-2 text-sm text-slate-400">JPG, PNG, or WEBP · up to 8 MB</p>
    </motion.label>
  );
}
