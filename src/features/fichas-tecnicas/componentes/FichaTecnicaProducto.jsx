import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, ShieldCheck, Clock, Layers, AlertCircle, ChevronDown, ChevronUp, FileText, Check, Package, X, Search, Minus, UtensilsCrossed, Leaf, Calculator, ArrowUp, ArrowDown, Sparkles, History, Calendar } from "lucide-react";
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

const FASES_DEFAULT = [
  { id: "p1", fase: "Alistamiento / Mise en place", descripcion: "" },
  { id: "p2", fase: "Cocción / Procesamiento térmico", descripcion: "" },
  { id: "p3", fase: "Ensamblaje y Montaje", descripcion: "" },
  { id: "p4", fase: "Control de Calidad y Empaque", descripcion: "" }
];

function desglosarProcedimiento(texto) {
  if (!texto || !String(texto).trim()) {
    return FASES_DEFAULT.map((f, i) => ({ ...f, id: `fase-${i}-${Date.now()}` }));
  }
  const str = String(texto).trim();
  const lineas = str.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed = [];

  for (let l of lineas) {
    const match = l.match(/^(?:(?:\d+[\.\)-]|Paso\s*\d+:?))\s*(?:([^:]+):)?\s*(.*)$/i);
    if (match) {
      let faseNombre = match[1] ? match[1].trim() : `Paso ${parsed.length + 1}`;
      // #102: Evitar numeración redundante "1. 1."
      faseNombre = faseNombre.replace(/^\d+[\.\-\)]\s*/, "").trim() || `Paso ${parsed.length + 1}`;
      const desc = match[2] ? match[2].trim() : "";
      parsed.push({
        id: `p-${Date.now()}-${parsed.length}-${Math.random().toString(36).slice(2, 6)}`,
        fase: faseNombre,
        descripcion: desc
      });
    } else {
      if (parsed.length > 0) {
        parsed[parsed.length - 1].descripcion += (parsed[parsed.length - 1].descripcion ? "\n" : "") + l;
      } else {
        parsed.push({
          id: `p-${Date.now()}-0`,
          fase: "Proceso Inicial",
          descripcion: l
        });
      }
    }
  }

  return parsed.length > 0 ? parsed : FASES_DEFAULT.map((f, i) => ({ ...f, id: `fase-${i}-${Date.now()}` }));
}

function serializarPasos(pasos) {
  if (!Array.isArray(pasos) || pasos.length === 0) return "";
  return pasos
    .filter(p => p && p.descripcion && String(p.descripcion).trim())
    .map((p, idx) => {
      // #102: Limpiar prefijo numérico existente para evitar duplicados "1. 1."
      const cleanFase = (p.fase || `Paso ${idx + 1}`).replace(/^\d+[\.\-\)]\s*/, "").trim() || `Paso ${idx + 1}`;
      return `${idx + 1}. ${cleanFase}: ${String(p.descripcion).trim()}`;
    })
    .join("\n\n");
}

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

