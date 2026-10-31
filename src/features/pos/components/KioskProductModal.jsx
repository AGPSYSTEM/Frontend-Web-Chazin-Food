import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Minus, Check, Sparkles, Flame, PlusCircle } from "lucide-react";
import { motion } from "motion/react";

export default function KioskProductModal({
  isOpen,
  onClose,
  producto,
  allAdiciones = [],
  onConfirmAdd
}) {
  const [cantidad, setCantidad] = useState(1);
  const [selectedAdiciones, setSelectedAdiciones] = useState([]);
  const [observacion, setObservacion] = useState("");

  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setSelectedAdiciones([]);
      setObservacion("");
    }
  }, [isOpen, producto]);

  if (!producto) return null;

  const now = new Date();
  const eventos = Array.isArray(producto.eventos) ? producto.eventos : [];
  const activeEvent = eventos.find((e) => {
    if (e.estado !== 1 && e.estado !== "Activo" && e.estado !== undefined) return false;
    if (e.fechaFin && now > new Date(`${e.fechaFin}T23:59:59`)) return false;
    if (e.fechaInicio && now < new Date(`${e.fechaInicio}T00:00:00`)) return false;
    return true;
  });

  const is2x1Promo = Boolean(
    activeEvent?.tipo === "2X1" ||
    activeEvent?.nombre?.toLowerCase().includes("2x1") ||
    producto.is2x1Promo ||
    producto.nombre?.toLowerCase().includes("2x1")
  );

  const discountPercent = activeEvent?.descuentoPorcentaje ? Number(activeEvent.descuentoPorcentaje) : 0;
  const originalPrice = Number(producto.precio || 0);
  const basePrice = discountPercent > 0
    ? Math.round(originalPrice * (1 - discountPercent / 100))
    : originalPrice;

  const adicionesTotalPerUnit = selectedAdiciones.reduce(
    (sum, a) => sum + (Number(a.precio) || 0) * (Number(a.cantidad) || 1),
    0
  );

  const unitTotal = basePrice + adicionesTotalPerUnit;
  const grandTotal = unitTotal * cantidad;

  const formatPrice = (val) => `$${Number(val || 0).toLocaleString("es-CO")}`;

  const toggleAdicion = (adicion) => {
    setSelectedAdiciones((prev) => {
      const exists = prev.some((a) => (a.id || a.idAdicion) === (adicion.id || adicion.idAdicion));
      if (exists) {
        return prev.filter((a) => (a.id || a.idAdicion) !== (adicion.id || adicion.idAdicion));
      } else {
        return [
          ...prev,
          {
            ...adicion,
            id: adicion.id || adicion.idAdicion,
            idAdicion: adicion.idAdicion || adicion.id,
            cantidad: 1,
            precio: Number(adicion.precio || adicion.precioAdicion || 0)
          }
        ];
      }
    });
  };

  const handleAdd = () => {
    onConfirmAdd({
      producto,
      cantidad,
      adiciones: selectedAdiciones,
      observacion,
      is2x1Promo,
      unitTotal,
      grandTotal
    });
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[94vw] max-w-2xl max-h-[92vh] -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden border-2 border-gray-150 animate-in zoom-in-95 duration-200 focus:outline-hidden select-none">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-150">
            <div>
              <Dialog.Title className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {producto.nombre}
              </Dialog.Title>
              {is2x1Promo && (
                <span className="mt-1 inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 font-black text-xs px-3 py-1 rounded-full uppercase">
                  <Flame className="w-3.5 h-3.5 fill-amber-950" />
                  ¡Promoción 2x1 en Cocina!
                </span>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Cerrar ventana del producto"
                className="w-12 h-12 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <X className="w-6 h-6 stroke-[2.5]" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body: Scrollable area */}
          <div className="my-4 flex-1 overflow-y-auto pr-1 no-scrollbar space-y-6">
            {/* Image + short description */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white overflow-hidden shrink-0 shadow-md border border-gray-200 flex items-center justify-center">
                {producto.imagen ? (
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Sparkles className="w-10 h-10 text-amber-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm sm:text-base font-semibold text-gray-700">
                  {producto.descripcion || "Receta tradicional de la casa con ingredientes frescos y el toque único de Chazin Food."}
                </p>
                <div className="mt-2 text-2xl font-black text-[#A91B2E]">
                  {formatPrice(basePrice)} c/u
                </div>
              </div>
            </div>

            {/* Extras / Adiciones section with large touch targets */}
            {allAdiciones.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg sm:text-xl font-black text-gray-900">
                    ¿Deseas agregar adicionales?
                  </h4>
                  <span className="text-xs font-bold text-gray-400">Opcional</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {allAdiciones.map((adicion) => {
                    const adId = adicion.id || adicion.idAdicion;
                    const isSelected = selectedAdiciones.some((a) => (a.id || a.idAdicion) === adId);
                    const adPrice = Number(adicion.precio || adicion.precioAdicion || 0);

                    return (
                      <button
                        key={adId}
                        type="button"
                        onClick={() => toggleAdicion(adicion)}
                        aria-pressed={isSelected}
                        className={`min-h-[64px] p-3 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all cursor-pointer active:scale-97 ${
                          isSelected
                            ? "bg-red-50 border-[#A91B2E] shadow-sm ring-2 ring-red-400/40"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-[#A91B2E] border-[#A91B2E] text-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                          <span className="text-sm sm:text-base font-black text-gray-900">
                            {adicion.nombre}
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-[#A91B2E] shrink-0">
                          +{formatPrice(adPrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Observaciones rápidas */}
            <div>
              <label htmlFor="kiosk-obs" className="block text-sm font-black text-gray-700 mb-1.5">
                Instrucciones especiales (opcional):
              </label>
              <input
                id="kiosk-obs"
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Ej. Sin cebolla, salsa aparte, bien tostado..."
                className="w-full h-14 px-4 rounded-2xl bg-gray-50 border-2 border-gray-200 text-base font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:border-red-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Controls: Quantity Stepper + Big Add Button */}
          <div className="pt-4 border-t border-gray-150 flex flex-col sm:flex-row items-center gap-4">
            {/* Quantity Stepper (large buttons >= 64px) */}
            <div className="flex items-center justify-center gap-3 bg-gray-100 p-1.5 rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                disabled={cantidad <= 1}
                aria-label="Disminuir cantidad"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white text-gray-800 disabled:opacity-40 flex items-center justify-center shadow-xs text-2xl font-black active:scale-95 cursor-pointer"
              >
                <Minus className="w-6 h-6 stroke-[3]" />
              </button>
              <span className="w-12 text-center text-2xl sm:text-3xl font-black text-gray-900">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((q) => q + 1)}
                aria-label="Aumentar cantidad"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#A91B2E] text-white flex items-center justify-center shadow-md text-2xl font-black active:scale-95 cursor-pointer"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Giant Add Button */}
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 w-full min-h-[64px] sm:min-h-[72px] bg-linear-to-r from-[#A91B2E] to-red-600 hover:from-[#8F1626] hover:to-red-700 text-white text-xl sm:text-2xl font-black rounded-2xl shadow-xl shadow-red-700/25 flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer"
            >
              <PlusCircle className="w-7 h-7" />
              <span>Agregar al pedido • {formatPrice(grandTotal)}</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

