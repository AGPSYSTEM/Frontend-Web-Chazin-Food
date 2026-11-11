import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Plus,
  Search,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  RotateCcw,
  X,
  Activity
} from "lucide-react";
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
    rolesDisponibles,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterRol,
    setFilterRol,
    createEmpleado,
    updateEmpleado,
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

    // Documento de identidad de primero en el reporte
    const headers = [
      "Tipo Documento",
      "Número Documento",
      "ID",
      "Nombres",
      "Apellidos",
      "Rol",
      "Turno",
      "Tipo Contrato",
      "Fecha Inicio",
      "Fecha Fin",
      "Teléfono",
      "Correo",
      "Dirección",
      "Salario (COP)",
      "Estado"
    ];

    const data = listToExport.map((e) => [
      e.tipoDocumento || "C.C.",
      e.numeroDocumento || "",
      e.idEmpleado,
      e.nombre || "",
      e.apellidos || "",
      e.rol || e.cargo || "",
      e.turno || "",
      e.tipoContrato || "",
      e.fechaInicio ? new Date(e.fechaInicio).toISOString().split("T")[0] : "",
      e.fechaFin ? new Date(e.fechaFin).toISOString().split("T")[0] : "Indefinido",
      e.telefono || "",
      e.correo || "",
      e.direccion || "",
      e.salario || 0,
      e.estado || "Activo"
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 18 },
      { wch: 8 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 16 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 16 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 14 }
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
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 animate-in fade-in duration-300">
      
      {/* Encabezado y Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Gestión de Empleados
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
              Subproceso de Personal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administración del personal, roles, contratos y desempeño de funciones en Chazin Food
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setViewMode(viewMode === "activos" ? "papelera" : "activos")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-colors border shadow-xs cursor-pointer ${
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas (KPIs) con Incapacitados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Empleados */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium uppercase tracking-wider">Total</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{stats.total}</span>
            <span className="text-[11px] text-gray-400 block">en nómina</span>
          </div>
        </div>

        {/* Empleados Activos */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium uppercase tracking-wider">Activos</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">{stats.activos}</span>
            <span className="text-[11px] text-emerald-500 font-medium block">operando</span>
          </div>
        </div>

        {/* Empleados Incapacitados (NUEVO KPI) */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium uppercase tracking-wider">Incapacitados</span>
            <span className="text-2xl font-black text-purple-700 dark:text-purple-300 leading-tight">{stats.incapacitados}</span>
            <span className="text-[11px] text-purple-500 font-medium block">licencia médica</span>
          </div>
        </div>

        {/* Empleados Inactivos */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium uppercase tracking-wider">Inactivos</span>
            <span className="text-2xl font-black text-gray-700 dark:text-gray-300 leading-tight">{stats.inactivos}</span>
            <span className="text-[11px] text-gray-400 block">pausados / finalizados</span>
          </div>
        </div>

        {/* Papelera de Reciclaje */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-400 dark:text-gray-500 block font-medium uppercase tracking-wider">Papelera</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 leading-tight">{stats.papelera}</span>
            <span className="text-[11px] text-amber-500 font-medium block">recuperables</span>
          </div>
        </div>

      </div>

      {/* Barra de Búsqueda y Filtros Optimizada */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Buscador Multicriterio Flexible con Documento de Primero */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por documento, nombre, rol, salario (ej: 1.600.000), teléfono, correo..."
            className="w-full pl-11 pr-10 py-2.5 bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all outline-none"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtros a la Derecha */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap justify-between lg:justify-end shrink-0">
          
          {/* Pastillas de Estado: Todos, Activo, Inactivo, Incapacitado */}
          <div className="flex items-center gap-1.5 text-xs bg-gray-100/70 dark:bg-gray-800 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700">
            <span className="text-gray-400 font-semibold px-2">Estado:</span>
            {["Todos", "Activo", "Inactivo", "Incapacitado"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterEstado(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                  filterEstado === st
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Selector de Rol (Antes Cargo) */}
          <div className="flex items-center gap-2 text-xs">
            <select
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
              className="px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-semibold outline-none bg-white dark:bg-gray-800 dark:text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 cursor-pointer"
            >
              <option value="Todos">Todos los Roles</option>
              {rolesDisponibles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Vista de Tabla a Ancho Completo */}
      {viewMode === "papelera" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60">
            <div>
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Papelera de Empleados
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Los empleados en esta sección están en papelera. Puedes restaurarlos en cualquier momento.
              </p>
            </div>
          </div>
          <EmpleadosTable
            empleados={papeleraEmpleados}
            onView={handleOpenView}
            onEdit={handleRestore}
            onDelete={handleRestore}
            onRestore={handleRestore}
            canEdit={false}
            canDelete={false}
            isTrash={true}
          />
        </div>
      ) : (
        <EmpleadosTable
          empleados={filteredEmpleados}
          onView={handleOpenView}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          isTrash={false}
        />
      )}

      {/* Modales */}
      <EmpleadoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        empleado={selectedEmpleado}
        rolesDisponibles={rolesDisponibles}
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
