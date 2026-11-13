/**
 * Helpers puros para identificar, filtrar y resumir variantes reales de un producto.
 */

/**
 * Detecta si una variante es redundante o equivalente al producto base (dummy/tautológica).
 */
export const isDummyOrBaseVariant = (vName, pName) => {
  if (!vName) return true;
  const vn = String(vName).trim().toLowerCase();
  const pn = String(pName || "").trim().toLowerCase();
  if (vn === pn) return true;
  if (vn === `${pn} - base` || vn === `${pn} - completo` || vn === `${pn} base` || vn === `${pn} completo`) return true;
  if (["base", "estándar", "estandar", "completo", "combo", "única", "unica"].includes(vn)) return true;
  if (vn.startsWith("porción individual") || vn.startsWith("porcion individual")) return true;
  if (vn === "edición especial" || vn === "edicion especial") return true;
  if (vn === "edición especial burger fest" || vn === "edicion especial burger fest") return true;
  if (vn === "porción costeña grande" || vn === "porcion costeña grande") return true;
  if (vn === "salchipapa personal grande") return true;
  if (["perro especial", "perro suizo gourmet", "perro mexicano clásico", "perro mexicano clasico", "perro criollo gourmet"].includes(vn)) return true;
  if (vn === "clásica 150g" || vn === "clasica 150g") return true;
  if (vn === "doble carne 300g" && pn.includes("doble carne")) return true;
  if (vn === "pollo crispy 180g" && pn.includes("pollo crispy")) return true;
  if (vn === "individual campesina" && pn.includes("campesina")) return true;
  if (vn === "botella 500ml" && pn.includes("cristal")) return true;
  return false;
};

/**
 * Retorna únicamente las variantes reales y mostrables de un producto.
 * Excluye combos, nombres vacíos, duplicados y variantes base/dummy.
 */
export const getDisplayProductVariants = (producto) => {
  if (!producto || producto.configuracionCombo?.esCombo) return [];
  const rawVars = Array.isArray(producto.variantes) ? producto.variantes : [];
  if (rawVars.length === 0) return [];

  const seen = new Set();
  const result = [];

  for (const v of rawVars) {
    if (!v || typeof v !== "object") continue;
    const rawName = String(v.nombre || "").trim();
    if (!rawName) continue;
    if (isDummyOrBaseVariant(rawName, producto.nombre)) continue;

    const normKey = rawName.toLowerCase();
    if (seen.has(normKey)) continue;
    seen.add(normKey);

    result.push({
      ...v,
      nombre: rawName
    });
  }

  return result;
};

/**
 * Resume la información de variantes de un producto para mostrar en listados
 * (conteo, nombres visibles y rango de precios si difieren del precio base).
 */
export const getProductVariantSummary = (producto) => {
  const variants = getDisplayProductVariants(producto);
  const count = variants.length;
  const hasVariants = count > 0;
  const basePriceNum = Number(producto?.precio || 0);
  const basePrice = Number.isFinite(basePriceNum) && basePriceNum > 0 ? basePriceNum : 0;

  if (!hasVariants) {
    return {
      hasVariants: false,
      count: 0,
      variants: [],
      names: [],
      minPrice: basePrice,
      maxPrice: basePrice,
      hasDifferentPrices: false
    };
  }

  const effectivePrices = variants
    .map((v) => {
      const vp = Number(v.precio);
      if (Number.isFinite(vp) && vp > 0) return vp;
      return basePrice;
    })
    .filter((p) => Number.isFinite(p) && p > 0);

  const minPrice = effectivePrices.length > 0 ? Math.min(...effectivePrices) : basePrice;
  const maxPrice = effectivePrices.length > 0 ? Math.max(...effectivePrices) : basePrice;
  const hasDifferentPrices =
    effectivePrices.length > 0 &&
    (minPrice !== maxPrice || (basePrice > 0 && effectivePrices.some((p) => p !== basePrice)));

  return {
    hasVariants: true,
    count,
    variants,
    names: variants.map((v) => v.nombre),
    minPrice,
    maxPrice,
    hasDifferentPrices
  };
};

