import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function FooterWatermark() {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(1);

  const recalc = () => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    const wrapWidth = wrap.clientWidth;
    const textWidth = text.scrollWidth;

    if (!wrapWidth || !textWidth) return;

    // Si el texto es más ancho que el contenedor, lo escalamos para que quepa.
    const nextScale = Math.min(1, wrapWidth / textWidth);

    setScale((prev) => (Math.abs(prev - nextScale) > 0.01 ? nextScale : prev));
  };

  useLayoutEffect(() => {
    recalc();
  }, []);

  useEffect(() => {
    const ro = new ResizeObserver(() => recalc());
    if (wrapRef.current) ro.observe(wrapRef.current);

    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0 z-0 pointer-events-none select-none overflow-hidden">
      {/* Wrapper centrado SIEMPRE */}
      <div ref={wrapRef} className="px-4 sm:px-6 pb-2 overflow-hidden">
        <div
          ref={textRef}
          className="
            flex items-end justify-center
            whitespace-nowrap leading-none text-white
            blur-[0.6px]
            tracking-[0.06em] sm:tracking-[0.10em] md:tracking-[0.14em]
          "
          style={{
            // translateY para que quede “abajo” tipo referencia + scale para que NUNCA se corte
            transform: `translateY(10%) scale(${scale})`,
            transformOrigin: "center bottom",
            fontSize: "clamp(36px, 11vw, 240px)", // min más bajo para pantallas raras
          }}
        >
          <span className="font-extralight">MIS&nbsp;DOS</span>
          <span className="font-extrabold ml-4 sm:ml-6">REYNAS</span>
        </div>
      </div>
    </div>
  );
}
