import { useState, useEffect } from "react";
import { X, RotateCcw, CheckCircle, AlertTriangle, PackageX, Plus, Minus, ShieldCheck } from "lucide-react";

export function SolicitarDevolucionModal({
  isOpen,
  onClose,
  pedido,
  onSubmit
}) {
  const [selectedItems, setSelectedItems] = useState({});
  const [motivo, setMotivo] = useState("Comida en mal estado");
  const [tipoResolucion, setTipoResolucion] = useState("Cambio de producto");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  // Extraer items del pedido (pueden venir como array de detalles o parsed JSON)
  let itemsList = [];
  if (Array.isArray(pedido?.detalles) && pedido.detalles.length > 0) {
    itemsList = pedido.detalles.map(d => ({
      idDetalleVenta: d.idDetalleVenta,
      idVariante: d.idVariante || d.variante?.idVariante,
      nombre: d.variante?.producto?.nombre || d.nombreProducto || d.nombre || "Producto",
      cantidad: Number(d.cantidad || 1),
      precioUnitario: Number(d.precioUnitario || 0),
      subtotal: Number(d.subtotal || 0)
    }));
  } else if (Array.isArray(pedido?.items)) {
    itemsList = pedido.items.map(it => ({
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
        itemsList = parsed.map(it => ({
          idDetalleVenta: it.idDetalleVenta || it.idVariante || it.id,
          idVariante: it.idVariante || it.id || 1,
          nombre: it.nombre || it.name || "Producto",
          cantidad: Number(it.cantidad || it.quantity || 1),
          precioUnitario: Number(it.precioUnitario || it.precio || 0),
          subtotal: Number((it.cantidad || 1) * (it.precioUnitario || it.precio || 0))
        }));
      }
    } catch (_) { }
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
      setError("");
    }
  }, [isOpen, pedido]);

  if (!isOpen || !pedido) return null;

  const handleUpdateQty = (key, delta, max) => {
    setSelectedItems(prev => {
      const current = Number(prev[key] || 0);
      const next = Math.max(0, Math.min(max, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const prodsDevueltos = itemsList
    .filter((it, idx) => Number(selectedItems[it.idVariante || idx] || 0) > 0)
    .map((it, idx) => ({
      idDetalleVenta: it.idDetalleVenta,
      idVariante: it.idVariante,
      nombre: it.nombre,
      cantidad: selectedItems[it.idVariante || idx],
      precioUnitario: it.precioUnitario,
      subtotal: selectedItems[it.idVariante || idx] * it.precioUnitario
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
      setError("La compra superó el plazo máximo de 2 días (48 horas) estipulado en la política de la empresa.");
      return;
    }

    if (prodsDevueltos.length === 0) {
      setError("Por favor indique al menos un producto a devolver con cantidad mayor a 0.");
      return;
    }

    if (!descripcion.trim()) {
      setError("Por favor detalle brevemente el inconveniente con el producto o pedido.");
      return;
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
        descripcion
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error al enviar la solicitud de devolución");
    } finally {
      setSubmitting(false);
    }
  };

  const codigoPedido = pedido.codigoPedido || pedido.numeroVenta || (pedido.idVenta ? `VEN-${pedido.idVenta}` : `#${pedido.id}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Solicitar Devolución</h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Pedido {codigoPedido}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Política de la Empresa Card */}
          <div className="p-4 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 text-xs text-red-900 dark:text-red-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-950 dark:text-red-100">
              <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Políticas de Devolución Chazin Food</span>
            </div>
            <p className="text-red-800 dark:text-red-300 leading-relaxed text-[11px]">
              • Plazo máximo: <strong>Hasta 2 días (48 horas)</strong> posteriores a la compra.<br />
              • Motivos válidos: <strong>Comida en mal estado</strong> o <strong>Pedido incorrecto</strong>.<br />
              • Solución ofrecida: <strong>Cambio de producto</strong> o <strong>devolución de tu dinero</strong>.
            </p>
            <div className="pt-1.5 flex items-center gap-1 text-[11px]">
              {cumplePlazo ? (
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Tu compra fue realizada hace {diffDays} días ({Math.round(diffHours)} hrs) — Cumple la política.
                </span>
              ) : (
                <span className="text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Han pasado más de 48 horas desde la compra.
                </span>
              )}
            </div>
          </div>

          {/* Selector de Productos */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              1. Selecciona los productos a devolver y sus cantidades *
            </label>
            <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 overflow-hidden">
              {itemsList.length === 0 ? (
                <div className="p-3 text-xs text-gray-400 text-center">
                  No se pudieron obtener los productos de la compra.
                </div>
              ) : (
                itemsList.map((it, idx) => {
                  const key = it.idVariante || idx;
                  const cant = Number(selectedItems[key] || 0);
                  return (
                    <div key={key} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 dark:text-white block truncate">
                          {it.nombre}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Comprado: {it.cantidad} {it.cantidad === 1 ? "unidad" : "unidades"} · {formatCurrency(it.precioUnitario)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(key, -1, it.cantidad)}
                          disabled={cant <= 0}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 disabled:opacity-30"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">
                          {cant}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(key, 1, it.cantidad)}
                          disabled={cant >= it.cantidad}
                          className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {prodsDevueltos.length > 0 && (
              <div className="flex items-center justify-between text-xs px-1 text-gray-500">
                <span>{prodsDevueltos.length} producto(s) seleccionados</span>
                <span>Valor estimado: <strong className="text-red-600 dark:text-red-400">{formatCurrency(totalCalculado)}</strong></span>
              </div>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              2. Motivo de la Devolución *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="Comida en mal estado">Comida en mal estado</option>
              <option value="Pedido incorrecto">Pedido incorrecto</option>
            </select>
          </div>

          {/* Tipo de Resolución */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              3. ¿Qué solución prefieres? *
            </label>
            <select
              value={tipoResolucion}
              onChange={(e) => setTipoResolucion(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <option value="Cambio de producto">Cambio de producto (Reposición)</option>
              <option value="Devolución de dinero">Devolución de dinero</option>
              <option value="Cambio de producto y devolución de dinero">Cambio de producto y devolución de dinero</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              4. Cuéntanos qué sucedió con tu pedido *
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe detalladamente el problema con el producto recibido..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/30"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Buttons */}
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
              disabled={submitting || !cumplePlazo || prodsDevueltos.length === 0 || !descripcion.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Enviando..." : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

