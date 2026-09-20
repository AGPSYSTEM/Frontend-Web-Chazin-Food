import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  X,
  Sparkles,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  Utensils,
  ShieldCheck,
  Star,
  Sliders,
  Flame,
  ChefHat,
  Info,
  Check,
  Send,
  UtensilsCrossed
} from "lucide-react";
import { extractPersonalizables, resolveNutritionalSpecs } from "@/shared/components/ui/FastFoodProductModal";
import { apiClient } from "@/shared/api/apiClient";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { FoodIcon, FoodIconBadge } from "@/shared/components/ui/FoodIcon";

const QUICK_KITCHEN_TAGS = [
  "Salsas aparte",
  "Bien cocido/a",
  "Término medio",
  "Sin sal adicional",
  "Empaque para llevar",
  "Poco picante",
  "Servir caliente"
];

function formatFecha(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = String(dateStr).split("T")[0].split("-");
    if (parts.length === 3) {
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const m = months[parseInt(parts[1], 10) - 1] || parts[1];
      return `${parseInt(parts[2], 10)} de ${m}`;
    }
    return new Date(dateStr).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return dateStr;
  }
}



export function PersonalizarEventoModal({
  isOpen,
  onClose,
  evento,
  producto: initialProducto,
  productosList = [],
  adicionesList = [],
  allBebidas = [],
  fichasMap = {},
  ratingsMap = {},
  onOpenResenas,
  onAddToCart,
  getProductQuantityInCart
}) {
  const { user, isAuthenticated } = useAuth?.() || {};

  // List of available products for this event
  const eventProducts = useMemo(() => {
    if (!evento) return [];
    if (evento.idProducto) {
      const p = productosList.find(
        (prod) => String(prod.id || prod.idProducto) === String(evento.idProducto)
      );
      return p ? [p] : initialProducto ? [initialProducto] : [];
    }
    if (evento.productosAsociados && Array.isArray(evento.productosAsociados) && evento.productosAsociados.length > 0) {
      return evento.productosAsociados
        .map((pa) => {
          const p = productosList.find(
            (prod) => String(prod.id || prod.idProducto) === String(pa.idProducto || pa.id)
          );
          if (p) {
            return {
              ...p,
              eventNuevoPrecio: pa.nuevoPrecio,
              eventDescuento: pa.descuento
            };
          }
          return null;
        })
        .filter(Boolean);
    }
    return initialProducto ? [initialProducto] : productosList.slice(0, 3);
  }, [evento, productosList, initialProducto]);

  const [selectedProduct, setSelectedProduct] = useState(initialProducto || null);
  const [cantidad, setCantidad] = useState(1);
  const [activeTab, setActiveTab] = useState("personalizar"); // "personalizar" | "adiciones" | "bebidas" | "resenas"
  const [selectedAdditions, setSelectedAdditions] = useState([]);
  const [removedIngredients, setRemovedIngredients] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState([]);
  const [customObservation, setCustomObservation] = useState("");

  // Reviews data & form
  const [reviewsData, setReviewsData] = useState({ promedio: 0, total: 0, resenas: [] });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null);

  // Initialize and reset on modal open
  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setActiveTab("personalizar");
      setSelectedAdditions([]);
      setRemovedIngredients([]);
      setSelectedDrinks([]);
      setCustomObservation("");
      setShowWriteReview(false);
      setReviewFeedback(null);
      if (initialProducto) {
        setSelectedProduct(initialProducto);
      } else if (eventProducts.length > 0) {
        setSelectedProduct(eventProducts[0]);
      }
    }
  }, [isOpen, initialProducto, eventProducts]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Nutritional and preparation specs
  const prodId = selectedProduct?.id || selectedProduct?.idProducto;
  const currentFicha = fichasMap[prodId] || selectedProduct?.ficha || null;
  const specs = useMemo(() => {
    if (!selectedProduct) return { peso: "350g", rendimiento: "1 porción", tiempoPrep: 8 };
    return resolveNutritionalSpecs(selectedProduct, currentFicha);
  }, [selectedProduct, currentFicha]);

  // Recipe ingredients extraction for Mise en Place
  const personalizables = useMemo(() => {
    if (!selectedProduct) return [];
    const list = extractPersonalizables(selectedProduct, currentFicha);
    if (list && list.length > 0) return list;

    // Fallback candidates
    const desc = String(selectedProduct.descripcion || "").toLowerCase();
    const fallbackCandidates = [
      { id: "cebolla", nombre: "Cebolla", icono: "onion", aliases: ["cebolla"] },
      { id: "tomate", nombre: "Tomate", icono: "tomato", aliases: ["tomate"] },
      { id: "lechuga", nombre: "Lechuga", icono: "lettuce", aliases: ["lechuga"] },
      { id: "queso", nombre: "Queso", icono: "cheese", aliases: ["queso", "cheddar", "mozzarella"] },
      { id: "tocineta", nombre: "Tocineta", icono: "bacon", aliases: ["tocineta", "tocino"] },
      { id: "salsas", nombre: "Salsas de la casa", icono: "sauce", aliases: ["salsa", "salsas", "tártara"] },
      { id: "ripio", nombre: "Ripio de papa", icono: "fries", aliases: ["ripio"] },
      { id: "jalapenos", nombre: "Jalapeños", icono: "pepper", aliases: ["jalapeño", "jalapeno", "picante"] }
    ];
    return fallbackCandidates.filter((c) => c.aliases.some((alias) => desc.includes(alias)));
  }, [selectedProduct, currentFicha]);

  // Fetch reviews for selected product
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

  useEffect(() => {
    if (isOpen && prodId) {
      fetchReviews();
    }
  }, [isOpen, prodId, fetchReviews]);

  // Submit review form inside tab
  const handleSubmitReview = async (e) => {
    e?.preventDefault();
    if (!prodId) return;
    if (newRating < 1) {
      setReviewFeedback({ type: "error", message: "Selecciona una calificación de 1 a 5 estrellas." });
      return;
    }
    if (!newComment.trim()) {
      setReviewFeedback({ type: "error", message: "Escribe un breve comentario sobre tu experiencia gastronómica." });
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
          id: created?.id || Date.now(),
          puntuacion: newRating,
          comentario: newComment.trim(),
          fecha: new Date().toISOString(),
          usuario: {
            nombre: user.nombre || "Tú",
            apellidos: user.apellidos || ""
          }
        };

        setReviewsData((prev) => {
          const nextTotal = prev.total + 1;
          const nextPromedio = ((prev.promedio * prev.total) + newRating) / nextTotal;
          return {
            total: nextTotal,
            promedio: nextPromedio,
            resenas: [newReviewItem, ...prev.resenas]
          };
        });

        setReviewFeedback({ type: "success", message: "¡Gracias! Tu reseña ha sido publicada con éxito." });
        setNewComment("");
        setTimeout(() => setShowWriteReview(false), 2000);
      } else {
        const guestItem = {
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
          const nextTotal = prev.total + 1;
          const nextPromedio = ((prev.promedio * prev.total) + newRating) / nextTotal;
          return {
            total: nextTotal,
            promedio: nextPromedio,
            resenas: [guestItem, ...prev.resenas]
          };
        });

        setReviewFeedback({ type: "success", message: "¡Gracias por calificar este plato!" });
        setNewComment("");
        setGuestName("");
        setTimeout(() => setShowWriteReview(false), 2000);
      }
    } catch (err) {
      setReviewFeedback({
        type: "error",
        message: err?.response?.data?.message || "No se pudo guardar la reseña. Inténtalo de nuevo."
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Ratings calculation
  const hasRealRatings = reviewsData.total > 0;
  const effectiveRating = useMemo(() => {
    if (hasRealRatings) {
      return { promedio: reviewsData.promedio, total: reviewsData.total, resenas: reviewsData.resenas };
    }
    const fromMap = selectedProduct ? ratingsMap[selectedProduct.id || selectedProduct.idProducto] : null;
    if (fromMap) return fromMap;
    return { promedio: 5.0, total: 0, resenas: [] };
  }, [hasRealRatings, reviewsData, selectedProduct, ratingsMap]);

  if (!isOpen || !evento) return null;

  // Price Calculation
  const basePrice = Number(selectedProduct?.precio || 0);
  let promoPrice = basePrice;
  let savings = 0;

  if (selectedProduct) {
    if (selectedProduct.eventNuevoPrecio) {
      promoPrice = Number(selectedProduct.eventNuevoPrecio);
    } else if (selectedProduct.eventDescuento) {
      promoPrice = basePrice * (1 - Number(selectedProduct.eventDescuento) / 100);
    } else if (evento.tipoEvento === "Promoción Precio" && evento.nuevoPrecio) {
      promoPrice = Number(evento.nuevoPrecio);
    } else if (evento.tipoEvento === "Descuento" && evento.descuento) {
      promoPrice = basePrice * (1 - Number(evento.descuento) / 100);
    } else if (evento.nuevoPrecio) {
      promoPrice = Number(evento.nuevoPrecio);
    }
    savings = Math.max(0, basePrice - promoPrice);
  }

  // Additions total
  const additionsTotal = selectedAdditions.reduce(
    (sum, a) => sum + (Number(a.precio) || 0) * (Number(a.cantidad) || 1),
    0
  );

  // Drinks total
  const drinksTotal = selectedDrinks.reduce(
    (sum, d) => sum + (Number(d.precio) || 0) * (Number(d.cantidad) || 1),
    0
  );

  const unitTotal = promoPrice + additionsTotal;
  const grandTotal = unitTotal * cantidad + drinksTotal;

  // Handlers
  const toggleAdicion = (ad) => {
    const adId = ad.idAdicion || ad.id;
    const exists = selectedAdditions.find((a) => (a.idAdicion || a.id) === adId);
    if (exists) {
      setSelectedAdditions(selectedAdditions.filter((a) => (a.idAdicion || a.id) !== adId));
    } else {
      setSelectedAdditions([
        ...selectedAdditions,
        {
          idAdicion: adId,
          id: adId,
          nombre: ad.nombre,
          precio: Number(ad.precio) || 0,
          cantidad: 1,
          imagen: ad.imagen || "sauce"
        }
      ]);
    }
  };

  const changeAdicionQty = (adId, delta, e) => {
    if (e) e.stopPropagation();
    setSelectedAdditions((prev) =>
      prev
        .map((a) => {
          if ((a.idAdicion || a.id) === adId) {
            const next = (a.cantidad || 1) + delta;
            return next > 0 ? { ...a, cantidad: next } : null;
          }
          return a;
        })
        .filter(Boolean)
    );
  };

  const toggleRemoveIngredient = (nombre) => {
    setRemovedIngredients((prev) =>
      prev.includes(nombre) ? prev.filter((i) => i !== nombre) : [...prev, nombre]
    );
  };

  const toggleDrink = (drink) => {
    const drinkId = drink.id || drink.idProducto;
    const exists = selectedDrinks.find((d) => (d.id || d.idProducto) === drinkId);
    if (exists) {
      setSelectedDrinks(selectedDrinks.filter((d) => (d.id || d.idProducto) !== drinkId));
    } else {
      setSelectedDrinks([
        ...selectedDrinks,
        {
          id: drinkId,
          idProducto: drinkId,
          nombre: drink.nombre,
          precio: Number(drink.precio) || 0,
          cantidad: 1,
          imagen: drink.imagen || "drink"
        }
      ]);
    }
  };

  const changeDrinkQty = (drinkId, delta, e) => {
    if (e) e.stopPropagation();
    setSelectedDrinks((prev) =>
      prev
        .map((d) => {
          if ((d.id || d.idProducto) === drinkId) {
            const next = (d.cantidad || 1) + delta;
            return next > 0 ? { ...d, cantidad: next } : null;
          }
          return d;
        })
        .filter(Boolean)
    );
  };

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

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;

    const eventNameTag = evento.nombreEvento || evento.nombre || "Evento Especial";
    const kitchenNotes = [
      removedIngredients.length > 0 ? `Sin ${removedIngredients.join(", Sin ")}` : "",
      customObservation.trim()
    ]
      .filter(Boolean)
      .join(". ");

    const itemToAdd = {
      id: selectedProduct.id || selectedProduct.idProducto,
      idProducto: selectedProduct.idProducto || selectedProduct.id,
      nombre: `${selectedProduct.nombre} (${eventNameTag})`,
      nombreOriginal: selectedProduct.nombre,
      precio: promoPrice,
      cantidad: cantidad,
      stock: Number(selectedProduct.stock || selectedProduct.stockActual || 50),
      imagen: selectedProduct.imagen,
      isEvento: true,
      eventoInfo: {
        idEvento: evento.id || evento.idEvento,
        nombre: eventNameTag,
        tipoEvento: evento.tipoEvento,
        icono: evento.icono || "party"
      },
      adiciones: selectedAdditions.map((a) => ({
        idAdicion: a.idAdicion,
        nombre: a.nombre,
        precio: Number(a.precio) || 0,
        cantidad: Number(a.cantidad) || 1,
        imagen: a.imagen || "sauce"
      })),
      ingredientesRemovidos: removedIngredients,
      observaciones: kitchenNotes || undefined
    };

    onAddToCart(itemToAdd, selectedDrinks);
    onClose();
  };

  // Stock check
  const stockTot = Number(selectedProduct?.stock || selectedProduct?.stockActual || 50);
  const inCart = getProductQuantityInCart ? getProductQuantityInCart(selectedProduct?.id || selectedProduct?.idProducto) : 0;
  const remainingStock = Math.max(0, stockTot - inCart);

  const heroImage =
    selectedProduct?.imagen ||
    selectedProduct?.imagenUrl ||
    selectedProduct?.urlImagen ||
    selectedProduct?.foto ||
    selectedProduct?.img;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      {/* 
        ESTRUCTURA DE TAMAÑO ESTABLE Y ROBUSTA:
        - max-w-2xl w-full: espacio amplio y estilizado idéntico a FastFoodProductModal.
        - h-[90vh] max-h-[860px] min-h-[580px]: fija la altura total de forma consistente.
        - flex flex-col: el modal no cambia ni salta de tamaño al pasar a "Mise en place" o a otra pestaña.
      */}
      <div className="bg-white dark:bg-gray-900 rounded-[32px] max-w-2xl w-full shadow-2xl flex flex-col h-[90vh] max-h-[860px] min-h-[580px] border border-gray-100 dark:border-gray-800 overflow-hidden relative transition-colors">
        
        {/* ── 1. Festival Drop Top Ribbon (Evento Activo) ── */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 text-white px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-black uppercase tracking-wider shadow-md shrink-0 z-30">
          <div className="flex items-center gap-2 min-w-0">
            <FoodIcon name={evento.icono || "party"} size={16} className="shrink-0 animate-pulse" />
            <span className="truncate">{evento.nombreEvento || evento.nombre || "Promoción Especial"}</span>
            <span className="hidden sm:inline-flex bg-white/20 backdrop-blur-xs text-[10px] px-2 py-0.5 rounded-full font-bold">
              {evento.tipoEvento || "EVENTO ESPECIAL"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-200 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{evento.fechaFin ? `Hasta ${formatFecha(evento.fechaFin)}` : "Tiempo Limitado"}</span>
          </div>
        </div>

        {/* ── Close Floating Button ── */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
          title="Cerrar modal (Esc)"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* ── Scrollable Body Area (Con altura flexible estable) ── */}
        <div className="overflow-y-auto flex-1 no-scrollbar">
          
          {/* ═══ 2. LUXURY DUAL-STAGE HERO PHOTO (ENCUADRE IMPECABLE) ═══ */}
          <div className="relative w-full h-52 sm:h-64 bg-gray-950 flex items-center justify-center overflow-hidden border-b border-gray-150 dark:border-gray-800">
            {/* Background Ambient Layer */}
            {heroImage ? (
              <>
                <img
                  src={heroImage}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-40 dark:opacity-50 saturate-200 pointer-events-none"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at center, rgba(168,85,247,0.22) 0%, rgba(79,70,229,0.12) 45%, transparent 70%)`
                  }}
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-indigo-950/50 to-gray-950" />
            )}

            {/* Dark gradient scrim at bottom to ensure 100% text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

            {/* Dish Photo in Foreground */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt={selectedProduct?.nombre}
                  className="max-h-full max-w-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 drop-shadow-xl">
                  <FoodIcon name={selectedProduct?.nombre} category={selectedProduct?.categoria} size={64} stroke={1.75} className="text-amber-400" />
                </div>
              )}
            </div>

            {/* Top-Left Badges */}
            <div className="absolute top-3.5 left-4 z-20 flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                <FoodIcon name={selectedProduct?.nombre} category={selectedProduct?.categoria} size={15} stroke={2} className="text-amber-400" />
                <span>{selectedProduct?.categoria || selectedProduct?.categoriaNombre || "Plato del Evento"}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {evento.tipoEvento === "Descuento"
                    ? `-${evento.descuento}% OFF`
                    : evento.tipoEvento || "Promoción Especial"}
                </span>
              </span>
            </div>

            {/* Bottom Overlay Title & Promo Price */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-end justify-between gap-3 text-white">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-white tracking-tight">
                  {selectedProduct?.nombre}
                </h2>
              </div>

              {/* Price Pill */}
              <div className="text-right shrink-0 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/25 shadow-xl">
                {savings > 0 && (
                  <span className="block text-[11px] text-gray-300 line-through font-bold">
                    ${basePrice.toLocaleString("es-CO")}
                  </span>
                )}
                <span className="text-base sm:text-xl font-black text-amber-300 drop-shadow-md">
                  ${promoPrice.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>

          {/* ═══ 3. SELECTOR DE PLATOS ASOCIADOS AL EVENTO (SI HAY MÁS DE 1) ═══ */}
          {eventProducts.length > 1 && (
            <div className="px-4 sm:px-6 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Elige el plato a personalizar:
                </span>
                <span className="text-[10.5px] font-bold text-gray-400">
                  {eventProducts.length} opciones
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                {eventProducts.map((p) => {
                  const isSelected = String(p.id || p.idProducto) === String(selectedProduct?.id || selectedProduct?.idProducto);
                  return (
                    <button
                      key={p.id || p.idProducto}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        setRemovedIngredients([]);
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                        isSelected
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30 font-black shadow-xs"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750"
                      }`}
                    >
                      <FoodIcon name={p.nombre} size={16} stroke={1.75} />
                      <span className="truncate max-w-[140px]">{p.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ 4. RATINGS & QUICK SPECS SUB-BAR ═══ */}
          <div className="px-4 sm:px-6 py-2.5 bg-gray-50 dark:bg-gray-850/70 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <button
              type="button"
              onClick={() => setActiveTab("resenas")}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-200/80 dark:hover:bg-amber-900/60 transition cursor-pointer border border-amber-300/40 dark:border-amber-800/60 shadow-2xs group"
              title="Ver calificaciones de este plato"
            >
              {effectiveRating.total > 0 ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span>{Number(effectiveRating.promedio || 5).toFixed(1)}</span>
                  <span className="opacity-80 font-semibold">
                    ({effectiveRating.total} {effectiveRating.total === 1 ? "opinión" : "opiniones"})
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

            <div className="flex items-center gap-3 text-[11.5px] font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {specs?.tiempoPrep ? `${specs.tiempoPrep} min` : "8 min"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-amber-500" />
                {specs?.rendimiento || "1 porción"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {remainingStock > 0 ? `${remainingStock} disp.` : "Agotado"}
              </span>
            </div>
          </div>

          {/* ═══ 5. DESCRIPCIÓN & PREPARACIÓN (MÁXIMA LEGIBILIDAD) ═══ */}
          {selectedProduct?.descripcion && (
            <div className="mx-4 sm:mx-6 mt-3.5 p-4 rounded-2xl bg-white dark:bg-gray-850 border-2 border-amber-300/80 dark:border-amber-600/50 shadow-sm flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-black text-xs text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    Descripción & Preparación:
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Receta de la Casa
                  </span>
                </div>
                <p className="text-sm sm:text-[15px] font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                  {selectedProduct.descripcion}
                </p>
              </div>
            </div>
          )}

          {/* ═══ 6. BENEFICIOS EXCLUSIVOS DEL EVENTO ═══ */}
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-sm shadow-xs font-bold mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-black text-xs text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                  Beneficios de esta Promoción:
                </span>
                {savings > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Ahorras ${savings.toLocaleString("es-CO")}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-purple-900/90 dark:text-purple-200 leading-relaxed font-medium">
                {evento.descripcion || "Disfruta de esta oferta gastronómica especial por tiempo limitado."}
              </p>
            </div>
          </div>

          {/* ═══ 7. SEGMENTED TABS NAVIGATION (IDÉNTICO A FASTFOODPRODUCTMODAL) ═══ */}
          <div className="px-4 sm:px-6 pt-3 pb-2 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-10 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-2xl overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("personalizar")}
                className={`flex-1 min-w-[105px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
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
                  <FoodIcon name="drink" size={13} className="shrink-0" />
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
                onClick={() => setActiveTab("resenas")}
                className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                  activeTab === "resenas"
                    ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Reseñas</span>
                {effectiveRating.total > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-black">
                    {effectiveRating.total}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ═══ 8. TAB CONTENT PANELS (CON MIN-HEIGHT PARA CERO SALTOS VISUALES) ═══ */}
          <div className="p-4 sm:p-6 space-y-5 min-h-[300px]">
            
            {/* ─── TAB 1: PERSONALIZAR (MISE EN PLACE & EXCLUSIONES) ─── */}
            {activeTab === "personalizar" && (
              <div className="space-y-3 animate-in fade-in duration-150">
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

                {personalizables.length > 0 ? (
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
                ) : (
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                    Este plato se sirve con la receta estándar de la casa. Si tienes alguna indicación especial, escríbela en las notas de abajo.
                  </div>
                )}

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

            {/* ─── TAB 2: ADICIONES GOURMET (TOPPINGS Y EXTRAS) ─── */}
            {activeTab === "adiciones" && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      Toppings y Extras Gourmet
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Agrega ingredientes premium para enriquecer tu plato:
                    </p>
                  </div>
                  <span className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {adicionesList.length} opciones
                  </span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {adicionesList.map((ad) => {
                    const adId = ad.idAdicion || ad.id;
                    const selectedObj = selectedAdditions.find((a) => (a.idAdicion || a.id) === adId);
                    const isSelected = Boolean(selectedObj);
                    const itemQty = selectedObj?.cantidad || 1;

                    return (
                      <div
                        key={adId}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 shadow-xs ring-2 ring-amber-400/40"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-750"
                        }`}
                      >
                        <div
                          onClick={() => toggleAdicion(ad)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 text-xl overflow-hidden border border-amber-100 dark:border-amber-900/30">
                            {ad.imagen && typeof ad.imagen === "string" && ad.imagen.startsWith("http") ? (
                              <img src={ad.imagen} alt={ad.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <FoodIcon name={ad.nombre || "sauce"} size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-gray-900 dark:text-gray-100 truncate">
                              {ad.nombre}
                            </p>
                            <p className="text-xs font-black text-amber-700 dark:text-amber-400">
                              +${Number(ad.precio || 0).toLocaleString("es-CO")}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-2 py-1 rounded-xl border border-amber-300 dark:border-amber-800 shadow-2xs">
                            <button
                              type="button"
                              onClick={(e) => changeAdicionQty(adId, -1, e)}
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
                              onClick={(e) => changeAdicionQty(adId, 1, e)}
                              className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/40 text-gray-700 dark:text-gray-200 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                              title="Sumar cantidad"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleAdicion(ad)}
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
            {activeTab === "bebidas" && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <FoodIcon name="drink" size={16} className="shrink-0" />
                      <span>Bebidas Frías & Acompañamientos</span>
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
                          onClick={() => toggleDrink(drink)}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer select-none"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 text-xl overflow-hidden border border-blue-100 dark:border-blue-900/30">
                            {drink.imagen && typeof drink.imagen === "string" && drink.imagen.startsWith("http") ? (
                              <img src={drink.imagen} alt={drink.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <FoodIcon name="drink" size={18} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-gray-900 dark:text-gray-100 truncate">
                              {drink.nombre}
                            </p>
                            <p className="text-xs font-black text-blue-600 dark:text-blue-400">
                              +${Number(drink.precio || 0).toLocaleString("es-CO")}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-2 py-1 rounded-xl border border-blue-300 dark:border-blue-800 shadow-2xs">
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
                            onClick={() => toggleDrink(drink)}
                            className="px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-200 text-xs font-black transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
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

            {/* ─── TAB 4: RESEÑAS Y CALIFICACIONES ─── */}
            {activeTab === "resenas" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Header Score Card */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                      <span className="text-base leading-none">
                        {effectiveRating.total > 0 ? Number(effectiveRating.promedio || 5).toFixed(1) : "5.0"}
                      </span>
                      <Star className="w-2.5 h-2.5 fill-current opacity-90 mt-0.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                        {effectiveRating.total > 0 ? "Opiniones de Clientes" : "Sé el primero en opinar"}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {effectiveRating.total > 0
                          ? `Basado en ${effectiveRating.total} ${effectiveRating.total === 1 ? "calificación verificada" : "calificaciones verificadas"}`
                          : "Califica el sabor y presentación de este plato"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowWriteReview(!showWriteReview)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>{showWriteReview ? "Ver Reseñas" : "Escribir Reseña"}</span>
                  </button>
                </div>

                {/* Formulario de Calificación */}
                {showWriteReview && (
                  <form onSubmit={handleSubmitReview} className="p-4 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-amber-300 dark:border-amber-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-900 dark:text-gray-100">
                        Tu Calificación
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        {newRating === 5 && "⭐⭐⭐⭐⭐ ¡Excelente!"}
                        {newRating === 4 && "⭐⭐⭐⭐ Muy bueno"}
                        {newRating === 3 && "⭐⭐⭐ Bueno"}
                        {newRating === 2 && "⭐⭐ Regular"}
                        {newRating === 1 && "⭐ No me gustó"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 py-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95"
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

                    {(!user || !user.nombre) && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                          Tu Nombre:
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

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-300 mb-1">
                        ¿Qué tal estuvo la preparación y sabor?
                      </label>
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Comparte tu experiencia con otros clientes..."
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
                        {reviewFeedback.type === "success" ? <Check className="w-4 h-4 shrink-0" /> : <Info className="w-4 h-4 shrink-0" />}
                        <span>{reviewFeedback.message}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowWriteReview(false)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {submittingReview ? <span>Publicando...</span> : <><Send className="w-3.5 h-3.5" /><span>Publicar</span></>}
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de Opiniones */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {loadingReviews ? (
                    <div className="py-8 text-center text-xs text-gray-400">
                      Cargando opiniones de clientes...
                    </div>
                  ) : effectiveRating.resenas && effectiveRating.resenas.length > 0 ? (
                    effectiveRating.resenas.map((r, i) => (
                      <div
                        key={r.id || r.idResena || i}
                        className="p-3 bg-gray-50 dark:bg-gray-800/70 rounded-2xl border border-gray-150 dark:border-gray-750 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 to-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
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
                            {formatFecha(r.fecha || r.createdAt)}
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
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ 9. NOTAS ESPECIALES PARA COCINA (GLOBAL) ═══ */}
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
                {QUICK_KITCHEN_TAGS.map((tag) => {
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

              {/* Custom Observation Input */}
              <input
                type="text"
                placeholder="Ej: Término medio, salsas aparte, servilletas adicionales..."
                value={customObservation}
                onChange={(e) => setCustomObservation(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-purple-600 transition"
              />
            </div>
          </div>
        </div>

        {/* ═══ 10. STICKY ACTION BAR & TOTALIZER FOOTER (IDÉNTICO A FASTFOODPRODUCTMODAL) ═══ */}
        <div className="p-3.5 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 z-30 shrink-0">
          
          {/* Left: Event Product Quantity Stepper */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-3">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xs">
              <button
                type="button"
                onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                disabled={cantidad <= 1}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-center font-black hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-35 transition cursor-pointer active:scale-95 shadow-2xs"
                title="Restar cantidad"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
              </button>
              <span className="w-8 text-center text-sm font-black text-gray-900 dark:text-gray-100">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((q) => Math.min(remainingStock, q + 1))}
                disabled={cantidad >= remainingStock}
                className="w-8 h-8 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex items-center justify-center font-black hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-35 transition cursor-pointer active:scale-95 shadow-2xs"
                title="Aumentar cantidad"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Breakdown summary on small screens */}
            <div className="sm:hidden text-right">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                Total a pagar
              </span>
              <span className="text-lg font-black text-purple-700 dark:text-purple-400">
                ${grandTotal.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Center: Detailed Breakdown on Desktop */}
          <div className="hidden sm:flex flex-col text-right">
            <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-gray-500 dark:text-gray-400 justify-end">
              <span>Promo: ${promoPrice.toLocaleString("es-CO")}</span>
              {additionsTotal > 0 && <span>+ Extras: ${additionsTotal.toLocaleString("es-CO")}</span>}
              {drinksTotal > 0 && <span>+ Bebidas: ${drinksTotal.toLocaleString("es-CO")}</span>}
            </div>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total:</span>
              <span className="text-xl font-black text-purple-700 dark:text-purple-400 leading-none">
                ${grandTotal.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          {/* Right: Primary CTA Button */}
          <button
            type="button"
            onClick={handleConfirmAddToCart}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 hover:from-purple-800 hover:to-indigo-700 text-white font-black text-sm shadow-[0_8px_20px_rgba(126,34,206,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] shrink-0"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
            <span>
              Agregar al Carrito • ${grandTotal.toLocaleString("es-CO")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PersonalizarEventoModal;
