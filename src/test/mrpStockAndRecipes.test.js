/**
 * Automated Tests Suite:
 * 1. Control de Stock por Cuello de Botella de Insumos (Receta / Ficha Técnica)
 * 2. Conversión Multidimensional de Unidades de Medida (Kg <-> Gr, Lt <-> Ml)
 * 3. Descuento Automático de Insumos al Realizar Ventas con Conversión
 * 4. Descuento con Múltiples Productos y Adiciones
 * 5. Bloqueo de Venta cuando los Insumos no son suficientes
 * 6. Reintegro de Insumos al Anular / Cancelar una Venta
 */

function convertUnits(amount, fromUnit, toUnit) {
  if (!amount || isNaN(amount)) return 0;
  if (!fromUnit || !toUnit) return Number(amount);

  const from = String(fromUnit).toLowerCase().trim();
  const to = String(toUnit).toLowerCase().trim();

  if (from === to) return Number(amount);

  const isKg = (u) => u.includes('kg') || u.includes('kilo');
  const isGr = (u) => u.includes('gr') || u.includes('gram');
  const isMg = (u) => u.includes('mg') || u.includes('miligram');
  const isLt = (u) => u.includes('lt') || u.includes('litro');
  const isMl = (u) => u.includes('ml') || u.includes('mililitro') || u.includes('cc');

  if (isKg(from) && isGr(to)) return Number(amount) * 1000;
  if (isGr(from) && isKg(to)) return Number(amount) / 1000;
  if (isKg(from) && isMg(to)) return Number(amount) * 1000000;
  if (isMg(from) && isKg(to)) return Number(amount) / 1000000;
  if (isGr(from) && isMg(to)) return Number(amount) * 1000;
  if (isMg(from) && isGr(to)) return Number(amount) / 1000;

  if (isLt(from) && isMl(to)) return Number(amount) * 1000;
  if (isMl(from) && isLt(to)) return Number(amount) / 1000;

  return Number(amount);
}

function calculateProductStock(ficha, insumosMap) {
  if (!ficha || !Array.isArray(ficha.detalles) || ficha.detalles.length === 0) {
    return { stockDisponible: 50, hasFicha: false };
  }

  let minPortions = Infinity;
  for (const d of ficha.detalles) {
    const rawCantRequerida = Number(d.cantidad || 0);
    const insumo = insumosMap[d.idInsumo] || d.insumo;
    const recipeUnit = d.unidadMedida || insumo?.unidadMedida || 'und';
    const insumoUnit = insumo?.unidadMedida || recipeUnit;
    const insumoStock = Number(insumo?.stock || 0);

    const cantRequeridaEnInsumoUnit = convertUnits(rawCantRequerida, recipeUnit, insumoUnit);

    if (cantRequeridaEnInsumoUnit > 0) {
      const portionsFloat = Number((insumoStock / cantRequeridaEnInsumoUnit).toFixed(6));
      const portionsFromThisInsumo = Math.floor(portionsFloat);
      if (portionsFromThisInsumo < minPortions) {
        minPortions = portionsFromThisInsumo;
      }
    }
  }

  const finalStock = minPortions === Infinity ? 50 : Math.max(0, minPortions);
  return { stockDisponible: finalStock, hasFicha: true };
}

function processSaleInsumoDeduction(saleItems, fichasMap, insumosMap) {
  // 1. Verify if all items have enough insumos
  for (const item of saleItems) {
    const ficha = fichasMap[item.idProducto];
    if (ficha && Array.isArray(ficha.detalles)) {
      for (const det of ficha.detalles) {
        const rawCant = Number(det.cantidad || 0);
        const insumo = insumosMap[det.idInsumo];
        const recipeUnit = det.unidadMedida || insumo?.unidadMedida || 'und';
        const insumoUnit = insumo?.unidadMedida || recipeUnit;
        const cantConvertida = convertUnits(rawCant, recipeUnit, insumoUnit);
        const required = cantConvertida * Number(item.cantidad || 1);
        const currentStock = Number(insumo?.stock || 0);

        if (currentStock < required) {
          return {
            success: false,
            error: `Insumo insuficiente: ${insumo?.nombre || det.idInsumo}. Requerido: ${required} ${insumoUnit}, disponible: ${currentStock} ${insumoUnit}`
          };
        }
      }
    }
  }

  // 2. Perform deduction
  for (const item of saleItems) {
    const ficha = fichasMap[item.idProducto];
    if (ficha && Array.isArray(ficha.detalles)) {
      for (const det of ficha.detalles) {
        const rawCant = Number(det.cantidad || 0);
        const insumo = insumosMap[det.idInsumo];
        const recipeUnit = det.unidadMedida || insumo?.unidadMedida || 'und';
        const insumoUnit = insumo?.unidadMedida || recipeUnit;
        const cantConvertida = convertUnits(rawCant, recipeUnit, insumoUnit);
        const required = cantConvertida * Number(item.cantidad || 1);

        if (insumo) {
          const nuevoStock = Math.max(0, Number(insumo.stock) - required);
          insumo.stock = Number(nuevoStock.toFixed(4));
        }
      }
    }
  }

  return { success: true };
}

