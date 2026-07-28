import { Eye, FileText, ShoppingCart, Calendar } from "lucide-react";

export function ComprasTable({ compras = [], onViewDetail, onUpdateEstado }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <th className="px-6 py-4">Factura / Orden</th>
              <th className="px-6 py-4">Proveedor</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {compras.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No se encontraron órdenes de compra
                </td>
              </tr>
            ) : (
              compras.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 text-[#F05454] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {c.numeroFactura || `OC-${c.id}`}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">ID: #{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {c.proveedorNombre || c.proveedor || "Proveedor Desconocido"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {c.fecha ? new Date(c.fecha).toLocaleDateString("es-CO") : "Reciente"}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100">
                    ${Number(c.total || 0).toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        c.estado === "Completada" || c.estado === "Recibida"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : c.estado === "Pendiente"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {c.estado || "Pendiente"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onViewDetail(c)}
                      title="Ver Detalle"
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
