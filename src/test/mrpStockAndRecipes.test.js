/**
 * Automated Tests Suite:
 * 1. Control de Stock por Cuello de Botella de Insumos (Receta / Ficha Técnica)
 * 2. Descuento Automático de Insumos al Realizar Ventas
 * 3. Descuento con Múltiples Productos y Adiciones
 * 4. Bloqueo de Venta cuando los Insumos no son suficientes
 * 5. Reintegro de Insumos al Anular / Cancelar una Venta
 */

function calculateProductStock(ficha, insumosMap) {
  if (!ficha || !Array.isArray(ficha.detalles) || ficha.detalles.length === 0) {
    return { stockDisponible: 50, hasFicha: false };
  }

  let minPortions = Infinity;
  for (const d of ficha.detalles) {
    const cantRequerida = Number(d.cantidad || 0);
    const insumoStock = Number(insumosMap[d.idInsumo]?.stock !== undefined ? insumosMap[d.idInsumo].stock : (d.insumo?.stock || 0));

    if (cantRequerida > 0) {
      const portionsFromThisInsumo = Math.floor(insumoStock / cantRequerida);
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
        const required = Number(det.cantidad || 0) * Number(item.cantidad || 1);
        const currentStock = Number(insumosMap[det.idInsumo]?.stock || 0);
        if (currentStock < required) {
          return {
            success: false,
            error: `Insumo insuficiente: ${insumosMap[det.idInsumo]?.nombre || det.idInsumo}. Requerido: ${required}, disponible: ${currentStock}`
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
        const required = Number(det.cantidad || 0) * Number(item.cantidad || 1);
        if (insumosMap[det.idInsumo]) {
          insumosMap[det.idInsumo].stock = Math.max(0, Number(insumosMap[det.idInsumo].stock) - required);
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
        const toRestore = Number(det.cantidad || 0) * Number(item.cantidad || 1);
        if (insumosMap[det.idInsumo]) {
          insumosMap[det.idInsumo].stock = Number(insumosMap[det.idInsumo].stock) + toRestore;
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

console.log("=== INICIANDO PRUEBAS AUTOMATIZADAS DE MRP, RECETAS Y DESCUENTO DE STOCK ===");

// TEST 1: Cuello de Botella con 1 Insumo Limitante
const insumosDB = {
  1: { idInsumo: 1, nombre: "Pan Hamburguesa", stock: 20, unidadMedida: "und" },
  2: { idInsumo: 2, nombre: "Carne Res 150g", stock: 8, unidadMedida: "und" },
  3: { idInsumo: 3, nombre: "Queso Cheddar", stock: 50, unidadMedida: "loncha" }
};

const fichaHamburguesa = {
  idProducto: 101,
  detalles: [
    { idInsumo: 1, cantidad: 1 }, // 20 panes -> 20 hams
    { idInsumo: 2, cantidad: 1 }, // 8 carnes -> 8 hams (LIMITANTE)
    { idInsumo: 3, cantidad: 2 }  // 50 quesos / 2 = 25 hams
  ]
};

const stockCalculado1 = calculateProductStock(fichaHamburguesa, insumosDB);
assert(stockCalculado1.stockDisponible === 8, "El stock de Hamburguesa debe ser 8 (limitado por 8 carnes disponibles)");

// TEST 2: Cuello de botella con decimales (ej. kg de papas o queso)
const insumosPapas = {
  4: { idInsumo: 4, nombre: "Papas Congeladas", stock: 1.5, unidadMedida: "kg" }, // 1.5 kg
  5: { idInsumo: 5, nombre: "Caja Papas", stock: 100, unidadMedida: "und" }
};
const fichaPapas = {
  idProducto: 102,
  detalles: [
    { idInsumo: 4, cantidad: 0.2 }, // 0.2 kg por porción -> 1.5 / 0.2 = 7.5 -> 7 porciones
    { idInsumo: 5, cantidad: 1 }
  ]
};
const stockCalculado2 = calculateProductStock(fichaPapas, insumosPapas);
assert(stockCalculado2.stockDisponible === 7, "El stock de Papas debe ser 7 (1.5 kg / 0.2 kg = 7 porciones)");

// TEST 3: Descuento Automático de Insumos al Vender 3 Hamburguesas
const resVenta1 = processSaleInsumoDeduction(
  [{ idProducto: 101, cantidad: 3 }],
  { 101: fichaHamburguesa },
  insumosDB
);
assert(resVenta1.success === true, "La venta de 3 hamburguesas debe procesarse exitosamente");
assert(insumosDB[1].stock === 17, "El stock de Panes debe bajar de 20 a 17 (20 - 3)");
assert(insumosDB[2].stock === 5, "El stock de Carnes debe bajar de 8 a 5 (8 - 3)");
assert(insumosDB[3].stock === 44, "El stock de Queso debe bajar de 50 a 44 (50 - 3*2)");

// Recalcular stock de hamburguesa después de la venta
const stockCalculado3 = calculateProductStock(fichaHamburguesa, insumosDB);
assert(stockCalculado3.stockDisponible === 5, "El nuevo stock disponible de Hamburguesa debe ser 5");

// TEST 4: Bloqueo de Venta si se pide más del stock disponible
const resVentaExcesiva = processSaleInsumoDeduction(
  [{ idProducto: 101, cantidad: 10 }], // Solo quedan 5 carnes
  { 101: fichaHamburguesa },
  insumosDB
);
assert(resVentaExcesiva.success === false, "La venta de 10 hamburguesas debe ser rechazada por falta de carne");
assert(insumosDB[2].stock === 5, "El stock de carne debe permanecer intacto en 5 tras el rechazo");

// TEST 5: Venta Mixta con Múltiples Productos
const fichasDB = { 101: fichaHamburguesa, 102: fichaPapas };
const todosInsumos = { ...insumosDB, ...insumosPapas };

const resVentaMixta = processSaleInsumoDeduction(
  [
    { idProducto: 101, cantidad: 2 },
    { idProducto: 102, cantidad: 4 }
  ],
  fichasDB,
  todosInsumos
);
assert(resVentaMixta.success === true, "La venta mixta (2 burgers + 4 papas) debe ser exitosa");
assert(todosInsumos[2].stock === 3, "El stock de carnes debe quedar en 3 (5 - 2)");
assert(todosInsumos[4].stock === 0.7, "El stock de papas debe quedar en 0.7 kg (1.5 - 4*0.2 = 0.7)");

// TEST 6: Reintegro de Insumos al Cancelar la Venta Mixta
processCancelSaleRestock(
  [
    { idProducto: 101, cantidad: 2 },
    { idProducto: 102, cantidad: 4 }
  ],
  fichasDB,
  todosInsumos
);
assert(todosInsumos[2].stock === 5, "Las 2 carnes deben reintegrarse a 5 tras cancelar la orden");
assert(todosInsumos[4].stock === 1.5, "Las papas deben reintegrarse a 1.5 kg tras cancelar la orden");

console.log("\n========================================================");
console.log(`RESULTADOS: ${passed} pruebas pasadas, ${failed} fallidas.`);
console.log("========================================================");

if (failed > 0) {
  process.exit(1);
}
