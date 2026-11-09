/**
 * Utilidades centralizadas de sincronización de tiempos para Gestión de Producción, Ventas y Cocina (KDS)
 * Garantiza zona horaria America/Bogota (UTC-5), cálculo real de tiempo de cocción multi-producto,
 * estimación híbrida (Automática Inteligente + Manual) y cronómetro en vivo por etapa del pedido.
 */

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

  const rawEstado = String(order.estadoEntrega || order.estado || "PENDIENTE").toUpperCase();
  let estadoCocina = "En Cola";
  if (rawEstado.includes("ENTREGADO") || rawEstado.includes("COMPLETAD")) {
    estadoCocina = "Entregado";
  } else if (rawEstado.includes("DESPACHADO")) {
    estadoCocina = "Despachado";
  } else if (rawEstado.includes("LISTO")) {
    estadoCocina = "Listo";
  } else if (rawEstado.includes("PREPARANDO") || rawEstado.includes("PREPARACIÓN") || rawEstado.includes("PREPARACION")) {
    estadoCocina = "En Preparación";
  }

  const fechaColombia = formatColombiaDate(order.fechaVenta || order.fecha);
  const hoyColombia = formatColombiaDate(new Date(nowMs));
  const esDeHoy = fechaColombia === hoyColombia;

  // 1. Si ya fue entregado
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

  // 2. Si ya fue despachado
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

  // 3. Si ya está LISTO en cocina
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

  // 4. Si está En Preparación: descontar minutos ya cocinados si es de hoy
  let remainingPrepMin = prep.totalMin;
  let elapsedCookingMin = 0;

  if (estadoCocina === "En Preparación" && esDeHoy) {
    const refIso = order.fechaInicioPreparacion || obsMeta.fechaInicioPreparacion || order.fechaCambioEstado || obsMeta.fechaCambioEstado || order.fechaVenta;
    if (refIso) {
      const refDate = new Date(refIso);
      if (!isNaN(refDate.getTime())) {
        elapsedCookingMin = Math.max(0, Math.floor((nowMs - refDate.getTime()) / 60000));
        if (elapsedCookingMin <= 60) {
          remainingPrepMin = Math.max(2, prep.totalMin - elapsedCookingMin);
        }
      }
    }
  }

  // 5. Calcular rango según modalidad y minutos restantes de cocción
  let minRange;
  let maxRange;

  if (esDomicilio) {
    minRange = remainingPrepMin + 15;
    maxRange = remainingPrepMin + 25;
  } else if (prep.totalMin <= 2) {
    // Pedido exclusivo de bebidas en local
    minRange = 2;
    maxRange = 5;
  } else {
    minRange = remainingPrepMin + 3;
    maxRange = remainingPrepMin + 8;
  }

  const estimate = `${minRange}-${maxRange} min`;
  const modalidadTxt = esDomicilio ? "Domicilio (+15-25 min ruta)" : prep.totalMin <= 2 ? "Servicio rápido bebidas" : "En Mesa (+3-8 min servicio)";
  const progresoTxt =
    estadoCocina === "En Preparación" && elapsedCookingMin > 0 && elapsedCookingMin <= 60
      ? ` • En cocción (${elapsedCookingMin} min transcurridos)`
      : ` • ${estadoCocina}`;

  return {
    estimate,
    prepMin: prep.totalMin,
    prepFormatted: prep.formatted,
    esDomicilio,
    estadoCocina,
    detalleCalculo: `Cocción receta: ${prep.formatted} + ${modalidadTxt}${progresoTxt}`
  };
}

/**
 * Resuelve el Tiempo Estimado en modo Híbrido (Automático + Manual):
 * - Si el usuario fijó manualmente un tiempo (modoTiempoEntrega === 'MANUAL' o valor personalizado distinto al genérico)
 *   y la orden aún no está entregada, respeta el ajuste manual, pero expone también el cálculo automático.
 * - Si está en modo Automático (por defecto), devuelve siempre el cálculo automático sincronizado en tiempo real.
 */
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

  const savedTime = String(order.tiempoEstimadoEntrega || obsMeta.tiempoEstimadoEntrega || "").trim();
  const savedMode = String(order.modoTiempoEntrega || obsMeta.modoTiempoEntrega || "").toUpperCase();

  // Detectar si el valor guardado era simplemente el placeholder genérico antiguo ("15 - 20 min" o "30 - 45 min")
  const normSaved = savedTime.toLowerCase().replace(/\s+/g, "");
  const isGenericDefault =
    !savedTime ||
    normSaved === "15-20min" ||
    normSaved === "30-45min" ||
    normSaved === "35-45min";

  // Si la orden ya fue entregada o está lista en local, el estado real de cocina prevalece
  if (autoInfo.estadoCocina === "Entregado") {
    return {
      ...autoInfo,
      effectiveEstimate: "Entregado",
      isManual: false,
      mode: "AUTO",
      savedManualValue: savedTime || null
    };
  }

  const isExplicitManual = savedMode === "MANUAL" || (!savedMode && !isGenericDefault);

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

