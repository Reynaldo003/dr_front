// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loadingUser } = useAuth();
  const location = useLocation();

  if (loadingUser) {
    return <div className="p-4">Cargando...</div>;
  }

  // Si no hay sesión, manda al tracking (público) y guarda a dónde quería ir
  if (!user) {
    return <Navigate to="/help/tracking" replace state={{ from: location }} />;
  }

  return children;
}