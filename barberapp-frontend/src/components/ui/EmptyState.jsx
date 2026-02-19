export default function EmptyState({
  title = "No hay datos",
  description = "Aún no hay información para mostrar.",
  icon,
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-gray-900/40 border border-gray-800 rounded-xl">
      
      {/* Icono */}
      {icon && (
        <div className="text-5xl text-gray-600 mb-4">
          {icon}
        </div>
      )}

      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-200">
        {title}
      </h3>

      {/* Descripción */}
      <p className="text-sm text-gray-400 mt-2 max-w-md">
        {description}
      </p>

      {/* Acción opcional */}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
}
