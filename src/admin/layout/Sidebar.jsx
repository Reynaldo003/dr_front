import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  MessageSquareText,
  BadgePercent,
  Sparkles,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/ventas", label: "Ventas", icon: ShoppingCart },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/rebajas", label: "Rebajas", icon: BadgePercent },
  { to: "/admin/new-arrivals", label: "New Arrivals", icon: Sparkles },
  { to: "/admin/rendimiento", label: "Reportes", icon: FileText },
  { to: "/admin/comentarios", label: "Comentarios", icon: MessageSquareText },
];

export default function Sidebar({ onNavigate }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const displayName =
    user?.full_name || user?.username || user?.email || "Administrador";

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="mb-6">
        <div className="text-lg font-semibold">Boutique</div>
        <div className="text-xs text-zinc-500">Admin</div>
        <div className="mt-3 rounded-xl border bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
          {displayName}
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {links.map((l) => {
          const Icon = l.icon;

          return (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "hover:bg-zinc-50 text-zinc-800",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {l.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
      >
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </div>
  );
}