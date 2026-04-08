import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import { backofficeApi } from "../../services/api.js";

const API_BASE_URL = import.meta.env.VITE_BACKOFFICE_API_URL || "http://localhost:9000";

function resolveBackendUrl(value) {
  const raw = `${value || ""}`.trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  try {
    return new URL(raw, API_BASE_URL).toString();
  } catch {
    return raw;
  }
}

export default function CategoryImageUpload({ value, onChange, disabled }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const pick = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const upload = async (file) => {
    setError("");
    setUploading(true);
    try {
      let res;
      try {
        res = await backofficeApi.uploadCategoryImage(file);
      } catch (e) {
        const message = e?.message || "";
        if (!message.toLowerCase().includes("existe déjà") || !window.confirm(`${message}\n\nVoulez-vous écraser cette image ?`)) {
          throw e;
        }
        res = await backofficeApi.uploadCategoryImage(file, { overwrite: true });
      }
      const url = res?.url || res;
      if (!url) throw new Error("Upload terminé, mais URL manquante.");
      onChange(url);
    } catch (e) {
      setError(e?.message || "Upload impossible.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {value ? (
          <img
            src={resolveBackendUrl(value)}
            alt=""
            className="h-12 w-12 rounded object-cover border border-border"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/imgs/wall-1.jpg";
            }}
          />
        ) : (
          <div className="h-12 w-12 rounded border border-dashed border-border bg-muted/30" />
        )}

        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={pick} disabled={disabled || uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Upload..." : value ? "Changer" : "Uploader"}
          </Button>
          {value ? (
            <Button
              variant="ghost"
              type="button"
              onClick={() => onChange("")}
              disabled={disabled || uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            if (e.target) e.target.value = "";
          }}
          disabled={disabled || uploading}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
