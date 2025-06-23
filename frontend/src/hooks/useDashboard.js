// frontend/src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from "react";
import {
  getDashboardData,
  getDashboardCharts,
  getFinancialDashboard,
  getEquipmentProblems,
  getPerformanceMetrics,
  getMaintenanceSummary,
  getRepairSummary,
  getTrends,
} from "../services/dashboardService";

export const useDashboard = (initialPeriod = "month") => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [equipmentProblems, setEquipmentProblems] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    }
  }, []);

  const fetchChartData = useCallback(async (period) => {
    try {
      const data = await getDashboardCharts(period);
      setChartData(data);
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  }, []);

  const fetchFinancialData = useCallback(async (period) => {
    try {
      const data = await getFinancialDashboard({ period });
      setFinancialData(data);
    } catch (err) {
      console.error("Error fetching financial data:", err);
    }
  }, []);

  const fetchEquipmentProblems = useCallback(async (period) => {
    try {
      const data = await getEquipmentProblems({ period, limit: 5 });
      setEquipmentProblems(data);
    } catch (err) {
      console.error("Error fetching equipment problems:", err);
    }
  }, []);

  const fetchPerformanceMetrics = useCallback(async (period) => {
    try {
      const data = await getPerformanceMetrics({ period });
      setPerformanceMetrics(data);
    } catch (err) {
      console.error("Error fetching performance metrics:", err);
    }
  }, []);

  const fetchAllData = useCallback(
    async (period) => {
      try {
        setLoading(true);
        setError(null);

        await Promise.all([
          fetchDashboardData(),
          fetchChartData(period),
          fetchFinancialData(period),
          fetchEquipmentProblems(period),
          fetchPerformanceMetrics(period),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [
      fetchDashboardData,
      fetchChartData,
      fetchFinancialData,
      fetchEquipmentProblems,
      fetchPerformanceMetrics,
    ]
  );

  const refreshData = useCallback(() => {
    fetchAllData(selectedPeriod);
  }, [fetchAllData, selectedPeriod]);

  const changePeriod = useCallback((newPeriod) => {
    setSelectedPeriod(newPeriod);
  }, []);

  useEffect(() => {
    fetchAllData(selectedPeriod);
  }, [selectedPeriod, fetchAllData]);

  return {
    // Data
    dashboardData,
    chartData,
    financialData,
    equipmentProblems,
    performanceMetrics,

    // State
    loading,
    error,
    selectedPeriod,

    // Actions
    refreshData,
    changePeriod,
    setSelectedPeriod,
  };
};

export const useMaintenanceSummary = (period = "month") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getMaintenanceSummary({ period });
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};

export const useRepairSummary = (period = "month") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getRepairSummary({ period });
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};

export const useTrends = (period = "6months") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getTrends({ period });
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return { data, loading, error };
};
