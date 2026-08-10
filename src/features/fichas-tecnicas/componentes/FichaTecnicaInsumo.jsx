import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";

const inputCls = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";

export function FichaTecnicaInsumo({ insumoId, insumoName, initialData, onSave }) {
  const notify = useNotifications();
  const [expanded, setExpanded] = useState(false);
  const [especificaciones, setEspecificaciones] = useState(initialData?.especificaciones || "");
  const [caracteristicas, setCaracteristicas] = useState(initialData?.caracteristicas || "");
  const [informacionNutricional, setInformacionNutricional] = useState(initialData?.informacionNutricional || "");
  const [condicionesAlmacenamiento, setCondicionesAlmacenamiento] = useState(initialData?.condicionesAlmacenamiento || "");
  const [vidaUtil, setVidaUtil] = useState(initialData?.vidaUtil || "");
  const [observaciones, setObservaciones] = useState(initialData?.observaciones || "");

  const handleSave = async () => {
    const payload = {
      especificaciones,
      caracteristicas,
      informacionNutricional,
      condicionesAlmacenamiento,
      vidaUtil,
      observaciones
    };

    if (onSave) {
      onSave(payload);
    }

    notify.success("Ficha Técnica Guardada", "La ficha técnica se adjuntó/guardó correctamente.");
  };

  const hasFichaTecnica = initialData && (initialData.especificaciones || initialData.caracteristicas || initialData.informacionNutricional || initialData.condicionesAlmacenamiento);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
          <FileText className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Ficha Técnica</h3>
          {hasFichaTecnica && !expanded && (
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
              Configurada
            </span>
          )}
        </div>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${expanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          {/* Especificaciones */}
          <div>
            <label className={labelCls}>Especificaciones Técnicas</label>
            <textarea
              value={especificaciones}
              onChange={(e) => setEspecificaciones(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder={"Describe las especificaciones técnicas del insumo...\n\nEjemplo:\n- Calibre: Grande\n- Color: Rojo intenso\n- Peso promedio: 150-200g"}
            />
          </div>

          {/* Características */}
          <div>
            <label className={labelCls}>Características</label>
            <textarea
              value={caracteristicas}
              onChange={(e) => setCaracteristicas(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder={"Describe las características principales...\n\nEjemplo:\n- Textura firme\n- Sabor dulce\n- Sin magulladuras\n- Libre de pesticidas"}
            />
          </div>

          {/* Información Nutricional */}
          <div>
            <label className={labelCls}>Información Nutricional (por 100g o unidad)</label>
            <textarea
              value={informacionNutricional}
              onChange={(e) => setInformacionNutricional(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={5}
              placeholder={"Información nutricional del insumo...\n\nEjemplo:\nCalorías: 18 kcal\nProteínas: 0.9g\nCarbohidratos: 3.9g\nGrasas: 0.2g\nFibra: 1.2g"}
            />
          </div>

          {/* Condiciones de Almacenamiento */}
          <div>
            <label className={labelCls}>Condiciones de Almacenamiento</label>
            <textarea
              value={condicionesAlmacenamiento}
              onChange={(e) => setCondicionesAlmacenamiento(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder={"Describe cómo debe almacenarse el insumo...\n\nEjemplo:\n- Temperatura: 4-8°C\n- Humedad relativa: 85-95%\n- Almacenar en lugar ventilado\n- Alejado de productos químicos"}
            />
          </div>

          {/* Vida Útil */}
          <div>
            <label className={labelCls}>Vida Útil</label>
            <input
              type="text"
              value={vidaUtil}
              onChange={(e) => setVidaUtil(e.target.value)}
              className={inputCls}
              placeholder="Ej: 7 días en refrigeración, 30 días congelado"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className={labelCls}>Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Notas adicionales, advertencias, certificaciones, origen, etc."
            />
          </div>

          {/* Botón de guardado */}
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
