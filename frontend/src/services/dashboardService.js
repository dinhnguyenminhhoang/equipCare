import instance from "../config/instance";

export const getDashboardOverview = async () => {
  const response = await instance.get("/overview");
  return response.data;
};

export const getMaintenanceSummary = async (params = {}) => {
  const response = await instance.get("/maintenance-summary", {
    params,
  });
  return response.data;
};

export const getRepairSummary = async (params = {}) => {
  const response = await instance.get("/repair-summary", { params });
  return response.data;
};

export const getEquipmentStatus = async () => {
  const response = await instance.get("/equipment-status");
  return response.data;
};

export const getMaterialAlerts = async () => {
  const response = await instance.get("/material-alerts");
  return response.data;
};

export const getRecentActivities = async (params = {}) => {
  const response = await instance.get("/recent-activities", { params });
  return response.data;
};

export const getDashboardData = async () => {
  try {
    const [overview, activities, alerts] = await Promise.all([
      getDashboardOverview(),
      getRecentActivities({ limit: 10 }),
      getMaterialAlerts(),
    ]);

    return {
      ...overview,
      recentActivities: activities,
      materialAlerts: alerts,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
