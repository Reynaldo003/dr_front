import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fadeIn"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-end justify-center sm:grid sm:place-items-center sm:p-4">
        <div
          className="
            flex h-[100dvh] w-full flex-col overflow-hidden border bg-white shadow-xl animate-fadeUp
            rounded-none
            sm:h-auto sm:max-h-[calc(100vh-2rem)] sm:max-w-5xl sm:rounded-2xl
          "
        >
          <div className="flex items-start justify-between gap-3 border-b p-4 sm:p-5 shrink-0">
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold break-words">{title}</div>
              {subtitle && (
                <div className="mt-1 text-xs sm:text-sm text-zinc-500 break-words">
                  {subtitle}
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border p-2 hover:bg-zinc-50 active:scale-[0.98] transition shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5">
            {children}
          </div>

          {footer && (
            <div className="shrink-0 border-t bg-zinc-50 p-4 sm:p-5">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}