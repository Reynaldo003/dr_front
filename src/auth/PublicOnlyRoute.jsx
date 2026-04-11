import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function PublicOnlyRoute({ children }) {
    const { isAuthenticated, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm">
                Cargando sesión...
            </div>
        );
    }

    // Solo bloquea si ya existe sesión ADMIN.
    // La sesión de cliente no debe afectar la ruta /login del panel.
    if (isAuthenticated) {
        return <Navigate to="/administrativa" replace />;
    }

    return children ? children : <Outlet />;
}