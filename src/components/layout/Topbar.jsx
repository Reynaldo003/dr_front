import { Search, Menu } from "lucide-react";

export default function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <button
          onClick={onMenu}
          className="lg:hidden inline-flex items-center justify-center rounded-xl border px-3 py-2 hover:bg-zinc-50"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        {/* Search responsive */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
            placeholder="Buscar..."
          />
        </div>
      </div>
    </header>
  );
}
