import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Star,
  Clock,
  Utensils,
  ShieldCheck,
  Flame,
  ChefHat,
  Sliders,
  Sparkles,
  Layers,
  FileText,
  Info,
  Check,
  MessageSquare,
  ThumbsUp,
  Award,
  Send,
  User as UserIcon
} from "lucide-react";
import { getProductEmoji, getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";
import { apiClient } from "@/shared/api/apiClient";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";

const FALLBACK_ADICION_IMAGES = {
  tocineta: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=500&auto=format&fit=crop&q=80",
  queso: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500&auto=format&fit=crop&q=80",
  papa: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80",
  cebolla: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80",
  jalapeno: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
  salsa: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80"
};

export const getAdicionDisplayImage = (ad) => {
  if (!ad) return FALLBACK_ADICION_IMAGES.default;
  if (typeof ad.imagen === "string" && ad.imagen.startsWith("http")) return ad.imagen;
  if (typeof ad.foto === "string" && ad.foto.startsWith("http")) return ad.foto;

  const name = String(ad.nombre || "").toLowerCase();
  if (name.includes("tocineta") || name.includes("bacon")) return FALLBACK_ADICION_IMAGES.tocineta;
  if (name.includes("queso") || name.includes("cheddar")) return FALLBACK_ADICION_IMAGES.queso;
  if (name.includes("papa") || name.includes("francesa")) return FALLBACK_ADICION_IMAGES.papa;
  if (name.includes("cebolla")) return FALLBACK_ADICION_IMAGES.cebolla;
  if (name.includes("jalapeño") || name.includes("jalapeno") || name.includes("picante")) return FALLBACK_ADICION_IMAGES.jalapeno;
  if (name.includes("salsa")) return FALLBACK_ADICION_IMAGES.salsa;

  return FALLBACK_ADICION_IMAGES.default;
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
    name.includes("mr tea")
  );
};

export const getDrinkBrandMeta = (name = "") => {
  const n = String(name).toLowerCase();
  if (n.includes("coca") && (n.includes("light") || n.includes("sin az") || n.includes("cero"))) {
    return { color: "#1F2937", badge: "0% Azúcar", badgeColor: "bg-black text-white border border-gray-700", marca: "The Coca-Cola Company" };
  }
  if (n.includes("coca")) {
    return { color: "#E61C24", badge: "Sabor Original", badgeColor: "bg-red-600 text-white", marca: "The Coca-Cola Company" };
  }
  if (n.includes("pepsi") && (n.includes("light") || n.includes("black") || n.includes("cero"))) {
    return { color: "#0F172A", badge: "0% Azúcar", badgeColor: "bg-gray-900 text-cyan-400 border border-cyan-500/40", marca: "PepsiCo" };
  }
  if (n.includes("pepsi")) {
    return { color: "#004B93", badge: "Pepsi Regular", badgeColor: "bg-blue-700 text-white", marca: "PepsiCo" };
  }
  if (n.includes("manzana")) {
    return { color: "#E11D48", badge: "Postobón", badgeColor: "bg-rose-500 text-white", marca: "Postobón" };
  }
  if (n.includes("colombiana")) {
    return { color: "#EA580C", badge: "La Nuestra", badgeColor: "bg-orange-600 text-white", marca: "Postobón" };
  }
  if (n.includes("sprite")) {
    return { color: "#059669", badge: "Lima-Limón", badgeColor: "bg-emerald-600 text-white", marca: "The Coca-Cola Company" };
  }
  if (n.includes("cuatro")) {
    return { color: "#D97706", badge: "Toronja", badgeColor: "bg-amber-600 text-white", marca: "The Coca-Cola Company" };
  }
  if (n.includes("cristal") || n.includes("agua")) {
    return { color: "#0284C7", badge: "100% Pura", badgeColor: "bg-sky-600 text-white", marca: "Postobón" };
  }
  return { color: "#f05454", badge: "Refrescante", badgeColor: "bg-red-500 text-white", marca: "Bebida Chazin" };
};


export const SODA_FLAVORS = [
  { id: "coca-cola", nombre: "Coca-Cola Original", color: "#E61C24" },
  { id: "coca-cola-light", nombre: "Coca-Cola Light", color: "#C0C0C0" },
  { id: "manzana-postobon", nombre: "Manzana Postobón", color: "#E11D48" },
  { id: "colombiana-postobon", nombre: "Colombiana Postobón", color: "#EA580C" },
  { id: "pepsi", nombre: "Pepsi", color: "#004B93" },
  { id: "pepsi-light", nombre: "Pepsi Light", color: "#0F172A" },
  { id: "sprite", nombre: "Sprite", color: "#059669" },
  { id: "cuatro", nombre: "Quatro Toronja", color: "#D97706" },
  { id: "agua-cristal", nombre: "Agua Cristal", color: "#0284C7" }
];

export const detectDefaultFlavor = (prod) => {
  if (!prod) return SODA_FLAVORS[0];
  const name = String(prod.nombre || "").toLowerCase();
  if (name.includes("manzana")) return SODA_FLAVORS.find((f) => f.id === "manzana-postobon") || SODA_FLAVORS[0];
  if (name.includes("colombiana")) return SODA_FLAVORS.find((f) => f.id === "colombiana-postobon") || SODA_FLAVORS[0];
  if (name.includes("pepsi") && (name.includes("light") || name.includes("black") || name.includes("zero"))) {
    return SODA_FLAVORS.find((f) => f.id === "pepsi-light") || SODA_FLAVORS[3];
  }
  if (name.includes("pepsi")) return SODA_FLAVORS.find((f) => f.id === "pepsi") || SODA_FLAVORS[3];
  if (name.includes("sprite")) return SODA_FLAVORS.find((f) => f.id === "sprite") || SODA_FLAVORS[0];
  if (name.includes("cuatro")) return SODA_FLAVORS.find((f) => f.id === "cuatro") || SODA_FLAVORS[0];
  if (name.includes("agua") || name.includes("cristal")) return SODA_FLAVORS.find((f) => f.id === "agua-cristal") || SODA_FLAVORS[0];
  if (name.includes("light") || name.includes("zero") || name.includes("sin azucar")) {
    return SODA_FLAVORS.find((f) => f.id === "coca-cola-light") || SODA_FLAVORS[1];
  }
  return SODA_FLAVORS[0];
};

const INGREDIENTES_CANDIDATOS = [
  { id: "cebolla", nombre: "Cebolla", icono: "🧅", aliases: ["cebolla", "onion"] },
  { id: "salsas", nombre: "Salsas de la casa", icono: "🥫", aliases: ["salsa", "salsas", "sauce"] },
  { id: "tomate", nombre: "Tomate", icono: "🍅", aliases: ["tomate", "tomato"] },
  { id: "lechuga", nombre: "Lechuga", icono: "🥬", aliases: ["lechuga", "lettuce"] },
  { id: "queso", nombre: "Queso", icono: "🧀", aliases: ["queso", "cheddar", "mozzarella", "cheese"] },
  { id: "tocineta", nombre: "Tocineta", icono: "🥓", aliases: ["tocineta", "tocino", "bacon"] },
  { id: "ripio", nombre: "Ripio de papa", icono: "🍟", aliases: ["ripio", "papas ripio", "chips"] },
  { id: "jalapenos", nombre: "Jalapeños", icono: "🌶️", aliases: ["jalapeño", "jalapeno", "picante"] }
];

export const extractPersonalizables = (producto, ficha) => {
  if (!producto || isDrinkProduct(producto)) return [];
  const catName = String(producto.categoria || producto.categoriaNombre || "").toLowerCase();
  if (catName.includes("bebida") || catName.includes("gaseosa") || String(producto.nombre || "").toLowerCase().includes("gaseosa")) {
    return [];
  }

  let allStrings = [];
  if (ficha?.detalles && Array.isArray(ficha.detalles)) {
    allStrings.push(...ficha.detalles.map(d => String(d.insumo?.nombre || d.nombreInsumo || "").toLowerCase()));
  }
  if (ficha?.ingredientes && Array.isArray(ficha.ingredientes)) {
    allStrings.push(...ficha.ingredientes.map(s => String(s).toLowerCase()));
  }
  if (producto?.descripcion) {
    allStrings.push(String(producto.descripcion).toLowerCase());
  }
  const combined = allStrings.join(" ");

  return INGREDIENTES_CANDIDATOS.filter(c => c.aliases.some(alias => combined.includes(alias)));
};

