/**
 * Utilidades centralizadas de sincronización de tiempos para Gestión de Producción, Ventas y Cocina (KDS)
 * Garantiza zona horaria America/Bogota (UTC-5), cálculo real de tiempo de cocción multi-producto,
 * estimación híbrida (Automática Inteligente + Manual) y trazabilidad acumulativa de hora por cada estado.
 */

const LOCAL_TRANSITIONS_STORAGE_KEY = "chazin_tiempos_estados_v2";
const LOCAL_DELIVERY_MODE_STORAGE_KEY = "chazin_modo_tiempo_entrega_v1";

export function recordLocalDeliveryTimeMode(orderId, mode = "AUTO", customTime = null) {
  if (!orderId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_DELIVERY_MODE_STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const key = String(orderId);
    const normalizedMode = String(mode || "AUTO").toUpperCase() === "MANUAL" ? "MANUAL" : "AUTO";
    store[key] = {
      mode: normalizedMode,
      value: customTime ? String(customTime).trim() : null,
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(LOCAL_DELIVERY_MODE_STORAGE_KEY, JSON.stringify(store));
    return store[key];
  } catch (e) {
    return null;
  }
}

export function getLocalDeliveryTimeMode(orderId) {
  if (!orderId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_DELIVERY_MODE_STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    return store[String(orderId)] || null;
  } catch (e) {
    return null;
  }
}

export function formatColombiaTime(dateInput) {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(d);
}

export function formatColombiaTimeWithSeconds(dateInput) {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(d);
}

export function formatColombiaDate(dateInput) {
  const d = dateInput ? (dateInput instanceof Date ? dateInput : new Date(dateInput)) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0];
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(d);
}

function normalizeStateKey(rawState = "") {
  const s = String(rawState || "").toUpperCase().trim();
  if (s.includes("PREPAR")) return "enPreparacion";
  if (s === "LISTO" || s === "LISTOS") return "listo";
  if (s.includes("DESPACH") || s.includes("CAMINO")) return "despachado";
  if (s.includes("ENTREG") || s.includes("COMPLET")) return "entregado";
  return "enCola";
}

export function recordLocalOrderTransition(orderId, nuevoEstado, baseOrder = null) {
  if (!orderId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_TRANSITIONS_STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    const key = String(orderId);
    const existing = store[key] || { tiemposEstados: {} };

    const now = new Date();
    const hora = formatColombiaTime(now);
    const horaExacta = formatColombiaTimeWithSeconds(now);
    const fecha = now.toISOString();

    if (!existing.tiemposEstados.enCola && baseOrder) {
      const baseFecha = baseOrder.fechaVenta || baseOrder.fecha || fecha;
      existing.tiemposEstados.enCola = {
        estado: "En Cola",
        hora: formatColombiaTime(baseFecha) || baseOrder.horaPedido || hora,
        horaExacta: formatColombiaTimeWithSeconds(baseFecha) || baseOrder.horaPedido || horaExacta,
        fecha: baseFecha
      };
    }

    const stateKey = normalizeStateKey(nuevoEstado);
    existing.estadoActual = nuevoEstado;
    existing.updatedAt = fecha;
    existing.tiemposEstados[stateKey] = {
      estado: nuevoEstado,
      hora,
      horaExacta,
      fecha
    };

    store[key] = existing;
    window.localStorage.setItem(LOCAL_TRANSITIONS_STORAGE_KEY, JSON.stringify(store));
    return existing;
  } catch (e) {
    return null;
  }
}

export function getLocalOrderTransition(orderId) {
  if (!orderId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_TRANSITIONS_STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    return store[String(orderId)] || null;
  } catch (e) {
    return null;
  }
}

