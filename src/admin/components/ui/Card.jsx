export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-2xl border bg-white shadow-sm",
        "p-4 sm:p-5",
        className,
      ].join(" ")}
    >
      {(title || subtitle || right) && (
        <header className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            {title && <h3 className="text-sm font-semibold truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
