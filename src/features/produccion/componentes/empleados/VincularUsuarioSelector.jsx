import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ChevronDown,
  Search,
  Check,
  UserX,
  Briefcase,
  Users,
  X
} from "lucide-react";

export function VincularUsuarioSelector({
  usuarios = [],
  selectedUserId = null,
  onSelectUser,
  empleadosExistentes = [],
  currentEmpleadoId = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getRolInfo = (u) => {
    const r = (u.rol || u.rolNombre || (u.idRol === 1 ? "Administrador" : u.idRol === 2 ? "Cocinero" : u.idRol === 3 ? "Vendedor" : "Cliente") || "").trim();
    const lower = r.toLowerCase();
    const isStaff = lower.includes("admin") || lower.includes("cocin") || lower.includes("vend") || lower.includes("cajer") || lower.includes("personal");
    return {
      label: r || "Usuario",
      isStaff,
      color: lower.includes("admin")
        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800"
        : lower.includes("cocin")
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800"
        : lower.includes("vend")
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    };
  };

  const getExistingEmpleado = (idUsuario) => {
    if (!idUsuario || !Array.isArray(empleadosExistentes)) return null;
    return empleadosExistentes.find(
      (emp) => Number(emp.idUsuario) === Number(idUsuario) && Number(emp.idEmpleado || emp.id) !== Number(currentEmpleadoId)
    );
  };

  const selectedUser = usuarios.find((u) => String(u.idUsuario) === String(selectedUserId));

  const filteredUsuarios = usuarios.filter((u) => {
    const rol = getRolInfo(u);
    if (roleFilter === "STAFF" && !rol.isStaff) return false;
    if (roleFilter === "CLIENTES" && rol.isStaff) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nombreCompleto = `${u.nombre || ""} ${u.apellidos || ""}`.toLowerCase();
    const email = (u.email || u.correo || "").toLowerCase();
    const doc = String(u.numeroDocumento || u.documento || "").toLowerCase();
    return nombreCompleto.includes(term) || email.includes(term) || rol.label.toLowerCase().includes(term) || doc.includes(term);
  });

  const staffUsuarios = filteredUsuarios.filter((u) => getRolInfo(u).isStaff);
  const clientUsuarios = filteredUsuarios.filter((u) => !getRolInfo(u).isStaff);

  const handleSelect = (id) => {
    onSelectUser(id);
    setIsOpen(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/30 p-3 sm:px-4 sm:py-2.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-30">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-blue-950 dark:text-blue-100 block leading-tight">
            Vincular con Usuario del Sistema (Roles Activos)
          </span>
          <span className="text-[11px] text-blue-700/80 dark:text-blue-300/70">
            Sincroniza datos personales, contacto y rol operativo automáticamente
          </span>
        </div>
      </div>

      <div className="relative w-full sm:w-80 md:w-96 shrink-0" ref={dropdownRef}>
        {/* Trigger Button */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[38px] px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-blue-400 dark:hover:border-blue-700 flex items-center justify-between gap-2 cursor-pointer shadow-2xs transition-colors"
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 uppercase">
                {(selectedUser.nombre || "U")[0]}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <span className="font-semibold text-gray-900 dark:text-white truncate block text-xs leading-tight">
                  {selectedUser.nombre} {selectedUser.apellidos || ""}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getRolInfo(selectedUser).color}`}>
                {getRolInfo(selectedUser).label}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(null);
                }}
                title="Desvincular usuario"
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
              <UserX className="w-3.5 h-3.5 text-gray-400" />
              <span>-- Sin vincular (Empleado sin cuenta) --</span>
            </div>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>

        {/* Dropdown flotante */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-full sm:w-[380px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden flex flex-col max-h-[320px]">
            {/* Cabecera búsqueda y filtros */}
            <div className="p-2.5 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/70 dark:bg-gray-900/50 space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, correo o rol..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-1">
                {[
                  { id: "TODOS", label: "Todos", count: usuarios.length },
                  { id: "STAFF", label: "Personal Staff", count: usuarios.filter(u => getRolInfo(u).isStaff).length },
                  { id: "CLIENTES", label: "Clientes", count: usuarios.filter(u => !getRolInfo(u).isStaff).length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setRoleFilter(tab.id)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-all ${
                      roleFilter === tab.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de opciones con scroll */}
            <div className="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50 flex-1 p-1">
              <div
                onClick={() => handleSelect(null)}
                className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                  !selectedUserId
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserX className="w-3.5 h-3.5 text-gray-400" />
                  <span>-- Sin vincular (Empleado sin cuenta) --</span>
                </div>
                {!selectedUserId && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </div>

              {staffUsuarios.length > 0 && (
                <div className="pt-2 pb-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-amber-500" />
                    <span>Personal Operativo ({staffUsuarios.length})</span>
                  </div>
                  {staffUsuarios.map((u) => {
                    const isSelected = String(selectedUserId) === String(u.idUsuario);
                    const empVinculado = getExistingEmpleado(u.idUsuario);
                    const rol = getRolInfo(u);

                    return (
                      <div
                        key={u.idUsuario}
                        onClick={() => handleSelect(u.idUsuario)}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(u.nombre || "U")[0]}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                              <span>{u.nombre} {u.apellidos || ""}</span>
                              {empVinculado && (
                                <span className="text-[9px] font-normal px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
                                  Ya vinculado (#{empVinculado.idEmpleado || empVinculado.id})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {u.email || u.correo || "Sin correo"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rol.color}`}>
                            {rol.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {clientUsuarios.length > 0 && (
                <div className="pt-2 pb-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-500" />
                    <span>Cuentas de Clientes ({clientUsuarios.length})</span>
                  </div>
                  {clientUsuarios.map((u) => {
                    const isSelected = String(selectedUserId) === String(u.idUsuario);
                    const empVinculado = getExistingEmpleado(u.idUsuario);
                    const rol = getRolInfo(u);

                    return (
                      <div
                        key={u.idUsuario}
                        onClick={() => handleSelect(u.idUsuario)}
                        className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(u.nombre || "U")[0]}
                          </div>
                          <div className="min-w-0 flex-1 text-left">
                            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate flex items-center gap-1.5">
                              <span>{u.nombre} {u.apellidos || ""}</span>
                              {empVinculado && (
                                <span className="text-[9px] font-normal px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-800 shrink-0">
                                  Ya vinculado (#{empVinculado.idEmpleado || empVinculado.id})
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {u.email || u.correo || "Sin correo"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rol.color}`}>
                            {rol.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredUsuarios.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  No se encontraron usuarios que coincidan.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

