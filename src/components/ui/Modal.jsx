import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import Button from "./Button";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  size = "md"
}) {
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

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full m-4"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "bg-background rounded-xl shadow-lg w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200",
          sizes[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t bg-muted/50 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
