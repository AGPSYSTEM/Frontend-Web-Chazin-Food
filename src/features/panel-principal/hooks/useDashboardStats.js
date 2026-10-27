import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../servicios/dashboardService";

export function useDashboardStats() {
  const [periodo, setPeriodo] = useState("este_mes");
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalVentasGlobal: 0,
    ventasTotal: 0,
    ventasMesActual: 0,
    ventasVariacion: 0,
    pedidosTotal: 0,
    pedidosVariacion: 0,
    frecuenciaVentas: 0,
    clientesTotal: 0,
    clientesActivos: 0,
    clientesVariacion: 0,
    productosTotal: 0,
    insumosBajoStock: 0,
    divisa: "COP"
  });
  const [ventasChart, setVentasChart] = useState([]);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [alertasStock, setAlertasStock] = useState([]);
  const [ventasRecientes, setVentasRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const params = { periodo, year };
      const [statsRes, chartRes, popRes, alertasRes, recientesRes] = await Promise.all([
        dashboardService.getStats(params).catch(() => null),
        dashboardService.getVentasChart(params).catch(() => []),
        dashboardService.getProductosPopulares(params).catch(() => []),
        dashboardService.getAlertasStock(params).catch(() => []),
        dashboardService.getVentasRecientes(params).catch(() => [])
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
  }, [periodo, year]);

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
    periodo,
    setPeriodo,
    year,
    setYear,
    refetch: fetchDashboardData
  };
}
