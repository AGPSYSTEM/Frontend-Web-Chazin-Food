import { useState, useEffect, useCallback, useMemo } from "react";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useFichasTecnicas() {
  const notify = useNotifications();
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFichas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fichasTecnicasService.getFichas();
      setFichas(data || []);
    } catch (err) {
      console.error(err);
      notify.error("Error", err.message || "Error al cargar las fichas técnicas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  // Buscador generalizado por todas las columnas y atributos de la ficha técnica
  const filteredFichas = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) return fichas;
    const term = searchTerm.trim().toLowerCase();

    return fichas.filter((f) => {
      const nombre = (f.nombre || f.productoNombre || f.insumoNombre || "").toLowerCase();
      const id = String(f.idFichaTecnica || f.id || f.idProducto || f.idInsumo || "").toLowerCase();
      const tipo = String(f.tipo || (f.idProducto ? "PRODUCTO" : "INSUMO")).toLowerCase();
      const categoria = (f.categoria || f.categoriaNombre || "").toLowerCase();
      const rendimiento = String(f.rendimiento || "").toLowerCase();
      const tiempo = `${f.tiempoPreparacion || ""} min`.toLowerCase();
      const version = `v${f.versionActual || 1} version ${f.versionActual || 1}`.toLowerCase();
      const vidaUtil = String(f.vidaUtil || "").toLowerCase();
      const estado = String(f.estado || (f.vigente !== false ? "Vigente" : "Histórica")).toLowerCase();

      // Buscar también por ingredientes incluidos en los detalles
      const detallesText = Array.isArray(f.detalles || f.insumos)
        ? (f.detalles || f.insumos).map(d => d.nombreInsumo || d.insumo?.nombre || d.nombre || "").join(" ").toLowerCase()
        : "";

      return (
        nombre.includes(term) ||
        id.includes(term) ||
        tipo.includes(term) ||
        categoria.includes(term) ||
        rendimiento.includes(term) ||
        tiempo.includes(term) ||
        version.includes(term) ||
        vidaUtil.includes(term) ||
        estado.includes(term) ||
        detallesText.includes(term)
      );
    });
  }, [fichas, searchTerm]);

  return {
    fichas,
    filteredFichas,
    loading,
    searchTerm,
    setSearchTerm,
    refetch: fetchFichas
  };
}
