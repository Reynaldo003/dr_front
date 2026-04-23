export default function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <section
      className={[
        "rounded-2xl border bg-white shadow-sm",
        "p-3 sm:p-5",
        className,
      ].join(" ")}
    >
      {(title || subtitle || right) && (
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && <h3 className="text-sm sm:text-base font-semibold break-words">{title}</h3>}
            {subtitle && <p className="mt-1 text-xs sm:text-sm text-zinc-500 break-words">{subtitle}</p>}
          </div>

          {right ? (
            <div className="w-full sm:w-auto shrink-0">
              {right}
            </div>
          ) : null}
        </header>
      )}

      <div className="min-w-0">{children}</div>
    </section>
  );
}