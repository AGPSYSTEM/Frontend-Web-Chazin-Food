import { useState, useEffect, useCallback } from "react";
import { productosService } from "../servicios/productosService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useProductos() {
  const notify = useNotifications();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productosService.getProductos(),
        productosService.getCategorias()
      ]);
      setProductos(prods || []);
      setCategorias(cats || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  const filteredProductos = productos.filter((p) => {
    if (!p) return false;

    let matchSearch = true;
    if (searchTerm && searchTerm.trim() !== "") {
      const termNorm = searchTerm
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      const nomNorm = String(p.nombre || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const codNorm = String(p.codigo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const catNorm = String(p.categoria || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const descNorm = String(p.descripcion || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const precioStr = String(p.precio || "");
      const precioFormatted = Number(p.precio || 0).toLocaleString("es-CO");

      matchSearch =
        nomNorm.includes(termNorm) ||
        codNorm.includes(termNorm) ||
        catNorm.includes(termNorm) ||
        descNorm.includes(termNorm) ||
        precioStr.includes(termNorm) ||
        precioFormatted.includes(termNorm);
    }

    const matchCategoria = filterCategoria === "Todas" || p.categoria === filterCategoria;
    const matchEstado = filterEstado === "Todos" || p.estado === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  const createProducto = async (data) => {
    try {
      const created = await productosService.createProducto(data);
      const createdId = created?.idProducto || created?.id || created?._id;
      // Los combos no llevan ficha técnica
      const esCombo = data.configuracionCombo?.esCombo;
      if (data.fichaTecnica && createdId && !esCombo) {
        try {
          await fichasTecnicasService.saveFichaProducto(createdId, data.fichaTecnica);
        } catch (e) {
          console.error("Error guardando ficha técnica del producto:", e);
        }
      }
      notify.success("Producto creado", "El producto fue creado exitosamente");
      await fetchProductos();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al crear el producto");
      return false;
    }
  };

  const updateProducto = async (id, data) => {
    try {
      await productosService.updateProducto(id, data);
      // Los combos no llevan ficha técnica
      const esCombo = data.configuracionCombo?.esCombo;
      if (data.fichaTecnica && id && !esCombo) {
        try {
          await fichasTecnicasService.saveFichaProducto(id, data.fichaTecnica);
        } catch (e) {
          console.error("Error guardando ficha técnica del producto:", e);
        }
      }
      notify.success("Producto actualizado", "Cambios guardados correctamente");
      await fetchProductos();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar el producto");
      return false;
    }
  };

  const deleteProducto = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar producto?",
      `¿Estás seguro de que deseas eliminar "${nombre}"?`
    );
    if (!confirmed) return false;
    try {
      await productosService.deleteProducto(id);
      notify.success("Producto eliminado", "El producto fue eliminado del menú");
      await fetchProductos();
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar el producto");
      return false;
    }
  };

  return {
    productos,
    filteredProductos,
    categorias,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    refetch: fetchProductos,
    createProducto,
    updateProducto,
    deleteProducto
  };
}
