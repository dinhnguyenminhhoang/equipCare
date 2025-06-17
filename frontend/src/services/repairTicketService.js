import instance from "../config/instance";

// Lấy danh sách phiếu sửa chữa
export const getRepairTickets = async (params = {}) => {
  const response = await instance.get("/repair-tickets", { params });
  return response;
};

// Lấy phiếu sửa chữa theo ID
export const getRepairTicketById = async (id) => {
  const response = await instance.get(`/repair-tickets/${id}`);
  return response.data;
};

// Tạo phiếu sửa chữa mới
export const createRepairTicket = async (data) => {
  const response = await instance.post("/repair-tickets", data);
  return response.data;
};

// Cập nhật phiếu sửa chữa
export const updateRepairTicket = async (id, data) => {
  const response = await instance.put(`/repair-tickets/${id}`, data);
  return response.data;
};

// Xóa phiếu sửa chữa
export const deleteRepairTicket = async (id) => {
  const response = await instance.delete(`/repair-tickets/${id}`);
  return response.data;
};

// Phê duyệt phiếu sửa chữa (Admin/Manager only)
export const approveRepairTicket = async (id) => {
  const response = await instance.patch(`/repair-tickets/${id}/approve`);
  return response.data;
};

// Chẩn đoán sự cố
export const diagnoseIssue = async (id, data) => {
  const response = await instance.patch(`/repair-tickets/${id}/diagnose`, data);
  return response.data;
};

// Bắt đầu sửa chữa
export const startRepair = async (id, data) => {
  const response = await instance.patch(`/repair-tickets/${id}/start`, data);
  return response.data;
};

// Hoàn thành sửa chữa
export const completeRepair = async (id, data) => {
  const response = await instance.patch(`/repair-tickets/${id}/complete`, data);
  return response.data;
};

// Cập nhật task trong phiếu sửa chữa
export const updateRepairTask = async (ticketId, taskId, data) => {
  const response = await instance.patch(
    `/repair-tickets/${ticketId}/tasks/${taskId}`,
    data
  );
  return response.data;
};

// Thêm vật tư vào phiếu sửa chữa
export const addMaterialToRepair = async (id, data) => {
  const response = await instance.post(`/repair-tickets/${id}/materials`, data);
  return response.data;
};

// Thêm dịch vụ bên ngoài
export const addExternalService = async (id, data) => {
  const response = await instance.post(
    `/repair-tickets/${id}/external-services`,
    data
  );
  return response.data;
};

// Thống kê phiếu sửa chữa
export const getRepairStatistics = async (params = {}) => {
  const response = await instance.get("/repair-tickets/statistics", {
    params,
  });
  return response.data;
};

// Xuất báo cáo sửa chữa
export const exportRepairReport = async (params = {}) => {
  const response = await instance.get("/repair-tickets/export", {
    params,
  });
  return response.data;
};

// Lấy phân tích nguyên nhân hỏng hóc
export const getFailureAnalysis = async (params = {}) => {
  const response = await instance.get("/repair-tickets/failure-analysis", {
    params,
  });
  return response.data;
};
