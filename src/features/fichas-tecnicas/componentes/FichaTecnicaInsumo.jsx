import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronDown, ChevronUp, FileText, Check } from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";

const inputCls = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#F05454] focus:border-transparent text-sm";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
const requiredMark = <span className="text-red-500"> *</span>;

export function FichaTecnicaInsumo({ insumoId, insumoName, initialData, onSave }) {
  const notify = useNotifications();
  const [expanded, setExpanded] = useState(true);
  
  const [especificaciones, setEspecificaciones] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [informacionNutricional, setInformacionNutricional] = useState("");
  const [condicionesAlmacenamiento, setCondicionesAlmacenamiento] = useState("");
  const [vidaUtil, setVidaUtil] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [procedimiento, setProcedimiento] = useState("");
  const [tiempoPreparacion, setTiempoPreparacion] = useState("");
  const [rendimiento, setRendimiento] = useState("");

  const [saving, setSaving] = useState(false);
  const [loadingFicha, setLoadingFicha] = useState(Boolean(insumoId));
  const initialFichaRef = useRef(null);

  const loadFichaData = useCallback(async () => {
    setLoadingFicha(Boolean(insumoId));
    try {
      if (initialData) {
        populateFields(initialData);
        return;
      }
      if (insumoId) {
        const f = await fichasTecnicasService.getFichaByInsumo(insumoId);
        if (f && f.idFichaTecnica) {
          populateFields(f);
        }
      }
    } catch (err) {
      console.error("Error cargando ficha de insumo:", err);
    } finally {
      setLoadingFicha(false);
    }
  }, [insumoId, initialData]);

  useEffect(() => {
    loadFichaData();
  }, [loadFichaData]);

  const populateFields = (f) => {
    const fields = {
      especificaciones: f.especificaciones || "",
      caracteristicas: f.caracteristicas || "",
      informacionNutricional: f.informacionNutricional || "",
      condicionesAlmacenamiento: f.condicionesAlmacenamiento || "",
      vidaUtil: f.vidaUtil || "",
      observaciones: f.observaciones || "",
      procedimiento: f.procedimiento || "",
      tiempoPreparacion: Number(f.tiempoPreparacion) || 0,
      rendimiento: f.rendimiento || ""
    };
    initialFichaRef.current = fields;
    setEspecificaciones(fields.especificaciones);
    setCaracteristicas(fields.caracteristicas);
    setInformacionNutricional(fields.informacionNutricional);
    setCondicionesAlmacenamiento(fields.condicionesAlmacenamiento);
    setVidaUtil(fields.vidaUtil);
    setObservaciones(fields.observaciones);
    setProcedimiento(fields.procedimiento);
    setTiempoPreparacion(fields.tiempoPreparacion);
    setRendimiento(fields.rendimiento);
  };

  const handleSave = async () => {
    const currentFields = {
      especificaciones,
      caracteristicas,
      informacionNutricional,
      condicionesAlmacenamiento,
      vidaUtil,
      observaciones,
      procedimiento,
      tiempoPreparacion: Number(tiempoPreparacion) || 0,
      rendimiento
    };

    const requiredFields = [
      ["Especificaciones técnicas", especificaciones],
      ["Características organolépticas / físicas", caracteristicas],
      ["Información nutricional", informacionNutricional],
      ["Condiciones de almacenamiento", condicionesAlmacenamiento],
      ["Vida útil", vidaUtil],
      ["Procedimiento de procesamiento / preparación", procedimiento],
      ["Tiempo de preparación", tiempoPreparacion],
      ["Rendimiento", rendimiento]
    ];
    const missingFields = requiredFields
      .filter(([, value]) => String(value ?? "").trim() === "")
      .map(([label]) => label);

    if (missingFields.length > 0) {
      notify.error("Campos obligatorios", `Completa los campos obligatorios: ${missingFields.join(", ")}.`);
      return;
    }

    const payload = { idInsumo: insumoId || null };
    if (!insumoId || !initialFichaRef.current) {
      Object.assign(payload, currentFields);
    } else {
      for (const [field, value] of Object.entries(currentFields)) {
        if (value !== initialFichaRef.current[field]) payload[field] = value;
      }
    }

    if (insumoId) {
      try {
        setSaving(true);
        const savedFicha = await fichasTecnicasService.saveFichaInsumo(insumoId, payload);
        populateFields(savedFicha);
        onSave?.(savedFicha);
        notify.success("Cambios Guardados", `Los cambios de la ficha técnica del insumo ${insumoName || ""} han sido guardados.`);
      } catch (err) {
        console.error(err);
        notify.error("Error", "No se pudo guardar la ficha técnica en la base de datos");
      } finally {
        setSaving(false);
      }
    } else {
      onSave?.(payload);
      notify.success("Ficha Técnica Lista", "La ficha técnica se guardará junto con el insumo al crearlo.");
    }
  };

  const isConfigured = especificaciones.trim() || caracteristicas.trim() || informacionNutricional.trim() || condicionesAlmacenamiento.trim() || observaciones.trim();

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
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Ficha Técnica del Insumo</h3>
          {isConfigured && !expanded && (
            <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium">
              Configurada
            </span>
          )}
        </div>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${expanded ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-6 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
          
          {/* Especificaciones */}
          <div>
            <label className={labelCls}>Especificaciones Técnicas{requiredMark}</label>
            <textarea
              value={especificaciones}
              onChange={(e) => setEspecificaciones(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              required
              placeholder="Describe las especificaciones técnicas (calibre, color, peso promedio...)"
            />
          </div>

          {/* Características */}
          <div>
            <label className={labelCls}>Características Organolépticas / Físicas{requiredMark}</label>
            <textarea
              value={caracteristicas}
              onChange={(e) => setCaracteristicas(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              required
              placeholder="Textura, sabor, frescura, ausencia de magulladuras..."
            />
          </div>

          {/* Información Nutricional */}
          <div>
            <label className={labelCls}>Información Nutricional (por 100g / unidad){requiredMark}</label>
            <textarea
              value={informacionNutricional}
              onChange={(e) => setInformacionNutricional(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              required
              placeholder="Calorías, proteínas, carbohidratos, grasas, fibra..."
            />
          </div>

          {/* Condiciones de Almacenamiento & Vida Útil */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Condiciones de Almacenamiento{requiredMark}</label>
              <textarea
                value={condicionesAlmacenamiento}
                onChange={(e) => setCondicionesAlmacenamiento(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                required
                placeholder="Temperatura, humedad recomendada..."
              />
            </div>
            <div>
              <label className={labelCls}>Vida Útil{requiredMark}</label>
              <textarea
                value={vidaUtil}
                onChange={(e) => setVidaUtil(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                required
                placeholder="Ej: 7 días refrigerado, 30 días congelado"
              />
            </div>
          </div>

          {/* Procedimiento & Rendimiento (Para insumos preparados) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Procedimiento de Procesamiento / Preparación{requiredMark}</label>
              <textarea
                value={procedimiento}
                onChange={(e) => setProcedimiento(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                required
                placeholder="Procedimiento de desinfección o pre-preparación..."
              />
            </div>
            <div>
              <label className={labelCls}>Observaciones / Advertencias</label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Alérgenos, certificaciones, notas del proveedor..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tiempo de Procesamiento / Preparación (min){requiredMark}</label>
              <NumberInput
                min="0"
                required
                value={tiempoPreparacion}
                onChange={(e) => setTiempoPreparacion(e.target.value)}
                className={inputCls}
                placeholder="Ej: 15"
              />
            </div>
            <div>
              <label className={labelCls}>Rendimiento{requiredMark}</label>
              <input
                type="text"
                required
                value={rendimiento}
                onChange={(e) => setRendimiento(e.target.value)}
                className={inputCls}
                placeholder="Ej: 1 porción"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={saving || loadingFicha}
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{loadingFicha ? "Cargando ficha..." : saving ? "Guardando..." : "Guardar Ficha Técnica"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
