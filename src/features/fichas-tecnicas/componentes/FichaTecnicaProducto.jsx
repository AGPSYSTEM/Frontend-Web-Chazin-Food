import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, FileText, Search, Package, Plus, Minus, X, Check } from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { insumosService } from "@/features/compras/servicios/insumosService";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";

const inputCls = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#F05454] focus:border-transparent text-sm";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

export function FichaTecnicaProducto({ productId, productName, initialData, onSave }) {
  const notify = useNotifications();
  const [expanded, setExpanded] = useState(true);
  const [dbInsumosList, setDbInsumosList] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [procedimiento, setProcedimiento] = useState("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState(0);
  const [rendimiento, setRendimiento] = useState("");
  const [especificaciones, setEspecificaciones] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [informacionNutricional, setInformacionNutricional] = useState("");
  const [condicionesAlmacenamiento, setCondicionesAlmacenamiento] = useState("");
  const [vidaUtil, setVidaUtil] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  const [searchInsumo, setSearchInsumo] = useState("");
  const [saving, setSaving] = useState(false);

  // Load insumos list for autocomplete search
  useEffect(() => {
    insumosService.getInsumos()
      .then(res => setDbInsumosList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setDbInsumosList([]));
  }, []);

  // Load ficha data from prop or backend API
  const loadFichaData = useCallback(async () => {
    if (initialData) {
      populateFields(initialData);
      return;
    }
    if (productId) {
      try {
        const f = await fichasTecnicasService.getFichaByProducto(productId);
        if (f && f.idFichaTecnica) {
          populateFields(f);
        }
      } catch (err) {
        console.error("Error cargando ficha de producto:", err);
      }
    }
  }, [productId, initialData]);

  useEffect(() => {
    loadFichaData();
  }, [loadFichaData]);

  const populateFields = (f) => {
    setInsumos(f.detalles || f.insumos || []);
    setProcedimiento(f.procedimiento || f.descripcion || "");
    setTiempoPreparacion(f.tiempoPreparacion || 0);
    setRendimiento(f.rendimiento || "");
    setEspecificaciones(f.especificaciones || "");
    setCaracteristicas(f.caracteristicas || "");
    setInformacionNutricional(f.informacionNutricional || "");
    setCondicionesAlmacenamiento(f.condicionesAlmacenamiento || "");
    setVidaUtil(f.vidaUtil || "");
    setObservaciones(f.observaciones || "");
  };

  const insumosSugeridos = dbInsumosList.filter((ins) => {
    const t = searchInsumo.trim().toLowerCase();
    const nombre = ins.nombre || "";
    const yaAgregado = insumos.some((i) => String(i.idInsumo || i.id) === String(ins.id || ins.idInsumo));
    return t.length > 0 && nombre.toLowerCase().includes(t) && !yaAgregado;
  }).slice(0, 6);

  const agregarInsumo = (ins) => {
    setInsumos((prev) => [
      ...prev,
      {
        idInsumo: ins.id || ins.idInsumo,
        nombreInsumo: ins.nombre,
        insumo: { nombre: ins.nombre, unidadMedida: ins.unidadMedida },
        cantidad: 1,
        unidadMedida: ins.unidadMedida || "und"
      }
    ]);
    setSearchInsumo("");
  };

  const quitarInsumo = (idx) => setInsumos((prev) => prev.filter((_, i) => i !== idx));

  const actualizarCantidad = (idx, delta) => {
    setInsumos((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const nuevaCant = Math.max(0.1, Number((Number(item.cantidad || 0) + delta).toFixed(2)));
          return { ...item, cantidad: nuevaCant };
        }
        return item;
      })
    );
  };

  const actualizarUnidad = (idx, unidadMedida) => {
    setInsumos((prev) => prev.map((item, i) => (i === idx ? { ...item, unidadMedida } : item)));
  };

  const handleSave = async () => {
    const payload = {
      idProducto: productId || null,
      procedimiento,
      tiempoPreparacion: Number(tiempoPreparacion) || 0,
      rendimiento,
      especificaciones,
      caracteristicas,
      informacionNutricional,
      condicionesAlmacenamiento,
      vidaUtil,
      observaciones,
      detalles: insumos.map(i => ({
        idInsumo: i.idInsumo || i.id,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || 'und'
      }))
    };

    if (onSave) {
      onSave(payload);
    }

    if (productId) {
      try {
        setSaving(true);
        await fichasTecnicasService.saveFichaProducto(productId, payload);
        notify.success("Ficha Técnica Guardada", `Se guardó correctamente la ficha técnica de ${productName || "producto"}`);
      } catch (err) {
        console.error(err);
        notify.error("Error", "No se pudo guardar la ficha técnica en la base de datos");
      } finally {
        setSaving(false);
      }
    }
  };

  const isConfigured = insumos.length > 0 || procedimiento.trim().length > 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          <FileText className="w-5 h-5 text-[#F05454]" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Ficha Técnica del Producto</h3>
          {isConfigured && !expanded && (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
              Configurada
            </span>
          )}
        </div>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${expanded ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-6 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
          
          {/* Section 1: Insumos / Ingredientes */}
          <div>
            <label className={labelCls}>
              Ingredientes / Insumos necesarios
              <span className="text-gray-400 font-normal text-xs ml-1">— busca y selecciona</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchInsumo}
                onChange={(e) => setSearchInsumo(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent outline-none transition"
                placeholder="Buscar insumo por nombre..."
              />
              {insumosSugeridos.length > 0 && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-60 overflow-y-auto">
                  {insumosSugeridos.map((ins) => (
                    <button
                      key={ins.id || ins.idInsumo}
                      type="button"
                      onClick={() => agregarInsumo(ins)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg shrink-0">
                          <Package className="w-4 h-4 text-[#F05454]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{ins.nombre}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{ins.categoria?.nombre || ins.categoria || "Insumo"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#F05454]">
                        ${Number(ins.precioUnitario || 0).toLocaleString("es-CO")}/{ins.unidadMedida || "und"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Insumos Table */}
          {insumos.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Insumos seleccionados ({insumos.length})
              </p>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto bg-white dark:bg-gray-900">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase">
                      <th className="px-4 py-3">Insumo</th>
                      <th className="px-4 py-3 text-center">Cantidad</th>
                      <th className="px-4 py-3 text-center">Unidad</th>
                      <th className="px-4 py-3 text-right">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {insumos.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(idx, -0.5)}
                              className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                            </button>
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={item.cantidad}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0.1;
                                setInsumos(prev => prev.map((x, i) => i === idx ? { ...x, cantidad: val } : x));
                              }}
                              className="w-16 text-center font-semibold border border-gray-200 dark:border-gray-700 rounded py-1 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100"
                            />
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(idx, 0.5)}
                              className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200"
                            >
                              <Plus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select
                            value={item.unidadMedida || "und"}
                            onChange={(e) => actualizarUnidad(idx, e.target.value)}
                            className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-700 dark:text-gray-200"
                          >
                            <option value="kg">kg</option>
                            <option value="und">und</option>
                            <option value="lt">lt</option>
                            <option value="gr">gr</option>
                            <option value="ml">ml</option>
                            <option value="paq">paq</option>
                            <option value="porción">porción</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => quitarInsumo(idx)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-6 text-center">
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Busca y agrega los insumos necesarios para este producto</p>
            </div>
          )}

          {/* Section 2: Procedimiento */}
          <div>
            <label className={labelCls}>Procedimiento de Preparación</label>
            <textarea
              value={procedimiento}
              onChange={(e) => setProcedimiento(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder="Describe paso a paso cómo se prepara el producto..."
            />
          </div>

          {/* Section 3: Tiempo & Rendimiento */}
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

          {/* Section 4: Especificaciones & Características */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Especificaciones Técnicas</label>
              <textarea
                value={especificaciones}
                onChange={(e) => setEspecificaciones(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Gramaje, temperatura de cocción, estándares..."
              />
            </div>
            <div>
              <label className={labelCls}>Características Organolépticas</label>
              <textarea
                value={caracteristicas}
                onChange={(e) => setCaracteristicas(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Sabor, textura, aroma, apariencia..."
              />
            </div>
          </div>

          {/* Section 5: Información Nutricional & Condiciones Almacenamiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Información Nutricional</label>
              <textarea
                value={informacionNutricional}
                onChange={(e) => setInformacionNutricional(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Calorías, proteínas, carbohidratos..."
              />
            </div>
            <div>
              <label className={labelCls}>Condiciones de Almacenamiento</label>
              <textarea
                value={condicionesAlmacenamiento}
                onChange={(e) => setCondicionesAlmacenamiento(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Refrigeración, temperatura ideal..."
              />
            </div>
          </div>

          {/* Section 6: Vida Útil & Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vida Útil</label>
              <input
                type="text"
                value={vidaUtil}
                onChange={(e) => setVidaUtil(e.target.value)}
                className={inputCls}
                placeholder="Ej: Consumo inmediato o 24h refrigerado"
              />
            </div>
            <div>
              <label className={labelCls}>Observaciones</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className={inputCls}
                placeholder="Notas adicionales, alérgenos..."
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Ficha Técnica"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
