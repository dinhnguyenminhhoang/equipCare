import instance from "../config/instance";

// Lấy danh sách người dùng (Admin only)
export const getUsers = async (params = {}) => {
  const response = await instance.get("/users", { params });
  return response;
};

// Lấy thông tin người dùng theo ID (Admin only)
export const getUserById = async (id) => {
  const response = await instance.get(`/users/${id}`);
  return response.data;
};

// Tạo người dùng mới (Admin only)
export const createUser = async (data) => {
  const response = await instance.post("/users", data);
  return response.data;
};

// Cập nhật thông tin người dùng (Admin only)
export const updateUser = async (id, data) => {
  const response = await instance.put(`/users/${id}`, data);
  return response.data;
};

// Xóa người dùng (Admin only)
export const deleteUser = async (id) => {
  const response = await instance.delete(`/users/${id}`);
  return response.data;
};

// Bật/tắt trạng thái người dùng (Admin only)
export const toggleUserStatus = async (id) => {
  const response = await instance.patch(`/users/${id}/toggle-status`);
  return response.data;
};

// Lấy thông tin profile cá nhân
export const getProfile = async () => {
  const response = await instance.get("/users/profile/me");
  return response.data;
};

// Cập nhật profile cá nhân
export const updateProfile = async (data) => {
  const response = await instance.put("/users/profile/me", data);
  return response.data;
};

// Đổi mật khẩu
export const changePassword = async (data) => {
  const response = await instance.put("/users/profile/change-password", data);
  return response.data;
};

// Thống kê người dùng (Admin only)
export const getUserStatistics = async () => {
  const response = await instance.get("/users/statistics");
  return response.data;
};

// Reset mật khẩu người dùng (Admin only)
export const resetUserPassword = async (id, data) => {
  const response = await instance.post(`/users/${id}/reset-password`, data);
  return response.data;
};
