import { useState, useEffect } from "react";
import {
  X,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  PackageX,
  Plus,
  Minus,
  ShieldCheck,
  Clock,
  DollarSign
} from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import {
  DatosReembolsoFields,
  INITIAL_DATOS_REEMBOLSO,
  requiresDatosReembolso,
  validateDatosReembolso
} from "./DatosReembolsoFields";

export function SolicitarDevolucionModal({
  isOpen,
  onClose,
  pedido,
  onSubmit
}) {
  const notify = useNotifications();

  const [selectedItems, setSelectedItems] = useState({});
  const [motivo, setMotivo] = useState("Comida en mal estado");
  const [tipoResolucion, setTipoResolucion] = useState("Cambio de producto");
  const [descripcion, setDescripcion] = useState("");
  const [descripcionError, setDescripcionError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [datosReembolso, setDatosReembolso] = useState(INITIAL_DATOS_REEMBOLSO);
  const [reembolsoErrors, setReembolsoErrors] = useState({});

  // Calcular diferencia en días / horas
  const fechaPedido = pedido?.fechaVenta || pedido?.fechaCreacion || pedido?.createdAt || pedido?.fecha;
  let diffHours = 0;
  if (fechaPedido) {
    const parsed = new Date(fechaPedido);
    if (!isNaN(parsed.getTime())) {
      diffHours = (new Date().getTime() - parsed.getTime()) / (1000 * 60 * 60);
    }
  }
  const diffDays = Math.round((diffHours / 24) * 10) / 10;
  const cumplePlazo = isNaN(diffHours) ? true : diffHours <= 48;

  // Extraer items del pedido
  let itemsList = [];
  if (Array.isArray(pedido?.detalles) && pedido.detalles.length > 0) {
    itemsList = pedido.detalles.map((d) => ({
      idDetalleVenta: d.idDetalleVenta,
      idVariante: d.idVariante || d.variante?.idVariante,
      idProducto: d.idProducto || d.variante?.idProducto || null,
      nombre: d.variante?.producto?.nombre || d.nombreProducto || d.nombre || "Producto",
      cantidad: Number(d.cantidad || 1),
      precioUnitario: Number(d.precioUnitario || 0),
      subtotal: Number(d.subtotal || 0),
      adiciones: d.adiciones || null,
      exclusiones: d.exclusiones || null,
      especificaciones: d.especificaciones || null
    }));
  } else if (Array.isArray(pedido?.items)) {
    itemsList = pedido.items.map((it) => ({
      idDetalleVenta: it.idDetalleVenta || it.idVariante || it.id,
      idVariante: it.idVariante || it.id || 1,
      nombre: it.nombre || it.name || "Producto",
      cantidad: Number(it.cantidad || it.quantity || 1),
      precioUnitario: Number(it.precioUnitario || it.precio || 0),
      subtotal: Number((it.cantidad || 1) * (it.precioUnitario || it.precio || 0))
    }));
  } else if (typeof pedido?.items === "string") {
    try {
      const parsed = JSON.parse(pedido.items);
      if (Array.isArray(parsed)) {
        itemsList = parsed.map((it) => ({
          idDetalleVenta: it.idDetalleVenta || it.idVariante || it.id,
          idVariante: it.idVariante || it.id || 1,
          nombre: it.nombre || it.name || "Producto",
          cantidad: Number(it.cantidad || it.quantity || 1),
          precioUnitario: Number(it.precioUnitario || it.precio || 0),
          subtotal: Number((it.cantidad || 1) * (it.precioUnitario || it.precio || 0))
        }));
      }
    } catch (_) {}
  }

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      itemsList.forEach((it, idx) => {
        initial[it.idVariante || idx] = 0;
      });
      setSelectedItems(initial);
      setMotivo("Comida en mal estado");
      setTipoResolucion("Cambio de producto");
      setDescripcion("");
      setDescripcionError("");
      setError("");
      const cliNombre = pedido?.cliente?.nombre || pedido?.clienteNombre || "";
      setDatosReembolso({
        ...INITIAL_DATOS_REEMBOLSO,
        titularNombre: cliNombre && !/cliente general|mostrador/i.test(cliNombre) ? cliNombre : "",
        titularDocumento: pedido?.cliente?.documento || ""
      });
      setReembolsoErrors({});
    }
  }, [isOpen, pedido]);

  if (!isOpen || !pedido) return null;

  const handleUpdateQty = (key, delta, max) => {
    setSelectedItems((prev) => {
      const current = Number(prev[key] || 0);
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const handleDescripcionChange = (val) => {
    setDescripcion(val);
    if (!val.trim()) {
      setDescripcionError("Por favor describa el inconveniente con el pedido.");
    } else if (val.trim().length < 5) {
      setDescripcionError("La descripción debe tener al menos 5 caracteres.");
    } else {
      setDescripcionError("");
    }
  };

  const prodsDevueltos = itemsList
    .filter((it, idx) => Number(selectedItems[it.idVariante || idx] || 0) > 0)
    .map((it, idx) => ({
      idDetalleVenta: it.idDetalleVenta,
      idVariante: it.idVariante,
      idProducto: it.idProducto || null,
      nombre: it.nombre,
      cantidad: selectedItems[it.idVariante || idx],
      precioUnitario: it.precioUnitario,
      subtotal: selectedItems[it.idVariante || idx] * it.precioUnitario,
      ...(it.adiciones ? { adiciones: it.adiciones } : {}),
      ...(it.exclusiones ? { exclusiones: it.exclusiones } : {}),
      ...(it.especificaciones ? { especificaciones: it.especificaciones } : {})
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
    if (!cumplePlazo) {
      const msg = "La compra superó el plazo máximo de 2 días (48 horas) estipulado en la política de la empresa.";
      setError(msg);
      notify.warning("Plazo Vencido", msg);
      return;
    }

    if (prodsDevueltos.length === 0) {
      const msg = "Por favor indique al menos un producto a devolver con cantidad mayor a 0.";
      setError(msg);
      notify.warning("Selección Vacía", msg);
      return;
    }

    if (!descripcion.trim() || descripcion.trim().length < 5) {
      const msg = "Por favor detalle brevemente el inconveniente con el producto o pedido (mínimo 5 caracteres).";
      setDescripcionError(msg);
      notify.warning("Descripción Requerida", msg);
      return;
    }

    let payloadReembolso;
    if (requiresDatosReembolso(tipoResolucion)) {
      const checkReembolso = validateDatosReembolso(datosReembolso, { allowCash: false });
      if (!checkReembolso.valid) {
        setReembolsoErrors(checkReembolso.errors);
        const msg = Object.values(checkReembolso.errors)[0] || "Completa los datos bancarios o billetera para el reembolso.";
        setError(msg);
        notify.warning("Datos de Reembolso Requeridos", msg);
        return;
      }
      payloadReembolso = checkReembolso.normalized;
      setReembolsoErrors({});
    }

    try {
      setSubmitting(true);
      await onSubmit({
        idVenta: pedido.idVenta || pedido.id,
        idCliente: pedido.idCliente || null,
        motivo,
        tipoResolucion,
        productosDevueltos: prodsDevueltos,
        valorDevuelto: totalCalculado,
        descripcion: descripcion.trim(),
        ...(payloadReembolso ? { datosReembolso: payloadReembolso } : {})
      });
      notify.success("Solicitud Enviada", "Tu solicitud de devolución fue registrada con éxito.");
      onClose();
    } catch (err) {
      const msg = err.message || "Error al enviar la solicitud de devolución";
      setError(msg);
      notify.error("Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const codigoPedido = pedido.codigoPedido || pedido.numeroVenta || (pedido.idVenta ? `VEN-${pedido.idVenta}` : `#${pedido.id}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        
        {/* Header Compacto */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                Solicitar Devolución · {codigoPedido}
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Garantía y política de calidad de Chazin Food
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body Compacto */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          
          {/* Indicador de Elegibilidad 48h */}
          <div
            className={`p-2.5 rounded-2xl text-xs flex items-center justify-between gap-2 ${
              cumplePlazo
                ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/50"
                : "bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200/70 dark:border-rose-800/50"
            }`}
          >
            <div className="flex items-center gap-2">
              {cumplePlazo ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <div>
                <strong className="block text-xs leading-tight">
                  {cumplePlazo ? "Pedido dentro de la política de 48 horas" : "Plazo de garantía expirado"}
                </strong>
                <span className="text-[11px] opacity-80">
                  Transcurrido: {diffDays} días ({Math.round(diffHours)} horas).
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
              cumplePlazo
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
            }`}>
              {cumplePlazo ? "Elegible" : "No Elegible"}
            </span>
          </div>

          {/* Selección de Productos y Cantidades */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Selecciona los productos a devolver <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-500">
                {prodsDevueltos.length} {prodsDevueltos.length === 1 ? "producto" : "productos"}
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/60 dark:bg-gray-800/40 rounded-2xl border border-gray-200/70 dark:border-gray-700/70 overflow-hidden max-h-44 overflow-y-auto">
              {itemsList.map((it, idx) => {
                const key = it.idVariante || idx;
                const cant = Number(selectedItems[key] || 0);
                return (
                  <div key={key} className="p-2.5 px-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white block truncate">
                        {it.nombre}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Pedido: {it.cantidad} und · {formatCurrency(it.precioUnitario)} c/u
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(key, -1, it.cantidad)}
                        disabled={cant <= 0}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 text-gray-600 dark:text-gray-300 flex items-center justify-center disabled:opacity-30 border border-gray-200 dark:border-gray-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-gray-900 dark:text-white">
                        {cant}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(key, 1, it.cantidad)}
                        disabled={cant >= it.cantidad}
                        className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 flex items-center justify-center disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {prodsDevueltos.length > 0 && (
              <div className="flex items-center justify-between text-xs px-2 pt-1 font-semibold text-gray-700 dark:text-gray-300">
                <span>Total a devolver:</span>
                <strong className="text-red-600 dark:text-red-400 text-xs">
                  {formatCurrency(totalCalculado)}
                </strong>
              </div>
            )}
          </div>

          {/* Motivo y Resolución en 2 Columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Motivo <span className="text-red-500">*</span>
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 font-medium"
              >
                <option value="Comida en mal estado">Comida en mal estado</option>
                <option value="Pedido incorrecto">Pedido incorrecto</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Compensación deseada <span className="text-red-500">*</span>
              </label>
              <select
                value={tipoResolucion}
                onChange={(e) => setTipoResolucion(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 font-medium"
              >
                <option value="Cambio de producto">Cambio de producto</option>
                <option value="Devolución de dinero">Devolución de dinero</option>
                <option value="Cambio de producto y devolución de dinero">Ambos</option>
              </select>
            </div>
          </div>

          {requiresDatosReembolso(tipoResolucion) && (
            <DatosReembolsoFields
              value={datosReembolso}
              onChange={(next) => {
                setDatosReembolso(next);
                setReembolsoErrors({});
                if (error) setError("");
              }}
              errors={reembolsoErrors}
              allowCash={false}
              disabled={submitting}
            />
          )}

          {/* Descripción con Validación en Vivo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Descripción del Inconveniente <span className="text-red-500">*</span>
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => handleDescripcionChange(e.target.value)}
              placeholder="Explica qué ocurrió con el platillo o pedido para que el equipo lo revise..."
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

          {error && (
            <p className="text-xs text-red-500 font-medium flex items-center gap-1 bg-red-50/80 dark:bg-red-950/20 p-2 rounded-xl border border-red-200 dark:border-red-900/40">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

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
              disabled={submitting || !cumplePlazo || prodsDevueltos.length === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all shadow-md shadow-red-600/20 active:scale-95"
            >
              {submitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
