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
      return saved ? JSON.parse(saved) : 1;
    } catch {
      return 1;
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
      const [insumosData, categoriasData] = await Promise.all([
        insumosService.getInsumos(),
        insumosService.getCategorias()
      ]);

      // Ensure mock sample data contains at least one prepared insumo if empty
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
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCategoria = filterCategoria === "Todas" || item.categoria === filterCategoria;
    const matchEstado = filterEstado === "Todos" || item.estado === filterEstado;

    return matchSearch && matchCategoria && matchEstado;
  });

  const createInsumo = async (data) => {
    try {
      const isPrep = data.tipo === "Preparado";
      const newItem = { ...data, id: Date.now() };

      setInsumos((prev) => [newItem, ...prev]);

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
      setInsumos((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      );

      const isPrep = data.tipo === "Preparado";
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
      const target = insumos.find((i) => i.id === id);
      if (!target) return false;

      // Remove from active insumos
      setInsumos((prev) => prev.filter((i) => i.id !== id));

      // Move to appropriate trash list
      if (target.tipo === "Preparado") {
        setPapeleraPreparados((prev) => [target, ...prev]);
      } else {
        setPapeleraInsumos((prev) => [target, ...prev]);
      }

      addTraceabilityEvent(
        "Eliminado",
        nombre,
        target.tipo === "Preparado"
          ? `Se movió a la papelera el insumo preparado: ${nombre}`
          : `Se eliminó del inventario el insumo: ${nombre}`
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
