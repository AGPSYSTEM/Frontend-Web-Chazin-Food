import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { OrdenCard } from "./OrdenCard";

export function EstadoSeccion({
  titulo,
  ordenes = [],
  onUpdateEstado,
  onViewDetails,
  defaultExpanded = true
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Styling maps based on section title
  const getHeaderStyles = (status) => {
    switch (status) {
      case "En Cola":
        return {
          container: "border-gray-200 dark:border-gray-800",
          header: "bg-gray-50/80 dark:bg-gray-800/40 text-gray-900 dark:text-gray-100",
          badge: "bg-gray-200/80 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
          text: "text-gray-800 dark:text-gray-100"
        };
      case "En Preparación":
        return {
          container: "border-blue-100 dark:border-blue-900/30",
          header: "bg-blue-50/60 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
          badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
          text: "text-blue-600 dark:text-blue-400"
        };
      case "Listo":
      case "Listos":
        return {
          container: "border-green-100 dark:border-green-900/30",
          header: "bg-green-50/60 dark:bg-green-950/20 text-green-600 dark:text-green-400",
          badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
          text: "text-green-600 dark:text-green-400"
        };
      case "Despachado":
        return {
          container: "border-purple-100 dark:border-purple-900/30",
          header: "bg-purple-50/60 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400",
          badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
          text: "text-purple-600 dark:text-purple-400"
        };
      case "Entregado":
        return {
          container: "border-emerald-100 dark:border-emerald-900/30",
          header: "bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
          badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300",
          text: "text-emerald-600 dark:text-emerald-400"
        };
      default:
        return {
          container: "border-gray-200 dark:border-gray-800",
          header: "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
          badge: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
          text: "text-gray-800 dark:text-gray-100"
        };
    }
  };

  const styles = getHeaderStyles(titulo);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl border ${styles.container} shadow-xs overflow-hidden mb-5 transition-all`}>
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${styles.header}`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-base font-bold ${styles.text}`}>{titulo}</span>
          <span className={`px-3 py-0.5 rounded-full text-xs font-bold ${styles.badge}`}>
            {ordenes.length}
          </span>
        </div>
        <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 sm:p-5">
          {ordenes.length === 0 ? (
            <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm font-medium">
              Sin órdenes
            </div>
          ) : (
            <div className="space-y-4">
              {ordenes.map((orden) => (
                <OrdenCard
                  key={orden.id}
                  orden={orden}
                  onUpdateEstado={onUpdateEstado}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
