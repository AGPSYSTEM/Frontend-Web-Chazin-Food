import { useState, useEffect } from "react";
import { X, FlaskConical } from "lucide-react";
import { FichaTecnicaInsumo } from "@/features/fichas-tecnicas/componentes/FichaTecnicaInsumo";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";

const inputCls = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

export function InsumoPreparadoModal({
  isOpen,
  onClose,
  onSave,
  insumoPreparado = null,
  insumosDisponibles = []
}) {
  const notify = useNotifications();
  const isEditing = !!insumoPreparado;

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState(0);
  const [unidadMedida, setUnidadMedida] = useState("und — unidad");
  const [estado, setEstado] = useState("Activo");
  const [initialFichaTecnica, setInitialFichaTecnica] = useState(null);
  const [fichaTecnica, setFichaTecnica] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (insumoPreparado) {
      setNombre(insumoPreparado.nombre || "");
      setDescripcion(insumoPreparado.descripcion || "");
      setPrecio(insumoPreparado.precio || insumoPreparado.costo || 0);
      setUnidadMedida(insumoPreparado.unidadMedida || "und — unidad");
      setEstado(insumoPreparado.estado === 1 || insumoPreparado.estado === "Activo" || insumoPreparado.estado === "1" ? "Activo" : "Inactivo");

      if (insumoPreparado.fichaTecnica) {
        setInitialFichaTecnica(insumoPreparado.fichaTecnica);
        setFichaTecnica(insumoPreparado.fichaTecnica);
      } else if (insumoPreparado.id) {
        fichasTecnicasService.getFichaByInsumoPreparado(insumoPreparado.id)
          .then(f => {
            if (f) {
              setInitialFichaTecnica(f);
              setFichaTecnica(f);
            }
          })
          .catch(console.error);
      } else {
        setInitialFichaTecnica(null);
        setFichaTecnica(null);
      }
    } else {
      setNombre("");
      setDescripcion("");
      setPrecio(0);
      setUnidadMedida("und — unidad");
      setEstado("Activo");
      setInitialFichaTecnica(null);
      setFichaTecnica(null);
    }
  }, [insumoPreparado, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      notify.warning("Campo Requerido", "Por favor ingresa el nombre del insumo preparado.");
      return;
    }

    if (precio === "" || isNaN(precio) || Number(precio) < 0) {
      notify.warning("Campo Requerido", "Por favor ingresa un precio o costo válido.");
      return;
    }

    // Validar todos los campos de la ficha técnica (menos observaciones)
    const ft = fichaTecnica || {};
    const missingFields = [];

    const ingredientes = ft.detalles || ft.insumos || ft.ingredientes || [];
    if (!ingredientes || ingredientes.length === 0) {
      missingFields.push("Ingredientes / Insumos Base (mínimo 1)");
    }

    if (!ft.procedimiento || !ft.procedimiento.trim()) {
      missingFields.push("Procedimiento de Preparación");
    }

    if (!ft.tiempoPreparacion || Number(ft.tiempoPreparacion) < 1) {
      missingFields.push("Tiempo de Preparación (mínimo 1 min)");
    }

    if (!ft.rendimiento || !ft.rendimiento.trim()) {
      missingFields.push("Rendimiento / Porciones");
    }

    if (!ft.condicionesAlmacenamiento || !ft.condicionesAlmacenamiento.trim()) {
      missingFields.push("Condiciones de Almacenamiento");
    }

    if (!ft.vidaUtil || !ft.vidaUtil.trim()) {
      missingFields.push("Vida Útil");
    }

    if (!ft.especificaciones || !ft.especificaciones.trim()) {
      missingFields.push("Especificaciones Técnicas / Calidad");
    }

    if (!ft.caracteristicas || !ft.caracteristicas.trim()) {
      missingFields.push("Características Organolépticas");
    }

    if (!ft.informacionNutricional || !ft.informacionNutricional.trim()) {
      missingFields.push("Información Nutricional");
    }

    if (missingFields.length > 0) {
      notify.error(
        "Ficha Técnica Incompleta",
        `Por favor completa los siguientes campos obligatorios de la ficha técnica: ${missingFields.join(", ")}.`
      );
      return;
    }

    onSave({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: Number(precio) || 0,
      unidadMedida,
      tipo: "Preparado",
      estado,
      fichaTecnica: {
        ...ft,
        procedimiento: ft.procedimiento.trim(),
        tiempoPreparacion: Number(ft.tiempoPreparacion) || 1,
        rendimiento: ft.rendimiento.trim(),
        especificaciones: ft.especificaciones.trim(),
        caracteristicas: ft.caracteristicas.trim(),
        informacionNutricional: ft.informacionNutricional.trim(),
        condicionesAlmacenamiento: ft.condicionesAlmacenamiento.trim(),
        vidaUtil: ft.vidaUtil.trim(),
        observaciones: (ft.observaciones || "").trim(),
        detalles: ingredientes
      },
      ingredientes
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-[#F05454] flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {isEditing ? "Editar Insumo Preparado" : "Nuevo Insumo Preparado"}
              </h2>
              <p className="text-xs text-gray-400">
                {isEditing ? "Modifica la receta, ingredientes, estado y parámetros del preparado" : "Registra un nuevo insumo preparado y crea su ficha técnica de una vez"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                Nombre del Insumo Preparado <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className={inputCls}
                placeholder="Ej: Salsa de la Casa, Carne Especial, Masa para Pizza..."
              />
            </div>

            <div>
              <label className={labelCls}>Descripción u Observaciones</label>
              <textarea
                rows={2}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={`${inputCls} resize-none`}
                placeholder="Descripción, características o modo de uso del preparado..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>
                  Precio / Costo Estimado <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className={`${inputCls} pl-8`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Unidad de Medida</label>
                <select
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  className={`${inputCls} cursor-pointer`}
                >
                  <option value="und — unidad">und — unidad</option>
                  <option value="porción">porción</option>
                  <option value="Kg">Kg — Kilogramos</option>
                  <option value="Gr">Gr — Gramos</option>
                  <option value="Lt">Lt — Litros</option>
                  <option value="Ml">Ml — Mililitros</option>
                  <option value="paq">paq — Paquete</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Estado</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className={`${inputCls} cursor-pointer font-medium`}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Ficha Técnica */}
          <FichaTecnicaInsumo
            insumoId={insumoPreparado?.id}
            insumoName={nombre}
            initialData={initialFichaTecnica}
            onChange={(data) => setFichaTecnica(data)}
            onSave={(data) => setFichaTecnica(data)}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>{isEditing ? "Guardar Cambios" : "Crear Insumo Preparado"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InsumoPreparadoModal;
