import { Camera } from "lucide-react";
import type { ChangeEvent } from "react";
import { Button } from "../ui/Button.js";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
  };

  return (
    <label className="w-full">
      <input type="file" accept="image/*" capture="environment" onChange={handleChange} className="sr-only" />
      <Button variant="secondary" className="w-full" asChild>
        <span>
          <Camera className="h-5 w-5" />
          Take a Photo
          <span className="urdu text-sm font-normal"> / تصویر لیں</span>
        </span>
      </Button>
    </label>
  );
}
