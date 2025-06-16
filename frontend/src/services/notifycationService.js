import instance from "../config/instance";

// Lấy danh sách thông báo
export const getNotifications = async (params = {}) => {
  const response = await instance.get("/notifications", { params });
  return response;
};

// Lấy thông báo theo ID
export const getNotificationById = async (id) => {
  const response = await instance.get(`/notifications/${id}`);
  return response.data;
};

// Đánh dấu thông báo đã đọc
export const markAsRead = async (id) => {
  const response = await instance.patch(`/notifications/${id}/read`);
  return response.data;
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllAsRead = async () => {
  const response = await instance.patch("/notifications/read-all");
  return response.data;
};

// Xóa thông báo
export const deleteNotification = async (id) => {
  const response = await instance.delete(`/notifications/${id}`);
  return response.data;
};

// Lấy số lượng thông báo chưa đọc
export const getUnreadCount = async () => {
  const response = await instance.get("/notifications/unread-count");
  return response.data;
};