export function inferProductPrepMinutes(nombreProducto = "", ftTiempo = null) {
  const n = String(nombreProducto || "").toLowerCase();
  const hasFoodKeyword =
    n.includes("hamburguesa") ||
    n.includes("burger") ||
    n.includes("perro") ||
    n.includes("salchipapa") ||
    n.includes("combo") ||
    n.includes("papa") ||
    n.includes("casco") ||
    n.includes("corral") ||
    n.includes("espiral") ||
    n.includes("chili") ||
    n.includes("tocineta");

  const isSimpleDrink =
    !hasFoodKeyword &&
    (n.includes("gaseosa") ||
      n.includes("coca-cola") ||
      n.includes("coca cola") ||
      n.includes("postobón") ||
      n.includes("postobon") ||
      n.includes("pepsi") ||
      n.includes("colombiana") ||
      n.includes("sprite") ||
      n.includes("quatro") ||
      n.includes("cuatro") ||
      n.includes("agua") ||
      n.includes("cristal") ||
      n.includes("jugo") ||
      n.includes("hit") ||
      n.includes("bebida"));

  const parsedFt = typeof ftTiempo === "number" ? ftTiempo : parseInt(String(ftTiempo || ""), 10);
  if (!isNaN(parsedFt) && parsedFt > 0) {
    if (!isSimpleDrink && parsedFt <= 2) {
      // Si es un plato cocinado pero tenía 1 min por error, inferir tiempo real de cocción
    } else {
      return parsedFt;
    }
  }

  if (isSimpleDrink) return 1;
  if (n.includes("combo") || n.includes("familiar") || n.includes("pareja")) return 14;
  if (n.includes("doble") || n.includes("salvaje") || n.includes("trufada") || n.includes("fest")) return 12;
  if (n.includes("hamburguesa") || n.includes("burger") || n.includes("salchipapa")) return 10;
  if (n.includes("perro")) return 8;
  if (n.includes("papa") || n.includes("casco") || n.includes("corral") || n.includes("espiral")) return 7;
  return 10;
}

export function calculateOrderPrepTime(productosList = [], fallbackPlatilloNombre = "") {
  if (!Array.isArray(productosList) || productosList.length === 0) {
    const fallbackMin = inferProductPrepMinutes(fallbackPlatilloNombre, null);
    return { totalMin: fallbackMin, formatted: `${fallbackMin} min` };
  }

  const withMinutes = productosList.map((p) => {
    const rawRecetaMin =
      p.receta?.tiempoPreparacionMin ||
      parseInt(String(p.receta?.tiempoPreparacion || p.tiempoPreparacion || ""), 10);
    const min = inferProductPrepMinutes(p.nombre || p.nombreProducto, rawRecetaMin);
    return {
      ...p,
      tiempoPreparacionMin: min,
      qty: Math.max(1, Number(p.cantidad) || 1)
    };
  });

  const cookedDishes = withMinutes.filter((p) => p.tiempoPreparacionMin > 2);
  if (cookedDishes.length > 0) {
    const maxCookedMin = Math.max(...cookedDishes.map((p) => p.tiempoPreparacionMin));
    const totalCookedUnits = cookedDishes.reduce((sum, p) => sum + p.qty, 0);
    const extraBatchMin = Math.min(10, Math.max(0, totalCookedUnits - 1) * 2);
    const totalMin = maxCookedMin + extraBatchMin;
    return { totalMin, formatted: `${totalMin} min` };
  }

  const maxDrinkMin = Math.max(1, ...withMinutes.map((p) => p.tiempoPreparacionMin || 1));
  return { totalMin: maxDrinkMin, formatted: `${maxDrinkMin} min` };
}

/**
 * Calcula automáticamente el Tiempo Estimado de Entrega / Despacho según:
 * 1) Fichas técnicas reales de todos los productos del pedido
 * 2) Modalidad de entrega (En Mesa/Local vs. Domicilio)
 * 3) Estado actual en Cocina/Producción y minutos ya transcurridos en preparación
 */
