// dr_front/src/admin/layout/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block border-r bg-white">
          <Sidebar />
        </aside>

        <div className="min-w-0">
          <Topbar onMenu={() => setOpen(true)} />

          <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
          />

          <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] border-r bg-white shadow-xl animate-slideIn">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="font-semibold">Boutique Admin</div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50"
              >
                Cerrar
              </button>
            </div>

            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}