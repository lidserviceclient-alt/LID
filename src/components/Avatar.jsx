import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

const initialsOf = (name) => {
  const parts = `${name || ""}`.replace(/[@._-]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
};

/** Avatar rond : photo si elle se charge, sinon initiales (jamais d'image cassée ni de texte alternatif visible). */
export default function Avatar({ src, name, className, textClassName }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const showImage = Boolean(src) && !failed;
  return (
    <span
      className={cn("inline-flex items-center justify-center overflow-hidden rounded-full bg-[#6aa200]/15 font-bold text-[#3f6300] dark:text-[#9fd63a]", className)}
      role="img"
      aria-label={name ? `Avatar de ${name}` : "Avatar"}
    >
      {showImage ? (
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true" className={cn("select-none text-sm", textClassName)}>{initialsOf(name)}</span>
      )}
    </span>
  );
}
