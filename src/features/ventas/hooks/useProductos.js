import { useState, useEffect, useCallback } from "react";
import { productosService } from "../servicios/productosService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch } from "@/shared/utils/searchUtils";

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
      const [prods, cats, fichas] = await Promise.all([
        productosService.getProductos(),
        productosService.getCategorias(),
        fichasTecnicasService.getFichas().catch(() => [])
      ]);
      const fichaMap = new Map();
      if (Array.isArray(fichas)) {
        fichas.forEach((f) => {
          if (f && f.idProducto) {
            fichaMap.set(Number(f.idProducto), f);
          }
        });
      }
      const enrichedProds = (prods || []).map((p) => {
        const prodId = Number(p.idProducto || p.id);
        const ficha = fichaMap.get(prodId);
        const ent = ficha?.datosEntidad;
        if (!ent) {
          return ficha ? { ...p, fichaTecnica: p.fichaTecnica || ficha } : p;
        }
        return {
          ...p,
          fichaTecnica: p.fichaTecnica || ficha,
          precio: ent.precio !== undefined && Number(ent.precio) > 0 ? Number(ent.precio) : p.precio,
          descripcion: ent.descripcion !== undefined ? ent.descripcion : p.descripcion
        };
      });
      setProductos(enrichedProds);
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

    const matchSearch = matchesSmartSearch(
      [p.nombre, p.codigo, p.categoria, p.descripcion, p.precio],
      searchTerm
    );

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
      // 1. Guardar primero la ficha técnica con su versionamiento (los combos no llevan ficha técnica)
      const esCombo = data.configuracionCombo?.esCombo;
      let fichaGuardada = false;
      if (data.fichaTecnica && id && !esCombo) {
        try {
          await fichasTecnicasService.saveFichaProducto(id, data.fichaTecnica);
          fichaGuardada = true;
        } catch (e) {
          console.error("Error guardando ficha técnica del producto:", e);
        }
      }

      // 2. Actualizar los datos generales del producto
      try {
        await productosService.updateProducto(id, data);
      } catch (prodErr) {
        const msg = String(prodErr?.message || "");
        // Si el servidor remoto restringe cambios generales por ventas previas pero ya guardamos la ficha técnica
        if (fichaGuardada && msg.toLowerCase().includes("ventas registradas")) {
          if (data.estado !== undefined) {
            await productosService.updateProducto(id, { estado: data.estado }).catch(() => {});
          }
        } else {
          throw prodErr;
        }
      }

      notify.success("Producto actualizado", "El producto y su ficha técnica fueron actualizados correctamente");
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
