/**
 * Food and Additions Emoji & Image helper utilities
 */

export const FOOD_EMOJI_LIST = [
  { emoji: "🥓", label: "Tocineta Extra" },
  { emoji: "🧀", label: "Queso Cheddar / Mozzarella" },
  { emoji: "🍟", label: "Papas Fritas" },
  { emoji: "🥤", label: "Bebida / Sprite / Coca Cola" },
  { emoji: "🥚", label: "Huevo Frito" },
  { emoji: "🥩", label: "Carne Extra" },
  { emoji: "🍗", label: "Pollo / Trocitos" },
  { emoji: "🧅", label: "Cebolla Crispy" },
  { emoji: "🥫", label: "Salsas BBQ / Ajo / Tártara" },
  { emoji: "🥑", label: "Aguacate / Guacamole" },
  { emoji: "🍄", label: "Champiñones" },
  { emoji: "🍍", label: "Piña Caramelizada" },
  { emoji: "🌭", label: "Salchicha / Tocineta" },
  { emoji: "🌶️", label: "Jalapeños / Ají Picante" },
  { emoji: "🌽", label: "Maíz Tierno" },
  { emoji: "🥬", label: "Lechuga / Vegetales" },
  { emoji: "🫒", label: "Pepinillos" },
  { emoji: "✨", label: "Especial / Extra" }
];

export const getAdditionEmoji = (name = "", rawImage = "") => {
  if (rawImage && typeof rawImage === "string" && rawImage.trim()) {
    const trimmed = rawImage.trim();
    // If it's a direct emoji character or short code
    if (trimmed.length <= 4 && !trimmed.startsWith("http") && !trimmed.startsWith("/")) {
      return trimmed;
    }
  }

  const n = (name || "").toLowerCase();
  if (n.includes("toci") || n.includes("bacon")) return "🥓";
  if (n.includes("queso") || n.includes("cheddar") || n.includes("mozzarella")) return "🧀";
  if (n.includes("papa") || n.includes("frita") || n.includes("casco")) return "🍟";
  if (n.includes("sprite") || n.includes("coca") || n.includes("gaseosa") || n.includes("bebida") || n.includes("jugo") || n.includes("quatro") || n.includes("agua")) return "🥤";
  if (n.includes("huevo")) return "🥚";
  if (n.includes("carne") || n.includes("patty") || n.includes("res")) return "🥩";
  if (n.includes("pollo") || n.includes("nugget") || n.includes("alita") || n.includes("broaster")) return "🍗";
  if (n.includes("cebolla") || n.includes("crispy")) return "🧅";
  if (n.includes("salsa") || n.includes("bbq") || n.includes("ajo") || n.includes("tartara") || n.includes("mayo") || n.includes("ketchup") || n.includes("mostaza")) return "🥫";
  if (n.includes("aguacate") || n.includes("guacamole")) return "🥑";
  if (n.includes("champi") || n.includes("hongo")) return "🍄";
  if (n.includes("pina") || n.includes("piña")) return "🍍";
  if (n.includes("pepini")) return "🫒";
  if (n.includes("salchicha") || n.includes("perro")) return "🌭";
  if (n.includes("jalap") || n.includes("picante") || n.includes("aji")) return "🌶️";
  if (n.includes("lechuga") || n.includes("tomate") || n.includes("veggie")) return "🥬";
  if (n.includes("maiz") || n.includes("choclo")) return "🌽";
  return "✨";
};

export const getProductEmoji = (name = "") => {
  const normalized = (name || "").toLowerCase();
  if (normalized.includes("hamburg")) return "🍔";
  if (normalized.includes("salchip")) return "🍟";
  if (normalized.includes("perro") || normalized.includes("hot dog")) return "🌭";
  if (normalized.includes("pollo") || normalized.includes("alita") || normalized.includes("broaster")) return "🍗";
  if (normalized.includes("papas") || normalized.includes("fritas")) return "🍟";
  if (normalized.includes("beb") || normalized.includes("jugo")) return "🥤";
  if (normalized.includes("gaseos") || normalized.includes("coca") || normalized.includes("sprite") || normalized.includes("quatro")) return "🥤";
  if (normalized.includes("pizza")) return "🍕";
  if (normalized.includes("postre") || normalized.includes("torta")) return "🍰";
  if (normalized.includes("combo") || normalized.includes("pareja") || normalized.includes("familiar")) return "🍱";
  return "🍽️";
};
