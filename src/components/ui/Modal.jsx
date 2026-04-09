import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ open, title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
      />

      {/* panel */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border bg-white shadow-xl animate-fadeUp">
          <div className="flex items-start justify-between gap-3 p-5 border-b">
            <div>
              <div className="text-lg font-semibold">{title}</div>
              {subtitle && <div className="text-sm text-zinc-500">{subtitle}</div>}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border p-2 hover:bg-zinc-50 active:scale-[0.98] transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5">{children}</div>

          {footer && <div className="p-5 border-t bg-zinc-50 rounded-b-2xl">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
