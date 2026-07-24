import { useState, useEffect, useCallback } from "react";
import { categoriaProductosService } from "../services/categoriaProductosService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useCategoriaProductos() {
  const notify = useNotifications();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriaProductosService.getCategorias();
      setCategorias(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar categorías de productos");
    } finally {
      setLoading(false);
    }
  }, [notify]);

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
      await categoriaProductosService.createCategoria(form);
      notify.success("Categoría creada", "Categoría de producto registrada exitosamente");
      await fetchCategorias();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo guardar la categoría");
      return false;
    }
  };

  const updateCategoria = async (id, form) => {
    try {
      await categoriaProductosService.updateCategoria(id, form);
      notify.success("Categoría actualizada", "Cambios guardados correctamente");
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
      `¿Estás seguro de que deseas eliminar "${nombre}"?`
    );
    if (!confirmed) return false;
    try {
      await categoriaProductosService.deleteCategoria(id);
      notify.success("Categoría eliminada", "Categoría eliminada del sistema");
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
