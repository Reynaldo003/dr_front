export default function Sheet({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl border-t shadow-2xl animate-sheetUp">
        <div className="px-4 pt-4 pb-3 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-semibold truncate">{title}</div>
              {subtitle && <div className="text-xs text-zinc-500">{subtitle}</div>}
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border px-3 py-1 text-sm hover:bg-zinc-50"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="px-4 py-4 max-h-[70vh] overflow-auto">{children}</div>

        {footer && <div className="px-4 py-3 border-t">{footer}</div>}
      </div>
    </div>
  );
}
