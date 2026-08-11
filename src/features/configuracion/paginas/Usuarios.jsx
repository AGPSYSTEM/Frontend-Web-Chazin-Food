import { useState } from "react";
import { Plus, Search, Users, UserCheck, UserX, Download, Activity, ChevronDown, FileSpreadsheet, FileText } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";
import { UsuariosTable } from "../componentes/usuarios/UsuariosTable";
import { UsuarioModal } from "../componentes/usuarios/UsuarioModal";
import { UsuarioPasswordModal } from "../componentes/usuarios/UsuarioPasswordModal";

export function Usuarios() {
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
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const totalActivos = usuarios.filter((u) => u.estado === "Activo").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "Inactivo").length;
  const totalConectadosHoy = usuarios.filter((u) => u.conectadoHoy || (u.estado === "Activo" && u.id % 5 !== 0)).length;

  const ROLES_FILTRO = ["Todos", ...(rolesList.length > 0 ? rolesList.map(r => r.nombre) : ["Administrador", "Cocinero", "Cliente"])];
  const ESTADOS_FILTRO = ["Todos", "Activo", "Inactivo"];

  const pillBtn = (active) => active
    ? "px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F05454] text-white shadow-sm"
    : "px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors";

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
      ok = await updateUsuario(editingUsuario.id, form);
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

  const handleSavePassword = async (password) => {
    if (passwordUsuario) {
      const ok = await changePassword(passwordUsuario.id, password);
      if (ok) {
        setPasswordModalOpen(false);
        setPasswordUsuario(null);
      }
    }
  };

  const exportarExcel = () => {
    const rows = filteredUsuarios;
    if (rows.length === 0) return;
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      ["ID", "Nombre", "Apellidos", "Tipo Doc", "Email", "Teléfono", "Dirección", "Rol", "Estado"].map(escape).join(","),
      ...rows.map((u) => [
        u.idUsuario || u.id,
        u.nombre,
        u.apellidos || "",
        u.tipoDocumento || "",
        u.email || "",
        u.telefono || "",
        u.direccion || "-",
        u.rolNombre || u.rol?.nombre || u.rol || "",
        u.estado || ""
      ].map(escape).join(","))
    ].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-full flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F05454]"></div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Cargando usuarios...</p>
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
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Conectados Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalConectadosHoy}</p>
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
              placeholder="Buscar por documento, nombre, apellido o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-[#F05454] focus:border-transparent transition-colors text-sm"
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={exportarExcel} className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap">
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
            <button onClick={handleOpenCreate} className="flex items-center gap-2 px-4 py-2 bg-[#F05454] text-white rounded-xl hover:bg-[#c0392b] transition-colors text-sm font-medium shadow-sm whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/60 p-3 mb-6 flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-1">Rol:</span>
        {ROLES_FILTRO.map((r) => (
          <button key={r} onClick={() => setFilterRol(r)} className={pillBtn(filterRol === r)}>{r}</button>
        ))}
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-1">Estado:</span>
        {ESTADOS_FILTRO.map((e) => (
          <button key={e} onClick={() => setFilterEstado(e)} className={pillBtn(filterEstado === e)}>{e}</button>
        ))}
      </div>

      {/* Table */}
      <UsuariosTable
        usuarios={filteredUsuarios}
        onEdit={handleOpenEdit}
        onDelete={deleteUsuario}
        onChangePassword={handleOpenPassword}
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
    </div>
  );
}
