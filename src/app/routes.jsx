//dr_front/src/app/routes.jsx
import Dashboard from "../pages/Dashboard";
import Ventas from "../pages/Ventas";
import Productos from "../pages/Productos";
import Reportes from "../pages/Reportes";


export const adminRoutes = [
  { path: "/administrativa", element: <Dashboard /> },
  { path: "/administrativa/ventas", element: <Ventas /> },
  { path: "/administrativa/productos", element: <Productos /> },
  { path: "/administrativa/reportes", element: <Reportes /> },

];
