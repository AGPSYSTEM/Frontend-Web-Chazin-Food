import { useState, useEffect, useCallback } from "react";
import { dashboardService } from "../servicios/dashboardService";
import { useNotifications } from "@/shared/hooks/useNotifications";

export function useDashboardStats() {
  const notify = useNotifications();
  const [stats, setStats] = useState({
    ventasTotal: 28400,
    pedidosTotal: 876,
    insumosBajoStock: 3,
    clientesTotal: 412
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      if (data) setStats(data);
    } catch (err) {
      console.log("Using fallback mock data for dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    stats,
    loading,
    refetch: fetchDashboardData
  };
}
