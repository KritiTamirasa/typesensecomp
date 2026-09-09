import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { CameraIcon } from "./icons";

interface Props {
  onSelect: (file: File) => void;
  previewUrl: string | null;
  loading: boolean;
}

export interface UploadAreaHandle {
  openPicker: () => void;
}

const UploadArea = forwardRef<UploadAreaHandle, Props>(function UploadArea(
  { onSelect, previewUrl, loading },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  useImperativeHandle(ref, () => ({
    openPicker: () => inputRef.current?.click(),
  }));

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onSelect(file);
  }

  return (
    <div>
      <div
        className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl3 border-2 border-dashed transition-colors duration-200 ${
          dragging
            ? "border-forest-medium bg-mint"
            : "border-forest-sage/60 bg-mint/60 hover:border-forest-medium hover:bg-mint"
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload a photo of your fridge or pantry"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => pick(e.target.files)}
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Fridge preview" className="max-h-[380px] w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-soft transition-transform duration-200 group-hover:scale-105">
              <CameraIcon className="h-6 w-6" />
            </span>
            <p className="mt-2 text-base font-bold text-ink">Show us what&rsquo;s inside</p>
            <p className="text-sm text-muted">
              Upload a photo of your fridge or pantry
            </p>
            <span className="btn-primary mt-3">Upload photo</span>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 overflow-hidden bg-forest-deep/40 backdrop-blur-[1px]">
            <div className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-forest-fresh/70 to-transparent animate-scan" />
            <div className="absolute inset-x-0 bottom-6 flex justify-center">
              <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-forest-deep shadow-soft">
                Scanning your ingredients…
              </span>
            </div>
          </div>
        )}
      </div>

      {previewUrl && !loading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-ghost mt-3"
        >
          Add another photo
        </button>
      )}
    </div>
  );
});

export default UploadArea;
