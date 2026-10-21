import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle2,
  MapPin,
  FileText,
  CreditCard,
  Banknote,
  Smartphone,
  Store,
  Clock,
  Calendar,
  Sparkles,
  ShoppingBag,
  UserCheck,
  User,
  ShieldCheck,
  Globe,
  Timer,
  Check,
  AlertCircle,
  AlertTriangle
} from "lucide-react";
import { FidelidadBadge } from "@/shared/components/ui/FidelidadBadge";
import { FoodIcon } from "@/shared/components/ui/FoodIcon";
import { ventasService } from "../../servicios/ventasService";

/**
 * Validador en tiempo real de tiempo estimado (Control Exacto)
 * Valida estrictamente formatos como: '15-20 min', '45 min', '1 hora', '1 h 15 min', 'Aprox. 30 min', 'Listo para entrega'.
 * Rechaza emojis, símbolos no válidos y caracteres arbitrarios.
 */
export function validateTiempoEstimado(text = "") {
  const raw = String(text || "").trim();
  if (!raw) {
    return {
      isValid: false,
      error: "Ingresa el tiempo estimado (ej: 45 min, 1 hora, aprox. 30 min).",
      tags: []
    };
  }

  // Rechazar terminantemente emojis o caracteres especiales no permitidos
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(raw) || /[^a-zA-Z0-9\s.,\-áéíóúñÁÉÍÓÚÑ]/i.test(raw)) {
    return {
      isValid: false,
      error: "No se permiten caracteres especiales ni emojis. Ej: 30 min, 1 hora.",
      tags: []
    };
  }

  // Rechazar repetición anómala de signos de puntuación (ej: "...", "--")
  if (/\.{2,}|-{2,}/.test(raw)) {
    return {
      isValid: false,
      error: 'Formato no válido (evita caracteres repetidos como "..." o "--").',
      tags: []
    };
  }

  const clean = raw.toLowerCase().replace(/\s+/g, " ");

  // Frases de estado y despacho directo
  const statusPhrases = [
    "listo",
    "listo para entrega",
    "listo para despacho",
    "listo para recoger",
    "en camino",
    "despachado",
    "entregado",
    "inmediato"
  ];
  if (statusPhrases.includes(clean)) {
    return {
      isValid: true,
      error: null,
      tags: [clean.startsWith("listo") ? "Listo para entrega" : "Despacho directo"]
    };
  }

  // Expresión regular estricta de tiempo estimado (minutos, horas o compuestos)
  const unitMin = "(?:min\\.?|mins\\.?|minuto|minutos|m\\b)";
  const unitHour = "(?:h\\b|hr\\.?|hrs\\.?|hora|horas)";

  const pattern = new RegExp(
    "^(?:(?:aprox\\.?|aproximadamente)\\s+)?(?:" +
      `(?:(\\d{1,3})\\s*(?:-|a|al)\\s*(\\d{1,3})\\s*${unitMin})|` +
      `(?:(\\d{1,3})\\s*${unitMin})|` +
      `(?:(\\d{1,2})\\s*(?:-|a|al)\\s*(\\d{1,2})\\s*${unitHour})|` +
      `(?:(\\d{1,2})\\s*${unitHour}(?:\\s+(?:y\\s+media|y\\s+cuarto|(\\d{1,2})\\s*${unitMin}?))?)` +
    ")$",
    "i"
  );

  if (!pattern.test(clean)) {
    return {
      isValid: false,
      error: "Formato no válido. Usa ejemplos como: 15-20 min, 45 min, 1 hora, 1 h 15 min.",
      tags: []
    };
  }

  const tags = [];
  if (/(aprox|aproximad)/.test(clean)) tags.push("Aproximado");
  if (new RegExp(unitHour, "i").test(clean)) tags.push("Horas");
  if (new RegExp(unitMin, "i").test(clean)) tags.push("Minutos");

  return {
    isValid: true,
    error: null,
    tags: tags.length ? tags : ["Válido"]
  };
}

