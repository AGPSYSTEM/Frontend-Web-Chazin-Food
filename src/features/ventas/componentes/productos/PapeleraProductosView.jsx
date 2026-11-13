import { useState } from "react";
import { Package, Trash2, RotateCcw, Search, X, Clock } from "lucide-react";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";

export function PapeleraProductosView({
  papeleraProductos = [],
  onVolverActivos,
  onRestaurarProducto,
  onEliminarDefinitivoProducto,
  canEdit = true,
  canDelete = true
}) {
  const [searchTrash, setSearchTrash] = useState("");

  const filteredProductos = papeleraProductos.filter((item) => {
    const varNames = Array.isArray(item.variantes)
      ? item.variantes.map((v) => v.nombre || "").join(" ")
      : "";

    return matchesSmartSearch(
      [
        item.nombre,
        item.categoria,
        item.descripcion,
        item.id,
        item.idProducto,
        `#${item.id || item.idProducto}`,
        item.precio,
        String(item.precio ?? ""),
        varNames
      ],
      searchTrash
    );
  });

  const formatDeletedDate = (rawDate) => {
    if (!rawDate) return null;
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short"
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner: Volver a Activos */}
      <button
        type="button"
        onClick={onVolverActivos}
        className="w-full py-3.5 px-6 rounded-2xl bg-blue-100/90 hover:bg-blue-200/90 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
      >
        <Package className="w-5 h-5 text-blue-600 dark:text-blue-300" />
        <span>Volver a Productos Activos</span>
      </button>

      {/* Main Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        {/* Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1e293b] dark:text-gray-100">
                Papelera de Productos
              </h2>
              <p className="text-xs text-gray-400">
                Productos eliminados recientemente. Puedes recuperarlos al catálogo o eliminarlos definitivamente.
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTrash}
              onChange={(e) => setSearchTrash(e.target.value)}
              placeholder="Buscar producto en papelera..."
              className="w-full pl-10 pr-9 py-2 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent outline-none"
            />
            {searchTrash && (
              <button
                type="button"
                onClick={() => setSearchTrash("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base border-b border-gray-100 dark:border-gray-800 pb-2 flex items-center justify-between">
            <span>Productos Eliminados</span>
            <span className="text-xs font-semibold text-gray-400">
              {filteredProductos.length} {filteredProductos.length === 1 ? "registro" : "registros"}
            </span>
          </h3>

          {filteredProductos.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <Trash2 className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {searchTrash
                  ? "No se encontraron productos en la papelera que coincidan con la búsqueda."
                  : "No hay productos en la papelera."}
              </p>
              {!searchTrash && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Los productos que elimines aparecerán aquí para poder recuperarlos cuando quieras.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              {filteredProductos.map((item) => {
                const deletedAtLabel = formatDeletedDate(item.fechaEliminacion);
                const variantCount = Array.isArray(item.variantes) ? item.variantes.length : 0;
                return (
                  <div
                    key={item.id || item.idProducto}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imagen ? (
                        <img
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-11 h-11 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0 opacity-85"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap">
                          <span className="truncate">{item.nombre}</span>
                          {item.estado === "Inactivo" && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full">
                              Inactivo
                            </span>
                          )}
                          {variantCount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                              {variantCount} {variantCount === 1 ? "variante" : "variantes"}
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{item.categoria || "Sin categoría"}</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-600 dark:text-gray-300">
                            ${Number(item.precio || 0).toLocaleString("es-CO")}
                          </span>
                          {deletedAtLabel && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                Eliminado: {deletedAtLabel}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onRestaurarProducto(item)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-xs font-semibold transition-colors cursor-pointer"
                          title="Recuperar producto al catálogo"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Recuperar</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onEliminarDefinitivoProducto(item.id || item.idProducto, item.nombre)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold transition-colors cursor-pointer"
                          title="Eliminar definitivamente de la base de datos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar permanente</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

