import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../servicios/dashboardService";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    ventasTotal: 0,
    ventasVariacion: 0,
    pedidosTotal: 0,
    pedidosVariacion: 0,
    frecuenciaVentas: 0,
    clientesActivos: 0,
    clientesVariacion: 0,
    productosTotal: 0,
    insumosBajoStock: 0
  });
  const [ventasChart, setVentasChart] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [statsRes, chartRes, popRes, alertasRes, recientesRes] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        dashboardService.getVentasChart().catch(() => []),
        dashboardService.getProductosPopulares().catch(() => []),
        dashboardService.getAlertasStock().catch(() => []),
        dashboardService.getVentasRecientes().catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      if (Array.isArray(chartRes)) setVentasChart(chartRes);
      if (Array.isArray(popRes)) setProductosPopulares(popRes);
      if (Array.isArray(alertasRes)) setAlertasStock(alertasRes);
      if (Array.isArray(recientesRes)) setVentasRecientes(recientesRes);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    stats,
    ventasChart,
    productosPopulares,
    alertasStock,
    ventasRecientes,
    loading,
    refetch: fetchDashboardData
  };
}
