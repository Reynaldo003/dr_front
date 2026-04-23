//src/admin/services/productosApi.js
export {
  obtenerProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from "../lib/productosAdminApi";

export { actualizarProducto as actualizarProductoParcial } from "../lib/productosAdminApi";
