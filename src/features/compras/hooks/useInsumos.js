import { useState, useEffect, useCallback } from "react";
import { insumosService } from "../servicios/insumosService";
import { useNotifications } from "@/shared/hooks/useNotifications";

const INITIAL_EVENTOS = [
  {
    id: 1,
    tipo: "Creado",
    nombre: "Carnes",
    descripcion: "Se creó una nueva categoría en el inventario: Carnes",
    fecha: "23/07/2026 06:35"
  },
  {
    id: 2,
    tipo: "Editado",
    nombre: "Cereales",
    descripcion: "Se actualizaron los datos de la categoría: Cereales",
    fecha: "23/07/2026 06:35"
  },
  {
    id: 3,
    tipo: "Eliminado",
    nombre: "Carnes",
    descripcion: "Se eliminó del inventario la categoría: Carnes",
    fecha: "23/07/2026 06:32"
  }
];

export function useInsumos() {
  const notify = useNotifications();
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
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
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
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
      setCategorias(categoriasData || []);
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
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

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
