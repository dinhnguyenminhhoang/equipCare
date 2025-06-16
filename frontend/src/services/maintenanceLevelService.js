import instance from "../config/instance";

export const getMaintenanceLevels = async (params = {}) => {
  const response = await instance.get("/v1/api/maintenance-levels", { params });
  return response;
};

export const getMaintenanceLevelById = async (id) => {
  const response = await instance.get(`/v1/api/maintenance-levels/${id}`);
  return response.data;
};

export const createMaintenanceLevel = async (data) => {
  const response = await instance.post("/v1/api/maintenance-levels", data);
  return response.data;
};

export const updateMaintenanceLevel = async (id, data) => {
  const response = await instance.put(`/v1/api/maintenance-levels/${id}`, data);
  return response.data;
};

export const deleteMaintenanceLevel = async (id) => {
  const response = await instance.delete(`/v1/api/maintenance-levels/${id}`);
  return response.data;
};

// src/services/reportService.js
import instance from "../config/instance";

export const getMaintenanceReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/maintenance", {
    params,
  });
  return response.data;
};

export const getRepairReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/repair", { params });
  return response.data;
};

export const getEquipmentReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/equipment", { params });
  return response.data;
};

export const getMaterialReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/material", { params });
  return response.data;
};

export const getCostAnalysisReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/cost-analysis", {
    params,
  });
  return response.data;
};

export const getDowntimeReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/downtime", { params });
  return response.data;
};

export const getEfficiencyReport = async (params = {}) => {
  const response = await instance.get("/v1/api/reports/efficiency", { params });
  return response.data;
};

export const exportReportToPDF = async (reportType, params = {}) => {
  const response = await instance.get(`/v1/api/reports/${reportType}/export`, {
    params,
    responseType: "blob",
  });
  return response;
};

export const exportReportToExcel = async (reportType, params = {}) => {
  const response = await instance.get(`/v1/api/reports/${reportType}/excel`, {
    params,
    responseType: "blob",
  });
  return response;
};
