import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  urduText?: string;
}

export function EmptyState({ title, description, urduText }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-xs text-slate-600">{description}</p>
      {urduText && <p className="urdu mt-2 text-slate-600">{urduText}</p>}
    </div>
  );
}
