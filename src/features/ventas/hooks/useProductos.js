import { useState, useEffect, useCallback, useMemo } from "react";
import { productosService } from "../servicios/productosService";
import { fichasTecnicasService } from "@/features/fichas-tecnicas/servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch, formatStatusTokens } from "@/shared/utils/searchUtils";

export function useProductos() {
  const notify = useNotifications();
  const [productos, setProductos] = useState([]);
  const [papeleraProductos, setPapeleraProductos] = useState([]);
  const [lastDeletedProducto, setLastDeletedProducto] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");

  const fetchPapelera = useCallback(async () => {
    try {
      const trash = await productosService.getPapeleraProductos();
      setPapeleraProductos(Array.isArray(trash) ? trash : []);
    } catch {
      setPapeleraProductos([]);
    }
  }, []);

  const fetchProductos = useCallback(async () => {
    try {
      setLoading(true);
      const [prods, cats, fichas, trash] = await Promise.all([
        productosService.getProductos(),
        productosService.getCategorias(),
        fichasTecnicasService.getFichas().catch(() => []),
        productosService.getPapeleraProductos().catch(() => [])
      ]);
      const fichaMap = new Map();
      const variantFichaMap = new Map();
      if (Array.isArray(fichas)) {
        fichas.forEach((f) => {
          if (f && f.tipo === "VARIANTE" && f.idVariante) {
            variantFichaMap.set(Number(f.idVariante), f);
          } else if (f && f.idProducto && !fichaMap.has(Number(f.idProducto))) {
            fichaMap.set(Number(f.idProducto), f);
          }
        });
      }
      const enrichedProds = (prods || []).map((p) => {
        const prodId = Number(p.idProducto || p.id);
        const ficha = fichaMap.get(prodId);
        const ent = ficha?.datosEntidad;
        const enrichedVars = Array.isArray(p.variantes)
          ? p.variantes.map((v) => {
              const vf = v.fichaTecnica || variantFichaMap.get(Number(v.idVariante || v.id)) || null;
              return vf ? { ...v, fichaTecnica: vf } : v;
            })
          : p.variantes;
        if (!ent) {
          return ficha || enrichedVars !== p.variantes
            ? { ...p, variantes: enrichedVars, fichaTecnica: p.fichaTecnica || ficha }
            : p;
        }
        return {
          ...p,
          variantes: enrichedVars,
          fichaTecnica: p.fichaTecnica || ficha,
          precio: ent.precio !== undefined && Number(ent.precio) > 0 ? Number(ent.precio) : p.precio,
          descripcion: ent.descripcion !== undefined ? ent.descripcion : p.descripcion
        };
      });
      setProductos(enrichedProds);
      setPapeleraProductos(Array.isArray(trash) ? trash : []);
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
      let createdFicha = null;
      if (data.fichaTecnica && createdId && !esCombo) {
        try {
          createdFicha = await fichasTecnicasService.saveFichaProducto(createdId, data.fichaTecnica);
        } catch (e) {
          console.error("Error guardando ficha técnica del producto:", e);
        }
      }
      const finalVersion = Number(createdFicha?.versionActual || data.fichaTecnica?.versionActual || 1).toFixed(1);
      notify.success("Producto Creado", `Producto creado exitosamente con la versión ${finalVersion}`);
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

  const toggleEstadoProducto = async (producto) => {
    if (!producto) return false;
    const id = producto.id || producto.idProducto;
    const isActivo = producto.estado === "Activo" || producto.estado === 1 || producto.estado === "1";
    const nuevoEstado = isActivo ? "Inactivo" : "Activo";
    const confirmed = await notify.confirmAction(
      isActivo ? "¿Inactivar producto?" : "¿Activar producto?",
      isActivo
        ? `¿Estás seguro de que deseas inactivar "${producto.nombre}"? No estará disponible para ventas ni en el catálogo hasta que sea activado nuevamente.`
        : `¿Deseas activar nuevamente "${producto.nombre}"? Volverá a estar disponible para ventas y en el catálogo.`,
      isActivo ? "Sí, inactivar" : "Sí, activar"
    );
    if (!confirmed) return false;
    try {
      await productosService.updateProducto(id, { estado: nuevoEstado });
      await fetchProductos();
      notify.success(
        nuevoEstado === "Activo" ? "Producto activado" : "Producto inactivado",
        `"${producto.nombre}" ahora está ${nuevoEstado}.`
      );
      return true;
    } catch (err) {
      notify.error("Error al cambiar estado", err.message || "No se pudo actualizar el estado del producto");
      return false;
    }
  };

  const deleteProducto = async (id, nombre, options = {}) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar producto?",
      `¿Estás seguro de que deseas eliminar "${nombre}"? El producto se moverá a la papelera de reciclaje y podrás recuperarlo cuando lo necesites.`
    );
    if (!confirmed) return false;
    try {
      await productosService.deleteProducto(id);
      setLastDeletedProducto({ id, nombre });
      await fetchProductos();
      notify.success(
        "Producto enviado a la papelera",
        `"${nombre}" se movió a la papelera.`,
        options?.onGoToTrash
          ? {
              duration: 7000,
              action: {
                label: "Ir a la papelera",
                onClick: options.onGoToTrash
              }
            }
          : undefined
      );
      return true;
    } catch (err) {
      notify.error("Error al eliminar", err.message || "No se pudo eliminar el producto");
      return false;
    }
  };

  const restoreProducto = async (itemOrId) => {
    const id = typeof itemOrId === "object" && itemOrId !== null
      ? (itemOrId.id || itemOrId.idProducto)
      : itemOrId;
    const nombre = typeof itemOrId === "object" && itemOrId !== null
      ? itemOrId.nombre
      : "";
    if (!id) return false;
    try {
      await productosService.restoreProducto(id);
      setLastDeletedProducto((prev) => (prev && Number(prev.id) === Number(id) ? null : prev));
      await fetchProductos();
      notify.success(
        "Producto recuperado",
        nombre ? `"${nombre}" volvió al catálogo activo.` : "El producto volvió al catálogo activo."
      );
      return true;
    } catch (err) {
      notify.error("Error al recuperar", err.message || "No se pudo recuperar el producto");
      return false;
    }
  };

  const deleteDefinitivoProducto = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar definitivamente?",
      `Esta acción eliminará permanentemente "${nombre}" de la base de datos y no se podrá recuperar.`
    );
    if (!confirmed) return false;
    try {
      await productosService.hardDeleteProducto(id);
      setLastDeletedProducto((prev) => (prev && Number(prev.id) === Number(id) ? null : prev));
      await fetchPapelera();
      notify.success("Eliminado permanente", `"${nombre}" fue eliminado definitivamente.`);
      return true;
    } catch (err) {
      notify.error("Error al eliminar", err.message || "No se pudo eliminar permanentemente");
      return false;
    }
  };

  const dismissLastDeleted = useCallback(() => {
    setLastDeletedProducto(null);
  }, []);

  return {
    productos,
    papeleraProductos,
    filteredProductos,
    categorias,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    lastDeletedProducto,
    dismissLastDeleted,
    refetch: fetchProductos,
    createProducto,
    updateProducto,
    toggleEstadoProducto,
    deleteProducto,
    restoreProducto,
    deleteDefinitivoProducto
  };
}
