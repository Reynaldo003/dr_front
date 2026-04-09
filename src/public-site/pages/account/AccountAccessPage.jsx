import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/AuthContext";

const initialLogin = {
    email: "",
    password: "",
};

const initialRegistro = {
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmar_password: "",
};

export default function AccountAccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const {
        isClienteAuthenticated,
        clienteCargando,
        loginCliente,
        registroCliente,
    } = useAuth();

    const [vista, setVista] = useState("login");
    const [loginData, setLoginData] = useState(initialLogin);
    const [registroData, setRegistroData] = useState(initialRegistro);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const next = useMemo(() => {
        return searchParams.get("next") || "/account";
    }, [searchParams]);

    useEffect(() => {
        if (!clienteCargando && isClienteAuthenticated) {
            navigate(next, { replace: true });
        }
    }, [clienteCargando, isClienteAuthenticated, navigate, next]);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRegistroChange = (e) => {
        const { name, value } = e.target;
        setRegistroData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            setCargando(true);
            setError("");
            await loginCliente(loginData);
            navigate(next, { replace: true });
        } catch (err) {
            setError(err.message || "No se pudo iniciar sesión.");
        } finally {
            setCargando(false);
        }
    };

    const handleRegistroSubmit = async (e) => {
        e.preventDefault();

        if (registroData.password !== registroData.confirmar_password) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setCargando(true);
            setError("");
            await registroCliente(registroData);
            navigate(next, { replace: true });
        } catch (err) {
            setError(err.message || "No se pudo crear la cuenta.");
        } finally {
            setCargando(false);
        }
    };

    if (clienteCargando) {
        return (
            <main className="mx-auto max-w-md px-4 py-14">
                <div className="rounded-3xl border bg-white p-6">Cargando sesión...</div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-md px-4 py-14">
            <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-2xl">
                <div className="px-6 pt-6 pb-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-black/70">
                        Cuenta cliente
                        <span className="h-1 w-1 rounded-full bg-black/40" />
                        Boutique
                    </div>

                    <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
                        {vista === "login" ? "Iniciar sesión" : "Crear cuenta"}
                    </h1>

                    <p className="mt-2 text-sm text-black/60">
                        Accede para guardar tus direcciones, ver tus pedidos y terminar tu compra más rápido.
                    </p>
                </div>

                <div className="px-6 pb-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setVista("login");
                                setError("");
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${vista === "login"
                                    ? "bg-black text-white"
                                    : "border border-black/10 hover:bg-black/5"
                                }`}
                        >
                            Iniciar sesión
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setVista("registro");
                                setError("");
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${vista === "registro"
                                    ? "bg-black text-white"
                                    : "border border-black/10 hover:bg-black/5"
                                }`}
                        >
                            Registrarme
                        </button>
                    </div>
                </div>

                <div className="bg-[#212121] px-6 py-6">
                    {vista === "login" ? (
                        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                            <input
                                type="email"
                                name="email"
                                value={loginData.email}
                                onChange={handleLoginChange}
                                placeholder="Correo electrónico"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                value={loginData.password}
                                onChange={handleLoginChange}
                                placeholder="Contraseña"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                                required
                            />

                            {error ? (
                                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={cargando}
                                className="mt-2 w-full rounded-2xl border border-cyan-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-60"
                            >
                                {cargando ? "Entrando..." : "Iniciar sesión"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegistroSubmit} className="flex flex-col gap-3">
                            <input
                                type="text"
                                name="nombre"
                                value={registroData.nombre}
                                onChange={handleRegistroChange}
                                placeholder="Nombre completo"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                value={registroData.email}
                                onChange={handleRegistroChange}
                                placeholder="Correo electrónico"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                                required
                            />

                            <input
                                type="text"
                                name="telefono"
                                value={registroData.telefono}
                                onChange={handleRegistroChange}
                                placeholder="Teléfono"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                            />

                            <input
                                type="password"
                                name="password"
                                value={registroData.password}
                                onChange={handleRegistroChange}
                                placeholder="Contraseña"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                                required
                            />

                            <input
                                type="password"
                                name="confirmar_password"
                                value={registroData.confirmar_password}
                                onChange={handleRegistroChange}
                                placeholder="Confirmar contraseña"
                                className="h-12 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-white/50"
                                required
                            />

                            {error ? (
                                <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                    {error}
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={cargando}
                                className="mt-2 w-full rounded-2xl border border-orange-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-60"
                            >
                                {cargando ? "Registrando..." : "Crear cuenta"}
                            </button>
                        </form>
                    )}

                    <p className="mt-4 text-left text-[11px] leading-relaxed text-white/55">
                        Después de iniciar sesión volverás automáticamente al paso donde te quedaste.
                    </p>
                </div>
            </div>
        </main>
    );
}