export function FichaTecnicaProducto({
  productId,
  productName,
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
  // Requisito 102: Estructura de orden lógico de procesos de preparación
  const [pasosProceso, setPasosProceso] = useState(FASES_DEFAULT);
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [versionInfo, setVersionInfo] = useState({
    versionActual: 1,
    fechaInicioVigencia: null,
    versionesAnteriores: [],
    prevFichaSnapshot: null
  });

  const validateField = (field, val, currentInsumos = insumos) => {
    switch (field) {
      case "insumos":
        return (!currentInsumos || currentInsumos.length === 0) ? "Debes agregar al menos un ingrediente o insumo." : "";
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

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const lastSentRef = useRef("");
  const isMountedRef = useRef(false);

  // Sincronizar cambios en tiempo real hacia el componente padre (solo si cambiaron)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
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
      detalles: insumos.map(i => {
        const cost = Number(i.costoUnitario || i.precioUnitario || i.insumo?.precioUnitario || i.insumo?.costo || 0);
        return {
          idInsumo: i.idInsumo || i.id,
          nombreInsumo: i.nombreInsumo || i.insumo?.nombre,
          cantidad: Number(i.cantidad || 1),
          unidadMedida: i.unidadMedida || 'und',
          costoUnitario: cost
        };
      })
    };
    const key = JSON.stringify(payload);
    if (key !== lastSentRef.current) {
      lastSentRef.current = key;
      if (typeof onChangeRef.current === "function") {
        onChangeRef.current(payload);
      }
    }
  }, [
    procedimiento, tiempoPreparacion, rendimiento, especificaciones,
    caracteristicas, informacionNutricional, condicionesAlmacenamiento,
    vidaUtil, observaciones, insumos, productId, versionInfo.prevFichaSnapshot,
    versionInfo.versionActual, versionInfo.fechaInicioVigencia, versionInfo.versionesAnteriores,
    entityData, prevEntityData
  ]);

  // Load insumos list for autocomplete search
  useEffect(() => {
    insumosService.getInsumos()
      .then(res => setDbInsumosList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setDbInsumosList([]));
  }, []);

  const loadedInitialRef = useRef(null);

  // Load ficha data from prop or backend API
  const loadFichaData = useCallback(async () => {
    if (initialData && initialData !== loadedInitialRef.current) {
      loadedInitialRef.current = initialData;
      populateFields(initialData);
      return;
    }
    if (productId && !initialData) {
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

  const populateFields = (fRaw) => {
    const f = normalizeFichaWithVersions(fRaw, "PRODUCTO", productId);
    if (fRaw?._isRestoredVersionCommit) {
      f._isRestoredVersionCommit = true;
    }
    const rawInsumos = f.detalles || f.insumos || [];
    setInsumos(rawInsumos.map(item => {
      const matchDb = dbInsumosList.find(d => String(d.id || d.idInsumo) === String(item.idInsumo || item.id));
      const cost = Number(item.costoUnitario || item.precioUnitario || matchDb?.precioUnitario || matchDb?.costo || 0);
      return {
        ...item,
        nombreInsumo: item.nombreInsumo || item.insumo?.nombre || item.nombre || matchDb?.nombre,
        costoUnitario: cost
      };
    }));
    const procText = f.procedimiento || f.descripcion || "";
    setProcedimiento(procText);
    setPasosProceso(desglosarProcedimiento(procText));
    setTiempoPreparacion(f.tiempoPreparacion ?? "");
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
  };

  const handleRestoreVersion = async (ver) => {
    if (!ver) return;
    const currentFichaState = {
      ...(versionInfo.prevFichaSnapshot || {}),
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
      versionActual: versionInfo.versionActual,
      fechaInicioVigencia: versionInfo.fechaInicioVigencia,
      versionesAnteriores: versionInfo.versionesAnteriores,
      datosEntidad: entityData || versionInfo.prevFichaSnapshot?.datosEntidad || prevEntityData || null,
      detalles: insumos
    };

    const restored = buildRestoredVersionState(currentFichaState, ver, {
      tipo: "PRODUCTO",
      entityId: productId
    });

    populateFields(restored);

    if (typeof onRestoreEntityData === "function") {
      onRestoreEntityData(restored.datosEntidad || ver.datosEntidad || entityData);
    }

    if (productId) {
      try {
        setSaving(true);
        const savedFicha = await fichasTecnicasService.saveFichaProducto(productId, {
          ...restored,
          idProducto: productId,
          _prevFicha: restored,
          _isRestoredVersionCommit: true,
          _restoredSnapshot: restored
        });
        if (savedFicha) {
          const finalRestored = { ...savedFicha, _isRestoredVersionCommit: true };
          populateFields(finalRestored);
          if (typeof onChangeRef.current === "function") {
            onChangeRef.current(finalRestored);
          }
          if (typeof onSave === "function") {
            onSave(finalRestored);
          }
        }
      } catch (err) {
        console.error("Error restaurando versión de ficha técnica:", err);
      } finally {
        setSaving(false);
      }
    }

    notify.success(
      `Versión ${ver.version} Vigente (En uso actual)`,
      `Se cargó y activó la Versión ${ver.version} con su fecha de creación original y estado Vigente (En uso actual).`
    );
  };

  const insumosSugeridos = dbInsumosList.filter((ins) => {
    const t = searchInsumo.trim().toLowerCase();
    const nombre = ins.nombre || "";
    const yaAgregado = insumos.some((i) => String(i.idInsumo || i.id) === String(ins.id || ins.idInsumo));
    return t.length > 0 && nombre.toLowerCase().includes(t) && !yaAgregado;
  }).slice(0, 6);

  const agregarInsumo = (ins) => {
    clearRestoredCommitFlag();
    const cost = Number(ins.precioUnitario || ins.costo || ins.precio || 0);
    const next = [
      ...insumos,
      {
        idInsumo: ins.id || ins.idInsumo,
        nombreInsumo: ins.nombre,
        insumo: { nombre: ins.nombre, unidadMedida: ins.unidadMedida, precioUnitario: cost },
        cantidad: 1,
        unidadMedida: ins.unidadMedida || "und",
        costoUnitario: cost
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
          const current = Number(item.cantidad) || 0;
          const isDecimalUnit = item.unidadMedida === 'kg' || item.unidadMedida === 'lt';
          const step = isDecimalUnit ? 0.05 : 1;
          const nuevaCant = Math.max(isDecimalUnit ? 0.01 : 1, Math.round((current + delta * step) * 100) / 100);
          return { ...item, cantidad: nuevaCant };
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

  // Requisito 102: Manejadores de pasos de proceso lógico
  const actualizarPaso = (idx, campo, valor) => {
    clearRestoredCommitFlag();
    const nuevos = pasosProceso.map((p, i) => i === idx ? { ...p, [campo]: valor } : p);
    setPasosProceso(nuevos);
    const textSerializado = serializarPasos(nuevos);
    setProcedimiento(textSerializado);
    if (touched.procedimiento) {
      const err = validateField("procedimiento", textSerializado);
      setErrors((prev) => ({ ...prev, procedimiento: err }));
    }
  };

  const agregarPaso = () => {
    clearRestoredCommitFlag();
    const nuevo = {
      id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fase: `Paso ${pasosProceso.length + 1}`,
      descripcion: ""
    };
    const nuevos = [...pasosProceso, nuevo];
    setPasosProceso(nuevos);
  };

  const eliminarPaso = (idx) => {
    if (pasosProceso.length <= 1) return;
    clearRestoredCommitFlag();
    const nuevos = pasosProceso.filter((_, i) => i !== idx);
    setPasosProceso(nuevos);
    const textSerializado = serializarPasos(nuevos);
    setProcedimiento(textSerializado);
    if (touched.procedimiento) {
      const err = validateField("procedimiento", textSerializado);
      setErrors((prev) => ({ ...prev, procedimiento: err }));
    }
  };

  const moverPaso = (idx, direccion) => {
    const targetIdx = idx + direccion;
    if (targetIdx < 0 || targetIdx >= pasosProceso.length) return;
    clearRestoredCommitFlag();
    const copia = [...pasosProceso];
    const temp = copia[idx];
    copia[idx] = copia[targetIdx];
    copia[targetIdx] = temp;
    setPasosProceso(copia);
    const textSerializado = serializarPasos(copia);
    setProcedimiento(textSerializado);
  };

  const aplicarFasesEstandar = () => {
    clearRestoredCommitFlag();
    const defaultSteps = [
      { id: `p-${Date.now()}-1`, fase: "Alistamiento / Mise en place", descripcion: "Selección, pesaje, lavado y porcionado de insumos requeridos." },
      { id: `p-${Date.now()}-2`, fase: "Cocción / Procesamiento térmico", descripcion: "Cocción de proteínas y preparación térmica de ingredientes." },
      { id: `p-${Date.now()}-3`, fase: "Ensamblaje y Montaje", descripcion: "Montaje secuencial de base, ingredientes, salsas y presentación final." },
      { id: `p-${Date.now()}-4`, fase: "Control de Calidad y Empaque", descripcion: "Verificación de temperatura, apariencia visual y empaque térmico para despacho." }
    ];
    setPasosProceso(defaultSteps);
    const textSerializado = serializarPasos(defaultSteps);
    setProcedimiento(textSerializado);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: "" }));
    }
  };

  const actualizarUnidad = (idx, unidadMedida) => {
    clearRestoredCommitFlag();
    setInsumos((prev) => prev.map((item, i) => (i === idx ? { ...item, unidadMedida } : item)));
  };

  const handleSave = async () => {
    const allTouched = {
      insumos: true,
      procedimiento: true,
      tiempoPreparacion: true,
      rendimiento: true,
      especificaciones: true,
      caracteristicas: true,
      informacionNutricional: true,
      condicionesAlmacenamiento: true,
      vidaUtil: true,
    };
    setTouched(allTouched);

    const newErrors = {
      insumos: validateField("insumos", null, insumos),
      procedimiento: validateField("procedimiento", procedimiento),
      tiempoPreparacion: validateField("tiempoPreparacion", tiempoPreparacion),
      rendimiento: validateField("rendimiento", rendimiento),
      especificaciones: validateField("especificaciones", especificaciones),
      caracteristicas: validateField("caracteristicas", caracteristicas),
      informacionNutricional: validateField("informacionNutricional", informacionNutricional),
      condicionesAlmacenamiento: validateField("condicionesAlmacenamiento", condicionesAlmacenamiento),
      vidaUtil: validateField("vidaUtil", vidaUtil),
    };

    setErrors(newErrors);

    const missingLabels = [];
    if (newErrors.insumos) missingLabels.push("Ingredientes / insumos necesarios");
    if (newErrors.procedimiento) missingLabels.push("Procedimiento de preparación");
    if (newErrors.tiempoPreparacion) missingLabels.push("Tiempo de preparación");
    if (newErrors.rendimiento) missingLabels.push("Rendimiento / porciones");
    if (newErrors.especificaciones) missingLabels.push("Especificaciones técnicas");
    if (newErrors.caracteristicas) missingLabels.push("Características organolépticas");
    if (newErrors.informacionNutricional) missingLabels.push("Información nutricional");
    if (newErrors.condicionesAlmacenamiento) missingLabels.push("Condiciones de almacenamiento");
    if (newErrors.vidaUtil) missingLabels.push("Vida útil");

    if (missingLabels.length > 0) {
      notify.error("Campos obligatorios", `Completa los campos obligatorios: ${missingLabels.join(", ")}.`);
      return;
    }

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
      detalles: insumos.map(i => ({
        idInsumo: i.idInsumo || i.id,
        nombreInsumo: i.nombreInsumo || i.insumo?.nombre || i.nombre,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || 'und',
        precioUnitario: Number(i.costoUnitario || i.precioUnitario || i.insumo?.precioUnitario || 0)
      }))
    };

    if (onSave) {
      onSave(payload);
    }

    if (productId) {
      try {
        setSaving(true);
        const savedFicha = await fichasTecnicasService.saveFichaProducto(productId, payload);
        if (savedFicha) {
          populateFields(savedFicha);
        }
        notify.success(
          "Ficha Técnica Guardada",
          `La Versión ${savedFicha?.versionActual || versionInfo.versionActual} de ${productName || "producto"} se encuentra Vigente (En uso actual).`
        );
      } catch (err) {
        console.error(err);
        notify.error("Error", "No se pudo guardar la ficha técnica en la base de datos");
      } finally {
        setSaving(false);
      }
    } else {
      notify.success("Ficha Técnica Creada Exitosamente", "La ficha técnica fue adjuntada al producto. Se guardará al crear el producto.");
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-6">
        {/* Quick Stats header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
            <p className="text-xs font-bold text-[#F05454] uppercase tracking-wider">Tiempo Estimado</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#F05454]" />
              <span>{tiempoPreparacion ? `${tiempoPreparacion} min` : "10-15 min"}</span>
            </p>
          </div>
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Rendimiento</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-blue-500" />
              <span>{rendimiento || "1 porción"}</span>
            </p>
          </div>
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Vida Útil</p>
            <p className="text-xl font-black text-gray-900 dark:text-gray-100 mt-1 truncate flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-500" />
              <span>{vidaUtil || "Consumo inmediato"}</span>
            </p>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="p-5 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
          <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F05454]" />
            Ingredientes e Insumos ({insumos.length})
          </h3>
          {insumos.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {insumos.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo}`}
                  </span>
                  <span className="font-black text-[#F05454] dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg text-xs">
                    {item.cantidad} {item.unidadMedida || item.insumo?.unidadMedida || "und"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No hay ingredientes registrados para esta ficha técnica.</p>
          )}
        </div>

        {/* Procedimiento */}
        <div className="p-5 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-3">
          <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F05454]" />
            Procedimiento Paso a Paso
          </h3>
          {procedimiento ? (
            <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
              {procedimiento.split("\n").filter(Boolean).map((paso, i) => (
                <li key={i} className="leading-relaxed pl-1 py-1 font-medium">
                  {paso}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-gray-400 italic">Preparar siguiendo las pautas generales de cocina.</p>
          )}
        </div>

        {/* Detalles adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {especificaciones && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Especificaciones</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{especificaciones}</p>
            </div>
          )}
          {caracteristicas && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Características Sensoriales</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{caracteristicas}</p>
            </div>
          )}
          {informacionNutricional && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Información Nutricional</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{informacionNutricional}</p>
            </div>
          )}
          {condicionesAlmacenamiento && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1">Condiciones de Almacenamiento</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{condicionesAlmacenamiento}</p>
            </div>
          )}
        </div>

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
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-xl transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          <FileText className="w-5 h-5 text-[#F05454]" />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Ficha Técnica del Producto</h3>
          <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold">
            Versión {versionInfo.versionActual} (Vigente)
          </span>
          {versionInfo.versionesAnteriores.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <History className="w-3 h-3" /> {versionInfo.versionesAnteriores.length} versión(es) anterior(es)
            </span>
          )}
        </div>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${expanded ? "max-h-[15000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-6 bg-gray-50/70 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
          {/* Banner informativo de vigencia y versionamiento */}
          {productId && isConfigured && (
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
          
          {/* Section 1: Insumos / Ingredientes */}
          <div>
            <label className={labelCls}>
              Ingredientes / Insumos necesarios{requiredMark}
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
                      <th className="px-4 py-3 text-right">Costo Unit.</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      <th className="px-4 py-3 text-right">Quitar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {insumos.map((item, idx) => {
                      const unitCost = Number(item.costoUnitario || item.precioUnitario || item.insumo?.precioUnitario || item.insumo?.costo || 0);
                      const subtotal = unitCost * (Number(item.cantidad) || 0);
                      return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(idx, -1)}
                              disabled={Number(item.cantidad) <= 1}
                              className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Minus className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                            </button>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.cantidad}
                              onChange={(e) => {
                                const val = e.target.value.replace(',', '.');
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                  setInsumos(prev => prev.map((x, i) => i === idx ? { ...x, cantidad: val } : x));
                                }
                              }}
                              onBlur={() => {
                                setInsumos(prev => prev.map((x, i) => {
                                  if (i === idx) {
                                    const parsed = parseFloat(x.cantidad);
                                    const finalVal = (!isNaN(parsed) && parsed > 0) ? parsed : 1;
                                    return { ...x, cantidad: finalVal };
                                  }
                                  return x;
                                }));
                              }}
                              className="w-16 text-center font-semibold border border-gray-200 dark:border-gray-700 rounded py-1 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-[#F05454]"
                            />
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(idx, 1)}
                              className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
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
                        <td className="px-4 py-3 text-right text-xs font-mono text-gray-600 dark:text-gray-400">
                          ${unitCost.toLocaleString("es-CO")}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-mono font-bold text-gray-900 dark:text-gray-100">
                          ${subtotal.toLocaleString("es-CO")}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => quitarInsumo(idx)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Requisito 99: Costeo de Insumos y Precio de Referencia Sugerido */}
              {(() => {
                const totalCosto = insumos.reduce((acc, item) => {
                  const unitCost = Number(item.costoUnitario || item.precioUnitario || item.insumo?.precioUnitario || item.insumo?.costo || 0);
                  return acc + (unitCost * (Number(item.cantidad) || 0));
                }, 0);
                const precioSugerido = totalCosto > 0 ? Math.round((totalCosto * 2.5) / 500) * 500 : 0;
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-200 dark:border-gray-700/80 gap-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        Cálculo de Costos de Insumos:
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Costo Insumos: </span>
                        <span className="font-bold font-mono text-gray-900 dark:text-gray-100">${totalCosto.toLocaleString("es-CO")} COP</span>
                      </div>
                      <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                        <span className="text-amber-600 dark:text-amber-400 font-medium">Precio Ref. Sugerido: </span>
                        <span className="font-black font-mono text-amber-700 dark:text-amber-300">${precioSugerido.toLocaleString("es-CO")} COP</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-2xl py-6 text-center transition ${
              touched.insumos && errors.insumos ? "border-red-400 bg-red-50/20 dark:bg-red-950/20" : "border-gray-200 dark:border-gray-700"
            }`}>
              <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Busca y agrega los insumos necesarios para este producto</p>
            </div>
          )}
          <FieldError msg={touched.insumos && errors.insumos} />

          {/* Section 2: Requisito 102 - Orden Lógico de Procesos de Preparación */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <div>
                <label className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#F05454]" />
                  Orden Lógico de Procesos de Preparación{requiredMark}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Estructura secuencial de las etapas culinarias (Alistamiento, Cocción, Ensamblaje y Control de calidad).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={aplicarFasesEstandar}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 dark:border-amber-800 cursor-pointer"
                  title="Cargar fases culinarias estándar"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Cargar Fases Estándar
                </button>
                <button
                  type="button"
                  onClick={agregarPaso}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-[#F05454] hover:bg-[#d84343] rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Paso
                </button>
              </div>
            </div>

            {/* Listado de Pasos Secuenciales */}
            <div className="space-y-3">
              {pasosProceso.map((paso, idx) => (
                <div
                  key={paso.id || idx}
                  className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-850 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#F05454] text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={paso.fase}
                        onChange={(e) => actualizarPaso(idx, "fase", e.target.value)}
                        placeholder={`Fase ${idx + 1} (ej. Alistamiento, Cocción, Montaje)`}
                        className="w-full sm:max-w-xs px-2.5 py-1 text-xs font-bold border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-[#F05454]"
                      />
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moverPaso(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                        title="Mover arriba"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moverPaso(idx, 1)}
                        disabled={idx === pasosProceso.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                        title="Mover abajo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      {pasosProceso.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarPaso(idx)}
                          className="p-1 text-gray-400 hover:text-rose-500 rounded"
                          title="Eliminar este paso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <textarea
                    value={paso.descripcion}
                    onChange={(e) => actualizarPaso(idx, "descripcion", e.target.value)}
                    onBlur={() => handleBlur("procedimiento", procedimiento)}
                    rows={2}
                    placeholder={`Describe las instrucciones operativas de "${paso.fase || 'esta fase'}"...`}
                    className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-1 focus:ring-[#F05454] outline-none resize-none"
                  />
                </div>
              ))}
            </div>

            <FieldError msg={touched.procedimiento && errors.procedimiento} />
          </div>

          {/* Section 3: Tiempo & Rendimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tiempo de Preparación (min){requiredMark}</label>
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
              <label className={labelCls}>Rendimiento / Porciones{requiredMark}</label>
              <input
                type="text"
                value={rendimiento}
                onChange={(e) => handleFieldChange("rendimiento", setRendimiento, e.target.value)}
                onBlur={() => handleBlur("rendimiento", rendimiento)}
                className={getInputClass("rendimiento")}
                placeholder="Ej: 1 porción"
              />
              <FieldError msg={touched.rendimiento && errors.rendimiento} />
            </div>
          </div>

          {/* Section 4: Especificaciones & Características */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Especificaciones Técnicas{requiredMark}</label>
              <textarea
                value={especificaciones}
                onChange={(e) => handleFieldChange("especificaciones", setEspecificaciones, e.target.value)}
                onBlur={() => handleBlur("especificaciones", especificaciones)}
                className={`${getInputClass("especificaciones")} resize-none`}
                rows={3}
                placeholder="Gramaje, temperatura de cocción, estándares..."
              />
              <FieldError msg={touched.especificaciones && errors.especificaciones} />
            </div>
            <div>
              <label className={labelCls}>Características Organolépticas{requiredMark}</label>
              <textarea
                value={caracteristicas}
                onChange={(e) => handleFieldChange("caracteristicas", setCaracteristicas, e.target.value)}
                onBlur={() => handleBlur("caracteristicas", caracteristicas)}
                className={`${getInputClass("caracteristicas")} resize-none`}
                rows={3}
                placeholder="Sabor, textura, aroma, apariencia..."
              />
              <FieldError msg={touched.caracteristicas && errors.caracteristicas} />
            </div>
          </div>

          {/* Section 5: Información Nutricional & Condiciones Almacenamiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Información Nutricional{requiredMark}</label>
              <textarea
                value={informacionNutricional}
                onChange={(e) => handleFieldChange("informacionNutricional", setInformacionNutricional, e.target.value)}
                onBlur={() => handleBlur("informacionNutricional", informacionNutricional)}
                className={`${getInputClass("informacionNutricional")} resize-none`}
                rows={3}
                placeholder="Calorías, proteínas, carbohidratos..."
              />
              <FieldError msg={touched.informacionNutricional && errors.informacionNutricional} />
            </div>
            <div>
              <label className={labelCls}>Condiciones de Almacenamiento{requiredMark}</label>
              <textarea
                value={condicionesAlmacenamiento}
                onChange={(e) => handleFieldChange("condicionesAlmacenamiento", setCondicionesAlmacenamiento, e.target.value)}
                onBlur={() => handleBlur("condicionesAlmacenamiento", condicionesAlmacenamiento)}
                className={`${getInputClass("condicionesAlmacenamiento")} resize-none`}
                rows={3}
                placeholder="Refrigeración, temperatura ideal..."
              />
              <FieldError msg={touched.condicionesAlmacenamiento && errors.condicionesAlmacenamiento} />
            </div>
          </div>

          {/* Section 6: Vida Útil & Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vida Útil{requiredMark}</label>
              <input
                type="text"
                value={vidaUtil}
                onChange={(e) => handleFieldChange("vidaUtil", setVidaUtil, e.target.value)}
                onBlur={() => handleBlur("vidaUtil", vidaUtil)}
                className={getInputClass("vidaUtil")}
                placeholder="Ej: Consumo inmediato o 24h refrigerado"
              />
              <FieldError msg={touched.vidaUtil && errors.vidaUtil} />
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? "Guardando..." : "Guardar Ficha Técnica"}</span>
            </button>
          </div>

          {/* Historial de Versiones Anteriores */}
          {productId && (
            <FichaVersionesHistorial
              versionActual={versionInfo.versionActual}
              fechaInicioVigencia={versionInfo.fechaInicioVigencia}
              versionesAnteriores={versionInfo.versionesAnteriores}
              onRestoreVersion={handleRestoreVersion}
              datosEntidadActual={entityData || versionInfo.prevFichaSnapshot?.datosEntidad || prevEntityData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
