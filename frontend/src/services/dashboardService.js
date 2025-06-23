import instance from "../config/instance";

const getDashboardOverview = async () => {
  const response = await instance.get("/overview");
  return response.data;
};

const getMaintenanceSummary = async (params = {}) => {
  const response = await instance.get("/maintenance-summary", {
    params,
  });
  return response.data;
};

const getRepairSummary = async (params = {}) => {
  const response = await instance.get("/repair-summary", { params });
  return response.data;
};

const getEquipmentStatus = async () => {
  const response = await instance.get("/equipment-status");
  return response.data;
};

const getMaterialAlerts = async () => {
  const response = await instance.get("/material-alerts");
  return response.data;
};

const getRecentActivities = async (params = {}) => {
  const response = await instance.get("/recent-activities", { params });
  return response.data;
};

// Thêm các API mới từ backend
const getPerformanceMetrics = async (params = {}) => {
  const response = await instance.get("/performance-metrics", { params });
  return response.data;
};

const getFinancialReport = async (params = {}) => {
  const response = await instance.get("/financial-report", { params });
  return response.data;
};

const getTrends = async (params = {}) => {
  const response = await instance.get("/trends", { params });
  return response.data;
};

const getProblematicEquipments = async (params = {}) => {
  const response = await instance.get("/problematic-equipments", { params });
  return response.data;
};

// Hàm lấy dữ liệu cho các charts và reports
const getDashboardCharts = async (period = "month") => {
  try {
    const [trends, maintenanceSummary, repairSummary] = await Promise.all([
      getTrends({ period: "6months" }),
      getMaintenanceSummary({ period }),
      getRepairSummary({ period }),
    ]);

    return {
      trends,
      maintenanceSummary,
      repairSummary,
    };
  } catch (error) {
    console.error("Error fetching dashboard charts:", error);
    throw error;
  }
};

// Hàm lấy báo cáo tài chính
const getFinancialDashboard = async (params = {}) => {
  try {
    const [financialReport, costTrends] = await Promise.all([
      getFinancialReport(params),
      getTrends({ period: "12months" }),
    ]);

    return {
      financialReport,
      costTrends,
    };
  } catch (error) {
    console.error("Error fetching financial dashboard:", error);
    throw error;
  }
};

// Hàm lấy thiết bị có vấn đề
const getEquipmentProblems = async (params = {}) => {
  try {
    const [problematicEquipments, equipmentStatus] = await Promise.all([
      getProblematicEquipments(params),
      getEquipmentStatus(),
    ]);

    return {
      problematicEquipments,
      equipmentStatus,
    };
  } catch (error) {
    console.error("Error fetching equipment problems:", error);
    throw error;
  }
};
export {
  getDashboardCharts,
  getFinancialDashboard,
  getEquipmentProblems,
  getDashboardOverview,
  getMaintenanceSummary,
  getProblematicEquipments,
  getRepairSummary,
  getEquipmentStatus,
  getMaterialAlerts,
  getRecentActivities,
  getPerformanceMetrics,
  getFinancialReport,
  getTrends,
};
