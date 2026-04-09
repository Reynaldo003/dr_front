import { Link } from "react-router-dom";
import FooterWatermark from "./FooterWatermark";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-12 pb-28 sm:px-6 md:pt-16 sm:pb-36">
        <div className="grid grid-cols-1 gap-8">
          <div className="max-w-sm">
            <div className="mb-4 text-sm font-extrabold tracking-wide md:text-base">
              AYUDA
            </div>

            <ul className="space-y-2 text-xs text-gray-300 md:text-sm">
              <li>
                <Link className="hover:text-white" to="/help/returns">
                  Cambios y devoluciones
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/help/shipping">
                  Costos y tiempos de envío
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/help/tracking">
                  Rastrea tu pedido
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/help/faq">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/help/billing">
                  Facturación
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" to="/help/contact">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <FooterWatermark />
    </footer>
  );
}