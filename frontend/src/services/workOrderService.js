import instance from "../config/instance";

export const getWorkOrders = async (params = {}) => {
  const response = await instance.get("/v1/api/work-orders", { params });
  return response;
};

export const getWorkOrderById = async (id) => {
  const response = await instance.get(`/v1/api/work-orders/${id}`);
  return response.data;
};

export const createWorkOrder = async (data) => {
  const response = await instance.post("/v1/api/work-orders", data);
  return response.data;
};

export const updateWorkOrder = async (id, data) => {
  const response = await instance.put(`/v1/api/work-orders/${id}`, data);
  return response.data;
};

export const deleteWorkOrder = async (id) => {
  const response = await instance.delete(`/v1/api/work-orders/${id}`);
  return response.data;
};

export const approveWorkOrder = async (id) => {
  const response = await instance.patch(`/v1/api/work-orders/${id}/approve`);
  return response.data;
};
