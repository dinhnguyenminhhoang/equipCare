import instance from "../config/instance";

// Lấy danh sách phiếu bảo dưỡng
export const getMaintenanceTickets = async (params = {}) => {
  const response = await instance.get("/maintenance-tickets", { params });
  return response;
};

// Lấy phiếu bảo dưỡng theo ID
export const getMaintenanceTicketById = async (id) => {
  const response = await instance.get(`/maintenance-tickets/${id}`);
  return response.data;
};

// Tạo phiếu bảo dưỡng mới
export const createMaintenanceTicket = async (data) => {
  const response = await instance.post("/maintenance-tickets", data);
  return response.data;
};

// Cập nhật phiếu bảo dưỡng
export const updateMaintenanceTicket = async (id, data) => {
  const response = await instance.put(`/maintenance-tickets/${id}`, data);
  return response.data;
};

// Xóa phiếu bảo dưỡng
export const deleteMaintenanceTicket = async (id) => {
  const response = await instance.delete(`/maintenance-tickets/${id}`);
  return response.data;
};

// Phê duyệt phiếu bảo dưỡng (Admin/Manager only)
export const approveMaintenanceTicket = async (id) => {
  const response = await instance.patch(`/maintenance-tickets/${id}/approve`);
  return response.data;
};

// Bắt đầu thực hiện bảo dưỡng
export const startMaintenance = async (id, data) => {
  const response = await instance.patch(
    `/maintenance-tickets/${id}/start`,
    data
  );
  return response.data;
};

// Hoàn thành bảo dưỡng
export const completeMaintenance = async (id, data) => {
  const response = await instance.patch(
    `/maintenance-tickets/${id}/complete`,
    data
  );
  return response.data;
};

// Cập nhật task trong phiếu bảo dưỡng
export const updateMaintenanceTask = async (ticketId, taskId, data) => {
  const response = await instance.patch(
    `/maintenance-tickets/${ticketId}/tasks/${taskId}`,
    data
  );
  return response.data;
};

// Thêm vật tư vào phiếu bảo dưỡng
export const addMaterialToMaintenance = async (id, data) => {
  const response = await instance.post(
    `/maintenance-tickets/${id}/materials`,
    data
  );
  return response.data;
};

// Thống kê phiếu bảo dưỡng
export const getMaintenanceStatistics = async (params = {}) => {
  const response = await instance.get("/maintenance-tickets/statistics", {
    params,
  });
  return response.data;
};

// Xuất báo cáo bảo dưỡng
export const exportMaintenanceReport = async (params = {}) => {
  const response = await instance.get("/maintenance-tickets/export", {
    params,
  });
  return response.data;
};
