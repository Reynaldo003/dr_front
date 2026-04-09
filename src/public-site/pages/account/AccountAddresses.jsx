import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  actualizarDireccion,
  crearDireccion,
  eliminarDireccion,
  obtenerMisDirecciones,
} from "../../lib/apiClientes";

function Input({ icon, ...props }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/35">
        {icon}
      </div>
      <input
        {...props}
        className={[
          "w-full rounded-2xl border bg-white px-11 py-3 outline-none",
          "focus:ring-2 focus:ring-black/10 focus:border-black/20",
          "placeholder:text-black/35",
        ].join(" ")}
      />
    </div>
  );
}

function Textarea({ icon, ...props }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-4 top-4 text-black/35">
        {icon}
      </div>
      <textarea
        {...props}
        className={[
          "w-full rounded-2xl border bg-white px-11 py-3 outline-none min-h-[110px]",
          "focus:ring-2 focus:ring-black/10 focus:border-black/20",
          "placeholder:text-black/35",
        ].join(" ")}
      />
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
      {children}
    </span>
  );
}

const initialForm = {
  alias: "",
  destinatario: "",
  telefono: "",
  direccion_linea1: "",
  direccion_linea2: "",
  ciudad: "",
  estado_direccion: "",
  codigo_postal: "",
  referencias_envio: "",
  principal: false,
};

