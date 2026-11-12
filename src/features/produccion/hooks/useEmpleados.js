import { useState, useEffect, useCallback, useMemo } from "react";
import { empleadosService } from "../servicios/empleadosService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";

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

const normalizeDate = (raw) => {
  if (!raw) return "";
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  try {
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  } catch (_) {}
  return "";
};

const sanitizeEmpleado = (emp) => {
  if (!emp) return emp;

  let estadoNormalizado = "Activo";
  if (emp.estado === "Incapacitado" || emp.estado === 2 || emp.estado === "2") {
    estadoNormalizado = "Incapacitado";
  } else if (emp.estado === 0 || emp.estado === "0" || emp.estado === "Inactivo" || emp.estado === false) {
    estadoNormalizado = "Inactivo";
  } else {
    estadoNormalizado = "Activo";
  }

  // Regla de negocio de contratación: si tiene fechaFin y ya pasó la fecha, su contrato finalizó
  const fInicio = normalizeDate(emp.fechaInicio || emp.fechaContratacion);
  const fFin = normalizeDate(emp.fechaFin);
  const todayStr = new Date().toISOString().split("T")[0];
  const contratoVencido = Boolean(fFin && todayStr > fFin);

  if (contratoVencido && estadoNormalizado === "Activo") {
    estadoNormalizado = "Inactivo";
  }

  const rolLimpio = cleanMojibake(emp.cargo || emp.rol || "Cocinero");

  return {
    ...emp,
    nombre: cleanMojibake(emp.nombre),
    apellidos: cleanMojibake(emp.apellidos),
    cargo: rolLimpio,
    rol: rolLimpio,
    tipoContrato: cleanMojibake(emp.tipoContrato) || "Término Fijo",
    turno: cleanMojibake(emp.turno) || "Completo",
    direccion: cleanMojibake(emp.direccion) || "",
    fechaInicio: fInicio,
    fechaFin: fFin || null,
    fechaContratacion: fInicio,
    contratoVencido,
    estado: estadoNormalizado
  };
};

