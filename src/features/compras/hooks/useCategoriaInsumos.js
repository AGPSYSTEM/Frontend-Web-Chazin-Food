import { useState, useEffect, useCallback } from "react";
import { categoriaInsumosService } from "../services/categoriaInsumosService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useCategoriaInsumos() {
  const notify = useNotifications();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriaInsumosService.getCategorias();
      setCategorias(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Fallo de conexión al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const filteredCategorias = categorias.filter(
    (c) =>
      searchTerm.trim() === "" ||
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createCategoria = async (form) => {
    try {
      await categoriaInsumosService.createCategoria(form);
      notify.success("Categoría creada", "La categoría se creó exitosamente");
      await fetchCategorias();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo guardar la categoría");
      return false;
    }
  };

  const updateCategoria = async (id, form) => {
    try {
      await categoriaInsumosService.updateCategoria(id, form);
      notify.success("Categoría actualizada", "Los cambios fueron guardados exitosamente");
      await fetchCategorias();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo actualizar la categoría");
      return false;
    }
  };

  const deleteCategoria = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar categoría?",
      `¿Estás seguro de que deseas eliminar la categoría "${nombre}"?`
    );
    if (!confirmed) return false;
    try {
      await categoriaInsumosService.deleteCategoria(id);
      notify.success("Categoría eliminada", "La categoría ha sido eliminada del sistema");
      await fetchCategorias();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar la categoría");
      return false;
    }
  };

  return {
    categorias,
    filteredCategorias,
    loading,
    searchTerm,
    setSearchTerm,
    refetch: fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria
  };
}
