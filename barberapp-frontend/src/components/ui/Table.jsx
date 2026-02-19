import EmptyState from "./EmptyState";

export default function Table({
  columns = [],
  data = [],
  emptyTitle,
  emptyDescription,
  emptyIcon,
}) {
  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || "Sin resultados"}
        description={emptyDescription || "No hay datos para mostrar."}
        icon={emptyIcon}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="min-w-full bg-gray-900">
        <thead className="bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-800">
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-800/60 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-sm text-gray-200 whitespace-nowrap"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
