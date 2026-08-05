import { useState, useEffect, useCallback } from "react";
import { insumosService } from "../servicios/insumosService";
import { proveedoresService } from "../servicios/proveedoresService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { apiClient } from "@/shared/api/apiClient";

const INITIAL_EVENTOS = [];

export function useInsumos() {
  const notify = useNotifications();
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("Todas");
  const [filterEstado, setFilterEstado] = useState("Todos");

  // Traceability & Trash Bin State with localStorage persistence
  const [eventos, setEventos] = useState(() => {
    try {
      const saved = localStorage.getItem("insumos_trazabilidad_eventos");
      return saved ? JSON.parse(saved) : INITIAL_EVENTOS;
    } catch {
      return INITIAL_EVENTOS;
    }
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    try {
      const saved = localStorage.getItem("insumos_trazabilidad_unread");
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [papeleraInsumos, setPapeleraInsumos] = useState(() => {
    try {
      const saved = localStorage.getItem("insumos_papelera_base");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [papeleraPreparados, setPapeleraPreparados] = useState(() => {
    try {
      const saved = localStorage.getItem("insumos_papelera_preparados");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("insumos_trazabilidad_eventos", JSON.stringify(eventos));
    } catch {}
  }, [eventos]);

  useEffect(() => {
    try {
      localStorage.setItem("insumos_trazabilidad_unread", JSON.stringify(unreadCount));
    } catch {}
  }, [unreadCount]);

  useEffect(() => {
    try {
      localStorage.setItem("insumos_papelera_base", JSON.stringify(papeleraInsumos));
    } catch {}
  }, [papeleraInsumos]);

  useEffect(() => {
    try {
      localStorage.setItem("insumos_papelera_preparados", JSON.stringify(papeleraPreparados));
    } catch {}
  }, [papeleraPreparados]);

  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      const [insumosData, categoriasData, proveedoresData, trazabilidadData] = await Promise.all([
        insumosService.getInsumos(),
        insumosService.getCategorias(),
        proveedoresService.getProveedores().catch(() => []),
        apiClient.get("/trazabilidad").catch(() => [])
      ]);

      let finalInsumos = insumosData || [];
      if (finalInsumos.length > 0 && !finalInsumos.some((i) => i.tipo === "Preparado")) {
        finalInsumos = [
          ...finalInsumos,
          {
            id: "prep-1",
            nombre: "salsa de la casa",
            tipo: "Preparado",
            descripcion: "salsa de la casa 100% artesanal",
            precio: 2000,
            unidadMedida: "porción",
            estado: "Activo",
            ingredientes: [{ id: 1, nombre: "Tomate", cantidad: 1, unidadMedida: "paq" }]
          },
          {
            id: "prep-2",
            nombre: "Salsa Especial de la Casa",
            tipo: "Preparado",
            descripcion: "Receta casera",
            precio: 7500,
            unidadMedida: "und",
            estado: "Activo",
            ingredientes: [{ id: 2, nombre: "Mayonesa", cantidad: 1, unidadMedida: "und" }]
          },
          {
            id: "prep-3",
            nombre: "Receta Especial Jalapeños",
            tipo: "Preparado",
            descripcion: "Con queso chedart",
            precio: 10000,
            unidadMedida: "und",
            estado: "Activo",
            ingredientes: [{ id: 3, nombre: "Jalapeño", cantidad: 2, unidadMedida: "und" }]
          }
        ];
      }

      setInsumos(finalInsumos);
      setCategorias(categoriasData || []);
      setProveedores(proveedoresData || []);

      // Map backend trazabilidad events
      if (Array.isArray(trazabilidadData)) {
        const mappedBackendEvents = trazabilidadData.map((r) => {
          let tipoLabel = "Creado";
          if (
            r.tipo === "compra" ||
            r.tipoMovimiento === "Entrada" ||
            (r.tipo && r.tipo.toLowerCase().includes("reabastec"))
          ) {
            tipoLabel = "Reabastecimiento";
          } else if (r.tipo === "editar" || r.tipo === "Editado") {
            tipoLabel = "Editado";
          } else if (r.tipo === "eliminar" || r.tipo === "Eliminado") {
            tipoLabel = "Eliminado";
          } else if (r.tipo === "restaurar" || r.tipo === "Restaurado") {
            tipoLabel = "Restaurado";
          }

          const fechaObj = r.fecha ? new Date(r.fecha) : new Date();
          const fechaStr = `${String(fechaObj.getDate()).padStart(2, "0")}/${String(
            fechaObj.getMonth() + 1
          ).padStart(2, "0")}/${fechaObj.getFullYear()} ${String(
            fechaObj.getHours()
          ).padStart(2, "0")}:${String(fechaObj.getMinutes()).padStart(2, "0")}`;

          return {
            id: `tz-${r.idTrazabilidad || r.id}`,
            tipo: tipoLabel,
            nombre: r.entidadNombre || (r.idInsumo ? `Insumo #${r.idInsumo}` : "Insumo"),
            descripcion: r.detalle || r.motivo || "Movimiento de trazabilidad registrado",
            fecha: fechaStr,
            cantidad: r.cantidad,
            tipoMovimiento: r.tipoMovimiento
          };
        });

        setEventos((prev) => {
          const combined = [...mappedBackendEvents, ...(prev || [])];
          const unique = [];
          const seen = new Set();
          for (const item of combined) {
            const key = `${item.tipo}-${item.nombre}-${item.fecha}-${item.descripcion}`;
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(item);
            }
          }
          return unique;
        });
      }
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al obtener insumos o categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  const addTraceabilityEvent = (tipo, nombre, descripcion) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(
      2,
      "0"
    )}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newEv = {
      id: Date.now(),
      tipo,
      nombre,
      descripcion,
      fecha: formattedDate
    };

    setEventos((prev) => [newEv, ...prev]);
    setUnreadCount((prev) => prev + 1);
  };

  const filteredInsumos = insumos.filter((item) => {
    const matchSearch =
      searchTerm === "" ||
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria = filterCategoria === "Todas" || item.categoria === filterCategoria || item.categoriaNombre === filterCategoria;
    const matchEstado = filterEstado === "Todos" || item.estado === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  const createInsumo = async (data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      const payload = {
        nombre: data.nombre,
        idCategoriaInsumo: data.idCategoriaInsumo || null,
        categoria: data.categoria || null,
        stock: Number(data.stock) || 0,
        stockMinimo: Number(data.stockMinimo) || 0,
        unidadMedida: data.unidadMedida || "und",
        precioUnitario: Number(data.precioUnitario) || 0,
        idProveedor: data.idProveedor || null,
        proveedor: data.proveedor || null,
        fechaExpedicion: data.fechaExpedicion || null,
        fechaVencimiento: data.fechaVencimiento || null,
        descripcion: data.descripcion || "",
        estado: data.estado || "Activo"
      };

      await insumosService.createInsumo(payload);
      await fetchInsumos();

      addTraceabilityEvent(
        "Creado",
        data.nombre,
        isPrep
          ? `Se creó la receta del insumo preparado: ${data.nombre}`
          : `Se creó un nuevo insumo en el inventario: ${data.nombre}`
      );

      notify.success(
        isPrep ? "Insumo preparado creado" : "Insumo creado",
        "El registro se realizó exitosamente."
      );
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al crear");
      return false;
    }
  };

  const updateInsumo = async (id, data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      const payload = {
        nombre: data.nombre,
        idCategoriaInsumo: data.idCategoriaInsumo || null,
        categoria: data.categoria || null,
        stock: Number(data.stock) || 0,
        stockMinimo: Number(data.stockMinimo) || 0,
        unidadMedida: data.unidadMedida || "und",
        precioUnitario: Number(data.precioUnitario) || 0,
        idProveedor: data.idProveedor || null,
        proveedor: data.proveedor || null,
        fechaExpedicion: data.fechaExpedicion || null,
        fechaVencimiento: data.fechaVencimiento || null,
        descripcion: data.descripcion || "",
        estado: data.estado || "Activo"
      };

      await insumosService.updateInsumo(id, payload);
      await fetchInsumos();

      addTraceabilityEvent(
        "Editado",
        data.nombre,
        isPrep
          ? `Se actualizaron los datos de la receta: ${data.nombre}`
          : `Se actualizaron los datos del insumo: ${data.nombre}`
      );

      notify.success("Insumo actualizado", "Los datos fueron guardados exitosamente.");
      return true;
    } catch (err) {
      notify.error("Error", err.message || "Error al actualizar");
      return false;
    }
  };

  const deleteInsumo = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deleteInsumo(id);
      await fetchInsumos();

      addTraceabilityEvent(
        "Eliminado",
        nombre,
        `Se movió a la papelera el insumo: ${nombre}`
      );

      notify.success("Movido a papelera", `"${nombre}" fue enviado a la papelera.`);
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar");
      return false;
    }
  };

  const restoreInsumo = (item) => {
    // Remove from trash list
    if (item.tipo === "Preparado") {
      setPapeleraPreparados((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setPapeleraInsumos((prev) => prev.filter((i) => i.id !== item.id));
    }

    // Add back to active insumos
    setInsumos((prev) => [item, ...prev]);

    addTraceabilityEvent(
      "Restaurado",
      item.nombre,
      item.tipo === "Preparado"
        ? `Se restauró de la papelera la receta del preparado: ${item.nombre}`
        : `Se restauró el insumo en el inventario: ${item.nombre}`
    );

    notify.success("Insumo restaurado", `"${item.nombre}" volvió a estar activo.`);
  };

  const deleteDefinitivoInsumo = async (id, nombre, isPreparado) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar definitivamente?",
      `Esta acción eliminará permanentemente "${nombre}" y no se podrá recuperar.`
    );
    if (!confirmed) return;

    if (isPreparado) {
      setPapeleraPreparados((prev) => prev.filter((i) => i.id !== id));
    } else {
      setPapeleraInsumos((prev) => prev.filter((i) => i.id !== id));
    }

    notify.success("Eliminado permanente", `"${nombre}" fue eliminado por completo.`);
  };

  const clearEventos = () => {
    setEventos([]);
    notify.success("Trazabilidad limpia", "Se borró el historial de eventos.");
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return {
    insumos,
    filteredInsumos,
    categorias,
    proveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filterCategoria,
    setFilterCategoria,
    filterEstado,
    setFilterEstado,
    eventos,
    unreadCount,
    papeleraInsumos,
    papeleraPreparados,
    refetch: fetchInsumos,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    restoreInsumo,
    deleteDefinitivoInsumo,
    clearEventos,
    resetUnreadCount
  };
}