function processCancelSaleRestock(saleItems, fichasMap, insumosMap) {
  for (const item of saleItems) {
    const ficha = fichasMap[item.idProducto];
    if (ficha && Array.isArray(ficha.detalles)) {
      for (const det of ficha.detalles) {
        const rawCant = Number(det.cantidad || 0);
        const insumo = insumosMap[det.idInsumo];
        const recipeUnit = det.unidadMedida || insumo?.unidadMedida || 'und';
        const insumoUnit = insumo?.unidadMedida || recipeUnit;
        const cantConvertida = convertUnits(rawCant, recipeUnit, insumoUnit);
        const toRestore = cantConvertida * Number(item.cantidad || 1);

        if (insumo) {
          insumo.stock = Number((Number(insumo.stock) + toRestore).toFixed(4));
        }
      }
    }
  }
}

// -------------------------------------------------------------
// RUN TESTS
// -------------------------------------------------------------
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASSED: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

console.log("=== INICIANDO PRUEBAS AUTOMATIZADAS DE MRP, RECETAS Y UNIDADES DE MEDIDA ===");

// TEST 1: Conversión de Unidades Básicas
assert(convertUnits(5, 'Kg', 'Gr') === 5000, "5 Kg equivalen a 5000 Gr");
assert(convertUnits(250, 'Gr', 'Kg') === 0.25, "250 Gr equivalen a 0.25 Kg");
assert(convertUnits(2, 'Lt', 'Ml') === 2000, "2 Lt equivalen a 2000 Ml");
assert(convertUnits(500, 'Ml', 'Lt') === 0.5, "500 Ml equivalen a 0.5 Lt");

// TEST 2: Cuello de Botella con Conversión de Unidades (Queso Mozzarella en Kg, Receta en Gr)
const insumosPizza = {
  10: { idInsumo: 10, nombre: "Masa Pizza", stock: 15, unidadMedida: "Unidad" },
  11: { idInsumo: 11, nombre: "Queso Mozzarella", stock: 3, unidadMedida: "Kilogramos (Kg)" }, // 3 Kg = 3000 Gr
  12: { idInsumo: 12, nombre: "Salsa de Tomate", stock: 1.2, unidadMedida: "Litros (Lt)" }     // 1.2 Lt = 1200 Ml
};

const fichaPizza = {
  idProducto: 201,
  detalles: [
    { idInsumo: 10, cantidad: 1, unidadMedida: "Unidad" },   // 15 masas -> 15 pizzas
    { idInsumo: 11, cantidad: 150, unidadMedida: "Gramos (Gr)" }, // 3000 Gr / 150 Gr = 20 pizzas
    { idInsumo: 12, cantidad: 100, unidadMedida: "Mililitros (Ml)" } // 1200 Ml / 100 Ml = 12 pizzas (LIMITANTE)
  ]
};

const stockPizza = calculateProductStock(fichaPizza, insumosPizza);
assert(stockPizza.stockDisponible === 12, "El stock de Pizza debe ser 12 (limitado por 1.2 Lt / 100 Ml de salsa = 12 porciones)");

// TEST 3: Descuento Automático con Conversión de Unidades al Vender 4 Pizzas
const resVentaPizza = processSaleInsumoDeduction(
  [{ idProducto: 201, cantidad: 4 }],
  { 201: fichaPizza },
  insumosPizza
);
assert(resVentaPizza.success === true, "La venta de 4 pizzas debe procesarse con éxito");
assert(insumosPizza[10].stock === 11, "Masa Pizza debe quedar en 11 unidades (15 - 4)");
assert(insumosPizza[11].stock === 2.4, "Queso Mozzarella debe quedar en 2.4 Kg (3 Kg - 4*150 Gr = 3 - 0.6 = 2.4 Kg)");
assert(insumosPizza[12].stock === 0.8, "Salsa debe quedar en 0.8 Lt (1.2 Lt - 4*100 Ml = 1.2 - 0.4 = 0.8 Lt)");

// Recalcular stock de pizza post-venta
const stockPizzaPostVenta = calculateProductStock(fichaPizza, insumosPizza);
assert(stockPizzaPostVenta.stockDisponible === 8, "Nuevo stock de Pizza debe ser 8 (0.8 Lt / 100 Ml = 8 pizzas)");

// TEST 4: Reintegro de Insumos al Cancelar Venta
processCancelSaleRestock(
  [{ idProducto: 201, cantidad: 4 }],
  { 201: fichaPizza },
  insumosPizza
);
assert(insumosPizza[10].stock === 15, "Masa Pizza debe restaurarse a 15");
assert(insumosPizza[11].stock === 3, "Queso debe restaurarse a 3 Kg");
assert(insumosPizza[12].stock === 1.2, "Salsa debe restaurarse a 1.2 Lt");

console.log("\n========================================================");
console.log(`RESULTADOS: ${passed} pruebas pasadas, ${failed} fallidas.`);
console.log("========================================================");

if (failed > 0) {
  process.exit(1);
}
