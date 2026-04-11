// src/public-site/components/FooterWatermark.jsx
export default function FooterWatermark() {
  return (
    <a
      href="https://www.instagram.com/robots.dev/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Desarrollado por RObots"
      className="
        inline-flex items-center gap-3
        rounded-2xl border border-white/10
        bg-white/5 px-4 py-3
        text-white/80 backdrop-blur-sm
        shadow-md transition-all duration-300
        hover:bg-white/10 hover:text-white
      "
    >
      <img
        src="/RObots.png"
        alt="Logo RObots"
        className="h-9 w-9 rounded-full bg-black/30 p-1 object-contain"
      />

      <div className="leading-none">
        <span className="block text-[10px] uppercase tracking-[0.18em] text-white/50">
          Desarrollado por
        </span>
        <span className="block text-sm font-semibold text-white/90">
          RObots
        </span>
      </div>
    </a>
  );
}