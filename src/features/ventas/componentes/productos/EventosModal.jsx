import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Zap,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Power,
  AlertTriangle,
  Tag,
  CheckCircle2,
  AlertCircle,
  Package
} from "lucide-react";
import Swal from "sweetalert2";
import { eventosService } from "../../servicios/eventosService";

export function EventosModal({
  isOpen,
  onClose,
  eventos = [],
  onOpenCrearEvento,
  onRefresh
}) {
  const [activeTab, setActiveTab] = useState("todos"); // 'todos' | 'activos' | 'inactivos'
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Live timer for real-time countdown
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000); // 30s tick
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Real-time evaluation helper
  const evaluateVigencia = (evt) => {
    if (!evt.fechaFin) {
      return {
        estadoVigencia: "PERMANENTE",
        estaVigente: evt.estado === "Activo" || evt.estado === 1,
        diasRestantes: null,
        label: "Vigencia Permanente",
        urgente: false
      };
    }

    const finDate = new Date(`${evt.fechaFin}T23:59:59`);
    const inicioDate = evt.fechaInicio ? new Date(`${evt.fechaInicio}T00:00:00`) : null;

    const ms = finDate.getTime() - now.getTime();
    const diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.max(0, Math.floor(ms / (1000 * 60 * 60)));

    if (inicioDate && now < inicioDate) {
      const msInicio = inicioDate.getTime() - now.getTime();
      const diasInicio = Math.ceil(msInicio / (1000 * 60 * 60 * 24));
      return {
        estadoVigencia: "PROGRAMADO",
        estaVigente: false,
        diasRestantes,
        label: `Inicia en ${diasInicio} día${diasInicio !== 1 ? "s" : ""}`,
        urgente: false
      };
    }

    if (ms < 0) {
      const diasExpirado = Math.abs(diasRestantes);
      return {
        estadoVigencia: "EXPIRADO",
        estaVigente: false,
        diasRestantes: 0,
        label: `Finalizado hace ${diasExpirado} día${diasExpirado !== 1 ? "s" : ""}`,
        urgente: false
      };
    }

    const urgente = diasRestantes <= 3;
    let label = `Quedan ${diasRestantes} días`;
    if (diasRestantes === 1) {
      label = `¡Último día! (${horasRestantes}h restantes)`;
    } else if (diasRestantes === 0) {
      label = `¡Termina hoy! (${horasRestantes}h restantes)`;
    }

    return {
      estadoVigencia: "ACTIVO",
      estaVigente: evt.estado === "Activo" || evt.estado === 1,
      diasRestantes,
      horasRestantes,
      label,
      urgente
    };
  };

  const eventosEvaluados = eventos.map((e) => {
    const vig = evaluateVigencia(e);
    return {
      ...e,
      vigenciaEvaluada: vig,
      isActivo: (e.estado === "Activo" || e.estado === 1) && vig.estadoVigencia === "ACTIVO"
    };
  });

  const filteredEventos = eventosEvaluados.filter((e) => {
    if (activeTab === "activos") return e.isActivo;
    if (activeTab === "inactivos") return !e.isActivo;
    return true;
  });

  const totalActivos = eventosEvaluados.filter((e) => e.isActivo).length;

  const handleToggleEstado = async (evt) => {
    const isActivo = evt.estado === "Activo" || evt.estado === 1;
    const nuevoEstado = isActivo ? 0 : 1;
    const actionText = isActivo ? "Pausar" : "Reanudar";

    const result = await Swal.fire({
      title: `¿${actionText} este evento?`,
      text: isActivo
        ? `El evento "${evt.nombre || evt.nombreEvento}" dejará de aplicar descuentos en el catálogo.`
        : `El evento "${evt.nombre || evt.nombreEvento}" volverá a estar activo para los clientes.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: isActivo ? "#f59e0b" : "#8b5cf6"
    });

    if (!result.isConfirmed) return;

    setTogglingId(evt.id || evt.idEvento);
    try {
      await eventosService.updateEvento(evt.id || evt.idEvento, {
        estado: nuevoEstado
      });
      Swal.fire({
        icon: "success",
        title: isActivo ? "Evento Pausado" : "Evento Activado",
        text: `El estado del evento fue actualizado correctamente.`,
        timer: 1800,
        showConfirmButton: false
      });
      onRefresh?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "No se pudo actualizar el estado del evento."
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteEvento = async (evt) => {
    const result = await Swal.fire({
      title: "¿Eliminar evento?",
      text: `Se eliminará permanentemente la campaña "${evt.nombre || evt.nombreEvento}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444"
    });

    if (!result.isConfirmed) return;

    setDeletingId(evt.id || evt.idEvento);
    try {
      await eventosService.deleteEvento(evt.id || evt.idEvento);
      Swal.fire({
        icon: "success",
        title: "Evento Eliminado",
        text: "La campaña de evento fue removida del sistema.",
        timer: 1800,
        showConfirmButton: false
      });
      onRefresh?.();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: err?.message || "No se pudo eliminar el evento."
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50/50 via-rose-50/30 to-amber-50/40 dark:from-purple-950/20 dark:via-rose-950/10 dark:to-amber-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">
                  Gestión de Eventos & Ediciones Especiales
                </h2>
                <span className="bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                  LTO Fast Food
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-2">
                <span>{totalActivos} activos en catálogo</span>
                <span>•</span>
                <span>{eventos.length} registrados en total</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Filter Bar */}
        <div className="px-5 sm:px-6 py-3 bg-gray-50/80 dark:bg-gray-850/60 border-b border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-2xs">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "todos"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Todos ({eventos.length})
            </button>
            <button
              onClick={() => setActiveTab("activos")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "activos"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Activos ({totalActivos})
            </button>
            <button
              onClick={() => setActiveTab("inactivos")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "inactivos"
                  ? "bg-gray-700 text-white shadow-2xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
              }`}
            >
              Pausados / Finalizados ({eventos.length - totalActivos})
            </button>
          </div>

          {/* New Event Button */}
          {onOpenCrearEvento && (
            <button
              onClick={onOpenCrearEvento}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Evento</span>
            </button>
          )}
        </div>

        {/* Body - Event List */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {filteredEventos.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center mx-auto shadow-2xs">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-gray-800 dark:text-gray-200 text-base">
                No hay eventos en esta sección
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                {activeTab === "activos"
                  ? "No hay campañas activas con vigencia vigente. Activa o crea un nuevo evento."
                  : "No hay eventos registrados en este criterio."}
              </p>
              {onOpenCrearEvento && (
                <button
                  onClick={onOpenCrearEvento}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-purple-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Evento Ahora</span>
                </button>
              )}
            </div>
          ) : (
            filteredEventos.map((evt) => {
              const vig = evt.vigenciaEvaluada;
              const hasProduct = Boolean(evt.producto || evt.idProducto);
              const isActivo = evt.estado === "Activo" || evt.estado === 1;

              return (
                <div
                  key={evt.id || evt.idEvento}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    evt.isActivo
                      ? "bg-white dark:bg-gray-850/90 border-purple-200 dark:border-purple-800/60 shadow-sm ring-1 ring-purple-400/20"
                      : "bg-gray-50/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/60 opacity-85"
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail / Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                      {evt.producto?.imagen ? (
                        <img
                          src={evt.producto.imagen}
                          alt={evt.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="w-6 h-6 text-purple-500" />
                      )}
                      {evt.isActivo && (
                        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-tight">
                          {evt.nombre || evt.nombreEvento}
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          {evt.tipoEvento || "EDICION_LIMITADA"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {evt.descripcion || "Promoción gastronómica especial de tiempo limitado."}
                      </p>

                      {/* Product & Price details */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
                        {evt.producto && (
                          <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded-md text-[11px]">
                            <Package className="w-3 h-3 text-purple-500" />
                            {evt.producto.nombre}
                          </span>
                        )}

                        {evt.nuevoPrecio && Number(evt.nuevoPrecio) > 0 && (
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                            Precio Evento: ${Number(evt.nuevoPrecio).toLocaleString("es-CO")}
                          </span>
                        )}

                        {evt.descuento && Number(evt.descuento) > 0 && (
                          <span className="font-black text-rose-600 dark:text-rose-400 text-[11px] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/50">
                            -{Math.round(Number(evt.descuento))}% OFF
                          </span>
                        )}
                      </div>

                      {/* Real-time Vigencia Pill */}
                      <div className="pt-1.5 flex flex-wrap items-center gap-2">
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-2xs ${
                            vig.estadoVigencia === "EXPIRADO"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                              : vig.urgente
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse"
                              : "bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{vig.label}</span>
                        </div>

                        {evt.fechaInicio && evt.fechaFin && (
                          <span className="text-[10.5px] text-gray-400 font-medium">
                            (Del {evt.fechaInicio} al {evt.fechaFin})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleToggleEstado(evt)}
                      disabled={togglingId === (evt.id || evt.idEvento)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        isActivo
                          ? "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      }`}
                      title={isActivo ? "Pausar evento" : "Activar evento"}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActivo ? "Pausar" : "Reanudar"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEvento(evt)}
                      disabled={deletingId === (evt.id || evt.idEvento)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition cursor-pointer"
                      title="Eliminar evento de forma definitiva"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            <span>Los días y horas restantes se descuentan en vivo en todo el sistema.</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
