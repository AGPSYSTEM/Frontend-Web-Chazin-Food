import { Package, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

export function InsumosStatsCards({ insumos = [] }) {
  const total = insumos.length;
  const stockNormal = insumos.filter((i) => (i.stock || 0) > (i.stockMinimo || 0)).length;
  const stockBajo = insumos.filter((i) => (i.stock || 0) <= (i.stockMinimo || 0) && (i.stock || 0) > 0).length;
  const agotados = insumos.filter((i) => (i.stock || 0) === 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Insumos */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-blue-100/70 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Insumos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</h3>
          <p className="text-xs text-gray-400">registrados</p>
        </div>
      </div>

      {/* Card 2: Stock Normal */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Normal</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stockNormal}</h3>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">en buen estado</p>
        </div>
      </div>

      {/* Card 3: Stock Bajo */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-amber-100/70 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Bajo</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stockBajo}</h3>
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">requieren atención</p>
        </div>
      </div>

      {/* Card 4: Agotados / Críticos */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-red-100/70 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Agotados / Críticos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{agotados}</h3>
          <p className="text-xs font-medium text-red-500 dark:text-red-400">reabastecer urgente</p>
        </div>
      </div>
    </div>
  );
}
