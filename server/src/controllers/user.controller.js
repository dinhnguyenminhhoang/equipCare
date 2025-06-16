"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const UserService = require("../services/user.service");

class UserController {
  // Lấy danh sách người dùng (Admin only)
  getUsers = async (req, res, next) => {
    new SuccessResponse({
      message: "Get users successfully!",
      data: await UserService.getUsers(req.query),
    }).send(res);
  };

  // Lấy thông tin người dùng theo ID (Admin only)
  getUserById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get user successfully!",
      data: await UserService.getUserById(req.params.id),
    }).send(res);
  };

  // Cập nhật thông tin người dùng (Admin only)
  updateUser = async (req, res, next) => {
    new SuccessResponse({
      message: "User updated successfully!",
      data: await UserService.updateUser(req.params.id, req.body),
    }).send(res);
  };

  // Xóa người dùng (Admin only)
  deleteUser = async (req, res, next) => {
    new SuccessResponse({
      message: "User deleted successfully!",
      data: await UserService.deleteUser(req.params.id),
    }).send(res);
  };

  // Bật/tắt trạng thái người dùng (Admin only)
  toggleUserStatus = async (req, res, next) => {
    new SuccessResponse({
      message: "User status updated successfully!",
      data: await UserService.toggleUserStatus(req.params.id),
    }).send(res);
  };

  // Lấy thông tin profile cá nhân
  getProfile = async (req, res, next) => {
    new SuccessResponse({
      message: "Get profile successfully!",
      data: await UserService.getProfile(req.user.userId),
    }).send(res);
  };

  // Cập nhật profile cá nhân
  updateProfile = async (req, res, next) => {
    new SuccessResponse({
      message: "Profile updated successfully!",
      data: await UserService.updateProfile(req.user.userId, req.body),
    }).send(res);
  };

  // Đổi mật khẩu
  changePassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Password changed successfully!",
      data: await UserService.changePassword(req.user.userId, req.body),
    }).send(res);
  };

  // Tạo người dùng mới (Admin only)
  createUser = async (req, res, next) => {
    new CREATED({
      message: "User created successfully!",
      data: await UserService.createUser(req.body),
    }).send(res);
  };

  // Thống kê người dùng (Admin only)
  getUserStatistics = async (req, res, next) => {
    new SuccessResponse({
      message: "Get user statistics successfully!",
      data: await UserService.getUserStatistics(),
    }).send(res);
  };

  // Reset mật khẩu người dùng (Admin only)
  resetUserPassword = async (req, res, next) => {
    new SuccessResponse({
      message: "Password reset successfully!",
      data: await UserService.resetUserPassword(req.params.id, req.body),
    }).send(res);
  };
}

module.exports = new UserController();
