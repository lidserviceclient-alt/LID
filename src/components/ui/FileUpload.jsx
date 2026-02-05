import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { uploadPublicFile } from "../../services/storage.js";

export default function FileUpload({ label, value, onChange, accept = "image/*", maxFiles = 1 }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const file = files[0];
    if (!file) return;
    if (uploading) return;

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError("Fichier trop volumineux (max 2MB).");
      return;
    }

    setUploadError("");
    setUploading(true);
    setProgress(0);

    try {
      const { url } = await uploadPublicFile(file, { folder: "products", onProgress: setProgress });
      onChange(url);
    } catch (e) {
      setUploadError(e?.message || "Upload impossible.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (uploading) return;
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      {label && <label className="mb-2 block text-sm font-medium text-foreground">{label}</label>}
      
      {!value ? (
        <div
          className={cn(
            "relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
            uploading ? "pointer-events-none opacity-70" : ""
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            {uploading ? (
              <div className="w-full max-w-xs space-y-2">
                <p className="text-sm text-foreground">Upload en cours… {progress}%</p>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : (
              <>
                <p className="mb-2 text-sm text-foreground">
                  <span className="font-semibold">Cliquez pour upload</span> ou glissez-déposez
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG ou GIF (MAX. 2MB)</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-muted/30">
          <img 
            src={value} 
            alt="Preview" 
            className="h-full w-full object-contain" 
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
    </div>
  );
}