const QUICK_KITCHEN_TAGS = [
  "Salsas aparte",
  "Bien cocido/a",
  "Término medio",
  "Sin sal adicional",
  "Empaque para llevar",
  "Poco picante",
  "Servir caliente"
];

const QUICK_DRINK_TAGS = [
  "Con hielo",
  "Sin hielo",
  "Con pitillo / pajilla",
  "Empaque para llevar",
  "Vaso adicional",
  "Sin azúcar"
];

function formatFechaRelativa(dateStr) {
  if (!dateStr) return "Reciente";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  } catch {
    return "Reciente";
  }
}

export const resolveNutritionalSpecs = (producto, ficha) => {
  const prodName = String(producto?.nombre || ficha?.producto?.nombre || "").toLowerCase();
  const catName = String(producto?.categoriaNombre || producto?.categoria?.nombre || (typeof producto?.categoria === 'string' ? producto.categoria : '') || "").toLowerCase();
  const infoNut = String(ficha?.informacionNutricional || "");
  const rendText = String(ficha?.rendimiento || "");

  // 1. Resolver Rendimiento
  let rendimiento = ficha?.rendimiento;
  if (!rendimiento || rendimiento === "1 porción") {
    if (prodName.includes("agua") || prodName.includes("gaseosa") || prodName.includes("coca") || prodName.includes("pepsi") || prodName.includes("postob") || catName.includes("bebida")) {
      rendimiento = prodName.includes("600ml") ? "1 porción (600ml)" : "1 porción (400ml)";
    } else if (prodName.includes("combo")) {
      rendimiento = "2 personas (1.6 kg combo)";
    } else if (prodName.includes("salchipapa")) {
      rendimiento = "1 porción generosa (560g)";
    } else if (prodName.includes("doble")) {
      rendimiento = "1 porción grande (540g)";
    } else if (prodName.includes("trufada") || prodName.includes("fest")) {
      rendimiento = "1 hamburguesa gourmet (430g)";
    } else if (prodName.includes("espiral")) {
      rendimiento = "1 porción espiral (200g)";
    } else if (prodName.includes("casco") || prodName.includes("corral")) {
      rendimiento = prodName.includes("grande") ? "1 porción grande (240g)" : "1 porción mediana (160g)";
    } else if (prodName.includes("francesa")) {
      rendimiento = "1 porción (150g)";
    } else {
      rendimiento = rendimiento || "1 porción";
    }
  }

  // 2. Resolver Peso
  let peso = ficha?.peso;
  if (!peso || peso === "350g") {
    const rendMatch = rendText.match(/\((\d+(?:\.\d+)?\s*(?:g|kg|ml|oz|l))/i);
    if (rendMatch) {
      peso = rendMatch[1].trim();
    } else if (prodName.includes("agua")) {
      peso = prodName.includes("600ml") ? "600ml" : "500ml";
    } else if (prodName.includes("gaseosa") || prodName.includes("coca") || prodName.includes("pepsi") || prodName.includes("postob") || prodName.includes("sprite") || prodName.includes("quatro") || catName.includes("bebida")) {
      peso = "400ml";
    } else if (prodName.includes("chili")) {
      peso = prodName.includes("bebida") ? "720g (combo)" : "320g";
    } else if (prodName.includes("tocineta") && prodName.includes("papa")) {
      peso = prodName.includes("bebida") ? "700g (combo)" : "300g";
    } else if (prodName.includes("doble")) {
      peso = "540g";
    } else if (prodName.includes("trufada") || prodName.includes("fest")) {
      peso = "430g";
    } else if (prodName.includes("pollo")) {
      peso = "380g";
    } else if (prodName.includes("salchipapa")) {
      peso = "560g";
    } else if (prodName.includes("perro suizo")) {
      peso = "340g";
    } else if (prodName.includes("perro")) {
      peso = "290g";
    } else if (prodName.includes("combo")) {
      peso = "1.6 kg";
    } else if (prodName.includes("espiral")) {
      peso = "200g";
    } else if (prodName.includes("casco") || prodName.includes("corral")) {
      peso = prodName.includes("grande") ? "240g" : "160g";
    } else if (prodName.includes("francesa")) {
      peso = "150g";
    } else if (ficha?.peso) {
      peso = ficha.peso;
    } else {
      peso = "350g";
    }
  }

  // 3. Resolver Calorías
  let calorias = ficha?.calorias;
  if (!calorias || calorias === "~650 kcal" || calorias === "650 kcal") {
    const calMatch = infoNut.match(/(?:calorías|calorias|cal)\s*[:~]?\s*([~]?\s*\d+\s*(?:kcal|cal)?)/i);
    if (calMatch) {
      let val = calMatch[1].trim();
      if (!val.toLowerCase().includes("kcal")) val += " kcal";
      calorias = val;
    } else if (prodName.includes("agua") || prodName.includes("sin azúcar") || prodName.includes("light") || prodName.includes("zero")) {
      calorias = "0 kcal";
    } else if (prodName.includes("gaseosa") || prodName.includes("coca") || prodName.includes("pepsi") || prodName.includes("postob") || prodName.includes("sprite") || prodName.includes("quatro") || catName.includes("bebida")) {
      calorias = "165 kcal";
    } else if (prodName.includes("doble")) {
      calorias = "~980 kcal";
    } else if (prodName.includes("trufada") || prodName.includes("fest")) {
      calorias = "~790 kcal";
    } else if (prodName.includes("combo")) {
      calorias = "~1800 kcal";
    } else if (prodName.includes("salchipapa")) {
      calorias = "~890 kcal";
    } else if (prodName.includes("pollo")) {
      calorias = "~720 kcal";
    } else if (prodName.includes("perro suizo")) {
      calorias = "~680 kcal";
    } else if (prodName.includes("perro")) {
      calorias = "~540 kcal";
    } else if (prodName.includes("chili")) {
      calorias = prodName.includes("bebida") ? "820 kcal" : "680 kcal";
    } else if (prodName.includes("tocineta") && prodName.includes("papa")) {
      calorias = prodName.includes("bebida") ? "830 kcal" : "690 kcal";
    } else if (prodName.includes("corral") || prodName.includes("casco")) {
      calorias = prodName.includes("grande") ? "430 kcal" : "300 kcal";
    } else if (prodName.includes("francesa")) {
      calorias = "380 kcal";
    } else if (ficha?.calorias) {
      calorias = ficha.calorias;
    } else {
      calorias = "~650 kcal";
    }
  }

  // 4. Resolver Tiempo de preparación
  let tiempoPrep = ficha?.tiempoPreparacion;
  if (!tiempoPrep) {
    if (prodName.includes("agua") || prodName.includes("gaseosa") || catName.includes("bebida")) {
      tiempoPrep = 1;
    } else if (prodName.includes("francesa") || prodName.includes("corral") || prodName.includes("casco")) {
      tiempoPrep = 6;
    } else if (prodName.includes("perro")) {
      tiempoPrep = 8;
    } else if (prodName.includes("combo")) {
      tiempoPrep = 14;
    } else {
      tiempoPrep = 10;
    }
  }

  return { peso, calorias, rendimiento, tiempoPrep };
};

export function FastFoodProductModal({
  isOpen,
  onClose,
  producto,
  ficha = null,
  allAdiciones = [],
  allBebidas = [],
  ratingsInfo = null,
  onOpenResenas = null,
  onConfirm,
  mode = "pos", // "pos" | "cliente"
  initialTab = "personalizar"
}) {
  const { user, isAuthenticated } = useAuth?.() || {};
  const isDrink = isDrinkProduct(producto);
  const specs = useMemo(() => resolveNutritionalSpecs(producto, ficha), [producto, ficha]);
  const [activeTab, setActiveTab] = useState(isDrink ? "sabores" : (initialTab || "personalizar")); // "sabores" | "personalizar" | "adiciones" | "bebidas" | "ficha" | "resenas"
  const [quantity, setQuantity] = useState(1);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [selectedAdditions, setSelectedAdditions] = useState([]); // [{ idAdicion, nombre, precio, cantidad, imagen }]
  const [selectedDrinks, setSelectedDrinks] = useState([]); // [{ id, nombre, precio, cantidad, imagen }]
  const realVariants = useMemo(() => {
    if (Array.isArray(producto?.variantes) && producto.variantes.length > 0) {
      return producto.variantes.map((v) => ({
        idVariante: v.idVariante || v.id,
        nombre: v.nombre,
        precio: Number(v.precio || producto.precio || 0)
      }));
    }
    return [
      {
        idVariante: producto?.id || producto?.idProducto || 1,
        nombre: producto?.nombre || "Estándar",
        precio: Number(producto?.precio || 0)
      }
    ];
  }, [producto]);

  const [selectedVariant, setSelectedVariant] = useState(() => realVariants[0]);

  useEffect(() => {
    if (realVariants.length > 0) {
      setSelectedVariant(realVariants[0]);
    }
  }, [realVariants]);

  // Detección si el producto es acompañamiento o plato de papas
  const isPapaOrAccompaniment = useMemo(() => {
    const prodName = String(producto?.nombre || "").toLowerCase();
    const catName = String(producto?.categoria || producto?.categoriaNombre || "").toLowerCase();
    const catId = Number(producto?.idCategoriaProducto || 0);
    return catId === 6 || catName.includes("acompa") || prodName.includes("papa");
  }, [producto]);

  // Filtrado de adiciones: si es papa o acompañamiento, NO ofrecer "Porción Papas a la Francesa" como adición a sí misma
  const filteredAdiciones = useMemo(() => {
    if (!allAdiciones || !Array.isArray(allAdiciones)) return [];
    return allAdiciones.filter((ad) => {
      const adName = (ad.nombre || "").toLowerCase();
      if (isPapaOrAccompaniment && (adName.includes("papas a la francesa") || adName.includes("porcion papas") || adName.includes("porción papas") || adName.includes("papas en casco"))) {
        return false;
      }
      return true;
    });
  }, [allAdiciones, isPapaOrAccompaniment]);

  // Imagen específica de variantes conocidas como Coca-Cola Sin Azúcar / Light
  const getVariantImage = useCallback((varName) => {
    const vn = String(varName || "").toLowerCase();
    if (vn.includes("light") || vn.includes("sin azúcar") || vn.includes("sin azucar") || vn.includes("zero")) {
      return "https://res.cloudinary.com/dckwtknmq/image/upload/v1789007797/vj583pwufluqm708i5af.jpg";
    }
    return null;
  }, []);

  const [selectedFlavor, setSelectedFlavor] = useState(() => isDrink ? detectDefaultFlavor(producto) : null);
  const [customObservation, setCustomObservation] = useState("");
  const [imageError, setImageError] = useState(false);

  // Reseñas dinámicas del producto
  const [reviewsData, setReviewsData] = useState({ promedio: 0, total: 0, resenas: [] });
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Formulario interactivo para escribir / publicar reseña dentro del modal
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null); // { type: 'success'|'error', message: string }

  const prodId = producto?.id || producto?.idProducto;

  // Cargar reseñas cuando se abre el modal
  const fetchReviews = useCallback(async () => {
    if (!prodId) return;
    setLoadingReviews(true);
    try {
      const res = await apiClient.get(`/resenas/producto/${prodId}`);
      if (res) {
        setReviewsData({
          promedio: Number(res.promedio || 0),
          total: Number(res.total || (res.resenas ? res.resenas.length : 0)),
          resenas: Array.isArray(res.resenas) ? res.resenas : []
        });
      }
    } catch (e) {
      console.warn("No se pudieron cargar reseñas del producto:", e);
    } finally {
      setLoadingReviews(false);
    }
  }, [prodId]);

  // Handler para publicar reseña interactiva
  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!prodId) return;
    if (newRating < 1) {
      setReviewFeedback({ type: "error", message: "Por favor selecciona una calificación de 1 a 5 estrellas." });
      return;
    }
    if (!newComment.trim()) {
      setReviewFeedback({ type: "error", message: "Por favor escribe un breve comentario sobre tu experiencia gastronómica." });
      return;
    }

    setSubmittingReview(true);
    setReviewFeedback(null);

    try {
      if (isAuthenticated && user) {
        const created = await apiClient.post("/resenas", {
          idProducto: prodId,
          puntuacion: newRating,
          comentario: newComment.trim()
        });

        const newReviewItem = {
          id: created?.id || created?.idResena || Date.now(),
          puntuacion: newRating,
          comentario: newComment.trim(),
          fecha: new Date().toISOString(),
          usuario: {
            nombre: user?.nombre || user?.nombreCompleto || "Comensal",
            apellidos: user?.apellidos || ""
          }
        };

        setReviewsData((prev) => {
          const updatedList = [newReviewItem, ...prev.resenas];
          const newTotal = prev.total + 1;
          const newAvg = updatedList.reduce((acc, r) => acc + (r.puntuacion || 5), 0) / updatedList.length;
          return {
            promedio: Number(newAvg.toFixed(1)),
            total: newTotal,
            resenas: updatedList
          };
        });

        setReviewFeedback({ type: "success", message: "¡Tu reseña ha sido verificada y publicada con éxito!" });
        setNewComment("");
        setShowWriteReview(false);
      } else {
        const guestReviewItem = {
          id: Date.now(),
          puntuacion: newRating,
          comentario: newComment.trim(),
          fecha: new Date().toISOString(),
          usuario: {
            nombre: guestName.trim() || "Comensal Gourmet",
            apellidos: ""
          }
        };

        setReviewsData((prev) => {
          const updatedList = [guestReviewItem, ...prev.resenas];
          const newTotal = prev.total + 1;
          const newAvg = updatedList.reduce((acc, r) => acc + (r.puntuacion || 5), 0) / updatedList.length;
          return {
            promedio: Number(newAvg.toFixed(1)),
            total: newTotal,
            resenas: updatedList
          };
        });

        setReviewFeedback({
          type: "success",
          message: "¡Gracias por calificar! Tu opinión se ha sumado a las recomendaciones de este plato."
        });
        setNewComment("");
        setGuestName("");
        setShowWriteReview(false);
      }
    } catch (err) {
      console.warn("Error enviando reseña:", err);
      const msg = err?.response?.data?.message || err?.message || "No se pudo registrar la reseña en este momento.";
      setReviewFeedback({ type: "error", message: msg });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Re-initialize state when a new product is passed
  useEffect(() => {
    if (producto && isOpen) {
      const drinkMode = isDrinkProduct(producto);
      if (drinkMode) {
        const defFlavor = detectDefaultFlavor(producto);
        setSelectedFlavor(defFlavor);
        setActiveTab("sabores");
      } else {
        const canPersonalize = extractPersonalizables(producto, ficha).length > 0;
        setActiveTab(initialTab || (canPersonalize ? "personalizar" : "adiciones"));
      }
      setQuantity(1);
      setRemovedIngredients([]);
      setSelectedAdditions([]);
      setSelectedDrinks([]);
      setCustomObservation("");
      setImageError(false);
      setShowWriteReview(false);
      setReviewFeedback(null);
      fetchReviews();
    }
  }, [producto, isOpen, fetchReviews, initialTab]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !producto) return null;

  // Helper de Evento Activo para el Producto (Fast-food LTO / Festival drops)
  const eventInfo = (() => {
    const eventos = Array.isArray(producto.eventos) ? producto.eventos : [];
    if (eventos.length === 0) return null;
    const evt = eventos.find((e) => e.estado === 1 || e.estado === "Activo") || eventos[0];
    if (!evt) return null;

    const rawPrice = selectedVariant?.precio !== undefined && Number(selectedVariant.precio) > 0
      ? Number(selectedVariant.precio)
      : Number(producto.precio || 0);

    let final = rawPrice;
    if (evt.nuevoPrecio && Number(evt.nuevoPrecio) > 0) {
      final = Number(evt.nuevoPrecio);
    } else if (evt.descuento && Number(evt.descuento) > 0) {
      final = rawPrice * (1 - Number(evt.descuento) / 100);
    }

    const savings = Math.max(0, rawPrice - final);
    const discountPercent = rawPrice > 0 && savings > 0 
      ? Math.round((savings / rawPrice) * 100) 
      : (evt.descuento ? Math.round(Number(evt.descuento)) : 0);

    let formattedDate = "";
    let diasRestantes = null;
    let horasRestantes = null;
    let urgente = false;
    let countdownLabel = "";

    const now = new Date();
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
      descripcion: evt.descripcion || "Receta conmemorativa de edición limitada con precio y presentación especial.",
      regularPrice: rawPrice,
      eventPrice: final,
      savings,
      discountPercent,
      formattedDate,
      tipo: evt.tipoEvento || "EDICION_LIMITADA",
      vigencia: {
        diasRestantes,
        horasRestantes,
        urgente,
        label: countdownLabel || (formattedDate ? `Hasta el ${formattedDate}` : "Tiempo Limitado")
      }
    };
  })();

  // Calculo de precio base con posibles eventos o promociones
  const { basePrice, originalPrice, hasDiscount, discountLabel } = (() => {
    const rawPrice = selectedVariant?.precio !== undefined && Number(selectedVariant.precio) > 0
      ? Number(selectedVariant.precio)
      : Number(producto.precio || 0);
    let original = rawPrice;
    let final = original;
    let discount = false;
    let label = "";

    if (eventInfo && (eventInfo.savings > 0 || eventInfo.discountPercent > 0)) {
      final = eventInfo.eventPrice;
      discount = true;
      label = eventInfo.savings > 0 
        ? `-${eventInfo.discountPercent}% OFF (Ahorro $${eventInfo.savings.toLocaleString()})`
        : "Edición Especial";
    } else {
      const eventos = Array.isArray(producto.eventos) ? producto.eventos : [];
      const evtPrecio = eventos.find((e) => e.tipoEvento === "Promoción Precio" || e.tipo === "Promoción Precio");
      const evtDesc = eventos.find((e) => e.tipoEvento === "Descuento" || e.tipo === "Descuento");

      if (evtPrecio && Number(evtPrecio.nuevoPrecio) > 0) {
        final = Number(evtPrecio.nuevoPrecio);
        discount = true;
        label = "Precio Promocional";
      } else if (evtDesc && Number(evtDesc.descuento) > 0) {
        final = original * (1 - Number(evtDesc.descuento) / 100);
        discount = true;
        label = `-${Number(evtDesc.descuento)}% OFF`;
      }
    }

    return {
      basePrice: final,
      originalPrice: original,
      hasDiscount: discount,
      discountLabel: label
    };
  })();

  // Stock disponible
  const stockMax = Number(
    producto.stock !== undefined
      ? producto.stock
      : producto.stockActual !== undefined
      ? producto.stockActual
      : 99
  );

  // Insumos personalizables (Mise en place)
  const personalizables = extractPersonalizables(producto, ficha);

  // Toggle remover ingrediente
  const toggleRemoveIngredient = (nombre) => {
    setRemovedIngredients((prev) =>
      prev.includes(nombre) ? prev.filter((i) => i !== nombre) : [...prev, nombre]
    );
  };

  // Toggle o cambiar adición
  const toggleAddition = (ad) => {
    const adId = ad.idAdicion || ad.id;
    setSelectedAdditions((prev) => {
      const exists = prev.find((a) => (a.idAdicion || a.id) === adId);
      if (exists) {
        return prev.filter((a) => (a.idAdicion || a.id) !== adId);
      } else {
        return [
          ...prev,
          {
            idAdicion: adId,
            id: adId,
            nombre: ad.nombre,
            precio: Number(ad.precio || 0),
            cantidad: 1,
            imagen: getAdicionDisplayImage(ad)
          }
        ];
      }
    });
  };

  const changeAdditionQty = (adId, delta, e) => {
    if (e) e.stopPropagation();
    setSelectedAdditions((prev) =>
      prev
        .map((a) => {
          if ((a.idAdicion || a.id) === adId) {
            const newQty = (a.cantidad || 1) + delta;
            return newQty > 0 ? { ...a, cantidad: newQty } : null;
          }
          return a;
        })
        .filter(Boolean)
    );
  };

  // Toggle o cambiar bebida/acompañante
  const toggleDrink = (drink) => {
    const dId = drink.id || drink.idProducto;
    setSelectedDrinks((prev) => {
      const exists = prev.find((d) => (d.id || d.idProducto) === dId);
      if (exists) {
        return prev.filter((d) => (d.id || d.idProducto) !== dId);
      } else {
        return [
          ...prev,
          {
            id: dId,
            idProducto: dId,
            nombre: drink.nombre,
            precio: Number(drink.precio || 0),
            cantidad: 1,
            imagen: drink.imagen || "🥤",
            stock: Number(drink.stock !== undefined ? drink.stock : 30)
          }
        ];
      }
    });
  };

  const changeDrinkQty = (dId, delta, e) => {
    if (e) e.stopPropagation();
    setSelectedDrinks((prev) =>
      prev
        .map((d) => {
          if ((d.id || d.idProducto) === dId) {
            const newQty = (d.cantidad || 1) + delta;
            return newQty > 0 ? { ...d, cantidad: newQty } : null;
          }
          return d;
        })
        .filter(Boolean)
    );
  };

  // Quick tag toggle en observación
  const toggleQuickTag = (tag) => {
    setCustomObservation((prev) => {
      if (prev.includes(tag)) {
        return prev
          .replace(tag, "")
          .replace(/,\s*,/g, ",")
          .replace(/^\s*,\s*|\s*,\s*$/g, "")
          .trim();
      }
      const separator = prev.trim() ? ", " : "";
      return `${prev.trim()}${separator}${tag}`;
    });
  };

  // Totales en vivo
  const additionsUnitPrice = selectedAdditions.reduce(
    (sum, a) => sum + Number(a.precio || 0) * Number(a.cantidad || 1),
    0
  );

  const drinksTotal = selectedDrinks.reduce(
    (sum, d) => sum + Number(d.precio || 0) * Number(d.cantidad || 1),
    0
  );

  const finalUnitPrice = basePrice + additionsUnitPrice;
  const grandTotal = finalUnitPrice * quantity + drinksTotal;

  // Confirmar y agregar
  const handleConfirm = () => {
    const variantName = selectedVariant?.nombre && selectedVariant.nombre !== producto.nombre && selectedVariant.nombre !== "Estándar"
      ? selectedVariant.nombre
      : "";

    const personalizacionesFormatted = isDrink
      ? [
          variantName ? `Variante: ${variantName}` : null,
          `Servicio: ${selectedTemp}`
        ].filter(Boolean)
      : removedIngredients.map((r) => `Sin ${r}`);

    let fullNotes = [];
    if (personalizacionesFormatted.length > 0) {
      fullNotes.push(personalizacionesFormatted.join(", "));
    }
    if (customObservation.trim()) {
      fullNotes.push(customObservation.trim());
    }
    const finalObservationString = fullNotes.join(" • ");

    let customName = producto.nombre;
    if (isDrink && variantName) {
      customName = `${producto.nombre} (${variantName})`;
    }

    const chosenVarId = selectedVariant?.idVariante || selectedVariant?.id || producto.variantes?.[0]?.idVariante || producto.id || producto.idProducto;

    onConfirm({
      producto: {
        ...producto,
        idVariante: chosenVarId,
        nombrePersonalizado: customName,
        saborSeleccionado: variantName
      },
      idVariante: chosenVarId,
      cantidad: quantity,
      adiciones: isDrink ? [] : selectedAdditions,
      bebidas: isDrink ? [] : selectedDrinks,
      sabor: variantName,
      personalizaciones: personalizacionesFormatted,
      ingredientesRemovidos: isDrink ? [] : removedIngredients,
      observacion: finalObservationString,
      totalCalculado: grandTotal
    });

    onClose();
  };

  const productImage =
    producto.imagen ||
    producto.imagenUrl ||
    producto.urlImagen ||
    producto.foto ||
    producto.img;

  const selectedVariantSpecificImg = getVariantImage(selectedVariant?.nombre) || selectedVariant?.imagen;
  const brandMeta = getDrinkBrandMeta(selectedVariant?.nombre || producto.nombre);
  const heroImage = selectedVariantSpecificImg || productImage;
  const ambientGlowColor = isDrink ? brandMeta.color : "#f05454";

  const hasRealRatings = reviewsData.total > 0;
  const effectiveRating = hasRealRatings ? reviewsData.promedio : 0;
  const effectiveReviewsTotal = hasRealRatings ? reviewsData.total : (ratingsInfo?.total || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white dark:bg-gray-900 rounded-[32px] max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-colors">
        {/* ── Festival Drop Top Ribbon (Fast Food Industry Event Bar) ── */}
        {eventInfo && (
          <div className="bg-gradient-to-r from-amber-500 via-rose-600 to-purple-700 text-white px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-black uppercase tracking-wider shadow-md shrink-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base animate-pulse">🔥</span>
              <span className="truncate">{eventInfo.nombre}</span>
              <span className="hidden sm:inline-flex bg-black/30 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-full font-bold">
                {eventInfo.tipo === "Descuento"
                  ? "DESCUENTO DIRECTO"
                  : eventInfo.tipo === "Promoción Precio"
                  ? "PRECIO PROMOCIONAL"
                  : eventInfo.tipo === "Añadir Insumos"
                  ? "TOPPINGS ESPECIALES GRATIS"
                  : eventInfo.tipo === "COMBO_ESPECIAL"
                  ? "COMBO FESTIVO"
                  : eventInfo.tipo === "PROMOCION_2X1"
                  ? "PROMO 2X1"
                  : "EDICIÓN ESPECIAL"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-200 shrink-0">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className={eventInfo.vigencia?.urgente ? "animate-pulse font-black text-amber-300" : ""}>
                {eventInfo.vigencia?.label ? `${eventInfo.vigencia.label}${eventInfo.formattedDate ? ` • Hasta el ${eventInfo.formattedDate}` : ''}` : (eventInfo.formattedDate ? `Hasta el ${eventInfo.formattedDate}` : "Tiempo Limitado")}
              </span>
            </div>
          </div>
        )}

        {/* ── Close Floating Button ── */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
          title="Cerrar modal (Esc)"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* ── Scrollable Body Area ── */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
          {/* ═══ 1. LUXURY DUAL-STAGE HERO PHOTO (ENCUADRE PERFECTO & WOW EFFECT) ═══ */}
          <div className="relative w-full h-52 sm:h-64 bg-gray-950 flex items-center justify-center overflow-hidden border-b border-gray-100 dark:border-gray-800/80">
            {/* Background Ambient Layer (Glow difuminado con los colores reales de la comida o refresco) */}
            {heroImage && !imageError ? (
              <>
                <img
                  src={heroImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-40 dark:opacity-50 saturate-200 pointer-events-none transition-all duration-500"
                />
                {/* Spotlight radial central gastronómico adaptativo */}
                <div
                  className="absolute inset-0 pointer-events-none transition-colors duration-500"
                  style={{
                    background: `radial-gradient(ellipse at center, ${ambientGlowColor}33 0%, rgba(240,84,84,0.1) 45%, transparent 70%)`
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-red-950/40 to-gray-950" />
            )}

            {/* Foreground Crisp Centered Food Stage (Sin recortes, encuadre 100% perfecto) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5">
              {heroImage && !imageError ? (
                <img
                  key={heroImage}
                  src={heroImage}
                  alt={producto.nombre}
                  onError={() => setImageError(true)}
                  className="max-h-[170px] sm:max-h-[200px] w-auto max-w-[90%] object-contain drop-shadow-[0_22px_28px_rgba(0,0,0,0.7)] select-none animate-in zoom-in-95 duration-300"
                />
              ) : (
                <div className="text-8xl select-none drop-shadow-2xl animate-bounce">
                  {getProductEmoji(producto.nombre)}
                </div>
              )}
            </div>

            {/* Subtle bottom vignette to blend with info bar */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Top-Left Category Badge */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <span>{getProductEmoji(producto.nombre)}</span>
                <span>{producto.categoria || "Plato Especial"}</span>
              </span>
              {eventInfo && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{eventInfo.tipo === "Descuento" ? `-${eventInfo.discountPercent}% OFF` : eventInfo.tipo === "Promoción Precio" ? "Precio Promo" : eventInfo.tipo === "Añadir Insumos" ? "+ Toppings Gratis" : eventInfo.tipo === "COMBO_ESPECIAL" ? "Combo Festivo" : eventInfo.tipo === "PROMOCION_2X1" ? "Promo 2x1" : "Edición Especial"}</span>
                </span>
              )}
            </div>

            {/* Bottom Overlay Info (Name & Price) */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-end justify-between gap-3 text-white">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-2xl font-black leading-tight drop-shadow-md line-clamp-1">
                  {producto.nombre}
                </h2>
                {isDrink && selectedFlavor ? (
                  <p className="text-xs text-amber-300 drop-shadow-sm line-clamp-1 font-bold mt-0.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: selectedFlavor.color }} />
                    {selectedVariant?.nombre || selectedFlavor.nombre}
                  </p>
                ) : (
                  <p className="text-xs text-gray-200/90 drop-shadow-sm line-clamp-1 font-medium mt-0.5">
                    {producto.descripcion || "Preparación gourmet artesanal con insumos de primera."}
                  </p>
                )}
              </div>

              {/* Price Pill */}
              <div className="text-right shrink-0 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 shadow-lg">
                {hasDiscount && (
                  <span className="block text-[11px] text-gray-300 line-through font-bold">
                    ${originalPrice.toLocaleString("es-CO")}
                  </span>
                )}
                <span className="text-base sm:text-xl font-black text-amber-300 drop-shadow-sm">
                  ${basePrice.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>

          {/* Ratings & Quick Specs Sub-Bar (Clicking stars switches directly to Reseñas tab) */}
          <div className="px-4 sm:px-6 py-2.5 bg-gray-50 dark:bg-gray-850/70 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <button
              type="button"
              onClick={() => {
                setActiveTab("resenas");
                setShowWriteReview(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-200/80 dark:hover:bg-amber-900/60 transition cursor-pointer border border-amber-300/40 dark:border-amber-800/60 shadow-2xs group"
              title="Ver calificaciones y escribir una reseña"
            >
              {hasRealRatings ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{effectiveRating.toFixed(1)}</span>
                  <span className="opacity-80 font-semibold">
                    ({effectiveReviewsTotal} {effectiveReviewsTotal === 1 ? "opinión" : "opiniones"})
                  </span>
                </>
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 text-gray-400" />
                  <span className="opacity-80 font-semibold">Sin opiniones aún</span>
                </>
              )}
              <span className="text-[10.5px] text-amber-700 dark:text-amber-300 font-black underline ml-1">
                • Calificar
              </span>
            </button>

            <div className="flex items-center gap-3 text-[11.5px] font-semibold text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {ficha?.tiempoPreparacion ? `${ficha.tiempoPreparacion} min` : "1 - 2 min"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                {ficha?.rendimiento || "1 porción"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {stockMax > 0 ? `${stockMax} disp.` : "Agotado"}
              </span>
            </div>
          </div>

          {/* ═══ BENEFICIOS EXCLUSIVOS DEL EVENTO (FESTIVAL DROP HIGHLIGHT) ═══ */}
          {eventInfo && (
            <div className="mx-4 sm:mx-6 mb-3 p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 via-rose-950/10 to-amber-950/20 dark:from-purple-950/40 dark:via-rose-950/20 dark:to-amber-950/40 border border-purple-300/40 dark:border-purple-600/40 shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      {eventInfo.nombre}
                      <span className="text-[10px] font-black bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md">
                        {eventInfo.tipo === "Descuento"
                          ? "DESCUENTO"
                          : eventInfo.tipo === "Promoción Precio"
                          ? "PRECIO ESPECIAL"
                          : eventInfo.tipo === "Añadir Insumos"
                          ? "TOPPINGS EXTRA GRATIS"
                          : eventInfo.tipo === "COMBO_ESPECIAL"
                          ? "COMBO AHORRO"
                          : eventInfo.tipo === "PROMOCION_2X1"
                          ? "PROMO 2X1"
                          : "FESTIVAL DROP"}
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                      {eventInfo.descripcion || "Receta conmemorativa de edición limitada con precio y presentación especial."}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/50 text-center">
                {eventInfo.tipo === "Añadir Insumos" ? (
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-purple-100 dark:border-purple-900/40 col-span-2">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Toppings Incluidos Sin Costo</p>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 truncate">
                      {Array.isArray(eventInfo.insumosAsociados) && eventInfo.insumosAsociados.length > 0
                        ? eventInfo.insumosAsociados.map(i => i.nombre).join(" + ")
                        : "Toppings seleccionados gratis"}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-2 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-purple-100 dark:border-purple-900/40">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Ahorro Directo</p>
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {eventInfo.savings > 0 ? `$${eventInfo.savings.toLocaleString('es-CO')} (-${eventInfo.discountPercent}%)` : `${eventInfo.discountPercent}% OFF`}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-purple-100 dark:border-purple-900/40">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Receta Exclusiva</p>
                      <p className="text-xs font-black text-purple-600 dark:text-purple-400">100% Gourmet</p>
                    </div>
                  </>
                )}
                <div className="p-2 rounded-xl bg-white/70 dark:bg-gray-800/70 border border-purple-100 dark:border-purple-900/40">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Disponibilidad</p>
                  <p className={`text-xs font-black ${eventInfo.vigencia?.urgente ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-amber-600 dark:text-amber-400'}`}>
                    {eventInfo.vigencia?.label || (eventInfo.formattedDate || "Limitada")}
                  </p>
                  {eventInfo.formattedDate && (
                    <p className="text-[9px] text-gray-400 mt-0.5">Hasta {eventInfo.formattedDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ 2. TABS NAVIGATION (CONDICIONADO: BEBIDAS TIENEN SABORES; COMIDA TIENE PERSONALIZAR Y ADICIONES) ═══ */}
          <div className="px-4 sm:px-6 pt-3 pb-2 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl overflow-x-auto no-scrollbar">
              {isDrink ? (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab("sabores")}
                    className={`flex-1 min-w-[120px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      activeTab === "sabores"
                        ? "bg-white dark:bg-gray-900 text-[#f05454] dark:text-red-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <span>🥤</span>
                    <span>Sabores Gaseosas</span>
                    {selectedFlavor && (
                      <span className="h-4 px-1.5 rounded-full bg-[#f05454] text-white text-[10px] flex items-center justify-center font-black">
                        1/1
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("ficha")}
                    className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      activeTab === "ficha"
                        ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ficha Técnica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("resenas")}
                    className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      activeTab === "resenas"
                        ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Reseñas</span>
                    {effectiveReviewsTotal > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                        {effectiveReviewsTotal}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {personalizables.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("personalizar")}
                      className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        activeTab === "personalizar"
                          ? "bg-white dark:bg-gray-900 text-[#f05454] dark:text-red-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Personalizar</span>
                      {removedIngredients.length > 0 && (
                        <span className="h-4 w-4 rounded-full bg-[#f05454] text-white text-[10px] flex items-center justify-center font-black">
                          {removedIngredients.length}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab("adiciones")}
                    className={`flex-1 min-w-[100px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      activeTab === "adiciones"
                        ? "bg-white dark:bg-gray-900 text-[#f05454] dark:text-red-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>Adiciones</span>
                    {selectedAdditions.length > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-full bg-[#f05454] text-white text-[10px] flex items-center justify-center font-black">
                        {selectedAdditions.length}
                      </span>
                    )}
                  </button>

                  {allBebidas.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("bebidas")}
                      className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        activeTab === "bebidas"
                          ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <span>🥤</span>
                      <span>Bebidas</span>
                      {selectedDrinks.length > 0 && (
                        <span className="h-4 min-w-[16px] px-1 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                          {selectedDrinks.length}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab("ficha")}
                    className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      activeTab === "ficha"
                        ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ficha Técnica</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("resenas")}
                    className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                      activeTab === "resenas"
                        ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>Reseñas</span>
                    {effectiveReviewsTotal > 0 && (
                      <span className="h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                        {effectiveReviewsTotal}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ═══ 3. TAB CONTENT PANELS ═══ */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* ─── TAB 0: SABORES Y VARIANTES DE GASEOSAS (ESTILO EL CORRAL) ─── */}
            {isDrink && activeTab === "sabores" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5 uppercase tracking-wide">
                      <span>🥤</span>
                      Variantes de Bebida
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {realVariants.length > 1
                        ? "Selecciona la variante de tu preferencia:"
                        : "Elige la temperatura de servicio para tu bebida:"}
                    </p>
                  </div>
                  {realVariants.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-900/50">
                      <span className="text-[11px] font-black text-[#f05454] dark:text-red-400 uppercase tracking-wider">
                        Elegir uno
                      </span>
                      <span className="text-[11px] font-black text-white bg-[#f05454] px-1.5 py-0.2 rounded-full">
                        1/1
                      </span>
                    </div>
                  )}
                </div>

                {/* Radio List of Real Variants */}
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                  {realVariants.map((variant) => {
                    const isSelected = (selectedVariant?.idVariante || selectedVariant?.id) === (variant.idVariante || variant.id);
                    const meta = getDrinkBrandMeta(variant.nombre || producto.nombre);
                    return (
                      <div
                        key={variant.idVariante || variant.id || variant.nombre}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all cursor-pointer select-none active:scale-[0.99] ${
                          isSelected
                            ? "border-[#f05454] bg-red-50/70 dark:bg-red-950/30 shadow-xs ring-2 ring-red-400/40"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                      >
                        {/* Flavor Thumbnail + Brand & Name */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200/80 dark:border-gray-700 shadow-2xs flex items-center justify-center p-1">
                            <img
                              src={getVariantImage(variant.nombre) || variant.imagen || productImage}
                              alt={variant.nombre}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-gray-900 dark:text-gray-100 font-black text-xs sm:text-sm truncate">
                                {variant.nombre}
                              </p>
                              <span className={`text-[9.5px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0 ${meta.badgeColor}`}>
                                {meta.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {meta.marca} • ${Number(variant.precio || producto.precio).toLocaleString("es-CO")}
                            </p>
                          </div>
                        </div>

                        {/* Radio circle button */}
                        <div className="shrink-0 flex items-center justify-center">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-[#f05454] bg-[#f05454]"
                                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── TAB 1: PERSONALIZAR INGREDIENTES ─── */}
            {!isDrink && activeTab === "personalizar" && personalizables.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-red-500" />
                      Mise en Place & Exclusiones
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Toca los ingredientes que deseas <span className="text-red-500 font-bold">quitar</span> de tu preparación:
                    </p>
                  </div>
                  {removedIngredients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRemovedIngredients([])}
                      className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      Restablecer todo
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {personalizables.map((ing) => {
                    const isRemoved = removedIngredients.includes(ing.nombre);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleRemoveIngredient(ing.nombre)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer active:scale-98 select-none ${
                          isRemoved
                            ? "border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 shadow-xs ring-2 ring-red-400/40"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-xl shrink-0">{ing.icono}</span>
                          <span className={`truncate ${isRemoved ? "line-through opacity-75" : ""}`}>
                            {ing.nombre}
                          </span>
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shrink-0 transition-colors ${
                            isRemoved
                              ? "bg-red-500 text-white"
                              : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                          }`}
                        >
                          {isRemoved ? "Sin" : "Con"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Banner de orden personalizada para cocina */}
                {removedIngredients.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs">
                    <Info className="w-4 h-4 text-red-600 shrink-0" />
                    <p className="text-red-700 dark:text-red-300 font-bold">
                      Comanda a cocina:{" "}
                      <span className="underline">
                        Sin {removedIngredients.map((r) => r.toLowerCase()).join(", Sin ")}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 2: ADICIONES GOURMET (TOPPINGS & EXTRAS) ─── */}
            {!isDrink && activeTab === "adiciones" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Toppings y Extras Gourmet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Agrega ingredientes premium para enriquecer tu comida:
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {filteredAdiciones.length} opciones
                  </span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {filteredAdiciones.map((ad) => {
                    const adId = ad.idAdicion || ad.id;
                    const selectedObj = selectedAdditions.find((a) => (a.idAdicion || a.id) === adId);
                    const isSelected = Boolean(selectedObj);
                    const itemQty = selectedObj?.cantidad || 1;
                    const adImg = getAdicionDisplayImage(ad);

                    return (
                      <div
                        key={adId}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? "border-[#f05454] bg-red-50/60 dark:bg-red-950/30 shadow-xs ring-2 ring-red-400/30"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                      >
                        {/* Avatar / Photo + Info */}
                        <div
                          onClick={() => toggleAddition(ad)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <img
                            src={adImg}
                            alt={ad.nombre}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-2xs border border-gray-100 dark:border-gray-700"
                          />
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-gray-100 font-black text-xs sm:text-sm truncate">
                              {ad.nombre}
                            </p>
                            <p className="text-[#f05454] dark:text-red-400 font-black text-xs mt-0.5">
                              +${Number(ad.precio).toLocaleString("es-CO")}
                            </p>
                          </div>
                        </div>

                        {/* Stepper or Add Button */}
                        {isSelected ? (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2 py-1 rounded-xl border border-red-200 dark:border-red-900/60 shadow-xs shrink-0">
                            <button
                              type="button"
                              onClick={(e) => changeAdditionQty(adId, -1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Restar cantidad"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <span className="font-black text-gray-900 dark:text-gray-100 min-w-5 text-center text-xs">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => changeAdditionQty(adId, 1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Sumar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleAddition(ad)}
                            className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-[#f05454] hover:text-white text-gray-700 dark:text-gray-200 text-xs font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── TAB 3: BEBIDAS & ACOMPAÑANTES ─── */}
            {!isDrink && activeTab === "bebidas" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <span>🥤</span>
                      Bebidas Frías & Acompañamientos
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      El maridaje ideal para disfrutar tu pedido al máximo:
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {allBebidas.length} opciones
                  </span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {allBebidas.map((drink) => {
                    const dId = drink.id || drink.idProducto;
                    const selectedObj = selectedDrinks.find((d) => (d.id || d.idProducto) === dId);
                    const isSelected = Boolean(selectedObj);
                    const itemQty = selectedObj?.cantidad || 1;
                    const dStock = Number(drink.stock !== undefined ? drink.stock : 30);

                    return (
                      <div
                        key={dId}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-xs ring-2 ring-blue-400/40"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                      >
                        <div
                          onClick={() => dStock > 0 && toggleDrink(drink)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          {drink.imagen && typeof drink.imagen === "string" && drink.imagen.startsWith("http") ? (
                            <img
                              src={drink.imagen}
                              alt={drink.nombre}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-2xs border border-gray-100 dark:border-gray-700"
                            />
                          ) : (
                            <span className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                              {drink.imagen || "🥤"}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-gray-900 dark:text-gray-100 font-black text-xs sm:text-sm truncate">
                              {drink.nombre}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-blue-600 dark:text-blue-400 font-black text-xs">
                                ${Number(drink.precio).toLocaleString("es-CO")}
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  dStock <= 5 ? "text-amber-600" : "text-emerald-600 dark:text-emerald-400"
                                }`}
                              >
                                {dStock > 0 ? `${dStock} disp.` : "Agotado"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2 py-1 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-xs shrink-0">
                            <button
                              type="button"
                              onClick={(e) => changeDrinkQty(dId, -1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Restar cantidad"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                            <span className="font-black text-gray-900 dark:text-gray-100 min-w-5 text-center text-xs">
                              {itemQty}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => changeDrinkQty(dId, 1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Sumar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={dStock <= 0}
                            onClick={() => toggleDrink(drink)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95 shrink-0 ${
                              dStock > 0
                                ? "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 cursor-pointer"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── TAB 4: FICHA TÉCNICA OFICIAL ─── */}
            {activeTab === "ficha" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Ficha Técnica Oficial del Producto
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Estándares de calidad, porciones, almacenamiento y preparación:
                    </p>
                  </div>
                </div>

                {/* Grid de Métricas Técnicas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-center">
                    <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-extrabold text-amber-700 dark:text-amber-400 tracking-wider">
                      Preparación
                    </span>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-0.5">
                      {specs.tiempoPrep} min
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 text-center">
                    <Utensils className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-extrabold text-blue-700 dark:text-blue-400 tracking-wider">
                      Rendimiento
                    </span>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-0.5">
                      {specs.rendimiento}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 text-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-extrabold text-emerald-700 dark:text-emerald-400 tracking-wider">
                      Peso Aprox.
                    </span>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-0.5">
                      {specs.peso}
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200/60 dark:border-purple-900/40 text-center">
                    <Zap className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-400 tracking-wider">
                      Calorías
                    </span>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-0.5">
                      {specs.calorias}
                    </p>
                  </div>
                </div>

                {/* Receta e Insumos */}
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3.5 border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <h4 className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌾</span> Ingredientes Oficiales que Componen la Receta:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(() => {
                      let list = [];
                      if (ficha?.detalles && Array.isArray(ficha.detalles) && ficha.detalles.length > 0) {
                        list = ficha.detalles.map((d) => ({
                          nombre: d.insumo?.nombre || d.nombreInsumo || "Insumo",
                          cant: d.cantidad ? `${d.cantidad} ${d.unidadMedida || d.insumo?.unidadMedida || ""}` : ""
                        }));
                      } else if (ficha?.ingredientes && Array.isArray(ficha.ingredientes) && ficha.ingredientes.length > 0) {
                        list = ficha.ingredientes.map((i) => ({ nombre: String(i), cant: "" }));
                      } else {
                        const nameLower = String(producto?.nombre || "").toLowerCase();
                        if (nameLower.includes("agua") || nameLower.includes("gaseosa") || nameLower.includes("coca") || nameLower.includes("pepsi") || nameLower.includes("postob")) {
                          list = [
                            { nombre: "Bebida embotellada sellada", cant: specs.peso },
                            { nombre: "Servida fría", cant: "Temperatura óptima" }
                          ];
                        } else if (nameLower.includes("francesa") || nameLower.includes("corral") || nameLower.includes("casco") || nameLower.includes("espiral")) {
                          list = [
                            { nombre: "Papas seleccionadas premium", cant: specs.peso },
                            { nombre: "Sal marina y especias de la casa", cant: "Al gusto" },
                            { nombre: "Aceite vegetal para fritura", cant: "30ml" }
                          ];
                        } else if (nameLower.includes("perro")) {
                          list = [
                            { nombre: "Pan perro artesanal", cant: "1 und" },
                            { nombre: "Salchicha premium seleccionada", cant: "120g" },
                            { nombre: "Tocineta ahumada crujiente", cant: "30g" },
                            { nombre: "Queso mozzarella fundido", cant: "40g" },
                            { nombre: "Ripio de papa y salsas de la casa", cant: "Al gusto" }
                          ];
                        } else if (nameLower.includes("salchipapa")) {
                          list = [
                            { nombre: "Papas francesas crujientes", cant: "250g" },
                            { nombre: "Salchichas premium picadas", cant: "180g" },
                            { nombre: "Tocineta ahumada en cubos", cant: "40g" },
                            { nombre: "Queso mozzarella fundido", cant: "50g" },
                            { nombre: "Salsas de la casa", cant: "40ml" }
                          ];
                        } else if (nameLower.includes("combo")) {
                          list = [
                            { nombre: "Hamburguesas Clásicas de Res", cant: "2 und" },
                            { nombre: "Porción de papas a la francesa", cant: "1 und" },
                            { nombre: "Gaseosas frías 400ml", cant: "2 und" }
                          ];
                        } else {
                          list = [
                            { nombre: "Pan brioche artesanal", cant: "1 und" },
                            { nombre: "Carne de res 80/20 seleccionada", cant: "150g" },
                            { nombre: "Tocineta ahumada", cant: "30g" },
                            { nombre: "Queso cheddar fundido", cant: "40g" },
                            { nombre: "Vegetales frescos y salsas de la casa", cant: "Al gusto" }
                          ];
                        }
                      }
                      return list.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-750 text-xs"
                        >
                          <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            {item.nombre}
                          </span>
                          {item.cant && (
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              {item.cant}
                            </span>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Condiciones de Conservación y Procedimiento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                    <span className="font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10.5px]">
                      Conservación & Almacenamiento:
                    </span>
                    <p className="text-gray-600 dark:text-gray-300">
                      {ficha?.condicionesConservacion ||
                        ficha?.almacenamiento ||
                        ficha?.condicionesAlmacenamiento ||
                        (() => {
                          const n = String(producto?.nombre || "").toLowerCase();
                          if (n.includes("agua") || n.includes("gaseosa") || n.includes("coca") || n.includes("pepsi") || n.includes("postob")) {
                            return "Mantener en refrigeración de 2°C a 6°C para conservar su frescura óptima.";
                          }
                          if (n.includes("francesa") || n.includes("corral") || n.includes("casco")) {
                            return "Mantener congelado a -18°C. Freír en caliente sin descongelar previamente.";
                          }
                          return "Mantener en refrigeración de 0°C a 4°C antes de la cocción inmediata.";
                        })()}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                    <span className="font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10.5px]">
                      Procedimiento de Cocina:
                    </span>
                    <p className="text-gray-600 dark:text-gray-300 italic line-clamp-3">
                      {ficha?.procedimiento ||
                        (() => {
                          const n = String(producto?.nombre || "").toLowerCase();
                          if (n.includes("agua") || n.includes("gaseosa") || n.includes("coca") || n.includes("pepsi") || n.includes("postob")) {
                            return "Verificar sello hermético, servir bien fría en vaso con hielo a petición del cliente.";
                          }
                          if (n.includes("francesa") || n.includes("corral") || n.includes("casco")) {
                            return "Freír en aceite limpio a 175°C durante 4 a 5 minutos hasta alcanzar el dorado crujiente ideal.";
                          }
                          if (n.includes("perro")) {
                            return "Calentar pan al vapor, sellar salchicha a la plancha, fundir queso y coronar con ripio y salsas.";
                          }
                          return "Asar proteína a la plancha a 180°C, fundir queso, tostar pan con mantequilla y ensamblar con salsas.";
                        })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 5: RESEÑAS Y OPINIONES DE COMENSALES (ESPACIO DEDICADO) ─── */}
            {activeTab === "resenas" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      Opiniones de Clientes & Comensales
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Experiencias reales de quienes han degustado este plato:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWriteReview((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5 shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{showWriteReview ? "Cerrar" : "Calificar / Opinar"}</span>
                  </button>
                </div>

                {/* Score Summary Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white dark:from-amber-950/30 dark:via-gray-850 dark:to-gray-900 border border-amber-200/80 dark:border-amber-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-amber-500 text-white shadow-md shrink-0">
                      {effectiveReviewsTotal > 0 ? (
                        <>
                          <span className="text-2xl font-black leading-none">{effectiveRating.toFixed(1)}</span>
                          <span className="text-[10px] font-bold tracking-widest uppercase mt-0.5">de 5</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-6 h-6 fill-white text-white" />
                          <span className="text-[9px] font-black tracking-wider uppercase mt-0.5">Nuevo</span>
                        </>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              effectiveReviewsTotal > 0 && s <= Math.round(effectiveRating) ? "fill-amber-500" : "opacity-25"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200 mt-1">
                        {effectiveReviewsTotal > 0
                          ? `Basado en ${effectiveReviewsTotal} ${effectiveReviewsTotal === 1 ? "opinión verificada" : "opiniones verificadas"}`
                          : "Sin opiniones registradas aún"}
                      </p>
                      {effectiveReviewsTotal > 0 ? (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <ThumbsUp className="w-3 h-3" />
                          {Math.round(
                            (reviewsData.resenas.filter((r) => (r.puntuacion || 5) >= 4).length / (reviewsData.resenas.length || 1)) * 100
                          )}% de comensales recomiendan este plato
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                          Tu opinión ayudará a otros comensales a elegir
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
                    <Award className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Receta Artesanal Certificada</span>
                  </div>
                </div>

                {/* ═══ FORMULARIO INTERACTIVO PARA ESCRIBIR / PUBLICAR RESEÑA ═══ */}
                {showWriteReview && (
                  <form
                    onSubmit={handleSubmitReview}
                    className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-dashed border-amber-300 dark:border-amber-800/80 space-y-3.5 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 pb-2">
                      <span className="text-xs font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-amber-500" />
                        Deja tu Calificación Gastronómica
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-700 dark:text-amber-400">
                        {newRating === 5 && "⭐⭐⭐⭐⭐ ¡Excepcional! Lo amé"}
                        {newRating === 4 && "⭐⭐⭐⭐ Muy bueno y sabroso"}
                        {newRating === 3 && "⭐⭐⭐ Bueno / Aceptable"}
                        {newRating === 2 && "⭐⭐ Regular"}
                        {newRating === 1 && "⭐ No me gustó"}
                      </span>
                    </div>

                    {/* Interactive Star Picker */}
                    <div>
                      <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        Puntuación general (haz clic para calificar):
                      </span>
                      <div className="flex items-center gap-2 py-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewRating(s)}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95"
                            title={`Calificar con ${s} estrellas`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                s <= (hoverRating || newRating)
                                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Guest Name if not logged in */}
                    {(!user || !user.nombre) && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Tu Nombre o Apodo:
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="Ej. Sofía Morales"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    )}

                    {/* Comment Textarea */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        ¿Qué tal estuvo la cocción, temperatura y salsas?
                      </label>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Cuéntale a otros comensales qué fue lo que más disfrutaste de este plato..."
                        className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                      />
                    </div>

                    {reviewFeedback && (
                      <div
                        className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          reviewFeedback.type === "success"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                            : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-300"
                        }`}
                      >
                        {reviewFeedback.type === "success" ? (
                          <Check className="w-4 h-4 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 shrink-0" />
                        )}
                        <span>{reviewFeedback.message}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowWriteReview(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submittingReview ? (
                          <span>Publicando...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Publicar Reseña</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de Reseñas */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {loadingReviews ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Cargando opiniones de clientes...
                    </div>
                  ) : reviewsData.resenas.length > 0 ? (
                    reviewsData.resenas.map((r, i) => (
                      <div
                        key={r.id || r.idResena || i}
                        className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-2xl border border-gray-150 dark:border-gray-750 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f05454] to-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
                              {r.usuario?.nombre ? r.usuario.nombre.slice(0, 2).toUpperCase() : "C"}
                            </div>
                            <span className="text-xs font-black text-gray-900 dark:text-gray-100 truncate">
                              {r.usuario ? `${r.usuario.nombre} ${r.usuario.apellidos || ""}`.trim() : "Comensal Gourmet"}
                            </span>
                            <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5 shrink-0">
                              <Check className="w-2.5 h-2.5" /> Compra verificada
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {formatFechaRelativa(r.fecha || r.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 pl-9">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= (r.puntuacion || 5) ? "fill-amber-500" : "opacity-25"}`}
                            />
                          ))}
                        </div>

                        {r.comentario && (
                          <p className="text-xs text-gray-700 dark:text-gray-300 pl-9 leading-relaxed font-medium">
                            "{r.comentario}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 px-4 bg-gray-50/70 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                      </div>
                      <p className="text-xs font-black text-gray-800 dark:text-gray-200">
                        Aún no hay opiniones registradas para este plato
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                        ¡Sé el primero en compartir tu experiencia gastronómica y calificar este plato!
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowWriteReview(true)}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Escribir Primera Reseña</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ 4. NOTAS ESPECIALES PARA COCINA (GLOBAL) ═══ */}
            <div className="pt-2 border-t border-gray-150 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-amber-500" />
                  Instrucciones o Notas Especiales
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Opcional
                </span>
              </div>

              {/* Quick Tags Chips */}
              <div className="flex flex-wrap gap-1.5">
                {(isDrink ? QUICK_DRINK_TAGS : QUICK_KITCHEN_TAGS).map((tag) => {
                  const active = customObservation.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleQuickTag(tag)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer select-none active:scale-95 ${
                        active
                          ? "bg-amber-500 border-amber-500 text-white shadow-xs"
                          : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200/70"
                      }`}
                    >
                      {active ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Input */}
              <input
                type="text"
                placeholder={isDrink ? "Ej: Vaso con hielo adicional, sin pitillo..." : "Ej: Carne 3/4, servilletas extras, salsas en pote aparte..."}
                value={customObservation}
                onChange={(e) => setCustomObservation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#f05454] transition"
              />
            </div>
          </div>
        </div>

        {/* ═══ 5. STICKY ACTION BAR & TOTALIZER FOOTER ═══ */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 z-30">
          {/* Left: Product Quantity Stepper */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-center font-black hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-35 transition cursor-pointer active:scale-95 shadow-2xs"
                title="Restar cantidad del producto"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>
              <span className="w-8 text-center text-sm font-black text-gray-900 dark:text-gray-100">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(stockMax, q + 1))}
                disabled={quantity >= stockMax}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-center font-black hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-35 transition cursor-pointer active:scale-95 shadow-2xs"
                title="Aumentar cantidad del producto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Breakdown summary on small screens */}
            <div className="sm:hidden text-right">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                Total a pagar
              </span>
              <span className="text-lg font-black text-[#f05454] dark:text-red-400">
                ${grandTotal.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Center: Detailed Breakdown on Desktop */}
          <div className="hidden sm:flex flex-col text-right">
            {isDrink ? (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 justify-end">
                <span className="text-[#f05454] dark:text-red-400 font-black">{selectedVariant?.nombre || selectedFlavor?.nombre}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-500 dark:text-gray-400 justify-end">
                <span>Base: ${basePrice.toLocaleString("es-CO")}</span>
                {additionsUnitPrice > 0 && <span>+ Extras: ${additionsUnitPrice.toLocaleString("es-CO")}</span>}
                {drinksTotal > 0 && <span>+ Bebidas: ${drinksTotal.toLocaleString("es-CO")}</span>}
              </div>
            )}
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total:</span>
              <span className="text-xl font-black text-[#f05454] dark:text-red-400 leading-none">
                ${grandTotal.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Right: Primary CTA Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#f05454] hover:bg-[#d94444] text-white font-black text-sm shadow-[0_8px_20px_rgba(240,84,84,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shrink-0"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>
              {mode === "pos" ? "Agregar al Pedido" : "Agregar al Carrito"} • ${grandTotal.toLocaleString("es-CO")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FastFoodProductModal;
