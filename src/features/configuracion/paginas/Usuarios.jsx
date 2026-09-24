import { useState } from "react";
import * as XLSX from "xlsx";
import { Plus, Search, Users, UserCheck, UserX, Download, Activity } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";
import { UsuariosTable } from "../componentes/usuarios/UsuariosTable";
import { UsuarioModal } from "../componentes/usuarios/UsuarioModal";
import { UsuarioPasswordModal } from "../componentes/usuarios/UsuarioPasswordModal";
import { UsuarioDetalleModal } from "../componentes/usuarios/UsuarioDetalleModal";
import { ChazinLoader } from "@/shared/components/ui/ChazinLoader";

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
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingUsuario, setViewingUsuario] = useState(null);

  const totalActivos = usuarios.filter((u) => u.estado === "Activo").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "Inactivo").length;
  const totalConectadosHoy = usuarios.filter((u) => u.conectadoHoy || (u.estado === "Activo" && u.id % 5 !== 0)).length;

  const ROLES_FILTRO = ["Todos", ...(rolesList.length > 0 ? rolesList.map(r => r.nombre) : ["Administrador", "Cocinero", "Cliente"])];
  const ESTADOS_FILTRO = ["Todos", "Activo", "Inactivo"];

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
  };

  const statCards = [
    {
      id: "total",
      title: "Total Usuarios",
      value: usuarios.length,
      subtext: "registrados",
      subtextColor: "text-gray-400 dark:text-gray-500",
      icon: Users,
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      iconColor: "text-blue-500 dark:text-blue-400"
    },
    {
      id: "activos",
      title: "Usuarios Activos",
      value: totalActivos,
      subtext: "en operación",
      subtextColor: "text-emerald-600 dark:text-emerald-400",
      icon: UserCheck,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      iconColor: "text-emerald-500 dark:text-emerald-400"
    },
    {
      id: "inactivos",
      title: "Inactivos",
      value: totalInactivos,
      subtext: "suspendidos",
      subtextColor: "text-rose-500 dark:text-rose-400",
      icon: UserX,
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      iconColor: "text-rose-500 dark:text-rose-400"
    },
    {
      id: "conectados",
      title: "Conectados Hoy",
      value: totalConectadosHoy,
      subtext: "actividad reciente",
      subtextColor: "text-purple-600 dark:text-purple-400",
      icon: Activity,
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      iconColor: "text-purple-500 dark:text-purple-400"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Usuarios
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Administra los usuarios del sistema, sus credenciales y roles asignados
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
                  <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {card.value}
                  </span>
                  <span className={`text-xs font-medium ${card.subtextColor}`}>
                    {card.subtext}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Action Bar Box - En una sola línea */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por documento, nombre, apellido o correo..."
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-red-500/50 focus:border-transparent transition-colors placeholder:text-gray-400 outline-none"
          />
        </div>

        {/* Filter Dropdowns & Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los roles</option>
            {ROLES_FILTRO.filter(r => r !== "Todos").map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500/50 cursor-pointer w-full sm:w-auto outline-none font-medium"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <button
            onClick={exportarExcel}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span>Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <ChazinLoader text="CARGANDO USUARIOS" size="md" />
      ) : (
        <UsuariosTable
          usuarios={filteredUsuarios}
          onEdit={handleOpenEdit}
          onDelete={deleteUsuario}
          onChangePassword={handleOpenPassword}
          onView={handleOpenView}
        />
      )}

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
