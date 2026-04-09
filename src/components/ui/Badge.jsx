export default function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}
