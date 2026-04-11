import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const rutaDestino = location.state?.from?.pathname || "/administrativa";

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setEnviando(true);

        try {
            await login(form);
            navigate(rutaDestino, { replace: true });
        } catch (err) {
            setError(err.message || "No se pudo iniciar sesión");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Accede al panel administrativo
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo o usuario
                        </label>
                        <input
                            type="text"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            placeholder="admin@correo.com o usuario"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            placeholder="********"
                            required
                        />
                    </div>

                    {error ? (
                        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={enviando}
                        className="w-full rounded-xl bg-black text-white py-3 font-medium hover:opacity-90 disabled:opacity-60"
                    >
                        {enviando ? "Ingresando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}