export function useEmpleados() {
  const notify = useNotifications();
  const [empleados, setEmpleados] = useState([]);
  const [papeleraEmpleados, setPapeleraEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterRol, setFilterRol] = useState("Todos");

  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      const [activosData, papeleraData] = await Promise.all([
        empleadosService.getEmpleados({ papelera: false }),
        empleadosService.getEmpleados({ papelera: true }).catch(() => [])
      ]);
      setEmpleados(Array.isArray(activosData) ? activosData.map(sanitizeEmpleado) : []);
      setPapeleraEmpleados(Array.isArray(papeleraData) ? papeleraData.map(sanitizeEmpleado) : []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar los empleados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  // Roles únicos disponibles en la organización
  const rolesDisponibles = useMemo(() => {
    const defaultRoles = ["Administrador", "Cocinero", "Vendedor"];
    const fromData = empleados.map((e) => e.rol || e.cargo).filter(Boolean);
    return Array.from(new Set([...defaultRoles, ...fromData]));
  }, [empleados]);

  // Estadísticas del módulo (KPIs)
  const stats = useMemo(() => {
    const total = empleados.length;
    const activos = empleados.filter((e) => e.estado === "Activo").length;
    const incapacitados = empleados.filter((e) => e.estado === "Incapacitado").length;
    const inactivos = empleados.filter((e) => e.estado === "Inactivo").length;
    const papelera = papeleraEmpleados.length;
    return { total, activos, incapacitados, inactivos, papelera };
  }, [empleados, papeleraEmpleados]);

  // Lista filtrada
  const filteredEmpleados = useMemo(() => {
    return empleados.filter((emp) => {
      // Filtrado por estado
      if (filterEstado !== "Todos" && emp.estado !== filterEstado) return false;

      // Filtrado por rol
      if (filterRol !== "Todos" && emp.rol !== filterRol && emp.cargo !== filterRol) return false;

      if (!searchTerm || !searchTerm.trim()) return true;

      const rawQuery = searchTerm.trim();

      // 1. Detección directa de ID explícito (ej: "ID # 1", "id # 1", "ID 1", "id 1", "#1", "# 1", "id#1", "ID: 1")
      const idMatch = rawQuery.match(/^(?:id\s*[:#-]?\s*|#\s*)(\d+)$/i);
      if (idMatch) {
        const targetId = Number(idMatch[1]);
        return emp.idEmpleado === targetId;
      }

      const numSalario = Number(emp.salario) || 0;
      const formattedSalario = numSalario > 0 ? Math.round(numSalario).toLocaleString("es-CO") : "";
      const currencySalario = numSalario > 0 ? `$ ${formattedSalario}` : "";

      const fechaInicioStr = emp.fechaInicio
        ? new Date(emp.fechaInicio).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : "";
      const fechaFinStr = emp.fechaFin
        ? new Date(emp.fechaFin).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : "";

      return matchesSmartSearch(
        [
          // Documento de primero
          emp.numeroDocumento,
          emp.tipoDocumento,
          `${emp.tipoDocumento} ${emp.numeroDocumento}`,
          `${emp.tipoDocumento}. ${emp.numeroDocumento}`,
          // Empleado
          emp.idEmpleado,
          `ID #${emp.idEmpleado}`,
          `#${emp.idEmpleado}`,
          emp.nombre,
          emp.apellidos,
          `${emp.nombre} ${emp.apellidos}`,
          // Rol y turno
          emp.rol,
          emp.cargo,
          emp.turno,
          // Contacto
          emp.correo,
          emp.telefono,
          emp.telefono ? String(emp.telefono).replace(/\D/g, "") : "",
          emp.direccion,
          // Contratación
          emp.tipoContrato,
          emp.fechaInicio,
          emp.fechaFin,
          fechaInicioStr,
          fechaFinStr,
          emp.contratoVencido ? "Contrato Vencido" : "",
          // Estado
          emp.estado,
          // Salario en formatos numérico, con puntos y con divisa
          emp.salario,
          numSalario,
          String(Math.round(numSalario)),
          formattedSalario,
          currencySalario,
          `$${formattedSalario}`,
          `COP ${formattedSalario}`,
          "COP Mensual"
        ],
        rawQuery
      );
    });
  }, [empleados, filterEstado, filterRol, searchTerm]);

  const createEmpleado = async (formData) => {
    try {
      await empleadosService.createEmpleado(formData);
      notify.success("Éxito", "Empleado registrado correctamente");
      await fetchEmpleados();
      return true;
    } catch (err) {
      notify.error("Error", err.response?.data?.message || err.message || "Error al registrar el empleado");
      return false;
    }
  };

  const updateEmpleado = async (id, formData) => {
    try {
      await empleadosService.updateEmpleado(id, formData);
      notify.success("Éxito", "Empleado actualizado correctamente");
      await fetchEmpleados();
      return true;
    } catch (err) {
      notify.error("Error", err.response?.data?.message || err.message || "Error al actualizar el empleado");
      return false;
    }
  };

  const deleteEmpleado = async (id) => {
    try {
      await empleadosService.deleteEmpleado(id);
      notify.success("Eliminado", "Empleado enviado a la papelera");
      await fetchEmpleados();
      return true;
    } catch (err) {
      notify.error("Error", err.response?.data?.message || err.message || "Error al eliminar el empleado");
      return false;
    }
  };

  const restoreEmpleado = async (id) => {
    try {
      await empleadosService.restoreEmpleado(id);
      notify.success("Restaurado", "Empleado restaurado con éxito");
      await fetchEmpleados();
      return true;
    } catch (err) {
      notify.error("Error", err.response?.data?.message || err.message || "Error al restaurar el empleado");
      return false;
    }
  };

  return {
    empleados,
    papeleraEmpleados,
    filteredEmpleados,
    rolesDisponibles,
    cargosDisponibles: rolesDisponibles,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterRol,
    setFilterRol,
    filterCargo: filterRol,
    setFilterCargo: setFilterRol,
    fetchEmpleados,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    restoreEmpleado
  };
}
