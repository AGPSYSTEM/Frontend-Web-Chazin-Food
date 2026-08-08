import { X, Mail, Phone, MapPin, TrendingUp, Clock, Calendar, Star } from "lucide-react";

export function ClienteDetalleModal({ isOpen, onClose, cliente }) {
  if (!isOpen || !cliente) return null;

  const tipoCliente = cliente.tipo || (cliente.esVip ? "VIP" : "Regular");
  
  // Color scheme helpers for Avatar & Badges
  const getAvatarBg = (nombre = "") => {
    const firstChar = nombre.charAt(0).toUpperCase();
    if (["A", "B", "C"].includes(firstChar)) return "bg-emerald-500 text-white";
    if (["D", "E", "F", "G"].includes(firstChar)) return "bg-blue-500 text-white";
    if (["H", "I", "J", "K"].includes(firstChar)) return "bg-purple-500 text-white";
    if (["L", "M", "N"].includes(firstChar)) return "bg-indigo-500 text-white";
    if (["O", "P", "Q", "R"].includes(firstChar)) return "bg-amber-500 text-white";
    return "bg-slate-500 text-white";
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case "VIP":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
      case "Frecuente":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
      case "Regular":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
      case "Nuevo":
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getDescuentoTexto = (tipo) => {
    switch (tipo) {
      case "VIP":
        return "15% de descuento";
      case "Frecuente":
        return "10% de descuento";
      case "Regular":
        return "5% de descuento";
      case "Nuevo":
      default:
        return null;
    }
  };

  // Mock transactions if not present on client object
  const transacciones = cliente.transacciones || [
    { idTrans: `T-${cliente.id || 1}-1000`, fecha: "26/5/2026", producto: "Salchipapa Grande", total: "$13.611" },
    { idTrans: `T-${cliente.id || 1}-1001`, fecha: "19/5/2026", producto: "Perro Caliente Especial", total: "$15.111" },
    { idTrans: `T-${cliente.id || 1}-1002`, fecha: "12/5/2026", producto: "Pollo Broaster", total: "$16.611" },
    { idTrans: `T-${cliente.id || 1}-1003`, fecha: "5/5/2026", producto: "Combo Familiar", total: "$18.111" },
    { idTrans: `T-${cliente.id || 1}-1004`, fecha: "28/4/2026", producto: "Papas Fritas Medianas", total: "$12.111" }
  ];

  const totalComprasCount = cliente.compras || transacciones.length;
  const totalGastadoStr = cliente.totalGastado || `$${(totalComprasCount * 15000).toLocaleString("es-CO")}`;
  const ticketPromedioStr = cliente.ticketPromedio || "$15K";
  const comprasMes = cliente.comprasMes || (tipoCliente === "VIP" ? "3.8" : tipoCliente === "Frecuente" ? "2.7" : tipoCliente === "Regular" ? "1.5" : "0.7");
  const frecuenciaTipo = cliente.frecuenciaTipo || (tipoCliente === "VIP" ? "Frecuente" : tipoCliente === "Frecuente" ? "Frecuente" : tipoCliente === "Regular" ? "Mensual" : "Esporádico");
  const ultimaCompraFecha = cliente.ultimaCompra || "26/5/2026";
  const descuentoTag = getDescuentoTexto(tipoCliente);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
        
        {/* Header: Avatar, Name, Type Badge & Close Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center shrink-0 shadow-sm ${getAvatarBg(cliente.nombre)}`}>
              {cliente.nombre ? cliente.nombre.charAt(0).toUpperCase() : "C"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {cliente.nombre} {cliente.apellidos || ""}
              </h2>
              <p className="text-xs text-gray-400 font-medium">Cliente #{cliente.id || cliente.idCliente || 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTipoBadge(tipoCliente)}`}>
              {tipoCliente}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. INFORMACIÓN DE CONTACTO */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold tracking-wider text-gray-700 dark:text-gray-300 uppercase">
            Información de Contacto
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400">Email</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                  {cliente.email || "sin.email@ejemplo.com"}
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400">Teléfono</p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {cliente.telefono || "300 000 0000"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-gray-50/70 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400">Dirección</p>
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                {cliente.direccion || "Medellín, Colombia"}
              </p>
            </div>
          </div>
        </div>

        {/* 2. ESTADÍSTICAS DE COMPRA */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold tracking-wider text-gray-700 dark:text-gray-300 uppercase">
            Estadísticas de Compra
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-center">
              <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Total Compras</p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-0.5">{totalComprasCount}</p>
            </div>
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center">
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Total Gastado</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{totalGastadoStr}</p>
            </div>
            <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center">
              <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Ticket Promedio</p>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">{ticketPromedioStr}</p>
            </div>
          </div>
        </div>

        {/* 3. FRECUENCIA DE CONSUMO */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold tracking-wider text-gray-700 dark:text-gray-300 uppercase">
            Frecuencia de Consumo
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-center flex flex-col items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-500 mb-1" />
              <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">Compras / mes</p>
              <p className="text-base font-bold text-amber-800 dark:text-amber-200 mt-0.5">{comprasMes}</p>
            </div>
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-center flex flex-col items-center justify-center">
              <Clock className="w-4 h-4 text-purple-500 mb-1" />
              <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400">Tipo</p>
              <p className="text-base font-bold text-purple-800 dark:text-purple-200 mt-0.5">{frecuenciaTipo}</p>
            </div>
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center flex flex-col items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-500 mb-1" />
              <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Última compra</p>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200 mt-0.5">{ultimaCompraFecha}</p>
            </div>
          </div>
        </div>

        {/* 4. HISTORIAL DE TRANSACCIONES */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold tracking-wider text-gray-700 dark:text-gray-300 uppercase">
            Historial de Transacciones
          </h3>
          <div className="bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-2.5">N° TRANS.</th>
                  <th className="px-4 py-2.5">FECHA</th>
                  <th className="px-4 py-2.5">PRODUCTO</th>
                  <th className="px-4 py-2.5 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium text-gray-700 dark:text-gray-300">
                {transacciones.slice(0, 5).map((t, idx) => (
                  <tr key={idx} className="hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-2 text-gray-400 font-mono text-[11px]">{t.idTrans}</td>
                    <td className="px-4 py-2">{t.fecha}</td>
                    <td className="px-4 py-2 font-bold text-gray-800 dark:text-gray-200">{t.producto}</td>
                    <td className="px-4 py-2 text-right font-extrabold text-gray-900 dark:text-gray-100">{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 text-center font-medium pt-0.5">
            Mostrando las últimas 5 de {totalComprasCount} transacciones.
          </p>
        </div>

        {/* 5. BENEFICIOS ACTIVOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold tracking-wider text-gray-700 dark:text-gray-300 uppercase">
              Beneficios Activos
            </h3>
            {descuentoTag && (
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-full text-[11px] font-bold">
                {descuentoTag}
              </span>
            )}
          </div>
          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-gray-800 text-rose-500 flex items-center justify-center shrink-0 shadow-2xs">
              <Star className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                Cliente {tipoCliente}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Última compra: {ultimaCompraFecha}
              </p>
            </div>
          </div>
        </div>

        {/* Footer: Cerrar Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
