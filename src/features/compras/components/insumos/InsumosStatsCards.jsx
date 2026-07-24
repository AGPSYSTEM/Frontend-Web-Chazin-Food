import { Package, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";

export function InsumosStatsCards({ insumos = [] }) {
  const total = insumos.length;
  const stockNormal = insumos.filter((i) => (i.stock || 0) > (i.stockMinimo || 0)).length;
  const stockBajo = insumos.filter((i) => (i.stock || 0) <= (i.stockMinimo || 0) && (i.stock || 0) > 0).length;
  const agotados = insumos.filter((i) => (i.stock || 0) === 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Insumos</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0">
          <CheckCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Óptimo</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stockNormal}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Stock Bajo</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stockBajo}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
          <TrendingDown className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Agotados</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{agotados}</h3>
        </div>
      </div>
    </div>
  );
}
