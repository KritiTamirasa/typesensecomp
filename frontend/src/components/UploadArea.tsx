import { useRef, useState } from "react";

interface Props {
  onSelect: (file: File) => void;
  previewUrl: string | null;
  loading: boolean;
}

export default function UploadArea({ onSelect, previewUrl, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function pick(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) onSelect(file);
  }

  return (
    <div
      className={`upload-area${dragging ? " dragging" : ""}`}
      onClick={() => inputRef.current?.click()}
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
        <img src={previewUrl} alt="fridge preview" className="preview" />
      ) : (
        <div className="upload-hint">
          <div className="upload-icon">📸</div>
          <p>
            <strong>Drop a fridge photo here</strong>
          </p>
          <p className="muted">or click to browse</p>
        </div>
      )}
      {loading && <div className="upload-overlay">Detecting ingredients…</div>}
    </div>
  );
}
