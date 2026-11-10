import { useState, useEffect, useCallback, useMemo } from "react";
import { empleadosService } from "../servicios/empleadosService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";

export function useEmpleados() {
  const notify = useNotifications();
  const [empleados, setEmpleados] = useState([]);
  const [papeleraEmpleados, setPapeleraEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Todos");
  const [filterCargo, setFilterCargo] = useState("Todos");

  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      const [activosData, papeleraData] = await Promise.all([
        empleadosService.getEmpleados({ papelera: false }),
        empleadosService.getEmpleados({ papelera: true }).catch(() => [])
      ]);
      setEmpleados(Array.isArray(activosData) ? activosData : []);
      setPapeleraEmpleados(Array.isArray(papeleraData) ? papeleraData : []);
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

  // Cargos únicos disponibles (Cargos base conectados con roles + escalables)
  const cargosDisponibles = useMemo(() => {
    const defaultCargos = ["Administrador", "Cocinero", "Vendedor"];
    const fromData = empleados.map((e) => e.cargo).filter(Boolean);
    return Array.from(new Set([...defaultCargos, ...fromData]));
  }, [empleados]);

  // Estadísticas del módulo
  const stats = useMemo(() => {
    const total = empleados.length;
    const activos = empleados.filter((e) => e.estado === 1 || e.estado === "1" || e.estado === "Activo").length;
    const inactivos = total - activos;
    const papelera = papeleraEmpleados.length;
    return { total, activos, inactivos, papelera };
  }, [empleados, papeleraEmpleados]);

  // Lista filtrada
  const filteredEmpleados = useMemo(() => {
    return empleados.filter((emp) => {
      const isActivo = emp.estado === 1 || emp.estado === "1" || emp.estado === "Activo";
      
      if (filterEstado === "Activo" && !isActivo) return false;
      if (filterEstado === "Inactivo" && isActivo) return false;

      if (filterCargo !== "Todos" && emp.cargo !== filterCargo) return false;

      if (!searchTerm || !searchTerm.trim()) return true;

      const numSalario = Number(emp.salario) || 0;
      const formattedSalario = numSalario > 0 ? Math.round(numSalario).toLocaleString("es-CO") : "";
      const currencySalario = numSalario > 0 ? `$ ${formattedSalario}` : "";

      const fechaContratoStr = emp.fechaContratacion
        ? new Date(emp.fechaContratacion).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : "";
      const fechaContratoCorta = emp.fechaContratacion
        ? new Date(emp.fechaContratacion).toLocaleDateString("es-CO")
        : "";

      return matchesSmartSearch(
        [
          emp.idEmpleado,
          `ID #${emp.idEmpleado}`,
          `#${emp.idEmpleado}`,
          emp.nombre,
          emp.apellidos,
          `${emp.nombre} ${emp.apellidos}`,
          emp.numeroDocumento,
          emp.tipoDocumento,
          `${emp.tipoDocumento} ${emp.numeroDocumento}`,
          `${emp.tipoDocumento}. ${emp.numeroDocumento}`,
          emp.cargo,
          emp.correo,
          emp.telefono,
          emp.telefono ? String(emp.telefono).replace(/\D/g, "") : "",
          emp.direccion,
          emp.tipoContrato,
          emp.turno,
          isActivo ? "Activo" : "Inactivo",
          emp.fechaContratacion,
          fechaContratoStr,
          fechaContratoCorta,
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
        searchTerm
      );
    });
  }, [empleados, filterEstado, filterCargo, searchTerm]);

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

  const toggleEstadoEmpleado = async (id) => {
    try {
      const res = await empleadosService.toggleEstadoEmpleado(id);
      notify.success("Estado Actualizado", res.message || "Estado del empleado modificado con éxito");
      await fetchEmpleados();
      return true;
    } catch (err) {
      notify.error("Error", err.response?.data?.message || err.message || "Error al cambiar el estado");
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
    cargosDisponibles,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterCargo,
    setFilterCargo,
    fetchEmpleados,
    createEmpleado,
    updateEmpleado,
    toggleEstadoEmpleado,
    deleteEmpleado,
    restoreEmpleado
  };
}

