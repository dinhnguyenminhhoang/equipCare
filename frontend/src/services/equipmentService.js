import instance from "../config/instance";

export const getEquipments = async (params = {}) => {
  const response = await instance.get("/equipment", { params });
  return response;
};

export const getEquipmentById = async (id) => {
  const response = await instance.get(`/equipment/${id}`);
  return response.data;
};

export const createEquipment = async (data) => {
  const response = await instance.post("/equipment", data);
  return response.data;
};

export const updateEquipment = async (id, data) => {
  const response = await instance.put(`/equipment/${id}`, data);
  return response.data;
};

export const deleteEquipment = async (id) => {
  const response = await instance.delete(`/equipment/${id}`);
  return response.data;
};

export const updateOperatingHours = async (id, operatingHours) => {
  const response = await instance.patch(`/equipment/${id}/operating-hours`, {
    operatingHours,
  });
  return response.data;
};

export const getEquipmentsDueForMaintenance = async (params = {}) => {
  const response = await instance.get("/equipment/due-maintenance", {
    params,
  });
  return response;
};

export const getEquipmentStatistics = async () => {
  const response = await instance.get("/equipment/statistics");
  return response.data;
};

export const getMaintenanceHistory = async (id, params = {}) => {
  const response = await instance.get(`/equipment/${id}/maintenance-history`, {
    params,
  });
  return response;
};

export const getRepairHistory = async (id, params = {}) => {
  const response = await instance.get(`/equipment/${id}/repair-history`, {
    params,
  });
  return response;
};
