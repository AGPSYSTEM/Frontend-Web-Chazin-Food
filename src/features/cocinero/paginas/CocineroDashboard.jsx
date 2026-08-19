import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { LogOut, ChefHat, Clock, CheckCircle, AlertCircle, Package, User, Sun, Moon, BookOpen, X, ChevronDown, FileText, Search, RefreshCw } from "lucide-react";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { useDarkMode } from "@/shared/hooks/useDarkMode";
import { useNotifications } from "@/shared/hooks/useNotifications";
import logoImg from "@/shared/assets/ChatGPT_Image_1_jun_2026__21_55_04.png";
import { produccionService } from "@/features/produccion/servicios/produccionService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";

function cleanNote(text, productName = "") {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  if (
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    trimmed.includes('"horario"') ||
    trimmed.includes('"codigoPedido"') ||
    trimmed.includes('"tipoEntrega"')
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      const sub = parsed.especificaciones || parsed.nota || parsed.observaciones || "";
      return cleanNote(sub, productName);
    } catch (e) {
      return "";
    }
  }

  const normNote = trimmed.toLowerCase();
  const normProd = (productName || "").toLowerCase().trim();
  if (normProd && (normNote === normProd || normNote.startsWith(normProd))) {
    return "";
  }

  return trimmed;
}

