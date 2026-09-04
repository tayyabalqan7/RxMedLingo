import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { HomePage } from "./pages/HomePage.js";
import { UploadPage } from "./pages/UploadPage.js";
import { ProcessingPage } from "./pages/ProcessingPage.js";
import { ResultsPage } from "./pages/ResultsPage.js";
import { ErrorPage } from "./pages/ErrorPage.js";
import { OnboardingOverlay } from "./components/onboarding/OnboardingOverlay.js";
import { useOnboarding } from "./hooks/useOnboarding.js";
import { pageTransition } from "./lib/motionVariants.js";

function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="min-h-screen"
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();
  const { onboardingComplete, dismissOnboarding } = useOnboarding();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-cyan-50">
      <AnimatePresence mode="wait">
        {!onboardingComplete && (
          <OnboardingOverlay key="onboarding" onComplete={dismissOnboarding} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <HomePage />
              </AnimatedPage>
            }
          />
          <Route
            path="/upload"
            element={
              <AnimatedPage>
                <UploadPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/processing"
            element={
              <AnimatedPage>
                <ProcessingPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/results"
            element={
              <AnimatedPage>
                <ResultsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/error"
            element={
              <AnimatedPage>
                <ErrorPage />
              </AnimatedPage>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}