export default function AccountAddresses() {
  const nav = useNavigate();

  const [list, setList] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const cargarDirecciones = async () => {
    try {
      setCargando(true);
      setError("");
      const data = await obtenerMisDirecciones();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No se pudieron cargar las direcciones.");
      setList([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const editing = useMemo(
    () => list.find((x) => x.id === editingId) || null,
    [list, editingId],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (addr) => {
    setEditingId(addr.id);
    setForm({
      alias: addr.alias || "",
      destinatario: addr.destinatario || "",
      telefono: addr.telefono || "",
      direccion_linea1: addr.direccion_linea1 || "",
      direccion_linea2: addr.direccion_linea2 || "",
      ciudad: addr.ciudad || "",
      estado_direccion: addr.estado_direccion || "",
      codigo_postal: addr.codigo_postal || "",
      referencias_envio: addr.referencias_envio || "",
      principal: Boolean(addr.principal),
    });
    setError("");
    setOpen(true);
  };

  const remove = async (id) => {
    const ok = confirm("¿Eliminar esta dirección?");
    if (!ok) return;

    try {
      await eliminarDireccion(id);
      await cargarDirecciones();
    } catch (err) {
      alert(err.message || "No se pudo eliminar la dirección.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (
      !form.direccion_linea1.trim() ||
      !form.ciudad.trim() ||
      !form.estado_direccion.trim()
    ) {
      setError("Completa al menos: Dirección, Ciudad y Estado.");
      return;
    }

    const payload = {
      alias: form.alias.trim(),
      destinatario: form.destinatario.trim(),
      telefono: form.telefono.trim(),
      direccion_linea1: form.direccion_linea1.trim(),
      direccion_linea2: form.direccion_linea2.trim(),
      ciudad: form.ciudad.trim(),
      estado_direccion: form.estado_direccion.trim(),
      codigo_postal: form.codigo_postal.trim(),
      referencias_envio: form.referencias_envio.trim(),
      principal: Boolean(form.principal),
      activa: true,
    };

    try {
      setGuardando(true);
      setError("");

      if (editingId) {
        await actualizarDireccion(editingId, payload);
      } else {
        await crearDireccion(payload);
      }

      setOpen(false);
      setEditingId(null);
      setForm(initialForm);
      await cargarDirecciones();
    } catch (err) {
      setError(err.message || "No se pudo guardar la dirección.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-left">
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => nav("/account")}
          className="w-10 h-10 rounded-full border hover:bg-black/5 transition flex items-center justify-center"
          aria-label="Volver"
          title="Volver"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-extrabold">Direcciones</h1>
          <p className="text-sm text-black/60">Administra tus direcciones para comprar más rápido.</p>
        </div>
      </div>

      <div className="rounded-3xl border bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div>
          <p className="font-extrabold">Tus direcciones</p>
          <p className="text-sm text-black/60">Agrega una dirección principal y usa checkout más rápido.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl bg-black text-white px-4 py-3 font-semibold hover:opacity-90 transition"
        >
          + Agregar
        </button>
      </div>

      {error && !open ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {cargando ? (
          <div className="rounded-3xl border bg-white p-5">
            <p className="font-semibold">Cargando direcciones...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-3xl border bg-white p-5">
            <p className="font-semibold">No tienes direcciones guardadas.</p>
            <p className="text-sm text-black/60 mt-1">Presiona “Agregar” para crear tu primera dirección.</p>
          </div>
        ) : (
          list.map((a) => (
            <div key={a.id} className="rounded-3xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-extrabold truncate">
                    {a.alias || a.destinatario || "Dirección"}
                    {a.principal ? (
                      <span className="ml-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        Principal
                      </span>
                    ) : null}
                  </p>

                  {a.destinatario ? (
                    <p className="text-sm text-black/70 mt-1">{a.destinatario}</p>
                  ) : null}

                  <p className="text-sm text-black/70 mt-1">{a.direccion_linea1}</p>

                  {a.direccion_linea2 ? (
                    <p className="text-sm text-black/60">{a.direccion_linea2}</p>
                  ) : null}

                  <p className="text-sm text-black/60">
                    {a.ciudad}, {a.estado_direccion} {a.codigo_postal || ""}
                  </p>

                  {a.telefono ? (
                    <p className="text-sm text-black/60 mt-1">📞 {a.telefono}</p>
                  ) : null}

                  {a.referencias_envio ? (
                    <p className="text-xs text-black/60 mt-2">Referencia: {a.referencias_envio}</p>
                  ) : null}
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(a)}
                    className="rounded-2xl border px-3 py-2 text-sm font-semibold hover:bg-black/5 transition"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    className="rounded-2xl border px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[9999]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />

          <div className="absolute inset-0 grid place-items-center p-4">
            <div className="w-full max-w-2xl rounded-[28px] bg-white border shadow-2xl overflow-hidden">
              <div className="relative px-6 py-5 bg-gradient-to-r from-black to-zinc-900 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs opacity-90">Direcciones</p>
                    <p className="text-2xl font-extrabold leading-tight mt-1">
                      {editing ? "Editar dirección" : "Nueva dirección"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Chip>📦 Envíos rápidos</Chip>
                      <Chip>🧾 Datos completos</Chip>
                      <Chip>✅ Guardado seguro</Chip>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="w-11 h-11 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition flex items-center justify-center"
                    aria-label="Cerrar"
                    title="Cerrar"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={submit} className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    icon="🏷️"
                    placeholder="Alias (Casa, Oficina, etc.)"
                    value={form.alias}
                    onChange={(e) => setForm((s) => ({ ...s, alias: e.target.value }))}
                  />
                  <Input
                    icon="👤"
                    placeholder="Destinatario"
                    value={form.destinatario}
                    onChange={(e) => setForm((s) => ({ ...s, destinatario: e.target.value }))}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    icon="📞"
                    placeholder="Teléfono"
                    value={form.telefono}
                    onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))}
                  />
                  <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
                    <input
                      id="principal"
                      type="checkbox"
                      checked={form.principal}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, principal: e.target.checked }))
                      }
                    />
                    <label htmlFor="principal" className="text-sm font-medium">
                      Marcar como principal
                    </label>
                  </div>
                </div>

                <div className="mt-3">
                  <Input
                    icon="📍"
                    placeholder="Calle y número"
                    value={form.direccion_linea1}
                    onChange={(e) => setForm((s) => ({ ...s, direccion_linea1: e.target.value }))}
                  />
                </div>

                <div className="mt-3">
                  <Input
                    icon="🏘️"
                    placeholder="Colonia / interior / complemento"
                    value={form.direccion_linea2}
                    onChange={(e) => setForm((s) => ({ ...s, direccion_linea2: e.target.value }))}
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    icon="🏙️"
                    placeholder="Ciudad"
                    value={form.ciudad}
                    onChange={(e) => setForm((s) => ({ ...s, ciudad: e.target.value }))}
                  />
                  <Input
                    icon="🗺️"
                    placeholder="Estado"
                    value={form.estado_direccion}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, estado_direccion: e.target.value }))
                    }
                  />
                  <Input
                    icon="🔢"
                    placeholder="CP"
                    value={form.codigo_postal}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, codigo_postal: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-3">
                  <Textarea
                    icon="📝"
                    placeholder="Referencias de entrega"
                    value={form.referencias_envio}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, referencias_envio: e.target.value }))
                    }
                  />
                </div>

                {error ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="text-xs text-black/50">
                    Tip: agrega referencias para entregar más rápido.
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-2xl border px-5 py-3 font-semibold hover:bg-black/5 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={guardando}
                      className="rounded-2xl bg-black text-white px-5 py-3 font-semibold hover:opacity-90 transition disabled:opacity-60"
                    >
                      {guardando ? "Guardando..." : "Guardar"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="pointer-events-none absolute inset-0" />
          </div>
        </div>
      )}
    </div>
  );
}