import { useEffect, useState } from "react";
import heroVideo from "../public/videos/hero-boutique.mp4";

const TITULO = "WELCOME TO YOUR FAVORITE PLACE";
const SUBTITULO = "Bienvenida a tu lugar favorito!";

export default function Hero() {
  const [tituloVisible, setTituloVisible] = useState("");
  const [subtituloVisible, setSubtituloVisible] = useState("");
  const [mostrarCursorTitulo, setMostrarCursorTitulo] = useState(true);
  const [mostrarCursorSubtitulo, setMostrarCursorSubtitulo] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeoutId;

    const escribirTitulo = () => {
      if (i <= TITULO.length) {
        setTituloVisible(TITULO.slice(0, i));
        i += 1;
        timeoutId = setTimeout(escribirTitulo, 55);
      } else {
        setMostrarCursorTitulo(false);
        setMostrarCursorSubtitulo(true);
        escribirSubtitulo();
      }
    };

    let j = 0;

    const escribirSubtitulo = () => {
      if (j <= SUBTITULO.length) {
        setSubtituloVisible(SUBTITULO.slice(0, j));
        j += 1;
        timeoutId = setTimeout(escribirSubtitulo, 35);
      } else {
        setMostrarCursorSubtitulo(false);
      }
    };

    escribirTitulo();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section className="relative isolate w-full overflow-hidden">
      <div className="relative h-[420px] sm:h-[480px] md:h-[560px] xl:h-[620px] 2xl:h-[680px]">
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={heroVideo} type="video/mp4" />
          Tu navegador no soporta video HTML5.
        </video>

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/10" />

        <div className="relative z-10 h-full">
          <div className="mx-auto flex h-full w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex w-full flex-col items-center justify-center text-center">
              <div className="w-full max-w-6xl">
                <h1 className="mx-auto text-[clamp(28px,7vw,86px)] font-extrabold leading-[0.95] tracking-tight text-white">
                  {tituloVisible}
                  {mostrarCursorTitulo && (
                    <span className="ml-1 inline-block h-[0.95em] w-[4px] animate-pulse bg-white align-[-0.08em]" />
                  )}
                </h1>
              </div>

              <div className="mt-4 w-full max-w-2xl">
                <p className="mx-auto text-sm text-white/90 sm:text-base md:text-lg">
                  {subtituloVisible}
                  {mostrarCursorSubtitulo && (
                    <span className="ml-1 inline-block h-[1em] w-[3px] animate-pulse bg-white align-[-0.08em]" />
                  )}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#shop-categories"
                  className="rounded-full border border-white/40 bg-white/10 px-6 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  VER TODO
                </a>

                <a
                  href="#how-it-works"
                  className="rounded-full border border-white/30 bg-transparent px-6 py-2 text-sm font-semibold text-white/90 transition hover:border-white/50 hover:text-white"
                >
                  ¿Cómo funciona?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}