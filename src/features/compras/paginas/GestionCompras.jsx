import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Search, FileText, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { useGestionCompras } from "../hooks/useGestionCompras";
import { ComprasTable } from "../componentes/gestion/ComprasTable";
import { NuevaCompraModal } from "../componentes/gestion/NuevaCompraModal";
import { DetalleCompraModal } from "../componentes/gestion/DetalleCompraModal";
import { CancelarCompraModal } from "../componentes/gestion/CancelarCompraModal";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

function esEstadoPendiente(estado) {
  const e = String(estado || "").toUpperCase();
  return e === "PENDIENTE";
}

export function GestionCompras() {
  const notify = useNotifications();
  const {
    compras,
    filteredCompras,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    updateEstado,
    cancelarCompra,
    refetch
  } = useGestionCompras();

  const location = useLocation();
  const [selectedCompra, setSelectedCompra] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCompra, setEditCompra] = useState(null);
  const [initialInsumo, setInitialInsumo] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);
  const [cancelarCompraModal, setCancelarCompraModal] = useState(null);

  useEffect(() => {
    if (location.state?.openNuevaCompra) {
      setEditCompra(null);
      if (location.state.initialInsumo) {
        setInitialInsumo(location.state.initialInsumo);
      }
      setModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const stats = useMemo(() => {
    const total = compras.length;
    const completadas = compras.filter((c) => {
      const e = String(c.estado || "").toUpperCase();
      return e === "COMPLETADA" || e === "RECIBIDA";
    }).length;
    const anuladas = compras.filter((c) => {
      const e = String(c.estado || "").toUpperCase();
      return e === "ANULADA" || e === "CANCELADA";
    }).length;
    const montoTotal = compras
      .filter((c) => {
        const e = String(c.estado || "").toUpperCase();
        return e !== "CANCELADA" && e !== "ANULADA";
      })
      .reduce((sum, c) => sum + (parseFloat(c.total) || 0), 0);
    return { total, completadas, anuladas, montoTotal };
  }, [compras]);

  const handleViewDetail = (c) => {
    setSelectedCompra(c);
  };

  const handleEdit = (c) => {
    if (!c || !esEstadoPendiente(c.estado)) return;
    setEditCompra(c);
  };

  const handleCompraCreated = async () => {
    await refetch();
    notify.success(
      "¡Compra confirmada y stock reabastecido!",
      "La orden de compra se registró y los insumos fueron sumados automáticamente al inventario."
    );
  };

  const handleCompraUpdated = async () => {
    await refetch();
    notify.success(
      "Compra actualizada",
      "Los datos de la compra fueron modificados exitosamente. El stock solo se ve afectado cuando la compra está en estado Recibida."
    );
  };

  const handleMarcarRecibida = async (idCompra) => {
    if (procesandoId === idCompra) return false;
    const confirmed = await notify.confirmAction(
      "¿Marcar como Recibida?",
      "Al confirmar, el stock de los insumos incluidos en esta compra se actualizará automáticamente (se sumarán las cantidades compradas). Esta acción sí afecta el inventario.",
      "Sí, marcar como Recibida"
    );
    if (!confirmed) return false;
    setProcesandoId(idCompra);
    try {
      const ok = await updateEstado(idCompra, "RECIBIDA");
      if (ok) {
        notify.success(
          "Compra Recibida",
          "La orden fue marcada como Recibida. Los insumos fueron sumados al stock."
        );
        if (selectedCompra && selectedCompra.id === idCompra) {
          setSelectedCompra(null);
        }
        await refetch();
      }
      return ok;
    } finally {
      setProcesandoId(null);
    }
  };

  const handleUpdateEstado = async (idCompra, nuevoEstado) => {
    if (procesandoId === idCompra) return false;
    const e = String(nuevoEstado || "").toUpperCase();
    if (e === "RECIBIDA") {
      return await handleMarcarRecibida(idCompra);
    }
    return await updateEstado(idCompra, nuevoEstado);
  };

  const handleCancelar = (idCompra) => {
    if (procesandoId === idCompra) return;
    const compraTarget = compras.find((c) => c.id === idCompra || c.idCompra === idCompra);
    setCancelarCompraModal(compraTarget || { id: idCompra });
    if (selectedCompra && selectedCompra.id === idCompra) {
      setSelectedCompra(null);
    }
  };

  const handleConfirmarCancelacion = async (idCompra, cancelData) => {
    setProcesandoId(idCompra);
    try {
      const ok = await cancelarCompra(idCompra, cancelData);
      if (ok) {
        notify.success(
          "Compra Anulada",
          `Anulación registrada con motivo: "${cancelData?.motivo || 'sin motivo'}". Si la compra estaba Recibida, el stock fue revertido.`
        );
        setCancelarCompraModal(null);
        await refetch();
      }
      return ok;
    } finally {
      setProcesandoId(null);
    }
  };

  const statCards = [
    {
      id: "total",
      title: "Órdenes de Compra",
      value: stats.total,
      subtext: "registradas",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: FileText,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "completadas",
      title: "Compras Recibidas",
      value: stats.completadas,
      subtext: "stock reabastecido",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "anuladas",
      title: "Compras Anuladas",
      value: stats.anuladas,
      subtext: "canceladas",
      subtextColor: "text-rose-500 dark:text-rose-400",
      icon: XCircle,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    },
    {
      id: "monto",
      title: "Total Invertido",
      value: `$${stats.montoTotal.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`,
      subtext: "monto acumulado",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: DollarSign,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Compras
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra las órdenes de compra de insumos, recepciones de inventario y trazabilidad de lotes
        </p>
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl ${card.bgColor} ${card.iconColor} flex items-center justify-center shrink-0`}>
                <IconComponent className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
                    {card.value}
                  </span>
                  <span className={`text-xs font-medium ${card.subtextColor} shrink-0`}>
                    {card.subtext}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Action Bar Box - En una sola línea */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar compra por ID, factura o proveedor..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdown & Primary Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="RECIBIDA">Recibida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>

          <button
            onClick={() => {
              setEditCompra(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <ChazinLoader text="CARGANDO HISTORIAL DE COMPRAS" size="md" />
      ) : (
        <ComprasTable
          compras={filteredCompras}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onUpdateEstado={handleUpdateEstado}
          onCancelar={handleCancelar}
          procesandoId={procesandoId}
        />
      )}

      {/* Modals */}
      <NuevaCompraModal
        isOpen={modalOpen || !!editCompra}
        onClose={() => {
          setModalOpen(false);
          setEditCompra(null);
          setInitialInsumo(null);
        }}
        onCreated={handleCompraCreated}
        onUpdated={handleCompraUpdated}
        editCompra={editCompra}
        initialInsumo={initialInsumo}
      />

      <DetalleCompraModal
        isOpen={!!selectedCompra && !editCompra && !modalOpen}
        onClose={() => setSelectedCompra(null)}
        compra={selectedCompra}
        onUpdateEstado={handleUpdateEstado}
        onCancelar={handleCancelar}
      />

      <CancelarCompraModal
        isOpen={!!cancelarCompraModal}
        onClose={() => setCancelarCompraModal(null)}
        compra={cancelarCompraModal}
        onConfirm={handleConfirmarCancelacion}
      />
    </div>
  );
}

export default GestionCompras;
