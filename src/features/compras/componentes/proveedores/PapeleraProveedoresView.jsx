import { Building, Trash2, RotateCcw } from "lucide-react";

export function PapeleraProveedoresView({
  papeleraProveedores = [],
  onVolverActivos,
  onRestaurarProveedor,
  onEliminarDefinitivoProveedor
}) {
  return (
    <div className="space-y-6">
      {/* Banner: Volver a Activos */}
      <button
        onClick={onVolverActivos}
        className="w-full py-3.5 px-6 rounded-2xl bg-blue-100/90 hover:bg-blue-200/90 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
      >
        <Building className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        <span>Volver a Proveedores Activos</span>
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1e293b] dark:text-gray-100">
              Papelera de Proveedores
            </h2>
            <p className="text-xs text-gray-400">
              Proveedores inactivos o eliminados. Puedes restaurarlos o eliminarlos permanentemente.
            </p>
          </div>
        </div>

        {/* Section: Proveedores Inactivos / Eliminados */}
        <div className="space-y-3">
          {papeleraProveedores.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <Trash2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                No hay proveedores en la papelera.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Los proveedores inactivos aparecerán en esta sección.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              {papeleraProveedores.map((item) => (
                <div
                  key={item.id || item.idProveedor}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#F05454] flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {item.nombre}
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 rounded-full">
                          Inactivo
                        </span>
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        NIT: <span className="font-medium text-gray-600 dark:text-gray-300">{item.nit || item.numeroDocumento || "N/A"}</span>
                        {" • "}Contacto: <span className="font-medium text-gray-600 dark:text-gray-300">{item.contacto || item.nombreContacto || "N/A"}</span>
                        {item.telefono && ` • Tel: ${item.telefono}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onRestaurarProveedor(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors"
                      title="Restaurar proveedor"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>

                    <button
                      onClick={() => onEliminarDefinitivoProveedor(item.id || item.idProveedor, item.nombre)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold transition-colors"
                      title="Eliminar definitivamente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar permanente</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
