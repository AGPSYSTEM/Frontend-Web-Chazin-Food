import test from "node:test";
import assert from "node:assert/strict";
import {
  isDummyOrBaseVariant,
  getDisplayProductVariants,
  getProductVariantSummary
} from "../shared/utils/productVariantUtils.js";

test("isDummyOrBaseVariant identifies tautological base variants cleanly", () => {
  assert.equal(isDummyOrBaseVariant("", "Hamburguesa Clásica"), true);
  assert.equal(isDummyOrBaseVariant("Hamburguesa Clásica", "Hamburguesa Clásica"), true);
  assert.equal(isDummyOrBaseVariant("Base", "Hamburguesa Clásica"), true);
  assert.equal(isDummyOrBaseVariant("Hamburguesa Clásica - base", "Hamburguesa Clásica"), true);
  assert.equal(isDummyOrBaseVariant("Carne Picante", "Hamburguesa Clásica"), false);
  assert.equal(isDummyOrBaseVariant("Doble", "Hamburguesa Clásica"), false);
});

test("getDisplayProductVariants excludes combos, dummy variants, and duplicate names", () => {
  const combo = {
    nombre: "Combo Pareja",
    configuracionCombo: { esCombo: true },
    variantes: [{ idVariante: 1, nombre: "Grande", precio: 45000 }]
  };
  assert.deepEqual(getDisplayProductVariants(combo), []);

  const burger = {
    nombre: "Hamburguesa Clásica",
    precio: 18000,
    variantes: [
      { idVariante: 1, nombre: "Hamburguesa Clásica", precio: 18000 },
      { idVariante: 2, nombre: "Carne Picante", precio: 20000 },
      { idVariante: 3, nombre: "  Carne Picante  ", precio: 20000 },
      { idVariante: 4, nombre: "Doble", precio: 24000 },
      { idVariante: 5, nombre: "Base", precio: 18000 }
    ]
  };

  const display = getDisplayProductVariants(burger);
  assert.deepEqual(
    display.map((v) => v.nombre),
    ["Carne Picante", "Doble"]
  );
});

test("getProductVariantSummary summarizes variant count, names, and custom price ranges", () => {
  const samePriceProduct = {
    nombre: "Gaseosa 400ml",
    precio: 4500,
    variantes: [
      { idVariante: 10, nombre: "Uva", precio: 0 },
      { idVariante: 11, nombre: "Naranja", precio: 4500 }
    ]
  };

  const sameSummary = getProductVariantSummary(samePriceProduct);
  assert.equal(sameSummary.hasVariants, true);
  assert.equal(sameSummary.count, 2);
  assert.deepEqual(sameSummary.names, ["Uva", "Naranja"]);
  assert.equal(sameSummary.hasDifferentPrices, false);
  assert.equal(sameSummary.minPrice, 4500);
  assert.equal(sameSummary.maxPrice, 4500);

  const variedPriceProduct = {
    nombre: "Hamburguesa Clásica",
    precio: 18000,
    variantes: [
      { idVariante: 20, nombre: "Carne Picante", precio: 18000 },
      { idVariante: 21, nombre: "Doble Carne", precio: 25000 }
    ]
  };

  const diffSummary = getProductVariantSummary(variedPriceProduct);
  assert.equal(diffSummary.hasVariants, true);
  assert.equal(diffSummary.count, 2);
  assert.equal(diffSummary.hasDifferentPrices, true);
  assert.equal(diffSummary.minPrice, 18000);
  assert.equal(diffSummary.maxPrice, 25000);

  const noVariants = getProductVariantSummary({ nombre: "Papas", precio: 7000, variantes: [] });
  assert.equal(noVariants.hasVariants, false);
  assert.equal(noVariants.count, 0);
});

