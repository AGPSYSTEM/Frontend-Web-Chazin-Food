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

  // Traceability State with localStorage persistence
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

  // Papelera state — fetched from the backend API
  const [papeleraInsumos, setPapeleraInsumos] = useState([]);
  const [papeleraPreparados, setPapeleraPreparados] = useState([]);

  // Sync traceability to localStorage
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

  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      const [insumosData, categoriasData, preparadosData] = await Promise.all([
        insumosService.getInsumos(),
        insumosService.getCategorias(),
        insumosService.getInsumosPreparados()
      ]);

      const baseMapped = (insumosData || []).map(i => ({
        ...i,
        tipo: "Base"
      }));

      const prepMapped = (preparadosData || []).map(p => ({
        id: p.id,
        idInsumo: p.id,
        nombre: p.nombre,
        tipo: "Preparado",
        descripcion: p.descripcion || "",
        precio: p.precioVenta || p.costoTotal || 0,
        costo: p.costoTotal || 0,
        unidadMedida: p.unidadMedida || "und",
        estado: p.estado === 1 ? "Activo" : "Inactivo",
        ingredientes: (p.insumos || p.componentes || []).map(d => ({
          id: d.idInsumo,
          nombre: d.insumoNombre || `Insumo #${d.idInsumo}`,
          cantidad: parseFloat(d.cantidad || 0),
          unidadMedida: d.unidadMedida || "und",
          precioUnitario: parseFloat(d.precioUnitario || 0)
        }))
      }));

      setInsumos([...baseMapped, ...prepMapped]);
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

  // Fetch papelera data from backend API
  const fetchPapelera = useCallback(async () => {
    try {
      const [insumosTrash, preparadosTrash] = await Promise.all([
        insumosService.getPapeleraInsumos(),
        insumosService.getPapeleraPreparados()
      ]);

      const prepTrashMapped = (preparadosTrash || []).map(p => ({
        id: p.id,
        idInsumo: p.id,
        nombre: p.nombre,
        tipo: "Preparado",
        descripcion: p.descripcion || "",
        precio: p.precioVenta || p.costoTotal || 0,
        costo: p.costoTotal || 0,
        unidadMedida: p.unidadMedida || "und",
        estado: p.estado === 1 ? "Activo" : "Inactivo",
        ingredientes: (p.insumos || p.componentes || []).map(d => ({
          id: d.idInsumo,
          nombre: d.insumoNombre || `Insumo #${d.idInsumo}`,
          cantidad: parseFloat(d.cantidad || 0),
          unidadMedida: d.unidadMedida || "und",
          precioUnitario: parseFloat(d.precioUnitario || 0)
        }))
      }));

      setPapeleraInsumos(insumosTrash || []);
      setPapeleraPreparados(prepTrashMapped);
    } catch (err) {
      console.error("Error al cargar papelera:", err);
    }
  }, []);

  useEffect(() => {
    fetchInsumos();
    fetchPapelera();
  }, [fetchInsumos, fetchPapelera]);

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
      if (isPrep) {
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          unidadMedida: data.unidadMedida || "und",
          precioVenta: Number(data.precio) || 0,
          insumos: (data.ingredientes || []).map(i => ({
            idInsumo: i.id,
            cantidad: i.cantidad,
            unidadMedida: i.unidadMedida || "und"
          }))
        };
        await insumosService.createPreparado(payload);
      } else {
        const payload = {
          nombre: data.nombre,
          idCategoriaInsumo: data.idCategoriaInsumo || 1,
          stock: Number(data.stock) || 0,
          stockMinimo: Number(data.stockMinimo) || 0,
          unidadMedida: data.unidadMedida || "und",
          precioUnitario: Number(data.precioUnitario) || 0,
          idProveedor: data.idProveedor || null,
          descripcion: data.descripcion || ""
        };
        await insumosService.createInsumo(payload);
      }

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
      if (isPrep) {
        const payload = {
          nombre: data.nombre,
          descripcion: data.descripcion || "",
          unidadMedida: data.unidadMedida || "und",
          precioVenta: Number(data.precio) || 0,
          insumos: (data.ingredientes || []).map(i => ({
            idInsumo: i.id,
            cantidad: i.cantidad,
            unidadMedida: i.unidadMedida || "und"
          }))
        };
        await insumosService.updatePreparado(id, payload);
      } else {
        const payload = {
          nombre: data.nombre,
          idCategoriaInsumo: data.idCategoriaInsumo,
          stock: Number(data.stock),
          stockMinimo: Number(data.stockMinimo),
          unidadMedida: data.unidadMedida,
          precioUnitario: Number(data.precioUnitario),
          idProveedor: data.idProveedor,
          descripcion: data.descripcion
        };
        await insumosService.updateInsumo(id, payload);
      }

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

  // Soft delete — moves base insumo to papelera (sets estado = 0 in backend)
  const deleteInsumo = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deleteInsumo(id);
      await fetchInsumos();
      await fetchPapelera();

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

  // Soft delete for insumos preparados — moves prepared insumo to papelera
  const deletePreparado = async (id, nombre) => {
    const confirmed = await notify.confirmDelete(
      "¿Mover a la papelera?",
      `¿Deseas mover el preparado "${nombre}" a la papelera de reciclaje?`
    );
    if (!confirmed) return false;

    try {
      await insumosService.deletePreparado(id);
      await fetchInsumos();
      await fetchPapelera();

      addTraceabilityEvent(
        "Eliminado",
        nombre,
        `Se movió a la papelera el insumo preparado: ${nombre}`
      );

      notify.success("Movido a papelera", `"${nombre}" fue enviado a la papelera.`);
      return true;
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar el preparado");
      return false;
    }
  };

  // Restore from papelera — calls backend API to set estado = 1
  const restoreInsumo = async (item) => {
    try {
      const isPreparado = item.tipo === "Preparado" || item.componentes || item.ingredientes;

      if (isPreparado) {
        await insumosService.restorePreparado(item.id || item.idInsumo);
      } else {
        await insumosService.restoreInsumo(item.id || item.idInsumo);
      }

      await fetchInsumos();
      await fetchPapelera();

      addTraceabilityEvent(
        "Restaurado",
        item.nombre,
        isPreparado
          ? `Se restauró de la papelera la receta del preparado: ${item.nombre}`
          : `Se restauró el insumo en el inventario: ${item.nombre}`
      );

      notify.success("Insumo restaurado", `"${item.nombre}" volvió a estar activo.`);
    } catch (err) {
      notify.error("Error", err.message || "No se pudo restaurar");
    }
  };

  // Hard delete — permanent elimination from database
  const deleteDefinitivoInsumo = async (id, nombre, isPreparado) => {
    const confirmed = await notify.confirmDelete(
      "¿Eliminar definitivamente?",
      `Esta acción eliminará permanentemente "${nombre}" y no se podrá recuperar.`
    );
    if (!confirmed) return;

    try {
      if (isPreparado) {
        await insumosService.hardDeletePreparado(id);
      } else {
        await insumosService.hardDeleteInsumo(id);
      }

      await fetchPapelera();

      addTraceabilityEvent(
        "Eliminado permanente",
        nombre,
        `Se eliminó permanentemente ${isPreparado ? "el preparado" : "el insumo"}: ${nombre}`
      );

      notify.success("Eliminado permanente", `"${nombre}" fue eliminado por completo.`);
    } catch (err) {
      notify.error("Error", err.message || "No se pudo eliminar permanentemente");
    }
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
    refetchPapelera: fetchPapelera,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    deletePreparado,
    restoreInsumo,
    deleteDefinitivoInsumo,
    clearEventos,
    resetUnreadCount
  };
}