export function CocineroDashboard() {
  const { user, logout } = useAuth();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { success, error: notifyError, confirmAction, confirmLogout } = useNotifications();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pedidoReceta, setPedidoReceta] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalRecetaData, setModalRecetaData] = useState(null);
  const [loadingReceta, setLoadingReceta] = useState(false);

  const fetchPedidos = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const data = await produccionService.getOrdenes();
      const list = Array.isArray(data) ? data : data?.data || [];
      setPedidos(list);
    } catch (err) {
      console.error("Error al cargar pedidos en CocineroDashboard:", err);
      if (!isSilent) {
        notifyError("Error", "No se pudieron sincronizar los pedidos con el servidor");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notifyError]);

  useEffect(() => {
    fetchPedidos();

    // Auto-refresh interval every 10 seconds to detect new orders from POS or Clients
    const interval = setInterval(() => {
      fetchPedidos(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchPedidos]);

  const cambiarEstado = async (id, nuevoEstado) => {
    const confirmed = await confirmAction(
      "¿Cambiar estado?",
      `¿Deseas marcar la orden #${id} como "${nuevoEstado}"?`
    );
    if (confirmed) {
      try {
        await produccionService.updateEstadoOrden(id, nuevoEstado);
        setPedidos((prev) =>
          prev.map((p) => (String(p.id) === String(id) || String(p.idVenta) === String(id) ? { ...p, estado: nuevoEstado } : p))
        );
        success("Estado actualizado", `Pedido #${id} marcado como "${nuevoEstado}"`);
        fetchPedidos(true);
      } catch (err) {
        notifyError("Error", err.message || "No se pudo actualizar el estado");
      }
    }
  };

  const verReceta = async (pedido, producto) => {
    setPedidoReceta(pedido);
    setProductoSeleccionado(producto);
    setLoadingReceta(true);

    if (producto.receta) {
      setModalRecetaData(producto.receta);
      setLoadingReceta(false);
      return;
    }

    try {
      const prodId = producto.idProducto || producto.idVariante || producto.id;
      if (prodId) {
        const ft = await fichasTecnicasService.getFichaByProducto(prodId);
        if (ft && (ft.detalles || ft.procedimiento || ft.idFichaTecnica)) {
          const rawPasos = ft.procedimiento || ft.descripcion || "";
          const pasos = rawPasos
            ? rawPasos.split("\n").map(p => p.trim()).filter(Boolean)
            : ["Preparar los ingredientes según porciones", "Cocinar y servir caliente"];

          setModalRecetaData({
            idFichaTecnica: ft.idFichaTecnica,
            idProducto: ft.idProducto,
            tiempoPreparacion: ft.tiempoPreparacion ? `${ft.tiempoPreparacion} min` : "12 min",
            rendimiento: ft.rendimiento || "1 porción",
            especificaciones: ft.especificaciones || "",
            caracteristicas: ft.caracteristicas || "",
            informacionNutricional: ft.informacionNutricional || "",
            condicionesAlmacenamiento: ft.condicionesAlmacenamiento || "",
            vidaUtil: ft.vidaUtil || "",
            ingredientes: (ft.detalles || []).map(d => ({
              idInsumo: d.idInsumo,
              nombre: d.insumo?.nombre || d.nombreInsumo || `Insumo #${d.idInsumo}`,
              cantidad: `${d.cantidad || 1} ${d.unidadMedida || d.insumo?.unidadMedida || 'und'}`
            })),
            pasos
          });
          return;
        }
      }
      // Fallback si no tiene ficha técnica registrada
      setModalRecetaData({
        tiempoPreparacion: "10-15 min",
        rendimiento: "1 unidad",
        especificaciones: "Preparación estándar",
        ingredientes: [
          { nombre: "Ingredientes del platillo", cantidad: "1 porción" }
        ],
        pasos: [
          "Revisar especificaciones del cliente",
          "Preparar en cocina según pedido",
          "Emplatar y entregar"
        ]
      });
    } catch (err) {
      console.warn("No se pudo cargar ficha técnica del producto:", err);
      setModalRecetaData({
        tiempoPreparacion: "10-15 min",
        rendimiento: "1 unidad",
        ingredientes: [{ nombre: "Ingredientes estándar", cantidad: "1 porción" }],
        pasos: ["Preparar en cocina según orden"]
      });
    } finally {
      setLoadingReceta(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await confirmLogout();
    if (confirmed) {
      logout();
      success("Sesión cerrada", "Has salido del sistema correctamente");
    }
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtroEstado === "Todos") return true;
    if (filtroEstado === "Pendiente") return p.estado === "Pendiente" || p.estado === "En Cola" || p.estadoEntrega === "PENDIENTE";
    if (filtroEstado === "En Preparación") return p.estado === "En Preparación" || p.estadoEntrega === "PREPARANDO";
    if (filtroEstado === "Listo") return p.estado === "Listo" || p.estadoEntrega === "LISTO";
    return p.estado === filtroEstado;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white/20 shrink-0 border border-gray-200 dark:border-gray-700 shadow-xs">
              <img src={logoImg} alt="Chazin Food" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 dark:text-gray-100 text-base sm:text-lg flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#F05454]" />
                Cocina Chazin Food
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Panel Interactivo de Preparación de Pedidos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync button */}
            <button
              onClick={() => fetchPedidos(false)}
              disabled={loading || refreshing}
              className={`p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                refreshing ? "animate-spin text-[#F05454]" : ""
              }`}
              title="Actualizar pedidos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Recetas / Fichas Técnicas link */}
            <Link
              to="/fichas-tecnicas"
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-[#F05454] rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Recetas</span>
            </Link>

            <button
              onClick={() => toggleDarkMode()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors"
              title={darkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {["Todos", "Pendiente", "En Preparación", "Listo"].map((st) => {
              const count = pedidos.filter((p) => {
                if (st === "Todos") return true;
                if (st === "Pendiente") return p.estado === "Pendiente" || p.estado === "En Cola" || p.estadoEntrega === "PENDIENTE";
                if (st === "En Preparación") return p.estado === "En Preparación" || p.estadoEntrega === "PREPARANDO";
                if (st === "Listo") return p.estado === "Listo" || p.estadoEntrega === "LISTO";
                return p.estado === st;
              }).length;

              return (
                <button
                  key={st}
                  onClick={() => setFiltroEstado(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    filtroEstado === st
                      ? "bg-[#F05454] text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{st}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    filtroEstado === st ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-500 font-bold">
            <span>Órdenes activas: {pedidosFiltrados.length}</span>
            {refreshing && <span className="text-[#F05454] text-[11px] animate-pulse">Sincronizando...</span>}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
            <RefreshCw className="w-8 h-8 text-[#F05454] animate-spin mx-auto mb-3" />
            <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">Cargando órdenes de la cocina...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-14 text-center bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <ChefHat className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <h3 className="font-bold text-base text-gray-700 dark:text-gray-200">No hay pedidos en este estado</h3>
            <p className="text-xs text-gray-400 mt-1">Los nuevos pedidos de clientes y del punto de venta aparecerán aquí automáticamente.</p>
          </div>
        ) : (
          /* Orders Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pedidosFiltrados.map((ped) => {
              const isListo = ped.estado === "Listo" || ped.estadoEntrega === "LISTO";
              const isPreparando = ped.estado === "En Preparación" || ped.estadoEntrega === "PREPARANDO";
              const isPendiente = !isListo && !isPreparando;

              return (
                <div
                  key={ped.id || ped.idVenta}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="p-5">
                    {/* Header of Order Card */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3.5 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ped.imagen || "🍽️"}</span>
                          <h3 className="font-black text-gray-900 dark:text-gray-100 text-base">
                            {ped.codigo || `Pedido #${ped.id || ped.idVenta}`}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                          👤 {ped.cliente || ped.responsable || "Cliente Mostrador"} • 🕒 {ped.horaInicio || ped.hora || "Reciente"}
                        </p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black shrink-0 ${
                          isListo
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : isPreparando
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 animate-pulse"
                            : "bg-red-100 dark:bg-red-900/30 text-[#F05454] dark:text-red-400"
                        }`}
                      >
                        {isListo ? "Listo" : isPreparando ? "En Preparación" : "En Cola"}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2.5">
                      {(ped.productos || []).map((prod, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-sm text-gray-900 dark:text-gray-100">
                              <span className="text-[#F05454] mr-1.5">{prod.cantidad}x</span>
                              {prod.nombre}
                            </p>

                            {/* Additions / Customizations */}
                            {Array.isArray(prod.adiciones) && prod.adiciones.length > 0 && (
                              <div className="space-y-1 mt-1.5">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-wider">
                                  Adiciones Extra:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {prod.adiciones.map((ad, i) => {
                                    const adName = typeof ad === "object" ? (ad.nombre || ad.nombreAdicion) : String(ad);
                                    const adQty = typeof ad === "object" && ad.cantidad > 1 ? `x${ad.cantidad} ` : "";
                                    return (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[#F05454] dark:text-red-300 text-[11px] font-black rounded-lg"
                                      >
                                        + {adQty}{adName}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Client notes / specifications */}
                            {cleanNote(prod.observaciones || prod.observacion || prod.nota || prod.especificaciones, prod.nombre) && (
                              <div className="mt-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-amber-700 dark:text-amber-400">Nota: </span>
                                  <span className="font-semibold italic">
                                    "{cleanNote(prod.observaciones || prod.observacion || prod.nota || prod.especificaciones, prod.nombre)}"
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Receta button */}
                          <button
                            type="button"
                            onClick={() => verReceta(ped, prod)}
                            className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-[#F05454] rounded-xl text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                            title="Ver ficha técnica / receta de preparación"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Receta</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* General order note if any */}
                    {cleanNote(ped.observaciones) && (
                      <div className="mt-3 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                        <span className="font-bold">Observación General:</span> {cleanNote(ped.observaciones)}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    {isPendiente && (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(ped.id || ped.idVenta, "En Preparación")}
                        className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 active:scale-98 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Iniciar Preparación</span>
                      </button>
                    )}
                    {isPreparando && (
                      <button
                        type="button"
                        onClick={() => cambiarEstado(ped.id || ped.idVenta, "Listo")}
                        className="w-full py-2.5 bg-green-600 hover:bg-green-700 active:scale-98 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Marcar como Listo</span>
                      </button>
                    )}
                    {isListo && (
                      <div className="w-full text-center text-xs font-black text-green-600 dark:text-green-400 py-1.5 flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4" />
                        <span>¡Listo para entregar al cliente!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Receta / Ficha Técnica */}
        {productoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#F05454] flex items-center justify-center font-bold text-lg shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-base">
                      {productoSeleccionado.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      ⏱️ Tiempo estimado: {modalRecetaData?.tiempoPreparacion || "12 min"} • Rendimiento: {modalRecetaData?.rendimiento || "1 porción"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProductoSeleccionado(null);
                    setModalRecetaData(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {loadingReceta ? (
                  <div className="py-8 text-center">
                    <RefreshCw className="w-6 h-6 text-[#F05454] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold">Cargando ficha técnica...</p>
                  </div>
                ) : (
                  <>
                    {/* Ingredients List */}
                    <div>
                      <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                        🥘 Ingredientes & Porciones Requeridas:
                      </h4>
                      {modalRecetaData?.ingredientes && modalRecetaData.ingredientes.length > 0 ? (
                        <div className="space-y-1.5">
                          {modalRecetaData.ingredientes.map((ing, i) => (
                            <div
                              key={i}
                              className="text-xs sm:text-sm flex justify-between items-center p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50"
                            >
                              <span className="font-semibold">{ing.nombre}</span>
                              <span className="font-black text-[#F05454] dark:text-red-400 bg-white dark:bg-gray-900 px-2 py-0.5 rounded-lg text-xs shadow-2xs">
                                {ing.cantidad}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No hay ingredientes desglosados en esta ficha técnica.</p>
                      )}
                    </div>

                    {/* Step-by-step preparation */}
                    <div>
                      <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                        👨‍🍳 Procedimiento de Preparación:
                      </h4>
                      {modalRecetaData?.pasos && modalRecetaData.pasos.length > 0 ? (
                        <ol className="space-y-2 list-decimal list-inside text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {modalRecetaData.pasos.map((paso, i) => (
                            <li key={i} className="leading-relaxed pl-1 py-0.5">
                              <span className="font-medium">{paso}</span>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Preparar según estándar de cocina de la casa.</p>
                      )}
                    </div>

                    {/* Specifications or storage if present */}
                    {modalRecetaData?.especificaciones && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                        <span className="font-bold">Especificaciones:</span> {modalRecetaData.especificaciones}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setProductoSeleccionado(null);
                    setModalRecetaData(null);
                  }}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
