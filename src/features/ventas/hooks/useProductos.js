import { useState, useEffect, useCallback, useMemo } from "react";
import { productosService } from "../servicios/productosService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch, formatStatusTokens } from "@/shared/utils/searchUtils";

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

  // Buscador generalizado por todas las columnas (unidades, inactivos, variantes, adiciones, combos, precio, etc.)
  const filteredProductos = useMemo(() => {
    return productos.filter((p) => {
      if (!p) return false;

      const variantesText = Array.isArray(p.variantes)
        ? p.variantes.map((v) => v.nombre || "").join(" ")
        : "";
      const adicionesText = Array.isArray(p.adiciones)
        ? p.adiciones.map((a) => (typeof a === "object" ? a.nombre : String(a))).join(" ")
        : "";
      
      let comboItemsText = "";
      if (p.configuracionCombo) {
        try {
          const cfg = typeof p.configuracionCombo === "string" ? JSON.parse(p.configuracionCombo) : p.configuracionCombo;
          if (Array.isArray(cfg?.productosAsociados)) {
            comboItemsText = cfg.productosAsociados.map(a => a.nombre || "").join(" ");
          }
        } catch (_) {}
      }

      const isAgotado = (p.stock || 0) === 0;
      const stockStatus = isAgotado
        ? "Agotado agotada sin_stock sin stock cero 0 agotados agotadas"
        : "disponible en stock en_stock suficiente";

      const precioNum = Number(p.precio || 0);

      const hasDesc = Boolean(p.descripcion && String(p.descripcion).trim());
      const descText = hasDesc ? `${p.descripcion} con_descripcion con descripcion` : "sin_descripcion sin descripcion";
      const hasCat = Boolean((p.categoria || p.categoriaNombre) && String(p.categoria || p.categoriaNombre).trim());
      const catText = hasCat ? `${p.categoria || ""} ${p.categoriaNombre || ""} con_categoria con categoria` : "sin_categoria sin categoria";

      const matchSearch = matchesSmartSearch(
        [
          p.nombre,
          p.codigo,
          p.id,
          p.idProducto,
          `#${p.id || p.idProducto}`,
          p.categoria,
          p.categoriaNombre,
          catText,
          descText,
          p.precio,
          String(p.precio ?? ""),
          precioNum > 0 ? `$${precioNum.toLocaleString("es-CO")}` : "",
          precioNum > 0 ? `$ ${precioNum.toLocaleString("es-CO")}` : "",
          formatStatusTokens(p.estado),
          stockStatus,
          p.stock,
          String(p.stock ?? ""),
          p.stock !== undefined ? `${p.stock} unidades` : "",
          p.ventas !== undefined ? `${p.ventas} ventas` : "",
          variantesText,
          adicionesText,
          comboItemsText
        ],
        searchTerm
      );

      const hasSearch = Boolean(searchTerm && searchTerm.trim());
      const isActivo = p.estado === "Activo" || p.estado === 1 || p.estado === "1";
      const matchEstadoFiltro =
        filterEstado === "Todos" ||
        (filterEstado === "Activo" && isActivo) ||
        (filterEstado === "Inactivo" && !isActivo);

      const matchEstado = !hasSearch ? matchEstadoFiltro : true;
      const matchCategoria = !hasSearch ? (filterCategoria === "Todas" || p.categoria === filterCategoria) : true;

      return matchSearch && matchCategoria && matchEstado;
    });
  }, [productos, searchTerm, filterCategoria, filterEstado]);

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
      notify.success("Producto eliminado", "El producto fue eliminado del sistema");
      await fetchProductos();
      return true;
    } catch (err) {
      notify.error("Error al eliminar", err.message || "No se pudo eliminar el producto");
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