export function VentaDetalleModal({ isOpen, onClose, venta, onUpdateTiempoEntrega }) {
  if (!isOpen || !venta) return null;

  let obsMeta = {};
  if (venta.observaciones) {
    try {
      obsMeta =
        typeof venta.observaciones === "string" && venta.observaciones.startsWith("{")
          ? JSON.parse(venta.observaciones)
          : { nota: venta.observaciones };
    } catch (e) {
      obsMeta = { nota: venta.observaciones };
    }
  }

  const initialTiempo =
    venta.tiempoEstimadoEntrega ||
    obsMeta.tiempoEstimadoEntrega ||
    (String(venta.tipoEntrega || obsMeta.tipoEntrega || "").toLowerCase().includes("domicilio") ? "35-45 min" : "15-20 min");

  const [tiempoEstimado, setTiempoEstimado] = useState(initialTiempo);
  const [isUpdatingTiempo, setIsUpdatingTiempo] = useState(false);
  const [tiempoActualizadoMsg, setTiempoActualizadoMsg] = useState(false);
  const [tiempoValidationTouched, setTiempoValidationTouched] = useState(false);

  const tiempoValidation = useMemo(() => validateTiempoEstimado(tiempoEstimado), [tiempoEstimado]);

  useEffect(() => {
    if (venta) {
      setTiempoEstimado(
        venta.tiempoEstimadoEntrega ||
        obsMeta.tiempoEstimadoEntrega ||
        (String(venta.tipoEntrega || obsMeta.tipoEntrega || "").toLowerCase().includes("domicilio") ? "35-45 min" : "15-20 min")
      );
    }
  }, [venta]);

  const handleSaveTiempo = async (nuevoTiempo) => {
    const valor = nuevoTiempo || tiempoEstimado;
    const validation = validateTiempoEstimado(valor);
    if (!validation.isValid) {
      setTiempoValidationTouched(true);
      return;
    }
    const ventaId = venta.id || venta.idVenta;
    if (!valor || !ventaId) return;
    setIsUpdatingTiempo(true);
    try {
      if (onUpdateTiempoEntrega) {
        await onUpdateTiempoEntrega(ventaId, valor);
      } else {
        await ventasService.updateTiempoEntrega(ventaId, valor);
      }
      setTiempoEstimado(valor);
      setTiempoActualizadoMsg(true);
      setTimeout(() => setTiempoActualizadoMsg(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingTiempo(false);
    }
  };

  const handleToggleAprox = () => {
    setTiempoValidationTouched(true);
    const current = (tiempoEstimado || "").trim();
    if (/^aprox\.?\s*/i.test(current)) {
      setTiempoEstimado(current.replace(/^aprox\.?\s*/i, "").trim());
    } else {
      setTiempoEstimado(`Aprox. ${current}`.trim());
    }
  };

  const origen = (venta.origen || obsMeta.origen || (String(venta.tipoEntrega || obsMeta.tipoEntrega || "").toLowerCase().includes("domicilio") ? "ONLINE" : "PUNTO_FISICO")).toUpperCase();
  const esOnline = origen.includes("ONLINE");

  const direccionEntrega = obsMeta.direccion || venta.direccion || "";
  const codigo =
    venta.numeroVenta ||
    venta.codigoPedido ||
    obsMeta.codigoPedido ||
    `VEN-${String(venta.id || venta.idVenta || "").padStart(4, "0")}`;

  const cliente =
    venta.clienteNombre ||
    obsMeta.clienteNombre ||
    (typeof venta.cliente === "string" ? venta.cliente : "Cliente Mostrador");

  let fecha = "Hoy";
  let horario = "12:30 PM";
  if (venta.fecha || venta.fechaVenta) {
    try {
      const d = new Date(venta.fecha || venta.fechaVenta);
      if (!isNaN(d.getTime())) {
        fecha = d.toLocaleDateString("es-CO", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" });
        horario = d.toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true });
      }
    } catch (e) {
      fecha = String(venta.fecha || venta.fechaVenta).slice(0, 10);
    }
  }
  if (venta.horario && !venta.horario.includes("–")) {
    horario = venta.horario;
  }

  const metodoPago = obsMeta.metodoPago || venta.metodoPago || "Efectivo";
  const tipoEntrega = obsMeta.tipoEntrega || venta.tipoEntrega || "Recoger";
  const total = Number(venta.total || 0);
  const descPct = Number(venta.descuentoPorcentaje || obsMeta.descuentoPorcentaje || 0);
  const subtotal = Number(
    venta.subtotal ||
      venta.precioOriginal ||
      (descPct > 0 && total
        ? Math.round(total / (1 - descPct / 100))
        : venta.subtotal > total
        ? venta.subtotal
        : total)
  );
  const descuentoMonto = Math.max(0, subtotal - total);
  const descuentoPorcentaje =
    descPct || (subtotal > total ? Math.round(((subtotal - total) / subtotal) * 100) : 0);
  const iva = Number(venta.iva || Math.round(total * 0.19));

  const productos =
    Array.isArray(venta.productos) && venta.productos.length > 0
      ? venta.productos
      : Array.isArray(obsMeta.productos) && obsMeta.productos.length > 0
      ? obsMeta.productos
      : [];

  const getEntregaBadge = (tipo) => {
    const t = (tipo || "").toLowerCase();
    if (t.includes("mesa")) return { slug: "table", label: "En Mesa" };
    if (t.includes("recoger") || t.includes("llevar") || t.includes("local"))
      return { slug: "takeout", label: "Recoger en Local" };
    return { slug: "delivery", label: "Domicilio" };
  };

  const entregaInfo = getEntregaBadge(tipoEntrega);
  const clienteFidelidad = venta.clienteFidelidad || {
    tipo: obsMeta.tipoFidelidad || (descuentoPorcentaje > 0 ? (descuentoPorcentaje >= 15 ? "VIP" : descuentoPorcentaje >= 10 ? "Frecuente" : "Regular") : "Nuevo"),
    descuentoPorcentaje: descuentoPorcentaje
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white dark:bg-gray-900 rounded-[28px] max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header con degradado Coral */}
        <div className="bg-gradient-to-r from-[#d84040] via-[#e05454] to-[#f05454] text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Detalle del Pedido
            </span>
            <span
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                esOnline
                  ? "bg-sky-500/30 text-white border border-sky-300/40"
                  : "bg-amber-500/30 text-white border border-amber-300/40"
              }`}
            >
              {esOnline ? <Globe className="w-3 h-3" /> : <Store className="w-3 h-3" />}
              <span>{esOnline ? "Online (Web)" : "Punto Físico"}</span>
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight mt-1">{codigo}</div>
          <div className="text-xs sm:text-sm text-red-100 font-medium flex items-center gap-2 mt-1 flex-wrap">
            <span>{cliente}</span>
            {(!String(cliente).toLowerCase().includes("mostrador") && venta?.idCliente !== 26 && clienteFidelidad?.tieneCuenta && clienteFidelidad?.tipo && ["Regular", "Frecuente", "VIP"].includes(clienteFidelidad.tipo)) && (
              <FidelidadBadge
                tipo={clienteFidelidad.tipo}
                descuento={clienteFidelidad.descuentoPorcentaje || descuentoPorcentaje}
                enGracia={clienteFidelidad.enGracia}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-gray-900 dark:text-gray-100">
          {/* 2x2 Grid Info Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Responsable de la Venta */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-3 flex items-center justify-between text-xs col-span-2 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5 flex-wrap">
                    <span>Responsable: {venta.responsable?.nombre || "Vendedor / POS"}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                      {venta.responsable?.rol || "Vendedor"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{venta.responsable?.tieneCuenta ? "Cuenta de usuario registrada y activa" : "Pedido generado vía catálogo en línea"}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Fecha</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{fecha}</div>
            </div>

            {/* Horario */}
            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Horario</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{horario}</div>
            </div>

            {/* Método de pago */}
            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>Método de pago</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                {metodoPago.toLowerCase().includes("tarjeta") ? (
                  <>
                    <FoodIcon name="card" size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>Tarjeta</span>
                  </>
                ) : metodoPago.toLowerCase().includes("trans") ||
                  metodoPago.toLowerCase().includes("nequi") ||
                  metodoPago.toLowerCase().includes("davi") ? (
                  <>
                    <FoodIcon name="mobile" size={15} className="text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Transferencia</span>
                  </>
                ) : (
                  <>
                    <FoodIcon name="cash" size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Efectivo (Punto Físico)</span>
                  </>
                )}
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 shadow-2xs">
              <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                <span>Entrega</span>
              </div>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <FoodIcon name={entregaInfo.slug} size={15} className="text-gray-600 dark:text-gray-300 shrink-0" />
                <span>{entregaInfo.label}</span>
              </div>
            </div>

            {/* Control y Seguimiento del Tiempo Estimado (Item 124 con Validación en Vivo) */}
            <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/70 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-4 col-span-2 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Tiempo Estimado de Entrega / Despacho (Control Exacto)</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black shadow-xs transition-colors ${
                  tiempoValidation.isValid ? "bg-indigo-600 text-white" : "bg-red-600 text-white"
                }`}>
                  ⏱ {tiempoEstimado || "Sin definir"}
                </span>
              </div>

              {/* Botones de ajuste rápido y constructor */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mr-1">
                  Ajustar:
                </span>
                <button
                  type="button"
                  onClick={handleToggleAprox}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    tiempoValidation.tags.includes("Aproximado")
                      ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                      : "bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  }`}
                  title="Alternar prefijo 'Aprox.'"
                >
                  ⚡ + Aprox.
                </button>
                {["15-20 min", "25-35 min", "45 min", "1 hora", "1 h 15 min", "Listo para entrega"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setTiempoValidationTouched(true);
                      handleSaveTiempo(preset);
                    }}
                    disabled={isUpdatingTiempo}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      tiempoEstimado === preset
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Input manual con validación reactiva */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={tiempoEstimado}
                      onChange={(e) => {
                        setTiempoValidationTouched(true);
                        setTiempoEstimado(e.target.value);
                      }}
                      onBlur={() => setTiempoValidationTouched(true)}
                      placeholder="Ej: Aprox. 35 min, 1 hora, 1 h 20 min..."
                      className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none transition-colors ${
                        !tiempoValidation.isValid
                          ? "border-red-500 bg-red-50/40 text-red-900 dark:bg-red-950/20 dark:text-red-100 focus:ring-2 focus:ring-red-400/50"
                          : "bg-white dark:bg-gray-800 border-emerald-500 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-400/50"
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveTiempo(tiempoEstimado)}
                    disabled={isUpdatingTiempo || !tiempoValidation.isValid}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0 ${
                      !tiempoValidation.isValid || isUpdatingTiempo
                        ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    }`}
                  >
                    {isUpdatingTiempo ? (
                      <span>Guardando...</span>
                    ) : tiempoActualizadoMsg ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Guardado!</span>
                      </>
                    ) : (
                      <span>Guardar</span>
                    )}
                  </button>
                </div>

                {/* Feedback en vivo: Indicadores de formato válido o alerta de error */}
                {tiempoValidation.isValid ? (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Formato válido:</span>
                    <div className="flex items-center gap-1 flex-wrap">
                      {tiempoValidation.tags.map((t) => (
                        <span
                          key={t}
                          className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[9.5px] font-black px-1.5 py-0.5 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-1.5 text-[11px] text-red-700 dark:text-red-300 bg-red-50/90 dark:bg-red-950/40 px-2.5 py-1.5 rounded-xl border border-red-200 dark:border-red-800/60 animate-in fade-in duration-150">
                    <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <span>{tiempoValidation.error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Detalles adicionales de Pago si existen */}
            {(obsMeta.efectivoConCuanto ||
              obsMeta.transferenciaReferencia ||
              obsMeta.transferBanco ||
              obsMeta.tarjetaNumero) && (
              <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-3 col-span-2 text-xs space-y-1 text-blue-900 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Detalles de Transacción</span>
                </div>
                {obsMeta.efectivoConCuanto && (
                  <div className="flex justify-between">
                    <span>Pagó con efectivo:</span>
                    <span className="font-black">
                      ${Number(obsMeta.efectivoConCuanto).toLocaleString("es-CO")}
                    </span>
                  </div>
                )}
                {obsMeta.transferBanco && (
                  <div className="flex justify-between">
                    <span>Banco / Billetera:</span>
                    <span className="font-bold">{obsMeta.transferBanco}</span>
                  </div>
                )}
                {obsMeta.transferenciaReferencia && (
                  <div className="flex justify-between">
                    <span>Referencia / Comprobante:</span>
                    <span className="font-mono font-bold">
                      {obsMeta.transferenciaReferencia}
                    </span>
                  </div>
                )}
                {obsMeta.tarjetaNumero && (
                  <div className="flex justify-between">
                    <span>Tarjeta:</span>
                    <span className="font-mono font-bold">{obsMeta.tarjetaNumero}</span>
                  </div>
                )}
              </div>
            )}

            {/* Dirección de Entrega */}
            {direccionEntrega && (
              <div className="bg-[#f8fafc] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3 space-y-0.5 col-span-2 shadow-2xs">
                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F05454]" />
                  <span>Dirección / Punto de Entrega</span>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {direccionEntrega}
                </div>
              </div>
            )}
          </div>

          {/* Green Status Badge */}
          <div className="bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-3 flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Estado de Pago: Pagado</span>
            </div>
            <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[11px] font-black px-2.5 py-0.5 rounded-full">
              {venta.estado || "Completada"}
            </span>
          </div>

          {/* Productos Section Title */}
          <div>
            <h4 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#f05454]" />
              <span>Productos del Pedido ({productos.length})</span>
            </h4>
          </div>

          {/* Products List Cards */}
          <div className="space-y-2.5">
            {productos.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No hay productos registrados</p>
            ) : (
              productos.map((p, idx) => {
                const itemAdiciones = Array.isArray(p.adiciones) ? p.adiciones : [];
                const itemObs = p.observaciones || p.observacion || p.especificaciones || p.nota || "";

                return (
                  <div
                    key={idx}
                    className="bg-[#fbfcfd] dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 rounded-2xl p-3.5 space-y-2 shadow-2xs"
                  >
                    {/* Header del producto */}
                    <div className="flex items-center justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                      <span className="truncate">
                        <span className="text-[#f05454] font-black mr-1">{p.cantidad || 1}x</span>
                        {p.nombre || p.nombreProducto || "Producto"}
                      </span>
                      <span className="shrink-0 font-black text-gray-900 dark:text-gray-100">
                        ${Number(
                          p.total || (Number(p.precioUnitario || 0) * Number(p.cantidad || 1))
                        ).toLocaleString("es-CO")}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 font-medium">
                      Precio base: ${Number(p.precioUnitario || 0).toLocaleString("es-CO")} c/u
                    </div>

                    {/* Adiciones con cantidad y precio */}
                    {itemAdiciones.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-gray-700/60">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          Adiciones ({itemAdiciones.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {itemAdiciones.map((adc, aIdx) => {
                            const adcName = typeof adc === "object" ? adc.nombre : String(adc);
                            const adcPrice =
                              typeof adc === "object" && Number(adc.precio) > 0
                                ? Number(adc.precio) * Number(adc.cantidad || 1)
                                : 0;
                            const adcQty = typeof adc === "object" && Number(adc.cantidad) > 1 ? `x${adc.cantidad} ` : "";

                            return (
                              <span
                                key={aIdx}
                                className="px-2.5 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#f05454] dark:text-red-300 text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                              >
                                <span>+ {adcQty}{adcName}</span>
                                {adcPrice > 0 && (
                                  <span className="font-extrabold opacity-95">
                                    (+${adcPrice.toLocaleString("es-CO")})
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Observación / Nota del Producto */}
                    {itemObs && (
                      <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-xl font-medium flex items-start gap-1.5 mt-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Observación: </span>
                          <span className="italic">{itemObs}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Financial Summary Box */}
          <div className="bg-[#f8fafc] dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                ${subtotal.toLocaleString("es-CO")}
              </span>
            </div>

            {descuentoMonto > 0 && (
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Descuento (-{descuentoPorcentaje}%)</span>
                <span>-${descuentoMonto.toLocaleString("es-CO")}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
              <span>IVA (19% incluido)</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                ${iva.toLocaleString("es-CO")}
              </span>
            </div>

            <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-base font-black text-gray-900 dark:text-gray-100">
                Total Pagado
              </span>
              <span className="text-2xl font-black text-[#F05454] dark:text-red-400">
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default VentaDetalleModal;
