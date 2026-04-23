import { useEffect } from "react";
import { X } from "lucide-react";

export default function Sheet({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar"
      />

      <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl border-t bg-white shadow-2xl animate-sheetUp">
        <div className="border-b px-4 pt-4 pb-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-semibold break-words">{title}</div>
              {subtitle && (
                <div className="mt-1 text-xs text-zinc-500 break-words">{subtitle}</div>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border p-2 text-sm hover:bg-zinc-50 shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
          {children}
        </div>

        {footer && <div className="border-t px-4 py-3 shrink-0 bg-zinc-50">{footer}</div>}
      </div>
    </div>
  );
}