/**
 * Utilidades para determinar ingredientes esenciales en productos gastronómicos
 */
export const isEssentialIngredient = (ingredientName, producto) => {
  if (!ingredientName || !producto) return false;
  const ingName = String(ingredientName).toLowerCase().trim();
  const prodName = String(producto.nombre || "").toLowerCase().trim();
  const catName = String(
    producto.categoria?.nombre ||
    producto.categoria ||
    producto.categoriaNombre ||
    producto.categoria_producto ||
    ""
  ).toLowerCase().trim();

  // INGREDIENTES GENERALES PERSONALIZABLES / REMOVIBLES:
  if (
    ingName.includes("lechuga") ||
    ingName.includes("tomate") ||
    ingName.includes("tocineta") ||
    ingName.includes("bacon") ||
    ingName.includes("tocino") ||
    ingName.includes("queso") ||
    ingName.includes("cheddar") ||
    ingName.includes("mozzarella") ||
    ingName.includes("costeño") ||
    ingName.includes("costeno") ||
    ingName.includes("cebolla") ||
    ingName.includes("salsa") ||
    ingName.includes("tártara") ||
    ingName.includes("tartara") ||
    ingName.includes("bbq") ||
    ingName.includes("mayonesa") ||
    ingName.includes("mostaza") ||
    ingName.includes("ketchup") ||
    ingName.includes("piña") ||
    ingName.includes("pina") ||
    ingName.includes("ripio") ||
    ingName.includes("guacamole") ||
    ingName.includes("aguacate") ||
    ingName.includes("jalapeño") ||
    ingName.includes("jalapeno") ||
    ingName.includes("suero") ||
    ingName.includes("maiz") ||
    ingName.includes("maíz") ||
    ingName.includes("champiñon") ||
    ingName.includes("champinon")
  ) {
    return false;
  }

  // 1. HAMBURGUESAS: La base insustituible es tanto el PAN como la CARNE
  const isBurger = catName.includes("hamburguesa") || prodName.includes("hamburguesa") || prodName.includes("burger");
  if (isBurger) {
    if (
      ingName.includes("pan") ||
      ingName.includes("brioche") ||
      ingName.includes("artesanal") ||
      ingName.includes("carne") ||
      ingName.includes("de res") ||
      /\bres\b/.test(ingName) ||
      ingName.includes("beef") ||
      ingName.includes("patty") ||
      ingName.includes("pollo") ||
      ingName.includes("pechuga")
    ) {
      return true;
    }
  }

  // 2. PERROS CALIENTES: Pan y salchicha
  const isHotDog = catName.includes("perro") || prodName.includes("perro") || prodName.includes("hot dog");
  if (isHotDog) {
    if (
      ingName.includes("pan") ||
      ingName.includes("perro") ||
      ingName.includes("brioche") ||
      ingName.includes("salchicha") ||
      ingName.includes("suiza") ||
      ingName.includes("americana") ||
      ingName.includes("chorizo") ||
      ingName.includes("butifarra") ||
      ingName.includes("embutido")
    ) {
      return true;
    }
  }

  // 3. SALCHIPAPAS: Papas y salchicha
  const isSalchipapa = catName.includes("salchipapa") || prodName.includes("salchipapa");
  if (isSalchipapa) {
    if (
      ingName.includes("papa") ||
      ingName.includes("francesa") ||
      ingName.includes("salchicha") ||
      ingName.includes("suiza") ||
      ingName.includes("americana") ||
      ingName.includes("chorizo") ||
      ingName.includes("embutido")
    ) {
      return true;
    }
  }

  // 4. COMBOS
  const isCombo = catName.includes("combo") || prodName.includes("combo");
  if (isCombo) {
    if (
      ingName.includes("pan") ||
      ingName.includes("carne") ||
      ingName.includes("de res") ||
      /\bres\b/.test(ingName) ||
      ingName.includes("salchicha") ||
      ingName.includes("pollo")
    ) {
      return true;
    }
  }

  // 5. PLATOS Y PORCIONES DE PAPAS
  const isPapasPlate = (catName.includes("acompa") || catName.includes("guarnic") || catName.includes("papas")) && (prodName.includes("papa") || prodName.includes("francesa"));
  if (isPapasPlate) {
    if (ingName.includes("papa") || ingName.includes("francesa") || ingName.includes("casco") || ingName.includes("corral") || ingName.includes("espiral")) {
      return true;
    }
  }

  // 6. ALITAS O POLLO FRITO
  const isAlitas = catName.includes("alita") || prodName.includes("alita");
  if (isAlitas) {
    if (ingName.includes("alita") || ingName.includes("pollo")) {
      return true;
    }
  }

  return false;
};
