import instance from "../config/instance";

export const getSettings = async (category = "") => {
  const response = await instance.get("/v1/api/settings", {
    params: category ? { category } : {},
  });
  return response.data;
};

export const updateSetting = async (key, value) => {
  const response = await instance.put(`/v1/api/settings/${key}`, { value });
  return response.data;
};

export const updateMultipleSettings = async (settings) => {
  const response = await instance.put("/v1/api/settings/bulk", { settings });
  return response.data;
};

export const resetSettings = async (category = "") => {
  const response = await instance.post("/v1/api/settings/reset", { category });
  return response.data;
};

export const getSystemInfo = async () => {
  const response = await instance.get("/v1/api/settings/system-info");
  return response.data;
};

// src/services/auditLogService.js
import instance from "../config/instance";

export const getAuditLogs = async (params = {}) => {
  const response = await instance.get("/v1/api/audit-logs", { params });
  return response;
};

export const getAuditLogById = async (id) => {
  const response = await instance.get(`/v1/api/audit-logs/${id}`);
  return response.data;
};

export const exportAuditLogs = async (params = {}) => {
  const response = await instance.get("/v1/api/audit-logs/export", {
    params,
    responseType: "blob",
  });
  return response;
};