export function calculateAutomaticDeliveryEstimate(order = {}, nowMs = Date.now()) {
  let obsMeta = {};
  if (typeof order.observaciones === "string" && order.observaciones.trim().startsWith("{")) {
    try {
      obsMeta = JSON.parse(order.observaciones);
    } catch (e) {
      obsMeta = {};
    }
  }

  const productosList =
    Array.isArray(order.productos) && order.productos.length > 0
      ? order.productos
      : Array.isArray(obsMeta.productos) && obsMeta.productos.length > 0
      ? obsMeta.productos
      : [];

  const prep = calculateOrderPrepTime(productosList, order.platilloNombre);

  const rawTipo = String(
    order.tipoEntrega || order.tipo || obsMeta.tipoEntrega || order.mesa || order.tipoVenta || ""
  ).toLowerCase();
  const esDomicilio = rawTipo.includes("domicilio") || rawTipo.includes("delivery");

  const localCache = getLocalOrderTransition(order.id || order.idVenta);
  const serverEstadoRaw = String(order.estadoEntrega || order.estado || obsMeta.estadoCocina || "").toUpperCase();
  const rawEstado = String(
    serverEstadoRaw.includes("ENTREGAD") || serverEstadoRaw.includes("COMPLETAD")
      ? serverEstadoRaw
      : localCache?.estadoActual || order.estadoEntrega || obsMeta.estadoCocina || order.estado || "PENDIENTE"
  ).toUpperCase();

  let estadoCocina = "En Cola";
  if (rawEstado.includes("ENTREGADO") || rawEstado.includes("COMPLETAD")) {
    estadoCocina = "Entregado";
  } else if (rawEstado.includes("DESPACHADO") || rawEstado.includes("CAMINO")) {
    estadoCocina = "Despachado";
  } else if (rawEstado.includes("LISTO")) {
    estadoCocina = "Listo";
  } else if (rawEstado.includes("PREPARANDO") || rawEstado.includes("PREPARACIÓN") || rawEstado.includes("PREPARACION")) {
    estadoCocina = "En Preparación";
  }

  if (estadoCocina === "Entregado") {
    return {
      estimate: "Entregado",
      prepMin: prep.totalMin,
      prepFormatted: prep.formatted,
      esDomicilio,
      estadoCocina,
      detalleCalculo: `Pedido entregado (${prep.formatted} cocción base)`
    };
  }

  if (estadoCocina === "Despachado") {
    return {
      estimate: esDomicilio ? "En camino" : "Listo para entrega",
      prepMin: prep.totalMin,
      prepFormatted: prep.formatted,
      esDomicilio,
      estadoCocina,
      detalleCalculo: esDomicilio ? "Pedido despachado en ruta de domicilio" : "Pedido listo en barra/mesa"
    };
  }

  if (estadoCocina === "Listo") {
    if (esDomicilio) {
      return {
        estimate: "15-20 min",
        prepMin: prep.totalMin,
        prepFormatted: prep.formatted,
        esDomicilio,
        estadoCocina,
        detalleCalculo: "Cocción terminada (Listo) • Restan 15-20 min de ruta a domicilio"
      };
    }
    return {
      estimate: "Listo para entrega",
      prepMin: prep.totalMin,
      prepFormatted: prep.formatted,
      esDomicilio,
      estadoCocina,
      detalleCalculo: "Cocción terminada en cocina • Listo para entregar en mesa/barra"
    };
  }

  let minRange;
  let maxRange;

  if (esDomicilio) {
    minRange = prep.totalMin + 15;
    maxRange = prep.totalMin + 25;
  } else if (prep.totalMin <= 2) {
    minRange = 2;
    maxRange = 5;
  } else {
    minRange = prep.totalMin + 3;
    maxRange = prep.totalMin + 8;
  }

  const estimate = `${minRange}-${maxRange} min`;
  const modalidadTxt = esDomicilio
    ? "Domicilio (+15-25 min ruta)"
    : prep.totalMin <= 2
    ? "Servicio rápido bebidas"
    : "En Mesa (+3-8 min servicio)";

  return {
    estimate,
    prepMin: prep.totalMin,
    prepFormatted: prep.formatted,
    esDomicilio,
    estadoCocina,
    detalleCalculo: `Cocción receta: ${prep.formatted} + ${modalidadTxt} • Estado: ${estadoCocina}`
  };
}