export function resolveOrderTimings(order = {}, nowMs = Date.now()) {
  const prep = calculateOrderPrepTime(order.productos, order.platilloNombre);
  const hybridDelivery = resolveHybridDeliveryEstimate(order, nowMs);

  const historial = Array.isArray(order.historialEstados) ? order.historialEstados : [];
  const entryPreparando = historial.find((h) => {
    const st = String(h?.estado || "").toUpperCase();
    return st === "PREPARANDO" || st === "EN PREPARACIÓN" || st === "EN PREPARACION";
  });
  const entryListo = [...historial].reverse().find((h) => String(h?.estado || "").toUpperCase() === "LISTO");
  const entryEntregado = [...historial].reverse().find((h) => {
    const st = String(h?.estado || "").toUpperCase();
    return st === "ENTREGADO" || st === "DESPACHADO" || st === "COMPLETADA";
  });
  const lastHistEntry = historial.length > 0 ? historial[historial.length - 1] : null;

  // Hora exacta del pedido en America/Bogota
  const horaPedido =
    formatColombiaTime(order.fechaVenta) ||
    order.horaPedido ||
    order.horaInicio ||
    "12:00 PM";

  const fechaColombia = formatColombiaDate(order.fechaVenta || order.fecha);
  const hoyColombia = formatColombiaDate(new Date(nowMs));
  const esDeHoy = fechaColombia === hoyColombia;

  const fechaInicioPrepIso =
    order.fechaInicioPreparacion ||
    entryPreparando?.fecha ||
    (order.estado === "En Preparación" ? order.fechaCambioEstado : null) ||
    null;

  const horaInicioPreparacion =
    formatColombiaTime(fechaInicioPrepIso) ||
    order.horaInicioPreparacion ||
    null;

  const fechaListoIso =
    order.fechaListo ||
    entryListo?.fecha ||
    (order.estado === "Listo" || order.estado === "Listos" ? order.fechaCambioEstado : null) ||
    null;

  const horaListo = formatColombiaTime(fechaListoIso) || order.horaListo || null;

  const fechaEntregaIso =
    order.fechaEntrega ||
    entryEntregado?.fecha ||
    (order.estado === "Entregado" || order.estado === "Despachado" ? order.fechaCambioEstado : null) ||
    null;

  const horaEntrega = formatColombiaTime(fechaEntregaIso) || order.horaEntrega || null;

  // Hora exacta del cambio de estado actual en America/Bogota
  const horaEstado =
    formatColombiaTime(order.fechaCambioEstado) ||
    formatColombiaTime(lastHistEntry?.fecha) ||
    (order.estado === "En Preparación" ? horaInicioPreparacion : null) ||
    (order.estado === "Listo" || order.estado === "Listos" ? horaListo : null) ||
    (order.estado === "Entregado" || order.estado === "Despachado" ? horaEntrega : null) ||
    horaPedido;

  let etiquetaHoraEstado = `Hora: ${horaEstado}`;
  if (order.estado === "En Cola") {
    etiquetaHoraEstado = `En cola: ${horaPedido}`;
  } else if (order.estado === "En Preparación") {
    etiquetaHoraEstado = `Inició: ${horaInicioPreparacion || horaEstado}`;
  } else if (order.estado === "Listo" || order.estado === "Listos") {
    etiquetaHoraEstado = `Listo: ${horaListo || horaEstado}`;
  } else if (order.estado === "Despachado") {
    etiquetaHoraEstado = `Despachado: ${horaEntrega || horaEstado}`;
  } else if (order.estado === "Entregado") {
    etiquetaHoraEstado = `Entregado: ${horaEntrega || horaEstado}`;
  }

  const isActive = order.estado === "En Cola" || order.estado === "En Preparación";
  let elapsedInfo = null;

  if (isActive) {
    const refIso =
      order.estado === "En Preparación" && fechaInicioPrepIso
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
          text: order.estado === "En Preparación" ? "Cocinando (<1 min)" : "En espera (<1 min)",
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
            order.estado === "En Preparación"
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
    horaEntrega,
    horaEstado,
    etiquetaHoraEstado,
    elapsedInfo
  };
}
