import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LogIn, ShoppingCart, User, Search, Package, Clock, X, Plus, Minus, FileText, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Check, MapPin, CreditCard, Banknote, Smartphone, RefreshCw, Sun, Moon, Zap, Truck, Store, Info, Flame, Sparkles, AlertTriangle, ShieldCheck, Loader2, Star, Sliders } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useCart } from "@/shared/context/CartContext";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import { ProductoResenasModal } from "../componentes/ProductoResenasModal";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { StarRating } from "@/shared/components/ui/StarRating";
import { apiClient } from "@/shared/api/apiClient";
import { ventasService } from "@/features/ventas/servicios/ventasService";
import { categoriaProductosService } from "@/features/ventas/servicios/categoriaProductosService";
import { productosService } from "@/features/ventas/servicios/productosService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { adicionesService } from "@/features/compras/servicios/adicionesService";
import { wompiService } from "@/features/ventas/servicios/wompiService";
import FastFoodProductModal from "@/shared/components/ui/FastFoodProductModal";
import { getProductEmoji } from "@/shared/utils/foodEmojiUtils";

const defaultCategoryIcons = {
  "hamburguesas": { icon: "🍔", color: "from-yellow-400 to-orange-500" },
  "salchipapas": { icon: "🍟", color: "from-yellow-500 to-amber-600" },
  "perros calientes": { icon: "🌭", color: "from-orange-400 to-red-500" },
  "perros": { icon: "🌭", color: "from-orange-400 to-red-500" },
  "pollo": { icon: "🍗", color: "from-amber-500 to-orange-600" },
  "bebidas": { icon: "🥤", color: "from-blue-400 to-blue-600" },
  "refrescos": { icon: "🥤", color: "from-blue-400 to-blue-600" },
  "acompañamientos": { icon: "🥗", color: "from-green-400 to-green-600" },
  "combos": { icon: "🍱", color: "from-purple-400 to-purple-600" },
  "postres": { icon: "🍰", color: "from-pink-400 to-rose-500" },
  "helados": { icon: "🍦", color: "from-indigo-400 to-purple-500" },
  "entradas": { icon: "🌮", color: "from-emerald-400 to-teal-500" },
  "pizzas": { icon: "🍕", color: "from-red-500 to-amber-500" }
};

const getCategoryMeta = (nombre) => {
  const key = String(nombre || "").toLowerCase().trim();
  if (key.includes("hambur")) return { icon: "🍔", color: "from-yellow-400 to-orange-500" };
  if (key.includes("perro") || key.includes("hot dog")) return { icon: "🌭", color: "from-orange-400 to-red-500" };
  if (key.includes("salchipapa")) return { icon: "🍟", color: "from-yellow-500 to-amber-600" };
  if (key.includes("papa")) return { icon: "🍟", color: "from-yellow-500 to-amber-600" };
  if (key.includes("pollo") || key.includes("alitas") || key.includes("nugget")) return { icon: "🍗", color: "from-amber-500 to-orange-600" };
  if (key.includes("pizza")) return { icon: "🍕", color: "from-red-500 to-amber-500" };
  if (key.includes("combo")) return { icon: "🍱", color: "from-purple-400 to-purple-600" };
  if (key.includes("bebida") || key.includes("gaseosa") || key.includes("jugo") || key.includes("refresco")) return { icon: "🥤", color: "from-blue-400 to-blue-600" };
  if (key.includes("postre") || key.includes("torta") || key.includes("pastel")) return { icon: "🍰", color: "from-pink-400 to-rose-500" };
  if (key.includes("helado")) return { icon: "🍦", color: "from-indigo-400 to-purple-500" };
  if (key.includes("acompa")) return { icon: "🍟", color: "from-amber-400 to-orange-500" };
  if (key.includes("ensalada")) return { icon: "🥗", color: "from-green-400 to-green-600" };
  if (key.includes("entrada") || key.includes("snack") || key.includes("taco")) return { icon: "🌮", color: "from-emerald-400 to-teal-500" };
  return defaultCategoryIcons[key] || { icon: "🍽️", color: "from-red-400 to-red-600" };
};

const categoriasDefault = [
  { id: 1, nombre: "Perros Calientes", icon: "🌭", color: "from-orange-400 to-red-500" },
  { id: 2, nombre: "Combos", icon: "🍱", color: "from-purple-400 to-purple-600" },
  { id: 3, nombre: "Hamburguesas", icon: "🍔", color: "from-yellow-400 to-orange-500" },
  { id: 4, nombre: "Bebidas", icon: "🥤", color: "from-blue-400 to-blue-600" },
  { id: 5, nombre: "Salchipapas Gourmet", icon: "🍟", color: "from-yellow-500 to-amber-600" },
  { id: 6, nombre: "Acompañamientos", icon: "🍟", color: "from-amber-400 to-orange-600" }
];

const productosDefault = [
  { id: 10, idProducto: 10, nombre: "Hamburguesa Clásica Chazin", precio: 18000, categoria: 3, idCategoriaProducto: 3, imagen: "🍔", descripcion: "Pan brioche artesanal, carne 80/20, tocineta ahumada, queso cheddar, tomate, lechuga y salsas", stock: 25 },
  { id: 11, idProducto: 11, nombre: "Hamburguesa Doble Carne & Tocineta", precio: 25000, categoria: 3, idCategoriaProducto: 3, imagen: "🍔", descripcion: "Pan brioche, doble carne 80/20, doble tocineta ahumada, queso cheddar y cebolla blanca", stock: 20 },
  { id: 12, idProducto: 12, nombre: "Hamburguesa Pollo Crispy Gourmet", precio: 21000, categoria: 3, idCategoriaProducto: 3, imagen: "🍗", descripcion: "Pan brioche, pechuga de pollo crispy, queso mozzarella, lechuga, tomate y salsas", stock: 18 },
  { id: 13, idProducto: 13, nombre: "Perro Caliente Especial Americano", precio: 14000, categoria: 1, idCategoriaProducto: 1, imagen: "🌭", descripcion: "Pan perro, salchicha americana, tocineta crujiente, queso mozzarella y ripio", stock: 22 },
  { id: 14, idProducto: 14, nombre: "Perro Suizo Chazin", precio: 17000, categoria: 1, idCategoriaProducto: 1, imagen: "🌭", descripcion: "Pan perro, salchicha suiza ahumada, tocineta, queso mozzarella y cebolla blanca", stock: 20 },
  { id: 15, idProducto: 15, nombre: "Salchipapa Salvaje Gourmet", precio: 23000, categoria: 5, idCategoriaProducto: 5, imagen: "🍟", descripcion: "Papas francesas doradas, salchicha americana, salchicha suiza, tocineta y queso", stock: 25 },
  { id: 16, idProducto: 16, nombre: "Combo Pareja Chazin", precio: 38000, categoria: 2, idCategoriaProducto: 2, imagen: "🍱", descripcion: "2 hamburguesas clásicas con queso cheddar, papas a la francesa y 2 Coca-Cola 400ml", stock: 15 },
  { id: 17, idProducto: 17, nombre: "Gaseosa Coca-Cola 400ml", precio: 4500, categoria: 4, idCategoriaProducto: 4, imagen: "🥤", descripcion: "Gaseosa Coca-Cola sabor original 400ml fría", stock: 60 },
  { id: 18, idProducto: 18, nombre: "Gaseosa Manzana Postobón 400ml", precio: 4000, categoria: 4, idCategoriaProducto: 4, imagen: "🍎", descripcion: "Gaseosa sabor manzana Postobón 400ml refrescante", stock: 45 },
  { id: 19, idProducto: 19, nombre: "Agua Cristal sin Gas 500ml", precio: 3000, categoria: 4, idCategoriaProducto: 4, imagen: "💧", descripcion: "Agua pura de manantial sin gas 500ml", stock: 50 }
];

