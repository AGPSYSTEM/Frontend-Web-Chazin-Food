import { useState, useEffect } from "react";
import { X, Search, CheckCircle, AlertTriangle, AlertCircle, Plus, Minus, PackageX, RotateCcw } from "lucide-react";

export function NuevaDevolucionModal({
  isOpen,
  onClose,
  onSubmit,
  onCheckElegibilidad,
  politicas
}) {
  const [ventaInput, setVentaInput] = useState("");
  const [checkingVenta, setCheckingVenta] = useState(false);
  const [ventaInfo, setVentaInfo] = useState(null);
  const [ventaError, setVentaError] = useState("");

  const [selectedItems, setSelectedItems] = useState({}); // { [idVariante]: cantidad }
  const [motivo, setMotivo] = useState(politicas?.MOTIVOS?.[0] || "Comida en mal estado");
  const [tipoResolucion, setTipoResolucion] = useState(politicas?.RESOLUCIONES?.[0] || "Cambio de producto");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVentaInput("");
      setVentaInfo(null);
      setVentaError("");
      setSelectedItems({});
      setMotivo(politicas?.MOTIVOS?.[0] || "Comida en mal estado");
      setTipoResolucion(politicas?.RESOLUCIONES?.[0] || "Cambio de producto");
      setDescripcion("");
    }
  }, [isOpen, politicas]);

  if (!isOpen) return null;

  const handleBuscarVenta = async (e) => {
    if (e) e.preventDefault();
    const rawVal = ventaInput.trim();
    if (!rawVal) return;

    // Extraer número de venta si viene como "VEN-0004" o "4"
    const cleanedId = rawVal.replace(/\D/g, "");
    if (!cleanedId) {
      setVentaError("Ingrese un número de venta válido (ej. VEN-0001 o 1).");
      return;
    }

    try {
      setCheckingVenta(true);
      setVentaError("");
      const res = await onCheckElegibilidad(cleanedId);
      if (!res || !res.existe) {
        setVentaError(res?.mensaje || `No se encontró la venta #${cleanedId}.`);
        setVentaInfo(null);
      } else {
        setVentaInfo(res);
        // Inicializar selección de productos en 0
        const initial = {};
        (res.productos || []).forEach(p => {
          initial[p.idVariante] = 0;
        });
        setSelectedItems(initial);
      }
    } catch (err) {
      setVentaError(err.message || "Error al verificar la venta");
      setVentaInfo(null);
    } finally {
      setCheckingVenta(false);
    }
  };

  const handleUpdateQty = (idVariante, delta, max) => {
    setSelectedItems(prev => {
      const current = Number(prev[idVariante] || 0);
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [idVariante]: next };
    });
  };

  // Calcular productos a devolver
  const prodsDevueltos = (ventaInfo?.productos || [])
    .filter(p => Number(selectedItems[p.idVariante] || 0) > 0)
    .map(p => ({
      idDetalleVenta: p.idDetalleVenta,
      idVariante: p.idVariante,
      idProducto: p.idProducto,
      nombre: p.nombre,
      cantidad: selectedItems[p.idVariante],
      precioUnitario: p.precioUnitario,
      subtotal: selectedItems[p.idVariante] * p.precioUnitario
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
      return;
    }

    if (prodsDevueltos.length === 0) {
      setVentaError("Debe seleccionar al menos un producto a devolver con cantidad mayor a 0.");
      return;
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
        descripcion
      });
      onClose();
    } catch (err) {
      setVentaError(err.message || "Error al registrar la devolución.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Registrar Devolución</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Control de devoluciones bajo políticas de la empresa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Banner Políticas */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
            <span className="font-bold block text-amber-950 dark:text-amber-100 mb-0.5">
              Políticas de la Empresa:
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-800 dark:text-amber-300">
              <li>Plazo máximo de solicitud: <strong>2 días (48 horas)</strong> posteriores a la compra.</li>
              <li>Motivos válidos: <strong>Comida en mal estado</strong> o <strong>Pedido incorrecto</strong>.</li>
              <li>Compensación: <strong>Cambio de producto</strong> y/o <strong>devolución de dinero</strong>.</li>
            </ul>
          </div>

          {/* Buscador de Venta */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Venta Asociada *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ventaInput}
                  onChange={(e) => setVentaInput(e.target.value)}
                  placeholder="Ingrese el número o código de venta (ej: VEN-0001 o 1)..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
              <button
                type="button"
                onClick={handleBuscarVenta}
                disabled={checkingVenta || !ventaInput.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                {checkingVenta ? "Buscando..." : "Buscar Venta"}
              </button>
            </div>
            {ventaError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {ventaError}
              </p>
            )}
          </div>

          {/* Venta Info Card */}
          {ventaInfo && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-2.5">
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {ventaInfo.codigoVenta}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                    Fecha: {new Date(ventaInfo.fechaVenta).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400">Total Venta:</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    {formatCurrency(ventaInfo.totalVenta)}
                  </span>
                </div>
              </div>

              {/* Indicador de Política */}
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                ventaInfo.elegible
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
              }`}>
                {ventaInfo.elegible ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <div>
                  <span className="font-bold">{ventaInfo.politicaInfo?.razon}</span>
                  <span className="block text-[11px] opacity-90">
                    Transcurrido: {ventaInfo.politicaInfo?.diasTranscurridos} días ({Math.round((ventaInfo.politicaInfo?.diasTranscurridos || 0) * 24)} horas).
                  </span>
                </div>
              </div>

              {/* Selección de Productos y Cantidades */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Seleccione los productos y cantidades a devolver *
                </label>
                <div className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {(ventaInfo.productos || []).map((p) => {
                    const cant = Number(selectedItems[p.idVariante] || 0);
                    return (
                      <div
                        key={p.idDetalleVenta || p.idVariante}
                        className="p-3 flex items-center justify-between gap-3 text-xs"
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
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(p.idVariante, -1, p.cantidadOriginal)}
                            disabled={cant <= 0}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 flex items-center justify-center disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm text-gray-900 dark:text-white">
                            {cant}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(p.idVariante, 1, p.cantidadOriginal)}
                            disabled={cant >= p.cantidadOriginal}
                            className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 flex items-center justify-center disabled:opacity-30"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {prodsDevueltos.length > 0 && (
                  <div className="flex items-center justify-between text-xs px-2 pt-1 font-semibold text-gray-700 dark:text-gray-300">
                    <span>{prodsDevueltos.length} {prodsDevueltos.length === 1 ? "producto seleccionado" : "productos seleccionados"}</span>
                    <span>Valor estimado a compensar: <strong className="text-red-600 dark:text-red-400">{formatCurrency(totalCalculado)}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Parámetros de la Política */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Motivo de la devolución */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Motivo de Devolución (Política) *
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/30 font-medium"
              >
                {(politicas?.MOTIVOS || ["Comida en mal estado", "Pedido incorrecto"]).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Resolución */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Tipo de Resolución Esperada *
              </label>
              <select
                value={tipoResolucion}
                onChange={(e) => setTipoResolucion(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/30 font-medium"
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

          {/* Observaciones / Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Observaciones / Descripción del Caso
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el motivo detallado de la devolución y cualquier evidencia suministrada..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !ventaInfo || prodsDevueltos.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Registrando..." : "Registrar Devolución"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

