//src/public-site/components/NewCollection.jsx
import { useEffect, useMemo, useState } from "react";
import { obtenerProductosPublicos } from "../lib/apiPublic";
import { adaptarProductoBackend } from "../lib/productAdapters";
import ProductGrid from "./ProductGrid";
import ProductModal from "./ProductModal";

export default function NewCollection({ onAddToCart, categoria = "" }) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setCargando(true);
        setError("");

        const data = await obtenerProductosPublicos({
          categoria,
          solo_disponibles: true,
        });

        if (!activo) return;

        setItems((Array.isArray(data) ? data : []).map(adaptarProductoBackend));
      } catch (err) {
        if (!activo) return;
        setError(err.message || "No se pudieron cargar los productos");
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [categoria]);

  const titulo = useMemo(() => {
    if (!categoria) return "Nueva colección";
    return categoria;
  }, [categoria]);

  const subtitulo = useMemo(() => {
    if (!categoria) return "Explora piezas seleccionadas para ti.";
    return "Descubre piezas disponibles en esta categoría.";
  }, [categoria]);

  const handleOpen = (product) => {
    setSelected(product);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setSelected(null), 200);
  };

  if (cargando) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
        <div className="text-sm text-gray-500">Cargando productos...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </section>
    );
  }

  return (
    <>
      <ProductGrid
        items={items}
        onOpen={handleOpen}
        title={titulo}
        subtitle={subtitulo}
      />

      {selected ? (
        <ProductModal
          product={selected}
          open={open}
          onClose={handleClose}
          onAddToCart={onAddToCart}
        />
      ) : null}
    </>
  );
}