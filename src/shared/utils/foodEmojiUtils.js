/**
 * Food and Additions Icon & Emoji helper utilities (Powered by Tabler Icons)
 */
import { FoodIcon, FoodIconBadge, getFoodColorTheme, IconFrenchFries, IconBaconStrip } from "../components/ui/FoodIcon";

export { FoodIcon, FoodIconBadge, getFoodColorTheme, IconFrenchFries, IconBaconStrip };

export const FOOD_EMOJI_LIST = [
  { emoji: "bacon", label: "Tocineta Extra", key: "tocineta" },
  { emoji: "cheese", label: "Queso Cheddar / Mozzarella", key: "queso" },
  { emoji: "fries", label: "Papas Fritas", key: "papas" },
  { emoji: "drink", label: "Bebida / Sprite / Coca Cola", key: "bebida" },
  { emoji: "egg", label: "Huevo Frito", key: "huevo" },
  { emoji: "meat", label: "Carne Extra", key: "carne" },
  { emoji: "chicken", label: "Pollo / Trocitos", key: "pollo" },
  { emoji: "onion", label: "Cebolla Crispy", key: "cebolla" },
  { emoji: "sauce", label: "Salsas BBQ / Ajo / Tártara", key: "salsa" },
  { emoji: "avocado", label: "Aguacate / Guacamole", key: "aguacate" },
  { emoji: "mushroom", label: "Champiñones", key: "champinones" },
  { emoji: "pineapple", label: "Piña Caramelizada", key: "pina" },
  { emoji: "hotdog", label: "Salchicha / Tocineta", key: "salchicha" },
  { emoji: "pepper", label: "Jalapeños / Ají Picante", key: "jalapeno" },
  { emoji: "corn", label: "Maíz Tierno", key: "maiz" },
  { emoji: "lettuce", label: "Lechuga / Vegetales", key: "vegetales" },
  { emoji: "pickle", label: "Pepinillos", key: "pepinillos" },
  { emoji: "sparkles", label: "Especial / Extra", key: "especial" }
];

export const getAdditionEmoji = (name = "", rawImage = "") => {
  if (rawImage && typeof rawImage === "string" && rawImage.trim()) {
    const trimmed = rawImage.trim();
    if (trimmed.length <= 25 && !trimmed.startsWith("http") && !trimmed.startsWith("/")) {
      return trimmed;
    }
  }

  const n = (name || "").toLowerCase();
  if (n.includes("toci") || n.includes("bacon")) return "bacon";
  if (n.includes("queso") || n.includes("cheddar") || n.includes("mozzarella")) return "cheese";
  if (n.includes("papa") || n.includes("frita") || n.includes("casco")) return "fries";
  if (n.includes("sprite") || n.includes("coca") || n.includes("gaseosa") || n.includes("bebida") || n.includes("jugo") || n.includes("quatro") || n.includes("agua")) return "drink";
  if (n.includes("huevo")) return "egg";
  if (n.includes("carne") || n.includes("patty") || n.includes("res")) return "meat";
  if (n.includes("pollo") || n.includes("nugget") || n.includes("alita") || n.includes("broaster")) return "chicken";
  if (n.includes("cebolla") || n.includes("crispy")) return "onion";
  if (n.includes("salsa") || n.includes("bbq") || n.includes("ajo") || n.includes("tartara") || n.includes("mayo") || n.includes("ketchup") || n.includes("mostaza")) return "sauce";
  if (n.includes("aguacate") || n.includes("guacamole")) return "avocado";
  if (n.includes("champi") || n.includes("hongo")) return "mushroom";
  if (n.includes("pina") || n.includes("piña")) return "pineapple";
  if (n.includes("pepini")) return "pickle";
  if (n.includes("salchicha") || n.includes("perro")) return "hotdog";
  if (n.includes("jalap") || n.includes("picante") || n.includes("aji")) return "pepper";
  if (n.includes("lechuga") || n.includes("tomate") || n.includes("veggie")) return "lettuce";
  if (n.includes("maiz") || n.includes("choclo")) return "corn";
  return "sparkles";
};

export const getProductEmoji = (name = "") => {
  const normalized = (name || "").toLowerCase();
  if (normalized.includes("hamburg")) return "burger";
  if (normalized.includes("salchip")) return "fries";
  if (normalized.includes("perro") || normalized.includes("hot dog")) return "hotdog";
  if (normalized.includes("pollo") || normalized.includes("alita") || normalized.includes("broaster")) return "chicken";
  if (normalized.includes("papas") || normalized.includes("fritas")) return "fries";
  if (normalized.includes("beb") || normalized.includes("jugo")) return "drink";
  if (normalized.includes("gaseos") || normalized.includes("coca") || normalized.includes("sprite") || normalized.includes("quatro")) return "drink";
  if (normalized.includes("pizza")) return "pizza";
  if (normalized.includes("postre") || normalized.includes("torta")) return "cupcake";
  if (normalized.includes("combo") || normalized.includes("pareja") || normalized.includes("familiar")) return "combo";
  return "plate";
};
