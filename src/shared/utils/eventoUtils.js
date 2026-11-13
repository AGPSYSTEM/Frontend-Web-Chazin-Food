/**
 * Helpers puros para normalizar y formatear tipos y toppings de eventos.
 */

export const formatTipoEvento = (tipo) => {
  if (!tipo) return "Evento Activo";
  const str = String(tipo).trim();
  const lower = str.toLowerCase();
  if (lower.includes("insumo") || lower.includes("topping")) {
    return "Topping Extra";
  }
  if (lower === "edicion_limitada") return "Edición Limitada";
  if (lower === "combo_especial") return "Combo Especial";
  if (lower === "promocion_2x1") return "Promoción 2x1";
  if (lower === "descuento_general" || lower === "descuento") return "Descuento";
  return str;
};

/**
 * Extrae y normaliza los toppings/insumos de cortesía asociados a un evento.
 * Tolera JSON strings, arrays y objetos individuales.
 */
export const parseEventoInsumos = (evtOrRaw) => {
  if (!evtOrRaw) return [];
  const raw = (typeof evtOrRaw === "object" && !Array.isArray(evtOrRaw) && ("insumosAsociados" in evtOrRaw || "insumos" in evtOrRaw))
    ? (evtOrRaw.insumosAsociados ?? evtOrRaw.insumos)
    : evtOrRaw;

  if (!raw) return [];

  let list = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) list = parsed;
      else if (parsed && typeof parsed === "object") list = [parsed];
    } catch {
      return [];
    }
  } else if (typeof raw === "object") {
    list = [raw];
  }

  return list
    .filter((item) => item && typeof item === "object" && (item.nombre || item.idInsumo || item.id))
    .map((item) => {
      const idVal = item.idInsumo ?? item.id ?? null;
      const unidadVal = String(item.unidadMedida || item.unidad || "und").trim() || "und";
      const cantNum = Number(item.cantidad);
      const cantidad = Number.isFinite(cantNum) && cantNum > 0 ? cantNum : 1;
      return {
        id: idVal,
        idInsumo: idVal,
        nombre: String(item.nombre || "Topping extra").trim(),
        cantidad,
        unidad: unidadVal,
        unidadMedida: unidadVal
      };
    });
};

export const formatEventoToppingItem = (item, includeQuantity = true) => {
  if (!item) return "";
  const nombre = String(item.nombre || "Topping extra").trim();
  if (!includeQuantity) return nombre;
  const qty = Number(item.cantidad) > 0 ? Number(item.cantidad) : 1;
  const unit = String(item.unidadMedida || item.unidad || "und").trim() || "und";
  return `${nombre} (${qty} ${unit})`;
};

export const formatEventoToppingsText = (evtOrInsumos, includeQuantity = true) => {
  const list = parseEventoInsumos(evtOrInsumos);
  if (list.length === 0) return "";
  return list.map((item) => formatEventoToppingItem(item, includeQuantity)).join(" + ");
};

export const isToppingEvento = (evt) => {
  if (!evt) return false;
  const tipoLow = String(evt.tipoEvento || evt.tipo || "").toLowerCase();
  return (
    tipoLow.includes("insumo") ||
    tipoLow.includes("topping") ||
    parseEventoInsumos(evt).length > 0
  );
};

