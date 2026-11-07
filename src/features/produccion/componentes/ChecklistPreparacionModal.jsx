import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  Utensils,
  Sparkles,
  Minus,
  Plus,
  FileText
} from "lucide-react";
import { FoodIconBadge } from "@/shared/components/ui/FoodIcon";

const MOTIVOS_FRECUENTES = [
  "Insumos agotados",
  "Se quemó / Error en cocción",
  "Pan o insumo en mal estado",
  "Producto agotado en stock"
];

export function ChecklistPreparacionModal({
  isOpen,
  onClose,
  orden,
  onConfirmChecklist
}) {
  const productos = useMemo(() => {
    if (!orden) return [];
    if (Array.isArray(orden.productos) && orden.productos.length > 0) {
      return orden.productos;
    }
    return [
      {
        id: orden.id || 1,
        nombre: orden.platilloNombre || "Platillo Principal",
        cantidad: orden.cantidad || 1,
        observaciones: orden.observaciones || "",
        adiciones: []
      }
    ];
  }, [orden]);

  // Estado del checklist por índice:
  // status: null ("◽" sin verificar) | "ok" ("✅") | "fail" ("❌")
  const [itemsState, setItemsState] = useState([]);
  const [observacionCocina, setObservacionCocina] = useState("");
  const [validationError, setValidationError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && orden) {
      const saved = Array.isArray(orden.checklistPreparacion) ? orden.checklistPreparacion : null;
      const initial = productos.map((p, idx) => {
        const qty = Number(p.cantidad) || 1;
        const matched = saved ? (saved[idx] || saved.find(s => s.nombre === p.nombre)) : null;
        if (matched) {
          const isOk = Boolean(matched.completado) && Number(matched.cantidadPreparada ?? qty) >= qty;
          return {
            index: idx,
            id: p.id || idx + 1,
            idProducto: p.idProducto || null,
            idVariante: p.idVariante || null,
            nombre: p.nombre || `Producto #${idx + 1}`,
            cantidad: qty,
            status: isOk ? "ok" : "fail",
            cantidadPreparada: matched.cantidadPreparada !== undefined ? Number(matched.cantidadPreparada) : (isOk ? qty : 0),
            motivo: matched.motivo || matched.motivoNoPreparado || ""
          };
        }
        return {
          index: idx,
          id: p.id || idx + 1,
          idProducto: p.idProducto || null,
          idVariante: p.idVariante || null,
          nombre: p.nombre || `Producto #${idx + 1}`,
          cantidad: qty,
          status: null, // ◽ Sin marcar inicialmente para que el cocinero verifique
          cantidadPreparada: qty,
          motivo: ""
        };
      });
      setItemsState(initial);
      setObservacionCocina(orden.observacionCocina || "");
      setValidationError("");
      setSubmitting(false);
    }
  }, [isOpen, orden, productos]);

  if (!isOpen || !orden) return null;

  const handleMarkItem = (idx, newStatus) => {
    setValidationError("");
    setItemsState((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (newStatus === "ok") {
          return {
            ...item,
            status: "ok",
            cantidadPreparada: item.cantidad,
            motivo: ""
          };
        } else {
          return {
            ...item,
            status: "fail",
            cantidadPreparada: 0,
            motivo: item.motivo || "Insumos agotados"
          };
        }
      })
    );
  };

  const handleChangePartialQty = (idx, delta) => {
    setItemsState((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const nextQty = Math.max(0, Math.min(item.cantidad, (item.cantidadPreparada || 0) + delta));
        const isNowFull = nextQty >= item.cantidad;
        return {
          ...item,
          cantidadPreparada: nextQty,
          status: isNowFull ? "ok" : "fail",
          motivo: isNowFull ? "" : (item.motivo || "Insumos insuficientes")
        };
      })
    );
  };

  const handleMotivoChange = (idx, motivoText) => {
    setItemsState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, motivo: motivoText } : item))
    );
  };

  const handleMarkAllOk = () => {
    setValidationError("");
    setItemsState((prev) =>
      prev.map((item) => ({
        ...item,
        status: "ok",
        cantidadPreparada: item.cantidad,
        motivo: ""
      }))
    );
  };

  const unverifiedCount = itemsState.filter((it) => it.status === null).length;
  const allVerified = itemsState.length > 0 && unverifiedCount === 0;
  const allOk = allVerified && itemsState.every((it) => it.status === "ok" && it.cantidadPreparada >= it.cantidad);
  const hasFailures = itemsState.some((it) => it.status === "fail" || (it.status !== null && it.cantidadPreparada < it.cantidad));

  const handleSubmit = async () => {
    if (!allVerified) {
      setValidationError(
        `Faltan ${unverifiedCount} ${unverifiedCount === 1 ? "producto" : "productos"} por verificar en el checklist (marca ✅ o ❌ en cada ítem).`
      );
      return;
    }

    const checklistPayload = itemsState.map((it) => ({
      id: it.id,
      index: it.index,
      idProducto: it.idProducto,
      idVariante: it.idVariante,
      nombre: it.nombre,
      cantidad: it.cantidad,
      cantidadPreparada: it.status === "ok" ? it.cantidad : it.cantidadPreparada,
      completado: it.status === "ok" && it.cantidadPreparada >= it.cantidad,
      estadoChecklist:
        it.status === "ok" && it.cantidadPreparada >= it.cantidad
          ? "COMPLETO"
          : it.cantidadPreparada > 0
          ? "PARCIAL"
          : "NO_PREPARADO",
      motivo: it.status === "ok" ? "" : (it.motivo || "No se pudo preparar")
    }));

    setSubmitting(true);
    try {
      await onConfirmChecklist({
        ordenId: orden.id,
        nuevoEstado: "Listo",
        checklistPreparacion: checklistPayload,
        pedidoCompleto: allOk,
        observacionCocina: observacionCocina.trim()
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-[28px] max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/60 dark:to-gray-900 shrink-0">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 leading-tight">
                  Checklist de Verificación del Pedido
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#F05454]/10 text-[#F05454] border border-[#F05454]/20">
                  {orden.codigo || `OP-00${orden.id}`}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Cliente: <strong className="text-gray-800 dark:text-gray-200">{orden.cliente || orden.responsable || "Cliente Mostrador"}</strong>
                {orden.mesa ? ` • ${orden.mesa}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar checklist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Instruction & Quick Mark All Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 p-3.5 rounded-2xl">
            <div className="text-xs text-blue-900 dark:text-blue-200 font-medium leading-relaxed">
              <strong className="font-bold block text-blue-800 dark:text-blue-300">
                Verifica cuánto del pedido realmente se pudo preparar:
              </strong>
              Marca cada ítem con <strong>✅</strong> si se preparó completo o <strong>❌</strong> si hubo algún inconveniente (insumo agotado, error en cocción, etc.).
            </div>

            <button
              type="button"
              onClick={handleMarkAllOk}
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Marcar Todo (✅)</span>
            </button>
          </div>

          {/* Checklist Items */}
          <div className="space-y-3">
            {itemsState.map((item, idx) => {
              const prodOriginal = productos[idx] || {};
              const adds = Array.isArray(prodOriginal.adiciones) ? prodOriginal.adiciones : [];
              const isUnchecked = item.status === null;
              const isOk = item.status === "ok";
              const isFail = item.status === "fail";

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 transition-all ${
                    isOk
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-2xs"
                      : isFail
                      ? "bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800/80 shadow-2xs"
                      : "bg-white dark:bg-gray-800/70 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Quantity + Product Name + Status Icon (3 hamburguesas ◽ / ✅ / ❌) */}
                    <div className="flex items-center gap-3 min-w-0">
                      <FoodIconBadge name={item.nombre} size="sm" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">
                            {item.cantidad}
                          </span>
                          <span className="font-black text-sm sm:text-base text-gray-900 dark:text-gray-100">
                            {item.nombre}
                          </span>
                          <span
                            className="text-base select-none"
                            title={
                              isUnchecked
                                ? "Pendiente por verificar"
                                : isOk
                                ? "Preparado completo"
                                : "No se pudo preparar completo"
                            }
                          >
                            {isUnchecked ? "◽" : isOk ? "✅" : "❌"}
                          </span>
                        </div>

                        {adds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {adds.map((ad, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-[#F05454] dark:text-red-300 font-bold rounded text-[10px] border border-red-200/60 dark:border-red-900/50"
                              >
                                + {typeof ad === "object" ? ad.nombre || ad.nombreAdicion : String(ad)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons ✅ / ❌ */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleMarkItem(idx, "ok")}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                          isOk
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-900"
                            : "bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Sí se hizo (✅)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkItem(idx, "fail")}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                          isFail
                            ? "bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-300 dark:ring-red-900"
                            : "bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40"
                        }`}
                      >
                        <X className="w-4 h-4 stroke-[3]" />
                        <span>No se pudo (❌)</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded controls when marked ❌ (Partial quantity & Reason) */}
                  {isFail && (
                    <div className="mt-3 pt-3 border-t border-red-200/80 dark:border-red-900/50 space-y-2.5 animate-in fade-in duration-150">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-red-800 dark:text-red-300">
                          ¿Cuántas unidades de {item.cantidad} se lograron preparar?
                        </span>
                        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2 py-1 rounded-xl border border-red-200 dark:border-red-800">
                          <button
                            type="button"
                            onClick={() => handleChangePartialQty(idx, -1)}
                            disabled={item.cantidadPreparada <= 0}
                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black px-2 text-red-700 dark:text-red-300">
                            {item.cantidadPreparada} de {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleChangePartialQty(idx, 1)}
                            disabled={item.cantidadPreparada >= item.cantidad}
                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Quick reasons */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block">
                          Causa / Motivo por el que no se completó:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {MOTIVOS_FRECUENTES.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleMotivoChange(idx, m)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer ${
                                item.motivo === m
                                  ? "bg-red-600 text-white border-red-600"
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400"
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={item.motivo}
                          onChange={(e) => handleMotivoChange(idx, e.target.value)}
                          placeholder="Especificar motivo (ej: se quemó la carne, pan en mal estado, sin insumos)..."
                          className="w-full mt-1 px-3 py-2 text-xs bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800/80 rounded-xl text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Status Box */}
          {allVerified && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 ${
                allOk
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              }`}
            >
              {allOk ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-black text-sm">
                  {allOk
                    ? "✅ Pedido Completo: Se pudo preparar todo el pedido"
                    : "⚠️ Pedido Incompleto / Parcial registrado"}
                </p>
                <p className="font-medium opacity-90">
                  {allOk
                    ? "Todos los productos del pedido fueron verificados y marcados como preparados correctamente."
                    : "Quedará registrado en Gestión de Producción exactamente qué productos se prepararon (✅) y cuáles tuvieron novedades (❌)."}
                </p>
              </div>
            </div>
          )}

          {/* Optional General Kitchen Note */}
          {hasFailures && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#F05454]" />
                <span>Observación adicional de cocina (opcional):</span>
              </label>
              <input
                type="text"
                value={observacionCocina}
                onChange={(e) => setObservacionCocina(e.target.value)}
                placeholder="Ej: Se notificó a caja para ajuste o cambio de producto al cliente..."
                className="w-full px-3.5 py-2.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-red-500/40"
              />
            </div>
          )}

          {validationError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/60 dark:bg-gray-900 shrink-0">
          <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Verificados:{" "}
            <span className="text-gray-900 dark:text-gray-100 font-black">
              {itemsState.length - unverifiedCount} de {itemsState.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? "Guardando..." : "Confirmar y Pasar a Listo"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChecklistPreparacionModal;

