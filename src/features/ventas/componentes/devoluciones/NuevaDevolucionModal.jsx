import { useState, useEffect } from "react";
import {
  X,
  Search,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Plus,
  Minus,
  PackageX,
  RotateCcw,
  Clock,
  FileText,
  DollarSign,
  ShieldAlert
} from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import {
  DatosReembolsoFields,
  INITIAL_DATOS_REEMBOLSO,
  requiresDatosReembolso,
  validateDatosReembolso
} from "./DatosReembolsoFields";

export function NuevaDevolucionModal({
  isOpen,
  onClose,
  onSubmit,
  onCheckElegibilidad,
  politicas
}) {
  const notify = useNotifications();

  const [ventaInput, setVentaInput] = useState("");
  const [checkingVenta, setCheckingVenta] = useState(false);
  const [ventaInfo, setVentaInfo] = useState(null);
  const [ventaError, setVentaError] = useState("");

  const [selectedItems, setSelectedItems] = useState({}); // { [idVariante]: cantidad }
  const [motivo, setMotivo] = useState(politicas?.MOTIVOS?.[0] || "Comida en mal estado");
  const [tipoResolucion, setTipoResolucion] = useState(politicas?.RESOLUCIONES?.[0] || "Cambio de producto");
  const [descripcion, setDescripcion] = useState("");
  const [descripcionError, setDescripcionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touchedVenta, setTouchedVenta] = useState(false);
  const [datosReembolso, setDatosReembolso] = useState(INITIAL_DATOS_REEMBOLSO);
  const [reembolsoErrors, setReembolsoErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setVentaInput("");
      setVentaInfo(null);
      setVentaError("");
      setSelectedItems({});
      setMotivo(politicas?.MOTIVOS?.[0] || "Comida en mal estado");
      setTipoResolucion(politicas?.RESOLUCIONES?.[0] || "Cambio de producto");
      setDescripcion("");
      setDescripcionError("");
      setTouchedVenta(false);
      setDatosReembolso(INITIAL_DATOS_REEMBOLSO);
      setReembolsoErrors({});
    }
  }, [isOpen, politicas]);

  if (!isOpen) return null;

  // Validación en vivo del código de venta
  const handleVentaInputChange = (val) => {
    setVentaInput(val);
    if (touchedVenta) {
      if (!val.trim()) {
        setVentaError("El número o código de venta es obligatorio.");
      } else {
        setVentaError("");
      }
    }
  };

  const handleVentaInputBlur = () => {
    setTouchedVenta(true);
    if (!ventaInput.trim()) {
      setVentaError("El número o código de venta es obligatorio.");
    }
  };

  const handleBuscarVenta = async (e) => {
    if (e) e.preventDefault();
    setTouchedVenta(true);
    const rawVal = ventaInput.trim();
    if (!rawVal) {
      setVentaError("Ingrese el número de venta para consultar.");
      notify.warning("Campo Requerido", "Por favor ingresa un código o número de venta.");
      return;
    }

    const cleanedId = rawVal.replace(/\D/g, "");
    if (!cleanedId) {
      setVentaError("Ingrese un número de venta válido (ej. VEN-0001 o 1).");
      notify.warning("Formato Inválido", "El código debe contener dígitos numéricos (ej. VEN-0001 o 1).");
      return;
    }

    try {
      setCheckingVenta(true);
      setVentaError("");
      const res = await onCheckElegibilidad(cleanedId);
      if (!res || !res.existe) {
        const msg = res?.mensaje || `No se encontró la venta #${cleanedId}.`;
        setVentaError(msg);
        setVentaInfo(null);
        notify.error("Venta No Encontrada", msg);
      } else {
        setVentaInfo(res);
        const cliNombre = res.cliente?.nombre || "";
        setDatosReembolso({
          ...INITIAL_DATOS_REEMBOLSO,
          titularNombre: cliNombre && !/cliente general|mostrador/i.test(cliNombre) ? cliNombre : "",
          titularDocumento: res.cliente?.documento || ""
        });
        setReembolsoErrors({});
        const initial = {};
        (res.productos || []).forEach((p) => {
          initial[p.idVariante] = 0;
        });
        setSelectedItems(initial);
        if (!res.elegible) {
          notify.warning("Fuera de Política", res.politicaInfo?.razon || "La venta supera el plazo de 48 horas.");
        } else {
          notify.success("Venta Localizada", `Venta #${res.codigoVenta || cleanedId} cargada con éxito.`);
        }
      }
    } catch (err) {
      const msg = err.message || "Error al verificar la venta";
      setVentaError(msg);
      setVentaInfo(null);
      notify.error("Error", msg);
    } finally {
      setCheckingVenta(false);
    }
  };

  const handleUpdateQty = (idVariante, delta, max) => {
    setSelectedItems((prev) => {
      const current = Number(prev[idVariante] || 0);
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [idVariante]: next };
    });
  };

  // Validación en vivo de observaciones
  const handleDescripcionChange = (val) => {
    setDescripcion(val);
    if (val.trim().length > 0 && val.trim().length < 5) {
      setDescripcionError("La descripción debe tener al menos 5 caracteres.");
    } else {
      setDescripcionError("");
    }
  };

  // Calcular productos a devolver
  const prodsDevueltos = (ventaInfo?.productos || [])
    .filter((p) => Number(selectedItems[p.idVariante] || 0) > 0)
    .map((p) => ({
      idDetalleVenta: p.idDetalleVenta,
      idVariante: p.idVariante,
      idProducto: p.idProducto,
      nombre: p.nombre,
      cantidad: selectedItems[p.idVariante],
      precioUnitario: p.precioUnitario,
      subtotal: selectedItems[p.idVariante] * p.precioUnitario,
      ...(p.adiciones ? { adiciones: p.adiciones } : {}),
      ...(p.exclusiones ? { exclusiones: p.exclusiones } : {}),
      ...(p.especificaciones ? { especificaciones: p.especificaciones } : {})
    }));

  const totalCalculado = prodsDevueltos.reduce((acc, p) => acc + p.subtotal, 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(Number(val || 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ventaInfo) {
      setVentaError("Debe seleccionar y verificar una venta antes de continuar.");
      notify.warning("Venta Requerida", "Debes buscar y verificar una venta antes de registrar la devolución.");
      return;
    }

    if (prodsDevueltos.length === 0) {
      notify.warning("Selección Vacía", "Debes seleccionar al menos un producto a devolver con cantidad mayor a 0.");
      return;
    }

    if (descripcion.trim().length > 0 && descripcion.trim().length < 5) {
      setDescripcionError("La descripción debe tener al menos 5 caracteres.");
      notify.warning("Descripción Muy Corta", "Por favor ingresa una descripción más detallada del caso.");
      return;
    }

    let payloadReembolso;
    if (requiresDatosReembolso(tipoResolucion)) {
      const checkReembolso = validateDatosReembolso(datosReembolso, { allowCash: true });
      if (!checkReembolso.valid) {
        setReembolsoErrors(checkReembolso.errors);
        const msg = Object.values(checkReembolso.errors)[0] || "Completa los datos válidos para el reembolso.";
        notify.warning("Datos de Reembolso Requeridos", msg);
        return;
      }
      payloadReembolso = checkReembolso.normalized;
      setReembolsoErrors({});
    }

    try {
      setSubmitting(true);
      await onSubmit({
        idVenta: ventaInfo.idVenta,
        idCliente: ventaInfo.cliente?.idCliente || null,
        motivo,
        tipoResolucion,
        productosDevueltos: prodsDevueltos,
        valorDevuelto: totalCalculado,
        descripcion: descripcion.trim(),
        ...(payloadReembolso ? { datosReembolso: payloadReembolso } : {})
      });
      onClose();
    } catch (err) {
      const msg = err.message || "Error al registrar la devolución.";
      setVentaError(msg);
      notify.error("Error al Registrar", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-3xl lg:max-w-4xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Header Compacto */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                Registrar Devolución
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Control de devoluciones bajo políticas institucionales de la empresa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body con Optimización de Espacios */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          {/* Banner Compacto de Políticas en Píldoras Horizontales */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50/90 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                Políticas Institucionales de Devolución
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white/80 dark:bg-gray-800/70 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block leading-none">Plazo Máximo</span>
                  <strong className="text-gray-800 dark:text-gray-200 text-[11px]">48 Horas (2 Días)</strong>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/70 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block leading-none">Motivos Válidos</span>
                  <strong className="text-gray-800 dark:text-gray-200 text-[11px]">Mal Estado / Incorrecto</strong>
                </div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/70 p-2 rounded-xl border border-amber-100 dark:border-amber-900/40 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-500 block leading-none">Compensación</span>
                  <strong className="text-gray-800 dark:text-gray-200 text-[11px]">Cambio o Reembolso</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Buscador de Venta Asociada con Validación en Vivo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>Venta Asociada <span className="text-red-500">*</span></span>
              {ventaInfo && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Venta verificada
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ventaInput}
                  onChange={(e) => handleVentaInputChange(e.target.value)}
                  onBlur={handleVentaInputBlur}
                  placeholder="Ingrese el número o código de venta (ej: VEN-0001 o 1)..."
                  className={`w-full text-xs px-3.5 py-2.5 rounded-xl border outline-none transition-all dark:bg-gray-800 dark:text-white ${
                    ventaError
                      ? "border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleBuscarVenta}
                disabled={checkingVenta || !ventaInput.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{checkingVenta ? "Buscando..." : "Buscar Venta"}</span>
              </button>
            </div>
            {ventaError && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{ventaError}</span>
              </p>
            )}
          </div>

          {/* Card Detallada de la Venta (Si fue localizada) */}
          {ventaInfo && (
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/60 dark:border-gray-700 pb-2">
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Orden: {ventaInfo.codigoVenta || `#${ventaInfo.idVenta}`}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Fecha de compra: {new Date(ventaInfo.fechaVenta).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block leading-tight">Total Orden:</span>
                  <strong className="text-xs font-bold text-gray-900 dark:text-white">
                    {formatCurrency(ventaInfo.totalVenta)}
                  </strong>
                </div>
              </div>

              {/* Indicador de Elegibilidad y Horas */}
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
                  ventaInfo.elegible
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                <div className="flex items-center gap-2">
                  {ventaInfo.elegible ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <strong className="block text-xs">{ventaInfo.politicaInfo?.razon}</strong>
                    <span className="text-[11px] opacity-80">
                      Tiempo transcurrido: {ventaInfo.politicaInfo?.diasTranscurridos} días ({Math.round((ventaInfo.politicaInfo?.diasTranscurridos || 0) * 24)} horas)
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                  ventaInfo.elegible
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
                }`}>
                  {ventaInfo.elegible ? "Dentro de Política" : "Fuera de Plazo"}
                </span>
              </div>

              {/* Selección de Productos y Cantidades */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Productos de la orden a devolver <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-500">
                    {prodsDevueltos.length} {prodsDevueltos.length === 1 ? "seleccionado" : "seleccionados"}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-48 overflow-y-auto">
                  {(ventaInfo.productos || []).map((p) => {
                    const cant = Number(selectedItems[p.idVariante] || 0);
                    return (
                      <div
                        key={p.idDetalleVenta || p.idVariante}
                        className="p-2.5 px-3 flex items-center justify-between gap-3 text-xs hover:bg-gray-50/50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 dark:text-white block truncate">
                            {p.nombre}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            Comprado: <strong>{p.cantidadOriginal} und</strong> · {formatCurrency(p.precioUnitario)} c/u
                          </span>
                        </div>

                        {/* Cantidad Picker */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(p.idVariante, -1, p.cantidadOriginal)}
                            disabled={cant <= 0}
                            className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-gray-900 dark:text-white">
                            {cant}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(p.idVariante, 1, p.cantidadOriginal)}
                            disabled={cant >= p.cantidadOriginal}
                            className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 flex items-center justify-center disabled:opacity-30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {prodsDevueltos.length > 0 && (
                  <div className="flex items-center justify-between text-xs px-2 pt-1 font-semibold text-gray-700 dark:text-gray-300 bg-red-50/60 dark:bg-red-950/20 p-2 rounded-xl border border-red-100 dark:border-red-900/30">
                    <span>Compensación estimada total:</span>
                    <strong className="text-red-600 dark:text-red-400 text-sm">
                      {formatCurrency(totalCalculado)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parámetros de la Política: Motivo y Resolución en 2 Columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Motivo de Devolución (Política) <span className="text-red-500">*</span>
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 font-medium"
              >
                {(politicas?.MOTIVOS || ["Comida en mal estado", "Pedido incorrecto"]).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Tipo de Resolución Esperada <span className="text-red-500">*</span>
              </label>
              <select
                value={tipoResolucion}
                onChange={(e) => setTipoResolucion(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 font-medium"
              >
                {(politicas?.RESOLUCIONES || [
                  "Cambio de producto",
                  "Devolución de dinero",
                  "Cambio de producto y devolución de dinero"
                ]).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {requiresDatosReembolso(tipoResolucion) && (
            <DatosReembolsoFields
              value={datosReembolso}
              onChange={(next) => {
                setDatosReembolso(next);
                setReembolsoErrors({});
              }}
              errors={reembolsoErrors}
              allowCash={true}
              disabled={submitting}
            />
          )}

          {/* Observaciones con Validación en Vivo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span>Observaciones / Descripción del Caso</span>
              <span className="text-[11px] text-gray-400">Opcional</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => handleDescripcionChange(e.target.value)}
              placeholder="Describa el motivo detallado de la devolución y cualquier evidencia suministrada..."
              rows={2}
              className={`w-full text-xs p-2.5 rounded-xl border outline-none transition-all dark:bg-gray-800 dark:text-white ${
                descripcionError
                  ? "border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-2 focus:ring-red-200"
                  : "border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
              }`}
            />
            {descripcionError && (
              <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{descripcionError}</span>
              </p>
            )}
          </div>

          {/* Footer Submit Fijo */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !ventaInfo || prodsDevueltos.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              {submitting ? "Registrando..." : "Registrar Devolución"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
