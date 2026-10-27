import { useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Search, Users, UserCheck, UserX, Download, Shield, X, Filter } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";
import { useAuth } from "@/features/autenticacion/hooks/useAuth";
import { hasPrivilege } from "@/features/configuracion/utils/privilegiosUtils";
import { UsuariosTable } from "../componentes/usuarios/UsuariosTable";
import { UsuarioModal } from "../componentes/usuarios/UsuarioModal";
import { UsuarioPasswordModal } from "../componentes/usuarios/UsuarioPasswordModal";
import { UsuarioDetalleModal } from "../componentes/usuarios/UsuarioDetalleModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

export function Usuarios() {
  const { user } = useAuth();
  const canCreate = hasPrivilege(user, "Usuarios", "crear");
  const canEdit = hasPrivilege(user, "Usuarios", "editar");
  const canDelete = hasPrivilege(user, "Usuarios", "eliminar");

  const {
    usuarios,
    filteredUsuarios,
    rolesList,
    loading,
    searchTerm,
    setSearchTerm,
    filterRol,
    setFilterRol,
    filterEstado,
    setFilterEstado,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword
  } = useUsuarios();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordUsuario, setPasswordUsuario] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingUsuario, setViewingUsuario] = useState(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const totalActivos = usuarios.filter((u) => u.estado === "Activo" || u.estado === 1 || u.estado === "1").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "Inactivo" || u.estado === 0 || u.estado === "0").length;
  const totalRolesEnUso = new Set(
    usuarios
      .map((u) => u.rolNombre || u.rol?.nombre || u.rol || u.idRol)
      .filter(Boolean)
  ).size;

  const ROLES_FILTRO = ["Todos", ...(rolesList.length > 0 ? rolesList.map(r => r.nombre) : ["Administrador", "Cocinero", "Cliente"])];
  const ESTADOS_FILTRO = ["Todos", "Activo", "Inactivo"];

  const pillBtn = (active) => active
    ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F05454] text-white shadow-sm"
    : "px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";

  const handleOpenView = (usuario) => {
    setViewingUsuario(usuario);
    setViewModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (usuario) => {
    setEditingUsuario(usuario);
    setModalOpen(true);
  };

  const handleSaveUsuario = async (form) => {
    let ok = false;
    if (editingUsuario) {
      const userId = editingUsuario.idUsuario || editingUsuario.id;
      ok = await updateUsuario(userId, form);
    } else {
      ok = await createUsuario(form);
    }
    if (ok) {
      setModalOpen(false);
      setEditingUsuario(null);
    }
  };

  const handleOpenPassword = (usuario) => {
    setPasswordUsuario(usuario);
    setPasswordModalOpen(true);
  };

  const handleSavePassword = async (data) => {
    if (passwordUsuario) {
      const userId = passwordUsuario.idUsuario || passwordUsuario.id;
      const ok = await changePassword(userId, data);
      if (ok) {
        setPasswordModalOpen(false);
        setPasswordUsuario(null);
      }
    }
  };

  const exportarExcel = () => {
    const rows = filteredUsuarios;
    if (rows.length === 0) return;

    const headers = ["ID", "Nombre", "Apellidos", "Tipo Doc", "Email", "Teléfono", "Dirección", "Rol", "Estado"];
    const data = rows.map((u) => [
      u.idUsuario || u.id,
      u.nombre || "",
      u.apellidos || "",
      u.tipoDocumento || "",
      u.email || "",
      u.telefono || "",
      u.direccion || "-",
      u.rolNombre || u.rol?.nombre || u.rol || "",
      u.estado || ""
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 26 },
      { wch: 16 },
      { wch: 24 },
      { wch: 14 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(
      workbook,
      `reporte_usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    setExportMenuOpen(false);
  };

  const exportarPDF = () => {
    const rows = filteredUsuarios;
    if (rows.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tableRows = rows.map((u) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${u.idUsuario || u.id}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${u.nombre} ${u.apellidos || ''}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${u.email || '-'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${u.telefono || '-'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${u.rolNombre || u.rol?.nombre || u.rol || '-'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
          <span style="padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; ${u.estado === 'Activo' ? 'background: #dcfce7; color: #166534;' : 'background: #f1f5f9; color: #475569;'}">${u.estado}</span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte de Usuarios - Chazin Food</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; }
            h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; color: #0f172a; }
            p { font-size: 12px; color: #64748b; margin-top: 0; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; text-align: left; }
            th { padding: 8px 12px; background: #f8fafc; font-weight: 600; border-bottom: 2px solid #cbd5e1; color: #475569; }
          </style>
        </head>
        <body>
          <h1>Reporte de Usuarios - Chazin Food</h1>
          <p>Fecha de emisión: ${new Date().toLocaleDateString('es-CO')} | Total de usuarios: ${rows.length}</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    setExportMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full flex items-center justify-center py-24">
        <ChazinLoader text="CARGANDO USUARIOS" size="md" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 dark:text-gray-100 font-bold text-2xl">Gestión de Usuarios</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">Administra los usuarios del sistema</p>
      </div>

      {/* KPI Cards matching exact reference screenshot (4 cards grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#F05454]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{usuarios.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalInactivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Roles en Uso</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalRolesEnUso}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por documento, nombre, apellido, correo, teléfono o rol..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportarExcel} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>
            {canCreate && (
              <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F05454] text-white rounded-xl hover:bg-[#c0392b] transition-colors text-sm font-medium shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                <span>Nuevo Usuario</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-3 mb-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-1">Rol:</span>
        {ROLES_FILTRO.map((r) => (
          <button key={r} onClick={() => { setFilterRol(r); setCurrentPage(1); }} className={pillBtn(filterRol === r)}>{r}</button>
        ))}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-1">Estado:</span>
        {ESTADOS_FILTRO.map((e) => (
          <button key={e} onClick={() => { setFilterEstado(e); setCurrentPage(1); }} className={pillBtn(filterEstado === e)}>{e}</button>
        ))}
      </div>

      {/* Active Filter Indicators (#55, #56) */}
      {(filterRol !== "Todos" || filterEstado !== "Todos" || searchTerm.trim() !== "") && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
          <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            Filtros activos:
          </span>
          {filterRol !== "Todos" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-semibold">
              Rol: {filterRol}
              <button
                type="button"
                onClick={() => { setFilterRol("Todos"); setCurrentPage(1); }}
                className="hover:text-red-800 ml-0.5"
                title="Quitar filtro de rol"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterEstado !== "Todos" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 font-semibold">
              Estado: {filterEstado}
              <button
                type="button"
                onClick={() => { setFilterEstado("Todos"); setCurrentPage(1); }}
                className="hover:text-red-800 ml-0.5"
                title="Quitar filtro de estado"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchTerm.trim() !== "" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700 font-medium">
              Búsqueda: &ldquo;{searchTerm}&rdquo;
              <button
                type="button"
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                className="hover:text-slate-900 ml-0.5"
                title="Limpiar búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setFilterRol("Todos");
              setFilterEstado("Todos");
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="text-xs text-red-500 hover:text-red-600 underline font-medium ml-2 cursor-pointer"
          >
            Restablecer todo
          </button>
        </div>
      )}

      {/* Table */}
      <UsuariosTable
        usuarios={filteredUsuarios}
        onEdit={handleOpenEdit}
        onDelete={deleteUsuario}
        onChangePassword={handleOpenPassword}
        onView={handleOpenView}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      {/* Modals */}
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUsuario}
        usuario={editingUsuario}
        rolesList={rolesList}
      />

      <UsuarioPasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        onSave={handleSavePassword}
        usuario={passwordUsuario}
      />

      <UsuarioDetalleModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingUsuario(null);
        }}
        usuario={viewingUsuario}
      />
    </div>
  );
}
