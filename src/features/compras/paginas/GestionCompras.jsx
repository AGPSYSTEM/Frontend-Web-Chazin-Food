import { useState, useMemo } from "react";
import { Plus, Search, FileText, DollarSign } from "lucide-react";
import { useGestionCompras } from "../hooks/useGestionCompras";
import { ComprasTable } from "../componentes/gestion/ComprasTable";
import { NuevaCompraModal } from "../componentes/gestion/NuevaCompraModal";
import { DetalleCompraModal } from "../componentes/gestion/DetalleCompraModal";
import { useNotifications } from "@/shared/hooks/useNotifications";

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

  const [selectedCompra, setSelectedCompra] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCompra, setEditCompra] = useState(null);

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
    notify.success("Compra registrada", "La orden de compra se creó y el stock del insumo fue actualizado.");
  };

  const handleCompraUpdated = async () => {
    await refetch();
    notify.success("Compra actualizada", "Los datos de la compra fueron modificados exitosamente.");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Compras
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra las órdenes de compra del negocio
        </p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Órdenes de Compra</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">registradas</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Recibidas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.completadas}</p>
            <p className="text-xs text-green-500">recibidas / completadas</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total en Compras</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${stats.montoTotal.toLocaleString("es-CO", { minimumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-emerald-500">monto total acumulado</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Anuladas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.anuladas}</p>
            <p className="text-xs text-red-400">canceladas</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar compra..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors"
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors shrink-0 cursor-pointer"
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
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F05454] hover:bg-[#d84343] text-white font-medium rounded-xl shadow-md transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando historial de compras...</div>
      ) : (
        <ComprasTable
          compras={filteredCompras}
          onViewDetail={handleViewDetail}
          onEdit={handleEdit}
          onUpdateEstado={updateEstado}
        />
      )}

      <NuevaCompraModal
        isOpen={modalOpen || !!editCompra}
        onClose={() => {
          setModalOpen(false);
          setEditCompra(null);
        }}
        onCreated={handleCompraCreated}
        onUpdated={handleCompraUpdated}
        editCompra={editCompra}
      />

      <DetalleCompraModal
        isOpen={!!selectedCompra && !editCompra && !modalOpen}
        onClose={() => setSelectedCompra(null)}
        compra={selectedCompra}
      />
    </div>
  );
}
