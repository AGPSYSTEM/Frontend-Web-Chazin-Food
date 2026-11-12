/**
 * Utilidades para cálculo de costos gastronómicos y escalado de fichas técnicas
 * Chazin Food 2.0
 */

/**
 * Extrae el número de porciones o rendimiento de un texto o número
 * Ejemplos: "1 porción" -> 1, "4 porciones" -> 4, "12" -> 12, 1 -> 1
 */
export function parsePorciones(rendimiento) {
  if (rendimiento === undefined || rendimiento === null || rendimiento === "") return 1;
  if (typeof rendimiento === "number") return rendimiento > 0 ? rendimiento : 1;
  
  const str = String(rendimiento).trim();
  const match = str.match(/(\d+([.,]\d+)?)/);
  if (match) {
    const parsed = parseFloat(match[1].replace(',', '.'));
    return parsed > 0 ? parsed : 1;
  }
  return 1;
}

/**
 * Normaliza cualquier variante de texto de unidad de medida a los estándares limpios:
 * 'gr', 'kg', 'ml', 'lt', 'und', 'paq', 'porción'
 */
export function normalizeUnidadMedida(raw) {
  if (!raw) return "und";
  const s = String(raw).toLowerCase().trim();
  
  // Peso / Masa
  if (s === "kg" || s.startsWith("kilo") || s.includes("(kg)") || s === "kgs") return "kg";
  if (s === "gr" || s === "g" || s.startsWith("gram") || s.includes("(gr)") || s === "grs") return "gr";
  if (s === "mg" || s.startsWith("miligram")) return "mg";
  
  // Volumen / Líquidos
  if (s === "lt" || s === "l" || s.startsWith("litr") || s.includes("(lt)") || s === "lts") return "lt";
  if (s === "ml" || s.startsWith("mililit") || s === "cc" || s.includes("(ml)") || s === "mls") return "ml";
  
  // Conteo / Presentación
  if (s === "und" || s === "ud" || s.startsWith("unidad") || s.includes("(ud)") || s === "uds") return "und";
  if (s === "paq" || s.startsWith("paquet")) return "paq";
  if (s === "porcion" || s === "porción" || s.startsWith("porci")) return "porción";
  
  return s || "und";
}

/**
 * Resuelve la unidad de medida y cantidad lógica gastronómica al agregar un insumo a una receta.
 * Evita que insumos comprados por Kg (ej. tocineta a $35.000/kg) se agreguen como 1 Kg por plato.
 */
