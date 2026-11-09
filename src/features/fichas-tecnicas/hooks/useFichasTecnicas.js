import { useState, useEffect, useCallback, useMemo } from "react";
import { fichasTecnicasService } from "../servicios/fichasTecnicasService";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { matchesSmartSearch, formatStatusTokens } from "@/shared/utils/searchUtils";

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

    return fichas.filter((f) => {
      const detallesText = Array.isArray(f.detalles || f.insumos)
        ? (f.detalles || f.insumos).map(d => d.nombreInsumo || d.insumo?.nombre || d.nombre || "").join(" ")
        : "";

      const hasCat = Boolean((f.categoria || f.categoriaNombre) && String(f.categoria || f.categoriaNombre).trim());
      const catText = hasCat ? `${f.categoria || ""} ${f.categoriaNombre || ""}` : "sin_categoria sin categoria";
      const hasDesc = Boolean(f.descripcion && String(f.descripcion).trim());
      const descText = hasDesc ? f.descripcion : "sin_descripcion sin descripcion";

      return matchesSmartSearch(
        [
          f.nombre,
          f.productoNombre,
          f.insumoNombre,
          f.idFichaTecnica,
          f.id,
          f.idProducto,
          f.idInsumo,
          `#${f.idFichaTecnica || f.id || f.idProducto || f.idInsumo}`,
          f.tipo || (f.idProducto ? "PRODUCTO" : "INSUMO"),
          f.categoria,
          f.categoriaNombre,
          catText,
          descText,
          f.rendimiento,
          String(f.rendimiento ?? ""),
          `${f.rendimiento ?? ""} porciones`,
          f.tiempoPreparacion,
          String(f.tiempoPreparacion ?? ""),
          `${f.tiempoPreparacion || ""} min minutos`,
          `v${f.versionActual || 1}`,
          `version ${f.versionActual || 1}`,
          f.vidaUtil,
          formatStatusTokens(f.estado || (f.vigente !== false ? "Vigente" : "Histórica")),
          detallesText
        ],
        searchTerm
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
