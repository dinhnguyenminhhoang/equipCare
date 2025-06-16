"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const { EquipmentService } = require("../services/equipment.service");

class EquipmentController {
  // Tạo thiết bị mới
  createEquipment = async (req, res, next) => {
    new CREATED({
      message: "Equipment created successfully!",
      data: await EquipmentService.createEquipment(req.body, req.user.userId),
    }).send(res);
  };

  // Lấy danh sách thiết bị với phân trang và tìm kiếm
  getEquipments = async (req, res, next) => {
    console.log("Query params: running");
    new SuccessResponse({
      message: "Get equipments successfully!",
      data: await EquipmentService.getEquipments(req.query),
    }).send(res);
  };

  // Lấy thiết bị theo ID
  getEquipmentById = async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipment successfully!",
      data: await EquipmentService.getEquipmentById(req.params.id),
    }).send(res);
  };

  // Cập nhật thiết bị
  updateEquipment = async (req, res, next) => {
    new SuccessResponse({
      message: "Equipment updated successfully!",
      data: await EquipmentService.updateEquipment(req.params.id, req.body),
    }).send(res);
  };

  // Xóa thiết bị (soft delete)
  deleteEquipment = async (req, res, next) => {
    new SuccessResponse({
      message: "Equipment deleted successfully!",
      data: await EquipmentService.deleteEquipment(req.params.id),
    }).send(res);
  };

  // Cập nhật số giờ hoạt động
  updateOperatingHours = async (req, res, next) => {
    new SuccessResponse({
      message: "Operating hours updated successfully!",
      data: await EquipmentService.updateOperatingHours(
        req.params.id,
        req.body.operatingHours
      ),
    }).send(res);
  };

  // Lấy thiết bị cần bảo dưỡng
  getEquipmentsDueForMaintenance = async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipments due for maintenance successfully!",
      data: await EquipmentService.getEquipmentsDueForMaintenance(req.query),
    }).send(res);
  };

  // Thống kê thiết bị
  getEquipmentStatistics = async (req, res, next) => {
    new SuccessResponse({
      message: "Get equipment statistics successfully!",
      data: await EquipmentService.getEquipmentStatistics(),
    }).send(res);
  };

  // Lấy lịch sử bảo dưỡng của thiết bị
  getMaintenanceHistory = async (req, res, next) => {
    new SuccessResponse({
      message: "Get maintenance history successfully!",
      data: await EquipmentService.getMaintenanceHistory(
        req.params.id,
        req.query
      ),
    }).send(res);
  };

  // Lấy lịch sử sửa chữa của thiết bị
  getRepairHistory = async (req, res, next) => {
    new SuccessResponse({
      message: "Get repair history successfully!",
      data: await EquipmentService.getRepairHistory(req.params.id, req.query),
    }).send(res);
  };
}

module.exports = new EquipmentController();