export function resolveRecetaUnidadYCantidad(insumoItem, rendimiento = 1) {
  if (!insumoItem) return { cantidad: 1, unidadMedida: "und" };

  const nombre = String(insumoItem.nombre || insumoItem.nombreInsumo || "").toLowerCase();
  const uBase = normalizeUnidadMedida(insumoItem.unidadMedida || insumoItem.unidad);

  // 1. Extraer gramaje explícito si está en el nombre (ej: "Carne 150g", "Papas (150g)", "40g", etc.)
  const matchGram = nombre.match(/(?:^|\s|\()(\d+(?:[.,]\d+)?)\s*(?:g|gr|gramos)(?:\s|\)|\b|$)/i);
  if (matchGram) {
    const num = parseFloat(matchGram[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      return { cantidad: num, unidadMedida: "gr" };
    }
  }

  // 2. Extraer volumen explícito si está en el nombre (ej: "400ml", "50ml", etc.)
  const matchMl = nombre.match(/(?:^|\s|\()(\d+(?:[.,]\d+)?)\s*(?:ml|cc|mililitros)(?:\s|\)|\b|$)/i);
  if (matchMl) {
    const num = parseFloat(matchMl[1].replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      return { cantidad: num, unidadMedida: "ml" };
    }
  }

  // 3. Si la unidad base de inventario es de peso (kg, gr)
  if (uBase === "kg" || uBase === "gr") {
    // Para recetas gastronómicas individuales, la unidad de consumo estándar es gramos (gr)
    let cantPorcion = 30; // default para toppings/verduras/embutidos
    if (nombre.includes("carne") || nombre.includes("pechuga") || nombre.includes("pollo") || nombre.includes("angus") || nombre.includes("res")) {
      cantPorcion = 150; // porción estándar de proteína
    } else if (nombre.includes("papa") || nombre.includes("francesa") || nombre.includes("cascos") || nombre.includes("espiral")) {
      cantPorcion = 150; // porción estándar de acompañamiento
    } else if (nombre.includes("tocineta") || nombre.includes("bacon")) {
      cantPorcion = 30; // porción estándar de tocineta en hamburguesa/perro
    } else if (nombre.includes("cebolla") || nombre.includes("tomate") || nombre.includes("lechuga")) {
      cantPorcion = 30; // porción estándar de verdura
    } else if (nombre.includes("queso") && (uBase === "kg" || uBase === "gr")) {
      cantPorcion = 30; // porción estándar de queso rallado/fundido
    } else if (nombre.includes("salsa") || nombre.includes("aderezo") || nombre.includes("chili")) {
      cantPorcion = 30;
    }
    return { cantidad: cantPorcion, unidadMedida: "gr" };
  }

  // 4. Si la unidad base de inventario es de volumen (lt, ml)
  if (uBase === "lt" || uBase === "ml") {
    return { cantidad: 30, unidadMedida: "ml" };
  }

  // 5. Unidades, paquetes o porciones
  if (uBase === "porción") {
    return { cantidad: 1, unidadMedida: "porción" };
  }
  if (uBase === "paq") {
    return { cantidad: 1, unidadMedida: "paq" };
  }

  return { cantidad: 1, unidadMedida: "und" };
}

/**
 * Convierte inteligentemente la cantidad cuando el usuario cambia la unidad en el dropdown.
 */
export function convertirUnidadYCantidad(cantidadActual, unidadViejaRaw, unidadNuevaRaw) {
  const cant = Number(cantidadActual) || 0;
  const uVieja = normalizeUnidadMedida(unidadViejaRaw);
  const uNueva = normalizeUnidadMedida(unidadNuevaRaw);

  if (uVieja === uNueva) return cant;

  // De kg a gr
  if (uVieja === "kg" && uNueva === "gr") {
    if (cant <= 0.001) return 30;
    if (cant === 1) return 30; // Si tenía 1 (anomalía de 1kg en plato), pasar a 30g
    return Math.round(cant * 1000);
  }

  // De gr a kg
  if (uVieja === "gr" && uNueva === "kg") {
    return Math.round((cant / 1000) * 1000) / 1000;
  }

  // De lt a ml
  if (uVieja === "lt" && uNueva === "ml") {
    if (cant <= 0.001) return 30;
    if (cant === 1) return 30; // Si tenía 1 lt en un plato, pasar a 30 ml
    return Math.round(cant * 1000);
  }

  // De ml a lt
  if (uVieja === "ml" && uNueva === "lt") {
    return Math.round((cant / 1000) * 1000) / 1000;
  }

  return cant > 0 ? cant : 1;
}

/**
 * Normaliza y sanea insumos existentes al cargar una ficha técnica para corregir
 * recetas antiguas donde se asignó erróneamente 1 kg o 1 lt a un plato individual.
 */
export function sanitizeRecetaInsumos(insumos = [], dbList = [], rendimiento = 1) {
  if (!Array.isArray(insumos)) return [];
  const porciones = parsePorciones(rendimiento);
  const esPlatoIndividual = porciones <= 2;

  return insumos.map(item => {
    const id = item.idInsumo || item.id;
    const matchDb = (Array.isArray(dbList) && dbList.find(d => String(d.id || d.idInsumo) === String(id))) || item.insumo || null;
    let uReceta = normalizeUnidadMedida(item.unidadMedida || item.unidad || matchDb?.unidadMedida || "und");
    let cant = Number(item.cantidad || 0);
    const uBase = normalizeUnidadMedida(matchDb?.unidadMedida || item.insumo?.unidadMedida || uReceta);

    // Detección y corrección de anomalía: 1 kg o 1 lt en receta de plato individual
    if (esPlatoIndividual && cant <= 1) {
      if ((uReceta === "kg" || (uReceta === "und" && uBase === "kg"))) {
        const resolved = resolveRecetaUnidadYCantidad(matchDb || item, rendimiento);
        uReceta = resolved.unidadMedida;
        cant = resolved.cantidad;
      } else if ((uReceta === "lt" || (uReceta === "und" && uBase === "lt"))) {
        const resolved = resolveRecetaUnidadYCantidad(matchDb || item, rendimiento);
        uReceta = resolved.unidadMedida;
        cant = resolved.cantidad;
      }
    }

    const unitCost = Number(item.costoUnitario || item.precioUnitario || matchDb?.precioUnitario || matchDb?.costo || 0);

    return {
      ...item,
      idInsumo: id,
      nombreInsumo: item.nombreInsumo || item.insumo?.nombre || matchDb?.nombre || `Insumo #${id}`,
      cantidad: cant > 0 ? cant : 1,
      unidadMedida: uReceta,
      costoUnitario: unitCost,
      insumo: matchDb || item.insumo || null
    };
  });
}

/**
 * Calcula el costo real de un insumo en la receta convirtiendo unidades estándar:
 * - Gramos (gr, g) a Kilos (kg): divide entre 1000
 * - Mililitros (ml, cc) a Litros (lt, l): divide entre 1000
 * - Miligramos (mg) a Kilos (kg): divide entre 1,000,000
 * - Unidades (und, pieza, paq): multiplicación directa 1:1
 */
export function calculateInsumoCost(cantidadRaw, unidadRecetaRaw, costoUnitarioRaw, unidadBaseRaw) {
  const cantidad = Number(cantidadRaw) || 0;
  const costoUnitario = Number(costoUnitarioRaw) || 0;
  if (cantidad <= 0 || costoUnitario <= 0) return 0;

  const uReceta = normalizeUnidadMedida(unidadRecetaRaw);
  const uBase = normalizeUnidadMedida(unidadBaseRaw || uReceta);

  // Si las unidades coinciden exactamente
  if (uReceta === uBase && uReceta !== "") {
    // Si la unidad es kg o lt y el costo es alto (por kg) pero la cantidad es un valor normal de kg
    return cantidad * costoUnitario;
  }

  // Gramos a Kilos
  if (
    (uReceta === "gr" || uReceta === "g" || uReceta === "mg") &&
    (uBase === "kg" || !uBase || uBase === "und")
  ) {
    return (cantidad / 1000) * costoUnitario;
  }

  // Kilos a Gramos
  if (
    uReceta === "kg" &&
    (uBase === "gr" || uBase === "g")
  ) {
    return cantidad * 1000 * costoUnitario;
  }

  // Mililitros a Litros
  if (
    (uReceta === "ml" || uReceta === "cc") &&
    (uBase === "lt" || !uBase || uBase === "und")
  ) {
    return (cantidad / 1000) * costoUnitario;
  }

  // Litros a Mililitros
  if (
    uReceta === "lt" &&
    uBase === "ml"
  ) {
    return cantidad * 1000 * costoUnitario;
  }

  // Heurística de protección para precios gastronómicos en pesos colombianos:
  // Si la cantidad está en 'gr' o 'ml' y el costo unitario es mayor a 500 (precio típico por kilo/litro),
  // se divide entre 1000 para evitar sobrecostos exorbitantes.
  if ((uReceta === "gr" || uReceta === "g" || uReceta === "ml") && costoUnitario >= 500) {
    return (cantidad / 1000) * costoUnitario;
  }

  return cantidad * costoUnitario;
}

/**
 * Calcula los totales de costo de una lista de insumos de ficha técnica
 */
export function calculateRecipeTotals(insumos = [], rendimiento = 1) {
  if (!Array.isArray(insumos) || insumos.length === 0) {
    return {
      costoTotalBatch: 0,
      porciones: 1,
      costoPorPorcion: 0,
      precioSugerido: 0
    };
  }

  const costoTotalBatch = insumos.reduce((acc, item) => {
    const cant = Number(item.cantidad || 0);
    const unitCost = Number(
      item.costoUnitario || item.precioUnitario || item.insumo?.precioUnitario || item.insumo?.costo || 0
    );
    const unidadReceta = normalizeUnidadMedida(item.unidadMedida || item.unidad || "und");
    const unidadBase = normalizeUnidadMedida(item.insumo?.unidadMedida || item.unidadMedidaBase || unidadReceta);
    
    return acc + calculateInsumoCost(cant, unidadReceta, unitCost, unidadBase);
  }, 0);

  const porciones = parsePorciones(rendimiento);
  const costoPorPorcion = porciones > 0 ? costoTotalBatch / porciones : costoTotalBatch;
  
  // Margen de ganancia gastronómico estándar (Food Cost ~38-40% -> factor 2.5) redondeado a $500 COP
  const precioSugerido = costoPorPorcion > 0 ? Math.round((costoPorPorcion * 2.5) / 500) * 500 : 0;

  return {
    costoTotalBatch: Math.round(costoTotalBatch),
    porciones,
    costoPorPorcion: Math.round(costoPorPorcion),
    precioSugerido
  };
}
