import instance from "../config/instance";

// Lấy danh sách vật tư
export const getMaterials = async (params = {}) => {
  const response = await instance.get("/materials", { params });
  return response;
};

// Lấy vật tư theo ID
export const getMaterialById = async (id) => {
  const response = await instance.get(`/materials/${id}`);
  return response.data;
};

// Tạo vật tư mới (Admin/Manager only)
export const createMaterial = async (data) => {
  const response = await instance.post("/materials", data);
  return response.data;
};

// Cập nhật vật tư (Admin/Manager only)
export const updateMaterial = async (id, data) => {
  const response = await instance.put(`/materials/${id}`, data);
  return response.data;
};

// Xóa vật tư (Admin/Manager only)
export const deleteMaterial = async (id) => {
  const response = await instance.delete(`/materials/${id}`);
  return response.data;
};

// Cập nhật tồn kho
export const updateStock = async (id, data) => {
  const response = await instance.patch(`/materials/${id}/stock`, data);
  return response.data;
};

// Lấy vật tư sắp hết hàng
export const getLowStockMaterials = async (params = {}) => {
  const response = await instance.get("/materials/low-stock", { params });
  return response;
};

// Lấy vật tư sắp hết hạn
export const getExpiringMaterials = async (params = {}) => {
  const response = await instance.get("/materials/expiring", { params });
  return response;
};

// Thống kê vật tư
export const getMaterialStatistics = async () => {
  const response = await instance.get("/materials/statistics");
  return response.data;
};

// Lấy lịch sử xuất nhập theo vật tư
export const getMaterialTransactions = async (id, params = {}) => {
  const response = await instance.get(`/materials/${id}/transactions`, {
    params,
  });
  return response;
};