const adicionesDisponibles = [
  { idAdicion: 3, idInsumo: 18, nombre: "Extra Tocineta Ahumada (2 tiras)", precio: 3500, stockActual: 30, tipo: "Topping", imagen: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=500&auto=format&fit=crop&q=80" },
  { idAdicion: 4, idInsumo: 19, nombre: "Extra Queso Cheddar (2 lonchas)", precio: 2500, stockActual: 35, tipo: "Topping", imagen: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format&fit=crop&q=80" },
  { idAdicion: 5, idInsumo: 21, nombre: "Porción Papas a la Francesa (150g)", precio: 5000, stockActual: 40, tipo: "Acompañamiento", imagen: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80" },
  { idAdicion: 6, idInsumo: 24, nombre: "Porción Cebolla Caramelizada (50g)", precio: 2000, stockActual: 25, tipo: "Topping", imagen: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80" },
  { idAdicion: 7, idInsumo: 25, nombre: "Jalapeños Picantes Extra (40g)", precio: 2000, stockActual: 30, tipo: "Topping", imagen: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80" },
  { idAdicion: 8, idInsumo: 26, nombre: "Salsa Chazin Especial Adicional", precio: 1500, stockActual: 50, tipo: "Salsa", imagen: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500&auto=format&fit=crop&q=80" }
];

export const getAdicionImage = (ad) => {
  if (!ad) return "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80";
  if (typeof ad.imagen === "string" && ad.imagen.startsWith("http")) {
    return ad.imagen;
  }
  const name = String(ad.nombre || "").toLowerCase();
  if (name.includes("tocineta") || name.includes("bacon")) {
    return "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("queso") || name.includes("cheddar")) {
    return "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("papa") || name.includes("francesa")) {
    return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("cebolla")) {
    return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("jalapeño") || name.includes("jalapeno") || name.includes("picante")) {
    return "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80";
  }
  if (name.includes("salsa")) {
    return "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500&auto=format&fit=crop&q=80";
  }
  return "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80";
};

const fichasTecnicasDefault = {
  1: { ingredientes: ["Pan Brioche Artesanal", "Carne de Res 80/20 (150g)", "Tocineta Ahumada", "Queso Cheddar", "Lechuga Batavia", "Tomate Chonto", "Salsas de la Casa"], peso: "350g", tamano: "Regular", calorias: "~650 kcal", tiempoPreparacion: 10, rendimiento: "1 porción (350g)" },
  2: { ingredientes: ["Pan Brioche Artesanal", "Doble Carne de Res 80/20 (300g)", "Doble Tocineta Ahumada", "Doble Queso Cheddar", "Cebolla Caramelizada", "Salsas de la Casa"], peso: "540g", tamano: "Doble Grande", calorias: "~980 kcal", tiempoPreparacion: 12, rendimiento: "1 porción grande (540g)" },
  3: { ingredientes: ["Pan Brioche Artesanal", "Pechuga de Pollo Crispy Apanada", "Queso Mozzarella", "Lechuga Batavia", "Tomate Chonto", "Salsa Especial Tártara"], peso: "380g", tamano: "Regular", calorias: "~720 kcal", tiempoPreparacion: 11, rendimiento: "1 porción (380g)" },
  4: { ingredientes: ["Pan Perro Americano", "Salchicha Americana Premium", "Tocineta Ahumada", "Queso Mozzarella Rallado", "Ripio de Papa", "Salsas de la Casa"], peso: "290g", tamano: "Regular", calorias: "~540 kcal", tiempoPreparacion: 8, rendimiento: "1 porción (290g)" },
  5: { ingredientes: ["Pan Perro Americano", "Salchicha Suiza Ahumada", "Tocineta Ahumada", "Queso Mozzarella Fundido", "Cebolla Blanca Picada", "Ripio de Papa"], peso: "340g", tamano: "Especial", calorias: "~680 kcal", tiempoPreparacion: 9, rendimiento: "1 porción (340g)" },
  6: { ingredientes: ["Papas a la Francesa", "Salchicha Americana Picada", "Salchicha Suiza", "Tocineta Crujiente", "Queso Mozzarella Fundido", "Salsas Chazin"], peso: "560g", tamano: "Generosa", calorias: "~890 kcal", tiempoPreparacion: 12, rendimiento: "1 porción generosa (560g)" },
  7: { ingredientes: ["2 Hamburguesas Clásicas Chazin", "Porción Papas Francesas Grandes", "2 Gaseosas Coca-Cola 400ml"], peso: "1.6 kg", tamano: "Combo Pareja", calorias: "~1800 kcal", tiempoPreparacion: 14, rendimiento: "2 personas (1.6 kg combo)" },
  8: { ingredientes: ["Agua Carbonatada", "Jarabe de Maíz", "Caramelo Clase IV", "Cafeína"], peso: "400ml", tamano: "Individual", calorias: "170 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  9: { ingredientes: ["Agua Carbonatada", "Saborizante Manzana Postobón", "Azúcar", "Colorantes"], peso: "400ml", tamano: "Individual", calorias: "160 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  10: { ingredientes: ["Agua Manantial Cristal 100% Pura Sin Gas"], peso: "600ml", tamano: "Individual", calorias: "0 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (600ml)" },
  11: { ingredientes: ["Agua Carbonatada", "Azúcar", "Cafeína", "Extracto de Nuez de Cola"], peso: "400ml", tamano: "Individual", calorias: "165 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  12: { ingredientes: ["Agua Carbonatada", "Sabor Kola Colombiana", "Azúcar"], peso: "400ml", tamano: "Individual", calorias: "170 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  13: { ingredientes: ["Agua Carbonatada", "Sabor Lima-Limón Natural", "Azúcar"], peso: "400ml", tamano: "Individual", calorias: "155 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  14: { ingredientes: ["Agua Carbonatada", "Jugo de Toronja", "Azúcar", "Acidulante"], peso: "400ml", tamano: "Individual", calorias: "160 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  15: { ingredientes: ["Papas Seleccionadas Cortadas a la Francesa", "Sal Marina", "Aceite Vegetal"], peso: "150g", tamano: "Porción", calorias: "380 kcal", tiempoPreparacion: 6, rendimiento: "1 porción (150g)" },
  16: { ingredientes: ["Agua Carbonatada", "Color Caramelo IV", "Aspartamo", "Acesulfamo K"], peso: "400ml", tamano: "Individual", calorias: "0 kcal", tiempoPreparacion: 1, rendimiento: "1 porción (400ml)" },
  17: { ingredientes: ["Papas Corral Rústicas Gruesas", "Sal Marina", "Especias"], peso: "220g", tamano: "Grande", calorias: "450 kcal", tiempoPreparacion: 7, rendimiento: "1 porción grande (220g)" },
  18: { ingredientes: ["Papas Corral Rústicas Medianas", "Sal Marina"], peso: "150g", tamano: "Mediana", calorias: "310 kcal", tiempoPreparacion: 6, rendimiento: "1 porción mediana (150g)" },
  19: { ingredientes: ["Papas Rústicas en Casco con Piel", "Sal y Pimienta"], peso: "240g", tamano: "Grande", calorias: "420 kcal", tiempoPreparacion: 7, rendimiento: "1 porción grande (240g)" },
  20: { ingredientes: ["Papas Rústicas en Casco con Piel", "Sal"], peso: "160g", tamano: "Mediana", calorias: "290 kcal", tiempoPreparacion: 6, rendimiento: "1 porción mediana (160g)" },
  21: { ingredientes: ["Papa Natural Entera Cortada en Espiral", "Páprika", "Sal de Ajo"], peso: "200g", tamano: "Brocheta", calorias: "380 kcal", tiempoPreparacion: 8, rendimiento: "1 porción espiral (200g)" },
  22: { ingredientes: ["Papas Francesas Crujientes", "Chili con Carne Casero", "Queso Cheddar Fundido"], peso: "320g", tamano: "Cargada", calorias: "680 kcal", tiempoPreparacion: 8, rendimiento: "1 canastilla cargada (320g)" },
  23: { ingredientes: ["Papas Francesas con Chili y Queso Cheddar", "Gaseosa 400ml"], peso: "720g (combo)", tamano: "Combo", calorias: "820 kcal", tiempoPreparacion: 8, rendimiento: "1 combo individual completo" },
  24: { ingredientes: ["Papas Francesas Crujientes", "Tocineta Ahumada Picada", "Queso Cheddar Fundido"], peso: "300g", tamano: "Cargada", calorias: "690 kcal", tiempoPreparacion: 7, rendimiento: "1 canastilla cargada (300g)" },
  25: { ingredientes: ["Papas Francesas con Tocineta y Cheddar", "Gaseosa 400ml"], peso: "700g (combo)", tamano: "Combo", calorias: "830 kcal", tiempoPreparacion: 7, rendimiento: "1 combo individual completo" },
  26: { ingredientes: ["Pan Brioche Artesanal Sellado", "Carne Angus Premium 200g", "Queso Brie Fundido", "Reducción de Champiñones al Tartufo", "Cebolla Caramelizada"], peso: "430g", tamano: "Gourmet Especial", calorias: "~790 kcal", tiempoPreparacion: 12, rendimiento: "1 hamburguesa gourmet (430g)" }
};

export const isDrinkProduct = (item) => {
  if (!item) return false;
  const catId = item.idCategoriaProducto !== undefined ? item.idCategoriaProducto : item.categoria;
  if (catId === 4 || catId === "4") return true;
  const name = String(item.nombre || "").toLowerCase();
  const catName = String(item.categoriaNombre || item.categoria?.nombre || (typeof item.categoria === "string" ? item.categoria : "") || "").toLowerCase();
  const tipo = String(item.tipo || "").toLowerCase();
  return (
    tipo === "bebida" ||
    catName.includes("bebida") ||
    catName.includes("gaseosa") ||
    catName.includes("refresco") ||
    name.includes("gaseosa") ||
    name.includes("coca-cola") ||
    name.includes("coca cola") ||
    name.includes("postobón") ||
    name.includes("postobon") ||
    name.includes("pepsi") ||
    name.includes("colombiana") ||
    name.includes("sprite") ||
    name.includes("cuatro") ||
    name.includes("agua cristal") ||
    name.includes("cristal sin gas") ||
    name.includes("h2oh") ||
    name.includes("mr tea") ||
    name.includes("jugo") ||
    name.includes("hit")
  );
};

// Los complementos de la orden se cargan 100% en vivo desde la base de datos MySQL (activeProductos)
export const COMPLEMENTOS_ORDEN = [];

export const getIngredientesPersonalizables = (producto, ficha) => {
  if (!producto || isDrinkProduct(producto)) return [];

  const CANDIDATOS_BASE = [
    { id: "cebolla", nombre: "Cebolla", icono: "🧅", aliases: ["cebolla", "onion"] },
    { id: "salsas", nombre: "Salsas de la casa", icono: "🥫", aliases: ["salsa", "salsas", "sauce"] },
    { id: "tomate", nombre: "Tomate", icono: "🍅", aliases: ["tomate", "tomato"] },
    { id: "lechuga", nombre: "Lechuga", icono: "🥬", aliases: ["lechuga", "lettuce"] },
    { id: "queso", nombre: "Queso", icono: "🧀", aliases: ["queso", "cheddar", "mozzarella", "cheese"] },
    { id: "tocineta", nombre: "Tocineta", icono: "🥓", aliases: ["tocineta", "tocino", "bacon"] },
    { id: "ripio", nombre: "Ripio de papa", icono: "🍟", aliases: ["ripio", "papas ripio", "chips"] },
    { id: "jalapenos", nombre: "Jalapeños", icono: "🌶️", aliases: ["jalapeño", "jalapeno", "picante"] }
  ];

  let allIngStrings = [];
  if (ficha?.detalles && Array.isArray(ficha.detalles)) {
    allIngStrings.push(...ficha.detalles.map(d => String(d.insumo?.nombre || d.nombreInsumo || "").toLowerCase()));
  }
  if (ficha?.ingredientes && Array.isArray(ficha.ingredientes)) {
    allIngStrings.push(...ficha.ingredientes.map(s => String(s).toLowerCase()));
  }
  if (producto?.descripcion) {
    allIngStrings.push(String(producto.descripcion).toLowerCase());
  }
  const combinedText = allIngStrings.join(" ");

  // Filtrado estricto: solo ingredientes que realmente forman parte de este producto
  return CANDIDATOS_BASE.filter(c => c.aliases.some(alias => combinedText.includes(alias)));
};

function FichaTecnicaProductoCliente({ ficha, producto }) {
  const [open, setOpen] = useState(false);
  if (!ficha && !producto) return null;

  // Extract ingredients list from API format or default object
  let listaIngredientes = [];
  if (ficha?.detalles && Array.isArray(ficha.detalles) && ficha.detalles.length > 0) {
    listaIngredientes = ficha.detalles.map(d => {
      const nombre = d.insumo?.nombre || d.nombreInsumo || `Insumo #${d.idInsumo}`;
      const cant = d.cantidad ? ` (${d.cantidad} ${d.unidadMedida || d.insumo?.unidadMedida || 'und'})` : '';
      return `${nombre}${cant}`;
    });
  } else if (ficha?.ingredientes && Array.isArray(ficha.ingredientes)) {
    listaIngredientes = ficha.ingredientes;
  } else if (producto?.descripcion) {
    listaIngredientes = producto.descripcion.split(',').map(s => s.trim()).filter(Boolean);
  }

  const tiempoPrep = ficha?.tiempoPreparacion || 15;
  const rendimientoText = ficha?.rendimiento || ficha?.tamano || "1 porción";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden mt-3 bg-gray-50/50 dark:bg-gray-800/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-red-500" />
          Ingredientes y Preparación
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-50/80 dark:bg-red-950/30 rounded-xl p-2.5 text-center border border-red-100 dark:border-red-900/40">
              <p className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" /> Tiempo Estimado
              </p>
              <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-0.5">{tiempoPrep} minutos</p>
            </div>
            <div className="bg-amber-50/80 dark:bg-amber-950/30 rounded-xl p-2.5 text-center border border-amber-100 dark:border-amber-900/40">
              <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Rendimiento</p>
              <p className="text-sm font-black text-gray-900 dark:text-gray-100 mt-0.5">{rendimientoText}</p>
            </div>
          </div>

          {/* Ingredientes / Insumos */}
          <div>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-red-500" />
              Insumos e Ingredientes ({listaIngredientes.length}):
            </p>
            {listaIngredientes.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {listaIngredientes.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium bg-red-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-red-100 dark:border-gray-700 px-2.5 py-1 rounded-xl shadow-2xs"
                  >
                    🥗 {ing}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">Ingredientes frescos preparados al momento.</p>
            )}
          </div>

          {/* Procedimiento o especificaciones si existen */}
          {ficha?.procedimiento && ficha.procedimiento !== "n/A" && (
            <div className="pt-1">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Preparación:</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 italic line-clamp-2">{ficha.procedimiento}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ClienteLanding() {
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, getTotalItems, getSubtotal, getProductQuantityInCart } = useCart();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { success, error, confirmAction, confirmLogout } = useNotifications();

  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const categoryCarouselRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoryCarouselRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      categoryCarouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };
  const [showCart, setShowCart] = useState(false);
  const [showEmptyCartLoginModal, setShowEmptyCartLoginModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [checkoutNombre, setCheckoutNombre] = useState("");
  const [checkoutDireccion, setCheckoutDireccion] = useState("");
  const [checkoutMetodoPago, setCheckoutMetodoPago] = useState("wompi");
  const [checkoutEspecificaciones, setCheckoutEspecificaciones] = useState("");
  const [checkoutTipoEntrega, setCheckoutTipoEntrega] = useState("domicilio");
  const [checkoutEfectivoPaga, setCheckoutEfectivoPaga] = useState("");
  const [checkoutTransferReferencia, setCheckoutTransferReferencia] = useState("");
  const [checkoutTransferBanco, setCheckoutTransferBanco] = useState("Bancolombia");
  const [checkoutTarjetaNumero, setCheckoutTarjetaNumero] = useState("");
  const [isProcessingWompi, setIsProcessingWompi] = useState(false);

  const [showPedidos, setShowPedidos] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalInitialTab, setModalInitialTab] = useState("personalizar");
  const [showResenasModal, setShowResenasModal] = useState(false);
  const [productoParaResenas, setProductoParaResenas] = useState(null);
  const [ratingsMap, setRatingsMap] = useState({});

  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const [categoriasList, setCategoriasList] = useState([]);
  const [productosList, setProductosList] = useState([]);
  const [fichasMap, setFichasMap] = useState(fichasTecnicasDefault);

  // Manejador de flecha Atrás / Adelante del navegador (popstate) para cerrar modales sin salir de la página
  useEffect(() => {
    const handlePopState = () => {
      if (showCheckout) {
        setShowCheckout(false);
      } else if (showCart) {
        setShowCart(false);
      } else if (showProductModal) {
        setShowProductModal(false);
      } else if (showPedidos) {
        setShowPedidos(false);
      } else if (showResenasModal) {
        setShowResenasModal(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showCheckout, showCart, showProductModal, showPedidos, showResenasModal]);
  const [adicionesList, setAdicionesList] = useState(adicionesDisponibles);

  // Ref y desplazamiento suave para carrusel 'Complementa tu orden' en Carrito
  const complementosRef = useRef(null);
  const scrollComplementos = (direction) => {
    if (complementosRef.current) {
      const scrollAmount = direction === "left" ? -170 : 170;
      complementosRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAddComplemento = (item) => {
    const res = addToCart({
      id: item.idVariante || item.id || item.idProducto,
      idProducto: item.idProducto || item.id,
      idVariante: item.idVariante || item.id || item.idProducto,
      nombre: item.nombre,
      precio: Number(item.precio),
      cantidad: 1,
      stock: Number(item.stock !== undefined ? item.stock : 30),
      imagen: item.imagen,
      adiciones: [],
      personalizaciones: []
    });
    if (res && res.success === false) {
      error("Stock insuficiente", res.message || "No hay más unidades disponibles.");
    } else {
      success("¡Antojo agregado!", `${item.nombre} se sumó a tu orden.`);
    }
  };

  // Detectar retorno desde Wompi (si se completó pago vía checkout web directo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wompiTxId = params.get("id");
    if (wompiTxId) {
      window.history.replaceState({}, document.title, window.location.pathname);

      (async () => {
        try {
          const verificacion = await wompiService.verificarTransaccion(wompiTxId);
          if (verificacion && verificacion.aprobado) {
            success("¡Pago Aprobado con Wompi!", `Tu pedido ${verificacion.numeroVenta || ''} fue aprobado y enviado a cocina.`);
            clearCart();
            await fetchMyOrders();
            setShowPedidos(true);
          } else if (verificacion && verificacion.estado === 'PENDING') {
            success("Pago en Proceso", "Tu banco está verificando el pago. Te notificaremos en cuanto se confirme.");
            clearCart();
            await fetchMyOrders();
            setShowPedidos(true);
          } else {
            error("Pago No Completado", `La transacción fue ${verificacion?.estado || 'rechazada'}. Puedes intentar de nuevo.`);
          }
        } catch (err) {
          console.error("Error verificando transacción de retorno de Wompi:", err);
        }
      })();
    }
  }, []);

  // Fetch catalog categories & products dynamically from API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [catsRes, prodsRes, fichasRes, adicRes] = await Promise.allSettled([
          categoriaProductosService.getCategorias(),
          productosService.getProductos(),
          fichasTecnicasService.getFichas(),
          adicionesService.getAdiciones()
        ]);

        if (catsRes.status === "fulfilled" && Array.isArray(catsRes.value) && catsRes.value.length > 0) {
          const apiCats = catsRes.value
            .filter(c => (c.estado === 'Activo' || c.estado === 1 || c.estado === undefined))
            .filter(c => !['ssss', 'fghjk', 'dfg', 'test', '1', '3', '4', '5', '6', '7'].includes(c.nombre?.trim()?.toLowerCase?.()) && !c.nombre?.startsWith('__SISTEMA'))
            .map(c => {
              const meta = getCategoryMeta(c.nombre);
              return {
                id: c.id || c.idCategoriaProducto,
                idCategoriaProducto: c.idCategoriaProducto || c.id,
                nombre: c.nombre,
                icon: c.icon || meta.icon,
                color: meta.color
              };
            });
          setCategoriasList(apiCats.length > 0 ? apiCats : categoriasDefault);
        } else {
          setCategoriasList(categoriasDefault);
        }

        if (prodsRes.status === "fulfilled" && Array.isArray(prodsRes.value) && prodsRes.value.length > 0) {
          const apiProds = prodsRes.value
            .filter(p => p.estado === 'Activo' || p.estado === 1 || p.estado === undefined)
            .map(p => ({
              id: p.id || p.idProducto,
              idProducto: p.idProducto || p.id,
              nombre: p.nombre,
              precio: Number(p.precio) || 0,
              stock: Number(p.stock !== undefined ? p.stock : (p.stockActual !== undefined ? p.stockActual : 25)),
              categoria: p.categoria || (p.categoriaProducto ? p.categoriaProducto.nombre : ''),
              idCategoriaProducto: p.idCategoriaProducto,
              descripcion: p.descripcion,
              imagen: p.imagen,
              variantes: p.variantes || [],
              eventos: p.eventos || []
            }));
          setProductosList(apiProds);

          // Fetch ratings
          const pIds = apiProds.map(p => p.id || p.idProducto).join(',');
          apiClient.get(`/resenas/ratings?ids=${pIds}`)
            .then(res => { if (res) setRatingsMap(res); })
            .catch(() => {});
        } else {
          setProductosList(productosDefault);
        }

        if (fichasRes.status === "fulfilled" && Array.isArray(fichasRes.value)) {
          const fMap = { ...fichasTecnicasDefault };
          fichasRes.value.forEach(f => {
            if (f.idProducto) {
              fMap[f.idProducto] = f;
            }
          });
          setFichasMap(fMap);
        }

        if (adicRes.status === "fulfilled" && Array.isArray(adicRes.value) && adicRes.value.length > 0) {
          const apiAdics = adicRes.value.map(a => ({
            idAdicion: a.idAdicion || a.id,
            nombre: a.nombre,
            precio: parseFloat(a.precio || 0),
            stockActual: a.stockActual || 50,
            tipo: a.tipo || "Adición",
            estado: a.estado !== undefined ? a.estado : 1,
            imagen: (a.imagen && typeof a.imagen === "string" && a.imagen.startsWith("http")) ? a.imagen : getAdicionImage(a)
          }));
          setAdicionesList(apiAdics);
        }
      } catch (e) {
        console.warn("Error cargando catálogo dinámico en ClienteLanding:", e);
        setCategoriasList(categoriasDefault);
        setProductosList(productosDefault);
      }
    };

    fetchCatalog();
  }, []);

  // Fetch client orders from backend + local history synchronization
  const fetchMyOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setLoadingPedidos(true);
      const userId = user?.idUsuario || user?.id || user?._id;
      const storageKey = `mis_pedidos_${userId || 'guest'}`;
      let localHistory = [];
      try {
        localHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
      } catch (e) {
        localHistory = [];
      }

      let backendOrders = [];
      try {
        const data = await ventasService.getVentas();
        if (data && Array.isArray(data)) {
          backendOrders = data.filter(v => 
            v.idUsuario === userId || 
            v.idCliente === user?.idCliente ||
            v.clienteNombre === `${user?.nombre || ''} ${user?.apellidos || ''}`.trim()
          );
        }
      } catch (err) {
        console.log("No se pudieron cargar pedidos del backend:", err);
      }

      // Map backend orders by id and code
      const backendMap = new Map();
      backendOrders.forEach(o => {
        const id = o.idVenta || o.id;
        const code = o.numeroVenta || o.codigoPedido;
        if (id) backendMap.set(String(id), o);
        if (code) backendMap.set(String(code), o);
      });

      const mergedPedidos = [];
      const processedBackendIds = new Set();

      // Check all orders the client previously placed
      for (const localOrd of localHistory) {
        const matched = backendMap.get(String(localOrd.id)) || backendMap.get(String(localOrd.numeroVenta));
        if (matched) {
          processedBackendIds.add(String(matched.idVenta || matched.id));
          let currentEstado = matched.estado || matched.estadoEntrega || 'Por Aprobar';
          if (matched.estadoAprobacion === 'RECHAZADO' || matched.estadoEntrega === 'CANCELADO') {
            currentEstado = 'Anulada';
          } else if (matched.estadoAprobacion === 'PENDIENTE') {
            currentEstado = 'Por Aprobar';
          } else if (matched.estadoEntrega === 'PREPARANDO') {
            currentEstado = 'En Preparación';
          } else if (matched.estadoEntrega === 'LISTO') {
            currentEstado = 'Listo';
          } else if (matched.estadoEntrega === 'ENTREGADO') {
            currentEstado = 'Completada';
          }

          localOrd.estado = currentEstado;
          mergedPedidos.push({
            id: matched.idVenta || matched.id || localOrd.id,
            numeroVenta: matched.numeroVenta || localOrd.numeroVenta,
            fecha: matched.fechaVenta ? new Date(matched.fechaVenta).toLocaleString('es-CO') : localOrd.fecha,
            items: localOrd.items || [],
            total: matched.total || localOrd.total,
            estado: currentEstado
          });
        } else {
          localOrd.estado = 'Anulada';
          mergedPedidos.push({
            ...localOrd,
            estado: 'Anulada'
          });
        }
      }

      // Add any orders from backend that were not in localHistory
      for (const o of backendOrders) {
        const idStr = String(o.idVenta || o.id);
        if (!processedBackendIds.has(idStr)) {
          let currentEstado = o.estado || o.estadoEntrega || 'Por Aprobar';
          if (o.estadoAprobacion === 'RECHAZADO' || o.estadoEntrega === 'CANCELADO') {
            currentEstado = 'Anulada';
          } else if (o.estadoAprobacion === 'PENDIENTE') {
            currentEstado = 'Por Aprobar';
          } else if (o.estadoEntrega === 'PREPARANDO') {
            currentEstado = 'En Preparación';
          } else if (o.estadoEntrega === 'LISTO') {
            currentEstado = 'Listo';
          } else if (o.estadoEntrega === 'ENTREGADO') {
            currentEstado = 'Completada';
          }

          let itemsList = [{ nombre: 'Pedido de comida', cantidad: 1, precio: o.total }];
          if (o.detalles && o.detalles.length > 0) {
            itemsList = o.detalles.map(d => ({
              nombre: d.observaciones || `Producto #${d.idVariante}`,
              cantidad: d.cantidad,
              precio: d.precioUnitario
            }));
          }

          const newEntry = {
            id: o.idVenta || o.id,
            numeroVenta: o.numeroVenta || `VEN-${String(o.idVenta || o.id).padStart(4, '0')}`,
            fecha: o.fechaVenta ? new Date(o.fechaVenta).toLocaleString('es-CO') : 'Hoy',
            items: itemsList,
            total: o.total,
            estado: currentEstado
          };

          localHistory.unshift(newEntry);
          mergedPedidos.push(newEntry);
        }
      }

      localStorage.setItem(storageKey, JSON.stringify(localHistory.slice(0, 50)));
      setPedidos(mergedPedidos);
    } catch (err) {
      console.log("Error cargando pedidos:", err);
    } finally {
      setLoadingPedidos(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [isAuthenticated, user]);

  const handleCancelarPedido = async (pedidoId) => {
    const isConfirmed = await confirmAction(
      "¿Cancelar este pedido?",
      "Esta acción cambiará el estado del pedido a Cancelado. ¿Deseas continuar?"
    );
    if (!isConfirmed) return;

    try {
      await ventasService.cancelarVenta(pedidoId);
      success("Pedido cancelado", "Tu pedido fue cancelado exitosamente.");
      await fetchMyOrders();
    } catch (err) {
      console.warn("Error cancelando pedido:", err);
      try {
        await ventasService.updateEstadoVenta(pedidoId, "CANCELADO");
        success("Pedido cancelado", "Tu pedido fue cancelado exitosamente.");
        await fetchMyOrders();
      } catch (err2) {
        error("Error al cancelar pedido", err2.message || "No se pudo cancelar el pedido.");
      }
    }
  };

  const activeCategorias = categoriasList.length > 0 ? categoriasList : categoriasDefault;
  const activeProductos = productosList.length > 0 ? productosList : productosDefault;
  const activeAdiciones = adicionesList.length > 0 ? adicionesList : adicionesDisponibles;

  // Filtrado estricto para que las adiciones sean toppings de comida reales, activos y sin duplicados
  const foodAdiciones = activeAdiciones.filter(ad =>
    !isDrinkProduct(ad) &&
    ad.idAdicion !== 1 &&
    ad.idAdicion !== 2 &&
    (ad.estado === undefined || ad.estado === 1 || ad.estado === true || ad.estado === "1")
  );

  // Las 3 bebidas oficiales listas para acompañar
  const fallbackBebidas = [
    { id: 17, idProducto: 17, nombre: "Gaseosa Coca-Cola 400ml", precio: 4500, imagen: "🥤", stock: 60 },
    { id: 18, idProducto: 18, nombre: "Gaseosa Manzana Postobón 400ml", precio: 4000, imagen: "🍎", stock: 45 },
    { id: 19, idProducto: 19, nombre: "Agua Cristal sin Gas 500ml", precio: 3000, imagen: "💧", stock: 50 }
  ];
  const bebidasDisponibles = (() => {
    const list = activeProductos.filter(p => isDrinkProduct(p));
    return list.length > 0 ? list : fallbackBebidas;
  })();

  // ═══ Complementos INTELIGENTES: recomienda según lo que ya hay en el carrito ═══
  // Categorías consideradas "plato principal" (NO se sugieren como complemento)
  const CATEGORIAS_PLATO_PRINCIPAL = ["hamburguesas", "perros calientes", "combos"];

  const complementosOrden = useMemo(() => {
    // IDs de productos ya en el carrito para no duplicar sugerencias
    const cartProductIds = new Set(cart.map(item => item.idProducto || item.id));

    // Detectar qué tipo de productos ya tiene el carrito
    const cartHasDrink = cart.some(item => isDrinkProduct(item));
    const cartHasSide = cart.some(item => {
      const n = (item.nombre || "").toLowerCase();
      return n.includes("papas") || n.includes("porción") || n.includes("porcion") || n.includes("salchipapa");
    });

    // Helper: determinar si un producto es "plato principal"
    const isPlatoPrincipal = (p) => {
      const catName = String(p.categoriaNombre || p.categoria || "").toLowerCase().trim();
      const prodName = (p.nombre || "").toLowerCase();
      return CATEGORIAS_PLATO_PRINCIPAL.some(cp =>
        catName.includes(cp) || prodName.includes("hamburguesa") || prodName.includes("perro caliente") || prodName.includes("perro suizo") || prodName.includes("combo")
      );
    };

    // Helper: generar badge inteligente
    const getBadge = (p) => {
      const n = (p.nombre || "").toLowerCase();
      if (n.includes("coca-cola") || n.includes("coca cola")) return "Más Vendido";
      if (n.includes("colombiana")) return "La Nuestra";
      if (n.includes("manzana")) return "Tradicional";
      if (n.includes("pepsi")) return "Pepsi";
      if (n.includes("sprite")) return "Lima-Limón";
      if (n.includes("cuatro") || n.includes("quatro")) return "Toronja";
      if (n.includes("cristal") || n.includes("agua")) return "100% Pura";
      if (n.includes("malteada") || n.includes("milkshake")) return "Cremoso";
      if (n.includes("jugo") || n.includes("hit")) return "Natural";
      if (n.includes("papas")) return "Favorito";
      if (n.includes("salchipapa")) return "Para Picar";
      if (n.includes("nugget")) return "Crunchy";
      if (n.includes("postre") || n.includes("brownie") || n.includes("torta") || n.includes("helado")) return "Dulce";
      if (n.includes("arepa") || n.includes("empanada") || n.includes("dedito")) return "Entrada";
      if (isDrinkProduct(p)) return "Refrescante";
      return "Complemento";
    };

    // Helper: generar descripción corta inteligente
    const getDescripcion = (p) => {
      if (p.descripcion && p.descripcion.length <= 40) return p.descripcion;
      const n = (p.nombre || "").toLowerCase();
      if (isDrinkProduct(p)) return "Bebida personal bien fría";
      if (n.includes("papas")) return "Crocantes y doradas";
      if (n.includes("salchipapa")) return "Para compartir";
      if (n.includes("nugget")) return "Crujientes y jugosos";
      if (n.includes("postre") || n.includes("brownie") || n.includes("helado")) return "Para el antojo dulce";
      if (n.includes("arepa") || n.includes("empanada")) return "Entrada rápida";
      return p.descripcion || "Complemento ideal";
    };

    // Helper: generar tamaño/label secundario
    const getTamano = (p) => {
      const n = (p.nombre || "").toLowerCase();
      if (isDrinkProduct(p)) return "400 ml";
      if (n.includes("150g")) return "150g";
      if (n.includes("porción") || n.includes("porcion")) return "1 porción";
      return "";
    };

    // Helper: convertir producto a objeto de complemento
    const toComplemento = (p) => {
      const firstVar = Array.isArray(p.variantes) && p.variantes.length > 0 ? p.variantes[0] : null;
      const pId = p.idProducto || p.id;
      return {
        id: p.id || p.idProducto,
        idProducto: pId,
        idVariante: firstVar?.idVariante || p.id || pId,
        nombre: p.nombre,
        descripcion: getDescripcion(p),
        tamano: getTamano(p),
        precio: Number(p.precio),
        badge: getBadge(p),
        imagen: p.imagen,
        stock: Number(p.stock !== undefined ? p.stock : 30)
      };
    };

    // ── Separar productos candidatos (todo lo que NO sea plato principal) ──
    const candidatos = activeProductos.filter(p => {
      const pId = p.idProducto || p.id;
      // Excluir productos ya en el carrito
      if (cartProductIds.has(pId)) return false;
      // Excluir platos principales
      if (isPlatoPrincipal(p)) return false;
      return true;
    });

    // Separar en: bebidas, entradas/sides, otros
    const bebidas = candidatos.filter(p => isDrinkProduct(p));
    const entradas = candidatos.filter(p => {
      if (isDrinkProduct(p)) return false;
      const n = (p.nombre || "").toLowerCase();
      return n.includes("papas") || n.includes("porción") || n.includes("porcion") || n.includes("salchipapa") ||
             n.includes("nugget") || n.includes("arepa") || n.includes("empanada") || n.includes("dedito");
    });
    const otros = candidatos.filter(p => !isDrinkProduct(p) && !entradas.includes(p));

    // ── Orden inteligente según contexto del carrito ──
    const ordenados = [];

    if (!cartHasDrink) {
      // Si NO tiene bebida: bebidas primero (sugerir que agregue una)
      // Priorizar Coca-Cola como primera opción
      const cocaCola = bebidas.find(b => (b.nombre || "").toLowerCase().includes("coca-cola"));
      if (cocaCola) ordenados.push(toComplemento(cocaCola));
      bebidas.filter(b => b !== cocaCola).forEach(b => ordenados.push(toComplemento(b)));
      entradas.forEach(e => ordenados.push(toComplemento(e)));
      otros.forEach(o => ordenados.push(toComplemento(o)));
    } else if (!cartHasSide) {
      // Si tiene bebida pero NO tiene acompañamiento: entradas primero
      entradas.forEach(e => ordenados.push(toComplemento(e)));
      otros.forEach(o => ordenados.push(toComplemento(o)));
      bebidas.forEach(b => ordenados.push(toComplemento(b)));
    } else {
      // Ya tiene bebida y acompañamiento: mostrar lo que quede (otros, bebidas extra, entradas extra)
      otros.forEach(o => ordenados.push(toComplemento(o)));
      entradas.forEach(e => ordenados.push(toComplemento(e)));
      bebidas.forEach(b => ordenados.push(toComplemento(b)));
    }

    return ordenados;
  }, [activeProductos, cart]);

  // Live ticker for real-time countdown
  const [currentLiveTime, setCurrentLiveTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentLiveTime(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper ultra-preciso de Evento Activo (Burger Fest / Drops / Promos con Vigencia en Tiempo Real)
  const getActiveEvent = (producto) => {
    if (!producto) return null;
    const eventos = Array.isArray(producto.eventos) ? producto.eventos : [];
    if (eventos.length === 0) return null;

    const now = new Date(currentLiveTime);

    // Filter events that are active and not expired
    const validEvents = eventos.filter((e) => {
      if (e.estado !== 1 && e.estado !== "Activo") return false;
      if (e.fechaFin) {
        const finDate = new Date(`${e.fechaFin}T23:59:59`);
        if (now > finDate) return false;
      }
      if (e.fechaInicio) {
        const inicioDate = new Date(`${e.fechaInicio}T00:00:00`);
        if (now < inicioDate) return false;
      }
      return true;
    });

    if (validEvents.length === 0) return null;
    const evt = validEvents[0];

    const regularPrice = Number(producto.precio || 0);
    let eventPrice = regularPrice;
    if (evt.nuevoPrecio && Number(evt.nuevoPrecio) > 0) {
      eventPrice = Number(evt.nuevoPrecio);
    } else if (evt.descuento && Number(evt.descuento) > 0) {
      eventPrice = regularPrice * (1 - Number(evt.descuento) / 100);
    }

    const savings = Math.max(0, regularPrice - eventPrice);
    const discountPercent = regularPrice > 0 && savings > 0 
      ? Math.round((savings / regularPrice) * 100) 
      : (evt.descuento ? Math.round(Number(evt.descuento)) : 0);

    let formattedDate = "";
    let diasRestantes = null;
    let horasRestantes = null;
    let urgente = false;
    let countdownLabel = "";

    if (evt.fechaFin) {
      try {
        const parts = String(evt.fechaFin).split('T')[0].split('-');
        if (parts.length === 3) {
          const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          const monthName = months[parseInt(parts[1], 10) - 1] || parts[1];
          formattedDate = `${parseInt(parts[2], 10)} de ${monthName}`;
        }
        const finDate = new Date(`${evt.fechaFin}T23:59:59`);
        const ms = finDate.getTime() - now.getTime();
        diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
        horasRestantes = Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
        urgente = diasRestantes <= 3;
        countdownLabel = diasRestantes === 1
          ? `¡Último día! (${horasRestantes}h)`
          : diasRestantes === 0
          ? `¡Termina hoy!`
          : `Quedan ${diasRestantes} días`;
      } catch (e) {}
    }

    return {
      ...evt,
      nombre: evt.nombreEvento || evt.nombre || "Edición Especial",
      regularPrice,
      eventPrice,
      savings,
      discountPercent,
      formattedDate,
      tipo: evt.tipoEvento || "EDICION_LIMITADA",
      vigencia: {
        diasRestantes,
        horasRestantes,
        urgente,
        label: countdownLabel || (formattedDate ? `Hasta ${formattedDate}` : "Tiempo Limitado")
      }
    };
  };

  const eventProductsCount = useMemo(() => {
    return activeProductos.filter(p => Boolean(getActiveEvent(p))).length;
  }, [activeProductos]);

  const productosFiltrados = activeProductos.filter((p) => {
    const prodName = (p.nombre || "").toLowerCase();
    const prodDesc = (p.descripcion || "").toLowerCase();
    const matchSearch = !searchTerm || prodName.includes(searchTerm.toLowerCase()) || prodDesc.includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (!selectedCategoria) return true;

    if (selectedCategoria === "eventos") {
      return Boolean(getActiveEvent(p));
    }

    const selectedCatObj = activeCategorias.find(c => (c.id === selectedCategoria) || (c.idCategoriaProducto === selectedCategoria));
    const catName = (selectedCatObj?.nombre || "").toLowerCase().trim();
    const prodCatName = (p.categoriaNombre || p.categoria || "").toLowerCase().trim();

    const matchCatId = (p.categoria === selectedCategoria) || (p.idCategoriaProducto === selectedCategoria) || (String(p.categoria) === String(selectedCategoria));
    const matchCatName = catName && (prodCatName === catName || prodCatName.includes(catName) || catName.includes(prodCatName));

    const singularCatName = catName.endsWith("es") ? catName.slice(0, -2) : (catName.endsWith("s") ? catName.slice(0, -1) : catName);
    const matchSubcategory = singularCatName.length >= 3 && (
      prodCatName.includes(singularCatName) || prodName.includes(singularCatName)
    );

    return matchCatId || matchCatName || matchSubcategory;
  });

  const handleProductClick = async (producto) => {
    const prodId = producto.id || producto.idProducto;
    let ficha = fichasMap[prodId] || fichasTecnicasDefault[prodId];
    if (!ficha) {
      try {
        const fetchedFicha = await fichasTecnicasService.getFichaByProducto(prodId);
        if (fetchedFicha) {
          ficha = fetchedFicha;
          setFichasMap(prev => ({ ...prev, [prodId]: fetchedFicha }));
        }
      } catch (e) {
        console.warn("Ficha no encontrada para producto", prodId);
      }
    }

    setProductoSeleccionado({
      producto,
      cantidad: 1,
      adicionesSeleccionadas: [],
      bebidasSeleccionadas: [],
      ingredientesRemovidos: [],
      ficha: ficha || fichasTecnicasDefault[prodId] || null
    });
    setShowProductModal(true);
  };

  const handleToggleRemoverIngrediente = (nombreIngrediente) => {
    if (!productoSeleccionado) return;
    const currentRemovidos = productoSeleccionado.ingredientesRemovidos || [];
    const isRemoved = currentRemovidos.includes(nombreIngrediente);
    const updated = isRemoved
      ? currentRemovidos.filter(n => n !== nombreIngrediente)
      : [...currentRemovidos, nombreIngrediente];

    setProductoSeleccionado({
      ...productoSeleccionado,
      ingredientesRemovidos: updated
    });
  };

  const handleBebidaToggle = (bebida) => {
    if (!productoSeleccionado) return;
    const bebId = bebida.id || bebida.idProducto;
    const currentBebidas = productoSeleccionado.bebidasSeleccionadas || [];
    const exists = currentBebidas.find(b => (b.id || b.idProducto) === bebId);

    if (exists) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        bebidasSeleccionadas: currentBebidas.filter(b => (b.id || b.idProducto) !== bebId)
      });
    } else {
      setProductoSeleccionado({
        ...productoSeleccionado,
        bebidasSeleccionadas: [
          ...currentBebidas,
          {
            id: bebId,
            idProducto: bebId,
            nombre: bebida.nombre,
            precio: Number(bebida.precio || 0),
            cantidad: 1,
            imagen: bebida.imagen || "🥤",
            stock: Number(bebida.stock !== undefined ? bebida.stock : (bebida.stockActual !== undefined ? bebida.stockActual : 30))
          }
        ]
      });
    }
  };

  const handleBebidaQuantityChange = (bebId, delta, e) => {
    if (e) e.stopPropagation();
    if (!productoSeleccionado) return;
    const currentBebidas = productoSeleccionado.bebidasSeleccionadas || [];
    const existing = currentBebidas.find(b => (b.id || b.idProducto) === bebId);
    if (!existing) return;

    if (existing.cantidad + delta <= 0) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        bebidasSeleccionadas: currentBebidas.filter(b => (b.id || b.idProducto) !== bebId)
      });
    } else {
      const stockTot = Number(existing.stock !== undefined ? existing.stock : 30);
      const inCart = getProductQuantityInCart(bebId);
      const maxAvailable = Math.max(0, stockTot - inCart);
      if (delta > 0 && existing.cantidad >= maxAvailable) {
        error("Stock insuficiente", `Solo hay ${stockTot} unidades disponibles de ${existing.nombre}.`);
        return;
      }

      setProductoSeleccionado({
        ...productoSeleccionado,
        bebidasSeleccionadas: currentBebidas.map(b => {
          if ((b.id || b.idProducto) === bebId) {
            return { ...b, cantidad: b.cantidad + delta };
          }
          return b;
        })
      });
    }
  };

  const handleAdicionToggle = (adicion) => {
    if (!productoSeleccionado) return;
    const exists = productoSeleccionado.adicionesSeleccionadas.find((a) => a.idAdicion === adicion.idAdicion);
    if (exists) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.filter((a) => a.idAdicion !== adicion.idAdicion)
      });
    } else {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: [
          ...productoSeleccionado.adicionesSeleccionadas,
          { idAdicion: adicion.idAdicion, nombre: adicion.nombre, precio: adicion.precio, cantidad: 1 }
        ]
      });
    }
  };

  const handleAdicionQuantityChange = (idAdicion, delta, e) => {
    if (e) e.stopPropagation();
    if (!productoSeleccionado) return;
    const existing = productoSeleccionado.adicionesSeleccionadas.find((a) => a.idAdicion === idAdicion);
    if (!existing) return;

    if (existing.cantidad + delta <= 0) {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.filter((a) => a.idAdicion !== idAdicion)
      });
    } else {
      setProductoSeleccionado({
        ...productoSeleccionado,
        adicionesSeleccionadas: productoSeleccionado.adicionesSeleccionadas.map((a) => {
          if (a.idAdicion === idAdicion) {
            return { ...a, cantidad: a.cantidad + delta };
          }
          return a;
        })
      });
    }
  };

  const handleAddToCart = () => {
    if (!productoSeleccionado) return;
    const prod = productoSeleccionado.producto;
    let basePrice = Number(prod.precio || 0);
    const evtPrecio = prod.eventos?.find(e => e.tipoEvento === "Promoción Precio");
    const evtDesc = prod.eventos?.find(e => e.tipoEvento === "Descuento");
    if (evtPrecio) {
      basePrice = Number(evtPrecio.nuevoPrecio);
    } else if (evtDesc) {
      basePrice = basePrice * (1 - Number(evtDesc.descuento) / 100);
    }

    const removidos = productoSeleccionado.ingredientesRemovidos || [];
    const personalizacionesList = removidos.map(r => `Sin ${r.toLowerCase()}`);
    const personalizacionesStr = personalizacionesList.join(", ");

    const itemToAdd = {
      id: prod.id || prod.idProducto,
      idProducto: prod.idProducto || prod.id,
      nombre: prod.nombre,
      precio: basePrice,
      cantidad: productoSeleccionado.cantidad || 1,
      stock: Number(prod.stock !== undefined ? prod.stock : (prod.stockActual !== undefined ? prod.stockActual : 25)),
      imagen: prod.imagen,
      personalizaciones: personalizacionesList,
      observaciones: personalizacionesStr,
      observacion: personalizacionesStr,
      adiciones: (productoSeleccionado.adicionesSeleccionadas || []).map((a) => ({
        idAdicion: a.idAdicion,
        nombre: a.nombre,
        precio: Number(a.precio) || 0,
        cantidad: Number(a.cantidad) || 1,
        imagen: a.imagen || "🥫"
      }))
    };

    const res = addToCart(itemToAdd);
    if (res && res.success === false) {
      error("Stock insuficiente", res.message || "No hay suficiente stock disponible para este producto.");
      return;
    }

    // Agregar al carrito cualquier bebida seleccionada como producto independiente
    const bebidasToAdd = productoSeleccionado.bebidasSeleccionadas || [];
    let bebidasCount = 0;
    for (const b of bebidasToAdd) {
      const bRes = addToCart({
        id: b.id || b.idProducto,
        idProducto: b.idProducto || b.id,
        nombre: b.nombre,
        precio: Number(b.precio),
        cantidad: Number(b.cantidad) || 1,
        stock: Number(b.stock !== undefined ? b.stock : 30),
        imagen: b.imagen || "🥤",
        adiciones: []
      });
      if (!bRes || bRes.success !== false) {
        bebidasCount += (Number(b.cantidad) || 1);
      }
    }

    setShowProductModal(false);
    setProductoSeleccionado(null);
    const msg = bebidasCount > 0
      ? `${prod.nombre} y ${bebidasCount} bebida(s) agregadas a tu carrito`
      : `${prod.nombre} se agregó a tu carrito`;
    success("¡Producto agregado!", msg);
  };

  const handleClientModalConfirm = ({
    producto,
    cantidad,
    adiciones,
    bebidas,
    personalizaciones,
    observacion,
    sabor
  }) => {
    let basePrice = Number(producto.precio || 0);
    const evtPrecio = producto.eventos?.find(e => e.tipoEvento === "Promoción Precio" || e.tipo === "Promoción Precio");
    const evtDesc = producto.eventos?.find(e => e.tipoEvento === "Descuento" || e.tipo === "Descuento");
    if (evtPrecio && Number(evtPrecio.nuevoPrecio) > 0) {
      basePrice = Number(evtPrecio.nuevoPrecio);
    } else if (evtDesc && Number(evtDesc.descuento) > 0) {
      basePrice = basePrice * (1 - Number(evtDesc.descuento) / 100);
    }

    const isDrink = isDrinkProduct(producto);
    const finalProdName = producto.nombrePersonalizado || (sabor ? `${producto.nombre} (${sabor})` : (producto.saborSeleccionado ? `${producto.nombre} (${producto.saborSeleccionado})` : producto.nombre));

    const itemToAdd = {
      id: producto.id || producto.idProducto,
      idProducto: producto.idProducto || producto.id,
      nombre: finalProdName,
      precio: basePrice,
      cantidad: Number(cantidad) || 1,
      stock: Number(producto.stock !== undefined ? producto.stock : 25),
      imagen: producto.imagen,
      personalizaciones: personalizaciones || [],
      observaciones: observacion || "",
      observacion: observacion || "",
      adiciones: (isDrink ? [] : (adiciones || [])).map((a) => ({
        idAdicion: a.idAdicion || a.id,
        nombre: a.nombre,
        precio: Number(a.precio) || 0,
        cantidad: Number(a.cantidad) || 1,
        imagen: a.imagen || ""
      }))
    };

    const res = addToCart(itemToAdd);
    if (res && res.success === false) {
      error("Stock insuficiente", res.message || "No hay suficiente stock disponible para este producto.");
      return;
    }

    let bebidasCount = 0;
    if (!isDrink && Array.isArray(bebidas)) {
      for (const b of bebidas) {
        const bRes = addToCart({
          id: b.id || b.idProducto,
          idProducto: b.idProducto || b.id,
          nombre: b.nombre,
          precio: Number(b.precio),
          cantidad: Number(b.cantidad) || 1,
          stock: Number(b.stock !== undefined ? b.stock : 30),
          imagen: b.imagen || "🥤",
          adiciones: []
        });
        if (!bRes || bRes.success !== false) {
          bebidasCount += (Number(b.cantidad) || 1);
        }
      }
    }

    setShowProductModal(false);
    setProductoSeleccionado(null);
    const msg = bebidasCount > 0
      ? `${finalProdName} y ${bebidasCount} bebida(s) agregadas a tu carrito`
      : `${finalProdName} se agregó a tu carrito`;
    success("¡Producto agregado!", msg);
  };

  const handleAbrirCheckout = () => {
    if (cart.length === 0) return;
    if (!isAuthenticated) {
      setShowEmptyCartLoginModal(true);
      return;
    }
    setCheckoutNombre(user?.nombre ? `${user.nombre} ${user.apellidos || ''}` : "");
    const rawDir = user?.direccion || "";
    let cleanDir = rawDir;
    if (typeof rawDir === 'string' && rawDir.trim().startsWith('{')) {
      try { const p = JSON.parse(rawDir); cleanDir = p.direccion || rawDir; } catch (e) { /* keep raw */ }
    }
    setCheckoutDireccion(cleanDir);
    setCheckoutEspecificaciones("");
    setCheckoutMetodoPago("wompi");
    setCheckoutTipoEntrega("domicilio");
    setCheckoutEfectivoPaga("");
    setCheckoutTransferReferencia("");
    setCheckoutTransferBanco("Bancolombia");
    setCheckoutTarjetaNumero("");
    window.history.pushState({ modal: "checkout" }, "");
    setShowCheckout(true);
  };

  const clientSubtotal = getSubtotal();
  const fidelidadCliente = user?.fidelidad || {};
  const pedidosCount = pedidos.length;
  const tipoFidelidad = fidelidadCliente.tipo || user?.tipo || (pedidosCount >= 9 ? "VIP" : pedidosCount >= 6 ? "Frecuente" : pedidosCount >= 3 ? "Regular" : "Nuevo");
  const discountPercent = Number(fidelidadCliente.descuentoPorcentaje !== undefined ? fidelidadCliente.descuentoPorcentaje : (tipoFidelidad === "VIP" ? 15 : tipoFidelidad === "Frecuente" ? 10 : tipoFidelidad === "Regular" ? 5 : 0));
  const comprasCiclo = fidelidadCliente.comprasCiclo !== undefined ? fidelidadCliente.comprasCiclo : (pedidosCount % 3);
  const comprasFaltantes = fidelidadCliente.comprasFaltantes !== undefined ? fidelidadCliente.comprasFaltantes : (3 - (comprasCiclo % 3));
  const siguienteNivel = fidelidadCliente.siguienteNivel || (tipoFidelidad === "Nuevo" ? "Regular" : tipoFidelidad === "Regular" ? "Frecuente" : "VIP");

  // Dynamic real-time calculation of remaining days in hero banner
  const heroVenceObj = fidelidadCliente.fechaVencimientoNivel || fidelidadCliente.vence ? new Date(fidelidadCliente.fechaVencimientoNivel || fidelidadCliente.vence) : null;
  let heroDiasRestantes = fidelidadCliente.diasRestantes !== undefined ? fidelidadCliente.diasRestantes : (tipoFidelidad !== "Nuevo" ? 30 : null);
  let heroEnGracia = Boolean(fidelidadCliente.enGracia);
  let heroDiasGracia = fidelidadCliente.diasGraciaRestantes || 0;

  if (tipoFidelidad !== "Nuevo" && heroVenceObj && !isNaN(heroVenceObj.getTime())) {
    const diffMs = heroVenceObj.getTime() - Date.now();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      heroDiasRestantes = diffDays;
      heroEnGracia = false;
      heroDiasGracia = 0;
    } else {
      const diasExpirado = Math.abs(diffDays);
      const limiteGracia = tipoFidelidad === "VIP" ? 15 : (tipoFidelidad === "Frecuente" ? 10 : 0);
      if (limiteGracia > 0 && diasExpirado <= limiteGracia) {
        heroEnGracia = true;
        heroDiasGracia = Math.max(1, limiteGracia - diasExpirado);
        heroDiasRestantes = 0;
      } else {
        heroDiasRestantes = 0;
      }
    }
  }

  const clientDiscountMonto = discountPercent > 0 ? Math.round(clientSubtotal * (discountPercent / 100)) : 0;
  const totalCheckout = Math.max(0, clientSubtotal - clientDiscountMonto);
  const vueltoEfectivo = Math.max(0, Number(checkoutEfectivoPaga || 0) - totalCheckout);

  const handleConfirmarPedido = async () => {
    if (checkoutTipoEntrega === "domicilio" && !checkoutDireccion.trim()) {
      error("Dirección requerida", "Por favor ingresa la dirección de entrega.");
      return;
    }

    // Validación estricta de Pago Obligatorio y Política de Efectivo / Cambio Máximo
    if (checkoutMetodoPago === "efectivo") {
      const montoEfectivo = Number(checkoutEfectivoPaga || 0);
      if (!checkoutEfectivoPaga || montoEfectivo <= 0) {
        error("Pago requerido", `Debes indicar el monto en efectivo con el que vas a pagar (debe ser igual o superior a $${totalCheckout.toLocaleString('es-CO')}).`);
        return;
      }
      if (montoEfectivo < totalCheckout) {
        error("Monto insuficiente", `El efectivo entregado ($${montoEfectivo.toLocaleString('es-CO')}) es menor al total a pagar ($${totalCheckout.toLocaleString('es-CO')}).`);
        return;
      }
      const vuelto = montoEfectivo - totalCheckout;
      const MAX_CAMBIO_PERMITIDO = 100000;
      if (vuelto > MAX_CAMBIO_PERMITIDO) {
        error(
          "Límite de cambio excedido",
          `Por seguridad de los domiciliarios y política de caja, el cambio máximo en efectivo es de $${MAX_CAMBIO_PERMITIDO.toLocaleString('es-CO')}. Tu vuelto sería de $${vuelto.toLocaleString('es-CO')}. Para montos mayores te sugerimos pagar vía Transferencia o Tarjeta.`
        );
        return;
      }
    } else if (checkoutMetodoPago === "transferencia") {
      if (!checkoutTransferReferencia.trim()) {
        error("Comprobante requerido", "Debes ingresar el número de referencia del comprobante de transferencia para verificar el pago.");
        return;
      }
    } else if (checkoutMetodoPago === "tarjeta") {
      const cleanCard = checkoutTarjetaNumero.replace(/\s+/g, '');
      if (!cleanCard || cleanCard.length < 15) {
        error("Tarjeta requerida", "Ingresa los 16 dígitos de tu tarjeta para procesar el pago.");
        return;
      }
    }

    // ── FLUJO WOMPI (PAGOS EN LÍNEA: PSE, NEQUI, TARJETAS, BANCOLOMBIA) ──
    if (checkoutMetodoPago === "wompi") {
      setIsProcessingWompi(true);
      try {
        const tipoEntregaNormalizado = checkoutTipoEntrega === "llevar" ? "Recoger" : "Domicilio";
        const ventaPayload = {
          idCliente: user?.idCliente || null,
          idUsuario: user?.idUsuario || user?.id || user?._id,
          subtotal: clientSubtotal,
          descuentoAplicado: clientDiscountMonto,
          total: totalCheckout,
          tipoVenta: checkoutTipoEntrega === "domicilio" ? "DOMICILIO" : "PUNTO_DE_VENTA",
          tipoEntrega: tipoEntregaNormalizado,
          metodoPago: "Wompi",
          direccion: checkoutDireccion,
          estadoEntrega: "PENDIENTE",
          observaciones: JSON.stringify({
            tipoEntrega: tipoEntregaNormalizado,
            metodoPago: "Wompi",
            direccion: checkoutTipoEntrega === "domicilio" ? checkoutDireccion : "Recoger en Local",
            especificaciones: checkoutEspecificaciones || "",
            clienteNombre: checkoutNombre || (user?.nombre ? `${user.nombre} ${user.apellidos || ''}` : "Cliente"),
            productos: cart.map(item => {
              const itemAdds = (item.adiciones || []).reduce((s, a) => s + ((Number(a.precio) || 0) * Number(a.cantidad || 1)), 0);
              const lineTotal = ((Number(item.precio) || 0) + itemAdds) * (item.cantidad || 1);
              return {
                id: item.id,
                idVariante: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: Number(item.precio) || 0,
                total: lineTotal,
                observaciones: item.observacion || item.observaciones || item.especificaciones || "",
                adiciones: (item.adiciones || []).map(a => ({
                  idAdicion: a.idAdicion || a.id,
                  nombre: a.nombre,
                  precio: Number(a.precio) || 0,
                  cantidad: Number(a.cantidad || 1)
                }))
              };
            })
          }),
          detalles: cart.map(item => {
            const itemAdds = (item.adiciones || []).reduce((s, a) => s + ((Number(a.precio) || 0) * Number(a.cantidad || 1)), 0);
            const lineTotal = ((Number(item.precio) || 0) + itemAdds) * (item.cantidad || 1);
            return {
              idVariante: item.id || 1,
              cantidad: item.cantidad,
              precioUnitario: Number(item.precio) || 0,
              subtotal: lineTotal,
              idAdiciones: (item.adiciones || []).map(a => a.idAdicion || a.id),
              adiciones: item.adiciones || [],
              observacion: item.observacion || item.observaciones || "",
              observaciones: item.nombre + (item.adiciones && item.adiciones.length > 0 ? ` (+${item.adiciones.map(a => a.nombre).join(', ')})` : '')
            };
          })
        };

        // 1. Crear intención y obtener firma SHA-256 en el backend
        const intencion = await wompiService.crearIntencion(ventaPayload);

        // Ocultar modal propio para que el modal oficial de Wompi sea 100% visible sin conflicto de z-index
        setShowCheckout(false);

        // 2. Abrir el Widget oficial de Wompi (con fallback a Checkout Web si el widget es bloqueado)
        let transaction = null;
        try {
          transaction = await wompiService.abrirWidget({
            referencia: intencion.referencia,
            montoEnCentavos: intencion.montoEnCentavos,
            moneda: intencion.moneda,
            firma: intencion.firma,
            publicKey: intencion.publicKey,
            customerData: {
              email: user?.email || "",
              nombre: checkoutNombre || `${user?.nombre || ''} ${user?.apellidos || ''}`.trim() || "Cliente",
              telefono: user?.telefono || ""
            }
          });
        } catch (widgetErr) {
          console.warn("Widget embebido no disponible o bloqueado por navegador, activando Checkout Web:", widgetErr);
          const directUrl = wompiService.generarUrlDirecta({
            referencia: intencion.referencia,
            montoEnCentavos: intencion.montoEnCentavos,
            moneda: intencion.moneda,
            firma: intencion.firma,
            publicKey: intencion.publicKey
          });
          const win = window.open(directUrl, "_blank");
          if (win) {
            success("Pasarela Wompi Abierta", "Se abrió la pasarela oficial de Wompi en una nueva pestaña para completar tu pago de forma segura.");
            clearCart();
            setShowCart(false);
            return;
          }
          throw widgetErr;
        }

        // 3. Evaluar resultado retornado por Wompi
        if (transaction && transaction.id) {
          const verificacion = await wompiService.verificarTransaccion(transaction.id);

          if (verificacion.aprobado) {
            const orderId = verificacion.ventaId || intencion.ventaId || Date.now();
            const orderCode = verificacion.numeroVenta || intencion.numeroVenta || `VEN-${String(orderId).padStart(4, '0')}`;

            try {
              const userId = user?.idUsuario || user?.id || user?._id;
              const storageKey = `mis_pedidos_${userId || 'guest'}`;
              const localHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
              localHistory.unshift({
                id: orderId,
                numeroVenta: orderCode,
                fecha: new Date().toLocaleString('es-CO'),
                items: cart.map(it => ({
                  nombre: it.nombre + (it.adiciones && it.adiciones.length > 0 ? ` (+${it.adiciones.map(a => a.nombre).join(', ')})` : ''),
                  cantidad: it.cantidad,
                  precio: it.precio
                })),
                total: totalCheckout,
                estado: 'En Preparación'
              });
              localStorage.setItem(storageKey, JSON.stringify(localHistory.slice(0, 50)));
            } catch (storageErr) {
              console.warn("No se pudo guardar pedido en historial local:", storageErr);
            }

            success("¡Pago Aprobado con Wompi!", `Tu pedido ${orderCode} fue aprobado y enviado a cocina.`);
            clearCart();
            setShowCart(false);
            await fetchMyOrders();
            setShowPedidos(true);
          } else if (verificacion.estado === 'PENDING') {
            success("Pago en Proceso", "Tu pago está siendo verificado por tu banco. Te notificaremos en cuanto se confirme.");
            clearCart();
            setShowCart(false);
            await fetchMyOrders();
            setShowPedidos(true);
          } else {
            setShowCheckout(true);
            error("Pago Rechazado", `La transacción fue ${verificacion.estado || 'rechazada'}. Puedes intentar con otro medio de pago.`);
          }
        } else if (transaction && transaction.status === 'REDIRECTED') {
          return;
        } else if (!transaction || transaction.status === 'CLOSED_WITHOUT_RESULT') {
          setShowCheckout(true);
          error("Pago cancelado", "Cerraste la pasarela antes de completar el pago.");
        }
      } catch (wompiErr) {
        setShowCheckout(true);
        console.error("Error en flujo de Wompi:", wompiErr);
        const detail = wompiErr?.message || "No se pudo conectar con Wompi o el servidor";
        error("Error en Wompi", detail);
      } finally {
        setIsProcessingWompi(false);
      }
      return;
    }

    const confirmed = await confirmAction(
      "Confirmar Pedido",
      `Total a pagar: $${totalCheckout.toLocaleString('es-CO')}. ¿Deseas confirmar tu pedido?`,
      "Sí, confirmar"
    );

    if (confirmed) {
      try {
        const tipoEntregaNormalizado = checkoutTipoEntrega === "llevar" ? "Recoger" : "Domicilio";
        const metodoPagoNormalizado = checkoutMetodoPago === "tarjeta" ? "Tarjeta" : checkoutMetodoPago === "transferencia" ? "Transferencia" : "Efectivo";

        const ventaPayload = {
          idCliente: user?.idCliente || null,
          idUsuario: user?.idUsuario || user?.id || user?._id,
          subtotal: clientSubtotal,
          descuentoAplicado: clientDiscountMonto,
          total: totalCheckout,
          tipoVenta: checkoutTipoEntrega === "domicilio" ? "DOMICILIO" : "PUNTO_DE_VENTA",
          tipoEntrega: tipoEntregaNormalizado,
          metodoPago: metodoPagoNormalizado,
          direccion: checkoutDireccion,
          estadoEntrega: "PENDIENTE",
          observaciones: JSON.stringify({
            tipoEntrega: tipoEntregaNormalizado,
            metodoPago: metodoPagoNormalizado,
            direccion: checkoutTipoEntrega === "domicilio" ? checkoutDireccion : "Recoger en Local",
            especificaciones: checkoutEspecificaciones || "",
            efectivoConCuanto: checkoutEfectivoPaga || "",
            vueltoEfectivo: vueltoEfectivo || 0,
            transferenciaReferencia: checkoutTransferReferencia || "",
            transferenciaBanco: checkoutTransferBanco || "",
            tarjetaNumero: checkoutTarjetaNumero ? `****${checkoutTarjetaNumero.replace(/\s/g, '').slice(-4)}` : "",
            codigoPedido: `VEN-${String(Date.now()).slice(-4)}`,
            productos: cart.map(item => {
              const itemAdds = (item.adiciones || []).reduce((s, a) => s + ((Number(a.precio) || 0) * Number(a.cantidad || 1)), 0);
              const lineTotal = ((Number(item.precio) || 0) + itemAdds) * (item.cantidad || 1);
              return {
                id: item.id,
                idVariante: item.id,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precioUnitario: Number(item.precio) || 0,
                total: lineTotal,
                observaciones: item.observacion || item.observaciones || item.especificaciones || "",
                adiciones: (item.adiciones || []).map(a => ({
                  idAdicion: a.idAdicion || a.id,
                  nombre: a.nombre,
                  precio: Number(a.precio) || 0,
                  cantidad: Number(a.cantidad || 1)
                }))
              };
            })
          }),
          detalles: cart.map(item => {
            const itemAdds = (item.adiciones || []).reduce((s, a) => s + ((Number(a.precio) || 0) * Number(a.cantidad || 1)), 0);
            const lineTotal = ((Number(item.precio) || 0) + itemAdds) * (item.cantidad || 1);
            return {
              idVariante: item.id || 1,
              cantidad: item.cantidad,
              precioUnitario: Number(item.precio) || 0,
              subtotal: lineTotal,
              idAdiciones: (item.adiciones || []).map(a => a.idAdicion || a.id),
              adiciones: item.adiciones || [],
              observacion: item.observacion || item.observaciones || "",
              observaciones: item.nombre + (item.adiciones && item.adiciones.length > 0 ? ` (+${item.adiciones.map(a => a.nombre).join(', ')})` : '')
            };
          })
        };

        const nuevaVentaRes = await ventasService.createVenta(ventaPayload);
        
        // Save to client's local orders history so it is preserved even if deleted from DB
        try {
          const userId = user?.idUsuario || user?.id || user?._id;
          const storageKey = `mis_pedidos_${userId || 'guest'}`;
          const localHistory = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const orderId = nuevaVentaRes?.idVenta || nuevaVentaRes?.id || Date.now();
          const orderCode = nuevaVentaRes?.numeroVenta || `VEN-${String(orderId).padStart(4, '0')}`;
          
          localHistory.unshift({
            id: orderId,
            numeroVenta: orderCode,
            fecha: new Date().toLocaleString('es-CO'),
            items: cart.map(it => ({
              nombre: it.nombre + (it.adiciones && it.adiciones.length > 0 ? ` (+${it.adiciones.map(a => a.nombre).join(', ')})` : ''),
              cantidad: it.cantidad,
              precio: it.precio
            })),
            total: totalCheckout,
            estado: 'Por Aprobar'
          });
          localStorage.setItem(storageKey, JSON.stringify(localHistory.slice(0, 50)));
        } catch (storageErr) {
          console.warn("No se pudo guardar pedido en historial local:", storageErr);
        }

        success("¡Pedido realizado exitosamente!", "Tu pedido fue registrado y está pendiente de aprobación.");
        clearCart();
        setShowCheckout(false);
        setShowCart(false);
        await fetchMyOrders();
        setShowPedidos(true);
      } catch (err) {
        console.error("Error confirmando pedido:", err);
        error("Error al procesar pedido", err.message || "No se pudo conectar con el servidor");
      }
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      clearCart();
      setShowCart(false);
      setShowPedidos(false);
      setShowProductModal(false);
      success("Sesión cerrada", "Has salido del sistema correctamente");
      navigate("/");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "En Preparación":
      case "PREPARANDO":
      case "En preparación":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800";
      case "Listo":
      case "LISTO":
      case "Completada":
      case "ENTREGADO":
      case "Entregado":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
      case "Anulada":
      case "CANCELADO":
      case "Rechazado":
      case "RECHAZADO":
        return "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800";
      case "Por Aprobar":
      case "PENDIENTE":
      case "Pendiente":
      default:
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 dark:border-b dark:border-gray-800 shadow-md sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm border border-gray-100">
                <img
                  src={logoImg}
                  alt="Chazin Food"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "50% 56%" }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Chazin Food</h1>
                  {isAuthenticated && (
                    <FidelidadBadge
                      tipo={tipoFidelidad}
                      descuento={discountPercent}
                      enGracia={fidelidadCliente.enGracia}
                      size="sm"
                    />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? `¡Bienvenido, ${user?.nombre}!` : "Bienvenido a Chazin Food"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                title="Cambiar Modo"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate("/perfil")}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                  >
                    <User className="w-5 h-5 text-[#f05454]" />
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      fetchMyOrders();
                      setShowPedidos(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium cursor-pointer"
                  >
                    <Package className="w-5 h-5 text-red-500" />
                    <span className="hidden sm:inline">Mis Pedidos</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium text-sm cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
              )}

              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-md font-semibold text-sm cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                    {getTotalItems()}
                  </span>
                )}
                <span className="hidden sm:inline">Carrito</span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white py-10 md:py-14 shadow-inner">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">¡El sabor auténtico de Chazin Food!</h2>
          <p className="text-sm sm:text-lg text-red-100 font-medium">Haz tu pedido online y recíbelo fresco en tu puerta</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-3 border border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre de producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-0 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* Banner de Fidelidad del Cliente */}
      {isAuthenticated && (
        <div className="w-full px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20 border border-amber-200 dark:border-amber-900/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                {tipoFidelidad === "VIP" ? "🥇" : tipoFidelidad === "Frecuente" ? "🥈" : tipoFidelidad === "Regular" ? "🥉" : "🌱"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-orange-900 dark:text-orange-300">
                    Membresía {tipoFidelidad}
                  </span>
                  {discountPercent > 0 && (
                    <span className="px-2 py-0.5 bg-[#f05454] text-white text-[10px] font-black rounded-lg">
                      {discountPercent}% OFF activo
                    </span>
                  )}
                  {heroEnGracia && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-lg flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Periodo de Gracia: {heroDiasGracia}d</span>
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>
                    Racha: <strong>{comprasCiclo} de 3</strong>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-[#f05454] font-bold">
                    {comprasFaltantes === 0 
                      ? "¡Meta alcanzada! 🎉" 
                      : tipoFidelidad === "VIP"
                        ? `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? 'compra' : 'compras'} para renovar`
                        : `Faltan ${comprasFaltantes} ${comprasFaltantes === 1 ? 'compra' : 'compras'} para subir a ${siguienteNivel}`}
                  </span>
                  {tipoFidelidad !== "Nuevo" && heroDiasRestantes !== null && !heroEnGracia && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>Vigencia: {heroDiasRestantes} {heroDiasRestantes === 1 ? 'día restante' : 'días restantes'}</span>
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ver Beneficios y Racha</span>
            </button>
          </div>
        </div>
      )}

      {/* Categorías Carousel */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Categorías</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Explora nuestro menú</p>
        </div>

        {/* Carousel Wrapper with Left & Right Buttons */}
        <div className="relative flex items-center gap-2 sm:gap-3 w-full">
          {/* Left Button */}
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            aria-label="Anterior categoría"
            className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer z-10"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Horizontal Carousel Container */}
          <div
            ref={categoryCarouselRef}
            className="flex-1 flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
            style={{
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategoria(null)}
              style={{ scrollSnapAlign: "start" }}
              className={`shrink-0 w-28 sm:w-32 p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                selectedCategoria === null
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105 font-bold"
                  : "bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 dark:bg-gray-800/60 shadow-xs">
                <div className="text-3xl">🍽️</div>
              </div>
              <p className="text-xs font-semibold truncate w-full">Todos</p>
            </button>

            {/* Quick Filter Pill: Edición Especial / Eventos */}
            {eventProductsCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedCategoria("eventos")}
                style={{ scrollSnapAlign: "start" }}
                className={`shrink-0 w-32 sm:w-36 p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer relative overflow-hidden ${
                  selectedCategoria === "eventos"
                    ? "bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-purple-500/30 scale-105 font-bold"
                    : "bg-white dark:bg-gray-900 dark:text-gray-200 border-2 border-purple-300/60 dark:border-purple-600/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 shadow-xs"
                }`}
              >
                <div className="absolute top-1 right-1 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                  {eventProductsCount} DROP
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/20 dark:bg-purple-900/40 shadow-xs text-2xl">
                  🔥
                </div>
                <p className="text-xs font-black truncate w-full" style={selectedCategoria === "eventos" ? { color: '#fff' } : { color: '#a855f7' }}>
                  Edición Evento
                </p>
              </button>
            )}

            {activeCategorias.map((cat) => {
              const isSelected = selectedCategoria === cat.id || selectedCategoria === cat.idCategoriaProducto;
              return (
                <button
                  key={cat.id || cat.idCategoriaProducto || cat.nombre}
                  type="button"
                  onClick={() => setSelectedCategoria(cat.id || cat.idCategoriaProducto)}
                  style={{ scrollSnapAlign: "start" }}
                  className={`shrink-0 w-28 sm:w-32 p-3.5 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/25 scale-105 font-bold"
                      : "bg-white dark:bg-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-xl overflow-hidden bg-white/30 dark:bg-gray-800/60 shadow-xs border border-gray-100 dark:border-gray-700">
                    {cat.icon?.includes("/") || cat.icon?.includes(".") ? (
                      <img src={cat.icon} alt={cat.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl">{cat.icon || getCategoryMeta(cat.nombre).icon}</div>
                    )}
                  </div>
                  <p className="text-xs font-semibold leading-tight line-clamp-2 text-center w-full" title={cat.nombre}>
                    {cat.nombre}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Button */}
          <button
            type="button"
            onClick={() => scrollCategories("right")}
            aria-label="Siguiente categoría"
            className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center cursor-pointer z-10"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Productos */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {selectedCategoria === "eventos" ? (
                <>
                  <span>🔥 Edición Especial & Eventos Gastronómicos</span>
                  <span className="text-xs font-black bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Tiempo Limitado
                  </span>
                </>
              ) : selectedCategoria ? (
                activeCategorias.find((c) => (c.id === selectedCategoria || c.idCategoriaProducto === selectedCategoria))?.nombre
              ) : (
                "Menú Principal"
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {selectedCategoria === "eventos"
                ? "Platillos conmemorativos de edición limitada, recetas exclusivas y ahorros directos del festival"
                : "Preparados al instante con los ingredientes más frescos"}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((producto) => {
            const hasRealImage = producto.imagen && (producto.imagen.includes('/') || producto.imagen.includes('.'));
            const activeEvent = getActiveEvent(producto);
            return (
              <div
                key={producto.id || producto.idProducto}
                onClick={() => {
                  setModalInitialTab("personalizar");
                  handleProductClick(producto);
                }}
                className={`bg-white dark:bg-gray-900 rounded-3xl shadow-md hover:shadow-2xl transition-all overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-2 duration-300 relative ${
                  activeEvent
                    ? "border-2 border-purple-500/50 dark:border-purple-500/60 shadow-purple-500/15 dark:shadow-purple-900/25 ring-2 ring-amber-400/30"
                    : "border border-gray-100 dark:border-gray-800"
                }`}
              >
                {/* ═══ FAST FOOD EVENT BANNER (BURGER FEST / EDICIÓN LIMITADA) ═══ */}
                {activeEvent && (
                  <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-purple-700 text-white font-black text-[10.5px] uppercase tracking-wider py-1.5 px-3 flex items-center justify-between shadow-md relative z-20">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse shrink-0" />
                      <span className="truncate max-w-[170px] sm:max-w-[210px]">{activeEvent.nombre}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9.5px] font-bold text-amber-200 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span className={activeEvent.vigencia?.urgente ? "animate-pulse font-black text-amber-300" : ""}>
                        {activeEvent.vigencia?.label ? activeEvent.vigencia.label : (activeEvent.formattedDate ? `Hasta ${activeEvent.formattedDate}` : "Limitado")}
                      </span>
                    </div>
                  </div>
                )}

                {/* ═══ ESCENARIO GOURMET AMBIENTAL DUAL-LAYER (ENCUADRE 100% PERFECTO & SOMBRA 3D) ═══ */}
                <div className="relative h-48 sm:h-52 w-full bg-gray-950 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-800/80">
                  {/* Capa 1: Glow ambiental difuminado con los colores vivos de la comida */}
                  {hasRealImage ? (
                    <>
                      <img
                        src={producto.imagen}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-35 dark:opacity-45 saturate-200 pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-red-500/10 to-transparent pointer-events-none" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-red-950/40 to-gray-950" />
                  )}

                  {/* Capa 2: Comida centrada en primer plano (100% visible, sin cortes, con sombra 3D flotante) */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center p-3">
                    {hasRealImage ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="max-h-[145px] sm:max-h-[155px] w-auto max-w-[88%] object-contain drop-shadow-[0_16px_22px_rgba(0,0,0,0.6)] group-hover:scale-108 transition-transform duration-500 ease-out select-none"
                      />
                    ) : (
                      <div className="text-7xl group-hover:scale-110 transition-transform duration-300 select-none drop-shadow-xl">
                        {getProductEmoji(producto.nombre)}
                      </div>
                    )}
                  </div>

                  {/* Viñeta sutil inferior */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                  {/* Badges superiores: Categoría a la izquierda, Personalizar a la derecha */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
                    {activeEvent ? (
                      <span className="bg-gradient-to-r from-purple-600 to-rose-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 border border-white/20">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                        {activeEvent.tipo === "Descuento"
                          ? `-${activeEvent.discountPercent}% OFF`
                          : activeEvent.tipo === "Promoción Precio"
                          ? "Precio Promo"
                          : activeEvent.tipo === "Añadir Insumos"
                          ? "+ Toppings Gratis"
                          : activeEvent.tipo === "COMBO_ESPECIAL"
                          ? "Combo Festivo"
                          : activeEvent.tipo === "PROMOCION_2X1"
                          ? "Promo 2x1"
                          : "Edición Especial"}
                      </span>
                    ) : producto.categoria ? (
                      <span className="bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        {producto.categoria}
                      </span>
                    ) : null}
                  </div>

                  <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 group-hover:bg-[#f05454] transition-all shadow-md">
                    <Sliders className="w-3 h-3 text-[#f05454] group-hover:text-white" />
                    <span>Personalizar</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 group-hover:text-[#f05454] transition-colors line-clamp-1">
                      {producto.nombre}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {producto.descripcion || "Platillo gourmet preparado con ingredientes frescos de primera calidad."}
                    </p>
                    
                    {/* Rating Stars Summary */}
                    <div className="mt-2.5 flex items-center justify-between">
                      {(() => {
                        const pId = producto.id || producto.idProducto;
                        const rInfo = ratingsMap[pId];
                        if (rInfo && rInfo.total > 0) {
                          return (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalInitialTab("resenas");
                                handleProductClick(producto);
                              }}
                              className="flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer group/rate"
                              title="Ver opiniones y calificaciones de comensales"
                            >
                              <StarRating value={rInfo.promedio} readonly size="xs" />
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{rInfo.promedio.toFixed(1)}</span>
                              <span className="text-[10.5px] text-gray-400">({rInfo.total})</span>
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover/rate:opacity-100 transition-opacity">
                                • Calificar
                              </span>
                            </div>
                          );
                        }
                        return (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalInitialTab("resenas");
                              handleProductClick(producto);
                            }}
                            className="text-[11px] text-gray-400 hover:text-amber-500 flex items-center gap-1 transition cursor-pointer font-medium"
                          >
                            <Star className="w-3.5 h-3.5" />
                            <span>Sin reseñas • Calificar</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col">
                    {activeEvent ? (
                      <>
                        {activeEvent.tipo === "Añadir Insumos" ? (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-0.5">
                              🎁 Toppings Extra Gratis
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 dark:text-gray-500 line-through font-semibold">
                              ${activeEvent.regularPrice.toLocaleString()}
                            </span>
                            {activeEvent.discountPercent > 0 && (
                              <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-0.5">
                                <Zap className="w-3 h-3 fill-emerald-500" />
                                {activeEvent.discountPercent}% OFF
                              </span>
                            )}
                            {activeEvent.savings > 0 && (
                              <span className="text-[10.5px] font-extrabold text-amber-600 dark:text-amber-400">
                                Ahorras ${activeEvent.savings.toLocaleString('es-CO')}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-red-600 to-amber-600 bg-clip-text text-transparent">
                          ${activeEvent.eventPrice.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <p className="text-2xl font-black text-red-600 dark:text-red-400">${producto.precio.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(producto);
                    }}
                    className={`w-full py-3 text-white rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] ${
                      activeEvent
                        ? "bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 shadow-purple-600/25"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {activeEvent ? (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        Aprovechar Edición Especial
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Inspeccionar y Agregar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* ═══ MASTER FAST FOOD PRODUCT CUSTOMIZATION MODAL (EL MEJOR MODAL DEL MERCADO) ═══ */}
      <FastFoodProductModal
        isOpen={Boolean(showProductModal && productoSeleccionado)}
        onClose={() => {
          setShowProductModal(false);
          setProductoSeleccionado(null);
        }}
        producto={productoSeleccionado?.producto}
        ficha={
          productoSeleccionado?.ficha ||
          (productoSeleccionado?.producto &&
            (fichasMap[productoSeleccionado.producto.id] ||
              fichasMap[productoSeleccionado.producto.idProducto] ||
              fichasTecnicasDefault[productoSeleccionado.producto.id]))
        }
        allAdiciones={foodAdiciones.length > 0 ? foodAdiciones : activeAdiciones}
        allBebidas={bebidasDisponibles}
        ratingsInfo={
          productoSeleccionado?.producto
            ? ratingsMap[productoSeleccionado.producto.id || productoSeleccionado.producto.idProducto]
            : null
        }
        onOpenResenas={() => {
          if (productoSeleccionado?.producto) {
            setProductoParaResenas(productoSeleccionado.producto);
            setShowResenasModal(true);
          }
        }}
        onConfirm={handleClientModalConfirm}
        mode="cliente"
        initialTab={modalInitialTab}
      />

      {/* MODAL CARRITO */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full p-5 sm:p-6 shadow-2xl flex flex-col justify-between border-l border-gray-100 dark:border-gray-800 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tu Carrito de Compras</h3>
                {cart.length > 0 && (
                  <span className="text-[11px] bg-red-100 dark:bg-red-950/60 text-[#f05454] dark:text-red-400 font-black px-2 py-0.5 rounded-full">
                    {cart.reduce((acc, it) => acc + (it.cantidad || 1), 0)} items
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition cursor-pointer"
                title="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Center Body: Items List + Complementa tu Orden */}
            <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>
                  <p className="text-xs text-gray-400">Agrega deliciosos productos de nuestro menú</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-2.5">
                    {cart.map((item, index) => {
                      const itemKey = item.cartItemId || `${item.id}-${index}`;
                      const prodStock = Number(item.stock !== undefined ? item.stock : 25);
                      const totalInCartForProd = getProductQuantityInCart(item.id || item.idProducto);

                      return (
                        <div key={itemKey} className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shadow-2xs">
                          {item.imagen && typeof item.imagen === "string" && item.imagen.startsWith("http") ? (
                            <img src={item.imagen} alt={item.nombre} className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-2xs border border-gray-100 dark:border-gray-700" />
                          ) : (
                            <div className="text-3xl shrink-0">{item.imagen || "🍔"}</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{item.nombre}</h4>
                            {item.adiciones && item.adiciones.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.adiciones.map((a, aIdx) => (
                                  <span key={aIdx} className="text-[10.5px] bg-rose-50 dark:bg-rose-950/40 text-[#F05454] dark:text-rose-300 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                                    <img src={getAdicionImage(a)} alt="" className="w-3.5 h-3.5 rounded-full object-cover inline-block" />
                                    +{a.cantidad > 1 ? `${a.cantidad}x ` : ""}{a.nombre} (+${((Number(a.precio) || 0) * (Number(a.cantidad) || 1)).toLocaleString("es-CO")})
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.personalizaciones && item.personalizaciones.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.personalizaciones.map((p, pIdx) => (
                                  <span key={pIdx} className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                                    🚫 {p}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs font-black text-red-600 dark:text-red-400 mt-1">${Number(item.precio).toLocaleString("es-CO")}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => updateQuantity(item.cartItemId || item.id, -1)}
                              className="w-7 h-7 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer active:scale-95 transition"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                            <button
                              onClick={() => {
                                if (totalInCartForProd >= prodStock) {
                                  error("Límite de stock", `Solo hay ${prodStock} unidades disponibles de ${item.nombre}.`);
                                } else {
                                  updateQuantity(item.cartItemId || item.id, 1);
                                }
                              }}
                              className="w-7 h-7 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer active:scale-95 transition"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.cartItemId || item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 cursor-pointer transition"
                              title="Eliminar este producto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ══════ ¿TIENES UN ANTOJO? COMPLEMENTA TU ORDEN (ESTILO EL CORRAL) ══════ */}
                  <div className="bg-gradient-to-br from-[#3b0c10] via-[#2d080c] to-[#1c0406] rounded-3xl p-3.5 sm:p-4 text-white shadow-xl border border-red-950/80 relative overflow-hidden mt-2">
                    {/* Encabezado con flechas de navegación */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                          ¿Tienes un antojo?
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                          Complementa tu orden
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scrollComplementos("left")}
                          className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90 border border-white/10 cursor-pointer"
                          title="Anterior complemento"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollComplementos("right")}
                          className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90 border border-white/10 cursor-pointer"
                          title="Siguiente complemento"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Carrusel horizontal suave */}
                    <div
                      ref={complementosRef}
                      className="flex items-stretch gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth snap-x snap-mandatory"
                    >
                      {complementosOrden.map((comp) => (
                        <div
                          key={comp.id}
                          className="w-32 sm:w-36 shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-2.5 shadow-md flex flex-col justify-between text-gray-900 dark:text-gray-100 snap-start border border-gray-100 dark:border-gray-700/60 group hover:shadow-xl transition-all"
                        >
                          <div className="relative w-full h-20 sm:h-22 rounded-xl bg-gray-50 dark:bg-gray-900/80 overflow-hidden flex items-center justify-center mb-1.5">
                            <img
                              src={comp.imagen}
                              alt={comp.nombre}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 select-none"
                            />
                            {comp.badge && (
                              <span className="absolute top-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[8.5px] font-black px-1.5 py-0.2 rounded-md">
                                {comp.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 mb-2">
                            <p className="font-black text-xs text-gray-800 dark:text-gray-100 line-clamp-1 leading-snug">
                              {comp.nombre}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {comp.tamano || comp.descripcion}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-750">
                            <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                              ${Number(comp.precio).toLocaleString("es-CO")}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddComplemento(comp)}
                              className="w-7 h-7 rounded-full bg-[#f05454] hover:bg-[#d94444] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
                              title={`Agregar ${comp.nombre} al pedido`}
                            >
                              <Plus className="w-4 h-4 stroke-[3]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-3 shrink-0">
                <div className="flex justify-between items-center text-base font-extrabold text-gray-900 dark:text-gray-100">
                  <span>Total Pedido:</span>
                  <span className="text-red-600 dark:text-red-400 text-xl font-black">${clientSubtotal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={clearCart}
                    className="py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                  >
                    Vaciar Carrito
                  </button>
                  <button
                    onClick={handleAbrirCheckout}
                    className="py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl text-xs shadow-md active:scale-[0.98] transition cursor-pointer"
                  >
                    Proceder al Pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CHECKOUT — Diseño Exacto Aprobado */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[94vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

            {/* ═══ HEADER ROJO GRADIENT CON BORDES REDONDEADOS ═══ */}
            <div className="bg-gradient-to-r from-[#D9383A] to-[#E03E3E] px-6 py-5 flex items-center justify-between rounded-t-3xl shrink-0">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Finalizar Pedido</h3>
                <p className="text-xs text-white/90 font-medium mt-0.5">Completa los datos de entrega y pago</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="w-9 h-9 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ═══ CUERPO SCROLLEABLE ═══ */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6 scrollbar-thin">

              {/* ── 1. Resumen de compra (Tarjeta Superior) ── */}
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-gray-700/60 shadow-2xs">
                <div className="flex justify-between items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold">
                    <ShoppingCart className="w-4 h-4 text-[#E03E3E]" /> Subtotal ({getTotalItems()} prod.)
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">${clientSubtotal.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>IVA (0%)</span>
                  <span>$0</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700/80 pt-2 flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 dark:text-gray-100">Total</span>
                  <span className="text-xl font-black text-[#D9383A]">${totalCheckout.toLocaleString('es-CO')}</span>
                </div>
              </div>

              {/* ── 2. Tipo de Entrega ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#B91C1C]" />
                  <span>Tipo de Entrega</span>
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* Card Domicilio */}
                  <button
                    type="button"
                    onClick={() => setCheckoutTipoEntrega("domicilio")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      checkoutTipoEntrega === "domicilio"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Truck className={`w-4 h-4 ${checkoutTipoEntrega === "domicilio" ? "text-[#E03E3E]" : "text-gray-600 dark:text-gray-400"}`} />
                        <span className={`font-bold text-sm ${checkoutTipoEntrega === "domicilio" ? "text-[#E03E3E]" : "text-gray-800 dark:text-gray-200"}`}>
                          Domicilio
                        </span>
                      </div>
                      {checkoutTipoEntrega === "domicilio" && (
                        <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${checkoutTipoEntrega === "domicilio" ? "text-[#E03E3E]/80" : "text-gray-500 dark:text-gray-400"}`}>
                      Llevamos tu pedido
                    </span>
                  </button>

                  {/* Card Recoger */}
                  <button
                    type="button"
                    onClick={() => setCheckoutTipoEntrega("llevar")}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                      checkoutTipoEntrega === "llevar"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 shadow-xs"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Store className={`w-4 h-4 ${checkoutTipoEntrega === "llevar" ? "text-[#E03E3E]" : "text-gray-600 dark:text-gray-400"}`} />
                        <span className={`font-bold text-sm ${checkoutTipoEntrega === "llevar" ? "text-[#E03E3E]" : "text-gray-800 dark:text-gray-200"}`}>
                          Recoger en Local
                        </span>
                      </div>
                      {checkoutTipoEntrega === "llevar" && (
                        <span className="w-4 h-4 rounded-full border border-[#E03E3E] flex items-center justify-center text-[#E03E3E] text-[10px] font-black">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${checkoutTipoEntrega === "llevar" ? "text-[#E03E3E]/80" : "text-gray-500 dark:text-gray-400"}`}>
                      Pasas a recogerlo
                    </span>
                  </button>
                </div>
              </div>

              {/* ── 3. Datos de Entrega ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B91C1C]" />
                  <span>Datos de Entrega</span>
                </h4>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre del destinatario
                  </label>
                  <input
                    type="text"
                    value={checkoutNombre}
                    onChange={(e) => setCheckoutNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 outline-none focus:border-[#E03E3E] transition"
                    placeholder="María García"
                  />
                </div>

                {checkoutTipoEntrega === "domicilio" ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      Dirección de entrega <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={checkoutDireccion}
                      onChange={(e) => setCheckoutDireccion(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-gray-100 outline-none focus:border-[#E03E3E] transition"
                      placeholder="Ej: Calle 45 #12-30, Apto 201"
                    />
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-3 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="font-bold">Recoger en:</span> Chazin Food — Cra. 12 #45-67. Te notificaremos cuando esté listo.
                    </p>
                  </div>
                )}
              </div>

              {/* ── 4. Método de Pago ── */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#B91C1C]" />
                    <span>Método de Pago</span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Pago Seguro
                  </span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Wompi (Online) */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("wompi")}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
                      checkoutMetodoPago === "wompi"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-sm ring-2 ring-[#E03E3E]/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="absolute -top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      En Línea
                    </span>
                    <Zap className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-extrabold text-inherit">Wompi</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">PSE, Nequi, Tarj.</span>
                  </button>

                  {/* Efectivo */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("efectivo")}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      checkoutMetodoPago === "efectivo"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-bold text-inherit">Efectivo</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Contra entrega</span>
                  </button>

                  {/* Tarjeta en Sitio */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("tarjeta")}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      checkoutMetodoPago === "tarjeta"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-bold text-inherit">Datáfono</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Al recibir</span>
                  </button>

                  {/* Transferencia */}
                  <button
                    type="button"
                    onClick={() => setCheckoutMetodoPago("transferencia")}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      checkoutMetodoPago === "transferencia"
                        ? "border-[#E03E3E] bg-[#FFF5F5] dark:bg-red-950/20 text-[#E03E3E] shadow-sm"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-inherit" />
                    <span className="text-xs font-bold text-inherit">Transferencia</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Manual</span>
                  </button>
                </div>

                {/* Sub-formulario Wompi */}
                {checkoutMetodoPago === "wompi" && (
                  <div className="bg-gradient-to-br from-amber-50/60 via-red-50/30 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/10 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-[#E03E3E] text-white flex items-center justify-center font-black text-xs">
                          W
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Pasarela Oficial Wompi (Bancolombia)</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">Paga al instante sin comisiones adicionales</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                        🧪 Sandbox Activo
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 text-center text-[10px] font-bold text-purple-700 dark:text-purple-400">
                        🟣 Nequi
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 text-center text-[10px] font-bold text-blue-700 dark:text-blue-400">
                        🏛️ PSE
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 text-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        💳 Tarjetas
                      </div>
                      <div className="bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl p-1.5 text-center text-[10px] font-bold text-yellow-700 dark:text-yellow-400">
                        🟡 Bancolombia
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-snug">
                      Al presionar <strong>Pagar con Wompi</strong> se abrirá la ventana emergente segura donde podrás escoger tu método favorito. Tu pedido pasará a cocina automáticamente al completarse el pago.
                    </p>
                  </div>
                )}

                {/* Sub-formulario Efectivo */}
                {checkoutMetodoPago === "efectivo" && (
                  <div className="bg-[#F0FDF4] dark:bg-emerald-950/20 border border-[#DCFCE7] dark:border-emerald-900/40 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#166534] dark:text-emerald-300">
                        ¿Con cuánto vas a pagar en efectivo? <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] font-black text-[#16A34A] dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-md">
                        Pago requerido
                      </span>
                    </div>

                    <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#86EFAC] dark:border-emerald-700 rounded-2xl px-4 py-2.5 shadow-2xs">
                      <Banknote className="w-4 h-4 text-[#16A34A] mr-2 shrink-0" />
                      <input
                        type="number"
                        min={totalCheckout}
                        required
                        value={checkoutEfectivoPaga}
                        onChange={(e) => setCheckoutEfectivoPaga(e.target.value)}
                        placeholder={`Mínimo: $${totalCheckout.toLocaleString('es-CO')}`}
                        className="w-full bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
                      />
                    </div>

                    {/* Botones de montos rápidos con billetes reales en circulación */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <button
                        type="button"
                        onClick={() => setCheckoutEfectivoPaga(String(totalCheckout))}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                      >
                        Pago Exacto (${totalCheckout.toLocaleString('es-CO')})
                      </button>
                      {[20000, 50000, 100000]
                        .filter((v) => v > totalCheckout && v <= totalCheckout + 100000)
                        .map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCheckoutEfectivoPaga(String(amt))}
                            className="px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 text-[11px] font-bold rounded-lg transition shadow-2xs cursor-pointer"
                          >
                            ${amt.toLocaleString('es-CO')}
                          </button>
                        ))}
                    </div>

                    {checkoutEfectivoPaga && Number(checkoutEfectivoPaga) >= totalCheckout && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-xs font-black text-[#16A34A] dark:text-emerald-400">
                          💰 Cambio / Vueltos: ${vueltoEfectivo.toLocaleString('es-CO')}
                        </p>
                        {vueltoEfectivo > 100000 && (
                          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-[11px] font-semibold flex items-start gap-1.5">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                            <span>
                              ⚠️ Por seguridad de los domiciliarios, el cambio máximo en efectivo es de $100.000 COP. Por favor ingresa una denominación menor o selecciona Transferencia / Tarjeta.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-formulario Tarjeta */}
                {checkoutMetodoPago === "tarjeta" && (
                  <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Número de tarjeta <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl px-4 py-2.5 shadow-2xs">
                        <CreditCard className="w-4 h-4 text-[#3B82F6] mr-2 shrink-0" />
                        <input
                          type="text"
                          value={checkoutTarjetaNumero}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d]/g, '').slice(0, 16);
                            setCheckoutTarjetaNumero(v.replace(/(\d{4})(?=\d)/g, '$1 '));
                          }}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-transparent text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none tracking-widest"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Monto a cargar
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`$ ${totalCheckout.toLocaleString('es-CO')}`}
                        className="w-full px-4 py-2.5 bg-white/70 dark:bg-gray-800/80 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-formulario Transferencia */}
                {checkoutMetodoPago === "transferencia" && (
                  <div className="bg-[#F8FAFF] dark:bg-blue-950/20 border border-[#E0E7FF] dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Entidad / Banco origen
                      </label>
                      <select
                        value={checkoutTransferBanco}
                        onChange={(e) => setCheckoutTransferBanco(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl text-sm font-bold text-gray-900 dark:text-gray-100 outline-none"
                      >
                        <optgroup label="Billeteras digitales">
                          <option value="Nequi">Nequi</option>
                          <option value="Daviplata">Daviplata</option>
                        </optgroup>
                        <optgroup label="Bancos">
                          <option value="Bancolombia">Bancolombia</option>
                          <option value="Davivienda">Davivienda</option>
                          <option value="BBVA">BBVA</option>
                          <option value="Banco de Bogotá">Banco de Bogotá</option>
                          <option value="Banco Caja Social">Banco Caja Social</option>
                          <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                          <option value="Otro">Otro</option>
                        </optgroup>
                      </select>
                    </div>
                    <div className="bg-blue-100/70 dark:bg-blue-900/30 p-2.5 rounded-xl text-xs text-[#1E40AF] dark:text-blue-300 font-medium">
                      Transfiere a <span className="font-bold">Bancolombia Ahorros 123-456789-00</span> a nombre de <span className="font-bold">Chazin Food</span>.
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1E40AF] dark:text-blue-300 mb-1.5">
                        Número de referencia <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={checkoutTransferReferencia}
                        onChange={(e) => setCheckoutTransferReferencia(e.target.value)}
                        placeholder="Ej: 987654321"
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-[#C7D2FE] dark:border-blue-700 rounded-2xl text-sm font-mono font-bold text-gray-900 dark:text-gray-100 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ── 5. Especificaciones ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#7F1D1D] dark:text-red-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B91C1C]" />
                  <span>Especificaciones</span>
                  <span className="font-normal text-gray-400 text-[11px] lowercase">(opcional)</span>
                </h4>
                <textarea
                  rows={3}
                  value={checkoutEspecificaciones}
                  onChange={(e) => setCheckoutEspecificaciones(e.target.value)}
                  placeholder="Ej: Sin cebolla, dejar en portería, tocar timbre..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#E03E3E] transition resize-none"
                />
              </div>
            </div>

            {/* ═══ FOOTER FIJO CON PRECIO Y BOTÓN CONFIRMAR ═══ */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 space-y-2.5 rounded-b-3xl">
              <div className="space-y-1.5">
                {clientDiscountMonto > 0 && (
                  <>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${clientSubtotal.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-xl">
                      <span>Descuento Fidelidad ({discountPercent}% OFF):</span>
                      <span>-${clientDiscountMonto.toLocaleString('es-CO')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total a pagar:</span>
                  <span className="text-2xl font-black text-[#D9383A]">${totalCheckout.toLocaleString('es-CO')}</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <Info className="w-3.5 h-3.5" />
                <span>Precio sin IVA aplicado</span>
              </div>
              <button
                type="button"
                disabled={isProcessingWompi}
                onClick={handleConfirmarPedido}
                className={`w-full py-4 font-extrabold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  isProcessingWompi
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : checkoutMetodoPago === "wompi"
                      ? "bg-gradient-to-r from-[#E03E3E] to-[#B91C1C] hover:from-[#C92A2A] hover:to-[#991B1B] text-white active:scale-98"
                      : "bg-[#E03E3E] hover:bg-[#C92A2A] active:scale-98 text-white"
                }`}
              >
                {isProcessingWompi ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Conectando con Wompi...</span>
                  </>
                ) : checkoutMetodoPago === "wompi" ? (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Pagar con Wompi en Línea (${totalCheckout.toLocaleString('es-CO')})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Confirmar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MIS PEDIDOS */}
      {showPedidos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative border border-gray-100 dark:border-gray-800 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Mis Pedidos Realizados</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchMyOrders}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                  title="Actualizar Pedidos"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPedidos ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowPedidos(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {pedidos.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-sm font-semibold text-gray-500">Aún no has realizado pedidos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pedidos.map((p) => (
                  <div key={p.id} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700 pb-2 text-xs">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">#{p.numeroVenta || p.id}</span>
                        <p className="text-gray-400">{p.fecha}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-bold border text-xs ${getEstadoColor(p.estado)}`}>
                        {p.estado}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      {p.items && p.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>{it.cantidad}x {it.nombre}</span>
                          <span className="font-semibold">${Number(it.precio || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200/50 dark:border-gray-700 pt-2 flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-500">Total:</span>
                      <span className="text-red-600 dark:text-red-400 text-sm">${Number(p.total || 0).toLocaleString()}</span>
                    </div>

                    {(String(p.estado).toUpperCase() === 'PENDIENTE' || String(p.estado).toLowerCase() === 'en cola') && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleCancelarPedido(p.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancelar Pedido
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL INICIAR SESIÓN / REGISTRO PARA PAGAR */}
      {showEmptyCartLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-center space-y-4 border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
              <LogIn className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Inicia sesión para pagar</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                Tus productos están seguros en el carrito. Para ingresar tu dirección de entrega y confirmar tu pedido, inicia sesión o crea una cuenta.
              </p>
            </div>

            {/* Carrito preview simple */}
            {cart.length > 0 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-red-500" /> {getTotalItems()} productos en tu carrito
                </span>
                <span className="font-black text-red-600 dark:text-red-400">${clientSubtotal.toLocaleString('es-CO')}</span>
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEmptyCartLoginModal(false);
                  navigate("/login");
                }}
                className="w-full py-3.5 px-4 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowEmptyCartLoginModal(false);
                  navigate("/login?tab=register");
                }}
                className="w-full py-3.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-2xl text-sm transition-all cursor-pointer"
              >
                Crear Cuenta Nueva
              </button>

              <button
                type="button"
                onClick={() => setShowEmptyCartLoginModal(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1 cursor-pointer"
              >
                Seguir viendo el menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reseñas de Producto */}
      <ProductoResenasModal
        isOpen={showResenasModal}
        onClose={() => {
          setShowResenasModal(false);
          // Refresh ratings
          if (productosList.length > 0) {
            const pIds = productosList.map(p => p.id || p.idProducto).join(',');
            apiClient.get(`/resenas/ratings?ids=${pIds}`)
              .then(res => { if (res) setRatingsMap(res); })
              .catch(() => {});
          }
        }}
        producto={productoParaResenas}
      />
    </div>
  );
}
