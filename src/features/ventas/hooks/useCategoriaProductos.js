import { useState, useEffect, useCallback, useMemo } from "react";
import { categoriaProductosService } from "../servicios/categoriaProductosService";
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
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Buscador generalizado por todas las columnas (nombre, descripción, ID, unidades/productos, estado inactivo/activo)
  const filteredCategorias = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return categorias;
    const term = searchTerm.trim().toLowerCase();

    return categorias.filter((c) => {
      const id = String(c.id || c.idCategoriaProducto || "").toLowerCase();
      const nombre = (c.nombre || "").toLowerCase();
      const descripcion = (c.descripcion || "").toLowerCase();
      const estado = (c.estado || (c.activo === false ? "Inactivo" : "Activo")).toLowerCase();
      
      const count = String(c.totalProductos ?? c.cantidadProductos ?? c.productosCount ?? c.productos?.length ?? 0);
      const unidadesText = `${count} productos ${count} unidades ${count} platillos`.toLowerCase();

      // Buscar también si coincide con nombres de productos contenidos en la categoría
      const productosNombres = Array.isArray(c.productos)
        ? c.productos.map((p) => (typeof p === "string" ? p : p.nombre || "")).join(" ").toLowerCase()
        : "";

      return (
        id.includes(term) ||
        nombre.includes(term) ||
        descripcion.includes(term) ||
        estado.includes(term) ||
        count === term ||
        unidadesText.includes(term) ||
        productosNombres.includes(term)
      );
    });
  }, [categorias, searchTerm]);

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
      notify.error("Error al eliminar", err.message || "No se pudo eliminar la categoría");
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
