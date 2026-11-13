import { RotateCcw, Landmark, Smartphone, CheckCircle, Ban, Clock, ShoppingBag, MapPin } from "lucide-react";

function getRefundStatusMeta(dev) {
  const esDinero = String(dev?.tipoResolucion || "").toLowerCase().includes("dinero") || Boolean(dev?.datosReembolso);
  if (!esDinero) return null;

  const estReemb = String(dev?.estadoReembolso || "PENDIENTE").toUpperCase();
  const estDev = String(dev?.estado || "").toUpperCase();

  if (estReemb === "REALIZADO") {
    return {
      code: "REALIZADO",
      label: "Reembolso Realizado (Válido)",
      shortLabel: "Reembolso hecho",
      badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      cardClass: "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60",
      icon: CheckCircle
    };
  }

  if (estReemb === "NO_VALIDO" || (estDev === "RECHAZADA" && esDinero)) {
    return {
      code: "NO_VALIDO",
      label: "Reembolso No Válido",
      shortLabel: "Reembolso no válido",
      badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
      cardClass: "bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60",
      icon: Ban
    };
  }

  return {
    code: "PENDIENTE",
    label: "Reembolso en Validación",
    shortLabel: "Reembolso pendiente",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    cardClass: "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60",
    icon: Clock
  };
}

export function ClientePedidoDevolucionBadges({ devInfo, ped, onSolicitar }) {
  if (!devInfo) return null;

  if (devInfo.esPedidoDevolucion) {
    const codeDev = devInfo.linkedReplacementFor?.codigoDevolucion || ped?.codigoDevolucionAsociada;
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
        <ShoppingBag className="w-3 h-3" />
        Reposición Devolución{codeDev ? ` (${codeDev})` : ""}
      </span>
    );
  }

  if (devInfo.existing) {
    const dev = devInfo.existing;
    const refundMeta = getRefundStatusMeta(dev);
    const RefundIcon = refundMeta?.icon;

    return (
      <div className="flex flex-wrap items-center gap-1.5 justify-end">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <RotateCcw className="w-3 h-3" />
          Devolución: {dev.estado}
        </span>

        {dev.codigoVentaReemplazo && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10.5px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <ShoppingBag className="w-3 h-3" />
            Reposición: {dev.codigoVentaReemplazo}
          </span>
        )}

        {refundMeta && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[10.5px] font-bold border ${refundMeta.badgeClass}`}>
            {RefundIcon && <RefundIcon className="w-3 h-3" />}
            {refundMeta.shortLabel}
          </span>
        )}
      </div>
    );
  }

  if (devInfo.puedeSolicitar && onSolicitar) {
    return (
      <button
        type="button"
        onClick={onSolicitar}
        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95"
        title="Solicitar devolución según políticas de la empresa (máx 2 días)"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Devolución</span>
      </button>
    );
  }

  return null;
}

export function ClientePedidoDevolucionDetalle({ devInfo, ped, onSolicitar, detailsOnly = false }) {
  if (!devInfo) return null;

  if (devInfo.esPedidoDevolucion) {
    const codeDev = devInfo.linkedReplacementFor?.codigoDevolucion || ped?.codigoDevolucionAsociada;
    const origVen = devInfo.linkedReplacementFor?.codigoVenta || ped?.codigoVentaOriginal;
    return (
      <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Pedido de Reposición por Devolución
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-200/80 dark:bg-sky-900 text-sky-900 dark:text-sky-200">
            Sin costo ($0)
          </span>
        </div>
        <p className="text-[11px] text-sky-800 dark:text-sky-300">
          Generado automáticamente tras aprobar tu devolución{codeDev ? ` ${codeDev}` : ""}
          {origVen ? ` del pedido original ${origVen}` : ""}, con el mismo producto y tus datos de entrega.
        </p>
      </div>
    );
  }

  if (devInfo.existing) {
    const dev = devInfo.existing;
    const refundMeta = getRefundStatusMeta(dev);
    const RefundIcon = refundMeta?.icon;
    const datos = dev.datosReembolso;

    const innerDetails = (
      <>
        {dev.codigoVentaReemplazo && (
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 text-[11px] text-sky-900 dark:text-sky-200 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong>Orden de reposición generada:</strong> {dev.codigoVentaReemplazo}
              <span className="block text-sky-700/90 dark:text-sky-300/90">
                Dirección de entrega: {dev.entregaOriginal?.direccion || ped?.direccion || "Dirección registrada"}
              </span>
            </div>
          </div>
        )}

        {refundMeta && (
          <div className={`p-3 rounded-xl border space-y-2 ${refundMeta.cardClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                {/nequi|daviplata/i.test(datos?.banco || "") ? (
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                Estado del Reembolso
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${refundMeta.badgeClass}`}>
                {RefundIcon && <RefundIcon className="w-3 h-3" />}
                {refundMeta.label}
              </span>
            </div>

            {datos && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/60 p-2.5 rounded-lg border border-black/5 dark:border-white/5">
                <div>
                  <span className="text-gray-400 block text-[10px]">Entidad / Tipo</span>
                  <strong>{datos.banco}</strong> · {datos.tipoCuenta}
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Cuenta / Celular</span>
                  <strong className="font-mono">{datos.numeroCuenta}</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-400">Titular: </span>
                  <strong>{datos.titularNombre}</strong> ({datos.titularTipoDocumento || "CC"} {datos.titularDocumento})
                </div>
              </div>
            )}

            {dev.referenciaReembolso && (
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                <strong>Comprobante / Referencia:</strong> {dev.referenciaReembolso}
              </p>
            )}

            {dev.motivoRechazo && (
              <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                <strong>Detalle / Motivo:</strong> {dev.motivoRechazo}
              </p>
            )}

            {refundMeta.code === "NO_VALIDO" && devInfo.puedeSolicitar && onSolicitar && (
              <button
                type="button"
                onClick={onSolicitar}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Enviar Nueva Solicitud con Datos Corregidos</span>
              </button>
            )}
          </div>
        )}

        {!refundMeta && dev.motivoRechazo && (
          <p className="text-[11px] text-rose-700 dark:text-rose-300">
            <strong>Motivo rechazo:</strong> {dev.motivoRechazo}
          </p>
        )}
      </>
    );

    if (detailsOnly) {
      if (!dev.codigoVentaReemplazo && !refundMeta && !dev.motivoRechazo) return null;
      return <div className="space-y-2 mt-1.5">{innerDetails}</div>;
    }

    return (
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-amber-600" />
            Devolución Registrada {dev.codigoDevolucion ? `· ${dev.codigoDevolucion}` : ""}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200">
            {dev.estado}
          </span>
        </div>

        <p className="text-[11px] text-amber-800 dark:text-amber-300">
          Motivo: <strong>{dev.motivo}</strong> · Solución: <strong>{dev.tipoResolucion}</strong>
        </p>

        {innerDetails}

        {dev.accionRealizada && (
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
            <strong>Acción realizada:</strong> {dev.accionRealizada}
          </p>
        )}
      </div>
    );
  }

  if (devInfo.puedeSolicitar && onSolicitar) {
    return (
      <button
        type="button"
        onClick={onSolicitar}
        className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Solicitar Devolución (Política de 2 días)</span>
      </button>
    );
  }

  return null;
}
