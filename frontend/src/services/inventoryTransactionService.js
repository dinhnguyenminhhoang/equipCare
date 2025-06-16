import instance from "../config/instance";

export const getInventoryTransactions = async (params = {}) => {
  const response = await instance.get("/v1/api/inventory-transactions", {
    params,
  });
  return response;
};

export const getInventoryTransactionById = async (id) => {
  const response = await instance.get(`/v1/api/inventory-transactions/${id}`);
  return response.data;
};

export const createInventoryTransaction = async (data) => {
  const response = await instance.post("/v1/api/inventory-transactions", data);
  return response.data;
};

export const reverseTransaction = async (id, reason) => {
  const response = await instance.post(
    `/v1/api/inventory-transactions/${id}/reverse`,
    {
      reason,
    }
  );
  return response.data;
};

export const getTransactionHistory = async (materialId, params = {}) => {
  const response = await instance.get(
    `/v1/api/inventory-transactions/material/${materialId}`,
    {
      params,
    }
  );
  return response;
};
