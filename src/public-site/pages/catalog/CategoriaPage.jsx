import { useMemo } from "react";
import { useParams } from "react-router-dom";
import NewCollection from "../../components/NewCollection";

function deslugificar(slug = "") {
    return slug
        .split("-")
        .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join(" ");
}

export default function CategoriaPage() {
    const { categoriaSlug = "" } = useParams();

    const categoria = useMemo(() => deslugificar(categoriaSlug), [categoriaSlug]);

    return (
        <main>
            <NewCollection categoria={categoria} />
        </main>
    );
}