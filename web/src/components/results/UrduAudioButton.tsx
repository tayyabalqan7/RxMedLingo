import { Volume2, Square } from "lucide-react";
import { Button } from "../ui/Button.js";

interface UrduAudioButtonProps {
  onClick: () => void;
  loading: boolean;
  playing: boolean;
  error?: string | null;
}

export function UrduAudioButton({ onClick, loading, playing, error }: UrduAudioButtonProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={onClick}
        isLoading={loading}
        size="lg"
        className="w-full sm:w-auto"
        aria-label={playing ? "Stop Urdu audio" : "Listen in Urdu"}
      >
        {playing ? <Square className="h-5 w-5 fill-current" /> : <Volume2 className="h-5 w-5" />}
        {playing ? "Stop" : "Listen in Urdu"}
        <span className="urdu text-base font-normal"> / اردو میں سنے</span>
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}