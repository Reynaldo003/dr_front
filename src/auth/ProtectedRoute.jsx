import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children, mode = "admin" }) {
    const {
        isAuthenticated,
        cargando,
        isClienteAuthenticated,
        clienteCargando,
    } = useAuth();

    const location = useLocation();

    const esCliente = mode === "cliente";
    const cargandoSesion = esCliente ? clienteCargando : cargando;
    const autenticado = esCliente ? isClienteAuthenticated : isAuthenticated;

    if (cargandoSesion) {
        return (
            <div className="min-h-screen flex items-center justify-center text-sm">
                Cargando sesión...
            </div>
        );
    }

    if (!autenticado) {
        if (esCliente) {
            const next = `${location.pathname}${location.search}`;
            return (
                <Navigate
                    to={`/account/access?next=${encodeURIComponent(next)}`}
                    replace
                />
            );
        }

        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children ? children : <Outlet />;
}