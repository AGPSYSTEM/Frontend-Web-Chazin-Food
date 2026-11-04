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

  const uReceta = String(unidadRecetaRaw || "").toLowerCase().trim();
  const uBase = String(unidadBaseRaw || "").toLowerCase().trim();

  // Si las unidades coinciden exactamente
  if (uReceta === uBase && uReceta !== "") {
    return cantidad * costoUnitario;
  }

  // Gramos a Kilos
  if (
    (uReceta === "gr" || uReceta === "g" || uReceta === "gramos" || uReceta === "gramo") &&
    (uBase === "kg" || uBase === "kilo" || uBase === "kilogramo" || !uBase || uBase === "und")
  ) {
    return (cantidad / 1000) * costoUnitario;
  }

  // Kilos a Gramos
  if (
    (uReceta === "kg" || uReceta === "kilo") &&
    (uBase === "gr" || uBase === "g" || uBase === "gramos")
  ) {
    return cantidad * 1000 * costoUnitario;
  }

  // Mililitros a Litros
  if (
    (uReceta === "ml" || uReceta === "mililitros" || uReceta === "cc") &&
    (uBase === "lt" || uBase === "l" || uBase === "litro" || !uBase || uBase === "und")
  ) {
    return (cantidad / 1000) * costoUnitario;
  }

  // Litros a Mililitros
  if (
    (uReceta === "lt" || uReceta === "l" || uReceta === "litro") &&
    (uBase === "ml" || uBase === "cc")
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
    const unidadReceta = item.unidadMedida || item.unidad || "und";
    const unidadBase = item.insumo?.unidadMedida || item.unidadMedidaBase || "";
    
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

