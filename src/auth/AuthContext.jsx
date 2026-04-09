import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    getClienteSession,
    guardarClienteSession,
    limpiarClienteSession,
    loginCliente as loginClienteApi,
    registrarCliente as registrarClienteApi,
    logoutClienteRequest,
    obtenerClienteActual,
} from "../public-site/lib/apiClientes";
import {
    getAdminSession,
    guardarAdminSession,
    limpiarAdminSession,
    loginAdmin as loginAdminApi,
    logoutAdminRequest,
    obtenerAdminActual,
} from "../admin/services/adminAuthApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [adminToken, setAdminToken] = useState("");
    const [cargando, setCargando] = useState(true);

    const [clienteUser, setClienteUser] = useState(null);
    const [clienteToken, setClienteToken] = useState("");
    const [clienteCargando, setClienteCargando] = useState(true);

    useEffect(() => {
        try {
            const session = getAdminSession();
            if (session?.token && session?.user) {
                setAdminToken(session.token);
                setUser(session.user);
            }
        } catch (error) {
            console.error("Error leyendo la sesión admin:", error);
            limpiarAdminSession();
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        try {
            const session = getClienteSession();
            if (session?.token && session?.cliente) {
                setClienteToken(session.token);
                setClienteUser(session.cliente);
            }
        } catch (error) {
            console.error("Error leyendo la sesión cliente:", error);
            limpiarClienteSession();
        } finally {
            setClienteCargando(false);
        }
    }, []);

    const login = async ({ email, password }) => {
        const data = await loginAdminApi({
            identifier: email,
            password,
        });

        setAdminToken(data.token || "");
        setUser(data.user || null);
        return data.user;
    };

    const logout = async () => {
        await logoutAdminRequest();
        setAdminToken("");
        setUser(null);
    };

    const refrescarAdmin = async () => {
        const token = getAdminSession()?.token || "";
        if (!token) {
            setAdminToken("");
            setUser(null);
            return null;
        }

        const admin = await obtenerAdminActual();
        guardarAdminSession({
            token,
            user: admin,
        });

        setAdminToken(token);
        setUser(admin);
        return admin;
    };

    const loginCliente = async ({ email, password }) => {
        const data = await loginClienteApi({ email, password });
        setClienteToken(data.token || "");
        setClienteUser(data.cliente || null);
        return data.cliente;
    };

    const registroCliente = async ({
        nombre,
        email,
        telefono,
        password,
        confirmar_password,
    }) => {
        const data = await registrarClienteApi({
            nombre,
            email,
            telefono,
            password,
            confirmar_password,
        });

        setClienteToken(data.token || "");
        setClienteUser(data.cliente || null);
        return data.cliente;
    };

    const refrescarCliente = async () => {
        const token = getClienteSession()?.token || "";

        if (!token) {
            setClienteUser(null);
            setClienteToken("");
            return null;
        }

        const cliente = await obtenerClienteActual();

        guardarClienteSession({
            token,
            cliente,
        });

        setClienteToken(token);
        setClienteUser(cliente);
        return cliente;
    };

    const logoutCliente = async () => {
        await logoutClienteRequest();
        setClienteToken("");
        setClienteUser(null);
    };

    const isAuthenticated = !!user && !!adminToken;
    const isClienteAuthenticated = !!clienteUser && !!clienteToken;

    const value = useMemo(() => {
        return {
            // admin
            user,
            adminToken,
            cargando,
            isAuthenticated,
            login,
            logout,
            refrescarAdmin,

            // cliente
            clienteUser,
            clienteToken,
            clienteCargando,
            isClienteAuthenticated,
            loginCliente,
            registroCliente,
            logoutCliente,
            refrescarCliente,
        };
    }, [
        user,
        adminToken,
        cargando,
        isAuthenticated,
        clienteUser,
        clienteToken,
        clienteCargando,
        isClienteAuthenticated,
    ]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth debe usarse dentro de AuthProvider");
    }

    return context;
}