/**
 * Chazin Food - Motor de Búsqueda Multicriterio Avanzado
 * Normalización de acentos, búsqueda multitoken por palabras clave,
 * e indexación profunda de campos anidados (productos, clientes, responsables,
 * métodos de pago, totales, fechas, horas y notas).
 */

/**
 * Normaliza un texto removiendo diacríticos/acentos, espacios extra y en minúsculas.
 * Ej: "Pérez" -> "perez", "Sándwich" -> "sandwich", "Canción" -> "cancion"
 */
export function normalizeSearchText(val) {
  if (val === null || val === undefined) return "";
  const str = typeof val === "string" ? val : String(val);
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Divide la consulta del usuario en tokens (palabras clave individuales).
 * Ej: "Carlos Hamburguesa Mesa 2" -> ["carlos", "hamburguesa", "mesa", "2"]
 */
export function tokenizeSearchQuery(query = "") {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  return normalized.split(/\s+/).filter(Boolean);
}

/**
 * Meses en español para búsqueda por nombre de mes
 */
const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const DIAS_ES = [
  "domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"
];

/**
 * Construye un corpus textual exhaustivo de un registro de Venta / Pedido.
 * Incluye todos los datos específicos del registro para permitir búsqueda profunda.
 */
export function buildVentaSearchCorpus(v = {}) {
  const parts = [];

  // 1. Identificadores
  const idStr = String(v.id || v.idVenta || "");
  if (idStr) {
    parts.push(idStr, `#${idStr}`);
    parts.push(`ped-${idStr.padStart(3, "0")}`, `ven-${idStr.padStart(4, "0")}`);
  }
  if (v.numeroVenta) parts.push(v.numeroVenta);
  if (v.codigoPedido) parts.push(v.codigoPedido);
  if (v.idTrans) parts.push(v.idTrans);

  // 2. Cliente
  const rawClient = typeof v.cliente === "string" ? v.cliente : (v.clienteNombre || v.cliente?.nombre || "");
  const clientApellidos = typeof v.cliente === "object" ? (v.cliente?.apellidos || "") : "";
  const clientFullName = `${rawClient} ${clientApellidos}`.trim();
  if (clientFullName) parts.push(clientFullName);
  if (rawClient) parts.push(rawClient);
  if (clientApellidos) parts.push(clientApellidos);

  // Teléfono del cliente
  const rawTel = String(v.clienteTelefono || v.telefono || v.cliente?.telefono || "");
  if (rawTel) {
    parts.push(rawTel);
    const cleanTel = rawTel.replace(/\D/g, "");
    if (cleanTel) parts.push(cleanTel);
  }

  // Documento del cliente
  const rawDoc = String(v.clienteDocumento || v.documento || v.cliente?.documento || "");
  if (rawDoc) {
    parts.push(rawDoc);
    const cleanDoc = rawDoc.replace(/\D/g, "");
    if (cleanDoc) parts.push(cleanDoc);
  }

  // Email del cliente
  const clientEmail = v.clienteEmail || v.email || v.cliente?.email || v.cliente?.usuario?.email || "";
  if (clientEmail) parts.push(clientEmail);

  // Fidelidad del cliente
  const fidelidadTipo = v.clienteFidelidad?.tipo || v.cliente?.tipo || (v.esVip ? "VIP" : "");
  if (fidelidadTipo) {
    parts.push(fidelidadTipo);
    if (fidelidadTipo.toLowerCase().includes("regular")) {
      parts.push("irregular");
    }
  }

  // Dirección y ubicación
  let obsMeta = {};
  if (typeof v.observaciones === "string" && v.observaciones.trim().startsWith("{")) {
    try { obsMeta = JSON.parse(v.observaciones); } catch (e) {}
  } else if (typeof v.observaciones === "object" && v.observaciones) {
    obsMeta = v.observaciones;
  }
  const direccion = String(v.direccion || v.direccionEntrega || obsMeta.direccion || v.cliente?.direccion || "");
  if (direccion) parts.push(direccion);

  // 3. PRODUCTOS, VARIANTES, ADICIONES Y OBSERVACIONES DE PRODUCTO
  const productosList = Array.isArray(v.productos) && v.productos.length > 0
    ? v.productos
    : (Array.isArray(v.detalles) && v.detalles.length > 0 ? v.detalles : []);

  productosList.forEach((p) => {
    const pName = p.nombre || p.nombreProducto || p.variante?.producto?.nombre || p.variante?.nombre || "";
    if (pName) {
      parts.push(pName);
      if (p.cantidad) {
        parts.push(`${p.cantidad}x ${pName}`, `${p.cantidad} ${pName}`);
      }
    }
    if (p.variante?.nombre) parts.push(p.variante.nombre);
    if (p.observaciones) parts.push(p.observaciones);
    if (p.nota) parts.push(p.nota);

    // Adiciones / Extras
    if (Array.isArray(p.adiciones)) {
      p.adiciones.forEach((a) => {
        const aName = typeof a === "object" ? (a.nombre || a.adicion?.nombre) : String(a);
        if (aName) parts.push(aName);
      });
    }
  });

  // 4. Responsable / Vendedor / Mesero
  if (v.responsable) {
    if (v.responsable.nombre) parts.push(v.responsable.nombre);
    if (v.responsable.rol) parts.push(v.responsable.rol);
    if (v.responsable.email) parts.push(v.responsable.email);
  }
  if (v.usuario) {
    const uNombre = `${v.usuario.nombre || ""} ${v.usuario.apellidos || ""}`.trim();
    if (uNombre) parts.push(uNombre);
    if (v.usuario.rolInfo?.nombre) parts.push(v.usuario.rolInfo.nombre);
  }

  // 5. Mesa / Ubicación en salón
  const mesaVal = v.mesa || obsMeta.mesa || obsMeta.numeroMesa;
  if (mesaVal) {
    parts.push(`mesa ${mesaVal}`, `mesa #${mesaVal}`, String(mesaVal));
  } else if (String(v.tipoEntrega || "").toLowerCase().includes("mesa")) {
    parts.push("en mesa", "mesa");
  }

  // 6. Canal y Tipo de Entrega
  const tipoEntrega = String(v.tipoEntrega || obsMeta.tipoEntrega || "");
  if (tipoEntrega) parts.push(tipoEntrega);
  const origen = String(v.origen || v.origenNombre || (tipoEntrega.toLowerCase().includes("domicilio") ? "ONLINE" : "PUNTO_FISICO"));
  parts.push(origen);
  if (origen.toUpperCase().includes("ONLINE")) {
    parts.push("venta online", "online", "web", "domicilio");
  }
  if (origen.toUpperCase().includes("PUNTO") || origen.toUpperCase().includes("FISICO")) {
    parts.push("punto fisico", "local", "mostrador", "en local");
  }
  if (tipoEntrega.toLowerCase().includes("recoger") || tipoEntrega.toLowerCase().includes("llevar")) {
    parts.push("para llevar", "llevar", "recoger");
  }

  // 7. Método de Pago y Estado de Pago
  const metodoPago = String(v.metodoPago || v.metodo_pago || v.medioPago || obsMeta.metodoPago || "");
  if (metodoPago) {
    parts.push(metodoPago);
    const mLower = metodoPago.toLowerCase();
    if (mLower.includes("transf") || mLower.includes("nequi") || mLower.includes("davi")) {
      parts.push("transferencia", "nequi", "daviplata", "bancolombia");
    }
    if (mLower.includes("tarjeta")) {
      parts.push("tarjeta", "debito", "credito", "pos");
    }
    if (mLower.includes("efectivo")) {
      parts.push("efectivo", "cash");
    }
  }
  if (v.estadoPago) parts.push(v.estadoPago);

  // 8. Estado del Pedido / Venta
  const estadoStr = String(v.estado || "");
  const estadoEntregaStr = String(v.estadoEntrega || "");
  if (estadoStr) parts.push(estadoStr);
  if (estadoEntregaStr) parts.push(estadoEntregaStr);

  const eLower = `${estadoStr} ${estadoEntregaStr}`.toLowerCase();
  if (eLower.includes("pend")) parts.push("pendiente", "en espera");
  if (eLower.includes("prepar")) parts.push("preparando", "en preparacion", "cocina");
  if (eLower.includes("list")) parts.push("listo", "preparado");
  if (eLower.includes("entreg") || eLower.includes("complet")) parts.push("entregado", "completada", "cerrada");
  if (eLower.includes("cancel") || eLower.includes("anul")) parts.push("cancelado", "cancelada", "anulada", "anulado");

  // 9. Fechas, Horas y Períodos
  const rawFecha = v.fecha || v.fechaVenta;
  if (rawFecha) {
    try {
      const d = new Date(rawFecha);
      if (!isNaN(d.getTime())) {
        const isoDate = d.toISOString().split("T")[0]; // "2026-08-06"
        parts.push(isoDate);

        const year = d.getFullYear();
        const monthNum = d.getMonth();
        const dayNum = d.getDate();
        const dayOfWeek = d.getDay();

        parts.push(String(year));
        parts.push(MESES_ES[monthNum] || "");
        parts.push(DIAS_ES[dayOfWeek] || "");
        parts.push(`${dayNum}/${monthNum + 1}/${year}`);
        parts.push(`${String(dayNum).padStart(2, "0")}/${String(monthNum + 1).padStart(2, "0")}/${year}`);
        parts.push(`${dayNum} de ${MESES_ES[monthNum]}`);

        // Hora
        const hours24 = d.getHours();
        const minutes = d.getMinutes();
        const minStr = String(minutes).padStart(2, "0");
        const hours12 = hours24 % 12 || 12;
        const isPm = hours24 >= 12;
        const ampm = isPm ? "pm" : "am";

        parts.push(`${hours12}:${minStr}`, `${hours12}:${minStr} ${ampm}`, `${hours12}:${minStr}${ampm}`);
        parts.push(`${String(hours24).padStart(2, "0")}:${minStr}`);
        parts.push(`:${minStr}`, `${minStr} min`, `${minStr} minutos`);
        parts.push(ampm, isPm ? "tarde" : "manana");
        if (hours24 >= 18) parts.push("noche");
      }
    } catch (e) {}
  }
  if (v.horario) parts.push(String(v.horario));
  if (v.fechaFormatted) parts.push(String(v.fechaFormatted));
  if (v.tiempoEstimadoEntrega) parts.push(String(v.tiempoEstimadoEntrega));

  // 10. Valores Financieros y Descuentos
  const totalNum = Number(v.total || v.subtotal || 0);
  parts.push(String(totalNum));
  parts.push(`$${totalNum.toLocaleString("es-CO")}`);
  parts.push(totalNum.toLocaleString("es-CO"));
  parts.push(`${totalNum} cop`, `$${totalNum}`);

  if (v.subtotal) {
    const subNum = Number(v.subtotal);
    parts.push(String(subNum), `$${subNum.toLocaleString("es-CO")}`);
  }

  const descPct = Number(v.descuentoPorcentaje || 0);
  if (descPct > 0) {
    parts.push(`${descPct}%`, `${descPct} %`, `${descPct} porciento`, "descuento", "con descuento");
  }

  // 11. Observaciones generales
  if (typeof v.observaciones === "string") parts.push(v.observaciones);
  if (obsMeta.nota) parts.push(obsMeta.nota);

  // Retornar cadena normalizada única
  return normalizeSearchText(parts.join(" "));
}

/**
 * Construye un corpus textual exhaustivo de un registro de Cliente.
 */
export function buildClienteSearchCorpus(c = {}) {
  const parts = [];

  // ID
  const idStr = String(c.id || c.idCliente || "");
  if (idStr) parts.push(idStr, `#${idStr}`);

  // Nombre y apellidos
  const nombre = c.nombre || "";
  const apellidos = c.apellidos || "";
  const nombreCompleto = `${nombre} ${apellidos}`.trim();
  if (nombreCompleto) parts.push(nombreCompleto);
  if (nombre) parts.push(nombre);
  if (apellidos) parts.push(apellidos);

  // Email
  if (c.email) parts.push(c.email);

  // Teléfono
  const rawTel = String(c.telefono || "");
  if (rawTel) {
    parts.push(rawTel);
    const cleanTel = rawTel.replace(/\D/g, "");
    if (cleanTel) parts.push(cleanTel);
  }

  // Documento
  const rawDoc = String(c.documento || "");
  if (rawDoc) {
    parts.push(rawDoc);
    const cleanDoc = rawDoc.replace(/\D/g, "");
    if (cleanDoc) parts.push(cleanDoc);
  }

  // Dirección
  if (c.direccion) parts.push(c.direccion);

  // Fidelidad
  const clientTipo = c.tipo || (c.esVip ? "VIP" : "Nuevo");
  if (clientTipo) {
    parts.push(clientTipo);
    if (clientTipo.toLowerCase().includes("regular")) {
      parts.push("irregular");
    }
  }

  // Estado
  const rawEstado = String(c.estado || (c.activo === false ? "Inactivo" : "Activo"));
  parts.push(rawEstado);

  // Compras
  const comprasCount = Number(c.compras ?? 0);
  parts.push(String(comprasCount), `${comprasCount} compras`, `${comprasCount} compra`);

  // Total consumido
  const rawTotalStr = String(c.totalConsumido || c.totalGastado || "");
  if (rawTotalStr) parts.push(rawTotalStr);
  const totalNum = Number(c.totalConsumidoRaw || c.totalGastadoRaw) || Number(rawTotalStr.replace(/[^\d]/g, "")) || 0;
  if (totalNum > 0) {
    parts.push(String(totalNum), `$${totalNum.toLocaleString("es-CO")}`, totalNum.toLocaleString("es-CO"));
  }

  // Transacciones / Productos comprados previamente en historial
  if (Array.isArray(c.transacciones)) {
    c.transacciones.forEach((t) => {
      if (t.idTrans) parts.push(t.idTrans);
      if (t.producto) parts.push(t.producto);
      if (t.fecha) parts.push(t.fecha);
      if (t.total) parts.push(t.total);
    });
  }

  return normalizeSearchText(parts.join(" "));
}

/**
 * Evalúa si un registro de Venta cumple con los criterios multicriterio.
 */
export function matchVentaMultiCriteria(venta, criteria = {}) {
  const {
    searchTerm = "",
    filterEstado = "Todos",
    filterFecha = "",
    filterFechaInicio = "",
    filterFechaFin = "",
    filterMetodoPago = "Todos",
    filterOrigen = "Todos",
    filterTipoEntrega = "Todos",
    filterFidelidad = "Todos",
    montoMin = "",
    montoMax = ""
  } = criteria;

  // 1. Búsqueda por texto (Tokens múltiples)
  const tokens = tokenizeSearchQuery(searchTerm);
  if (tokens.length > 0) {
    const corpus = buildVentaSearchCorpus(venta);
    // Cada token debe coincidir en algún lugar del corpus del registro
    const allTokensMatch = tokens.every((token) => corpus.includes(token));
    if (!allTokensMatch) return false;
  }

  // 2. Filtro por Estado
  if (filterEstado && filterEstado !== "Todos") {
    const estadoStr = String(venta.estado || "").toLowerCase();
    const estadoEntrega = String(venta.estadoEntrega || "").toLowerCase();
    const target = filterEstado.toLowerCase();

    if (target === "pendiente") {
      if (!estadoStr.includes("pend") && !estadoEntrega.includes("pend")) return false;
    } else if (target === "en preparación" || target === "preparando" || target === "en preparacion") {
      if (!estadoStr.includes("prepar") && !estadoEntrega.includes("prepar")) return false;
    } else if (target === "listo") {
      if (!estadoStr.includes("list") && !estadoEntrega.includes("list")) return false;
    } else if (target === "completada" || target === "entregado") {
      if (!estadoStr.includes("complet") && !estadoStr.includes("entreg") && !estadoEntrega.includes("entreg") && !estadoEntrega.includes("list")) return false;
    } else if (target === "anulada" || target === "cancelada" || target === "cancelado") {
      if (!estadoStr.includes("anul") && !estadoStr.includes("cancel") && !estadoEntrega.includes("cancel")) return false;
    } else {
      if (!estadoStr.includes(target) && !estadoEntrega.includes(target)) return false;
    }
  }

  // 3. Filtro por Fecha específica
  if (filterFecha) {
    const rawF = venta.fecha || venta.fechaVenta;
    if (!rawF) return false;
    try {
      const d = new Date(rawF);
      const vDateStr = isNaN(d.getTime()) ? String(rawF).slice(0, 10) : d.toISOString().split("T")[0];
      if (vDateStr !== filterFecha) return false;
    } catch {
      return false;
    }
  }

  // 4. Filtro por Rango de Fechas (Desde - Hasta)
  if (filterFechaInicio || filterFechaFin) {
    const rawF = venta.fecha || venta.fechaVenta;
    if (!rawF) return false;
    try {
      const d = new Date(rawF);
      if (isNaN(d.getTime())) return false;
      const vTime = d.getTime();

      if (filterFechaInicio) {
        const startD = new Date(filterFechaInicio);
        startD.setHours(0, 0, 0, 0);
        if (vTime < startD.getTime()) return false;
      }
      if (filterFechaFin) {
        const endD = new Date(filterFechaFin);
        endD.setHours(23, 59, 59, 999);
        if (vTime > endD.getTime()) return false;
      }
    } catch {
      return false;
    }
  }

  // 5. Filtro por Método de Pago
  if (filterMetodoPago && filterMetodoPago !== "Todos") {
    const vMetodo = String(venta.metodoPago || venta.metodo_pago || venta.medioPago || "").toLowerCase();
    const targetMetodo = filterMetodoPago.toLowerCase();
    if (!vMetodo.includes(targetMetodo)) return false;
  }

  // 6. Filtro por Origen / Canal
  if (filterOrigen && filterOrigen !== "Todos") {
    const vOrigen = String(
      venta.origen || (String(venta.tipoEntrega || "").toLowerCase().includes("domicilio") ? "ONLINE" : "PUNTO_FISICO")
    ).toUpperCase();

    if (filterOrigen === "ONLINE" && !vOrigen.includes("ONLINE")) return false;
    if (filterOrigen === "PUNTO_FISICO" && !vOrigen.includes("PUNTO") && !vOrigen.includes("FISICO")) return false;
  }

  // 7. Filtro por Tipo de Entrega
  if (filterTipoEntrega && filterTipoEntrega !== "Todos") {
    const vTipo = String(venta.tipoEntrega || "").toLowerCase();
    const targetTipo = filterTipoEntrega.toLowerCase();
    if (!vTipo.includes(targetTipo)) return false;
  }

  // 8. Filtro por Nivel de Fidelidad
  if (filterFidelidad && filterFidelidad !== "Todos") {
    const vFid = String(venta.clienteFidelidad?.tipo || venta.cliente?.tipo || (venta.esVip ? "VIP" : "")).toLowerCase();
    const targetFid = filterFidelidad.toLowerCase();
    if (!vFid.includes(targetFid)) return false;
  }

  // 9. Filtro por Monto Mínimo y Máximo
  const totalNum = Number(venta.total || venta.subtotal || 0);
  if (montoMin !== "" && !isNaN(Number(montoMin))) {
    if (totalNum < Number(montoMin)) return false;
  }
  if (montoMax !== "" && !isNaN(Number(montoMax))) {
    if (totalNum > Number(montoMax)) return false;
  }

  return true;
}

/**
 * Evalúa si un registro de Cliente cumple con los criterios multicriterio.
 */
export function matchClienteMultiCriteria(cliente, criteria = {}) {
  const {
    searchTerm = "",
    filterTipo = "Todos",
    filterEstado = "Todos",
    comprasMin = "",
    montoMin = "",
    montoMax = ""
  } = criteria;

  // 1. Tokens de búsqueda múltiple
  const tokens = tokenizeSearchQuery(searchTerm);
  if (tokens.length > 0) {
    const corpus = buildClienteSearchCorpus(cliente);
    const allTokensMatch = tokens.every((token) => corpus.includes(token));
    if (!allTokensMatch) return false;
  }

  // 2. Filtro por Tipo / Fidelidad
  const clientTipo = cliente.tipo || (cliente.esVip ? "VIP" : "Nuevo");
  if (filterTipo && filterTipo !== "Todos") {
    if (clientTipo.toLowerCase() !== filterTipo.toLowerCase()) return false;
  }

  // 3. Filtro por Estado (Activo / Inactivo)
  if (filterEstado && filterEstado !== "Todos") {
    const estado = String(cliente.estado || (cliente.activo === false ? "Inactivo" : "Activo")).toLowerCase();
    if (estado !== filterEstado.toLowerCase()) return false;
  }

  // 4. Filtro por Compras Mínimas
  if (comprasMin !== "" && !isNaN(Number(comprasMin))) {
    const cCount = Number(cliente.compras ?? 0);
    if (cCount < Number(comprasMin)) return false;
  }

  // 5. Filtro por Total Consumido Mínimo / Máximo
  const rawTotalStr = String(cliente.totalConsumido || cliente.totalGastado || "");
  const totalNum = Number(cliente.totalConsumidoRaw || cliente.totalGastadoRaw) || Number(rawTotalStr.replace(/[^\d]/g, "")) || 0;

  if (montoMin !== "" && !isNaN(Number(montoMin))) {
    if (totalNum < Number(montoMin)) return false;
  }
  if (montoMax !== "" && !isNaN(Number(montoMax))) {
    if (totalNum > Number(montoMax)) return false;
  }

  return true;
}
