import { useState, useCallback, useEffect } from "react";

interface AudioState {
  loading: boolean;
  playing: boolean;
  error: string | null;
}

export function useUrduAudio() {
  const [state, setState] = useState<AudioState>({ loading: false, playing: false, error: null });

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const play = useCallback((text: string) => {
    setState({ loading: true, playing: false, error: null });

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ur-PK";
      utterance.rate = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const urduVoice = voices.find(
        (v) => v.lang === "ur-PK" || v.lang === "ur-IN" || v.lang.startsWith("ur")
      );
      if (urduVoice) {
        utterance.voice = urduVoice;
      }

      utterance.onstart = () => setState({ loading: false, playing: true, error: null });
      utterance.onend = () => setState({ loading: false, playing: false, error: null });
      utterance.onerror = () =>
        setState({ loading: false, playing: false, error: "Could not play audio." });

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setState({ loading: false, playing: false, error: "Could not generate Urdu audio." });
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState({ loading: false, playing: false, error: null });
  }, []);

  return { ...state, play, stop };
}