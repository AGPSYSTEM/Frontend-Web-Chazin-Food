import React from "react";
import {
  IconBurger,
  IconSausage,
  IconPizza,
  IconCheese,
  IconMeat,
  IconCup,
  IconBottle,
  IconBottleFilled,
  IconPepper,
  IconFlame,
  IconEggFried,
  IconMushroom,
  IconAvocado,
  IconCake,
  IconIceCream,
  IconToolsKitchen2,
  IconChefHat,
  IconCarrot,
  IconSalad,
  IconBread,
  IconApple,
  IconShoppingCart,
  IconMotorbike,
  IconMapPin,
  IconStar,
  IconClock,
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconDeviceMobile,
  IconBrandWhatsapp,
  IconCircleCheck,
  IconCircleX,
  IconShoppingBag,
  IconSeeding,
  IconMedal,
  IconAward,
  IconCrown
} from "@tabler/icons-react";

/**
 * Icono de papas fritas en estilo Tabler (Grid 24x24, trazo vectorial limpio)
 */
export const IconFrenchFries = ({ size = 20, stroke = 1.75, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M5 11l1.5 9h11l1.5 -9z" />
    <path d="M5 11c2 1 4 1 7 0c3 1 5 1 7 0" />
    <path d="M7 11v-6a1 1 0 0 1 2 0v6" />
    <path d="M10 10v-7a1 1 0 0 1 2 0v7" />
    <path d="M13 10v-5a1 1 0 0 1 2 0v5" />
    <path d="M15 11v-7a1 1 0 0 1 2 0v7" />
  </svg>
);

/**
 * Icono de tocineta crujiente en estilo Tabler (Grid 24x24)
 */
export const IconBaconStrip = ({ size = 20, stroke = 1.75, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 7c2 -2 5 0 7 -2s5 0 7 -2s3 1 4 2c-2 2 -5 0 -7 2s-5 0 -7 2s-3 -1 -4 -2z" />
    <path d="M3 13c2 -2 5 0 7 -2s5 0 7 -2s3 1 4 2c-2 2 -5 0 -7 2s-5 0 -7 2s-3 -1 -4 -2z" />
    <path d="M3 19c2 -2 5 0 7 -2s5 0 7 -2s3 1 4 2c-2 2 -5 0 -7 2s-5 0 -7 2s-3 -1 -4 -2z" />
  </svg>
);

/**
 * Icono de cebolla (estilo Tabler Grid 24x24)
 */
export const IconOnion = ({ size = 20, stroke = 1.75, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3v3" />
    <path d="M12 6c3.5 0 6.5 3 6.5 7.5a6.5 6.5 0 0 1 -13 0c0 -4.5 3 -7.5 6.5 -7.5z" />
    <path d="M9.5 9c1.8 1.5 2.5 3.5 2.5 7" />
    <path d="M14.5 9c-1.8 1.5 -2.5 3.5 -2.5 7" />
    <path d="M10 20.5l-1 2" />
    <path d="M12 20.5v2" />
    <path d="M14 20.5l1 2" />
  </svg>
);

/**
 * Icono de tomate fresco (estilo Tabler Grid 24x24)
 */
export const IconTomato = ({ size = 20, stroke = 1.75, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 3v2" />
    <path d="M12 5c-1.5 -1.2 -3 -.8 -4 0c.8 1.2 2 1.5 4 1c2 .5 3.2 .2 4 -1c-1 -.8 -2.5 -1.2 -4 0z" />
    <path d="M12 6c-4.5 0 -8 3.2 -8 7.5a7.5 7.5 0 0 0 16 0c0 -4.3 -3.5 -7.5 -8 -7.5z" />
    <path d="M9 13a3 3 0 0 0 3 3" />
  </svg>
);

/**
 * Icono de lechuga / hojas verdes (estilo Tabler Grid 24x24)
 */
export const IconLettuce = ({ size = 20, stroke = 1.75, className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M5 11c0 -3.5 2.5 -6 6 -6c2.5 0 4 1.5 5 3.5c2 0 4 1.5 4 4.5c0 4 -3.5 7 -8 7s-7 -3 -7 -9z" />
    <path d="M10 19c1 -2.5 2 -6 2 -11" />
    <path d="M12 12c2 -1 3.5 -1.5 5 -1" />
    <path d="M8 14c1.5 -1 2.5 -1.5 4 -1" />
  </svg>
);

/**
 * Resuelve la paleta de colores del soft container por tipo de alimento o categoría
 */
export const getFoodColorTheme = (nameOrCategory = "") => {
  const k = String(nameOrCategory || "").toLowerCase().trim();

  if (k.includes("hambur")) {
    return {
      bg: "bg-amber-100 dark:bg-amber-950/50",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-200/70 dark:border-amber-900/50",
      pill: "bg-amber-500 text-white"
    };
  }
  if (k.includes("perro") || k.includes("hot dog") || k.includes("salchicha")) {
    return {
      bg: "bg-orange-100 dark:bg-orange-950/50",
      text: "text-orange-600 dark:text-orange-400",
      border: "border-orange-200/70 dark:border-orange-900/50",
      pill: "bg-orange-500 text-white"
    };
  }
  if (k.includes("salchipapa") || k.includes("papa")) {
    return {
      bg: "bg-yellow-100 dark:bg-yellow-950/50",
      text: "text-yellow-700 dark:text-yellow-400",
      border: "border-yellow-200/70 dark:border-yellow-900/50",
      pill: "bg-yellow-600 text-white"
    };
  }
  if (k.includes("bebida") || k.includes("gaseosa") || k.includes("refresco") || k.includes("sprite") || k.includes("coca") || k.includes("pepsi") || k.includes("jugo") || k.includes("agua")) {
    return {
      bg: "bg-sky-100 dark:bg-sky-950/50",
      text: "text-sky-600 dark:text-sky-400",
      border: "border-sky-200/70 dark:border-sky-900/50",
      pill: "bg-sky-500 text-white"
    };
  }
  if (k.includes("combo")) {
    return {
      bg: "bg-purple-100 dark:bg-purple-950/50",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200/70 dark:border-purple-900/50",
      pill: "bg-purple-500 text-white"
    };
  }
  if (k.includes("pizza")) {
    return {
      bg: "bg-rose-100 dark:bg-rose-950/50",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-200/70 dark:border-rose-900/50",
      pill: "bg-rose-500 text-white"
    };
  }
  if (k.includes("toci") || k.includes("bacon")) {
    return {
      bg: "bg-red-100 dark:bg-red-950/50",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200/70 dark:border-red-900/50",
      pill: "bg-red-500 text-white"
    };
  }
  if (k.includes("queso") || k.includes("cheddar")) {
    return {
      bg: "bg-amber-100 dark:bg-amber-950/50",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-200/70 dark:border-amber-900/50",
      pill: "bg-amber-600 text-white"
    };
  }
  if (k.includes("postre") || k.includes("helado") || k.includes("torta")) {
    return {
      bg: "bg-pink-100 dark:bg-pink-950/50",
      text: "text-pink-600 dark:text-pink-400",
      border: "border-pink-200/70 dark:border-pink-900/50",
      pill: "bg-pink-500 text-white"
    };
  }
  if (k.includes("acompa") || k.includes("ensalada") || k.includes("veggie")) {
    return {
      bg: "bg-emerald-100 dark:bg-emerald-950/50",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200/70 dark:border-emerald-900/50",
      pill: "bg-emerald-500 text-white"
    };
  }

  return {
    bg: "bg-red-100 dark:bg-red-950/50",
    text: "text-[#f05454] dark:text-red-400",
    border: "border-red-200/70 dark:border-red-900/50",
    pill: "bg-[#f05454] text-white"
  };
};

/**
 * Mapa canónico de Slugs desacoplados -> Componente de Icono Tabler
 */
export const ICON_MAP = {
  // Comida y Bebidas
  burger: IconBurger,
  hamburguesa: IconBurger,
  hamburguesas: IconBurger,
  pizza: IconPizza,
  pizzas: IconPizza,
  fries: IconFrenchFries,
  papas: IconFrenchFries,
  salchipapa: IconFrenchFries,
  salchipapas: IconFrenchFries,
  hotdog: IconSausage,
  perro: IconSausage,
  sausage: IconSausage,
  salchicha: IconSausage,
  drink: IconCup,
  bebida: IconCup,
  bebidas: IconCup,
  gaseosa: IconCup,
  gaseosas: IconCup,
  cup: IconCup,
  bottle: IconBottle,
  botella: IconBottle,
  agua: IconBottle,
  chicken: IconMeat,
  pollo: IconMeat,
  alitas: IconMeat,
  meat: IconMeat,
  carne: IconMeat,
  bacon: IconBaconStrip,
  tocineta: IconBaconStrip,
  cheese: IconCheese,
  queso: IconCheese,
  egg: IconEggFried,
  huevo: IconEggFried,
  mushroom: IconMushroom,
  champiñon: IconMushroom,
  champinon: IconMushroom,
  avocado: IconAvocado,
  aguacate: IconAvocado,
  guacamole: IconAvocado,
  pepper: IconPepper,
  picante: IconPepper,
  sauce: IconBottleFilled,
  salsa: IconBottleFilled,
  salad: IconSalad,
  ensalada: IconSalad,
  onion: IconOnion,
  cebolla: IconOnion,
  tomato: IconTomato,
  tomate: IconTomato,
  lettuce: IconLettuce,
  lechuga: IconLettuce,
  carrot: IconCarrot,
  zanahoria: IconCarrot,
  bread: IconBread,
  pan: IconBread,
  apple: IconApple,
  dessert: IconCake,
  postre: IconCake,
  postres: IconCake,
  cake: IconCake,
  torta: IconCake,
  icecream: IconIceCream,
  helado: IconIceCream,
  helados: IconIceCream,
  combo: IconToolsKitchen2,
  combos: IconToolsKitchen2,
  chef: IconChefHat,
  kitchen: IconToolsKitchen2,
  todos: IconToolsKitchen2,

  // UI, Domicilios y Canales
  delivery: IconMotorbike,
  domicilio: IconMotorbike,
  moto: IconMotorbike,
  table: IconToolsKitchen2,
  mesa: IconToolsKitchen2,
  dinein: IconToolsKitchen2,
  takeout: IconShoppingBag,
  llevar: IconShoppingBag,
  cart: IconShoppingCart,
  carrito: IconShoppingCart,
  location: IconMapPin,
  pin: IconMapPin,
  map: IconMapPin,
  flame: IconFlame,
  fuego: IconFlame,
  star: IconStar,
  estrella: IconStar,
  clock: IconClock,
  reloj: IconClock,
  cash: IconCash,
  efectivo: IconCash,
  card: IconCreditCard,
  tarjeta: IconCreditCard,
  bank: IconBuildingBank,
  transfer: IconBuildingBank,
  transferencia: IconBuildingBank,
  mobile: IconDeviceMobile,
  nequi: IconDeviceMobile,
  daviplata: IconDeviceMobile,
  check: IconCircleCheck,
  success: IconCircleCheck,
  cancel: IconCircleX,
  error: IconCircleX,
  whatsapp: IconBrandWhatsapp,

  // Niveles de Fidelidad
  sprout: IconSeeding,
  nuevo: IconSeeding,
  bronze: IconMedal,
  regular: IconMedal,
  silver: IconAward,
  frecuente: IconAward,
  gold: IconCrown,
  vip: IconCrown
};

/**
 * Catálogo de slugs disponibles para selectores de administración
 */
export const AVAILABLE_FOOD_SLUGS = [
  { slug: "burger", label: "Hamburguesa", icon: IconBurger },
  { slug: "hotdog", label: "Perro Caliente", icon: IconSausage },
  { slug: "fries", label: "Papas Fritas", icon: IconFrenchFries },
  { slug: "pizza", label: "Pizza", icon: IconPizza },
  { slug: "drink", label: "Bebida / Vaso", icon: IconCup },
  { slug: "bottle", label: "Botella / Agua", icon: IconBottle },
  { slug: "meat", label: "Carne / Pollo", icon: IconMeat },
  { slug: "bacon", label: "Tocineta", icon: IconBaconStrip },
  { slug: "cheese", label: "Queso", icon: IconCheese },
  { slug: "egg", label: "Huevo", icon: IconEggFried },
  { slug: "mushroom", label: "Champiñón", icon: IconMushroom },
  { slug: "avocado", label: "Aguacate", icon: IconAvocado },
  { slug: "pepper", label: "Picante / Ají", icon: IconPepper },
  { slug: "sauce", label: "Salsas", icon: IconBottleFilled },
  { slug: "salad", label: "Ensalada", icon: IconSalad },
  { slug: "dessert", label: "Postre / Torta", icon: IconCake },
  { slug: "icecream", label: "Helado", icon: IconIceCream },
  { slug: "combo", label: "Combo / Menú", icon: IconToolsKitchen2 },
];

/**
 * Renderiza el icono vectorial adecuado según el slug, nombre del producto, adición o categoría.
 * Si no se pasa o no existe, usa IconToolsKitchen2 como fallback seguro.
 */
export function FoodIcon({ name = "", category = "", size = 20, stroke = 1.75, className = "", ...props }) {
  const rawKey = String(name || category || "").trim().toLowerCase();

  // 1. Coincidencia directa por slug exacto en el mapa
  if (ICON_MAP[rawKey]) {
    const Component = ICON_MAP[rawKey];
    return <Component size={size} stroke={stroke} className={className} {...props} />;
  }

  // 2. Coincidencia semántica inteligente (búsqueda de palabras clave)
  const k = `${String(name || "")} ${String(category || "")}`.toLowerCase();

  if (k.includes("hambur")) {
    return <IconBurger size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("perro") || k.includes("hot dog") || k.includes("salchicha")) {
    return <IconSausage size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("salchipapa") || k.includes("papa") || k.includes("frita") || k.includes("casco")) {
    return <IconFrenchFries size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("toci") || k.includes("bacon")) {
    return <IconBaconStrip size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("queso") || k.includes("cheddar") || k.includes("mozzarella")) {
    return <IconCheese size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("pizza")) {
    return <IconPizza size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("bebida") || k.includes("gaseosa") || k.includes("refresco") || k.includes("sprite") || k.includes("coca") || k.includes("pepsi") || k.includes("quatro") || k.includes("colombiana") || k.includes("uva") || k.includes("jugo")) {
    return <IconCup size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("agua") || k.includes("cristal") || k.includes("botella")) {
    return <IconBottle size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("combo")) {
    return <IconToolsKitchen2 size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("carne") || k.includes("patty") || k.includes("res") || k.includes("pollo") || k.includes("alita") || k.includes("nugget") || k.includes("broaster")) {
    return <IconMeat size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("huevo")) {
    return <IconEggFried size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("champi") || k.includes("hongo")) {
    return <IconMushroom size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("aguacate") || k.includes("guacamole")) {
    return <IconAvocado size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("jalap") || k.includes("picante") || k.includes("aji")) {
    return <IconPepper size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("salsa") || k.includes("bbq") || k.includes("ajo") || k.includes("tartara") || k.includes("mayo") || k.includes("ketchup")) {
    return <IconBottleFilled size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("cebolla") || k.includes("onion")) {
    return <IconOnion size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("tomate") || k.includes("tomato")) {
    return <IconTomato size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("lechuga") || k.includes("lettuce")) {
    return <IconLettuce size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("ensalada") || k.includes("veggie")) {
    return <IconSalad size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("zanahoria") || k.includes("carrot")) {
    return <IconCarrot size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("pan") || k.includes("brioche")) {
    return <IconBread size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("manzana")) {
    return <IconApple size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("postre") || k.includes("torta") || k.includes("pastel")) {
    return <IconCake size={size} stroke={stroke} className={className} {...props} />;
  }
  if (k.includes("helado")) {
    return <IconIceCream size={size} stroke={stroke} className={className} {...props} />;
  }

  // 3. Fallback limpio por defecto
  return <IconToolsKitchen2 size={size} stroke={stroke} className={className} {...props} />;
}

export default FoodIcon;

/**
 * Contenedor suave (Soft Badge / Chip) con diseño profesional de comida rápida
 */
export function FoodIconBadge({
  name = "",
  category = "",
  size = "md",
  iconSize,
  isSelected = false,
  className = "",
  children,
  ...props
}) {
  const theme = getFoodColorTheme(name || category);

  const sizeClasses = {
    xs: "w-6 h-6 rounded-lg",
    sm: "w-8 h-8 rounded-xl",
    md: "w-10 h-10 rounded-2xl",
    lg: "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl",
    xl: "w-16 h-16 rounded-3xl"
  }[size] || "w-10 h-10 rounded-2xl";

  const defaultIconSizes = {
    xs: 13,
    sm: 16,
    md: 20,
    lg: 26,
    xl: 32
  }[size] || 20;

  const actualIconSize = iconSize || defaultIconSizes;

  if (isSelected) {
    return (
      <div
        className={`flex items-center justify-center shrink-0 bg-white dark:bg-gray-900 text-[#f05454] dark:text-red-400 shadow-md transition-all ${sizeClasses} ${className}`}
        {...props}
      >
        <FoodIcon name={name} category={category} size={actualIconSize} stroke={2} />
        {children}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center shrink-0 border transition-all ${sizeClasses} ${theme.bg} ${theme.text} ${theme.border} shadow-xs ${className}`}
      {...props}
    >
      <FoodIcon name={name} category={category} size={actualIconSize} stroke={1.8} />
      {children}
    </div>
  );
}
