import { useState, useEffect } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Briefcase,
  Phone,
  Mail,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  Activity,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw
} from "lucide-react";

const cleanMojibake = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .replace(/Ã¡/g, "á")
    .replace(/Ã©/g, "é")
    .replace(/Ã­/g, "í")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Ã /g, "Á")
    .replace(/Ã‰/g, "É")
    .replace(/Ã /g, "Í")
    .replace(/Ã“/g, "Ó")
    .replace(/Ãš/g, "Ú")
    .replace(/Ã‘/g, "Ñ");
};

export function EmpleadosTable({
  empleados = [],
  onView,
  onEdit,
  onDelete,
  onRestore,
  canEdit = true,
  canDelete = true,
  isTrash = false
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Inicia con 5 registros

  // Reset page to 1 when dataset changes (e.g. search or filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [empleados.length]);

  const totalRecords = empleados.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalRecords);
  const paginatedEmpleados = empleados.slice(startIndex, endIndex);

  // Helper para páginas visibles
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (validCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (validCurrentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(validCurrentPage - 1);
        pages.push(validCurrentPage);
        pages.push(validCurrentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const formatMoney = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return "-";
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return String(dateVal);
    }
  };

  if (!empleados || empleados.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs p-16 text-center border border-gray-100 dark:border-gray-800">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-gray-400">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">No se encontraron empleados</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
          No hay registros que coincidan con los criterios de búsqueda o filtros aplicados actualmente.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden w-full flex flex-col">
      
      {/* Contenedor con Scroll Horizontal General Adaptativo */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse table-auto min-w-[980px]">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50 text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
              {/* 1. DOCUMENTO DE IDENTIDAD DE PRIMERO */}
              <th className="py-4 px-5 sm:px-6 w-[16%] min-w-[140px]">Documento</th>
              {/* 2. EMPLEADO */}
              <th className="py-4 px-5 sm:px-6 w-[22%] min-w-[200px]">Empleado</th>
              {/* 3. ROL & TURNO (ANTES CARGO) */}
              <th className="py-4 px-5 sm:px-6 w-[16%] min-w-[150px]">Rol & Turno</th>
              {/* 4. CONTACTO */}
              <th className="py-4 px-5 sm:px-6 w-[16%] min-w-[160px]">Contacto</th>
              {/* 5. CONTRATACIÓN (FECHAS DE INICIO Y FIN) */}
              <th className="py-4 px-5 sm:px-6 w-[15%] min-w-[150px]">Contratación</th>
              {/* 6. SALARIO */}
              <th className="py-4 px-5 sm:px-6 w-[12%] min-w-[120px]">Salario</th>
              {/* 7. ESTADO (ACTIVO, INACTIVO, INCAPACITADO) */}
              <th className="py-4 px-5 sm:px-6 w-[11%] min-w-[110px]">Estado</th>
              {/* 8. ACCIONES */}
              <th className="py-4 px-5 sm:px-6 text-center min-w-[100px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {paginatedEmpleados.map((emp) => {
              const rolDisplay = cleanMojibake(emp.rol || emp.cargo || "Cocinero");
              const initials = `${emp.nombre?.[0] || ""}${emp.apellidos?.[0] || ""}`.toUpperCase();

              // Estado: Activo, Inactivo, Incapacitado
              const estadoStr = emp.estado || (emp.estado === 0 ? "Inactivo" : "Activo");
              const isActivo = estadoStr === "Activo";
              const isIncapacitado = estadoStr === "Incapacitado";
              const isInactivo = estadoStr === "Inactivo";

              return (
                <tr
                  key={emp.idEmpleado}
                  className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {/* 1. DOCUMENTO DE IDENTIDAD DE PRIMERO */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-red-100/70 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200/50 dark:border-red-900/40 mb-1">
                      {emp.tipoDocumento || "C.C."}
                    </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm block tracking-tight font-mono">
                      {emp.numeroDocumento || "-"}
                    </span>
                  </td>

                  {/* 2. EMPLEADO (NOMBRE, AVATAR, ID) */}
                  <td className="py-4 px-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0 border border-red-200/60 dark:border-red-900/40 shadow-2xs">
                        {emp.foto ? (
                          <img
                            src={emp.foto}
                            alt={emp.nombre}
                            className="w-full h-full rounded-2xl object-cover"
                          />
                        ) : (
                          initials || "EM"
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white block leading-tight text-sm">
                          {emp.nombre} {emp.apellidos}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
                          ID #{emp.idEmpleado}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. ROL & TURNO (ANTES CARGO) */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 shadow-2xs">
                      <Briefcase className="w-3 h-3 text-blue-500" />
                      <span>{rolDisplay}</span>
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1.5 font-medium">
                      <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{cleanMojibake(emp.turno) || "Completo"}</span>
                    </span>
                  </td>

                  {/* 4. CONTACTO */}
                  <td className="py-4 px-5 sm:px-6">
                    {emp.telefono ? (
                      <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{emp.telefono}</span>
                      </span>
                    ) : null}
                    {emp.correo ? (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1 truncate max-w-[200px]">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{emp.correo}</span>
                      </span>
                    ) : null}
                    {!emp.telefono && !emp.correo && (
                      <span className="text-xs text-gray-400 italic">Sin contacto registrado</span>
                    )}
                  </td>

                  {/* 5. CONTRATACIÓN (TIPO, FECHA INICIO Y FIN) */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 block">
                      {cleanMojibake(emp.tipoContrato) || "Término Fijo"}
                    </span>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 font-medium">
                      <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                      <span>{formatDate(emp.fechaInicio)}</span>
                      {emp.fechaFin ? (
                        <>
                          <span className="text-gray-300">→</span>
                          <span>{formatDate(emp.fechaFin)}</span>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">(Indefinido)</span>
                      )}
                    </div>
                    {emp.contratoVencido && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-900/40 mt-1">
                        <AlertCircle className="w-2.5 h-2.5" /> Contrato vencido
                      </span>
                    )}
                  </td>

                  {/* 6. SALARIO */}
                  <td className="py-4 px-5 sm:px-6">
                    <span className="font-bold text-gray-900 dark:text-white text-sm block">
                      {formatMoney(emp.salario)}
                    </span>
                    <span className="text-[11px] text-gray-400 block font-medium">COP Mensual</span>
                  </td>

                  {/* 7. ESTADO OPERATIVO (ACTIVO, INACTIVO, INCAPACITADO) */}
                  <td className="py-4 px-5 sm:px-6">
                    {isIncapacitado ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800 shadow-2xs">
                        <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                        <span>Incapacitado</span>
                      </span>
                    ) : isActivo ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Activo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span>Inactivo</span>
                      </span>
                    )}
                  </td>

                  {/* 8. ACCIONES (SIN ACTIVAR/DESACTIVAR) */}
                  <td className="py-4 px-5 sm:px-6 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {isTrash ? (
                        <button
                          onClick={() => onRestore && onRestore(emp)}
                          title="Restaurar empleado"
                          className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <>
                          {/* Ver Detalle */}
                          <button
                            onClick={() => onView && onView(emp)}
                            title="Ver detalle del empleado"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Editar */}
                          {canEdit && (
                            <button
                              onClick={() => onEdit && onEdit(emp)}
                              title="Editar empleado"
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 rounded-xl transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Eliminar (trasladar a papelera) */}
                          {canDelete && (
                            <button
                              onClick={() => onDelete && onDelete(emp)}
                              title="Enviar a papelera"
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer de Paginación Integrado */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50/40 dark:bg-gray-800/20">
        
        {/* Selector de registros por página (Inicia en 5) */}
        <div className="flex items-center gap-2">
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 cursor-pointer text-xs"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>empleados por página</span>
        </div>

        {/* Contador de registros */}
        <div className="font-medium text-gray-600 dark:text-gray-400">
          Mostrando{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {totalRecords === 0 ? 0 : startIndex + 1}
          </span>{" "}
          a{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {endIndex}
          </span>{" "}
          de{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            {totalRecords}
          </span>{" "}
          empleados
        </div>

        {/* Botones de Navegación de Página */}
        <div className="flex items-center gap-1">
          {/* Primera página */}
          <button
            onClick={() => setCurrentPage(1)}
            disabled={validCurrentPage === 1}
            title="Primera página"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Página anterior */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={validCurrentPage === 1}
            title="Página anterior"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Botones numéricos de página */}
          <div className="flex items-center gap-1 px-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-gray-400 select-none text-xs"
                >
                  ...
                </span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition cursor-pointer ${
                    validCurrentPage === page
                      ? "bg-red-600 text-white shadow-2xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Página siguiente */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={validCurrentPage === totalPages || totalRecords === 0}
            title="Página siguiente"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Última página */}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={validCurrentPage === totalPages || totalRecords === 0}
            title="Última página"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed text-gray-600 dark:text-gray-300"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
