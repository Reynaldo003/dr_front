//src/public-site/components/AuthModal.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function AuthModal({ open, onClose, next = "/account", onSuccess }) {
  const navigate = useNavigate();
  const { loginCliente, registroCliente } = useAuth();

  const [vista, setVista] = useState("inicio");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registroData, setRegistroData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    confirmar_password: "",
  });

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setVista("inicio");
      setCargando(false);
      setError("");
      setLoginData({
        email: "",
        password: "",
      });
      setRegistroData({
        nombre: "",
        email: "",
        telefono: "",
        password: "",
        confirmar_password: "",
      });
    }
  }, [open]);

  if (!open) return null;

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

  const resolverExito = () => {
    onClose?.();
    if (onSuccess) {
      onSuccess();
      return;
    }
    navigate(next);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      setCargando(true);
      setError("");
      await loginCliente(loginData);
      resolverExito();
    } catch (error) {
      setError(error.message || "No se pudo iniciar sesión.");
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
      resolverExito();
    } catch (error) {
      setError(error.message || "No se pudo crear la cuenta.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <div className="absolute inset-0 grid place-items-center p-4">
        <div
          className="w-full max-w-md overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[11px] font-semibold text-black/70">
                Acceso
                <span className="h-1 w-1 rounded-full bg-black/40" />
                Cuenta cliente
              </div>

              <h3 className="mt-3 text-xl font-extrabold tracking-tight">
                {vista === "inicio" && "Accede a tu cuenta"}
                {vista === "login" && "Iniciar sesión"}
                {vista === "registro" && "Crear cuenta"}
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-black/60">
                {vista === "inicio" && "Inicia sesión o crea tu cuenta para continuar con tu compra."}
                {vista === "login" && "Ingresa tus datos para acceder a tu cuenta."}
                {vista === "registro" && "Completa tus datos para crear tu cuenta."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/5"
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="bg-[#212121] px-6 py-6">
            {vista === "inicio" && (
              <>
                <div className="mb-4 text-left">
                  <p className="text-sm font-semibold leading-tight text-white/90">
                    Continuar
                  </p>
                  <p className="text-xs text-white/60">
                    Elige cómo quieres acceder.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVista("login");
                      setError("");
                    }}
                    className="w-full rounded-2xl border border-cyan-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    Iniciar sesión
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVista("registro");
                      setError("");
                    }}
                    className="w-full rounded-2xl border border-orange-400 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    Registrarme
                  </button>
                </div>
              </>
            )}

            {vista !== "inicio" && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVista("login");
                      setError("");
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${vista === "login"
                      ? "bg-white text-black"
                      : "border border-white/20 text-white hover:bg-white/10"
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
                      ? "bg-white text-black"
                      : "border border-white/20 text-white hover:bg-white/10"
                      }`}
                  >
                    Registrarme
                  </button>
                </div>

                {vista === "login" && (
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
                )}

                {vista === "registro" && (
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

                <button
                  type="button"
                  onClick={() => {
                    setVista("inicio");
                    setError("");
                  }}
                  className="mt-4 text-xs text-white/60 underline underline-offset-4 hover:text-white"
                >
                  Volver
                </button>
              </>
            )}

            <p className="mt-4 text-left text-[11px] leading-relaxed text-white/55">
              Al continuar aceptas nuestras políticas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}