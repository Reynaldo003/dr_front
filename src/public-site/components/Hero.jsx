import heroVideo from "../public/videos/hero-boutique.mp4";

export default function Hero() {
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
          <div className="mx-auto flex h-full max-w-7xl px-4">
            <div className="flex w-full flex-col items-center justify-center text-center">
              <div className="w-max max-w-full">
                <h1 className="animate-typingFast overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-5 text-[clamp(38px,6vw,86px)] font-extrabold leading-[0.95] tracking-tight text-white">
                  Coming Soon
                </h1>
              </div>

              <div className="mt-4 w-max max-w-full">
                <p className="animate-typingSlow overflow-hidden whitespace-nowrap border-r-4 border-r-white pr-4 text-sm text-white/90 sm:text-base md:text-lg">
                  Welcome Your Favorite Place!
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