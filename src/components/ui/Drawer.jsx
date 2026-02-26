import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "./Button";

export default function Drawer({ isOpen, onClose, title, children, className, width = "w-[28rem]" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute inset-y-0 right-0 bg-background border-l border-border shadow-xl flex flex-col transition-transform duration-300 ease-in-out",
          width,
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold tracking-tight truncate">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

