import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  Clock,
  User,
  UtensilsCrossed,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Bike,
  ShoppingBag,
  ArrowLeft,
  Filter,
  Layers,
  BookOpen,
  Sparkles,
  CheckCheck,
  MapPin
} from "lucide-react";
import { getAdditionEmoji } from "@/shared/utils/foodEmojiUtils";
import { parseKitchenOrderNotes } from "@/shared/utils/orderUtils";

export function HistorialComandasLista({
  pedidos = [],
  onReabrir,
  onVerReceta,
  onVolverAlTablero,
  isLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("todos"); // 'hoy' | 'ayer' | 'semana' | 'todos'
  const [filtroCanal, setFiltroCanal] = useState("todos"); // 'todos' | 'Mesa' | 'Para Llevar' | 'Domicilio'
  const [expandedOrders, setExpandedOrders] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Reset pagination to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroFecha, filtroCanal, itemsPerPage]);

  // Helper date filter
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return pedidos.filter((p) => {
      const orderDate = p.fechaVenta ? new Date(p.fechaVenta) : (p.fecha ? new Date(p.fecha) : null);
      const orderDateStr = orderDate && !isNaN(orderDate.getTime()) ? orderDate.toISOString().split("T")[0] : "";

      // 1. Date filter
      if (filtroFecha === "hoy" && orderDateStr !== todayStr) return false;
      if (filtroFecha === "ayer" && orderDateStr !== yesterdayStr) return false;
      if (filtroFecha === "semana" && orderDate && orderDate < weekAgo) return false;

      // 2. Channel filter
      if (filtroCanal !== "todos") {
        const canal = (p.tipoEntrega || p.mesa || "").toLowerCase();
        if (!canal.includes(filtroCanal.toLowerCase())) return false;
      }

      // 3. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const code = (p.codigo || `VEN-${p.id || p.idVenta}`).toLowerCase();
        const client = (p.cliente || p.responsable || "").toLowerCase();
        const prods = (p.productos || []).some((pr) => (pr.nombre || "").toLowerCase().includes(q));
        if (!code.includes(q) && !client.includes(q) && !prods) return false;
      }

      return true;
    });
  }, [pedidos, filtroFecha, filtroCanal, searchTerm]);

  // Pagination slicing & numbers
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredOrders.length);

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, startIndex, endIndex]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  // Quick Metrics for History
  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const totalPlatillos = filteredOrders.reduce(
      (acc, p) => acc + (p.cantidad || (p.productos || []).reduce((s, i) => s + (i.cantidad || 1), 0)),
      0
    );
    return { total, totalPlatillos };
  }, [filteredOrders]);

  return (
    <div className="space-y-4 flex-1 flex flex-col">
      {/* ── Top Bar: Back to Board & Controls ── */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVolverAlTablero}
            className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-black transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#F05454]" />
            <span>Volver al Tablero de Cocina</span>
          </button>
          <div>
            <h2 className="font-black text-gray-900 dark:text-gray-100 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F05454]" />
              Historial de Comandas Despachadas
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Registro completo de órdenes entregadas y archivadas
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="px-3 py-1.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-xl text-green-700 dark:text-green-300 flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4 text-green-600" />
            <span>
              Total Despachadas: <strong>{stats.total}</strong>
            </span>
          </div>
          <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#F05454]" />
            <span>
              Platillos: <strong>{stats.totalPlatillos}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters Strip ── */}
      <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en historial por código, cliente o platillo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-[#F05454] focus:bg-white dark:focus:bg-gray-900 rounded-xl text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-hidden transition"
          />
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mr-1">
            <Calendar className="w-3.5 h-3.5" />
            Fecha:
          </span>
          {[
            { id: "todos", label: "Todas" },
            { id: "hoy", label: "Hoy" },
            { id: "ayer", label: "Ayer" },
            { id: "semana", label: "Últimos 7 días" }
          ].map((df) => (
            <button
              key={df.id}
              type="button"
              onClick={() => setFiltroFecha(df.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filtroFecha === df.id
                  ? "bg-[#F05454] text-white shadow-2xs"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Canal:
          </span>
          {["todos", "Mesa", "Para Llevar", "Domicilio"].map((canal) => (
            <button
              key={canal}
              type="button"
              onClick={() => setFiltroCanal(canal)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filtroCanal === canal
                  ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {canal === "todos" ? "Todos" : canal}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table / List View of Orders ── */}
      {isLoading ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#F05454] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-400 font-bold">Cargando historial...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 shadow-xs flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckCheck className="w-8 h-8" />
          </div>
          <h3 className="font-black text-base text-gray-800 dark:text-gray-100">
            {searchTerm ? "No hay comandas que coincidan con la búsqueda" : "No hay comandas en este rango de historial"}
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md font-medium">
            Las comandas que sean completadas y despachadas en cocina se archivarán automáticamente en esta lista.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Comanda / Canal</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Platillos Principales</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs font-medium">
                {paginatedOrders.map((ped) => {
                  const orderId = ped.id || ped.idVenta;
                  const isExpanded = Boolean(expandedOrders[orderId]);
                  const items = Array.isArray(ped.productos) ? ped.productos : [];
                  const totalPlatillos = items.reduce((s, i) => s + (i.cantidad || 1), 0);
                  const parsedNotes = parseKitchenOrderNotes(ped.observaciones);

                  // Delivery badge styling
                  const isDomicilio = String(ped.tipoEntrega || ped.mesa || "").toLowerCase().includes("domicilio");
                  const isLlevar = String(ped.tipoEntrega || ped.mesa || "").toLowerCase().includes("llevar");
                  const badgeLabel = ped.mesa || ped.tipoEntrega || "En Local";

                  // Date and time display
                  const orderDate = ped.fechaVenta ? new Date(ped.fechaVenta) : (ped.fecha ? new Date(ped.fecha) : null);
                  let timeStr = ped.horaInicio || "";
                  let dateStr = "";
                  if (orderDate && !isNaN(orderDate.getTime())) {
                    let h = orderDate.getHours();
                    const m = String(orderDate.getMinutes()).padStart(2, "0");
                    const ampm = h >= 12 ? "PM" : "AM";
                    h = h % 12 || 12;
                    timeStr = `${String(h).padStart(2, "0")}:${m} ${ampm}`;
                    dateStr = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
                  }

                  return (
                    <tr
                      key={orderId}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors group"
                    >
                      {/* Code & Channel */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleExpand(orderId)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 transition cursor-pointer"
                            title="Desplegar platillos de la comanda"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <div>
                            <span className="font-black text-sm text-gray-900 dark:text-gray-100 block font-mono">
                              {ped.codigo || `VEN-${orderId}`}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold mt-0.5 ${
                                isDomicilio
                                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                                  : isLlevar
                                  ? "bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
                                  : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              }`}
                            >
                              {isDomicilio ? (
                                <Bike className="w-2.5 h-2.5" />
                              ) : isLlevar ? (
                                <ShoppingBag className="w-2.5 h-2.5" />
                              ) : (
                                <UtensilsCrossed className="w-2.5 h-2.5" />
                              )}
                              <span>{badgeLabel}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{ped.cliente || ped.responsable || "Cliente Mostrador"}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                          <Clock className="w-3 h-3 text-[#F05454]" />
                          <span>{timeStr}</span>
                        </div>
                        {dateStr && <span className="text-[10px] text-gray-400 block">{dateStr}</span>}
                      </td>

                      {/* Products Summary */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {items.slice(0, 3).map((it, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-bold"
                            >
                              <span className="text-[#F05454] font-black">{it.cantidad}x</span>
                              <span className="truncate max-w-[130px]">{it.nombre}</span>
                            </span>
                          ))}
                          {items.length > 3 && (
                            <span className="text-[10px] font-bold text-gray-400 self-center">
                              +{items.length - 3} más
                            </span>
                          )}
                        </div>

                        {/* Collapsible expanded detail */}
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                            <p className="font-bold text-[11px] text-gray-500 uppercase tracking-wide">
                              Detalle de platillos despachados:
                            </p>
                            {items.map((it, idx) => {
                              const itemNote = (
                                it.observaciones ||
                                it.observacion ||
                                it.especificaciones ||
                                parsedNotes.productosObs.find(p => p.nombre === it.nombre)?.obs ||
                                ""
                              ).trim();

                              return (
                                <div key={idx} className="py-1.5 border-b border-gray-200/50 dark:border-gray-700/50 last:border-0 space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                      {it.cantidad}x {it.nombre}
                                    </span>
                                    {onVerReceta && (
                                      <button
                                        type="button"
                                        onClick={() => onVerReceta(ped, it)}
                                        className="text-[10px] text-[#F05454] font-bold hover:underline cursor-pointer flex items-center gap-1"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        Receta
                                      </button>
                                    )}
                                  </div>

                                  {/* Adiciones si existen */}
                                  {Array.isArray(it.adiciones) && it.adiciones.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pl-3">
                                      {it.adiciones.map((ad, aIdx) => (
                                        <span key={aIdx} className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-700/60 px-1.5 py-0.5 rounded">
                                          + {typeof ad === "object" ? ad.nombre : ad}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Nota individual del plato si existe */}
                                  {itemNote && (
                                    <p className="text-[10.5px] text-amber-800 dark:text-amber-300 pl-3 italic flex items-center gap-1">
                                      <span>↳</span>
                                      <span>Nota: "{itemNote}"</span>
                                    </p>
                                  )}
                                </div>
                              );
                            })}

                            {/* Observaciones generales de cocina y entrega */}
                            {parsedNotes.hasNotes && (
                              <div className="mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1.5">
                                {parsedNotes.notaCliente && (
                                  <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg flex items-start gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-black">Nota de Cocina: </span>
                                      <span className="italic font-medium">"{parsedNotes.notaCliente}"</span>
                                    </div>
                                  </div>
                                )}

                                {parsedNotes.direccion && (
                                  <div className="text-[11px] text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2 rounded-lg flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                    <span className="font-bold">Dirección de Entrega: </span>
                                    <span className="font-medium">{parsedNotes.direccion}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-[11px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          Despachado
                        </span>
                      </td>

                      {/* Action: Reabrir */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onReabrir(orderId)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ml-auto shadow-2xs"
                          title="Devolver comanda a cocina si el cliente solicitó cambios"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reabrir a Cocina</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="bg-gray-50/70 dark:bg-gray-800/50 px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Items per page selector & Total count */}
            <div className="flex flex-wrap items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-600 dark:text-gray-300">Mostrar:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-800 dark:text-gray-200 text-xs focus:ring-2 focus:ring-[#F05454] outline-hidden cursor-pointer"
                >
                  <option value={5}>5 comandas</option>
                  <option value={8}>8 comandas</option>
                  <option value={15}>15 comandas</option>
                  <option value={25}>25 comandas</option>
                  <option value={50}>50 comandas</option>
                </select>
              </div>
              <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
              <span>
                Mostrando <strong className="text-gray-800 dark:text-gray-200">{filteredOrders.length === 0 ? 0 : startIndex + 1}</strong> a{" "}
                <strong className="text-gray-800 dark:text-gray-200">{endIndex}</strong> de{" "}
                <strong className="text-gray-800 dark:text-gray-200">{filteredOrders.length}</strong> comandas
              </span>
            </div>

            {/* Right: Page Navigation Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) =>
                  pageNum === "..." ? (
                    <span key={`dots-${idx}`} className="px-1.5 text-gray-400 font-bold select-none">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] h-7 px-2 rounded-xl text-xs font-black transition cursor-pointer ${
                        validCurrentPage === pageNum
                          ? "bg-[#F05454] text-white shadow-2xs"
                          : "hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage >= totalPages}
                className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
