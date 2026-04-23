export default function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={[
        "inline-flex max-w-full items-center rounded-lg px-2 py-1 text-[11px] sm:text-xs font-medium",
        "whitespace-nowrap",
        styles[variant] || styles.default,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}