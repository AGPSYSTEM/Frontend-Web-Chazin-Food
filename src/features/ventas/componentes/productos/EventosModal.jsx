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
  Package,
  Edit
} from "lucide-react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { formatTipoEvento } from "@/shared/utils/foodEmojiUtils";
import { eventosService } from "../../servicios/eventosService";

export function EventosModal({
  isOpen,
  onClose,
  eventos = [],
  onOpenCrearEvento,
  onEditEvento,
  onRefresh
}) {
  const notify = useNotifications();
  const [activeTab, setActiveTab] = useState("todos"); // 'todos' | 'activos' | 'inactivos'
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Live timer for real-time countdown (1 segundo de precisión)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000); // 1s tick
    return () => clearInterval(timer);
  }, []);

  // Sincronizar automáticamente con la API cualquier evento expirado para que su estado en BD pase a inactivo
  useEffect(() => {
    if (!isOpen || !Array.isArray(eventos) || eventos.length === 0) return;
    const expActivos = eventos.filter((e) => {
      const isDbActivo = e.estado === "Activo" || e.estado === 1;
      if (!isDbActivo || !e.fechaFin) return false;
      const finDate = new Date(`${e.fechaFin}T23:59:59`);
      return new Date() > finDate;
    });

    if (expActivos.length > 0) {
      Promise.allSettled(
        expActivos.map((e) => eventosService.updateEvento(e.id || e.idEvento, { estado: 0 }))
      ).then(() => {
        if (onRefresh) onRefresh();
      });
    }
  }, [isOpen, eventos, onRefresh]);

  if (!isOpen) return null;

  // Real-time evaluation helper
  const evaluateVigencia = (evt) => {
    if (!evt.fechaFin) {
      return {
        estadoVigencia: "PERMANENTE",
        estaVigente: evt.estado === "Activo" || evt.estado === 1,
        diasRestantes: null,
        horasRestantes: null,
        minutosRestantes: null,
        segundosRestantes: null,
        label: "Vigencia Permanente",
        urgente: false
      };
    }

    const finDate = new Date(`${evt.fechaFin}T23:59:59`);
    const inicioDate = evt.fechaInicio ? new Date(`${evt.fechaInicio}T00:00:00`) : null;

    const ms = finDate.getTime() - now.getTime();
    const diasRestantes = Math.ceil(ms / (1000 * 60 * 60 * 24));
    const horasRestantes = Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
    const minutosRestantes = Math.max(0, Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)));
    const segundosRestantes = Math.max(0, Math.floor((ms % (1000 * 60)) / 1000));

    if (inicioDate && now < inicioDate) {
      const msInicio = inicioDate.getTime() - now.getTime();
      const diasInicio = Math.ceil(msInicio / (1000 * 60 * 60 * 24));
      return {
        estadoVigencia: "PROGRAMADO",
        estaVigente: false,
        diasRestantes,
        horasRestantes,
        minutosRestantes,
        segundosRestantes,
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
        horasRestantes: 0,
        minutosRestantes: 0,
        segundosRestantes: 0,
        label: `Finalizado hace ${diasExpirado} día${diasExpirado !== 1 ? "s" : ""}`,
        urgente: false
      };
    }

    const urgente = diasRestantes <= 3;
    let label = `Quedan ${diasRestantes} días`;
    if (horasRestantes < 24) {
      if (horasRestantes === 0) {
        label = `¡Termina pronto! (${minutosRestantes}m ${segundosRestantes}s restantes)`;
      } else {
        label = `¡Termina hoy! (${horasRestantes}h ${minutosRestantes}m restantes)`;
      }
    } else if (diasRestantes === 1) {
      label = `¡Último día! (${horasRestantes}h restantes)`;
    }

    return {
      estadoVigencia: "ACTIVO",
      estaVigente: evt.estado === "Activo" || evt.estado === 1,
      diasRestantes,
      horasRestantes,
      minutosRestantes,
      segundosRestantes,
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

    const isConfirmed = await notify.confirmAction(
      `¿${actionText} este evento?`,
      isActivo
        ? `El evento "${evt.nombre || evt.nombreEvento}" dejará de aplicar descuentos en el catálogo.`
        : `El evento "${evt.nombre || evt.nombreEvento}" volverá a estar activo para los clientes.`,
      `Sí, ${actionText}`
    );

    if (!isConfirmed) return;

    setTogglingId(evt.id || evt.idEvento);
    try {
      await eventosService.updateEvento(evt.id || evt.idEvento, {
        estado: nuevoEstado
      });
      notify.success(
        isActivo ? "Evento Pausado" : "Evento Activado",
        "El estado del evento fue actualizado correctamente."
      );
      onRefresh?.();
    } catch (err) {
      notify.error("Error", err?.message || "No se pudo actualizar el estado del evento.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteEvento = async (evt) => {
    const isConfirmed = await notify.confirmDelete(
      "¿Eliminar evento?",
      `Se eliminará permanentemente la campaña "${evt.nombre || evt.nombreEvento}". Esta acción no se puede deshacer.`
    );

    if (!isConfirmed) return;

    setDeletingId(evt.id || evt.idEvento);
    try {
      await eventosService.deleteEvento(evt.id || evt.idEvento);
      notify.success("Evento Eliminado", "La campaña de evento fue removida del sistema.");
      onRefresh?.();
    } catch (err) {
      notify.error("Error al eliminar", err?.message || "No se pudo eliminar el evento.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-red-50/50 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-red-950/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100">
                  Gestión de Eventos & Ediciones Especiales
                </h2>
                <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-200/80 dark:border-orange-900/60">
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
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xs"
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
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 hover:from-orange-700 hover:via-amber-700 hover:to-red-700 text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/25 transition-all active:scale-95 cursor-pointer ring-2 ring-orange-400/30"
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
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center mx-auto shadow-2xs">
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-sm hover:from-orange-600 hover:to-amber-600 transition"
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
              const isExpirado = vig.estadoVigencia === "EXPIRADO";
              const isRealmenteActivo = evt.isActivo;

              return (
                <div
                  key={evt.id || evt.idEvento}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    evt.isActivo
                      ? "bg-white dark:bg-gray-850/90 border-2 border-orange-400/80 dark:border-orange-500/80 shadow-md shadow-orange-500/10 ring-2 ring-orange-400/20"
                      : "bg-gray-50/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/60 opacity-85"
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Thumbnail / Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs relative">
                      {(evt.imagen || evt.producto?.imagen) ? (
                        <img
                          src={evt.imagen || evt.producto.imagen}
                          alt={evt.nombre || evt.nombreEvento}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Sparkles className="w-6 h-6 text-orange-500" />
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
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200/80 dark:border-orange-900/50 font-black">
                          {formatTipoEvento(evt.tipoEvento) || "EDICION_LIMITADA"}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {evt.descripcion && !/^(test|prueba|asdf)$/i.test(evt.descripcion.trim())
                          ? evt.descripcion
                          : "Promoción gastronómica especial de tiempo limitado."}
                      </p>

                      {/* Product & Price details */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
                        {evt.producto && (
                          <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded-md text-[11px]">
                            <Package className="w-3 h-3 text-orange-500" />
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
                              : "bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-200 border border-orange-200 dark:border-orange-800/60 font-black"
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
                    {isRealmenteActivo ? (
                      <button
                        onClick={() => handleToggleEstado(evt)}
                        disabled={togglingId === (evt.id || evt.idEvento)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        title="Pausar evento"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Pausar</span>
                      </button>
                    ) : isExpirado ? (
                      <button
                        onClick={() => onEditEvento && onEditEvento(evt)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        title="Promoción finalizada. Haz clic para renovar fecha y reactivar"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Renovar Fecha</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleEstado(evt)}
                        disabled={togglingId === (evt.id || evt.idEvento)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        title="Activar evento"
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>Reanudar</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditEvento && onEditEvento(evt)}
                        className="p-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40 rounded-xl transition cursor-pointer"
                        title="Editar evento"
                      >
                        <Edit className="w-4 h-4" />
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
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
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
