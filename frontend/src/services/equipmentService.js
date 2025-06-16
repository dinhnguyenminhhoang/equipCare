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

// src/services/maintenanceTicketService.js
import instance from "../config/instance";

export const getMaintenanceTickets = async (params = {}) => {
  const response = await instance.get("/maintenance-tickets", {
    params,
  });
  return response;
};

export const getMaintenanceTicketById = async (id) => {
  const response = await instance.get(`/maintenance-tickets/${id}`);
  return response.data;
};

export const createMaintenanceTicket = async (data) => {
  const response = await instance.post("/maintenance-tickets", data);
  return response.data;
};

export const updateMaintenanceTicket = async (id, data) => {
  const response = await instance.put(`/maintenance-tickets/${id}`, data);
  return response.data;
};

export const deleteMaintenanceTicket = async (id) => {
  const response = await instance.delete(`/maintenance-tickets/${id}`);
  return response.data;
};

export const approveMaintenanceTicket = async (id) => {
  const response = await instance.patch(`/maintenance-tickets/${id}/approve`);
  return response.data;
};

export const startMaintenance = async (id, data) => {
  const response = await instance.patch(
    `/maintenance-tickets/${id}/start`,
    data
  );
  return response.data;
};

export const completeMaintenance = async (id, data) => {
  const response = await instance.patch(
    `/maintenance-tickets/${id}/complete`,
    data
  );
  return response.data;
};

export const updateMaintenanceTask = async (ticketId, taskId, data) => {
  const response = await instance.patch(
    `/maintenance-tickets/${ticketId}/tasks/${taskId}`,
    data
  );
  return response.data;
};

export const addMaterialToMaintenance = async (id, data) => {
  const response = await instance.post(
    `/maintenance-tickets/${id}/materials`,
    data
  );
  return response.data;
};

export const getMaintenanceStatistics = async (params = {}) => {
  const response = await instance.get("/maintenance-tickets/statistics", {
    params,
  });
  return response.data;
};

export const exportMaintenanceReport = async (params = {}) => {
  const response = await instance.get("/maintenance-tickets/export", {
    params,
  });
  return response.data;
};
