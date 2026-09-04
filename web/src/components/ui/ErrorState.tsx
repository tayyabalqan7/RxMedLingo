import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./Button.js";

interface ErrorStateProps {
  title?: string;
  message: string;
  urduMessage?: string;
  retryable?: boolean;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  urduMessage,
  retryable = true,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-xs text-slate-700">{message}</p>
      {urduMessage && <p className="urdu mt-2 text-slate-700">{urduMessage}</p>}
      {retryable && onRetry && (
        <Button onClick={onRetry} className="mt-5" aria-label="Try again">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
