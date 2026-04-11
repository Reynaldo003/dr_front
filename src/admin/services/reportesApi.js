import { getAdminToken } from "./adminAuthApi";
const API_BASE = "https://misdosreynas.com/api";

function getAuthHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const respuesta = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!respuesta.ok) {
    let mensaje = "Error al comunicarse con el servidor.";

    try {
      const data = await respuesta.json();
      mensaje = data.detail || JSON.stringify(data);
    } catch {
      // nada
    }

    throw new Error(mensaje);
  }

  return respuesta.json();
}

export function obtenerDashboardResumen({ modo, fecha_base }) {
  const search = new URLSearchParams();
  if (modo) search.set("modo", modo);
  if (fecha_base) search.set("fecha_base", fecha_base);

  return request(`/dashboard/resumen/?${search.toString()}`);
}

export function obtenerReportePreview({ tipo, desde, hasta }) {
  const search = new URLSearchParams();
  if (tipo) search.set("tipo", tipo);
  if (desde) search.set("desde", desde);
  if (hasta) search.set("hasta", hasta);

  return request(`/reportes/preview/?${search.toString()}`);
}

export async function descargarReporte({ tipo, formato, desde, hasta }) {
  const search = new URLSearchParams();
  if (tipo) search.set("tipo", tipo);
  if (formato) search.set("formato", formato);
  if (desde) search.set("desde", desde);
  if (hasta) search.set("hasta", hasta);

  const respuesta = await fetch(
    `${API_BASE}/reportes/exportar/?${search.toString()}`,
    {
      headers: {
        ...getAuthHeaders(),
      },
    },
  );

  if (!respuesta.ok) {
    let mensaje = "No se pudo descargar el reporte.";

    try {
      const data = await respuesta.json();
      mensaje = data.detail || JSON.stringify(data);
    } catch {
      // nada
    }

    throw new Error(mensaje);
  }

  const blob = await respuesta.blob();
  const disposition = respuesta.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const nombre =
    match?.[1] ||
    `reporte.${formato.toLowerCase() === "excel" ? "xlsx" : formato.toLowerCase()}`;

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
