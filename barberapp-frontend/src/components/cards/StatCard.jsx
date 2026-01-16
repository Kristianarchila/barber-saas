export default function StatCard({
  title,
  value,
  icon,
  color = "text-indigo-400",
  subtitle
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <span className="text-xl opacity-80">
            {icon}
          </span>
        )}
      </div>

      <p className={`text-4xl font-bold ${color}`}>
        {value}
      </p>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
