/**
 * Utilidades para parsear y limpiar notas y observaciones de pedidos y comandas.
 * Permite manejar tanto notas simples como payloads JSON serializados desde el checkout.
 */

export function extractCleanSpecifications(raw) {
  if (!raw) return "";
  if (typeof raw === "object") {
    if (raw.especificaciones !== undefined && raw.especificaciones !== raw) {
      const res = extractCleanSpecifications(raw.especificaciones);
      if (res) return res;
    }
    if (raw.nota !== undefined && raw.nota !== raw) {
      const res = extractCleanSpecifications(raw.nota);
      if (res) return res;
    }
    if (raw.observacion !== undefined && raw.observacion !== raw) {
      const res = extractCleanSpecifications(raw.observacion);
      if (res) return res;
    }
    if (raw.instrucciones !== undefined && raw.instrucciones !== raw) {
      const res = extractCleanSpecifications(raw.instrucciones);
      if (res) return res;
    }
    return "";
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      trimmed.includes('"tipoEntrega"') ||
      trimmed.includes('"especificaciones"') ||
      trimmed.includes('"codigoPedido"')
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        return extractCleanSpecifications(parsed);
      } catch (e) {
        return "";
      }
    }
    const lower = trimmed.toLowerCase();
    if ([
      "sin observaciones",
      "ninguna",
      "ninguno",
      "n/a",
      "null",
      "undefined",
      ""
    ].includes(lower)) {
      return "";
    }
    return trimmed;
  }
  return "";
}

export function parseKitchenOrderNotes(rawObservaciones) {
  if (!rawObservaciones) {
    return {
      hasNotes: false,
      notaCliente: "",
      direccion: "",
      tipoEntrega: "",
      productosObs: []
    };
  }

  let data = null;

  if (typeof rawObservaciones === "object" && rawObservaciones !== null) {
    data = rawObservaciones;
  } else if (typeof rawObservaciones === "string") {
    const trimmed = rawObservaciones.trim();
    if (
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed.includes('"tipoEntrega"') ||
      trimmed.includes('"especificaciones"') ||
      trimmed.includes('"codigoPedido"')
    ) {
      try {
        data = JSON.parse(trimmed);
      } catch (e) {
        data = null;
      }
    }
  }

  // Si no era JSON, es una nota de texto simple
  if (!data || typeof data !== "object") {
    const texto = String(rawObservaciones).trim();
    const isGenericPlaceholder = [
      "sin observaciones",
      "ninguna",
      "ninguno",
      "n/a",
      "null",
      "undefined",
      ""
    ].includes(texto.toLowerCase());

    return {
      hasNotes: !isGenericPlaceholder && texto.length > 0,
      notaCliente: isGenericPlaceholder ? "" : texto,
      direccion: "",
      tipoEntrega: "",
      productosObs: []
    };
  }

  // Si era JSON:
  // 1. Extraer la nota real de preparación / especificaciones del cliente
  const cleanNota = extractCleanSpecifications(data);

  // 2. Extraer dirección
  const direccion = (
    data.direccion && data.direccion !== "Recoger en Local" && data.direccion !== "En Local"
      ? String(data.direccion).trim()
      : ""
  );

  // 3. Extraer tipo de entrega
  const tipoEntrega = String(data.tipoEntrega || "").trim();

  // 4. Extraer notas de cada producto individual
  const productosObs = Array.isArray(data.productos)
    ? data.productos
        .map((p) => ({
          id: p.id || p.idProducto || p.idVariante,
          nombre: p.nombre || "",
          obs: String(p.observaciones || p.observacion || p.especificaciones || p.nota || "").trim()
        }))
        .filter((p) => Boolean(p.obs) && ![
          "sin observaciones",
          "ninguna",
          "n/a",
          "null",
          ""
        ].includes(p.obs.toLowerCase()))
    : [];

  const hasNotes = Boolean(cleanNota || direccion || productosObs.length > 0);

  return {
    hasNotes,
    notaCliente: cleanNota,
    direccion,
    tipoEntrega,
    productosObs
  };
}
