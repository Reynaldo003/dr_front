import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../context/cart";
import { crearCheckoutMercadoPago } from "../../lib/apiPublic";
import {
  obtenerClienteActual,
  obtenerMisDirecciones,
} from "../../lib/apiClientes";

function money(n) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(n || 0));
}

const TIPOS_ENVIO = [
  {
    id: "ESTANDAR",
    nombre: "Envío estándar nacional",
    tiempo: "2 a 7 días hábiles",
    costo: 150,
  },
  {
    id: "EXPRESS",
    nombre: "Envío nacional express",
    tiempo: "2 a 4 días hábiles",
    costo: 250,
  },
  {
    id: "DIA_SIGUIENTE",
    nombre: "Envío día siguiente nacional",
    tiempo: "24 a 48 horas hábiles",
    costo: 399,
  },
];

const initialForm = {
  direccion_id: "",
  tipo_envio: "ESTANDAR",
  cliente: "",
  cliente_email: "",
  cliente_telefono: "",
  direccion_linea1: "",
  direccion_linea2: "",
  ciudad: "",
  estado_direccion: "",
  codigo_postal: "",
  referencias_envio: "",
};

export default function CheckoutPage() {
  const { items } = useCart();

  const [form, setForm] = useState(initialForm);
  const [direcciones, setDirecciones] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const detalles = useMemo(() => {
    return (items || []).map((it) => ({
      producto_id: it.productId ?? it.product?.id,
      color: it.colorName ?? it.color?.name ?? "",
      talla: it.size ?? "",
      cantidad: Number(it.qty || 1),
    }));
  }, [items]);

  const subtotalProductos = useMemo(() => {
    return (items || []).reduce(
      (acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0),
      0,
    );
  }, [items]);

  const envioGratis = subtotalProductos >= 1500;

  const costoEnvio = useMemo(() => {
    if (envioGratis) return 0;
    const envio = TIPOS_ENVIO.find((x) => x.id === form.tipo_envio);
    return Number(envio?.costo || 0);
  }, [envioGratis, form.tipo_envio]);

  const totalFinal = subtotalProductos + costoEnvio;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setCargandoDatos(true);
        setError("");

        const [cliente, misDirecciones] = await Promise.all([
          obtenerClienteActual(),
          obtenerMisDirecciones(),
        ]);

        if (!alive) return;

        const dirs = Array.isArray(misDirecciones) ? misDirecciones : [];
        const principal = dirs.find((d) => d.principal) || dirs[0] || null;

        setDirecciones(dirs);
        setForm((prev) => ({
          ...prev,
          cliente: cliente?.nombre || "",
          cliente_email: cliente?.email || "",
          cliente_telefono: cliente?.telefono || "",
          direccion_id: principal ? String(principal.id) : "",
          direccion_linea1: principal?.direccion_linea1 || "",
          direccion_linea2: principal?.direccion_linea2 || "",
          ciudad: principal?.ciudad || "",
          estado_direccion: principal?.estado_direccion || "",
          codigo_postal: principal?.codigo_postal || "",
          referencias_envio: principal?.referencias_envio || "",
        }));
      } catch (err) {
        if (!alive) return;
        setError(err.message || "No se pudieron cargar los datos del checkout.");
      } finally {
        if (alive) setCargandoDatos(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDireccionChange = (e) => {
    const value = e.target.value;
    const direccion = direcciones.find((d) => String(d.id) === String(value));

    if (!direccion) {
      setForm((prev) => ({
        ...prev,
        direccion_id: "",
        direccion_linea1: "",
        direccion_linea2: "",
        ciudad: "",
        estado_direccion: "",
        codigo_postal: "",
        referencias_envio: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      direccion_id: String(direccion.id),
      direccion_linea1: direccion.direccion_linea1 || "",
      direccion_linea2: direccion.direccion_linea2 || "",
      ciudad: direccion.ciudad || "",
      estado_direccion: direccion.estado_direccion || "",
      codigo_postal: direccion.codigo_postal || "",
      referencias_envio: direccion.referencias_envio || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!detalles.length) {
      setError("Tu carrito está vacío.");
      return;
    }

    try {
      setCargando(true);
      setError("");

      const payload = {
        direccion_id: form.direccion_id ? Number(form.direccion_id) : undefined,
        tipo_envio: form.tipo_envio,
        cliente: form.cliente.trim(),
        cliente_email: form.cliente_email.trim(),
        cliente_telefono: form.cliente_telefono.trim(),
        direccion_linea1: form.direccion_linea1.trim(),
        direccion_linea2: form.direccion_linea2.trim(),
        ciudad: form.ciudad.trim(),
        estado_direccion: form.estado_direccion.trim(),
        codigo_postal: form.codigo_postal.trim(),
        referencias_envio: form.referencias_envio.trim(),
        detalles,
      };

      const data = await crearCheckoutMercadoPago(payload);
      const checkoutUrl = data.init_point || data.sandbox_init_point;

      if (!checkoutUrl) {
        throw new Error("No se recibió la URL de pago.");
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message || "No se pudo iniciar el pago.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-[1.2fr_420px]">
      <section>
        <h1 className="text-3xl font-extrabold tracking-tight">Finalizar compra</h1>
        <p className="mt-2 text-gray-600">
          Revisa tus datos, selecciona tu envío y continúa al pago con Mercado Pago.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-3xl border p-5">
            <h2 className="text-lg font-bold">Datos del cliente</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="cliente"
                value={form.cliente}
                onChange={handleChange}
                placeholder="Nombre completo"
                className="h-12 rounded-2xl border px-4"
                required
              />
              <input
                name="cliente_email"
                type="email"
                value={form.cliente_email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                className="h-12 rounded-2xl border px-4"
                required
              />
              <input
                name="cliente_telefono"
                value={form.cliente_telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="h-12 rounded-2xl border px-4"
              />
            </div>
          </div>

          <div className="rounded-3xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Dirección de envío</h2>
              <a
                href="/account/addresses"
                className="text-sm font-semibold underline underline-offset-4"
              >
                Administrar direcciones
              </a>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Dirección guardada
                </label>
                <select
                  name="direccion_id"
                  value={form.direccion_id}
                  onChange={handleDireccionChange}
                  className="h-12 w-full rounded-2xl border bg-white px-4"
                >
                  <option value="">Capturar manualmente</option>
                  {direcciones.map((dir) => (
                    <option key={dir.id} value={dir.id}>
                      {(dir.alias || dir.destinatario || "Dirección")} · {dir.direccion_linea1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  name="direccion_linea1"
                  value={form.direccion_linea1}
                  onChange={handleChange}
                  placeholder="Calle y número"
                  className="h-12 rounded-2xl border px-4 md:col-span-2"
                  required
                />
                <input
                  name="direccion_linea2"
                  value={form.direccion_linea2}
                  onChange={handleChange}
                  placeholder="Colonia / interior / referencias breves"
                  className="h-12 rounded-2xl border px-4 md:col-span-2"
                />
                <input
                  name="ciudad"
                  value={form.ciudad}
                  onChange={handleChange}
                  placeholder="Ciudad"
                  className="h-12 rounded-2xl border px-4"
                  required
                />
                <input
                  name="estado_direccion"
                  value={form.estado_direccion}
                  onChange={handleChange}
                  placeholder="Estado"
                  className="h-12 rounded-2xl border px-4"
                  required
                />
                <input
                  name="codigo_postal"
                  value={form.codigo_postal}
                  onChange={handleChange}
                  placeholder="Código postal"
                  className="h-12 rounded-2xl border px-4"
                />
                <textarea
                  name="referencias_envio"
                  value={form.referencias_envio}
                  onChange={handleChange}
                  placeholder="Referencias adicionales para la entrega"
                  className="rounded-2xl border px-4 py-3 md:col-span-2"
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border p-5">
            <h2 className="text-lg font-bold">Tipo de envío</h2>

            <div className="mt-4 space-y-3">
              {TIPOS_ENVIO.map((envio) => {
                const activo = form.tipo_envio === envio.id;
                const precioVisible = envioGratis ? 0 : envio.costo;

                return (
                  <label
                    key={envio.id}
                    className={[
                      "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4",
                      activo ? "border-black bg-black/[0.03]" : "border-black/10",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="tipo_envio"
                        value={envio.id}
                        checked={activo}
                        onChange={handleChange}
                        className="mt-1"
                      />

                      <div>
                        <div className="font-semibold">{envio.nombre}</div>
                        <div className="text-sm text-gray-500">{envio.tiempo}</div>
                      </div>
                    </div>

                    <div className="text-right font-semibold">
                      {envioGratis ? "Gratis" : money(precioVisible)}
                    </div>
                  </label>
                );
              })}
            </div>

            {envioGratis ? (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Tu compra ya tiene envío gratis por superar los $1,500.00 MXN.
              </div>
            ) : null}
          </div>

          {cargandoDatos ? (
            <div className="rounded-2xl border bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Cargando datos del cliente...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={cargando || !items.length || cargandoDatos}
            className="h-12 rounded-full bg-black px-6 font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {cargando ? "Redirigiendo..." : "Continuar a Mercado Pago"}
          </button>
        </form>
      </section>

      <aside className="h-fit rounded-3xl border p-5">
        <h2 className="text-lg font-bold">Resumen del pedido</h2>

        <div className="mt-4 space-y-4">
          {(items || []).map((it) => (
            <div key={it.key} className="flex gap-3 rounded-2xl border p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {it.image ? (
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="flex-1">
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-500">
                  {it.colorName ? `${it.colorName} · ` : ""}
                  {it.size ? `Talla ${it.size} · ` : ""}
                  Cantidad: {it.qty}
                </div>
              </div>

              <div className="font-semibold">{money(it.price * it.qty)}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{money(subtotalProductos)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              Envío{" "}
              {form.tipo_envio
                ? `(${TIPOS_ENVIO.find((x) => x.id === form.tipo_envio)?.nombre || ""})`
                : ""}
            </span>
            <span className="font-semibold">
              {envioGratis ? "Gratis" : money(costoEnvio)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-extrabold">{money(totalFinal)}</span>
          </div>
        </div>
      </aside>
    </main>
  );
}