import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, ShieldCheck, Clock, Layers, AlertCircle, ChevronDown, ChevronUp, FileText, Check, Package, X, Search, Minus, FlaskConical, Scale, Leaf, History, Calendar } from "lucide-react";
import { NumberInput } from "@/shared/components/ui/NumberInput";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { insumosService } from "@/features/compras/servicios/insumosService";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";
import { FichaVersionesHistorial } from "./FichaVersionesHistorial";
import {
  normalizeFichaWithVersions,
  formatFechaHoraFicha,
  extractFichaVersionMeta,
  buildRestoredVersionState
} from "../utils/fichaVersionUtils";

const inputCls = "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-[#F05454] focus:border-transparent text-sm";
const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
const requiredMark = <span className="text-red-500"> *</span>;

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {msg}
    </p>
  );
}

export function FichaTecnicaInsumo({
  insumoId,
  insumoName,
  initialData,
  onSave,
  onChange,
  readOnly = false,
  entityData = null,
  prevEntityData = null,
  onRestoreEntityData = null
}) {
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const loadedKeyRef = useRef(null);
  const [versionInfo, setVersionInfo] = useState({
    versionActual: 1,
    fechaInicioVigencia: null,
    versionesAnteriores: [],
    prevFichaSnapshot: null
  });

  const validateField = (field, val, currentInsumos = insumos) => {
    switch (field) {
      case "insumos":
        return (!currentInsumos || currentInsumos.length === 0) ? "Debes agregar al menos un ingrediente o insumo base." : "";
      case "procedimiento":
        return !val || !val.trim() ? "El procedimiento de preparación es obligatorio." : val.trim().length < 5 ? "Mínimo 5 caracteres para describir el procedimiento." : "";
      case "tiempoPreparacion":
        if (val === undefined || val === null || String(val).trim() === "") return "El tiempo de preparación es obligatorio.";
        if (Number(val) < 1) return "Debe ser al menos 1 minuto.";
        return "";
      case "rendimiento":
        return !val || !val.trim() ? "El rendimiento o porciones es obligatorio." : val.trim().length < 2 ? "Mínimo 2 caracteres." : "";
      case "especificaciones":
        return !val || !val.trim() ? "Las especificaciones técnicas son obligatorias." : val.trim().length < 3 ? "Mínimo 3 caracteres." : "";
      case "caracteristicas":
        return !val || !val.trim() ? "Las características organolépticas son obligatorias." : val.trim().length < 3 ? "Mínimo 3 caracteres." : "";
      case "informacionNutricional":
        return !val || !val.trim() ? "La información nutricional es obligatoria." : val.trim().length < 3 ? "Mínimo 3 caracteres." : "";
      case "condicionesAlmacenamiento":
        return !val || !val.trim() ? "Las condiciones de almacenamiento son obligatorias." : val.trim().length < 3 ? "Mínimo 3 caracteres." : "";
      case "vidaUtil":
        return !val || !val.trim() ? "La vida útil es obligatoria." : val.trim().length < 2 ? "Mínimo 2 caracteres." : "";
      default:
        return "";
    }
  };

  const handleBlur = (field, val) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const clearRestoredCommitFlag = useCallback(() => {
    setVersionInfo((prev) =>
      prev.prevFichaSnapshot?._isRestoredVersionCommit
        ? {
            ...prev,
            prevFichaSnapshot: {
              ...prev.prevFichaSnapshot,
              _isRestoredVersionCommit: false
            }
          }
        : prev
    );
  }, []);

  const handleFieldChange = (field, setter, val) => {
    clearRestoredCommitFlag();
    setter(val);
    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const getInputClass = (field) => {
    const isErr = touched[field] && errors[field];
    return `w-full px-4 py-2 border rounded-lg text-sm outline-none transition ${
      isErr
        ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-100 focus:ring-2 focus:ring-red-400"
        : "border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454] focus:border-transparent"
    }`;
  };

  // Load available base insumos list for ingredient selection
  useEffect(() => {
    insumosService.getInsumos()
      .then(res => setDbInsumosList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setDbInsumosList([]));
  }, []);

  const populateFields = useCallback((fRaw) => {
    if (!fRaw) return;
    const f = normalizeFichaWithVersions(fRaw, "INSUMO_PREPARADO", insumoId);
    if (fRaw?._isRestoredVersionCommit) {
      f._isRestoredVersionCommit = true;
    }
    setInsumos(f.detalles || f.insumos || f.ingredientes || []);
    setProcedimiento(f.procedimiento || f.descripcion || "");
    setTiempoPreparacion(f.tiempoPreparacion !== null && f.tiempoPreparacion !== undefined ? String(f.tiempoPreparacion) : "");
    setRendimiento(f.rendimiento || "");
    setEspecificaciones(f.especificaciones || "");
    setCaracteristicas(f.caracteristicas || "");
    setInformacionNutricional(f.informacionNutricional || "");
    setCondicionesAlmacenamiento(f.condicionesAlmacenamiento || "");
    setVidaUtil(f.vidaUtil || "");
    setObservaciones(extractFichaVersionMeta(f.observaciones || "").cleanObservaciones);
    setVersionInfo({
      versionActual: f.versionActual || 1,
      fechaInicioVigencia: f.fechaInicioVigencia || f.fechaCreacion || null,
      versionesAnteriores: Array.isArray(f.versionesAnteriores) ? f.versionesAnteriores : [],
      prevFichaSnapshot: f
    });
  }, [insumoId]);

  const handleRestoreVersion = async (ver) => {
    if (!ver) return;
    const currentFichaState = {
      ...(versionInfo.prevFichaSnapshot || {}),
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
      versionActual: versionInfo.versionActual,
      fechaInicioVigencia: versionInfo.fechaInicioVigencia,
      versionesAnteriores: versionInfo.versionesAnteriores,
      datosEntidad: entityData || versionInfo.prevFichaSnapshot?.datosEntidad || prevEntityData || null,
      detalles: insumos
    };

    const restored = buildRestoredVersionState(currentFichaState, ver, {
      tipo: "INSUMO_PREPARADO",
      entityId: insumoId
    });

    populateFields(restored);

    if (typeof onRestoreEntityData === "function") {
      onRestoreEntityData(restored.datosEntidad || ver.datosEntidad || entityData);
    }

    if (insumoId) {
      try {
        setSaving(true);
        const savedFicha = await fichasTecnicasService.saveFichaInsumoPreparado(insumoId, {
          ...restored,
          idInsumo: insumoId,
          idInsumoPreparado: insumoId,
          _prevFicha: restored,
          _isRestoredVersionCommit: true,
          _restoredSnapshot: restored
        });
        if (savedFicha) {
          const finalRestored = { ...savedFicha, _isRestoredVersionCommit: true };
          populateFields(finalRestored);
          onChange?.(finalRestored);
          onSave?.(finalRestored);
        }
      } catch (err) {
        console.error("Error restaurando versión de insumo preparado:", err);
      } finally {
        setSaving(false);
      }
    }

    notify.success(
      `Versión ${ver.version} Vigente (En uso actual)`,
      `Se cargó y activó la Versión ${ver.version} con su fecha de creación original y estado Vigente (En uso actual).`
    );
  };

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
      versionActual: versionInfo.versionActual,
      fechaInicioVigencia: versionInfo.fechaInicioVigencia,
      versionesAnteriores: versionInfo.versionesAnteriores,
      datosEntidad: entityData || versionInfo.prevFichaSnapshot?.datosEntidad || null,
      _prevDatosEntidad: prevEntityData || versionInfo.prevFichaSnapshot?.datosEntidad || entityData || null,
      _prevFicha: versionInfo.prevFichaSnapshot
        ? {
            ...versionInfo.prevFichaSnapshot,
            datosEntidad: versionInfo.prevFichaSnapshot.datosEntidad || prevEntityData || entityData || null
          }
        : null,
      _isRestoredVersionCommit: Boolean(versionInfo.prevFichaSnapshot?._isRestoredVersionCommit),
      _restoredSnapshot: versionInfo.prevFichaSnapshot,
      detalles: insumos.map((i) => ({
        idInsumo: i.idInsumo || i.id,
        nombreInsumo: i.nombreInsumo || i.insumo?.nombre || i.nombre,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || i.insumo?.unidadMedida || "und"
      })),
      insumos
    };

    if (onChange) {
      onChange(payload);
    }
  }, [insumos, procedimiento, tiempoPreparacion, rendimiento, especificaciones, caracteristicas, informacionNutricional, condicionesAlmacenamiento, vidaUtil, observaciones, insumoId, versionInfo.prevFichaSnapshot, versionInfo.versionActual, versionInfo.fechaInicioVigencia, versionInfo.versionesAnteriores, entityData, prevEntityData]);

  const insumosSugeridos = dbInsumosList.filter((ins) => {
    const t = searchInsumo.trim().toLowerCase();
    const nombre = ins.nombre || "";
    const yaAgregado = insumos.some((i) => String(i.idInsumo || i.id) === String(ins.id || ins.idInsumo));
    return t.length > 0 && nombre.toLowerCase().includes(t) && !yaAgregado;
  }).slice(0, 6);

  const agregarInsumo = (ins) => {
    clearRestoredCommitFlag();
    const next = [
      ...insumos,
      {
        idInsumo: ins.id || ins.idInsumo,
        nombreInsumo: ins.nombre,
        insumo: { nombre: ins.nombre, unidadMedida: ins.unidadMedida },
        cantidad: 1,
        unidadMedida: ins.unidadMedida || "und"
      }
    ];
    setInsumos(next);
    setSearchInsumo("");
    if (touched.insumos) {
      setErrors((prev) => ({ ...prev, insumos: validateField("insumos", null, next) }));
    }
  };

  const quitarInsumo = (idx) => {
    clearRestoredCommitFlag();
    const next = insumos.filter((_, i) => i !== idx);
    setInsumos(next);
    if (touched.insumos) {
      setErrors((prev) => ({ ...prev, insumos: validateField("insumos", null, next) }));
    }
  };

  const actualizarCantidad = (idx, delta) => {
    clearRestoredCommitFlag();
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
    clearRestoredCommitFlag();
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
    clearRestoredCommitFlag();
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setTiempoPreparacion('');
      if (touched.tiempoPreparacion) {
        setErrors((prev) => ({ ...prev, tiempoPreparacion: validateField("tiempoPreparacion", "") }));
      }
      return;
    }
    const num = Math.max(1, parseInt(raw, 10));
    setTiempoPreparacion(String(num));
    if (touched.tiempoPreparacion) {
      setErrors((prev) => ({ ...prev, tiempoPreparacion: validateField("tiempoPreparacion", String(num)) }));
    }
  };

  const handleTiempoBlur = () => {
    let finalVal = tiempoPreparacion;
    if (tiempoPreparacion === '' || Number(tiempoPreparacion) < 1) {
      finalVal = '1';
      setTiempoPreparacion('1');
    }
    handleBlur("tiempoPreparacion", finalVal);
  };

  const handleSave = async () => {
    const allTouched = {
      insumos: true,
      procedimiento: true,
      tiempoPreparacion: true,
      rendimiento: true,
      condicionesAlmacenamiento: true,
      vidaUtil: true,
      especificaciones: true,
      caracteristicas: true,
      informacionNutricional: true,
    };
    setTouched(allTouched);

    const newErrors = {
      insumos: validateField("insumos", null, insumos),
      procedimiento: validateField("procedimiento", procedimiento),
      tiempoPreparacion: validateField("tiempoPreparacion", tiempoPreparacion),
      rendimiento: validateField("rendimiento", rendimiento),
      condicionesAlmacenamiento: validateField("condicionesAlmacenamiento", condicionesAlmacenamiento),
      vidaUtil: validateField("vidaUtil", vidaUtil),
      especificaciones: validateField("especificaciones", especificaciones),
      caracteristicas: validateField("caracteristicas", caracteristicas),
      informacionNutricional: validateField("informacionNutricional", informacionNutricional),
    };

    setErrors(newErrors);

    const missingLabels = [];
    if (newErrors.insumos) missingLabels.push("Ingredientes / insumos base necesarios");
    if (newErrors.procedimiento) missingLabels.push("Procedimiento de preparación");
    if (newErrors.tiempoPreparacion) missingLabels.push("Tiempo de preparación");
    if (newErrors.rendimiento) missingLabels.push("Rendimiento / porciones");
    if (newErrors.condicionesAlmacenamiento) missingLabels.push("Condiciones de almacenamiento");
    if (newErrors.vidaUtil) missingLabels.push("Vida útil");
    if (newErrors.especificaciones) missingLabels.push("Especificaciones técnicas");
    if (newErrors.caracteristicas) missingLabels.push("Características organolépticas");
    if (newErrors.informacionNutricional) missingLabels.push("Información nutricional");

    if (missingLabels.length > 0) {
      notify.error("Campos obligatorios", `Completa los siguientes campos obligatorios de la ficha técnica: ${missingLabels.join(", ")}.`);
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
      versionActual: versionInfo.versionActual,
      fechaInicioVigencia: versionInfo.fechaInicioVigencia,
      versionesAnteriores: versionInfo.versionesAnteriores,
      datosEntidad: entityData || versionInfo.prevFichaSnapshot?.datosEntidad || null,
      _prevDatosEntidad: prevEntityData || versionInfo.prevFichaSnapshot?.datosEntidad || entityData || null,
      _prevFicha: versionInfo.prevFichaSnapshot
        ? {
            ...versionInfo.prevFichaSnapshot,
            datosEntidad: versionInfo.prevFichaSnapshot.datosEntidad || prevEntityData || entityData || null
          }
        : null,
      _isRestoredVersionCommit: Boolean(versionInfo.prevFichaSnapshot?._isRestoredVersionCommit),
      _restoredSnapshot: versionInfo.prevFichaSnapshot,
      detalles: insumos.map((i) => ({
        idInsumo: i.idInsumo || i.id,
        nombreInsumo: i.nombreInsumo || i.insumo?.nombre || i.nombre,
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
        notify.success(
          "Ficha Guardada",
          `La Versión ${savedFicha?.versionActual || versionInfo.versionActual} de "${insumoName || "Insumo Preparado"}" se encuentra Vigente (En uso actual).`
        );
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
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F05454]" />
              <span>{tiempoPreparacion ? `${tiempoPreparacion} min` : "No especificado"}</span>
            </p>
          </div>
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Rendimiento</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-500" />
              <span>{rendimiento || "1 receta base"}</span>
            </p>
          </div>
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Vida Útil</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span>{vidaUtil || "Según fecha de lote"}</span>
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

        {/* Historial de Versionamiento en modo lectura */}
        <FichaVersionesHistorial
          versionActual={versionInfo.versionActual}
          fechaInicioVigencia={versionInfo.fechaInicioVigencia}
          versionesAnteriores={versionInfo.versionesAnteriores}
        />
      </div>
    );
  }

  const isConfigured = insumos.length > 0 || procedimiento.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header collapsable */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between cursor-pointer p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl transition hover:bg-rose-50 dark:hover:bg-rose-950/30"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-xl bg-[#F05454] text-white flex items-center justify-center font-bold shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Ficha Técnica / Receta del Insumo Preparado
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
                Versión {versionInfo.versionActual} (Vigente)
              </span>
              {versionInfo.versionesAnteriores.length > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <History className="w-3 h-3" /> {versionInfo.versionesAnteriores.length} versión(es) anterior(es)
                </span>
              )}
            </div>
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
          {/* Banner informativo de vigencia y versionamiento */}
          {insumoId && isConfigured && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="font-black text-emerald-900 dark:text-emerald-200">
                    Versión Actual (v{versionInfo.versionActual}):{" "}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Vigente desde el{" "}
                    <strong className="text-gray-900 dark:text-gray-100">
                      {formatFechaHoraFicha(versionInfo.fechaInicioVigencia)}
                    </strong>
                    . Al guardar cambios, esta versión pasará a{" "}
                    <strong className="text-[#F05454]">Versiones Anteriores</strong> con su fecha y hora exacta de finalización de uso.
                  </span>
                </div>
              </div>
            </div>
          )}
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
              <div className={`border-2 border-dashed rounded-2xl py-6 text-center transition ${
                touched.insumos && errors.insumos ? "border-red-400 bg-red-50/20 dark:bg-red-950/20" : "border-gray-200 dark:border-gray-700"
              }`}>
                <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Usa el buscador para añadir los ingredientes base de este preparado.
                </p>
              </div>
            )}
            <FieldError msg={touched.insumos && errors.insumos} />
          </div>

          {/* 2. PROCEDIMIENTO E INSTRUCCIONES */}
          <div>
            <label className={labelCls}>
              Procedimiento de Preparación / Elaboración Paso a Paso{requiredMark}
            </label>
            <textarea
              rows={4}
              value={procedimiento}
              onChange={(e) => handleFieldChange("procedimiento", setProcedimiento, e.target.value)}
              onBlur={() => handleBlur("procedimiento", procedimiento)}
              placeholder="1. Picar finamente la cebolla y el ajo.&#10;2. Sofreír a fuego medio durante 5 minutos.&#10;3. Licuar con las especias hasta obtener consistencia homogénea."
              className={`${getInputClass("procedimiento")} resize-none`}
            />
            <FieldError msg={touched.procedimiento && errors.procedimiento} />
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
                className={getInputClass("tiempoPreparacion")}
              />
              <FieldError msg={touched.tiempoPreparacion && errors.tiempoPreparacion} />
            </div>
            <div>
              <label className={labelCls}>
                Rendimiento / Porciones{requiredMark}
              </label>
              <input
                type="text"
                value={rendimiento}
                onChange={(e) => handleFieldChange("rendimiento", setRendimiento, e.target.value)}
                onBlur={() => handleBlur("rendimiento", rendimiento)}
                placeholder="Ej. 1 Litro (10 porciones)"
                className={getInputClass("rendimiento")}
              />
              <FieldError msg={touched.rendimiento && errors.rendimiento} />
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
                onChange={(e) => handleFieldChange("condicionesAlmacenamiento", setCondicionesAlmacenamiento, e.target.value)}
                onBlur={() => handleBlur("condicionesAlmacenamiento", condicionesAlmacenamiento)}
                placeholder="Ej. Refrigerar entre 2°C y 4°C en recipiente hermético"
                className={getInputClass("condicionesAlmacenamiento")}
              />
              <FieldError msg={touched.condicionesAlmacenamiento && errors.condicionesAlmacenamiento} />
            </div>
            <div>
              <label className={labelCls}>
                Vida Útil{requiredMark}
              </label>
              <input
                type="text"
                value={vidaUtil}
                onChange={(e) => handleFieldChange("vidaUtil", setVidaUtil, e.target.value)}
                onBlur={() => handleBlur("vidaUtil", vidaUtil)}
                placeholder="Ej. 5 días refrigerado"
                className={getInputClass("vidaUtil")}
              />
              <FieldError msg={touched.vidaUtil && errors.vidaUtil} />
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
                onChange={(e) => handleFieldChange("especificaciones", setEspecificaciones, e.target.value)}
                onBlur={() => handleBlur("especificaciones", especificaciones)}
                placeholder="Textura, color, espesor o parámetros de calidad..."
                className={`${getInputClass("especificaciones")} resize-none`}
              />
              <FieldError msg={touched.especificaciones && errors.especificaciones} />
            </div>
            <div>
              <label className={labelCls}>
                Características Organolépticas{requiredMark}
              </label>
              <textarea
                rows={2}
                value={caracteristicas}
                onChange={(e) => handleFieldChange("caracteristicas", setCaracteristicas, e.target.value)}
                onBlur={() => handleBlur("caracteristicas", caracteristicas)}
                placeholder="Sabor, aroma, aspecto visual..."
                className={`${getInputClass("caracteristicas")} resize-none`}
              />
              <FieldError msg={touched.caracteristicas && errors.caracteristicas} />
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
                onChange={(e) => handleFieldChange("informacionNutricional", setInformacionNutricional, e.target.value)}
                onBlur={() => handleBlur("informacionNutricional", informacionNutricional)}
                placeholder="Ej. Calorías: 120 kcal, Grasas: 5g por porción"
                className={getInputClass("informacionNutricional")}
              />
              <FieldError msg={touched.informacionNutricional && errors.informacionNutricional} />
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

          {/* Historial de Versiones Anteriores */}
          {insumoId && (
            <FichaVersionesHistorial
              versionActual={versionInfo.versionActual}
              fechaInicioVigencia={versionInfo.fechaInicioVigencia}
              versionesAnteriores={versionInfo.versionesAnteriores}
              onRestoreVersion={handleRestoreVersion}
              datosEntidadActual={entityData || versionInfo.prevFichaSnapshot?.datosEntidad || prevEntityData}
            />
          )}
        </div>
      )}
    </div>
  );
}
