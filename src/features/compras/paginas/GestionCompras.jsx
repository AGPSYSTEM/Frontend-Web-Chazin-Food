import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Search, FileText, CheckCircle2, XCircle, DollarSign, Filter, X } from "lucide-react";
import { useGestionCompras } from "../hooks/useGestionCompras";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/features/configuracion/utils/privilegiosUtils";
import { ComprasTable } from "../componentes/gestion/ComprasTable";
import { NuevaCompraModal } from "../componentes/gestion/NuevaCompraModal";
import { DetalleCompraModal } from "../componentes/gestion/DetalleCompraModal";
import { CancelarCompraModal } from "../componentes/gestion/CancelarCompraModal";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function GestionCompras() {
  const { user } = useAuth();
  const canCreate = hasPrivilege(user, "Gestión de Compras", "crear");
  const canCancel = hasPrivilege(user, "Gestión de Compras", "eliminar");

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
  const [initialInsumo, setInitialInsumo] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);
  const [cancelarCompraModal, setCancelarCompraModal] = useState(null);

  useEffect(() => {
    if (location.state?.openNuevaCompra) {
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

  const handleCompraCreated = async () => {
    await refetch();
    notify.success(
      "¡Compra confirmada!",
      "La orden de compra se registró exitosamente y los insumos fueron sumados automáticamente al inventario."
    );
  };

  const handleCancelar = (idCompra) => {
    if (procesandoId === idCompra) return;
    const compraTarget = compras.find((c) => c.id === idCompra || c.idCompra === idCompra);
    setCancelarCompraModal(compraTarget || { id: idCompra });
    if (selectedCompra && selectedCompra.id === idCompra) {
      setSelectedCompra(null);
    }
  };

  const handleEditarCancelacion = (compraTarget) => {
    setCancelarCompraModal(compraTarget);
    setSelectedCompra(null);
  };

  const handleConfirmarCancelacion = async (idCompra, cancelData, esEdicion = false) => {
    setProcesandoId(idCompra);
    try {
      const ok = await cancelarCompra(idCompra, cancelData);
      if (ok) {
        if (esEdicion) {
          notify.success(
            "Gestión Actualizada",
            "Los datos de la devolución, estados de entrega/reembolso y observaciones fueron actualizados exitosamente."
          );
        } else {
          notify.success(
            "Compra Anulada y Gestionada",
            `Anulación registrada con motivo: "${cancelData?.motivo || 'sin motivo'}". El inventario fue revertido automáticamente.`
          );
        }
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
      title: "Total de Compras", // #85: No denominar orden de compras, llamar algo como total de compras en kpis
      value: stats.total,
      subtext: "registradas",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: FileText,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "completadas",
      title: "Compras Confirmadas", // #87: No llamar compras recibidas, llamar confirmadas en kpis
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
          Administra las compras de insumos, recepciones de inventario y trazabilidad de lotes
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
            placeholder="Buscar compra por ID, factura, proveedor, insumo, monto, lote o fecha..."
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
            <option value="RECIBIDA">Confirmadas</option>
            <option value="DEVUELTA_PARCIAL">Devolución Parcial</option>
            <option value="CANCELADA">Canceladas</option>
          </select>

          {canCreate && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nueva Compra</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {(filterEstado !== "Todos" || searchTerm.trim() !== "") && (
        <div className="flex items-center gap-2 flex-wrap text-xs px-2 py-1">
          <span className="text-gray-500 dark:text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
            Filtros activos:
          </span>
          {filterEstado !== "Todos" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-[#F05454] border border-red-200 dark:border-red-900/60 font-medium">
              <span>Estado: {filterEstado === "RECIBIDA" ? "Confirmadas" : filterEstado}</span>
              <button
                type="button"
                onClick={() => setFilterEstado("Todos")}
                className="hover:text-red-700 cursor-pointer font-bold ml-0.5"
              >×</button>
            </span>
          )}
          {searchTerm.trim() !== "" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 font-medium">
              <span>Búsqueda: &quot;{searchTerm}&quot;</span>
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="hover:text-gray-900 cursor-pointer font-bold ml-0.5"
              >×</button>
            </span>
          )}
          <button
            type="button"
            onClick={() => { setFilterEstado("Todos"); setSearchTerm(""); }}
            className="text-xs text-gray-500 hover:text-red-500 underline ml-2 cursor-pointer font-medium"
          >
            Limpiar todos
          </button>
        </div>
      )}

      {/* Main Content Table */}
      {loading ? (
        <ChazinLoader text="CARGANDO HISTORIAL DE COMPRAS" size="md" />
      ) : (
        <ComprasTable
          compras={filteredCompras}
          onViewDetail={handleViewDetail}
          onCancelar={canCancel ? handleCancelar : null}
          procesandoId={procesandoId}
        />
      )}

      {/* Modals */}
      <NuevaCompraModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setInitialInsumo(null);
        }}
        onCreated={handleCompraCreated}
        initialInsumo={initialInsumo}
      />

      <DetalleCompraModal
        isOpen={!!selectedCompra && !modalOpen}
        onClose={() => setSelectedCompra(null)}
        compra={selectedCompra}
        onCancelar={handleCancelar}
        onEditarCancelacion={handleEditarCancelacion}
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
