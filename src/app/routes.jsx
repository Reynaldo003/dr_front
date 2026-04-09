//dr_front/src/app/routes.jsx
import Dashboard from "../pages/Dashboard";
import Ventas from "../pages/Ventas";
import Productos from "../pages/Productos";
import Reportes from "../pages/Reportes";


export const adminRoutes = [
  { path: "/admin", element: <Dashboard /> },
  { path: "/admin/ventas", element: <Ventas /> },
  { path: "/admin/productos", element: <Productos /> },
  { path: "/admin/reportes", element: <Reportes /> },

];
