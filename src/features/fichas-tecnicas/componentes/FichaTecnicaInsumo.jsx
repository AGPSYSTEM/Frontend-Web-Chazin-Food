import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { 
  Plus, Trash2, ShieldCheck, Clock, Layers, AlertCircle, ChevronDown, ChevronUp, 
  FileText, Check, Package, X, Search, Minus, FlaskConical, Scale, Leaf, 
  History, Calendar, CheckCircle2, Thermometer, Award, Info, Sparkles,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown
} from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";
import { insumosService } from "@/features/compras/servicios/insumosService";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";
import { FichaVersionesHistorial } from "./FichaVersionesHistorial";
import { normalizeUnidadMedida, resolveRecetaUnidadYCantidad, convertirUnidadYCantidad, getUnidadesCompatibles } from "../utils/costoUtils";
import {
  normalizeFichaWithVersions,
  formatFechaHoraFicha,
  extractFichaVersionMeta,
  buildRestoredVersionState
} from "../utils/fichaVersionUtils";

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454]/30 focus:border-[#F05454] text-xs font-medium transition shadow-2xs outline-none";
const labelCls = "block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide";
const requiredMark = <span className="text-red-500"> *</span>;

const FASES_DEFAULT = [
  { id: "p1", fase: "Alistamiento / Mise en place", descripcion: "Selección, pesaje, lavado y porcionado de insumos requeridos." },
  { id: "p2", fase: "Cocción / Procesamiento térmico", descripcion: "Cocción de proteínas y preparación térmica de ingredientes." },
  { id: "p3", fase: "Ensamblaje y Montaje", descripcion: "Montaje secuencial de base, ingredientes, salsas y presentación final." },
  { id: "p4", fase: "Control de Calidad y Empaque", descripcion: "Verificación de temperatura, apariencia visual y empaque térmico para despacho." }
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
    .join("\n");
}

// Limpia snapshots para evitar anidamiento recursivo (_prevFicha._prevFicha...)
const sanitizeSnapshot = (snap) => {
  if (!snap || typeof snap !== "object") return null;
  const { _prevFicha, _restoredSnapshot, _prevDatosEntidad, ...clean } = snap;
  return clean;
};

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
  const [activeTab, setActiveTab] = useState("ingredientes"); // "ingredientes" | "proceso" | "calidad" | "versiones"
  const [dbInsumosList, setDbInsumosList] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [procedimiento, setProcedimiento] = useState("");
  const [pasosProceso, setPasosProceso] = useState(FASES_DEFAULT);
  const [tiempoPreparacion, setTiempoPreparacion] = useState("");
  const [rendimiento, setRendimiento] = useState("1 receta base");
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
      case "rendimiento": {
        const str = String(val ?? "").trim();
        if (!str) return "El rendimiento o cantidad obtenida es obligatorio.";
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

  const agregarPaso = () => {
    clearRestoredCommitFlag();
    const nuevoPaso = {
      id: `p-${Date.now()}-${pasosProceso.length}`,
      fase: `Paso ${pasosProceso.length + 1}`,
      descripcion: ""
    };
    const copia = [...pasosProceso, nuevoPaso];
    setPasosProceso(copia);
    const serialized = serializarPasos(copia);
    setProcedimiento(serialized);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: validateField("procedimiento", serialized) }));
    }
  };

  const eliminarPaso = (idx) => {
    clearRestoredCommitFlag();
    const copia = pasosProceso.filter((_, i) => i !== idx);
    setPasosProceso(copia);
    const serialized = serializarPasos(copia);
    setProcedimiento(serialized);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: validateField("procedimiento", serialized) }));
    }
  };

  const actualizarPaso = (idx, campo, valor) => {
    clearRestoredCommitFlag();
    const copia = pasosProceso.map((p, i) => (i === idx ? { ...p, [campo]: valor } : p));
    setPasosProceso(copia);
    const serialized = serializarPasos(copia);
    setProcedimiento(serialized);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: validateField("procedimiento", serialized) }));
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
    const serialized = serializarPasos(copia);
    setProcedimiento(serialized);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: validateField("procedimiento", serialized) }));
    }
  };

  const aplicarFasesEstandar = () => {
    clearRestoredCommitFlag();
    const copia = FASES_DEFAULT.map((f, i) => ({ ...f, id: `fase-${i}-${Date.now()}` }));
    setPasosProceso(copia);
    const serialized = serializarPasos(copia);
    setProcedimiento(serialized);
    if (touched.procedimiento) {
      setErrors((prev) => ({ ...prev, procedimiento: validateField("procedimiento", serialized) }));
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
  const isMountedRef = useRef(false);
  const prevInsumoIdRef = useRef(insumoId);

  useEffect(() => {
    if (prevInsumoIdRef.current !== insumoId) {
      prevInsumoIdRef.current = insumoId;
      loadedKeyRef.current = null;
      lastEmittedPayloadRef.current = null;
      lastSentRef.current = "";
    }
  }, [insumoId]);

  // Sincronizar cambios en tiempo real
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    const cleanPrev = sanitizeSnapshot(versionInfo.prevFichaSnapshot);

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
      detalles: insumos.map((i) => ({
        idInsumo: i.idInsumo || i.id,
        nombreInsumo: i.nombreInsumo || i.insumo?.nombre || i.nombre,
        cantidad: Number(i.cantidad || 1),
        unidadMedida: i.unidadMedida || i.insumo?.unidadMedida || "und"
      }))
    };

    // Huella liviana para deduplicar cambios sin serializar árboles gigantescos o recursivos
    const fingerprint = JSON.stringify({
      insumoId: insumoId || null,
      proc: procedimiento.trim(),
      time: Number(tiempoPreparacion) || 0,
      rend: rendimiento.trim(),
      esp: especificaciones.trim(),
      car: caracteristicas.trim(),
      nut: informacionNutricional.trim(),
      alm: condicionesAlmacenamiento.trim(),
      vid: vidaUtil.trim(),
      obs: observaciones.trim(),
      ver: versionInfo.versionActual,
      vig: versionInfo.fechaInicioVigencia,
      ins: insumos.map(i => `${i.idInsumo || i.id}:${i.cantidad}:${i.unidadMedida || i.insumo?.unidadMedida || "und"}`).join(','),
      ent: entityData ? `${entityData.id || entityData.idInsumo}_${entityData.nombre}_${entityData.precio}` : null
    });

    if (fingerprint !== lastSentRef.current) {
      lastSentRef.current = fingerprint;
      lastEmittedPayloadRef.current = payload;
      onChangeRef.current?.(payload);
    }
  }, [
    insumos, procedimiento, tiempoPreparacion, rendimiento,
    especificaciones, caracteristicas, informacionNutricional,
    condicionesAlmacenamiento, vidaUtil, observaciones,
    versionInfo, entityData, prevEntityData, insumoId
  ]);

  // Cargar lista de insumos base para autocompletado
  useEffect(() => {
    insumosService.getInsumos()
      .then((res) => {
        const raw = Array.isArray(res) ? res : res?.data || [];
        setDbInsumosList(raw.filter(item => !insumoId || String(item.id || item.idInsumo) !== String(insumoId)));
      })
      .catch(() => setDbInsumosList([]));
  }, [insumoId]);

  const populateFields = useCallback((fRaw) => {
    if (!fRaw) return;
    const cleanRaw = sanitizeSnapshot(fRaw);
    const f = normalizeFichaWithVersions(cleanRaw, "INSUMO_PREPARADO", insumoId);
    if (fRaw?._isRestoredVersionCommit) {
      f._isRestoredVersionCommit = true;
    }
    const rawInsumos = f.detalles || f.insumos || [];
    setInsumos(rawInsumos.map(item => {
      const matchDb = dbInsumosList.find(d => String(d.id || d.idInsumo) === String(item.idInsumo || item.id));
      return {
        idInsumo: item.idInsumo || item.id,
        nombreInsumo: item.nombreInsumo || item.insumo?.nombre || item.nombre || matchDb?.nombre || `Insumo #${item.idInsumo || item.id}`,
        cantidad: Number(item.cantidad || 1),
        unidadMedida: item.unidadMedida || matchDb?.unidadMedida || "und",
        insumo: item.insumo || matchDb || null
      };
    }));

    const rawProc = f.procedimiento || f.descripcion || "";
    const parsedPasos = desglosarProcedimiento(rawProc);
    setPasosProceso(parsedPasos);
    setProcedimiento(rawProc || serializarPasos(parsedPasos));
    setTiempoPreparacion(f.tiempoPreparacion ? String(f.tiempoPreparacion) : "15");
    setRendimiento(f.rendimiento || "1 receta base");
    setEspecificaciones(f.especificaciones || "");
    setCaracteristicas(f.caracteristicas || "");
    setInformacionNutricional(f.informacionNutricional || "");
    setCondicionesAlmacenamiento(f.condicionesAlmacenamiento || "");
    setVidaUtil(f.vidaUtil || "72 horas en refrigeración");
    setObservaciones(extractFichaVersionMeta(f.observaciones || "").cleanObservaciones);
    setVersionInfo({
      versionActual: f.versionActual || 1,
      fechaInicioVigencia: f.fechaInicioVigencia || f.fechaCreacion || null,
      versionesAnteriores: f.versionesAnteriores || [],
      prevFichaSnapshot: sanitizeSnapshot(fRaw?._isRestoredVersionCommit ? fRaw : f)
    });
  }, [dbInsumosList, insumoId]);

  const loadFicha = useCallback(async () => {
    if (initialData) {
      if (initialData === lastEmittedPayloadRef.current || initialData === loadedKeyRef.current) {
        return;
      }
      loadedKeyRef.current = initialData;
      populateFields(initialData);
      return;
    }
    if (insumoId && !initialData) {
      try {
        const res = await fichasTecnicasService.getFichaByInsumoPreparado(insumoId);
        if (res && res.idFichaTecnica) {
          populateFields(res);
        }
      } catch (err) {
        console.error("Error cargando ficha de insumo preparado:", err);
      }
    }
  }, [insumoId, initialData, populateFields]);

  useEffect(() => {
    loadFicha();
  }, [loadFicha]);

  // Manejo de versión restaurada
  const handleRestoreVersion = (snapshot) => {
    const restoredState = buildRestoredVersionState(snapshot, "INSUMO_PREPARADO", insumoId);
    setInsumos(restoredState.insumos);
    const parsedPasos = desglosarProcedimiento(restoredState.procedimiento);
    setPasosProceso(parsedPasos);
    setProcedimiento(restoredState.procedimiento || serializarPasos(parsedPasos));
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
    return dbInsumosList
      .filter(i =>
        matchesSmartSearch(
          [
            i.nombre,
            i.categoria,
            i.categoriaNombre,
            i.unidadMedida,
            i.id,
            i.idInsumo,
            `#${i.id || i.idInsumo}`
          ],
          searchInsumo
        )
      )
      .slice(0, 8);
  }, [dbInsumosList, searchInsumo]);

  const agregarInsumo = (ins) => {
    clearRestoredCommitFlag();
    const id = ins.id || ins.idInsumo;
    if (insumos.some(i => String(i.idInsumo || i.id) === String(id))) {
      notify.info("Insumo ya agregado", `"${ins.nombre}" ya está en la receta.`);
      setSearchInsumo("");
      return;
    }
    const { cantidad: cantDefault, unidadMedida: uDefault } = resolveRecetaUnidadYCantidad(ins, rendimiento);
    const nuevo = {
      idInsumo: id,
      nombreInsumo: ins.nombre,
      cantidad: cantDefault,
      unidadMedida: uDefault,
      insumo: ins
    };
    const next = [...insumos, nuevo];
    setInsumos(next);
    setSearchInsumo("");
    notify.success("Insumo agregado", `"${ins.nombre}" añadido a la receta.`);
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
    setInsumos(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const actual = Number(item.cantidad) || 0;
      const u = normalizeUnidadMedida(item.unidadMedida);
      let step = 1;
      if (u === 'gr' || u === 'ml') {
        step = 5;
      } else if (u === 'kg' || u === 'lt') {
        step = 0.05;
      }
      const nuevo = Math.max(u === 'gr' || u === 'ml' ? 1 : 0.05, Math.round((actual + delta * step) * 100) / 100);
      return { ...item, cantidad: nuevo };
    }));
  };

  const actualizarUnidad = (idx, nuevaUnidad) => {
    clearRestoredCommitFlag();
    setInsumos((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const cantConvertida = convertirUnidadYCantidad(item.cantidad, item.unidadMedida, nuevaUnidad);
      return { ...item, unidadMedida: nuevaUnidad, cantidad: cantConvertida };
    }));
  };

  const handleTiempoChange = (e) => {
    clearRestoredCommitFlag();
    const val = e.target.value.replace(/\D/g, "");
    setTiempoPreparacion(val);
    if (touched.tiempoPreparacion) {
      setErrors((prev) => ({ ...prev, tiempoPreparacion: validateField("tiempoPreparacion", val) }));
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
    if (newErrors.insumos) missingLabels.push("Ingredientes base");
    if (newErrors.procedimiento) missingLabels.push("Procedimiento");
    if (newErrors.tiempoPreparacion) missingLabels.push("Tiempo de preparación");
    if (newErrors.rendimiento) missingLabels.push("Rendimiento");
    if (newErrors.condicionesAlmacenamiento) missingLabels.push("Condiciones de almacenamiento");
    if (newErrors.vidaUtil) missingLabels.push("Vida útil");
    if (newErrors.especificaciones) missingLabels.push("Especificaciones técnicas");
    if (newErrors.caracteristicas) missingLabels.push("Características sensoriales");
    if (newErrors.informacionNutricional) missingLabels.push("Información nutricional");

    if (missingLabels.length > 0) {
      notify.error("Campos obligatorios", `Completa: ${missingLabels.join(", ")}.`);
      if (newErrors.insumos) setActiveTab("ingredientes");
      else if (newErrors.procedimiento || newErrors.tiempoPreparacion || newErrors.rendimiento) setActiveTab("proceso");
      else setActiveTab("calidad");
      return;
    }

    const confirmed = await notify.confirmAction(
      "¿Guardar versión de Ficha Técnica?",
      `Se guardará la Versión ${versionInfo.versionActual} para "${insumoName || 'este insumo preparado'}". ¿Deseas continuar?`
    );
    if (!confirmed) return;

    const cleanPrev = sanitizeSnapshot(versionInfo.prevFichaSnapshot);
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
          `Versión ${savedFicha?.versionActual || versionInfo.versionActual} vigente y activa.`
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

  // Modo Solo Lectura
  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-[#F05454] uppercase tracking-wider">Tiempo de Preparación</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F05454]" />
              <span>{tiempoPreparacion ? `${tiempoPreparacion} min` : "15 min"}</span>
            </p>
          </div>
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Rendimiento Base</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-500" />
              <span>{rendimiento || "1 receta base"}</span>
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Vida Útil</p>
            <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span>{vidaUtil || "72 horas"}</span>
            </p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2 text-xs">
          <h4 className="font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Ingredientes Base ({insumos.length})
          </h4>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {insumos.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo || item.id}`}
                </span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-750 px-2 py-0.5 rounded-md">
                  {item.cantidad} {item.unidadMedida || "und"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {procedimiento && (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-3 text-xs">
            <h4 className="font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Fases Secuenciales de Elaboración
            </h4>
            <div className="space-y-2">
              {desglosarProcedimiento(procedimiento).map((paso, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-gray-50/60 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700/60">
                  <span className="w-5 h-5 rounded-md bg-rose-100 text-[#F05454] dark:bg-rose-950/60 dark:text-rose-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{paso.fase}</div>
                    <div className="text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">{paso.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <FichaVersionesHistorial
          versionActual={versionInfo.versionActual}
          fechaInicioVigencia={versionInfo.fechaInicioVigencia}
          versionesAnteriores={versionInfo.versionesAnteriores}
        />
      </div>
    );
  }

  // Pestañas UI/UX
  const TABS = [
    { 
      id: "ingredientes", 
      label: "Ingredientes Base", 
      icon: Package, 
      count: insumos.length 
    },
    { 
      id: "proceso", 
      label: "Elaboración & Parámetros", 
      icon: Clock,
      count: pasosProceso.length
    },
    { 
      id: "calidad", 
      label: "Conservación & Calidad", 
      icon: ShieldCheck 
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
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm text-gray-900 dark:text-gray-100">
                Ficha Técnica: {insumoName || "Insumo Preparado"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Versión {versionInfo.versionActual} (Vigente)
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              Vigente desde: {formatFechaHoraFicha(versionInfo.fechaInicioVigencia)} • {insumos.length} ingrediente(s) base
            </p>
          </div>
        </div>

        {/* Botón de Guardado */}
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

      {/* 2. Barra de Navegación por Pestañas */}
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

      {/* 3. Contenido de las Pestañas */}
      <div className="bg-white dark:bg-gray-850 rounded-2xl border border-gray-200/80 dark:border-gray-700 p-4 sm:p-5 shadow-2xs min-h-[360px]">
        
        {/* ============================================================ */}
        {/* TAB 1: INGREDIENTES BASE                                     */}
        {/* ============================================================ */}
        {activeTab === "ingredientes" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Buscador de Insumos Base */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchInsumo}
                onChange={(e) => setSearchInsumo(e.target.value)}
                placeholder="Buscar insumo base para la receta (ej. Sal, Aceite, Especias)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#F05454]/30 focus:border-[#F05454] outline-none"
              />

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
                          <p className="text-[10px] text-gray-400">{ins.unidadMedida || "und"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300">
                        ${Number(ins.precioUnitario || ins.costo || 0).toLocaleString("es-CO")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Listado de Insumos Base */}
            {insumos.length > 0 ? (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3">Insumo Base</th>
                        <th className="px-4 py-3 text-center">Cantidad Requerida</th>
                        <th className="px-4 py-3 text-center">Unidad</th>
                        <th className="px-3 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {insumos.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                          <td className="px-4 py-2.5 font-bold text-gray-800 dark:text-gray-200">
                            {item.nombreInsumo || item.insumo?.nombre || `Insumo #${item.idInsumo || item.id}`}
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
                          <td className="px-4 py-2.5 text-center">
                            <select
                              value={normalizeUnidadMedida(item.unidadMedida)}
                              onChange={(e) => actualizarUnidad(idx, e.target.value)}
                              className="px-2 py-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold outline-none text-gray-700 dark:text-gray-300"
                            >
                              {getUnidadesCompatibles(item.insumo?.unidadMedida || item.unidadMedida).map(u => (
                                <option key={u.value} value={u.value}>{u.value}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => quitarInsumo(idx)}
                              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                              title="Quitar de la receta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
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
                  No hay ingredientes base agregados
                </p>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  Busca y agrega los insumos que componen la receta de este insumo preparado (salsa, masa, aderezo).
                </p>
              </div>
            )}
            <FieldError msg={touched.insumos && errors.insumos} />

            {/* Navegación al Siguiente Paso */}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {insumos.length} {insumos.length === 1 ? "insumo base en la receta" : "insumos base en la receta"}
                </span>
                {insumos.length === 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 block sm:inline sm:ml-2">
                    (Agrega al menos 1 insumo para continuar)
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 block sm:inline sm:ml-2 font-medium">
                    ✓ Insumos listos. Puedes pasar a la elaboración.
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (insumos.length === 0) {
                    setTouched(prev => ({ ...prev, insumos: true }));
                    setErrors(prev => ({ ...prev, insumos: "Debes agregar al menos un ingrediente o insumo base antes de pasar al paso de elaboración." }));
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
                <span>Siguiente: Elaboración & Parámetros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ELABORACIÓN & PARÁMETROS                              */}
        {/* ============================================================ */}
        {activeTab === "proceso" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Parámetros Operativos Centrados y Alineados */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide min-h-[1.25rem] flex items-center">
                  Tiempo Preparación (min){requiredMark}
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={tiempoPreparacion}
                    onChange={handleTiempoChange}
                    onBlur={handleTiempoBlur}
                    placeholder="Ej. 20"
                    className={`${getInputClass("tiempoPreparacion")} pl-9`}
                  />
                </div>
                <FieldError msg={touched.tiempoPreparacion && errors.tiempoPreparacion} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide min-h-[1.25rem] flex items-center">
                  Rendimiento / Porciones{requiredMark}
                </label>
                <div className="relative">
                  <Scale className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rendimiento}
                    onChange={(e) => handleFieldChange("rendimiento", setRendimiento, e.target.value)}
                    onBlur={() => handleBlur("rendimiento", rendimiento)}
                    className={`${getInputClass("rendimiento")} pl-9`}
                    placeholder="Ej. 1 receta base"
                  />
                </div>
                <FieldError msg={touched.rendimiento && errors.rendimiento} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide min-h-[1.25rem] flex items-center">
                  Vida Útil Almacenado{requiredMark}
                </label>
                <div className="relative">
                  <Leaf className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vidaUtil}
                    onChange={(e) => handleFieldChange("vidaUtil", setVidaUtil, e.target.value)}
                    onBlur={() => handleBlur("vidaUtil", vidaUtil)}
                    className={`${getInputClass("vidaUtil")} pl-9`}
                    placeholder="Ej. 72 horas en refrigeración"
                  />
                </div>
                <FieldError msg={touched.vidaUtil && errors.vidaUtil} />
              </div>
            </div>

            {/* Fases Culinarias Secuenciales Enumeradas */}
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
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fases Estándar</span>
                  </button>
                  <button
                    type="button"
                    onClick={agregarPaso}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] cursor-pointer shadow-2xs transition-colors"
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
                    className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-755 space-y-2"
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
                          placeholder="Nombre de la fase (ej. Alistamiento, Cocción)"
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
                  const serialized = serializarPasos(pasosProceso);
                  setProcedimiento(serialized);
                  const tErr = validateField("tiempoPreparacion", tiempoPreparacion);
                  const rErr = validateField("rendimiento", rendimiento);
                  const vErr = validateField("vidaUtil", vidaUtil);
                  const pErr = validateField("procedimiento", serialized);
                  if (tErr || rErr || vErr || pErr) {
                    setErrors(prev => ({
                      ...prev,
                      tiempoPreparacion: tErr,
                      rendimiento: rErr,
                      vidaUtil: vErr,
                      procedimiento: pErr
                    }));
                    notify.warning("Parámetros incompletos", "Por favor completa el tiempo, rendimiento y las fases de elaboración.");
                    return;
                  }
                  setActiveTab("calidad");
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#F05454] hover:bg-[#d84343] rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Siguiente: Conservación & Calidad</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CONSERVACIÓN & CALIDAD TÉCNICA                        */}
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
                  placeholder="Textura, viscosidad, nivel de emulsión, estándares de inocuidad..."
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
                  placeholder="Aroma intenso, color homogéneo brillante, sabor característico balanceado..."
                  className={`${getInputClass("caracteristicas")} resize-none`}
                />
                <FieldError msg={touched.caracteristicas && errors.caracteristicas} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Condiciones de Almacenamiento{requiredMark}</label>
                <textarea
                  value={condicionesAlmacenamiento}
                  onChange={(e) => handleFieldChange("condicionesAlmacenamiento", setCondicionesAlmacenamiento, e.target.value)}
                  onBlur={() => handleBlur("condicionesAlmacenamiento", condicionesAlmacenamiento)}
                  rows={3}
                  placeholder="Refrigeración constante a 2°C - 4°C en recipientes herméticos de grado alimentario..."
                  className={`${getInputClass("condicionesAlmacenamiento")} resize-none`}
                />
                <FieldError msg={touched.condicionesAlmacenamiento && errors.condicionesAlmacenamiento} />
              </div>

              <div>
                <label className={labelCls}>Información Nutricional{requiredMark}</label>
                <textarea
                  value={informacionNutricional}
                  onChange={(e) => handleFieldChange("informacionNutricional", setInformacionNutricional, e.target.value)}
                  onBlur={() => handleBlur("informacionNutricional", informacionNutricional)}
                  rows={3}
                  placeholder="Aporte por porción (ej. 30g): 80 kcal, grasas saludables, sodio..."
                  className={`${getInputClass("informacionNutricional")} resize-none`}
                />
                <FieldError msg={touched.informacionNutricional && errors.informacionNutricional} />
              </div>
            </div>

            <div>
              <label className={labelCls}>Observaciones y Alérgenos (Opcional)</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Advertencia de alérgenos (ej. contiene huevo, mostaza), recomendaciones para cocina..."
                className={inputCls}
              />
            </div>

            {/* Navegación Paso Anterior / Finalizar */}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("proceso")}
                className="px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-gray-200/80 dark:border-gray-700/80"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior: Elaboración</span>
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
                  Vigente desde el {formatFechaHoraFicha(versionInfo.fechaInicioVigencia)}. Modificaciones en la fórmula del insumo generarán una nueva versión trazable en el sistema.
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
                <span>Volver a Conservación & Calidad</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FichaTecnicaInsumo;
