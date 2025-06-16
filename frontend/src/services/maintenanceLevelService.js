import instance from "../config/instance";

export const getMaintenanceLevels = async (params = {}) => {
  const response = await instance.get("/maintenance-levels", { params });
  return response;
};

export const getMaintenanceLevelById = async (id) => {
  const response = await instance.get(`/maintenance-levels/${id}`);
  return response.data;
};

export const createMaintenanceLevel = async (data) => {
  const response = await instance.post("/maintenance-levels", data);
  return response.data;
};

export const updateMaintenanceLevel = async (id, data) => {
  const response = await instance.put(`/maintenance-levels/${id}`, data);
  return response.data;
};

export const deleteMaintenanceLevel = async (id) => {
  const response = await instance.delete(`/maintenance-levels/${id}`);
  return response.data;
};
