import { useState, useEffect, useCallback } from "react";
import { fichasTecnicasService } from "../services/fichasTecnicasService";
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
  }, [notify]);

  useEffect(() => {
    fetchFichas();
  }, [fetchFichas]);

  const filteredFichas = fichas.filter((f) => {
    return (
      searchTerm === "" ||
      f.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.productoNombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return {
    fichas,
    filteredFichas,
    loading,
    searchTerm,
    setSearchTerm,
    refetch: fetchFichas
  };
}
