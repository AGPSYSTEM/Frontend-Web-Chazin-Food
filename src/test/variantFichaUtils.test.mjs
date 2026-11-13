import assert from "node:assert/strict";
import test from "node:test";
import {
  detectVariantSizeInfo,
  scaleQuantityByFactor,
  buildVariantDetallesFromBase,
  reconstructVariantDetallesFromDeltas,
  computeInsumosModificadosDeltas
} from "../features/ventas/utils/variantFichaUtils.js";

test("detectVariantSizeInfo detects sizes vs flavors accurately", () => {
  assert.deepEqual(detectVariantSizeInfo("Grande"), {
    isSize: true,
    factor: 1.5,
    label: "1.5x (Grande)"
  });
  assert.deepEqual(detectVariantSizeInfo("Mediana"), {
    isSize: true,
    factor: 1.25,
    label: "1.25x (Mediana)"
  });
  assert.deepEqual(detectVariantSizeInfo("Familiar"), {
    isSize: true,
    factor: 2,
    label: "2x (Familiar / Mega)"
  });
  assert.deepEqual(detectVariantSizeInfo("Mega 2.5L"), {
    isSize: true,
    factor: 2.5,
    label: "2.5x (Mega / 2.5L)"
  });
  assert.deepEqual(detectVariantSizeInfo("Doble Carne"), {
    isSize: true,
    factor: 2,
    label: "2x (Doble)"
  });
  assert.deepEqual(detectVariantSizeInfo("Triple"), {
    isSize: true,
    factor: 3,
    label: "3x (Triple)"
  });
  assert.deepEqual(detectVariantSizeInfo("Combo 4 personas"), {
    isSize: true,
    factor: 4,
    label: "4x (4 personas)"
  });
  assert.deepEqual(detectVariantSizeInfo("BBQ Ahumada"), {
    isSize: false,
    factor: 1,
    label: "1x (Estándar)"
  });
  assert.deepEqual(detectVariantSizeInfo("Zero"), {
    isSize: false,
    factor: 1,
    label: "1x (Estándar)"
  });
});

test("buildVariantDetallesFromBase preloads base insumos and scales cleanly without double-multiplication", () => {
  const baseRecipe = [
    { idInsumo: 1, nombre: "Pan Brioche", cantidad: 1, unidadMedida: "und" },
    { idInsumo: 2, nombre: "Carne de Res 80/20", cantidad: 0.15, unidadMedida: "kg" },
    { idInsumo: 3, nombre: "Queso Cheddar", cantidad: 1, unidadMedida: "und" }
  ];

  // Flavor variant (factor 1): keeps exact base quantities
  const bbq = buildVariantDetallesFromBase(baseRecipe, 1);
  assert.equal(bbq.length, 3);
  assert.equal(bbq[0].cantidad, 1);
  assert.equal(bbq[1].cantidad, 0.15);
  assert.equal(bbq[1].baseCantidad, 0.15);
  assert.equal(bbq[2].cantidad, 1);

  // Size variant (Grande = 1.5x): multiplies each base insumo cleanly
  const grande = buildVariantDetallesFromBase(baseRecipe, 1.5);
  assert.equal(grande[0].cantidad, 1.5);
  assert.equal(grande[1].cantidad, 0.23); // 0.15 * 1.5 = 0.225 -> rounded 0.23
  assert.equal(grande[1].baseCantidad, 0.15);

  // Re-scaling from Grande (1.5x) to Familiar (2x) uses baseCantidad so there is NO 1.5 * 2 = 3x bug
  const rescaled = grande.map((d) => ({
    ...d,
    cantidad: scaleQuantityByFactor(d.baseCantidad, 2)
  }));
  assert.equal(rescaled[0].cantidad, 2);
  assert.equal(rescaled[1].cantidad, 0.3);
  assert.equal(rescaled[2].cantidad, 2);
});

test("computeInsumosModificadosDeltas and reconstructVariantDetallesFromDeltas round-trip cleanly", () => {
  const baseRecipe = [
    { idInsumo: 10, nombre: "Pan", cantidad: 1, unidadMedida: "und" },
    { idInsumo: 11, nombre: "Carne", cantidad: 150, unidadMedida: "g" },
    { idInsumo: 12, nombre: "Cebolla", cantidad: 20, unidadMedida: "g" }
  ];

  const editedVariantRecipe = [
    { idInsumo: 10, nombre: "Pan", cantidad: 1, unidadMedida: "und" },
    { idInsumo: 11, nombre: "Carne", cantidad: 300, unidadMedida: "g" }, // modified qty
    // Cebolla (12) removed -> QUITAR
    { idInsumo: 13, nombre: "Jalapeños", cantidad: 25, unidadMedida: "g" } // added -> AGREGAR
  ];

  const deltas = computeInsumosModificadosDeltas(editedVariantRecipe, baseRecipe);
  assert.equal(deltas.length, 3);
  assert.deepEqual(
    deltas.find((d) => d.idInsumo === 11),
    {
      idVarianteInsumo: null,
      tipoAccion: "MODIFICAR_CANTIDAD",
      idInsumo: 11,
      idInsumoReemplazado: null,
      cantidad: 300,
      unidadMedida: "gr"
    }
  );
  assert.deepEqual(
    deltas.find((d) => d.idInsumo === 12),
    {
      idVarianteInsumo: null,
      tipoAccion: "QUITAR",
      idInsumo: 12,
      idInsumoReemplazado: null,
      cantidad: 0,
      unidadMedida: "gr"
    }
  );
  assert.deepEqual(
    deltas.find((d) => d.idInsumo === 13),
    {
      idVarianteInsumo: null,
      tipoAccion: "AGREGAR",
      idInsumo: 13,
      idInsumoReemplazado: null,
      cantidad: 25,
      unidadMedida: "gr"
    }
  );

  const catalog = [
    { idInsumo: 10, nombre: "Pan", unidadMedida: "und" },
    { idInsumo: 11, nombre: "Carne", unidadMedida: "g" },
    { idInsumo: 12, nombre: "Cebolla", unidadMedida: "g" },
    { idInsumo: 13, nombre: "Jalapeños", unidadMedida: "g" }
  ];
  const reconstructed = reconstructVariantDetallesFromDeltas(baseRecipe, deltas, catalog);
  assert.equal(reconstructed.length, 3);
  assert.equal(reconstructed.find((r) => r.idInsumo === 10).cantidad, 1);
  assert.equal(reconstructed.find((r) => r.idInsumo === 11).cantidad, 300);
  assert.equal(reconstructed.find((r) => r.idInsumo === 12), undefined);
  assert.equal(reconstructed.find((r) => r.idInsumo === 13).cantidad, 25);
});
