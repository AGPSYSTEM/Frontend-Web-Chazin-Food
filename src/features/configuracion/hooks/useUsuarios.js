import { useState, useEffect, useCallback } from "react";
import { usuariosService } from "../servicios/usuariosService";
import { useNotifications } from "@/shared/hooks/useNotifications";

function getIniciales(nombre = "") {
  return nombre.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, 2);
}

export function useUsuarios() {
  const { success, error: notifError, confirmDelete } = useNotifications();
  const [usuarios, setUsuarios] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("Todos");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usuariosService.getUsuarios();
      setUsuarios((data || []).map(u => ({
        ...u,
        idRolStr: String(u.idRol || 3),
        rolNombre: u.rol || "Cliente",
        estado: u.estado === "ACTIVO" || u.estado === "Activo" || u.estado === 1 ? "Activo" : "Inactivo",
        iniciales: getIniciales(u.nombre)
      })));
    } catch (err) {
      console.error(err);
      notifError("Error", err.message || "Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const data = await usuariosService.getRoles();
      setRolesList((data || []).filter(r => r.estado === "Activo" || r.estado === 1));
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const filteredUsuarios = usuarios.filter((u) => {
    const matchSearch =
      searchTerm === "" ||
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.documento?.includes(searchTerm);

    const matchRol = filterRol === "Todos" || u.rolNombre.toLowerCase() === filterRol.toLowerCase();
    const matchEstado = filterEstado === "Todos" || u.estado.toLowerCase() === filterEstado.toLowerCase();

    return matchSearch && matchRol && matchEstado;
  });

  const createUsuario = async (form) => {
    try {
      const payload = {
        documento: form.documento,
        tipoDocumento: form.tipoDocumento,
        nombre: form.nombre,
        apellidos: form.apellidos,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        password: form.password,
        contrasena: form.password,
        idRol: parseInt(form.idRolStr, 10),
        estado: form.estado.toUpperCase(),
        enviarCorreoBienvenida: form.enviarCorreoBienvenida,
        notificarEmail: form.notificarEmail || form.enviarCorreoBienvenida
      };
      await usuariosService.createUsuario(payload);
      success("Éxito", "Usuario creado correctamente");
      await fetchUsers();
      return true;
    } catch (err) {
      notifError("Error", err.message || "No se pudo crear el usuario");
      return false;
    }
  };

  const updateUsuario = async (id, form) => {
    try {
      const payload = {
        nombre: form.nombre,
        apellidos: form.apellidos,
        tipoDocumento: form.tipoDocumento,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        idRol: parseInt(form.idRolStr, 10),
        estado: form.estado.toUpperCase(),
        notificarCambios: form.notificarCambios,
        notificarEmail: form.notificarEmail || form.notificarCambios
      };
      await usuariosService.updateUsuario(id, payload);
      success("Éxito", "Usuario actualizado correctamente");
      await fetchUsers();
      return true;
    } catch (err) {
      notifError("Error", err.message || "No se pudo actualizar el usuario");
      return false;
    }
  };

  const deleteUsuario = async (id, nombre) => {
    const confirmed = await confirmDelete("¿Eliminar usuario?", `¿Estás seguro de que deseas eliminar a ${nombre}?`);
    if (!confirmed) return false;
    try {
      await usuariosService.deleteUsuario(id);
      success("Eliminado", "El usuario ha sido eliminado");
      await fetchUsers();
      return true;
    } catch (err) {
      notifError("Error", err.message || "No se pudo eliminar el usuario");
      return false;
    }
  };

  const changePassword = async (id, data) => {
    try {
      const passwordVal = typeof data === "string" ? data : data.password;
      const notifVal = typeof data === "object" ? data.notificarEmail : true;
      await usuariosService.changePassword(id, {
        password: passwordVal,
        contrasena: passwordVal,
        notificarEmail: notifVal
      });
      success("Éxito", "Contraseña cambiada exitosamente");
      return true;
    } catch (err) {
      notifError("Error", err.message || "Error al cambiar la contraseña");
      return false;
    }
  };

  return {
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
    refetch: fetchUsers,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    changePassword
  };
}
