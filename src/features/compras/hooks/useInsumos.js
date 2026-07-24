import { useState, useEffect, useCallback } from "react";
import { insumosService } from "../services/insumosService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useInsumos() {
  const notify = useNotifications();
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      const [insumosData, categoriasData] = await Promise.all([
        insumosService.getInsumos(),
        insumosService.getCategorias()
      ]);
      setInsumos(insumosData || []);
      setCategorias(categoriasData || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al obtener insumos o categorías");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  const filteredInsumos = insumos.filter((item) => {
    const matchSearch =
      searchTerm === "" ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria = filterCategoria === "Todas" || item.categoria === filterCategoria;
    const matchEstado = filterEstado === "Todos" || item.estado === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  const createInsumo = async (data) => {
    try {
      await insumosService.createInsumo(data);
      notify.success("Insumo creado", "El insumo ha sido registrado exitosamente.");
      await fetchInsumos();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al crear el insumo");
      return false;
    }
  };

  const updateInsumo = async (id, data) => {
    try {
      await insumosService.updateInsumo(id, data);
      notify.success("Insumo actualizado", "Los datos fueron guardados exitosamente.");
      await fetchInsumos();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar el insumo");
      return false;
    }
  };

  const deleteInsumo = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar insumo?",
      `¿Estás seguro de que deseas eliminar "${nombre}"?`
    );
    if (!confirmed) return false;
    try {
      await insumosService.deleteInsumo(id);
      notify.success("Insumo eliminado", "El insumo ha sido eliminado correctamente.");
      await fetchInsumos();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar el insumo");
      return false;
    }
  };

  return {
    insumos,
    filteredInsumos,
    categorias,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    refetch: fetchInsumos,
    createInsumo,
    updateInsumo,
    deleteInsumo
  };
}
