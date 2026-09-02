import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, ShieldCheck, Clock, Layers, AlertCircle, ChevronDown, ChevronUp, FileText, Check, Package, X, Search, Minus, FlaskConical } from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { insumosService } from "@/features/compras/servicios/insumosService";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";

const inputCls = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#F05454] focus:border-transparent text-sm";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
const requiredMark = <span className="text-red-500"> *</span>;

export function FichaTecnicaInsumo({ insumoId, insumoName, initialData, onSave, onChange, readOnly = false }) {
  const notify = useNotifications();
  const [expanded, setExpanded] = useState(true);
  const [dbInsumosList, setDbInsumosList] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [procedimiento, setProcedimiento] = useState("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState("");
  const [rendimiento, setRendimiento] = useState("");
  const [especificaciones, setEspecificaciones] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [informacionNutricional, setInformacionNutricional] = useState("");
  const [condicionesAlmacenamiento, setCondicionesAlmacenamiento] = useState("");
  const [vidaUtil, setVidaUtil] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  const [searchInsumo, setSearchInsumo] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingFicha, setLoadingFicha] = useState(Boolean(insumoId));
  const loadedKeyRef = useRef(null);

  // Load available base insumos list for ingredient selection
  useEffect(() => {
    insumosService.getInsumos()
      .then(res => setDbInsumosList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setDbInsumosList([]));
  }, []);

  const populateFields = useCallback((f) => {
    if (!f) return;
    setInsumos(f.detalles || f.insumos || f.ingredientes || []);
    setProcedimiento(f.procedimiento || f.descripcion || "");
    setTiempoPreparacion(f.tiempoPreparacion !== null && f.tiempoPreparacion !== undefined ? String(f.tiempoPreparacion) : "");
    setRendimiento(f.rendimiento || "");
    setEspecificaciones(f.especificaciones || "");
    setCaracteristicas(f.caracteristicas || "");
    setInformacionNutricional(f.informacionNutricional || "");
    setCondicionesAlmacenamiento(f.condicionesAlmacenamiento || "");
    setVidaUtil(f.vidaUtil || "");
    setObservaciones(f.observaciones || "");
  }, []);

  // Load ficha data from prop or backend API
  useEffect(() => {
    if (initialData) {
      populateFields(initialData);
    } else if (insumoId) {
      setLoadingFicha(true);
      fichasTecnicasService.getFichaByInsumoPreparado(insumoId)
        .then(f => {
          if (f && (f.idFichaTecnica || f.id || f.procedimiento)) {
            populateFields(f);
            if (onChange) onChange(f);
          }
        })
        .catch(err => console.error("Error cargando ficha de insumo preparado:", err))
        .finally(() => setLoadingFicha(false));
    } else {
      setInsumos([]);
      setProcedimiento("");
      setTiempoPreparacion("");
      setRendimiento("");
      setEspecificaciones("");
      setCaracteristicas("");
      setInformacionNutricional("");
      setCondicionesAlmacenamiento("");
      setVidaUtil("");
      setObservaciones("");
    }
  }, [insumoId, initialData, populateFields]);

  // Sync state changes with parent in real-time
  useEffect(() => {
    const payload = {
      idInsumo: insumoId || null,
      idInsumoPreparado: insumoId || null,
      tipo: "INSUMO_PREPARADO",
      procedimiento: procedimiento.trim(),
      tiempoPreparacion: Number(tiempoPreparacion) || 0,
      rendimiento: rendimiento.trim(),
      especificaciones: especificaciones.trim(),
      caracteristicas: caracteristicas.trim(),
      informacionNutricional: informacionNutricional.trim(),
      condicionesAlmacenamiento: condicionesAlmacenamiento.trim(),
      vidaUtil: vidaUtil.trim(),
      observaciones: observaciones.trim(),
      detalles: insumos.map((i) => ({
        idInsumo: i.idInsumo || i.id,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || i.insumo?.unidadMedida || "und"
      })),
      insumos
    };

    if (onChange) {
      onChange(payload);
    }
  }, [insumos, procedimiento, tiempoPreparacion, rendimiento, especificaciones, caracteristicas, informacionNutricional, condicionesAlmacenamiento, vidaUtil, observaciones, insumoId]);

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
          const current = Math.floor(Number(item.cantidad) || 1);
          const nuevaCant = Math.max(1, current + delta);
          return { ...item, cantidad: nuevaCant };
        }
        return item;
      })
    );
  };

  const setCantidadDirecta = (idx, valor) => {
    const sanitized = String(valor).replace(/[^0-9]/g, '');
    const num = sanitized === '' ? '' : Math.max(1, parseInt(sanitized, 10));
    setInsumos((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, cantidad: num } : item))
    );
  };

  const handleCantidadBlur = (idx) => {
    setInsumos((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const num = Math.max(1, parseInt(item.cantidad, 10) || 1);
          return { ...item, cantidad: num };
        }
        return item;
      })
    );
  };

  const handleTiempoChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setTiempoPreparacion('');
      return;
    }
    const num = Math.max(1, parseInt(raw, 10));
    setTiempoPreparacion(String(num));
  };

  const handleTiempoBlur = () => {
    if (tiempoPreparacion === '' || Number(tiempoPreparacion) < 1) {
      setTiempoPreparacion('1');
    }
  };

  const handleSave = async () => {
    const requiredFields = [
      ["Procedimiento de preparación", procedimiento],
      ["Tiempo de preparación", tiempoPreparacion],
      ["Rendimiento / porciones", rendimiento],
      ["Condiciones de almacenamiento", condicionesAlmacenamiento],
      ["Vida útil", vidaUtil],
      ["Especificaciones técnicas", especificaciones],
      ["Características organolépticas", caracteristicas],
      ["Información nutricional", informacionNutricional]
    ];
    const missingFields = requiredFields
      .filter(([, value]) => String(value ?? "").trim() === "")
      .map(([label]) => label);

    if (insumos.length === 0) missingFields.unshift("Ingredientes / insumos base necesarios");
    if (missingFields.length > 0) {
      notify.error("Campos obligatorios", `Completa los siguientes campos obligatorios de la ficha técnica: ${missingFields.join(", ")}.`);
      return;
    }

    const payload = {
      idInsumo: insumoId || null,
      idInsumoPreparado: insumoId || null,
      tipo: "INSUMO_PREPARADO",
      procedimiento: procedimiento.trim(),
      tiempoPreparacion: Number(tiempoPreparacion) || 0,
      rendimiento: rendimiento.trim(),
      especificaciones: especificaciones.trim(),
      caracteristicas: caracteristicas.trim(),
      informacionNutricional: informacionNutricional.trim(),
      condicionesAlmacenamiento: condicionesAlmacenamiento.trim(),
      vidaUtil: vidaUtil.trim(),
      observaciones: observaciones.trim(),
      detalles: insumos.map((i) => ({
        idInsumo: i.idInsumo || i.id,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || i.insumo?.unidadMedida || "und"
      }))
    };

    if (insumoId) {
      try {
        setSaving(true);
        const savedFicha = await fichasTecnicasService.saveFichaInsumoPreparado(insumoId, payload);
        populateFields(savedFicha);
        onSave?.(savedFicha);
        notify.success("Ficha Guardada", `Ficha técnica de "${insumoName || "Insumo Preparado"}" guardada exitosamente.`);
      } catch (err) {
        console.error(err);
        notify.error("Error", "No se pudo guardar la ficha técnica en el servidor.");
      } finally {
        setSaving(false);
      }
    } else {
      onSave?.(payload);
      notify.success("Ficha Lista", "La ficha técnica se guardará al crear el insumo preparado.");
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
            <p className="text-xs font-bold text-[#F05454] uppercase tracking-wider">Tiempo de Preparación</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
              ⏱️ {tiempoPreparacion ? `${tiempoPreparacion} min` : "No especificado"}
            </p>
          </div>
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Rendimiento</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
              ⚖️ {rendimiento || "1 receta base"}
            </p>
          </div>
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Vida Útil</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1">
              🌿 {vidaUtil || "Según fecha de lote"}
            </p>
          </div>
        </div>

        {/* Insumos Base */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Ingredientes / Insumos Base Requeridos</p>
          {insumos.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {insumos.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo || item.id}`}
                  </span>
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
                    {item.cantidad} {item.unidadMedida || item.insumo?.unidadMedida || "und"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No hay ingredientes base configurados para esta receta.</p>
          )}
        </div>

        {/* Procedimiento */}
        {procedimiento && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-2">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Procedimiento de Preparación</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {procedimiento}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header collapsable */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F05454] text-white flex items-center justify-center font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Ficha Técnica / Receta del Insumo Preparado
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {insumoName ? `Receta de ${insumoName}` : "Ingredientes, porciones, instrucciones de preparación y conservación"}
            </p>
          </div>
        </div>
        <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6 pt-2">
          {/* 1. SECCIÓN DE INGREDIENTES / INSUMOS BASE */}
          <div className="bg-gray-50/50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-[#F05454]" />
                Ingredientes / Insumos Base Utilizados
              </label>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {insumos.length} ingrediente{insumos.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Buscador de insumos disponibles */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInsumo}
                onChange={(e) => setSearchInsumo(e.target.value)}
                placeholder="Buscar insumo base para agregar (ej. Sal, Harina, Tomate)..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent outline-none"
              />
              {insumosSugeridos.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 max-h-56 overflow-y-auto">
                  {insumosSugeridos.map((ins) => (
                    <button
                      key={ins.id || ins.idInsumo}
                      type="button"
                      onClick={() => agregarInsumo(ins)}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-between transition group"
                    >
                      <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-[#F05454]">
                        {ins.nombre}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md">
                        {ins.unidadMedida || "und"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lista de ingredientes agregados */}
            {insumos.length > 0 ? (
              <div className="space-y-2">
                {insumos.map((item, idx) => {
                  const nombre = item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo || item.id}`;
                  const unidad = item.unidadMedida || item.insumo?.unidadMedida || "und";
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-2xs"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{nombre}</p>
                        <p className="text-xs text-gray-400">Unidad: {unidad}</p>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(idx, -1)}
                          disabled={Number(item.cantidad) <= 1}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-bold transition cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={item.cantidad}
                          onKeyDown={(e) => {
                            if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => setCantidadDirecta(idx, e.target.value)}
                          onBlur={() => handleCantidadBlur(idx)}
                          className="w-16 px-2 py-1 text-center font-bold text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-[#F05454] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => actualizarCantidad(idx, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold text-gray-500 min-w-[28px]">{unidad}</span>
                        <button
                          type="button"
                          onClick={() => quitarInsumo(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition ml-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-2">
                Usa el buscador para añadir los ingredientes base de este preparado.
              </p>
            )}
          </div>

          {/* 2. PROCEDIMIENTO E INSTRUCCIONES */}
          <div>
            <label className={labelCls}>
              Procedimiento de Preparación / Elaboración Paso a Paso{requiredMark}
            </label>
            <textarea
              rows={4}
              value={procedimiento}
              onChange={(e) => setProcedimiento(e.target.value)}
              placeholder="1. Picar finamente la cebolla y el ajo.&#10;2. Sofreír a fuego medio durante 5 minutos.&#10;3. Licuar con las especias hasta obtener consistencia homogénea."
              className={inputCls}
            />
          </div>

          {/* 3. PARÁMETROS TÉCNICOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Tiempo de Preparación (Minutos){requiredMark}
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={tiempoPreparacion}
                onKeyDown={(e) => {
                  if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={handleTiempoChange}
                onBlur={handleTiempoBlur}
                placeholder="Ej. 15"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Rendimiento / Porciones{requiredMark}
              </label>
              <input
                type="text"
                value={rendimiento}
                onChange={(e) => setRendimiento(e.target.value)}
                placeholder="Ej. 1 Litro (10 porciones)"
                className={inputCls}
              />
            </div>
          </div>

          {/* 4. ESPECIFICACIONES Y CONSERVACIÓN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Condiciones de Almacenamiento{requiredMark}
              </label>
              <input
                type="text"
                value={condicionesAlmacenamiento}
                onChange={(e) => setCondicionesAlmacenamiento(e.target.value)}
                placeholder="Ej. Refrigerar entre 2°C y 4°C en recipiente hermético"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Vida Útil{requiredMark}
              </label>
              <input
                type="text"
                value={vidaUtil}
                onChange={(e) => setVidaUtil(e.target.value)}
                placeholder="Ej. 5 días refrigerado"
                className={inputCls}
              />
            </div>
          </div>

          {/* 5. CARACTERÍSTICAS Y ESPECIFICACIONES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Especificaciones Técnicas / Calidad{requiredMark}
              </label>
              <textarea
                rows={2}
                value={especificaciones}
                onChange={(e) => setEspecificaciones(e.target.value)}
                placeholder="Textura, color, espesor o parámetros de calidad..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Características Organolépticas{requiredMark}
              </label>
              <textarea
                rows={2}
                value={caracteristicas}
                onChange={(e) => setCaracteristicas(e.target.value)}
                placeholder="Sabor, aroma, aspecto visual..."
                className={inputCls}
              />
            </div>
          </div>

          {/* 6. INFORMACIÓN NUTRICIONAL Y OBSERVACIONES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Información Nutricional{requiredMark}
              </label>
              <input
                type="text"
                value={informacionNutricional}
                onChange={(e) => setInformacionNutricional(e.target.value)}
                placeholder="Ej. Calorías: 120 kcal, Grasas: 5g por porción"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Observaciones / Alérgenos</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Contiene lácteos, gluten, etc."
                className={inputCls}
              />
            </div>
          </div>

          {/* Botón Guardar Ficha */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Ficha Técnica"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