export function resolveHybridDeliveryEstimate(order = {}, nowMs = Date.now()) {
  const autoInfo = calculateAutomaticDeliveryEstimate(order, nowMs);

  let obsMeta = {};
  if (typeof order.observaciones === "string" && order.observaciones.trim().startsWith("{")) {
    try {
      obsMeta = JSON.parse(order.observaciones);
    } catch (e) {
      obsMeta = {};
    }
  }

  const orderId = order.id || order.idVenta;
  const localMode = getLocalDeliveryTimeMode(orderId);

  const rawSavedTime = String(order.tiempoEstimadoEntrega || obsMeta.tiempoEstimadoEntrega || "").trim();
  const normSaved = rawSavedTime.toLowerCase().replace(/\s+/g, "");
  const isCorruptedAutoLiteral =
    normSaved === "auto" ||
    normSaved === "automatico" ||
    normSaved === "automático";

  const savedTime = isCorruptedAutoLiteral ? "" : rawSavedTime;
  const serverMode = isCorruptedAutoLiteral
    ? "AUTO"
    : String(order.modoTiempoEntrega || obsMeta.modoTiempoEntrega || "").toUpperCase();

  const normAutoEstimate = String(autoInfo.estimate || "").toLowerCase().replace(/\s+/g, "");
  const isGenericDefault =
    !savedTime ||
    normSaved === "15-20min" ||
    normSaved === "30-45min" ||
    normSaved === "35-45min" ||
    normSaved === normAutoEstimate;

  if (autoInfo.estadoCocina === "Entregado") {
    return {
      ...autoInfo,
      effectiveEstimate: "Entregado",
      isManual: false,
      mode: "AUTO",
      savedManualValue: savedTime || null
    };
  }

  if (localMode) {
    if (localMode.mode === "MANUAL") {
      const manualVal =
        localMode.value && !/^(auto|automatico|automático)$/i.test(localMode.value.trim())
          ? localMode.value.trim()
          : savedTime || autoInfo.estimate;
      return {
        ...autoInfo,
        effectiveEstimate: manualVal,
        isManual: true,
        mode: "MANUAL",
        savedManualValue: manualVal
      };
    }
    return {
      ...autoInfo,
      effectiveEstimate: autoInfo.estimate,
      isManual: false,
      mode: "AUTO",
      savedManualValue: null
    };
  }

  const isExplicitManual = serverMode === "MANUAL" || (!serverMode && !isGenericDefault);

  if (isExplicitManual && savedTime) {
    return {
      ...autoInfo,
      effectiveEstimate: savedTime,
      isManual: true,
      mode: "MANUAL",
      savedManualValue: savedTime
    };
  }

  return {
    ...autoInfo,
    effectiveEstimate: autoInfo.estimate,
    isManual: false,
    mode: "AUTO",
    savedManualValue: null
  };
}

/**
 * Resuelve todos los tiempos del pedido y construye la cronología acumulativa por estado
 * (En Cola -> En Preparación -> Listo -> Despachado -> Entregado).
 */
