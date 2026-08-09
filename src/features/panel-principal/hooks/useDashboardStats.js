import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../servicios/dashboardService";

export function useDashboardStats() {
  const [stats, setStats] = useState({
    ventasTotal: 0,
    ventasVariacion: 0,
    pedidosTotal: 0,
    pedidosVariacion: 0,
    clientesActivos: 0,
    clientesVariacion: 0,
    productosTotal: 0,
    insumosBajoStock: 0
  });
  const [ventasChart, setVentasChart] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, chartRes, popRes, alertasRes] = await Promise.all([
        dashboardService.getStats().catch(() => null),
        dashboardService.getVentasChart().catch(() => []),
        dashboardService.getProductosPopulares().catch(() => []),
        dashboardService.getAlertasStock().catch(() => [])
      ]);

      if (statsRes) setStats(statsRes);
      if (Array.isArray(chartRes)) setVentasChart(chartRes);
      if (Array.isArray(popRes)) setProductosPopulares(popRes);
      if (Array.isArray(alertasRes)) setAlertasStock(alertasRes);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    ventasChart,
    productosPopulares,
    alertasStock,
    loading,
    refetch: fetchDashboardData
  };
}
