//src/public-site/pages/catalog/CategoriaPage.jsx
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NewCollection from "../../components/NewCollection";

function normalizarSlug(slug = "") {
    return decodeURIComponent(String(slug || ""))
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function deslugificar(slug = "") {
    const limpio = normalizarSlug(slug);

    return limpio
        .split("-")
        .filter(Boolean)
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
}

export default function CategoriaPage() {
    const { categoriaSlug = "" } = useParams();

    const categoria = useMemo(() => deslugificar(categoriaSlug), [categoriaSlug]);
    const categoriaKey = useMemo(
        () => normalizarSlug(categoriaSlug),
        [categoriaSlug],
    );

    return (
        <main>
            <NewCollection categoria={categoria} categoriaKey={categoriaKey} />
        </main>
    );
}