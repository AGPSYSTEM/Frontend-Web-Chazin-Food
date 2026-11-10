import { useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Search, Users, Briefcase, CheckCircle2, XCircle, Download, Trash2, RotateCcw } from "lucide-react";
import { useEmpleados } from "../hooks/useEmpleados";
import { EmpleadosTable } from "../componentes/empleados/EmpleadosTable";
import { EmpleadoModal } from "../componentes/empleados/EmpleadoModal";
import { VerEmpleadoModal } from "../componentes/empleados/VerEmpleadoModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";
import { useConfirm } from "@/shared/context/ConfirmContext";

export function Empleados() {
  const {
    empleados,
    papeleraEmpleados,
    filteredEmpleados,
    cargosDisponibles,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterCargo,
    setFilterCargo,
    createEmpleado,
    updateEmpleado,
    toggleEstadoEmpleado,
    deleteEmpleado,
    restoreEmpleado
  } = useEmpleados();

  const { confirm } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [viewMode, setViewMode] = useState("activos"); // "activos" | "papelera"

  const handleOpenCreate = () => {
    setSelectedEmpleado(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmpleado(emp);
    setModalOpen(true);
  };

  const handleOpenView = (emp) => {
    setSelectedEmpleado(emp);
    setViewModalOpen(true);
  };

  const handleSave = async (formData) => {
    let ok = false;
    if (selectedEmpleado) {
      ok = await updateEmpleado(selectedEmpleado.idEmpleado, formData);
    } else {
      ok = await createEmpleado(formData);
    }
    if (ok) {
      setModalOpen(false);
      setSelectedEmpleado(null);
    }
  };

  const handleToggleStatus = async (emp) => {
    const isActivo = emp.estado === 1 || emp.estado === "1" || emp.estado === "Activo";
    const confirmed = await confirm({
      title: isActivo ? "¿Desactivar Empleado?" : "¿Activar Empleado?",
      message: `¿Estás seguro de que deseas ${isActivo ? "desactivar" : "activar"} a ${emp.nombre} ${emp.apellidos}?`,
      confirmText: isActivo ? "Sí, Desactivar" : "Sí, Activar",
      type: isActivo ? "warning" : "info"
    });

    if (confirmed) {
      await toggleEstadoEmpleado(emp.idEmpleado);
    }
  };

  const handleDelete = async (emp) => {
    const confirmed = await confirm({
      title: "¿Enviar a la Papelera?",
      message: `El empleado ${emp.nombre} ${emp.apellidos} será trasladado a la papelera. Podrás restaurarlo en cualquier momento.`,
      confirmText: "Sí, Eliminar",
      type: "danger"
    });

    if (confirmed) {
      await deleteEmpleado(emp.idEmpleado);
    }
  };

  const handleRestore = async (emp) => {
    await restoreEmpleado(emp.idEmpleado);
  };

  const exportarExcel = () => {
    const listToExport = viewMode === "papelera" ? papeleraEmpleados : filteredEmpleados;
    if (listToExport.length === 0) return;

    const headers = [
      "ID",
      "Nombres",
      "Apellidos",
      "Tipo Documento",
      "Número Documento",
      "Teléfono",
      "Correo",
      "Dirección",
      "Cargo",
      "Tipo Contrato",
      "Turno",
      "Fecha Contratación",
      "Salario (COP)",
      "Estado"
    ];

    const data = listToExport.map((e) => [
      e.idEmpleado,
      e.nombre || "",
      e.apellidos || "",
      e.tipoDocumento || "C.C.",
      e.numeroDocumento || "",
      e.telefono || "",
      e.correo || "",
      e.direccion || "",
      e.cargo || "",
      e.tipoContrato || "",
      e.turno || "",
      e.fechaContratacion ? new Date(e.fechaContratacion).toISOString().split("T")[0] : "",
      e.salario || 0,
      e.estado === 1 || e.estado === "1" || e.estado === "Activo" ? "Activo" : "Inactivo"
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 18 },
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 22 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 15 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");
    XLSX.writeFile(
      workbook,
      `empleados_chazinfood_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  if (loading && empleados.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <ChazinLoader size="lg" text="Cargando Gestión de Empleados..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Encabezado y Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Gestión de Empleados
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Subproceso de Personal
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administración del personal, información de contacto y desempeño de funciones en Chazin Food
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "activos" ? "papelera" : "activos")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors border ${
              viewMode === "papelera"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
            }`}
          >
            {viewMode === "papelera" ? (
              <>
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Volver a Empleados</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 text-gray-400" />
                <span>Papelera ({stats.papelera})</span>
              </>
            )}
          </button>

          <button
            onClick={exportarExcel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md shadow-red-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Empleados */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Total Empleados</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</span>
          </div>
        </div>

        {/* Empleados Activos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">En Funciones (Activos)</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.activos}</span>
          </div>
        </div>

        {/* Empleados Inactivos */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Inactivos / Pausados</span>
            <span className="text-xl font-black text-gray-700 dark:text-gray-300">{stats.inactivos}</span>
          </div>
        </div>

        {/* Papelera de Reciclaje */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-400 block font-medium">Papelera</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.papelera}</span>
          </div>
        </div>

      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
        
        {/* Buscador Multicriterio */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por documento, nombre, cargo, salario (ej: 1.300.000), teléfono, correo..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm outline-none border border-gray-200 dark:border-gray-600 dark:bg-gray-700/60 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all"
          />
        </div>

        {/* Filtros por Pastillas (Pills) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          
          {/* Filtro por Estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-gray-400 font-semibold mr-1">Estado:</span>
            {["Todos", "Activo", "Inactivo"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterEstado(st)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  filterEstado === st
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Filtro por Cargo */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-semibold">Cargo:</span>
            <select
              value={filterCargo}
              onChange={(e) => setFilterCargo(e.target.value)}
              className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold outline-none dark:bg-gray-700 dark:text-white focus:border-red-500"
            >
              <option value="Todos">Todos los Cargos</option>
              {cargosDisponibles.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Vista de Tabla */}
      {viewMode === "papelera" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
            <div>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Papelera de Empleados
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Los empleados en esta sección están inactivos. Puedes restaurarlos en cualquier momento.
              </p>
            </div>
          </div>
          <EmpleadosTable
            empleados={papeleraEmpleados}
            onView={handleOpenView}
            onEdit={handleRestore}
            onToggleStatus={handleRestore}
            onDelete={handleRestore}
            canEdit={false}
            canDelete={false}
          />
        </div>
      ) : (
        <EmpleadosTable
          empleados={filteredEmpleados}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      )}

      {/* Modales */}
      <EmpleadoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        empleado={selectedEmpleado}
        cargosDisponibles={cargosDisponibles}
      />

      <VerEmpleadoModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        empleado={selectedEmpleado}
      />

    </div>
  );
}
export default Empleados;

