export default function Table({ columns, rows, renderRow }) {
  return (
    <div className="overflow-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((c) => (
              <th key={c} className="text-left px-4 py-3 font-semibold text-zinc-700">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              {renderRow(r)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
