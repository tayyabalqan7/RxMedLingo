import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "../components/ui/ErrorState.js";
import { Button } from "../components/ui/Button.js";
import { Home } from "lucide-react";
import type { AnalyzeErrorResponse } from "@rxmedlingo/shared";

interface LocationState {
  error?: AnalyzeErrorResponse["error"];
}

export function ErrorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = (location.state as LocationState) ?? {};

  const title = error?.stage ? `Problem during ${error.stage}` : "Something went wrong";

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 py-8 sm:px-6">
      <ErrorState
        title={title}
        message={error?.userMessage ?? "An unexpected error occurred. Please try again."}
        urduMessage={error?.userMessageUrdu ?? "ایک غیر متوقع خرابی پیش آئی۔ براہ کرم دوبارہ کوشش کریں۔"}
        retryable={error?.retryable ?? true}
        onRetry={() => navigate("/upload")}
      />
      <Button variant="secondary" onClick={() => navigate("/")} className="mt-4">
        <Home className="h-4 w-4" />
        Go Home
      </Button>
    </div>
  );
}
