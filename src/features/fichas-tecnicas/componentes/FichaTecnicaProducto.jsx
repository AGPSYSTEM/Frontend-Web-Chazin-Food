import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  Plus, Trash2, ShieldCheck, Clock, Layers, AlertCircle, ChevronDown, ChevronUp, 
  FileText, Check, Package, X, Search, Minus, UtensilsCrossed, Leaf, Calculator, 
  ArrowUp, ArrowDown, Sparkles, History, Calendar, Sliders, CheckCircle2, 
  Thermometer, ChefHat, Award, Info, Scale, ArrowRight, ArrowLeft
} from "lucide-react";
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
import {
  calculateInsumoCost,
  calculateRecipeTotals,
  parsePorciones
} from "../utils/costoUtils";

const FASES_DEFAULT = [
  { id: "p1", fase: "Alistamiento / Mise en place", descripcion: "Selección, pesaje, lavado y porcionado de insumos requeridos." },
  { id: "p2", fase: "Cocción / Procesamiento térmico", descripcion: "Cocción de proteínas y preparación térmica de ingredientes." },
  { id: "p3", fase: "Ensamblaje y Montaje", descripcion: "Montaje secuencial de base, ingredientes, salsas y presentación final." },
  { id: "p4", fase: "Control de Calidad y Empaque", descripcion: "Verificación de temperatura, apariencia visual y empaque térmico para despacho." }
];

