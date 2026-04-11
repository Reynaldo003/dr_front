// src/public-site/components/Footer.jsx
import { Link } from "react-router-dom";
import FooterWatermark from "./FooterWatermark";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 pt-12 pb-16 sm:px-6 md:pt-16">
        <div className="grid grid-cols-1 gap-10">
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
                  Aviso de Privacidad
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

          <div className="border-t border-white/10 pt-6">
            <FooterWatermark />
          </div>
        </div>
      </div>
    </footer>
  );
}