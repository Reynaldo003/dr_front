import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, FileText, BarChart3 } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/ventas", label: "Ventas", icon: ShoppingCart },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/reportes", label: "Reportes", icon: FileText },
];

export default function Sidebar({ onNavigate }) {
  return (
    <div className="h-full p-4">
      <div className="mb-6">
        <div className="text-lg font-semibold">Boutique</div>
        <div className="text-xs text-zinc-500">Admin</div>
      </div>

      <nav className="space-y-2">
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
                  isActive ? "bg-zinc-900 text-white" : "hover:bg-zinc-50 text-zinc-800",
                ].join(" ")
              }
            >
              <Icon size={18} />
              {l.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
