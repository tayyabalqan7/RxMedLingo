import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rxmedlingo.onboarded";

export function useOnboarding() {
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return true; // if storage is unavailable, skip onboarding to avoid blocking
    }
  });

  useEffect(() => {
    // Re-check after hydration to ensure SSR/hydration safety.
    try {
      setOnboardingComplete(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setOnboardingComplete(true);
    }
  }, []);

  const dismissOnboarding = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
    setOnboardingComplete(true);
  }, []);

  return { onboardingComplete, dismissOnboarding };
}