// Limpia snapshots para evitar anidamiento recursivo (_prevFicha._prevFicha...)
const sanitizeSnapshot = (snap) => {
  if (!snap || typeof snap !== "object") return null;
  const { _prevFicha, _restoredSnapshot, _prevDatosEntidad, ...clean } = snap;
  return clean;
};

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
      const cleanFase = (p.fase || `Paso ${idx + 1}`).replace(/^\d+[\.\-\)]\s*/, "").trim() || `Paso ${idx + 1}`;
      return `${idx + 1}. ${cleanFase}: ${String(p.descripcion).trim()}`;
    })
    .join("\n\n");
}

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454]/30 focus:border-[#F05454] text-xs font-medium transition shadow-2xs outline-none";
const labelCls = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";
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
  const [activeTab, setActiveTab] = useState("ingredientes"); // "ingredientes" | "proceso" | "calidad" | "versiones"
  const [dbInsumosList, setDbInsumosList] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [procedimiento, setProcedimiento] = useState("");
  const [pasosProceso, setPasosProceso] = useState(FASES_DEFAULT);
  const [tiempoPreparacion, setTiempoPreparacion] = useState("");
  const [rendimiento, setRendimiento] = useState("1 porción");
  const [especificaciones, setEspecificaciones] = useState("");
  const [caracteristicas, setCaracteristicas] = useState("");
  const [informacionNutricional, setInformacionNutricional] = useState("");
  const [condicionesAlmacenamiento, setCondicionesAlmacenamiento] = useState("");
  const [vidaUtil, setVidaUtil] = useState("");
  const [observaciones, setObservaciones] = useState("");
  
  // Escalado dinámico de procesos (Requerimiento de procesos escalables)
  const [factorEscala, setFactorEscala] = useState(1);
  
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
      case "rendimiento": {
        const str = String(val ?? "").trim();
        if (!str) return "El rendimiento o porciones es obligatorio.";
        return "";
      }
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
    return `w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium outline-none transition ${
      isErr
        ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-100 focus:ring-2 focus:ring-red-400"
        : "border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-[#F05454]/30 focus:border-[#F05454]"
    }`;
  };

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const lastSentRef = useRef("");
  const lastEmittedPayloadRef = useRef(null);
  const loadedInitialRef = useRef(null);
  const isMountedRef = useRef(false);
  const prevProductIdRef = useRef(productId);

  useEffect(() => {
    if (prevProductIdRef.current !== productId) {
      prevProductIdRef.current = productId;
      loadedInitialRef.current = null;
      lastEmittedPayloadRef.current = null;
      lastSentRef.current = "";
    }
  }, [productId]);

  // Sincronizar cambios en tiempo real hacia el componente padre
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    const cleanPrev = sanitizeSnapshot(versionInfo.prevFichaSnapshot);

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
      datosEntidad: entityData || cleanPrev?.datosEntidad || null,
      _prevDatosEntidad: prevEntityData || cleanPrev?.datosEntidad || entityData || null,
      _prevFicha: cleanPrev
        ? {
            ...cleanPrev,
            datosEntidad: cleanPrev.datosEntidad || prevEntityData || entityData || null
          }
        : null,
      _isRestoredVersionCommit: Boolean(cleanPrev?._isRestoredVersionCommit),
      _restoredSnapshot: cleanPrev,
      detalles: insumos.map(i => {
        const cost = Number(i.costoUnitario || i.precioUnitario || i.insumo?.precioUnitario || i.insumo?.costo || 0);
        return {
          idInsumo: i.idInsumo || i.id,
          nombreInsumo: i.nombreInsumo || i.insumo?.nombre || i.nombre,
          cantidad: Number(i.cantidad || 1),
          unidadMedida: i.unidadMedida || 'und',
          costoUnitario: cost
        };
      })
    };

    // Huella liviana para deduplicar cambios sin serializar árboles gigantescos o recursivos
    const fingerprint = JSON.stringify({
      productId: productId || null,
      proc: procedimiento,
      time: Number(tiempoPreparacion) || 0,
      rend: rendimiento,
      esp: especificaciones,
      car: caracteristicas,
      nut: informacionNutricional,
      alm: condicionesAlmacenamiento,
      vid: vidaUtil,
      obs: observaciones,
      ver: versionInfo.versionActual,
      vig: versionInfo.fechaInicioVigencia,
      ins: insumos.map(i => `${i.idInsumo || i.id}:${i.cantidad}:${i.unidadMedida}:${i.costoUnitario || i.precioUnitario || 0}`).join(','),
      ent: entityData ? `${entityData.id || entityData.idProducto}_${entityData.nombre}_${entityData.precio}` : null
    });

    if (fingerprint !== lastSentRef.current) {
      lastSentRef.current = fingerprint;
      lastEmittedPayloadRef.current = payload;
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

  // Cargar insumos disponibles para el autocompletado
  useEffect(() => {
    insumosService.getInsumos()
      .then(res => setDbInsumosList(Array.isArray(res) ? res : res?.data || []))
      .catch(() => setDbInsumosList([]));
  }, []);

  const populateFields = useCallback((fRaw) => {
    if (!fRaw) return;
    const cleanRaw = sanitizeSnapshot(fRaw);
    const f = normalizeFichaWithVersions(cleanRaw, "PRODUCTO", productId);
    if (fRaw?._isRestoredVersionCommit) {
      f._isRestoredVersionCommit = true;
    }
    const rawInsumos = f.detalles || f.insumos || [];
    setInsumos(rawInsumos.map(item => {
      const matchDb = dbInsumosList.find(d => String(d.id || d.idInsumo) === String(item.idInsumo || item.id));
      const cost = Number(item.costoUnitario || item.precioUnitario || matchDb?.precioUnitario || matchDb?.costo || 0);
      return {
        idInsumo: item.idInsumo || item.id,
        nombreInsumo: item.nombreInsumo || item.insumo?.nombre || item.nombre || (matchDb ? matchDb.nombre : `Insumo #${item.idInsumo}`),
        cantidad: Number(item.cantidad || 1),
        unidadMedida: item.unidadMedida || matchDb?.unidadMedida || 'und',
        costoUnitario: cost,
        insumo: item.insumo || matchDb || null
      };
    }));

    const textoProc = f.procedimiento || f.descripcion || "";
    setProcedimiento(textoProc);
    setPasosProceso(desglosarProcedimiento(textoProc));
    setTiempoPreparacion(f.tiempoPreparacion ? String(f.tiempoPreparacion) : "15");
    setRendimiento(f.rendimiento || "1 porción");
    setEspecificaciones(f.especificaciones || "");
    setCaracteristicas(f.caracteristicas || "");
    setInformacionNutricional(f.informacionNutricional || "");
    setCondicionesAlmacenamiento(f.condicionesAlmacenamiento || "");
    setVidaUtil(f.vidaUtil || "Consumo inmediato");
    setObservaciones(extractFichaVersionMeta(f.observaciones || "").cleanObservaciones);
    setVersionInfo({
      versionActual: f.versionActual || 1,
      fechaInicioVigencia: f.fechaInicioVigencia || f.fechaCreacion || null,
      versionesAnteriores: f.versionesAnteriores || [],
      prevFichaSnapshot: sanitizeSnapshot(fRaw?._isRestoredVersionCommit ? fRaw : f)
    });
  }, [dbInsumosList, productId]);

  const loadFichaData = useCallback(async () => {
    if (initialData) {
      if (initialData === lastEmittedPayloadRef.current || initialData === loadedInitialRef.current) {
        return;
      }
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
  }, [productId, initialData, populateFields]);

  useEffect(() => {
    loadFichaData();
  }, [loadFichaData]);

  // Manejo de versión restaurada
  const handleRestoreVersion = (snapshot) => {
    const restoredState = buildRestoredVersionState(snapshot, "PRODUCTO", productId);
    setInsumos(restoredState.insumos);
    setProcedimiento(restoredState.procedimiento);
    setPasosProceso(desglosarProcedimiento(restoredState.procedimiento));
    setTiempoPreparacion(restoredState.tiempoPreparacion);
    setRendimiento(restoredState.rendimiento);
    setEspecificaciones(restoredState.especificaciones);
    setCaracteristicas(restoredState.caracteristicas);
    setInformacionNutricional(restoredState.informacionNutricional);
    setCondicionesAlmacenamiento(restoredState.condicionesAlmacenamiento);
    setVidaUtil(restoredState.vidaUtil);
    setObservaciones(restoredState.observaciones);
    setVersionInfo({
      versionActual: restoredState.versionActual,
      fechaInicioVigencia: restoredState.fechaInicioVigencia,
      versionesAnteriores: restoredState.versionesAnteriores,
      prevFichaSnapshot: restoredState._prevFicha
    });
    if (onRestoreEntityData && snapshot.datosEntidad) {
      onRestoreEntityData(snapshot.datosEntidad);
    }
    notify.success("Versión Restaurada", `Se cargaron los datos de la Versión ${snapshot.version}.`);
  };

  // Insumos disponibles filtrados
  const insumosSugeridos = useMemo(() => {
    if (!searchInsumo || !searchInsumo.trim()) return [];
    const term = searchInsumo.toLowerCase().trim();
    return dbInsumosList
      .filter(i => (i.nombre || "").toLowerCase().includes(term))
      .slice(0, 6);
  }, [dbInsumosList, searchInsumo]);

  const agregarInsumo = (insumoItem) => {
    clearRestoredCommitFlag();
    const id = insumoItem.id || insumoItem.idInsumo;
    if (insumos.some(i => String(i.idInsumo) === String(id))) {
      notify.info("Insumo ya agregado", `"${insumoItem.nombre}" ya está en la lista de ingredientes.`);
      setSearchInsumo("");
      return;
    }
    const nuevo = {
      idInsumo: id,
      nombreInsumo: insumoItem.nombre,
      cantidad: 1,
      unidadMedida: insumoItem.unidadMedida || "und",
      costoUnitario: Number(insumoItem.precioUnitario || insumoItem.costo || 0),
      insumo: insumoItem
    };
    const nextList = [...insumos, nuevo];
    setInsumos(nextList);
    setSearchInsumo("");
    notify.success("Insumo agregado", `"${insumoItem.nombre}" añadido a la receta.`);
    if (touched.insumos) {
      const err = validateField("insumos", null, nextList);
      setErrors((prev) => ({ ...prev, insumos: err }));
    }
  };

  const quitarInsumo = (idx) => {
    clearRestoredCommitFlag();
    const nextList = insumos.filter((_, i) => i !== idx);
    setInsumos(nextList);
    if (touched.insumos) {
      const err = validateField("insumos", null, nextList);
      setErrors((prev) => ({ ...prev, insumos: err }));
    }
  };

  const actualizarCantidad = (idx, delta) => {
    clearRestoredCommitFlag();
    setInsumos(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const actual = Number(item.cantidad) || 0;
      const step = item.unidadMedida === 'kg' || item.unidadMedida === 'lt' ? 0.1 : 1;
      const nuevo = Math.max(0.05, Math.round((actual + delta * step) * 100) / 100);
      return { ...item, cantidad: nuevo };
    }));
  };

  const actualizarUnidad = (idx, unidadMedida) => {
    clearRestoredCommitFlag();
    setInsumos((prev) => prev.map((item, i) => (i === idx ? { ...item, unidadMedida } : item)));
  };

  // Cálculo de totales gastronómicos precisos (Food Cost y Porciones)
  const recipeTotals = useMemo(() => {
    return calculateRecipeTotals(insumos, rendimiento);
  }, [insumos, rendimiento]);

  // Pasos de preparación
  const agregarPaso = () => {
    clearRestoredCommitFlag();
    const nuevoPaso = {
      id: `p-${Date.now()}-${pasosProceso.length}`,
      fase: `Paso ${pasosProceso.length + 1}`,
      descripcion: ""
    };
    const copia = [...pasosProceso, nuevoPaso];
    setPasosProceso(copia);
    const textSerializado = serializarPasos(copia);
    setProcedimiento(textSerializado);
  };

  const eliminarPaso = (idx) => {
    clearRestoredCommitFlag();
    const copia = pasosProceso.filter((_, i) => i !== idx);
    setPasosProceso(copia);
    const textSerializado = serializarPasos(copia);
    setProcedimiento(textSerializado);
  };

  const actualizarPaso = (idx, campo, valor) => {
    clearRestoredCommitFlag();
    const copia = pasosProceso.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p));
    setPasosProceso(copia);
    const textSerializado = serializarPasos(copia);
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
    setPasosProceso(FASES_DEFAULT);
    const textSerializado = serializarPasos(FASES_DEFAULT);
    setProcedimiento(textSerializado);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: "" }));
    }
  };

  const handleTiempoChange = (e) => {
    clearRestoredCommitFlag();
    const val = e.target.value.replace(/\D/g, "");
    setTiempoPreparacion(val);
    if (touched.tiempoPreparacion) {
      const err = validateField("tiempoPreparacion", val);
      setErrors((prev) => ({ ...prev, tiempoPreparacion: err }));
    }
  };

  const handleTiempoBlur = () => {
    setTouched((prev) => ({ ...prev, tiempoPreparacion: true }));
    let val = tiempoPreparacion ? parseInt(tiempoPreparacion, 10) : 0;
    if (val < 1) val = 1;
    setTiempoPreparacion(String(val));
    setErrors((prev) => ({ ...prev, tiempoPreparacion: "" }));
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
    if (newErrors.insumos) missingLabels.push("Ingredientes / insumos");
    if (newErrors.procedimiento) missingLabels.push("Procedimiento");
    if (newErrors.tiempoPreparacion) missingLabels.push("Tiempo de preparación");
    if (newErrors.rendimiento) missingLabels.push("Rendimiento / porciones");
    if (newErrors.especificaciones) missingLabels.push("Especificaciones técnicas");
    if (newErrors.caracteristicas) missingLabels.push("Características sensoriales");
    if (newErrors.informacionNutricional) missingLabels.push("Información nutricional");
    if (newErrors.condicionesAlmacenamiento) missingLabels.push("Condiciones de almacenamiento");
    if (newErrors.vidaUtil) missingLabels.push("Vida útil");

    if (missingLabels.length > 0) {
      notify.error("Campos obligatorios", `Completa: ${missingLabels.join(", ")}.`);
      // Cambiar de pestaña hacia donde está el error para orientar al usuario
      if (newErrors.insumos) setActiveTab("ingredientes");
      else if (newErrors.procedimiento || newErrors.tiempoPreparacion || newErrors.rendimiento) setActiveTab("proceso");
      else setActiveTab("calidad");
      return;
    }

    const confirmed = await notify.confirmAction(
      "¿Guardar versión de Ficha Técnica?",
      `Se guardará la Versión ${versionInfo.versionActual} para "${productName || 'este producto'}" como versión vigente. ¿Deseas continuar?`
    );
    if (!confirmed) return;

    const cleanPrev = sanitizeSnapshot(versionInfo.prevFichaSnapshot);
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
      datosEntidad: entityData || cleanPrev?.datosEntidad || null,
      _prevDatosEntidad: prevEntityData || cleanPrev?.datosEntidad || entityData || null,
      _prevFicha: cleanPrev
        ? {
            ...cleanPrev,
            datosEntidad: cleanPrev.datosEntidad || prevEntityData || entityData || null
          }
        : null,
      _isRestoredVersionCommit: Boolean(cleanPrev?._isRestoredVersionCommit),
      _restoredSnapshot: cleanPrev,
      detalles: insumos.map(i => ({
        idInsumo: i.idInsumo || i.id,
        nombreInsumo: i.nombreInsumo || i.insumo?.nombre || i.nombre,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || 'und',
        costoUnitario: Number(i.costoUnitario || i.precioUnitario || i.insumo?.precioUnitario || 0),
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
          `Versión ${savedFicha?.versionActual || versionInfo.versionActual} vigente y activa.`
        );
      } catch (err) {
        console.error(err);
        notify.error("Error", "No se pudo guardar la ficha técnica en el servidor.");
      } finally {
        setSaving(false);
      }
    } else {
      notify.success("Ficha Lista", "La ficha técnica se guardará automáticamente al crear el producto.");
    }
  };

  // Modo Solo Lectura (Read Only)
  if (readOnly) {
    return (
      <div className="space-y-5">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-[#F05454] uppercase tracking-wider">Tiempo Estimado</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F05454]" />
              <span>{tiempoPreparacion ? `${tiempoPreparacion} min` : "15 min"}</span>
            </p>
          </div>
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Rendimiento</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-blue-500" />
              <span>{rendimiento || "1 porción"}</span>
            </p>
          </div>
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Costo / Porción</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 font-mono">
              ${recipeTotals.costoPorPorcion.toLocaleString("es-CO")}
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Vida Útil</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 truncate flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span>{vidaUtil || "Consumo inmediato"}</span>
            </p>
          </div>
        </div>

        {/* Ingredientes */}
        <div className="p-4 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#F05454]" />
            Ingredientes ({insumos.length})
          </h4>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
            {insumos.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo}`}
                </span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 px-2 py-0.5 rounded-md">
                  {item.cantidad} {item.unidadMedida || "und"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Procedimiento */}
        {procedimiento && (
          <div className="p-4 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 space-y-2 text-xs">
            <h4 className="font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#F05454]" />
              Procedimiento
            </h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
              {procedimiento}
            </p>
          </div>
        )}

        {/* Historial en modo lectura */}
        <FichaVersionesHistorial
          versionActual={versionInfo.versionActual}
          fechaInicioVigencia={versionInfo.fechaInicioVigencia}
          versionesAnteriores={versionInfo.versionesAnteriores}
        />
      </div>
    );
  }

  // Pestañas disponibles en el nuevo diseño UI/UX
  const TABS = [
    { 
      id: "ingredientes", 
      label: "Ingredientes & Costeo", 
      icon: Package, 
      count: insumos.length,
      isValid: insumos.length > 0
    },
    { 
      id: "proceso", 
      label: "Preparación & Pasos", 
      icon: Clock, 
      count: pasosProceso.length,
      isValid: Boolean(procedimiento.trim() && tiempoPreparacion)
    },
    { 
      id: "calidad", 
      label: "Calidad & Almacenamiento", 
      icon: ShieldCheck,
      isValid: Boolean(especificaciones && caracteristicas && condicionesAlmacenamiento)
    },
    { 
      id: "versiones", 
      label: "Historial de Versiones", 
      icon: History, 
      count: versionInfo.versionesAnteriores?.length || 0 
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header con Badge de Versión Vigente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#F05454] flex items-center justify-center shrink-0 shadow-2xs">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                Ficha Técnica: {productName || "Plato / Receta Culinaria"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Versión {versionInfo.versionActual} (Vigente)
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Vigente desde: {formatFechaHoraFicha(versionInfo.fechaInicioVigencia)} • {insumos.length} ingrediente(s) configurado(s)
            </p>
          </div>
        </div>

        {/* Botón de Guardado Directo */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{saving ? "Guardando..." : "Guardar Ficha"}</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Navegación por Pestañas (Tabs) UI/UX Limpio y Ordenado */}
      <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[130px] sm:min-w-0 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs ring-1 ring-black/5 dark:ring-white/5"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-750"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F05454]" : "text-gray-400"}`} />
              <span className="truncate">{tab.label}</span>
              {tab.count !== undefined && tab.count !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive
                    ? "bg-rose-100 text-[#F05454] dark:bg-rose-950/60 dark:text-rose-300"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. CONTENIDO DE LAS PESTAÑAS */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-5 shadow-2xs min-h-[380px]">
        
        {/* ============================================================ */}
        {/* TAB 1: INGREDIENTES & COSTEO GASTRONÓMICO                    */}
        {/* ============================================================ */}
        {activeTab === "ingredientes" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* KPI Cards con Métricas Reales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50/80 dark:bg-gray-800/60 rounded-2xl border border-gray-150 dark:border-gray-750">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                  Costo Total del Lote ({factorEscala > 1 ? `${factorEscala}x` : "Base"})
                </span>
                <p className="text-lg font-black text-gray-900 dark:text-gray-100 font-mono">
                  ${(recipeTotals.costoTotalBatch * (factorEscala > 1 ? factorEscala : 1)).toLocaleString("es-CO")} COP
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Suma neta de insumos</p>
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-150 dark:border-blue-900/40">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide block mb-1">
                  Costo por Porción Real
                </span>
                <p className="text-lg font-black text-blue-700 dark:text-blue-300 font-mono">
                  ${recipeTotals.costoPorPorcion.toLocaleString("es-CO")} COP
                </p>
                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-0.5">Para: {rendimiento || "1 porción"}</p>
              </div>

              <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-150 dark:border-amber-900/40">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide block mb-1">
                  Precio de Venta Sugerido
                </span>
                <p className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">
                  ${recipeTotals.precioSugerido.toLocaleString("es-CO")} COP
                </p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-0.5">Margen Food Cost (~33%)</p>
              </div>
            </div>

            {/* Barra de Búsqueda y Escalabilidad */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              {/* Buscador de Insumos */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchInsumo}
                  onChange={(e) => setSearchInsumo(e.target.value)}
                  placeholder="Buscar insumo para agregar a la receta (ej. Carne, Queso, Pan)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#F05454]/30 focus:border-[#F05454] outline-none"
                />

                {/* Dropdown de Sugerencias */}
                {insumosSugeridos.length > 0 && (
                  <div className="absolute z-20 top-full mt-1.5 left-0 right-0 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    {insumosSugeridos.map((ins) => (
                      <button
                        key={ins.id || ins.idInsumo}
                        type="button"
                        onClick={() => agregarInsumo(ins)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-[#F05454]">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{ins.nombre}</p>
                            <p className="text-[10px] text-gray-400">{ins.categoria?.nombre || ins.categoria || "Insumo"}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                          ${Number(ins.precioUnitario || 0).toLocaleString("es-CO")}/{ins.unidadMedida || "und"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selector de Escalado Gastronómico */}
              <div className="flex items-center gap-1.5 self-start md:self-auto shrink-0 bg-gray-50 dark:bg-gray-800/60 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Escalar:</span>
                {[1, 2, 5, 10].map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => setFactorEscala(factor)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                      factorEscala === factor
                        ? "bg-[#F05454] text-white shadow-2xs"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {factor}x
                  </button>
                ))}
              </div>
            </div>

            {/* Tabla de Insumos */}
            {insumos.length > 0 ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3">Insumo</th>
                        <th className="px-4 py-3 text-center">Cantidad</th>
                        {factorEscala > 1 && (
                          <th className="px-4 py-3 text-center text-[#F05454]">Lote ({factorEscala}x)</th>
                        )}
                        <th className="px-4 py-3 text-center">Unidad</th>
                        <th className="px-4 py-3 text-right">Costo Inv.</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-3 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {insumos.map((item, idx) => {
                        const unitCost = Number(item.costoUnitario || item.precioUnitario || item.insumo?.precioUnitario || item.insumo?.costo || 0);
                        const subtotal = calculateInsumoCost(
                          item.cantidad,
                          item.unidadMedida || "und",
                          unitCost,
                          item.insumo?.unidadMedida
                        );
                        const cantEscalada = Math.round((Number(item.cantidad || 0) * factorEscala) * 100) / 100;
                        return (
                          <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                            <td className="px-4 py-2.5 font-bold text-gray-800 dark:text-gray-200">
                              {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo}`}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <div className="inline-flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(idx, -1)}
                                  disabled={Number(item.cantidad) <= 0.05}
                                  className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
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
                                  className="w-12 text-center font-bold text-xs bg-transparent outline-none text-gray-900 dark:text-gray-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => actualizarCantidad(idx, 1)}
                                  className="w-5 h-5 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            {factorEscala > 1 && (
                              <td className="px-4 py-2.5 text-center font-black text-[#F05454] bg-red-50/20 dark:bg-red-950/10">
                                {cantEscalada} {item.unidadMedida || "und"}
                              </td>
                            )}
                            <td className="px-4 py-2.5 text-center">
                              <select
                                value={item.unidadMedida || "und"}
                                onChange={(e) => actualizarUnidad(idx, e.target.value)}
                                className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold outline-none text-gray-700 dark:text-gray-300"
                              >
                                <option value="gr">gr</option>
                                <option value="kg">kg</option>
                                <option value="ml">ml</option>
                                <option value="lt">lt</option>
                                <option value="und">und</option>
                                <option value="paq">paq</option>
                                <option value="porción">porción</option>
                              </select>
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-gray-500">
                              ${unitCost.toLocaleString("es-CO")}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-gray-100">
                              ${Math.round(subtotal).toLocaleString("es-CO")}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => quitarInsumo(idx)}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                title="Quitar insumo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto">
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  No hay ingredientes agregados todavía
                </p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Utiliza el buscador superior para agregar los ingredientes e insumos necesarios para preparar este platillo.
                </p>
              </div>
            )}
            <FieldError msg={touched.insumos && errors.insumos} />

            {/* Navegación al Siguiente Paso */}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {insumos.length} {insumos.length === 1 ? "insumo en la receta" : "insumos en la receta"}
                </span>
                {insumos.length === 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 block sm:inline sm:ml-2">
                    (Agrega al menos 1 insumo para continuar)
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 block sm:inline sm:ml-2 font-medium">
                    ✓ Ingredientes listos. Puedes pasar a la preparación.
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (insumos.length === 0) {
                    setTouched(prev => ({ ...prev, insumos: true }));
                    setErrors(prev => ({ ...prev, insumos: "Debes agregar al menos un ingrediente o insumo a la receta." }));
                    notify.warning("Insumos requeridos", "Agrega al menos un ingrediente a la receta antes de continuar.");
                    return;
                  }
                  setActiveTab("proceso");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  insumos.length > 0
                    ? "bg-[#F05454] hover:bg-[#d84343] text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <span>Siguiente: Preparación & Pasos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: PROCESO & PREPARACIÓN PASO A PASO                     */}
        {/* ============================================================ */}
        {activeTab === "proceso" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Parámetros Operativos en 3 tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Tiempo Preparación (min){requiredMark}</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={tiempoPreparacion}
                    onChange={handleTiempoChange}
                    onBlur={handleTiempoBlur}
                    placeholder="Ej. 15"
                    className={`${getInputClass("tiempoPreparacion")} pl-9`}
                  />
                </div>
                <FieldError msg={touched.tiempoPreparacion && errors.tiempoPreparacion} />
              </div>

              <div>
                <label className={labelCls}>Rendimiento / Porciones{requiredMark}</label>
                <div className="relative">
                  <UtensilsCrossed className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rendimiento}
                    onChange={(e) => handleFieldChange("rendimiento", setRendimiento, e.target.value)}
                    onBlur={() => handleBlur("rendimiento", rendimiento)}
                    className={`${getInputClass("rendimiento")} pl-9`}
                    placeholder="Ej. 1 porción"
                  />
                </div>
                <FieldError msg={touched.rendimiento && errors.rendimiento} />
              </div>

              <div>
                <label className={labelCls}>Vida Útil del Plato{requiredMark}</label>
                <div className="relative">
                  <Leaf className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vidaUtil}
                    onChange={(e) => handleFieldChange("vidaUtil", setVidaUtil, e.target.value)}
                    onBlur={() => handleBlur("vidaUtil", vidaUtil)}
                    className={`${getInputClass("vidaUtil")} pl-9`}
                    placeholder="Ej. Consumo inmediato"
                  />
                </div>
                <FieldError msg={touched.vidaUtil && errors.vidaUtil} />
              </div>
            </div>

            {/* Fases Culinarias Secuenciales */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                    Fases Secuenciales de Cocina ({pasosProceso.length})
                  </h4>
                  <p className="text-[11px] text-gray-400">Instrucciones ordenadas para el equipo de cocina.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={aplicarFasesEstandar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fases Estándar</span>
                  </button>
                  <button
                    type="button"
                    onClick={agregarPaso}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Paso</span>
                  </button>
                </div>
              </div>

              {/* Lista de Pasos */}
              <div className="space-y-2.5">
                {pasosProceso.map((paso, idx) => (
                  <div
                    key={paso.id || idx}
                    className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-750 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-rose-100 text-[#F05454] dark:bg-rose-950/60 dark:text-rose-300 text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={paso.fase}
                          onChange={(e) => actualizarPaso(idx, "fase", e.target.value)}
                          placeholder={`Nombre de la fase (ej. Alistamiento, Cocción)`}
                          className="w-full sm:max-w-xs px-2.5 py-1 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-[#F05454]"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moverPaso(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 rounded cursor-pointer"
                          title="Subir paso"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moverPaso(idx, 1)}
                          disabled={idx === pasosProceso.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 rounded cursor-pointer"
                          title="Bajar paso"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {pasosProceso.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarPaso(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                            title="Eliminar paso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <textarea
                      value={paso.descripcion}
                      onChange={(e) => actualizarPaso(idx, "descripcion", e.target.value)}
                      rows={2}
                      placeholder={`Describe detalladamente las instrucciones para "${paso.fase || 'esta fase'}"...`}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#F05454]/30 focus:border-[#F05454] resize-none"
                    />
                  </div>
                ))}
              </div>
              <FieldError msg={touched.procedimiento && errors.procedimiento} />
            </div>

            {/* Navegación Paso Anterior / Siguiente */}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("ingredientes")}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-gray-200/80 dark:border-gray-700/80"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior: Ingredientes</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTouched(prev => ({ ...prev, tiempoPreparacion: true, rendimiento: true, vidaUtil: true, procedimiento: true }));
                  const tErr = validateField("tiempoPreparacion", tiempoPreparacion);
                  const rErr = validateField("rendimiento", rendimiento);
                  const vErr = validateField("vidaUtil", vidaUtil);
                  const pErr = validateField("procedimiento", procedimiento);
                  if (tErr || rErr || vErr || pErr) {
                    setErrors(prev => ({
                      ...prev,
                      tiempoPreparacion: tErr,
                      rendimiento: rErr,
                      vidaUtil: vErr,
                      procedimiento: pErr
                    }));
                    notify.warning("Parámetros incompletos", "Por favor completa el tiempo, rendimiento y procedimiento de preparación.");
                    return;
                  }
                  setActiveTab("calidad");
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Siguiente: Calidad & Almacenamiento</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CALIDAD, NUTRICIÓN & CONSERVACIÓN                     */}
        {/* ============================================================ */}
        {activeTab === "calidad" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Especificaciones Técnicas{requiredMark}</label>
                <textarea
                  value={especificaciones}
                  onChange={(e) => handleFieldChange("especificaciones", setEspecificaciones, e.target.value)}
                  onBlur={() => handleBlur("especificaciones", especificaciones)}
                  rows={3}
                  placeholder="Gramaje total, temperatura de salida (ej. > 65°C), estándares higiénicos..."
                  className={`${getInputClass("especificaciones")} resize-none`}
                />
                <FieldError msg={touched.especificaciones && errors.especificaciones} />
              </div>

              <div>
                <label className={labelCls}>Características Sensoriales{requiredMark}</label>
                <textarea
                  value={caracteristicas}
                  onChange={(e) => handleFieldChange("caracteristicas", setCaracteristicas, e.target.value)}
                  onBlur={() => handleBlur("caracteristicas", caracteristicas)}
                  rows={3}
                  placeholder="Sabor equilibrado, color dorado brillante, aroma característico, textura crujiente..."
                  className={`${getInputClass("caracteristicas")} resize-none`}
                />
                <FieldError msg={touched.caracteristicas && errors.caracteristicas} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Información Nutricional{requiredMark}</label>
                <textarea
                  value={informacionNutricional}
                  onChange={(e) => handleFieldChange("informacionNutricional", setInformacionNutricional, e.target.value)}
                  onBlur={() => handleBlur("informacionNutricional", informacionNutricional)}
                  rows={3}
                  placeholder="Calorías aproximadas (ej. 450 kcal), proteínas, carbohidratos, grasas..."
                  className={`${getInputClass("informacionNutricional")} resize-none`}
                />
                <FieldError msg={touched.informacionNutricional && errors.informacionNutricional} />
              </div>

              <div>
                <label className={labelCls}>Condiciones de Almacenamiento{requiredMark}</label>
                <textarea
                  value={condicionesAlmacenamiento}
                  onChange={(e) => handleFieldChange("condicionesAlmacenamiento", setCondicionesAlmacenamiento, e.target.value)}
                  onBlur={() => handleBlur("condicionesAlmacenamiento", condicionesAlmacenamiento)}
                  rows={3}
                  placeholder="Mantener caliente a > 65°C para despacho o refrigerar entre 2°C y 4°C..."
                  className={`${getInputClass("condicionesAlmacenamiento")} resize-none`}
                />
                <FieldError msg={touched.condicionesAlmacenamiento && errors.condicionesAlmacenamiento} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Observaciones y Alérgenos (Opcional)</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Contiene gluten, lácteos, sésamo. Advertencias específicas para cocina..."
                className={inputCls}
              />
            </div>

            {/* Navegación Paso Anterior / Guardar */}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("proceso")}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-gray-200/80 dark:border-gray-700/80"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior: Preparación</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("versiones")}
                  className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Ver Historial</span>
                </button>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{saving ? "Guardando..." : "Guardar Ficha Técnica"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: HISTORIAL DE VERSIONES & CONTROL DE CAMBIOS           */}
        {/* ============================================================ */}
        {activeTab === "versiones" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/25 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-black text-emerald-900 dark:text-emerald-200">
                  Versión Actual (v{versionInfo.versionActual}) Vigente
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                  Vigente desde el {formatFechaHoraFicha(versionInfo.fechaInicioVigencia)}. Cada vez que guardes modificaciones en ingredientes o proceso, se archivará un snapshot inmutable para auditoría gastronómica.
                </p>
              </div>
            </div>

            <FichaVersionesHistorial
              versionActual={versionInfo.versionActual}
              fechaInicioVigencia={versionInfo.fechaInicioVigencia}
              versionesAnteriores={versionInfo.versionesAnteriores}
              onRestoreVersion={handleRestoreVersion}
              datosEntidadActual={entityData || versionInfo.prevFichaSnapshot?.datosEntidad || prevEntityData}
            />

            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-start">
              <button
                type="button"
                onClick={() => setActiveTab("calidad")}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-gray-200/80 dark:border-gray-700/80"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Calidad & Almacenamiento</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FichaTecnicaProducto;
