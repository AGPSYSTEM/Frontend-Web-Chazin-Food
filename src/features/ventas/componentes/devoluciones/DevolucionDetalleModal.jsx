import { useState } from "react";
import { X, Calendar, Clock, AlertTriangle, CheckCircle, PackageX, User, Phone, Mail, FileText, Check, Ban, CheckCheck, AlertCircle } from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function DevolucionDetalleModal({
  devolucion,
  isOpen,
  onClose,
  onAprobar,
  onRechazar,
  onCompletar,
  canManage = true
}) {
  const notify = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [rechazoError, setRechazoError] = useState("");
  const [showRechazoInput, setShowRechazoInput] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [showCompletarInput, setShowCompletarInput] = useState(false);
  const [accionRealizada, setAccionRealizada] = useState("");

  if (!isOpen || !devolucion) return null;

  const formatCurrency = (val) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(num);
  };

  const estado = String(devolucion.estado || "PENDIENTE").toUpperCase();
  const prods = Array.isArray(devolucion.productosDevueltos) ? devolucion.productosDevueltos : [];

  const handleAprobar = async () => {
    try {
      setSubmitting(true);
      await onAprobar(devolucion.idDevolucion);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!motivoRechazo.trim()) {
      setRechazoError("El motivo del rechazo es obligatorio.");
      notify.warning("Motivo Requerido", "Por favor ingresa la justificación del rechazo según las políticas.");
      return;
    }
    if (motivoRechazo.trim().length < 5) {
      setRechazoError("El motivo debe tener al menos 5 caracteres.");
      notify.warning("Justificación Insuficiente", "El motivo debe contener al menos 5 caracteres.");
      return;
    }
    try {
      setSubmitting(true);
      await onRechazar(devolucion.idDevolucion, motivoRechazo.trim());
      notify.success("Devolución Rechazada", "La devolución fue rechazada conforme a la política.");
      onClose();
    } catch (err) {
      notify.error("Error", err.message || "Error al rechazar la devolución");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompletar = async () => {
    try {
      setSubmitting(true);
      await onCompletar(devolucion.idDevolucion, accionRealizada);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Devolución {devolucion.codigoDevolucion || `DEV-${devolucion.idDevolucion}`}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                estado === "PENDIENTE"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : estado === "APROBADA"
                  ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                  : estado === "COMPLETADA"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {estado}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Alerta de Política de la Empresa */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-blue-950 dark:text-blue-100 mb-0.5">
                  Política de Devolución de la Empresa
                </span>
                <p className="leading-relaxed text-blue-800 dark:text-blue-300">
                  Válida hasta <strong>2 días (48 horas)</strong> posteriores a la compra. Motivos aceptados: <strong>Comida en mal estado</strong> o <strong>Pedido incorrecto</strong>. Compensación: <strong>Cambio de producto</strong> y/o <strong>devolución del dinero</strong>.
                </p>
                {devolucion.politicaInfo && (
                  <div className="mt-2 text-[11px] font-medium flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tiempo transcurrido desde la venta: {devolucion.politicaInfo.diasTranscurridos} días ({Math.round(devolucion.politicaInfo.diasTranscurridos * 24)} horas).
                    </span>
                    <span className={devolucion.politicaInfo.cumplePlazo ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                      {devolucion.politicaInfo.cumplePlazo ? "✓ Cumple política de plazo" : "✗ Superó el plazo"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Venta y Cliente Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Venta Asociada */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Venta Asociada</span>
                <span className="text-xs font-bold text-red-600 dark:text-red-400">
                  {devolucion.codigoVenta || (devolucion.idVenta ? `VEN-${devolucion.idVenta}` : "-")}
                </span>
              </div>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    Fecha de Venta:{" "}
                    <strong>
                      {devolucion.venta?.fechaVenta
                        ? new Date(devolucion.venta.fechaVenta).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })
                        : "-"}
                    </strong>
                  </span>
                </div>
                <div>
                  Total de la venta: <strong>{formatCurrency(devolucion.venta?.total || 0)}</strong>
                </div>
                <div>
                  Entrega: <span className="font-medium">{devolucion.venta?.estadoEntrega || "Completado"}</span>
                </div>
              </div>
            </div>

            {/* Cliente */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Datos del Cliente</span>
              <div className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>{devolucion.cliente?.nombre || devolucion.venta?.cliente?.nombre || "Cliente General"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Doc:</span>
                  <span>{devolucion.cliente?.documento || devolucion.venta?.cliente?.documento || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{devolucion.cliente?.telefono || devolucion.venta?.cliente?.telefono || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Motivo y Resolución Solicitada */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Detalles de la Petición</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Motivo registrado:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{devolucion.motivo}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Tipo de resolución:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{devolucion.tipoResolucion}</span>
              </div>
            </div>
            {devolucion.descripcion && (
              <div className="text-xs pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px] mb-1">Observaciones / Descripción del Cliente:</span>
                <p className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                  {devolucion.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Tabla de Productos Devueltos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Productos Involucrados ({prods.length})
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Valor devolución: <strong className="text-gray-900 dark:text-white">{formatCurrency(devolucion.valorDevuelto)}</strong>
              </span>
            </div>

            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
                    <th className="px-3.5 py-2.5">Producto</th>
                    <th className="px-3.5 py-2.5 text-center">Cant. Devuelta</th>
                    <th className="px-3.5 py-2.5 text-right">Precio Unit.</th>
                    <th className="px-3.5 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {prods.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3.5 py-3 text-center text-gray-400">
                        No se especificaron productos individuales.
                      </td>
                    </tr>
                  ) : (
                    prods.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                        <td className="px-3.5 py-2.5 font-medium text-gray-900 dark:text-white">
                          {p.nombre || p.nombreProducto || "Producto"}
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-bold text-red-600 dark:text-red-400">
                          {p.cantidad}
                        </td>
                        <td className="px-3.5 py-2.5 text-right text-gray-600 dark:text-gray-300">
                          {formatCurrency(p.precioUnitario)}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(p.subtotal || p.cantidad * p.precioUnitario)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historial de resolución si aplica */}
          {(devolucion.motivoRechazo || devolucion.accionRealizada || devolucion.usuarioResolucion) && (
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Resolución de la Gestión</span>
              {devolucion.usuarioResolucion && (
                <div>
                  Gestionado por:{" "}
                  <strong>
                    {devolucion.usuarioResolucion.nombre} {devolucion.usuarioResolucion.apellidos || ""}
                  </strong>{" "}
                  {devolucion.fechaResolucion && (
                    <span className="text-gray-400">
                      el {new Date(devolucion.fechaResolucion).toLocaleString("es-CO")}
                    </span>
                  )}
                </div>
              )}
              {devolucion.motivoRechazo && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  <strong>Motivo del rechazo:</strong> {devolucion.motivoRechazo}
                </div>
              )}
              {devolucion.accionRealizada && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                  <strong>Acción realizada:</strong> {devolucion.accionRealizada}
                </div>
              )}
            </div>
          )}

          {/* Acciones para Rechazo con Input */}
          {showRechazoInput && (
            <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-200 block">
                Motivo del Rechazo (Obligatorio)
              </span>
              <textarea
                value={motivoRechazo}
                onChange={(e) => {
                  setMotivoRechazo(e.target.value);
                  if (rechazoError) setRechazoError("");
                }}
                placeholder="Explique el motivo por el cual la devolución es rechazada de acuerdo con las políticas..."
                rows={3}
                className={`w-full text-xs p-3 rounded-xl border outline-none transition-all bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 ${
                  rechazoError ? "border-rose-500 focus:ring-2 focus:ring-rose-400" : "border-rose-300 dark:border-rose-800 focus:ring-2 focus:ring-rose-500"
                }`}
              />
              {rechazoError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{rechazoError}</span>
                </p>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRechazoInput(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!motivoRechazo.trim() || submitting}
                  onClick={handleRechazar}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          )}

          {/* Acciones para Completar con Input */}
          {showCompletarInput && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 block">
                Registrar Acción de Cierre / Solución
              </span>
              <input
                type="text"
                value={accionRealizada}
                onChange={(e) => setAccionRealizada(e.target.value)}
                placeholder="Ej: Se entregó hamburguesa de reemplazo y se reembolsaron $5.000 en efectivo"
                className="w-full text-xs p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompletarInput(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCompletar}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                  Confirmar y Completar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>

          {canManage && (
            <div className="flex items-center gap-2">
              {estado === "PENDIENTE" && !showRechazoInput && !showCompletarInput && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowRechazoInput(true)}
                    disabled={submitting}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition-colors flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Rechazar
                  </button>

                  <button
                    type="button"
                    onClick={handleAprobar}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Aprobar Devolución
                  </button>
                </>
              )}

              {estado === "APROBADA" && !showCompletarInput && (
                <button
                  type="button"
                  onClick={() => setShowCompletarInput(true)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar como Completada
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

