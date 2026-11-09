import { useState, useEffect, useCallback } from "react";
import { usuariosService } from "../servicios/usuariosService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch, formatStatusTokens } from "@/shared/utils/searchUtils";
import { isCedulaValida } from "@/shared/utils/validationUtils";

function getIniciales(nombre = "") {
  return nombre.trim().split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").join("").slice(0, 2);
}

export function useUsuarios() {
  const { success, error: notifError, warning, confirmDelete, confirmAction } = useNotifications();
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
      const mapped = (data || [])
        .filter((u) => (u.rol || u.rolNombre || "").toLowerCase() !== "administrador" && String(u.idRol || u.id_rol) !== "1")
        .map((u) => ({
          ...u,
          idRolStr: String(u.idRol || 4),
          rolNombre: u.rol || "Cliente",
          estado: u.estado === "ACTIVO" || u.estado === "Activo" || u.estado === 1 ? "Activo" : "Inactivo",
          iniciales: getIniciales(u.nombre)
        }));
      setUsuarios(mapped);
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
      setRolesList(
        (data || []).filter(
          (r) => (r.estado === "Activo" || r.estado === 1) && r.nombre?.toLowerCase() !== "administrador" && String(r.id) !== "1"
        )
      );
    } catch (err) {
      console.error("Error al cargar roles:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const filteredUsuarios = usuarios.filter((u) => {
    const isNotAdmin = (u.rolNombre || u.rol || "").toLowerCase() !== "administrador" && String(u.idRol || u.id_rol) !== "1";
    if (!isNotAdmin) return false;

    const fullName = `${u.nombre || ""} ${u.apellidos || ""}`.trim();

    const hasDoc = isCedulaValida(u.documento, u.tipoDocumento);
    const docText = hasDoc
      ? `${u.documento} ${u.tipoDocumento || ""} con_documento con documento con_cedula con cedula`
      : "sin_documento sin documento sin_registrar sin registrar pendiente documento pendiente sin cedula sin_cedula";

    const hasTel = Boolean(u.telefono && String(u.telefono).trim() && u.telefono !== "-");
    const telText = hasTel ? `${u.telefono} con_telefono con telefono` : "sin_telefono sin telefono";

    const hasEmail = Boolean(u.email && String(u.email).trim() && u.email !== "-");
    const emailText = hasEmail ? `${u.email} con_correo con correo con_email con email` : "sin_correo sin correo sin_email sin email";

    const hasDir = Boolean(u.direccion && String(u.direccion).trim() && u.direccion !== "-");
    const dirText = hasDir ? `${u.direccion} con_direccion con direccion` : "sin_direccion sin direccion";

    const matchSearch = matchesSmartSearch(
      [
        u.nombre,
        u.apellidos,
        fullName,
        u.email,
        emailText,
        u.documento,
        u.numeroDocumento,
        docText,
        u.telefono,
        telText,
        u.direccion,
        dirText,
        u.rolNombre,
        u.rol,
        formatStatusTokens(u.estado),
        u.id,
        u.idUsuario,
        `#${u.id || u.idUsuario}`
      ],
      searchTerm
    );

    const hasSearch = Boolean(searchTerm && searchTerm.trim());
    const isActivo = u.estado?.toLowerCase() === "activo" || u.estado === 1 || u.estado === "1";
    const matchEstadoFiltro =
      filterEstado === "Todos" ||
      (filterEstado.toLowerCase() === "activo" && isActivo) ||
      (filterEstado.toLowerCase() === "inactivo" && !isActivo);

    const matchEstado = !hasSearch ? matchEstadoFiltro : true;
    const matchRol = !hasSearch ? (filterRol === "Todos" || u.rolNombre?.toLowerCase() === filterRol?.toLowerCase()) : true;

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
      success("Eliminado", "El usuario ha sido eliminado exitosamente");
      await fetchUsers();
      return true;
    } catch (err) {
      const msg = err.message || "";
      // Si el usuario tiene ventas, compras o registros asociados y la BD/backend indica que se debe inactivar
      if (
        msg.includes("Inactivo") ||
        msg.includes("venta") ||
        msg.includes("pedido") ||
        msg.includes("compra") ||
        msg.includes("integridad") ||
        msg.includes("foreign key") ||
        msg.includes("CONSTRAINT")
      ) {
        const deseaInactivar = await confirmAction(
          "¿Cambiar estado a Inactivo?",
          `No es posible eliminar a "${nombre}" porque tiene transacciones históricas registradas (ventas, pedidos o compras).\n\n¿Deseas cambiar su estado a Inactivo para suspender su acceso al sistema de forma segura?`,
          "Sí, cambiar a Inactivo"
        );
        if (deseaInactivar) {
          try {
            await usuariosService.toggleEstado(id, "INACTIVO");
            success("Estado actualizado", `El usuario ${nombre} ahora está Inactivo`);
            await fetchUsers();
            return true;
          } catch (toggleErr) {
            notifError("Error", toggleErr.message || "No se pudo cambiar el estado a Inactivo");
            return false;
          }
        } else {
          warning("Acción cancelada", "No se modificó el registro del usuario.");
          return false;
        }
      }

      notifError("Error", msg || "No se pudo eliminar el usuario");
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
