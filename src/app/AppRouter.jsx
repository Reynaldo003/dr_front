//src/app/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoute.jsx";
import PublicOnlyRoute from "../auth/PublicOnlyRoute.jsx";

import LoginPage from "../pages/LoginPage.jsx";

import AdminLayout from "../admin/layout/AdminLayout.jsx";
import Dashboard from "../admin/pages/Dashboard.jsx";
import Productos from "../admin/pages/Productos.jsx";
import Ventas from "../admin/pages/Ventas.jsx";
import Rendimiento from "../admin/pages/Reportes.jsx";
import Comentarios from "../admin/pages/CommentsAdmin.jsx";
import RebajasAdmin from "../admin/pages/RebajasAdmin.jsx";
import NewArrivalsAdmin from "../admin/pages/NewArrivalsAdmin.jsx";
import Clientes from "../admin/pages/Clientes.jsx";

import PublicRoutes from "../public-site/PublicRoutes.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/administrativa"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="rebajas" element={<RebajasAdmin />} />
        <Route path="new-arrivals" element={<NewArrivalsAdmin />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="rendimiento" element={<Rendimiento />} />
        <Route path="comentarios" element={<Comentarios />} />
      </Route>

      <Route path="/*" element={<PublicRoutes />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}