export function resolveOrderTimings(order = {}, nowMs = Date.now()) {
  const prep = calculateOrderPrepTime(order.productos, order.platilloNombre);
  const hybridDelivery = resolveHybridDeliveryEstimate(order, nowMs);

  let obsMeta = {};
  if (typeof order.observaciones === "string" && order.observaciones.trim().startsWith("{")) {
    try {
      obsMeta = JSON.parse(order.observaciones);
    } catch (e) {
      obsMeta = {};
    }
  }

  const localCache = getLocalOrderTransition(order.id || order.idVenta);
  const localTiempos = localCache?.tiemposEstados || {};
  const serverTiempos = order.tiemposEstados || obsMeta.tiemposEstados || {};

  const historial = Array.isArray(order.historialEstados)
    ? order.historialEstados
    : Array.isArray(obsMeta.historialEstados)
    ? obsMeta.historialEstados
    : [];

  const findHist = (matchFn) => [...historial].reverse().find(matchFn);
  const entryPreparando = findHist((h) => {
    const st = String(h?.estado || h?.etiqueta || "").toUpperCase();
    return st.includes("PREPAR");
  });
  const entryListo = findHist((h) => {
    const st = String(h?.estado || h?.etiqueta || "").toUpperCase();
    return st === "LISTO" || st === "LISTOS";
  });
  const entryDespachado = findHist((h) => {
    const st = String(h?.estado || h?.etiqueta || "").toUpperCase();
    return st.includes("DESPACH") || st.includes("CAMINO");
  });
  const entryEntregado = findHist((h) => {
    const st = String(h?.estado || h?.etiqueta || "").toUpperCase();
    return st.includes("ENTREG") || st.includes("COMPLET");
  });

  // Determinar nivel actual del estado (0: En Cola, 1: En Preparación, 2: Listo, 3: Despachado, 4: Entregado)
  const estadoStr = String(order.estado || hybridDelivery.estadoCocina || "En Cola");
  const STATE_ORDER = {
    "En Cola": 0,
    "En Preparación": 1,
    "Listo": 2,
    "Listos": 2,
    "Despachado": 3,
    "Entregado": 4
  };
  const currentStageIdx = STATE_ORDER[estadoStr] !== undefined ? STATE_ORDER[estadoStr] : 0;

  const baseDateObj = order.fechaVenta ? new Date(order.fechaVenta) : null;
  const baseMs = baseDateObj && !isNaN(baseDateObj.getTime()) ? baseDateObj.getTime() : nowMs;
  const addMinutesIso = (ms, mins) => new Date(ms + mins * 60000).toISOString();

  // 1. Etapa: En Cola
  const fechaEnColaIso =
    localTiempos.enCola?.fecha ||
    serverTiempos.enCola?.fecha ||
    (baseDateObj && !isNaN(baseDateObj.getTime()) ? baseDateObj.toISOString() : null);

  const horaPedido =
    localTiempos.enCola?.hora ||
    serverTiempos.enCola?.hora ||
    formatColombiaTime(fechaEnColaIso) ||
    order.horaPedido ||
    order.horario ||
    order.horaInicio ||
    "12:00 PM";

  const horaEnColaExacta =
    localTiempos.enCola?.horaExacta ||
    serverTiempos.enCola?.horaExacta ||
    formatColombiaTimeWithSeconds(fechaEnColaIso) ||
    horaPedido;

  const fechaColombia = formatColombiaDate(order.fechaVenta || order.fecha);
  const hoyColombia = formatColombiaDate(new Date(nowMs));
  const esDeHoy = fechaColombia === hoyColombia;

  // 2. Etapa: En Preparación
  const hasRealPrepRecord = Boolean(
    localTiempos.enPreparacion ||
      serverTiempos.enPreparacion ||
      entryPreparando ||
      order.fechaInicioPreparacion
  );

  let fechaInicioPrepIso =
    localTiempos.enPreparacion?.fecha ||
    serverTiempos.enPreparacion?.fecha ||
    order.fechaInicioPreparacion ||
    entryPreparando?.fecha ||
    (currentStageIdx === 1 ? order.fechaCambioEstado : null) ||
    null;

  if (currentStageIdx >= 1) {
    const rawPrepHora = formatColombiaTime(fechaInicioPrepIso) || order.horaInicioPreparacion;
    // Si es una orden histórica que no tenía hora de preparación distinta a la de creación, avanzar +1 min
    if (!fechaInicioPrepIso || (!localTiempos.enPreparacion && !serverTiempos.enPreparacion && !entryPreparando && rawPrepHora === horaPedido)) {
      fechaInicioPrepIso = addMinutesIso(baseMs, 1);
    }
  }

  let horaInicioPreparacion =
    currentStageIdx >= 1
      ? localTiempos.enPreparacion?.hora ||
        serverTiempos.enPreparacion?.hora ||
        formatColombiaTime(fechaInicioPrepIso) ||
        order.horaInicioPreparacion ||
        (currentStageIdx === 1 && order.horaEstado && order.horaEstado !== horaPedido ? order.horaEstado : null) ||
        formatColombiaTime(addMinutesIso(baseMs, 1))
      : null;

  const horaInicioPrepExacta =
    localTiempos.enPreparacion?.horaExacta ||
    serverTiempos.enPreparacion?.horaExacta ||
    entryPreparando?.horaExacta ||
    formatColombiaTimeWithSeconds(fechaInicioPrepIso) ||
    horaInicioPreparacion;

  // Si la transición real ocurrió en el mismo minuto que En Cola (ej. 07:22:10 PM -> 07:22:45 PM), mostrar segundos para diferenciarlas
  if (
    currentStageIdx >= 1 &&
    horaInicioPreparacion === horaPedido &&
    horaInicioPrepExacta &&
    horaInicioPrepExacta !== horaEnColaExacta
  ) {
    horaInicioPreparacion = horaInicioPrepExacta;
  } else if (currentStageIdx >= 1 && horaInicioPreparacion === horaPedido) {
    horaInicioPreparacion = formatColombiaTime(addMinutesIso(baseMs, 1)) || horaInicioPreparacion;
  }

  // 3. Etapa: Listo
  const prepStartMs =
    fechaInicioPrepIso && !isNaN(new Date(fechaInicioPrepIso).getTime())
      ? new Date(fechaInicioPrepIso).getTime()
      : baseMs + 60000;
  const prepMinutos = Math.max(1, Number(prep.totalMin) || 10);

  let fechaListoIso =
    localTiempos.listo?.fecha ||
    serverTiempos.listo?.fecha ||
    order.fechaListo ||
    entryListo?.fecha ||
    (currentStageIdx === 2 ? order.fechaCambioEstado : null) ||
    null;

  if (currentStageIdx >= 2) {
    const rawListoHora = formatColombiaTime(fechaListoIso) || order.horaListo;
    if (
      !fechaListoIso ||
      (!localTiempos.listo && !serverTiempos.listo && !entryListo && (rawListoHora === horaPedido || rawListoHora === horaInicioPreparacion))
    ) {
      fechaListoIso = addMinutesIso(prepStartMs, prepMinutos);
    }
  }

  let horaListo =
    currentStageIdx >= 2
      ? localTiempos.listo?.hora ||
        serverTiempos.listo?.hora ||
        formatColombiaTime(fechaListoIso) ||
        order.horaListo ||
        formatColombiaTime(addMinutesIso(prepStartMs, prepMinutos))
      : null;

  const horaListoExacta =
    localTiempos.listo?.horaExacta ||
    serverTiempos.listo?.horaExacta ||
    entryListo?.horaExacta ||
    formatColombiaTimeWithSeconds(fechaListoIso) ||
    horaListo;

  if (
    currentStageIdx >= 2 &&
    horaListo === horaInicioPreparacion &&
    horaListoExacta &&
    horaListoExacta !== horaInicioPrepExacta
  ) {
    horaListo = horaListoExacta;
  } else if (currentStageIdx >= 2 && (horaListo === horaPedido || horaListo === horaInicioPreparacion)) {
    horaListo = formatColombiaTime(addMinutesIso(prepStartMs, prepMinutos)) || horaListo;
  }

  // 4. Etapa: Despachado
  const listoMs =
    fechaListoIso && !isNaN(new Date(fechaListoIso).getTime())
      ? new Date(fechaListoIso).getTime()
      : prepStartMs + prepMinutos * 60000;

  let fechaDespachadoIso =
    localTiempos.despachado?.fecha ||
    serverTiempos.despachado?.fecha ||
    order.fechaDespachado ||
    entryDespachado?.fecha ||
    (currentStageIdx === 3 ? order.fechaCambioEstado : null) ||
    null;

  if (currentStageIdx >= 3) {
    const rawDespHora = formatColombiaTime(fechaDespachadoIso) || order.horaDespachado;
    if (
      !fechaDespachadoIso ||
      (!localTiempos.despachado && !serverTiempos.despachado && !entryDespachado && (rawDespHora === horaPedido || rawDespHora === horaListo))
    ) {
      fechaDespachadoIso = addMinutesIso(listoMs, 1);
    }
  }

  let horaDespachado =
    currentStageIdx >= 3
      ? localTiempos.despachado?.hora ||
        serverTiempos.despachado?.hora ||
        formatColombiaTime(fechaDespachadoIso) ||
        order.horaDespachado ||
        formatColombiaTime(addMinutesIso(listoMs, 1))
      : null;

  const horaDespachadoExacta =
    localTiempos.despachado?.horaExacta ||
    serverTiempos.despachado?.horaExacta ||
    entryDespachado?.horaExacta ||
    formatColombiaTimeWithSeconds(fechaDespachadoIso) ||
    horaDespachado;

  if (
    currentStageIdx >= 3 &&
    horaDespachado === horaListo &&
    horaDespachadoExacta &&
    horaDespachadoExacta !== horaListoExacta
  ) {
    horaDespachado = horaDespachadoExacta;
  } else if (currentStageIdx >= 3 && (horaDespachado === horaPedido || horaDespachado === horaListo)) {
    horaDespachado = formatColombiaTime(addMinutesIso(listoMs, 1)) || horaDespachado;
  }

  // 5. Etapa: Entregado
  const despachadoMs =
    fechaDespachadoIso && !isNaN(new Date(fechaDespachadoIso).getTime())
      ? new Date(fechaDespachadoIso).getTime()
      : listoMs + 60000;
  const deliveryAddMin = hybridDelivery.esDomicilio ? 15 : 2;

  let fechaEntregaIso =
    localTiempos.entregado?.fecha ||
    serverTiempos.entregado?.fecha ||
    order.fechaEntrega ||
    entryEntregado?.fecha ||
    (currentStageIdx === 4 ? order.fechaCambioEstado : null) ||
    null;

  if (currentStageIdx >= 4) {
    const rawEntHora = formatColombiaTime(fechaEntregaIso) || order.horaEntrega;
    if (
      !fechaEntregaIso ||
      (!localTiempos.entregado && !serverTiempos.entregado && !entryEntregado && (rawEntHora === horaPedido || rawEntHora === horaDespachado))
    ) {
      fechaEntregaIso = addMinutesIso(despachadoMs, deliveryAddMin);
    }
  }

  let horaEntrega =
    currentStageIdx >= 4
      ? localTiempos.entregado?.hora ||
        serverTiempos.entregado?.hora ||
        formatColombiaTime(fechaEntregaIso) ||
        order.horaEntrega ||
        formatColombiaTime(addMinutesIso(despachadoMs, deliveryAddMin))
      : null;

  const horaEntregaExacta =
    localTiempos.entregado?.horaExacta ||
    serverTiempos.entregado?.horaExacta ||
    entryEntregado?.horaExacta ||
    formatColombiaTimeWithSeconds(fechaEntregaIso) ||
    horaEntrega;

  if (
    currentStageIdx >= 4 &&
    horaEntrega === horaDespachado &&
    horaEntregaExacta &&
    horaEntregaExacta !== horaDespachadoExacta
  ) {
    horaEntrega = horaEntregaExacta;
  } else if (currentStageIdx >= 4 && (horaEntrega === horaPedido || horaEntrega === horaDespachado)) {
    horaEntrega = formatColombiaTime(addMinutesIso(despachadoMs, deliveryAddMin)) || horaEntrega;
  }

  // Hora del estado activo actual
  const horaEstado =
    (currentStageIdx === 0 ? horaPedido : null) ||
    (currentStageIdx === 1 ? horaInicioPreparacion : null) ||
    (currentStageIdx === 2 ? horaListo : null) ||
    (currentStageIdx === 3 ? horaDespachado : null) ||
    (currentStageIdx === 4 ? horaEntrega : null) ||
    order.horaEstado ||
    horaPedido;

  let etiquetaHoraEstado = `Hora: ${horaEstado}`;
  if (currentStageIdx === 0) {
    etiquetaHoraEstado = `En cola: ${horaPedido}`;
  } else if (currentStageIdx === 1) {
    etiquetaHoraEstado = `Preparación: ${horaInicioPreparacion}`;
  } else if (currentStageIdx === 2) {
    etiquetaHoraEstado = `Listo: ${horaListo}`;
  } else if (currentStageIdx === 3) {
    etiquetaHoraEstado = `Despachado: ${horaDespachado}`;
  } else if (currentStageIdx === 4) {
    etiquetaHoraEstado = `Entregado: ${horaEntrega}`;
  }

  // Cronología completa de los 5 estados
  const cronologiaEstados = [
    {
      key: "enCola",
      stageIdx: 0,
      label: "En Cola",
      fullLabel: "En Cola",
      hora: horaPedido,
      horaExacta: horaEnColaExacta,
      reached: currentStageIdx >= 0,
      completed: currentStageIdx > 0,
      current: currentStageIdx === 0
    },
    {
      key: "enPreparacion",
      stageIdx: 1,
      label: "Preparación",
      fullLabel: "En Preparación",
      hora: horaInicioPreparacion,
      horaExacta: horaInicioPrepExacta,
      reached: currentStageIdx >= 1,
      completed: currentStageIdx > 1,
      current: currentStageIdx === 1
    },
    {
      key: "listo",
      stageIdx: 2,
      label: "Listo",
      fullLabel: "Listo",
      hora: horaListo,
      horaExacta: horaListoExacta,
      reached: currentStageIdx >= 2,
      completed: currentStageIdx > 2,
      current: currentStageIdx === 2
    },
    {
      key: "despachado",
      stageIdx: 3,
      label: "Despachado",
      fullLabel: "Despachado",
      hora: horaDespachado,
      horaExacta: horaDespachadoExacta,
      reached: currentStageIdx >= 3,
      completed: currentStageIdx > 3,
      current: currentStageIdx === 3
    },
    {
      key: "entregado",
      stageIdx: 4,
      label: "Entregado",
      fullLabel: "Entregado",
      hora: horaEntrega,
      horaExacta: horaEntregaExacta,
      reached: currentStageIdx >= 4,
      completed: false,
      current: currentStageIdx === 4
    }
  ];

  const estadosAlcanzados = cronologiaEstados.filter((s) => s.reached && s.hora);

  const isActive = currentStageIdx === 0 || currentStageIdx === 1;
  let elapsedInfo = null;

  if (isActive) {
    const refIso =
      currentStageIdx === 1 && fechaInicioPrepIso
        ? fechaInicioPrepIso
        : order.fechaVenta || order.fechaCambioEstado;
    const refDate = refIso ? new Date(refIso) : null;

    if (refDate && !isNaN(refDate.getTime())) {
      const diffMin = Math.max(0, Math.floor((nowMs - refDate.getTime()) / 60000));
      if (!esDeHoy && diffMin > 180) {
        const dParts = fechaColombia.split("-");
        const shortDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}` : fechaColombia;
        elapsedInfo = {
          text: `Fecha: ${shortDate}`,
          level: "past_day",
          minutes: diffMin
        };
      } else if (diffMin < 1) {
        elapsedInfo = {
          text: currentStageIdx === 1 ? "Cocinando (<1 min)" : "En espera (<1 min)",
          level: "fresh",
          minutes: 0
        };
      } else if (diffMin >= 60) {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        elapsedInfo = {
          text: `Hace ${h}h ${m > 0 ? `${m}m` : ""}`.trim(),
          level: "critical",
          minutes: diffMin
        };
      } else {
        const target = prep.totalMin || 10;
        const level =
          diffMin <= target
            ? "fresh"
            : diffMin <= target + 5
            ? "warning"
            : "critical";
        elapsedInfo = {
          text:
            currentStageIdx === 1
              ? `En cocción: ${diffMin} / ${target} min`
              : `En espera: ${diffMin} min`,
          level,
          minutes: diffMin
        };
      }
    }
  }

  return {
    tiempoPreparacion: prep.formatted,
    tiempoMinutos: prep.totalMin,
    tiempoEstimadoEntrega: hybridDelivery.effectiveEstimate,
    tiempoAutomaticoSugerido: hybridDelivery.estimate,
    detalleCalculoTiempo: hybridDelivery.detalleCalculo,
    modoTiempoEntrega: hybridDelivery.mode,
    isTiempoManual: hybridDelivery.isManual,
    fechaColombia,
    esDeHoy,
    horaPedido,
    horaInicio: horaInicioPreparacion || horaPedido,
    horaInicioPreparacion,
    horaListo,
    horaDespachado,
    horaEntrega,
    horaEstado,
    etiquetaHoraEstado,
    cronologiaEstados,
    estadosAlcanzados,
    elapsedInfo
  };
}
