import { Calendar } from "lucide-react";

export default function DateField({ label, value, onChange, min, max }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-700">{label}</span>

      <div className="mt-2 relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />

        <input
          type="date"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
    </label>
  );
}