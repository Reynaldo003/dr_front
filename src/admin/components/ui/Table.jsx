export default function Table({ columns, rows, renderRow }) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="min-w-[720px] w-full text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="px-4 py-3 text-left font-semibold text-zinc-700 whitespace-nowrap"
              >
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

          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-sm text-zinc-500"
              >
                Sin registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}