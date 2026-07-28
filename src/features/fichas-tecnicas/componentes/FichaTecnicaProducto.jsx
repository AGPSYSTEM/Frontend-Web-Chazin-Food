import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Search, Package, Plus, Minus, X } from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";

const insumosDisponibles = [
  { id: 1, nombre: "Tomate", unidadMedida: "kg", categoria: "Verduras", precioUnitario: 3500 },
  { id: 2, nombre: "Lechuga", unidadMedida: "und", categoria: "Verduras", precioUnitario: 2000 },
  { id: 3, nombre: "Carne de Res", unidadMedida: "kg", categoria: "Proteínas", precioUnitario: 25000 },
  { id: 4, nombre: "Pollo", unidadMedida: "kg", categoria: "Proteínas", precioUnitario: 12000 },
  { id: 5, nombre: "Pan Hamburguesa", unidadMedida: "und", categoria: "Carbohidratos", precioUnitario: 8500 },
  { id: 6, nombre: "Papas", unidadMedida: "kg", categoria: "Verduras", precioUnitario: 4000 },
  { id: 7, nombre: "Queso Mozzarella", unidadMedida: "kg", categoria: "Lácteos", precioUnitario: 18000 },
  { id: 8, nombre: "Salchicha Premium", unidadMedida: "kg", categoria: "Proteínas", precioUnitario: 15000 },
  { id: 9, nombre: "Mayonesa", unidadMedida: "und", categoria: "Condimentos", precioUnitario: 6500 },
  { id: 10, nombre: "Salsa BBQ", unidadMedida: "und", categoria: "Condimentos", precioUnitario: 4000 }
];

const inputCls = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

export function FichaTecnicaProducto({ initialData, onSave }) {
  const notify = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const [insumos, setInsumos] = useState(initialData?.insumos || []);
  const [procedimiento, setProcedimiento] = useState(initialData?.procedimiento || "");
  const [tiempoPreparacion, setTiempoPreparacion] = useState(initialData?.tiempoPreparacion || 0);
  const [rendimiento, setRendimiento] = useState(initialData?.rendimiento || "");
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || "");
  const [searchInsumo, setSearchInsumo] = useState("");
  const [nextRowId, setNextRowId] = useState(
    initialData?.insumos?.length ? Math.max(...initialData.insumos.map((i) => i.id)) + 1 : 1
  );

  const insumosSugeridos = insumosDisponibles.filter((ins) => {
    const t = searchInsumo.trim().toLowerCase();
    return t.length > 0 && ins.nombre.toLowerCase().includes(t) && !insumos.find((i) => i.idInsumo === ins.id);
  }).slice(0, 6);

  const agregarInsumo = (ins) => {
    setInsumos((prev) => [
      ...prev,
      {
        id: nextRowId,
        idInsumo: ins.id,
        nombreInsumo: ins.nombre,
        cantidad: 1,
        unidadMedida: ins.unidadMedida
      }
    ]);
    setNextRowId((n) => n + 1);
    setSearchInsumo("");
  };

  const quitarInsumo = (id) => setInsumos((prev) => prev.filter((i) => i.id !== id));
  const actualizarCantidad = (id, delta) =>
    setInsumos((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, cantidad: Math.max(0.1, parseFloat((i.cantidad + delta).toFixed(2))) } : i
      )
    );
  const actualizarUnidad = (id, unidadMedida) =>
    setInsumos((prev) => prev.map((i) => (i.id === id ? { ...i, unidadMedida } : i)));

  const handleSave = () => {
    if (onSave) {
      onSave({ insumos, procedimiento, tiempoPreparacion, rendimiento, observaciones });
      notify.success("Ficha Técnica Guardada", "La ficha técnica del producto se guardó correctamente");
    }
  };

  const hasFichaTecnica = initialData && (initialData.insumos.length > 0 || initialData.procedimiento);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          <FileText className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Ficha Técnica</h3>
          {hasFichaTecnica && !expanded && (
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
              Configurada
            </span>
          )}
          {insumos.length > 0 && !hasFichaTecnica && !expanded && (
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
              {insumos.length} insumo{insumos.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${expanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div>
            <label className={labelCls}>
              Ingredientes / Insumos necesarios
              <span className="text-gray-400 font-normal text-xs ml-1">— busca y selecciona</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchInsumo}
                onChange={(e) => setSearchInsumo(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Buscar insumo por nombre..."
              />
              {insumosSugeridos.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {insumosSugeridos.map((ins) => (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => agregarInsumo(ins)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-red-50 dark:bg-red-900/20 p-1.5 rounded-lg shrink-0">
                          <Package className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{ins.nombre}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{ins.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                          ${ins.precioUnitario.toLocaleString()}/{ins.unidadMedida}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {insumos.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Insumos seleccionados ({insumos.length})
              </p>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
                <table className="w-full min-w-[460px] text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[35%]">Insumo</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[25%]">Cantidad</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[25%]">Unidad</th>
                      <th className="w-[15%]" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {insumos.map((insumo) => (
                      <tr key={insumo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-center shrink-0">
                              <Package className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{insumo.nombreInsumo}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(insumo.id, -0.5)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors shrink-0"
                            >
                              <Minus className="w-3 h-3 text-gray-500" />
                            </button>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={insumo.cantidad}
                              onChange={(e) =>
                                setInsumos((prev) =>
                                  prev.map((i) =>
                                    i.id === insumo.id ? { ...i, cantidad: parseFloat(e.target.value) || 0.1 } : i
                                  )
                                )
                              }
                              className="w-14 text-center text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md py-1 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/50"
                            />
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(insumo.id, 0.5)}
                              className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors shrink-0"
                            >
                              <Plus className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={insumo.unidadMedida}
                            onChange={(e) => actualizarUnidad(insumo.id, e.target.value)}
                            className="w-full px-2 py-1.5 text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
                          >
                            <option value="kg">kg</option>
                            <option value="und">und</option>
                            <option value="lt">lt</option>
                            <option value="paq">paq</option>
                            <option value="gr">gr</option>
                            <option value="ml">ml</option>
                            <option value="taza">taza</option>
                            <option value="porción">porción</option>
                          </select>
                        </td>
                        <td className="pr-3 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => quitarInsumo(insumo.id)}
                            className="w-7 h-7 flex items-center justify-center mx-auto text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Quitar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl py-6 text-center">
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Busca y agrega los insumos necesarios para este producto</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Procedimiento de Preparación</label>
            <textarea
              value={procedimiento}
              onChange={(e) => setProcedimiento(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={5}
              placeholder="Describe paso a paso cómo se prepara el producto..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tiempo de Preparación (min)</label>
              <input
                type="number"
                value={tiempoPreparacion}
                onChange={(e) => setTiempoPreparacion(Number(e.target.value) || 0)}
                className={inputCls}
                placeholder="Ej: 15"
              />
            </div>
            <div>
              <label className={labelCls}>Rendimiento / Porciones</label>
              <input
                type="text"
                value={rendimiento}
                onChange={(e) => setRendimiento(e.target.value)}
                className={inputCls}
                placeholder="Ej: 1 porción"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Notas adicionales, alergenos, certificaciones, etc."
            />
          </div>

          {onSave && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
              >
                Guardar Ficha Técnica
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
